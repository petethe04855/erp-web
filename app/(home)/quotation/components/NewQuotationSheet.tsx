"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
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
import { formatBaht, type Customer, type LeadSource } from "@/lib/mockData";
import { Mono } from "@/components/ui";
import { ValidationAlert } from "@/components/ValidationAlert";

type Line = { sku: string; qty: number; price: number };

function addDaysIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

const BLANK_FORM = {
  customer: "",
  customerAddress: "",
  leadSource: "",
  validUntil: "",
  lines: [{ sku: "", qty: 1, price: 0 }] as Line[],
};

interface Product {
  sku: string;
  name: string;
  price: number;
  stock: number;
  physicalStock?: number;
  reservedQty?: number;
  isBundle?: boolean;
}

interface NewQuotationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  customers: Customer[];
  onSubmit: (data: {
    customer: string;
    customerAddress: string;
    leadSource: LeadSource;
    validUntil: string;
    lines: Line[];
  }) => void;
  showToast?: (msg: string) => void;
}

export function NewQuotationSheet({
  open,
  onOpenChange,
  products,
  customers,
  onSubmit,
}: NewQuotationSheetProps) {
  const { tokens: t } = useTheme();

  const [form, setForm] = useState(BLANK_FORM);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        customer: "",
        customerAddress: "",
        leadSource: "",
        validUntil: addDaysIso(15),
        lines: [{ sku: "", qty: 1, price: 0 }],
      });
      setValidationError("");
    }
  }, [open]);

  const lineTotal = form.lines.reduce((s, line) => {
    return s + line.price * line.qty;
  }, 0);

  function addLine() {
    setForm((f) => ({
      ...f,
      lines: [...f.lines, { sku: "", qty: 1, price: 0 }],
    }));
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

  function selectProduct(i: number, sku: string) {
    const product = products.find((item) => item.sku === sku);
    setForm((form) => ({
      ...form,
      lines: form.lines.map((line, index) => {
        if (index !== i) return line;
        const maxStock = product ? product.stock : Infinity;
        const currentQty = typeof line.qty === "number" ? line.qty : 1;
        const adjustedQty = maxStock > 0 ? Math.min(currentQty, maxStock) : 1;
        return {
          ...line,
          sku,
          price: product?.price ?? 0,
          qty: adjustedQty,
        };
      }),
    }));
  }

  function handleSubmit() {
    const validLines = form.lines.filter(
      (l) => l.sku && Number(l.qty) > 0 && Number(l.price) >= 0,
    );
    if (
      !form.customer ||
      !form.customerAddress ||
      !form.leadSource.trim() ||
      !form.validUntil ||
      validLines.length === 0
    ) {
      setValidationError("กรุณากรอกลูกค้า Lead Source วันหมดอายุ และสินค้า");
      return;
    }

    // ตรวจสอบไม่ให้จำนวนเกินสต็อกในคลัง
    const qtyBySku = validLines.reduce<Record<string, number>>((acc, line) => {
      acc[line.sku] = (acc[line.sku] || 0) + Number(line.qty);
      return acc;
    }, {});

    for (const [sku, totalQty] of Object.entries(qtyBySku)) {
      const product = products.find((p) => p.sku === sku);
      if (product) {
        if (!product.isBundle && totalQty > product.stock) {
          setValidationError(
            `สินค้า "${product.name}" มีจำนวน ${totalQty} ชิ้น ซึ่งเกินสต็อกคงเหลือ (${product.stock} ชิ้น)`
          );
          return;
        }
        if (product.isBundle && product.stock > 0 && totalQty > product.stock) {
          setValidationError(
            `สินค้าแพ็ก "${product.name}" มีสต็อกส่วนประกอบพอจัดได้เพียง ${product.stock} แพ็ก (ระบุ ${totalQty} แพ็ก)`
          );
          return;
        }
      }
    }

    onSubmit({
      customer: form.customer,
      customerAddress: form.customerAddress,
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
          <SheetTitle className="text-base font-bold text-foreground">
            New Quotation
          </SheetTitle>
          <div className="text-xs text-muted-foreground">
            Total {formatBaht(lineTotal)}
          </div>
        </SheetHeader>

        <ValidationAlert message={validationError} />

        <SheetBody className="flex flex-col gap-4 overflow-y-auto">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Customer
            </Label>
            <NativeSelect
              value={form.customer}
              onChange={(e) => {
                const customerName = e.target.value;
                const customer = customers.find(
                  (item) => item.name === customerName,
                );
                setForm((f) => ({
                  ...f,
                  customer: customer?.name ?? customerName,
                  customerAddress: customer?.address ?? "",
                }));
              }}
            >
              <option value="">เลือกลูกค้า</option>
              {customers.map((customer) => (
                <option key={customer.name} value={customer.name}>
                  {customer.name}
                </option>
              ))}
            </NativeSelect>
            {form.customer && (
              <div className="mt-2 rounded-md border border-border bg-muted/40 p-3">
                <div className="text-xs font-semibold text-muted-foreground">
                  ที่อยู่บริษัท
                </div>
                <div className="mt-1 text-sm text-foreground">
                  {form.customerAddress}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
                Lead source
              </Label>
              <Input
                value={form.leadSource}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    leadSource: e.target.value,
                  }))
                }
                placeholder="เช่น Facebook, ลูกค้าแนะนำ, งานแสดงสินค้า"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
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
              <span className="text-xs font-bold text-foreground">
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

            <div className="border border-border rounded-lg overflow-hidden">
              <Table className="w-full border-collapse">
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="h-8 px-2 text-xs font-semibold text-muted-foreground">
                      สินค้า
                    </TableHead>
                    <TableHead className="h-8 px-2 text-center text-xs font-semibold text-muted-foreground w-20">
                      จำนวน
                    </TableHead>
                    <TableHead className="h-8 px-2 text-right text-xs font-semibold text-muted-foreground w-32">
                      ราคา/หน่วย
                    </TableHead>
                    <TableHead className="h-8 px-2 text-right text-xs font-semibold text-muted-foreground w-24">
                      รวม
                    </TableHead>
                    <TableHead className="h-8 w-8 p-0" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {form.lines.map((line, i) => {
                    const product = products.find((p) => p.sku === line.sku);
                    return (
                      <TableRow
                        key={i}
                        className="border-b border-border last:border-0"
                      >
                        <TableCell className="p-2 align-middle">
                          <NativeSelect
                            value={line.sku}
                            onChange={(e) => selectProduct(i, e.target.value)}
                            className="text-xs cursor-pointer w-full"
                          >
                            <option value="">Select product</option>
                            {products.map((p) => {
                              const isBundle = Boolean(p.isBundle);
                              const isOutOfStock = !isBundle && p.stock <= 0;
                              const label = isBundle
                                ? `พร้อมจัด ${p.stock > 0 ? p.stock.toLocaleString() : 0} แพ็ก (มี BOM)`
                                : isOutOfStock
                                  ? "(สินค้าหมด)"
                                  : `คงเหลือ ${p.stock.toLocaleString()}`;

                              return (
                                <option
                                  key={p.sku}
                                  value={p.sku}
                                  disabled={isOutOfStock}
                                >
                                  {p.name} · {label}
                                </option>
                              );
                            })}
                          </NativeSelect>
                        </TableCell>
                        <TableCell className="p-2 align-middle w-20">
                          <Input
                            type="number"
                            min={1}
                            max={
                              product
                                ? product.isBundle
                                  ? (product.stock > 0 ? product.stock : undefined)
                                  : Math.max(1, product.stock)
                                : undefined
                            }
                            value={line.qty}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") {
                                updateLine(i, "qty", "");
                                return;
                              }
                              let parsed = parseInt(val, 10);
                              if (isNaN(parsed)) parsed = 1;
                              const isBundle = Boolean(product?.isBundle);
                              if (product && !isBundle && parsed > product.stock) {
                                parsed = Math.max(1, product.stock);
                              } else if (product && isBundle && product.stock > 0 && parsed > product.stock) {
                                parsed = product.stock;
                              } else if (parsed < 1) {
                                parsed = 1;
                              }
                              updateLine(i, "qty", parsed);
                            }}
                            className="h-9 text-xs p-1 text-center font-mono"
                            placeholder="1"
                            title={
                              product
                                ? product.isBundle
                                  ? `สินค้าแพ็ก (มี BOM): ${
                                      product.stock > 0
                                        ? `พร้อมจัดชุดได้ ${product.stock.toLocaleString()} แพ็ก (คำนวณตาม BOM)`
                                        : "ตัดสต็อกตามส่วนประกอบ BOM เมื่อขาย"
                                    }`
                                  : `สต็อกคงเหลือพร้อมขาย: ${product.stock.toLocaleString()} ชิ้น${
                                      product.reservedQty
                                        ? ` (จองแล้ว ${product.reservedQty})`
                                        : ""
                                    }`
                                : undefined
                            }
                          />
                        </TableCell>
                        <TableCell className="p-2 align-middle w-32">
                          <div className="relative flex items-center">
                            <Input
                              aria-label={`ราคาขาย ${getProductName(line.sku)}`}
                              type="number"
                              min={0}
                              step="0.01"
                              value={line.price === 0 && !line.sku ? "" : line.price}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateLine(
                                  i,
                                  "price",
                                  val === "" ? 0 : Math.max(0, Number(val) || 0),
                                );
                              }}
                              className="h-9 text-xs pl-2 pr-11 text-right font-mono"
                              placeholder="ราคา/หน่วย"
                            />
                            <span className="pointer-events-none absolute right-2 text-[10px] text-muted-foreground select-none">
                              /หน่วย
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="p-2 align-middle text-right w-24">
                          <Mono t={t} size={12}>
                            {product ? formatBaht(line.price * line.qty) : "—"}
                          </Mono>
                        </TableCell>
                        <TableCell className="p-2 align-middle text-center w-8">
                          {form.lines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLine(i)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                              aria-label="ลบรายการ"
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

