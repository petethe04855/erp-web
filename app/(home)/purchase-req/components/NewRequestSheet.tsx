"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
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
import { ValidationAlert } from "@/components/ValidationAlert";

type ItemLine = { sku: string; name: string; qty: number | ""; note: string };
const BLANK_LINE: ItemLine = { sku: "", name: "", qty: 1, note: "" };
const BLANK = {
  requester: "",
  reason: "",
  neededDate: "",
  items: [{ ...BLANK_LINE }],
};

interface Product {
  sku: string;
  name: string;
  cost: number;
  type?: string;
}

interface NewRequestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onSubmit: (pr: {
    requester: string;
    reason: string;
    neededDate: string;
    items: { sku: string; name: string; qty: number; note: string }[];
  }) => void;
  showToast: (msg: string) => void;
}

export function NewRequestSheet({
  open,
  onOpenChange,
  products,
  onSubmit,
  showToast,
}: NewRequestSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [form, setForm] = useState(BLANK);
  const [validationError, setValidationError] = useState("");
  const purchasableProducts = products.filter(
    (p) => p.type === "Raw Material" || p.type === "Packaging",
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
          const prod = purchasableProducts.find((p) => p.sku === val);
          return {
            ...line,
            sku: val as string,
            name: prod?.name || "",
          };
        }
        return { ...line, [field]: val };
      }),
    }));
  }

  function handleSubmit() {
    const hasInvalidItem = form.items.some(
      (i) => i.qty === "" || Number(i.qty) <= 0,
    );
    if (hasInvalidItem) {
      setValidationError("กรุณากรอกจำนวนในรายการให้ถูกต้อง (มากกว่า 0)");
      return;
    }
    const validItems = form.items
      .filter((i) => i.sku || i.name)
      .map((i) => ({
        sku: i.sku,
        name: i.name,
        qty: Number(i.qty),
        note: i.note,
      }));
    if (!form.requester || !form.neededDate || validItems.length === 0) {
      setValidationError("กรุณากรอกผู้ขอ วันที่ต้องการ และรายการอย่างน้อย 1 รายการ");
      return;
    }
    onSubmit({
      requester: form.requester,
      reason: form.reason,
      neededDate: form.neededDate,
      items: validItems,
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
            New Purchase Request
          </SheetTitle>
        </SheetHeader>
        <ValidationAlert message={validationError} />
        <SheetBody className="space-y-3">
          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Requester
            </Label>
            <Input
              value={form.requester}
              onChange={(e) =>
                setForm((f) => ({ ...f, requester: e.target.value }))
              }
              placeholder="Requester name"
            />
          </div>

          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Reason
            </Label>
            <Textarea
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({ ...f, reason: e.target.value }))
              }
              placeholder="Reason for request"
            />
          </div>

          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Needed date
            </Label>
            <Input
              type="date"
              value={form.neededDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, neededDate: e.target.value }))
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
                        <NativeSelect
                          value={line.sku}
                          onChange={(e) => updateLine(i, "sku", e.target.value)}
                          className="text-xs cursor-pointer w-full"
                        >
                          <option value="">Select raw material / packaging</option>
                          <optgroup label="Raw Material / Packaging">
                            {purchasableProducts.map((p) => (
                              <option key={p.sku} value={p.sku}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </optgroup>
                        </NativeSelect>
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
                          className="h-9 text-xs p-1 text-center font-mono"
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
            Save Draft
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
