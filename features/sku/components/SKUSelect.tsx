"use client";

import React, { useMemo } from "react";
import { useSKUListQuery } from "@/features/sku/queries/skuQueries";
import type { SKU } from "@/features/sku/types/sku";
import { Select } from "@/components/ui/select";
import { Package, Layers, AlertCircle, Loader2 } from "lucide-react";

export interface SKUSelectProps {
  value: string;
  onChange: (sku: string, skuData?: SKU) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  showDetails?: boolean;
  excludeBundle?: boolean;
}

export function SKUSelect({
  value,
  onChange,
  disabled = false,
  required = true,
  className,
  showDetails = true,
  excludeBundle = false,
}: SKUSelectProps) {
  const { data, isLoading, isError } = useSKUListQuery({ limit: 100 });
  const skuList = useMemo(() => {
    const list = data?.data || [];
    if (excludeBundle) {
      return list.filter((item) => !item.isBundle);
    }
    return list;
  }, [data, excludeBundle]);

  const selectedSku = useMemo(
    () => skuList.find((item) => item.sku === value),
    [skuList, value],
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSku = e.target.value;
    const found = skuList.find((item) => item.sku === nextSku);
    onChange(nextSku, found);
  };

  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-neutral-700 mb-1">
        สินค้า SKU <span className="text-rose-500">*</span>
      </label>

      <div className="relative">
        {isLoading ? (
          <div className="flex h-9 w-full items-center rounded-md border border-neutral-200 bg-neutral-50 px-3 text-xs text-neutral-500">
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin text-neutral-400" />
            กำลังโหลดรายการ SKU...
          </div>
        ) : isError ? (
          <div className="flex h-9 w-full items-center rounded-md border border-rose-200 bg-rose-50 px-3 text-xs text-rose-600">
            <AlertCircle className="mr-2 h-3.5 w-3.5" />
            ไม่สามารถโหลดรายการ SKU ได้
          </div>
        ) : (
          <Select
            value={value}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            className="text-xs bg-white"
          >
            <option value="">-- กรุณาเลือก SKU สินค้า --</option>
            {skuList.map((item) => {
              const priceFormatted = Number(item.price || 0).toLocaleString(
                undefined,
                { minimumFractionDigits: 2 },
              );
              return (
                <option key={item.id} value={item.sku}>
                  {item.sku} · {item.name} — ฿{priceFormatted}
                  {item.isBundle ? " [ชุด Bundle]" : ""}
                </option>
              );
            })}
          </Select>
        )}
      </div>

      {showDetails && selectedSku && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs text-neutral-600">
          <div className="flex items-center gap-1.5 font-medium text-neutral-900">
            {selectedSku.isBundle ? (
              <Layers className="h-3.5 w-3.5 text-indigo-600" />
            ) : (
              <Package className="h-3.5 w-3.5 text-neutral-500" />
            )}
            <span className="font-semibold">{selectedSku.name}</span>
          </div>

          <span className="text-neutral-300">·</span>

          <div>
            ราคาขาย:{" "}
            <span className="font-bold text-neutral-900">
              ฿{Number(selectedSku.price || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          {selectedSku.isBundle ? (
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200">
              สินค้าชุด (Bundle)
            </span>
          ) : selectedSku.availableStock !== undefined ? (
            <>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                  selectedSku.availableStock > 0
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                พร้อมส่ง: {selectedSku.availableStock} ชิ้น
                {selectedSku.stockQuantity !== undefined &&
                  selectedSku.stockQuantity !== selectedSku.availableStock && (
                    <span className="text-neutral-400 font-normal ml-1">
                      (ทั้งหมด {selectedSku.stockQuantity})
                    </span>
                  )}
              </span>
              {selectedSku.reservedStock !== undefined && selectedSku.reservedStock > 0 && (
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                  ติดจอง: {selectedSku.reservedStock} ชิ้น
                </span>
              )}
            </>
          ) : selectedSku.stockQuantity !== undefined ? (
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
              สต็อก: {selectedSku.stockQuantity} ชิ้น
            </span>
          ) : null}

          {selectedSku.category && (
            <span className="rounded-md bg-neutral-200/70 px-2 py-0.5 text-[10px] text-neutral-700 font-medium">
              {selectedSku.category}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
