"use client";

import React, { useCallback, useMemo } from "react";
import { useSKUListQuery } from "@/features/sku/queries/skuQueries";
import { useStockBySKU } from "@/features/inventory/queries/useStockBySKU";
import { useInventoryFormulasQuery } from "@/features/inventory/queries/inventoryQueries";
import type { SKU } from "@/features/sku/types/sku";
import type { InventoryFormula } from "@/features/inventory/types/formula";
import { Select } from "@/components/ui/select";
import { Package, AlertCircle, Loader2, Boxes } from "lucide-react";

export interface SKUSelectProps {
  value: string;
  onChange: (sku: string, skuData?: SKU) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  showDetails?: boolean;
  excludeBundle?: boolean;
  includeFormulas?: boolean;
  inventoryOnly?: boolean;
}

export function SKUSelect({
  value,
  onChange,
  disabled = false,
  required = true,
  className,
  showDetails = true,
  excludeBundle = false,
  includeFormulas = false,
  inventoryOnly = false,
}: SKUSelectProps) {
  // Fetch active SKUs without 100 limit (limit: 500 covers complete product catalogue)
  const { data, isLoading, isError } = useSKUListQuery({ limit: 500, status: "active" });
  const { stockMap } = useStockBySKU();
  const shouldLoadFormulas = includeFormulas || inventoryOnly;
  const { data: formulas = [], isLoading: formulasLoading } = useInventoryFormulasQuery(
    undefined,
    "active"
  );

  const skuList = useMemo(() => {
    if (inventoryOnly) {
      return [];
    }
    return data?.data || [];
  }, [data, inventoryOnly]);

  const formulaList = useMemo(() => {
    if (!shouldLoadFormulas) return [];
    return (formulas || []).filter((f) => f.isActive);
  }, [formulas, shouldLoadFormulas]);

  // Price map from SKU Master used to derive an Inventory set's selling price.
  // Inventory sets have no price of their own (plan/GLM53_SKU_QUANTITY_INVENTORY_IMAGE.md):
  // ราคาชุด = Σ (ราคาขายวัตถุดิบแต่ละรายการ × qty ต่อชุด)
  const componentPriceMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of data?.data || []) {
      const code = item.sku?.toUpperCase()?.trim();
      if (code) map.set(code, Number(item.price) || 0);
    }
    return map;
  }, [data]);

  const getFormulaPrice = useCallback(
    (formula: InventoryFormula): number => {
      let total = 0;
      for (const item of formula.items || []) {
        const code = item.componentSku?.toUpperCase()?.trim();
        total += (componentPriceMap.get(code) ?? 0) * (Number(item.qty) || 0);
      }
      return total;
    },
    [componentPriceMap],
  );

  // Convert formula to SKU-compatible presentation structure (with derived price)
  const formulaToSku = useCallback(
    (f: InventoryFormula): SKU & { isFormula?: boolean } => {
      const sets = f.availableSets ?? 0;
      return {
        id: f.id,
        sku: f.code,
        name: f.name,
        category: "ชุดสินค้า Inventory",
        price: getFormulaPrice(f),
        cost: 0,
        isBundle: false,
        availableStock: sets,
        stockQuantity: sets,
        available: sets,
        status: f.isActive ? "active" : "inactive",
        image: f.image,
        isFormula: true,
      } as SKU & { isFormula?: boolean };
    },
    [getFormulaPrice],
  );

  const selectedSku = useMemo(() => {
    const foundSku = skuList.find((item) => item.sku === value);
    if (foundSku) return foundSku;

    if (shouldLoadFormulas) {
      const foundFormula = formulaList.find((f) => f.code === value);
      if (foundFormula) {
        return formulaToSku(foundFormula);
      }
    }
    return undefined;
  }, [skuList, formulaList, value, shouldLoadFormulas, formulaToSku]);

  // Derive augmented SKU data with real Inventory stock
  const getAugmentedSku = (skuItem?: SKU): SKU | undefined => {
    if (!skuItem) return undefined;
    if ((skuItem as any).isFormula) return skuItem;
    if (skuItem.isBundle) return skuItem;

    const code = skuItem.sku?.toUpperCase()?.trim();
    const inv = code ? stockMap.get(code) : undefined;
    if (!inv) return skuItem; // fallback to master

    return {
      ...skuItem,
      availableStock: inv.available,
      reservedStock: inv.reserved,
      stockQuantity: inv.onHand,
      available: inv.available,
      reserved: inv.reserved,
      onHand: inv.onHand,
    };
  };

  const augmentedSelectedSku = useMemo(
    () => getAugmentedSku(selectedSku),
    [selectedSku, stockMap],
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSku = e.target.value;
    const foundSku = skuList.find((item) => item.sku === nextSku);
    if (foundSku) {
      const augmented = getAugmentedSku(foundSku);
      onChange(nextSku, augmented);
      return;
    }

    if (shouldLoadFormulas) {
      const foundFormula = formulaList.find((f) => f.code === nextSku);
      if (foundFormula) {
        onChange(nextSku, formulaToSku(foundFormula));
        return;
      }
    }

    onChange(nextSku, undefined);
  };

  const isCurrentLoading = inventoryOnly ? formulasLoading : isLoading;
  const isCurrentError = inventoryOnly ? false : isError;

  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-neutral-700 mb-1">
        {inventoryOnly ? "สินค้า Inventory" : "สินค้า SKU"} <span className="text-rose-500">*</span>
      </label>

      <div className="relative">
        {isCurrentLoading ? (
          <div className="flex h-9 w-full items-center rounded-md border border-neutral-200 bg-neutral-50 px-3 text-xs text-neutral-500">
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin text-neutral-400" />
            {inventoryOnly ? "กำลังโหลดรายการ Inventory..." : "กำลังโหลดรายการ SKU..."}
          </div>
        ) : isCurrentError ? (
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
            <option value="">
              {inventoryOnly
                ? "-- กรุณาเลือกชุดสินค้า Inventory --"
                : "-- กรุณาเลือก SKU / ชุดสินค้า --"}
            </option>
            {skuList.length > 0 && (
              <optgroup label="สินค้าเดี่ยว & สินค้าชุด (SKU)">
                {skuList.map((item) => {
                  const priceFormatted = Number(item.price || 0).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2 },
                  );

                  // Look up inventory stock for option label
                  const code = item.sku?.toUpperCase()?.trim();
                  const inv = code ? stockMap.get(code) : undefined;
                  const stockDisplay =
                    inv !== undefined
                      ? ` (พร้อมส่ง ${inv.available})`
                      : item.availableStock !== undefined
                        ? ` (พร้อมส่ง ${item.availableStock})`
                        : "";

                  return (
                    <option key={item.id} value={item.sku}>
                      {item.sku} · {item.name} — ฿{priceFormatted}
                      {stockDisplay}
                    </option>
                  );
                })}
              </optgroup>
            )}

            {shouldLoadFormulas && formulaList.length > 0 && (
              inventoryOnly ? (
                formulaList.map((item) => {
                  const availSets = item.availableSets ?? 0;
                  const priceFormatted = getFormulaPrice(item).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2 },
                  );
                  return (
                    <option key={`formula-${item.id || item.code}`} value={item.code}>
                      {item.code} · {item.name} — ฿{priceFormatted} (พร้อมส่ง {availSets} ชุด)
                    </option>
                  );
                })
              ) : (
                <optgroup label="ชุดสินค้า Inventory (สูตรตัดสต็อกวัตถุดิบ)">
                  {formulaList.map((item) => {
                    const availSets = item.availableSets ?? 0;
                    const priceFormatted = getFormulaPrice(item).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2 },
                    );
                    return (
                      <option key={`formula-${item.id || item.code}`} value={item.code}>
                        [ชุด Inventory] {item.code} · {item.name} — ฿{priceFormatted} (พร้อมส่ง {availSets} ชุด)
                      </option>
                    );
                  })}
                </optgroup>
              )
            )}
          </Select>
        )}
      </div>

      {showDetails && augmentedSelectedSku && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs text-neutral-600">
          <div className="flex items-center gap-1.5 font-medium text-neutral-900">
            {(augmentedSelectedSku as any).isFormula ? (
              <Boxes className="h-3.5 w-3.5 text-purple-600" />
            ) : (
              <Package className="h-3.5 w-3.5 text-neutral-500" />
            )}
            <span className="font-semibold">{augmentedSelectedSku.name}</span>
          </div>

          <span className="text-neutral-300">·</span>

          <div>
            {(augmentedSelectedSku as any).isFormula ? "ราคาชุด: " : "ราคาขาย: "}
            <span className="font-bold text-neutral-900">
              ฿{Number(augmentedSelectedSku.price || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
            {(augmentedSelectedSku as any).isFormula && (
              <span className="ml-1 text-[10px] font-normal text-neutral-400">
                (คำนวณจากราคาวัตถุดิบ)
              </span>
            )}
          </div>

          {(augmentedSelectedSku as any).isFormula ? (
            <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-200">
              ชุดสินค้า Inventory (เสมือน)
            </span>
          ) : null}

          {(augmentedSelectedSku as any).isFormula ? (
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                (augmentedSelectedSku.availableStock ?? 0) > 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              พร้อมประกอบส่ง: {augmentedSelectedSku.availableStock ?? 0} ชุด
            </span>
          ) : augmentedSelectedSku.availableStock !== undefined ? (
            <>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                  augmentedSelectedSku.availableStock > 0
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                พร้อมส่ง: {augmentedSelectedSku.availableStock} ชิ้น
                {augmentedSelectedSku.stockQuantity !== undefined &&
                  augmentedSelectedSku.stockQuantity !== augmentedSelectedSku.availableStock && (
                    <span className="text-neutral-400 font-normal ml-1">
                      (ทั้งหมด {augmentedSelectedSku.stockQuantity})
                    </span>
                  )}
              </span>
              {augmentedSelectedSku.reservedStock !== undefined && augmentedSelectedSku.reservedStock > 0 && (
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                  ติดจอง: {augmentedSelectedSku.reservedStock} ชิ้น
                </span>
              )}
            </>
          ) : augmentedSelectedSku.stockQuantity !== undefined ? (
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
              สต็อก: {augmentedSelectedSku.stockQuantity} ชิ้น
            </span>
          ) : null}

          {augmentedSelectedSku.category && (
            <span className="rounded-md bg-neutral-200/70 px-2 py-0.5 text-[10px] text-neutral-700 font-medium">
              {augmentedSelectedSku.category}
            </span>
          )}
        </div>
      )}
    </div>
  );
}


