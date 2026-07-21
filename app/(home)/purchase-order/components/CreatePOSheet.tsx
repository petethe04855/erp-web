"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
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

type ItemLine = {
  sku: string;
  name: string;
  qty: number | "";
  unitCost: number | "";
};

const BLANK_LINE: ItemLine = { sku: "", name: "", qty: 1, unitCost: 0 };
const BLANK = { supplier: "", etaDate: "", items: [{ ...BLANK_LINE }] };

interface Product {
  sku: string;
  name: string;
  cost: number;
}

interface CreatePOSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onSubmit: (data: {
    supplier: string;
    etaDate: string;
    items: { sku: string; name: string; qty: number; unitCost: number }[];
  }) => void;
  showToast: (msg: string) => void;
}

export function CreatePOSheet({
  open,
  onOpenChange,
  products,
  onSubmit,
  showToast,
}: CreatePOSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [form, setForm] = useState(BLANK);

  const lineTotal = form.items.reduce(
    (s, line) => s + Number(line.qty) * Number(line.unitCost),
    0,
  );

  function addLine() {
    setForm((f) => ({ ...f, items: [...f.items, { ...BLANK_LINE }] }));
  }

  function removeLine(i: number) {
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  }

  function updateLine(i: number, field: keyof ItemLine, val: string | number) {
    setForm((f) => ({
      ...f,
      items: f.items.map((line, idx) => {
        if (idx !== i) return line;
        if (field === "sku") {
          const prod = products.find((p) => p.sku === val);
          return {
            ...line,
            sku: val as string,
            name: prod?.name ?? "",
            unitCost: prod?.cost ?? 0,
          };
        }
        return { ...line, [field]: val };
      }),
    }));
  }

  function handleSubmit() {
    const hasInvalidItem = form.items.some(
      (i) =>
        i.qty === "" ||
        Number(i.qty) <= 0 ||
        i.unitCost === "" ||
        Number(i.unitCost) < 0,
    );
    if (hasInvalidItem) {
      showToast("กรุณากรอกจำนวนและราคาสินค้าให้ถูกต้อง");
      return;
    }
    const validItems = form.items
      .filter((i) => i.sku || i.name)
      .map((i) => ({
        sku: i.sku,
        name: i.name,
        qty: Number(i.qty),
        unitCost: Number(i.unitCost),
      }));
    if (!form.supplier || !form.etaDate || validItems.length === 0) {
      showToast("กรุณากรอกซัพพลายเออร์ วัน ETA และรายการ");
      return;
    }

    onSubmit({
      supplier: form.supplier,
      etaDate: form.etaDate,
      items: validItems,
    });
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
            New Purchase Order
          </SheetTitle>
          <div
            className="text-xs text-muted-foreground"
            style={{ color: "var(--erp-ink3)" }}
          >
            Total {formatBaht(lineTotal)}
          </div>
        </SheetHeader>
        <SheetBody className="space-y-3">
          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Supplier
            </Label>
            <Input
              value={form.supplier}
              onChange={(e) =>
                setForm((f) => ({ ...f, supplier: e.target.value }))
              }
              placeholder="Supplier name"
            />
          </div>

          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              ETA
            </Label>
            <Input
              type="date"
              value={form.etaDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, etaDate: e.target.value }))
              }
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span
                className="text-xs font-bold text-foreground"
                style={{ color: "var(--erp-ink2)" }}
              >
                Items
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={addLine}
                className="text-xs cursor-pointer border-dashed"
              >
                + Add item
              </Button>
            </div>

            <div
              className="border border-border rounded-lg overflow-hidden"
              style={{ borderColor: "var(--erp-border)" }}
            >
              <Table className="w-full border-collapse">
                <TableBody>
                  {form.items.map((line, i) => (
                    <TableRow
                      key={i}
                      className="border-b border-border"
                      style={{ borderColor: "var(--erp-border)" }}
                    >
                      <TableCell className="p-2 align-middle">
                        <select
                          value={line.sku}
                          onChange={(e) => updateLine(i, "sku", e.target.value)}
                          className="border rounded-md p-1 bg-card text-xs cursor-pointer w-full"
                          style={{ borderColor: "var(--erp-border)" }}
                        >
                          <option value="">Select product</option>
                          {products.map((p) => (
                            <option key={p.sku} value={p.sku}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className="p-2 align-middle w-20">
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
                          className="h-8 text-xs p-1 text-center font-mono"
                        />
                      </TableCell>
                      <TableCell className="p-2 align-middle w-24">
                        <Input
                          type="number"
                          min={0}
                          value={line.unitCost}
                          onChange={(e) =>
                            updateLine(
                              i,
                              "unitCost",
                              e.target.value === ""
                                ? ""
                                : parseFloat(e.target.value) || 0,
                            )
                          }
                          className="h-8 text-xs p-1 text-right font-mono"
                        />
                      </TableCell>
                      <TableCell className="p-2 align-middle text-center w-10">
                        {form.items.length > 1 && (
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </SheetBody>
        <SheetFooter className="flex justify-between items-center border-t p-4 px-6">
          <div
            className="font-mono text-sm font-semibold"
            style={{ color: "var(--erp-ink)" }}
          >
            {formatBaht(lineTotal)}
          </div>
          <div className="flex gap-2">
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
              Save PO
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
