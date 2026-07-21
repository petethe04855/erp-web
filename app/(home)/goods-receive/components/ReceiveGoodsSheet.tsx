"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Mono } from "@/components/ui";
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
import type { LandedCostLine } from "@/lib/store/erpWorkflow";
import { useTheme } from "@/lib/design/ThemeContext";
import { formatBaht } from "@/lib/mockData";

type ReceiveLine = {
  sku: string;
  name: string;
  qtyOrdered: number;
  qtyRemaining: number;
  qtyReceived: number;
  lot: string;
  expiryDate: string;
};

interface POItem {
  sku: string;
  name: string;
  qty: number;
  receivedQty: number;
  unitCost: number;
}

interface PurchaseOrder {
  id: string;
  supplier: string;
  status: string;
  totalCost: number;
  items: POItem[];
}

interface ReceiveGoodsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eligiblePOs: PurchaseOrder[];
  onSubmit: (data: {
    poRef: string;
    receiveDate: string;
    items: {
      sku: string;
      qtyReceived: number;
      lot: string;
      expiryDate: string;
    }[];
    landedCosts: LandedCostLine[];
  }) => boolean;
  showToast: (msg: string) => void;
}

export function ReceiveGoodsSheet({
  open,
  onOpenChange,
  eligiblePOs,
  onSubmit,
  showToast,
}: ReceiveGoodsSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [selectedPO, setSelectedPO] = useState("");
  const [receiveDate, setReceiveDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [lines, setLines] = useState<ReceiveLine[]>([]);
  const [landedCosts, setLandedCosts] = useState<LandedCostLine[]>([]);

  function onSelectPO(poId: string) {
    setSelectedPO(poId);
    const po = eligiblePOs.find((p) => p.id === poId);
    setLines(
      po
        ? po.items
            .map((item) => ({
              sku: item.sku,
              name: item.name,
              qtyOrdered: item.qty,
              qtyRemaining: item.qty - item.receivedQty,
              qtyReceived: item.qty - item.receivedQty,
              lot: "",
              expiryDate: "",
            }))
            .filter((line) => line.qtyRemaining > 0)
        : [],
    );
  }

  function updateReceiveLine(
    i: number,
    field: "qtyReceived" | "lot" | "expiryDate",
    val: string | number,
  ) {
    setLines((ls) =>
      ls.map((line, idx) => {
        if (idx !== i) return line;
        if (field === "qtyReceived") {
          const v = Math.max(0, Math.min(line.qtyRemaining, Number(val) || 0));
          return { ...line, qtyReceived: v };
        }
        return { ...line, [field]: String(val) };
      }),
    );
  }

  function addLandedCostLine() {
    setLandedCosts((prev) => [
      ...prev,
      { type: "freight", amount: 0, allocatable: true, note: "" },
    ]);
  }

  function removeLandedCostLine(idx: number) {
    setLandedCosts((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateLandedCostLine<K extends keyof LandedCostLine>(
    idx: number,
    field: K,
    val: LandedCostLine[K],
  ) {
    setLandedCosts((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item)),
    );
  }

  function handleSubmit() {
    const validItems = lines.filter((l) => l.qtyReceived > 0);
    if (!selectedPO || !receiveDate || validItems.length === 0) {
      showToast("กรุณาเลือก PO วันที่รับ และระบุจำนวนอย่างน้อย 1 รายการ");
      return;
    }
    const success = onSubmit({
      poRef: selectedPO,
      receiveDate,
      items: validItems.map((l) => ({
        sku: l.sku,
        qtyReceived: l.qtyReceived,
        lot: l.lot,
        expiryDate: l.expiryDate,
      })),
      landedCosts: landedCosts.filter((lc) => lc.amount > 0),
    });

    if (success) {
      setSelectedPO("");
      setLines([]);
      setLandedCosts([]);
      onOpenChange(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[min(640px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle
            className="text-base font-bold text-foreground"
            style={{ color: "var(--erp-ink)" }}
          >
            Receive Goods
          </SheetTitle>
        </SheetHeader>
        <SheetBody className="space-y-4">
          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Purchase Order *
            </Label>
            <NativeSelect
              value={selectedPO}
              onChange={(e) => onSelectPO(e.target.value)}
              className="w-full cursor-pointer"
            >
              <option value="">Select PO</option>
              {eligiblePOs.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.id} — {po.supplier} ({formatBaht(po.totalCost)})
                </option>
              ))}
            </NativeSelect>
          </div>

          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Receive date *
            </Label>
            <Input
              type="date"
              value={receiveDate}
              onChange={(e) => setReceiveDate(e.target.value)}
            />
          </div>

          {/* Landed Costs section */}
          <div
            className="border border-dashed rounded-lg p-4 grid gap-3"
            style={{ borderColor: "var(--erp-border)" }}
          >
            <div className="flex justify-between items-center">
              <span
                className="text-sm font-semibold text-foreground"
                style={{ color: "var(--erp-ink)" }}
              >
                ค่าใช้จ่ายแฝงนำเข้า (Landed Cost)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={addLandedCostLine}
                className="cursor-pointer"
              >
                + เพิ่มค่าใช้จ่าย
              </Button>
            </div>

            {landedCosts.length > 0 && (
              <div className="grid gap-2">
                {landedCosts.map((lc, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 items-center flex-wrap sm:flex-nowrap"
                  >
                    <select
                      value={lc.type}
                      onChange={(e) =>
                        updateLandedCostLine(idx, "type", e.target.value as any)
                      }
                      className="border rounded-md p-1.5 bg-card text-xs cursor-pointer"
                      style={{ borderColor: "var(--erp-border)" }}
                    >
                      <option value="freight">ค่าขนส่ง (Freight)</option>
                      <option value="duty">ภาษี (Duty)</option>
                      <option value="shipping">ชิปปิง (Shipping)</option>
                      <option value="other">อื่นๆ (Other)</option>
                    </select>

                    <Input
                      type="number"
                      placeholder="จำนวน (บาท)"
                      value={lc.amount || ""}
                      onChange={(e) =>
                        updateLandedCostLine(
                          idx,
                          "amount",
                          Number(e.target.value) || 0,
                        )
                      }
                      className="w-24 text-xs font-mono"
                    />

                    <label
                      className="flex items-center gap-1.5 text-xs cursor-pointer select-none text-muted-foreground"
                      style={{ color: "var(--erp-ink2)" }}
                    >
                      <input
                        type="checkbox"
                        checked={lc.allocatable}
                        onChange={(e) =>
                          updateLandedCostLine(
                            idx,
                            "allocatable",
                            e.target.checked,
                          )
                        }
                      />
                      ปันทุน
                    </label>

                    <Input
                      type="text"
                      placeholder="บันทึก..."
                      value={lc.note}
                      onChange={(e) =>
                        updateLandedCostLine(idx, "note", e.target.value)
                      }
                      className="flex-1 text-xs min-w-[80px]"
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeLandedCostLine(idx)}
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 h-8 w-8 p-0 cursor-pointer"
                      style={{ color: "var(--erp-neg)" }}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {lines.length > 0 && (
            <div
              className="border border-border rounded-lg overflow-hidden mt-2"
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
                      className="p-3 text-xs font-bold text-muted-foreground uppercase text-left"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      Item
                    </TableHead>
                    <TableHead
                      className="p-3 text-xs font-bold text-muted-foreground uppercase text-left"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      Remain
                    </TableHead>
                    <TableHead
                      className="p-3 text-xs font-bold text-muted-foreground uppercase text-left"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      Receive
                    </TableHead>
                    <TableHead
                      className="p-3 text-xs font-bold text-muted-foreground uppercase text-left"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      Lot
                    </TableHead>
                    <TableHead
                      className="p-3 text-xs font-bold text-muted-foreground uppercase text-left"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      Expiry
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line, i) => (
                    <TableRow
                      key={line.sku}
                      className="border-b border-border"
                      style={{ borderColor: "var(--erp-border)" }}
                    >
                      <TableCell className="p-3 align-middle">
                        <span
                          className="text-xs font-semibold text-foreground"
                          style={{ color: "var(--erp-ink)" }}
                        >
                          {line.name}
                        </span>
                        <div>
                          <Mono t={t} size={10} color={c.ink3}>
                            {line.sku}
                          </Mono>
                        </div>
                      </TableCell>
                      <TableCell className="p-3 align-middle">
                        <Mono t={t} size={12} color={c.warn}>
                          {line.qtyRemaining}
                        </Mono>
                      </TableCell>
                      <TableCell className="p-3 align-middle">
                        <Input
                          type="number"
                          min={0}
                          max={line.qtyRemaining}
                          value={line.qtyReceived}
                          onChange={(e) =>
                            updateReceiveLine(i, "qtyReceived", e.target.value)
                          }
                          className="w-16 h-8 text-xs font-mono p-1"
                        />
                      </TableCell>
                      <TableCell className="p-3 align-middle">
                        <Input
                          value={line.lot}
                          onChange={(e) =>
                            updateReceiveLine(i, "lot", e.target.value)
                          }
                          placeholder="LOT"
                          className="w-24 h-8 text-xs p-1"
                        />
                      </TableCell>
                      <TableCell className="p-3 align-middle">
                        <Input
                          type="date"
                          value={line.expiryDate}
                          onChange={(e) =>
                            updateReceiveLine(i, "expiryDate", e.target.value)
                          }
                          className="w-28 h-8 text-xs p-1"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none cursor-pointer"
          >
            Save Receipt
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
