"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { formatBaht, type LeadSource } from "@/lib/mockData";
import { Mono } from "@/components/ui";
import { ValidationAlert } from "@/components/ValidationAlert";

type Line = { sku: string; qty: number };
const LEAD_SOURCES: LeadSource[] = [
  "Live",
  "LINE",
  "Facebook",
  "Shopee",
  "Walk-in",
  "B2B Referral",
];

function addDaysIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

const BLANK_FORM = {
  customer: "",
  leadSource: "Live" as LeadSource,
  validUntil: "",
  lines: [{ sku: "", qty: 1 }] as Line[],
};

interface Product {
  sku: string;
  name: string;
  price: number;
  stock: number;
}

interface NewQuotationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onSubmit: (data: {
    customer: string;
    leadSource: LeadSource;
    validUntil: string;
    lines: Line[];
  }) => void;
  showToast: (msg: string) => void;
}

export function NewQuotationSheet({
  open,
  onOpenChange,
  products,
  onSubmit,
  showToast,
}: NewQuotationSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [form, setForm] = useState(BLANK_FORM);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        customer: "",
        leadSource: "Live" as LeadSource,
        validUntil: addDaysIso(15),
        lines: [{ sku: "", qty: 1 }],
      });
    }
  }, [open]);

  const lineTotal = form.lines.reduce((s, line) => {
    const product = products.find((p) => p.sku === line.sku);
    return s + (product ? product.price * line.qty : 0);
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
      lines: f.lines.map((line, idx) =>
        idx === i ? { ...line, [field]: val } : line,
      ),
    }));
  }

  function handleSubmit() {
    const validLines = form.lines.filter((l) => l.sku && l.qty > 0);
    if (!form.customer || !form.validUntil || validLines.length === 0) {
      setValidationError("กรุณากรอกลูกค้า วันหมดอายุ และสินค้า");
      return;
    }
    onSubmit({
      customer: form.customer,
      validUntil: form.validUntil,
      leadSource: form.leadSource,
      lines: validLines,
    });
    setValidationError("");
    onOpenChange(false);
  }

  const getProductName = (sku: string) =>
    products.find((p) => p.sku === sku)?.name ?? sku;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[min(540px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle
            className="text-base font-bold text-foreground"
            style={{ color: "var(--erp-ink)" }}
          >
            New Quotation
          </SheetTitle>
          <div
            className="text-xs text-muted-foreground"
            style={{ color: "var(--erp-ink3)" }}
          >
            Total {formatBaht(lineTotal)}
          </div>
        </SheetHeader>
        <ValidationAlert message={validationError} />
        <SheetBody className="flex flex-col gap-4 overflow-y-auto">
          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Customer
            </Label>
            <Input
              value={form.customer}
              onChange={(e) =>
                setForm((f) => ({ ...f, customer: e.target.value }))
              }
              placeholder="Customer name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                className="text-xs font-semibold text-muted-foreground mb-1 block"
                style={{ color: "var(--erp-ink2)" }}
              >
                Lead source
              </Label>
              <NativeSelect
                value={form.leadSource}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    leadSource: e.target.value as LeadSource,
                  }))
                }
              >
                {LEAD_SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Label
                className="text-xs font-semibold text-muted-foreground mb-1 block"
                style={{ color: "var(--erp-ink2)" }}
              >
                Valid until
              </Label>
              <Input
                type="date"
                value={form.validUntil}
                onChange={(e) =>
                  setForm((f) => ({ ...f, validUntil: e.target.value }))
                }
              />
            </div>
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
                  {form.lines.map((line, i) => {
                    const product = products.find((p) => p.sku === line.sku);
                    return (
                      <TableRow
                        key={i}
                        className="border-b border-border"
                        style={{ borderColor: "var(--erp-border)" }}
                      >
                        <TableCell className="p-2 align-middle">
                          <NativeSelect
                            value={line.sku}
                            onChange={(e) =>
                              updateLine(i, "sku", e.target.value)
                            }
                            className="text-xs cursor-pointer w-full"
                          >
                            <option value="">Select product</option>
                            {products.map((p) => (
                              <option key={p.sku} value={p.sku}>
                                {p.name} · stock {p.stock}
                              </option>
                            ))}
                          </NativeSelect>
                          {line.sku && (
                            <div
                              className="text-[10px] mt-1"
                              style={{ color: "var(--erp-ink3)" }}
                            >
                              {getProductName(line.sku)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="p-2 align-middle w-20">
                          <Input
                            type="number"
                            min={1}
                            value={line.qty}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateLine(
                                i,
                                "qty",
                                val === ""
                                  ? ""
                                  : Math.max(1, parseInt(val) || 0),
                              );
                            }}
                            className="h-9 text-xs p-1 text-center font-mono"
                          />
                        </TableCell>
                        <TableCell className="p-2 align-middle text-right w-24">
                          <Mono t={t} size={12}>
                            {product
                              ? formatBaht(product.price * line.qty)
                              : "—"}
                          </Mono>
                        </TableCell>
                        <TableCell className="p-2 align-middle text-center w-10">
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
        </SheetBody>
        <SheetFooter className="flex justify-between items-center border-t p-4 px-6">
          <Mono t={t} size={14} weight={600}>
            {formatBaht(lineTotal)}
          </Mono>
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
              Save Draft
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
