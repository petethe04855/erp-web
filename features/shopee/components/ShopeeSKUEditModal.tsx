"use client";

import React, { useState } from "react";
import { X, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shopeeApi } from "../api/shopee.api";
import type { ShopeeOrderItem } from "../types/shopee.types";

interface Props {
  isOpen: boolean;
  item: ShopeeOrderItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ShopeeSKUEditModal({ isOpen, item, onClose, onSuccess }: Props) {
  const [sku, setSku] = useState(item?.sku || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (item) {
      setSku(item.sku);
      setError(null);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.id) return;
    if (!sku.trim()) {
      setError("กรุณากรอกรหัส SKU");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await shopeeApi.updateItemSKU(item.id, sku.trim());
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update SKU";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b px-6 py-4 dark:border-zinc-800">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            แก้ไขรหัส SKU (Order Item)
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <Label className="text-xs text-zinc-500">Order ID</Label>
            <div className="font-mono text-sm font-semibold">{item.order_id}</div>
          </div>

          <div>
            <Label className="text-xs text-zinc-500">ชื่อสินค้าบน Shopee</Label>
            <div className="text-xs text-zinc-700 dark:text-zinc-300">{item.product_name}</div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sku-input" className="text-xs font-semibold">
              รหัส SKU ที่ถูกต้อง (ERP Master SKU)
            </Label>
            <Input
              id="sku-input"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. FD-TN-80-01"
              className="font-mono text-sm uppercase"
            />
            {item.original_sku && item.original_sku !== sku && (
              <p className="text-[11px] text-zinc-500">
                SKU ดั้งเดิมจากไฟล์: <span className="font-mono">{item.original_sku}</span>
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              บันทึกการแก้ไข
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
