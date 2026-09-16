"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { SKUSelect } from "@/features/sku/components/SKUSelect";

export interface ItemLine {
  sku: string;
  quantity: number;
  price: number;
  name?: string;
  maxStock?: number;
}

export function ItemLines({
  value,
  onChange,
  prices = true,
  enforceMaxStock = false,
  includeFormulas = false,
  inventoryOnly = false,
}: {
  value: ItemLine[];
  onChange: (lines: ItemLine[]) => void;
  prices?: boolean;
  enforceMaxStock?: boolean;
  includeFormulas?: boolean;
  inventoryOnly?: boolean;
}) {
  const update = (i: number, p: Partial<ItemLine>) =>
    onChange(value.map((line, n) => (n === i ? { ...line, ...p } : line)));

  const totalQuantity = value.reduce(
    (acc, l) => acc + (Number(l.quantity) || 0),
    0,
  );
  const totalAmount = value.reduce(
    (acc, l) => acc + Number(l.quantity || 0) * Number(l.price || 0),
    0,
  );

  return (
    <div className="space-y-4 border border-neutral-200 rounded-xl p-4 bg-neutral-50/50">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
        <p className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
          รายการสินค้า (Items)
        </p>
        <span className="text-xs text-neutral-500 font-medium">
          {value.length} รายการ
        </span>
      </div>

      <div className="space-y-3">
        {value.map((line, i) => {
          const hasStockLimit =
            line.maxStock !== undefined && line.maxStock !== null;
          const isOverStock =
            hasStockLimit && Number(line.quantity) > (line.maxStock ?? 0);
          const isOutOfStock = hasStockLimit && (line.maxStock ?? 0) <= 0;

          return (
            <div
              key={i}
              className={`rounded-lg border bg-white p-3.5 shadow-sm space-y-3 transition-colors ${
                isOverStock || isOutOfStock
                  ? "border-amber-300 bg-amber-50/20"
                  : "border-neutral-200"
              }`}
            >
              {/* SKU / Inventory Dropdown Selection */}
              <SKUSelect
                value={line.sku}
                includeFormulas={includeFormulas}
                inventoryOnly={inventoryOnly}
                onChange={(sku, skuData) => {
                  const stock =
                    skuData?.availableStock !== undefined
                      ? skuData.availableStock
                      : skuData?.stockQuantity;

                  const newMax =
                    stock !== undefined ? Math.max(0, stock) : undefined;
                  const newQty =
                    newMax !== undefined && newMax > 0 && line.quantity > newMax
                      ? newMax
                      : line.quantity > 0
                        ? line.quantity
                        : 1;

                  update(i, {
                    sku,
                    name: skuData?.name,
                    price:
                      skuData?.price !== undefined
                        ? Number(skuData.price)
                        : line.price,
                    maxStock: newMax,
                    quantity: newQty,
                  });
                }}
              />

              {/* Quantity, Unit Price, Line Total, Delete Button */}
              <div className="flex flex-wrap sm:flex-nowrap gap-3 items-end pt-1">
                <label className="w-full sm:w-36 text-xs font-semibold text-neutral-700">
                  <div className="flex items-center justify-between">
                    <span>จำนวน</span>
                    {hasStockLimit && (
                      <span
                        className={`text-[10px] font-normal ${
                          isOutOfStock
                            ? "text-rose-600 font-bold"
                            : isOverStock
                              ? "text-amber-600 font-bold"
                              : "text-emerald-600"
                        }`}
                      >
                        (สต็อก: {line.maxStock})
                      </span>
                    )}
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={
                      enforceMaxStock &&
                      hasStockLimit &&
                      (line.maxStock ?? 0) > 0
                        ? line.maxStock
                        : undefined
                    }
                    step={1}
                    required
                    value={line.quantity}
                    onChange={(e) => {
                      const inputVal = Number(e.target.value);
                      if (isNaN(inputVal)) return;
                      let finalVal = Math.max(1, inputVal);
                      if (
                        enforceMaxStock &&
                        hasStockLimit &&
                        line.maxStock !== undefined &&
                        line.maxStock > 0
                      ) {
                        finalVal = Math.min(line.maxStock, finalVal);
                      }
                      update(i, {
                        quantity: finalVal,
                      });
                    }}
                    className={`mt-1 bg-white text-xs font-medium ${
                      isOverStock
                        ? "border-amber-500 focus-visible:ring-amber-400"
                        : ""
                    }`}
                  />
                  {isOverStock && (
                    <span className="text-[10px] text-amber-600 font-medium block mt-0.5">
                      เกินสต็อกพร้อมขาย ({line.maxStock} ชิ้น)
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="text-[10px] text-rose-600 font-medium block mt-0.5">
                      สินค้าหมดในสต็อก
                    </span>
                  )}
                </label>

                {prices && (
                  <label className="flex-1 text-xs font-semibold text-neutral-700">
                    ราคาต่อหน่วย (บาท)
                    <Input
                      type="number"
                      min={0.01}
                      step="0.01"
                      required
                      value={line.price !== undefined ? line.price : ""}
                      onChange={(e) =>
                        update(i, { price: Number(e.target.value) })
                      }
                      className="mt-1 bg-white text-xs font-medium"
                    />
                  </label>
                )}

                {prices && (
                  <div className="w-28 text-right pb-2 text-xs">
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">
                      รวมรายการ
                    </span>
                    <span className="font-bold text-neutral-900">
                      ฿
                      {(
                        Number(line.quantity || 0) * Number(line.price || 0)
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 border-neutral-200"
                  disabled={value.length === 1}
                  onClick={() => onChange(value.filter((_, n) => n !== i))}
                  title="ลบรายการนี้"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Total Summary and Add button */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([...value, { sku: "", quantity: 1, price: 0 }])
          }
          className="text-xs border-neutral-300 font-medium hover:bg-white"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5 text-neutral-600" />
          เพิ่มรายการสินค้า
        </Button>

        {prices && (
          <div className="text-right">
            <span className="text-xs text-neutral-500 mr-2">
              รวม {totalQuantity} ชิ้น :
            </span>
            <span className="text-sm font-bold text-neutral-900">
              ฿
              {totalAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
