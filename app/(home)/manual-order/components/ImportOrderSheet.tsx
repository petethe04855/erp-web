"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { useTheme } from "@/lib/design/ThemeContext";
import { formatBaht } from "@/lib/mockData";

const CHANNELS = ["LINE", "Instagram", "Facebook", "Offline", "Other"];
const TEMPLATE_CSV =
  "customer,phone,channel,amount,notes\nคุณตัวอย่าง,081-000-0000,LINE,350,หมายเหตุ";

interface ImportRow {
  customer: string;
  phone: string;
  channel: string;
  amount: string;
  notes: string;
}

interface ImportOrderSheetProps {
  open: boolean;
  onClose: () => void;
  onImport: (rows: ImportRow[]) => void;
}

export function ImportOrderSheet({
  open,
  onClose,
  onImport,
}: ImportOrderSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importError, setImportError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function parseCSV(text: string): ImportRow[] {
    const lines = text.trim().split("\n");
    if (lines.length < 2) throw new Error("ไฟล์ CSV ว่างเปล่า");
    const headers = lines[0].split(",").map((h) => h.trim());
    const required = ["customer", "phone", "channel", "amount"];
    const missing = required.filter((r) => !headers.includes(r));
    if (missing.length) throw new Error(`ขาดคอลัมน์: ${missing.join(", ")}`);
    return lines
      .slice(1)
      .filter((l) => l.trim())
      .map((line) => {
        const vals = line.split(",").map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
          row[h] = vals[i] ?? "";
        });
        return {
          customer: row.customer,
          phone: row.phone,
          channel: row.channel,
          amount: row.amount,
          notes: row.notes ?? "",
        };
      });
  }

  async function handleFile(file: File) {
    setImportError("");
    setImportRows([]);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "csv") {
        const text = await file.text();
        setImportRows(parseCSV(text));
      } else if (ext === "xlsx" || ext === "xls") {
        throw new Error(
          "ตอนนี้รองรับ CSV เท่านั้น กรุณา export Excel เป็น .csv ก่อนนำเข้า"
        );
      } else {
        throw new Error("รองรับเฉพาะไฟล์ .csv");
      }
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function confirmImport() {
    if (!importRows.length) return;
    onImport(importRows);
    setImportRows([]);
    onClose();
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "manual_order_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex h-full w-[min(640px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base font-bold text-foreground" style={{ color: "var(--erp-ink)" }}>
            นำเข้าออร์เดอร์จากไฟล์
          </SheetTitle>
        </SheetHeader>
        <SheetBody className="grid gap-4 overflow-y-auto">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all"
            style={{
              borderColor: dragOver ? "var(--erp-accent)" : "#D1D5DB",
              background: dragOver ? "var(--erp-accent-bg)" : "var(--erp-subtle)",
            }}
          >
            <div className="text-sm font-semibold text-foreground mb-1">
              วางไฟล์ที่นี่ หรือคลิกเพื่อเลือก
            </div>
            <div className="text-xs text-muted-foreground">.csv</div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>

          {importError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {importError}
            </div>
          )}

          {importRows.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-foreground mb-2" style={{ color: "var(--erp-ink)" }}>
                พบข้อมูล {importRows.length} รายการ — ตรวจสอบก่อนนำเข้า
              </div>
              <div className="border border-border rounded-lg max-h-[300px] overflow-y-auto" style={{ borderColor: "var(--erp-border)" }}>
                <Table className="w-full border-collapse">
                  <TableHeader className="bg-muted/50 border-b border-border sticky top-0" style={{ background: "var(--erp-subtle)", borderColor: "var(--erp-border)" }}>
                    <TableRow>
                      <TableHead className="p-2 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>ลูกค้า</TableHead>
                      <TableHead className="p-2 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>โทรศัพท์</TableHead>
                      <TableHead className="p-2 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>ช่องทาง</TableHead>
                      <TableHead className="p-2 text-xs font-bold text-muted-foreground uppercase text-right" style={{ color: "var(--erp-ink3)" }}>มูลค่า</TableHead>
                      <TableHead className="p-2 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>หมายเหตุ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importRows.map((row, i) => (
                      <TableRow key={i} className="border-b border-border" style={{ borderColor: "var(--erp-border)" }}>
                        <TableCell className="p-2 text-xs">{row.customer}</TableCell>
                        <TableCell className="p-2 text-xs font-mono">{row.phone}</TableCell>
                        <TableCell className="p-2 text-xs">{row.channel}</TableCell>
                        <TableCell className="p-2 text-xs text-right font-bold">
                          {row.amount ? formatBaht(parseFloat(row.amount) || 0) : "—"}
                        </TableCell>
                        <TableCell className="p-2 text-xs text-muted-foreground">{row.notes || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {!importRows.length && !importError && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 leading-relaxed">
              <strong>รูปแบบไฟล์ CSV:</strong> customer, phone, channel, amount, notes
              <br />
              <strong>ช่องทางที่รองรับ:</strong> {CHANNELS.join(", ")}
            </div>
          )}
        </SheetBody>
        <SheetFooter className="flex justify-between items-center border-t p-4 px-6">
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="cursor-pointer">
            ดาวน์โหลด Template CSV
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setImportRows([]);
                setImportError("");
                onClose();
              }}
              className="cursor-pointer"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={confirmImport}
              disabled={!importRows.length}
              className="bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none cursor-pointer"
              style={{ background: !importRows.length ? "#D1D5DB" : undefined }}
            >
              ยืนยันนำเข้า {importRows.length > 0 ? `(${importRows.length})` : ""}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
