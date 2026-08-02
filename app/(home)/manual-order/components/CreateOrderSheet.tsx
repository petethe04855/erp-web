"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
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
import { ValidationAlert } from "@/components/ValidationAlert";

const CHANNELS = ["LINE", "Instagram", "Facebook", "Offline", "Other"];
const CHANNEL_ICON: Record<string, string> = {
  LINE: "LN",
  Instagram: "IG",
  Facebook: "FB",
  Offline: "OFF",
  Other: "OTH",
};

type Line = { sku: string; qty: number | "" };

const today = new Date().toISOString().split("T")[0];
const BLANK = {
  customer: "",
  phone: "",
  channel: "LINE",
  date: today,
  notes: "",
  lines: [{ sku: "", qty: 1 }] as Line[],
};

interface Product {
  sku: string;
  name: string;
  price: number;
}

interface CreateOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onSubmit: (data: {
    customer: string;
    phone: string;
    channel: string;
    amount: number;
    items: number;
    notes: string;
  }) => void;
}

export function CreateOrderSheet({
  open,
  onOpenChange,
  products,
  onSubmit,
}: CreateOrderSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [form, setForm] = useState(BLANK);
  const [validationError, setValidationError] = useState("");

  const lineTotal = form.lines.reduce((s, l) => {
    const p = products.find((prod) => prod.sku === l.sku);
    return s + (p ? p.price * Number(l.qty) : 0);
  }, 0);

  function addLine() {
    setForm((f) => ({ ...f, lines: [...f.lines, { sku: "", qty: 1 }] }));
  }

  function removeLine(i: number) {
    setForm((f) => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));
  }

  function updateLine(i: number, field: keyof Line, val: string | number) {
    setForm((f) => ({
      ...f,
      lines: f.lines.map((l, idx) => (idx === i ? { ...l, [field]: val } : l)),
    }));
  }

  function handleSubmit() {
    if (!form.customer) {
      setValidationError("กรุณากรอกชื่อลูกค้า");
      return;
    }
    const hasInvalidLine = form.lines.some(
      (l) => l.qty === "" || Number(l.qty) <= 0,
    );
    if (hasInvalidLine) {
      setValidationError("กรุณากรอกจำนวนสินค้าให้ถูกต้อง (มากกว่า 0)");
      return;
    }
    const validLines = form.lines
      .filter((l) => l.sku)
      .map((l) => ({ ...l, qty: Number(l.qty) }));
    if (validLines.length === 0) {
      setValidationError("กรุณาเลือกรายการสินค้าอย่างน้อย 1 รายการ");
      return;
    }

    onSubmit({
      customer: form.customer,
      phone: form.phone,
      channel: form.channel,
      amount: lineTotal || 0,
      items: validLines.length || 1,
      notes: form.notes,
    });
    setValidationError("");
    setForm(BLANK);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[min(540px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle
            className="text-base font-bold text-foreground"
            style={{ color: "var(--erp-ink)" }}
          >
            สร้างออร์เดอร์ใหม่
          </SheetTitle>
        </SheetHeader>
        <ValidationAlert message={validationError} />
        <SheetBody className="grid gap-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                className="text-xs font-semibold text-muted-foreground mb-1 block"
                style={{ color: "var(--erp-ink2)" }}
              >
                ชื่อลูกค้า *
              </Label>
              <Input
                value={form.customer}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customer: e.target.value }))
                }
                placeholder="ชื่อลูกค้า"
              />
            </div>
            <div>
              <Label
                className="text-xs font-semibold text-muted-foreground mb-1 block"
                style={{ color: "var(--erp-ink2)" }}
              >
                เบอร์โทรศัพท์
              </Label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="0xx-xxx-xxxx"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                className="text-xs font-semibold text-muted-foreground mb-1 block"
                style={{ color: "var(--erp-ink2)" }}
              >
                ช่องทางการสั่ง
              </Label>
              <NativeSelect
                value={form.channel}
                onChange={(e) =>
                  setForm((f) => ({ ...f, channel: e.target.value }))
                }
                className="w-full cursor-pointer"
              >
                {CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>
                    {CHANNEL_ICON[ch]} {ch}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Label
                className="text-xs font-semibold text-muted-foreground mb-1 block"
                style={{ color: "var(--erp-ink2)" }}
              >
                วันที่สั่ง
              </Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span
                className="text-xs font-bold text-foreground"
                style={{ color: "var(--erp-ink)" }}
              >
                รายการสินค้า
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={addLine}
                className="text-xs cursor-pointer border-dashed"
              >
                + เพิ่มสินค้า
              </Button>
            </div>

            <div
              className="border border-border rounded-lg overflow-hidden"
              style={{ borderColor: "var(--erp-border)" }}
            >
              <Table className="w-full border-collapse">
                <TableHeader
                  className="bg-muted/50 border-b border-border"
                  style={{
                    background: "var(--erp-subtle)",
                    borderColor: "var(--erp-border)",
                  }}
                >
                  <TableRow>
                    <TableHead
                      className="p-2 text-xs font-bold text-muted-foreground uppercase text-left"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      สินค้า
                    </TableHead>
                    <TableHead
                      className="p-2 text-xs font-bold text-muted-foreground uppercase text-center w-[70px]"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      จำนวน
                    </TableHead>
                    <TableHead
                      className="p-2 text-xs font-bold text-muted-foreground uppercase text-left"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      ราคา/ชิ้น
                    </TableHead>
                    <TableHead
                      className="p-2 text-xs font-bold text-muted-foreground uppercase text-left"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      รวม
                    </TableHead>
                    <TableHead
                      className="p-2 text-xs font-bold text-muted-foreground uppercase text-left"
                      style={{ color: "var(--erp-ink3)" }}
                    ></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {form.lines.map((line, i) => {
                    const prod = products.find((p) => p.sku === line.sku);
                    return (
                      <TableRow
                        key={i}
                        className="border-b border-border"
                        style={{ borderColor: "var(--erp-border)" }}
                      >
                        <TableCell className="p-2 align-middle">
                          <select
                            value={line.sku}
                            onChange={(e) =>
                              updateLine(i, "sku", e.target.value)
                            }
                            className="border rounded-md p-1 bg-card text-xs cursor-pointer w-full"
                            style={{ borderColor: "var(--erp-border)" }}
                          >
                            <option value="">-- เลือกสินค้า --</option>
                            {products.map((p) => (
                              <option key={p.sku} value={p.sku}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell className="p-2 align-middle">
                          <Input
                            type="number"
                            min={1}
                            value={line.qty}
                            onChange={(e) =>
                              updateLine(
                                i,
                                "qty",
                                e.target.value === ""
                                  ? ""
                                  : parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-12 h-8 text-xs p-1 text-center font-mono"
                          />
                        </TableCell>
                        <TableCell
                          className="p-2 align-middle text-xs text-muted-foreground"
                          style={{ color: "var(--erp-ink3)" }}
                        >
                          {prod ? formatBaht(prod.price) : "—"}
                        </TableCell>
                        <TableCell
                          className="p-2 align-middle text-xs font-bold"
                          style={{ color: "var(--erp-ink)" }}
                        >
                          {prod
                            ? formatBaht(prod.price * Number(line.qty))
                            : "—"}
                        </TableCell>
                        <TableCell className="p-2 align-middle text-center">
                          {form.lines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLine(i)}
                              className="bg-transparent border-none cursor-pointer text-red-500 text-base"
                            >
                              ✕
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {lineTotal > 0 && (
            <div
              className="p-3 bg-muted rounded-lg flex justify-between items-center"
              style={{ background: "var(--erp-subtle)" }}
            >
              <span
                className="text-xs font-semibold text-muted-foreground"
                style={{ color: "var(--erp-ink3)" }}
              >
                มูลค่ารวม
              </span>
              <span
                className="text-lg font-bold text-[var(--erp-accent)]"
                style={{ color: c.accent }}
              >
                {formatBaht(lineTotal)}
              </span>
            </div>
          )}

          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              หมายเหตุ
            </Label>
            <Textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="หมายเหตุเพิ่มเติม..."
              rows={3}
            />
          </div>
        </SheetBody>
        <SheetFooter className="flex justify-end gap-2 border-t p-4 px-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer border-border"
            style={{
              borderColor: "var(--erp-border)",
              background: "var(--erp-surface)",
              color: "#374151",
            }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none cursor-pointer"
          >
            บันทึกออร์เดอร์
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
