"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Plus, Trash2, Calendar, DollarSign, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shopeeApi } from "@/features/shopee/api/shopee.api";
import type { SKUCostHistory } from "@/features/shopee/types/shopee.types";

interface Props {
  isOpen: boolean;
  sku: string;
  skuName?: string;
  onClose: () => void;
}

export function SKUCostHistoryModal({ isOpen, sku, skuName, onClose }: Props) {
  const [history, setHistory] = useState<SKUCostHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [costPrice, setCostPrice] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [note, setNote] = useState("");

  const loadHistory = useCallback(async () => {
    if (!sku) return;
    setLoading(true);
    setError(null);
    try {
      const data = await shopeeApi.getCostHistory(sku);
      setHistory(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load cost history");
    } finally {
      setLoading(false);
    }
  }, [sku]);

  useEffect(() => {
    if (isOpen && sku) {
      loadHistory();
      // Set default effectiveFrom to today
      setEffectiveFrom(new Date().toISOString().split("T")[0]);
      setCostPrice("");
      setEffectiveTo("");
      setNote("");
    }
  }, [isOpen, sku, loadHistory]);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(costPrice);
    if (isNaN(price) || price <= 0) {
      setError("กรุณาระบุต้นทุนที่มากกว่า 0");
      return;
    }
    if (!effectiveFrom) {
      setError("กรุณาระบุวันที่มีผล");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await shopeeApi.addCostHistory(sku, {
        cost_price: price,
        effective_from: effectiveFrom,
        effective_to: effectiveTo || undefined,
        note: note.trim() || undefined,
      });
      // Reset form & reload
      setCostPrice("");
      setEffectiveTo("");
      setNote("");
      loadHistory();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add cost record");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการต้นทุนนี้?")) return;
    try {
      await shopeeApi.deleteCostHistory(id);
      loadHistory();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete cost record");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              ประวัติต้นทุนสินค้าตามช่วงวัน (Cost History)
            </h3>
            <p className="font-mono text-xs text-orange-600 dark:text-orange-400">
              SKU: {sku} {skuName && <span className="text-zinc-500 font-sans">({skuName})</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Add New Cost Form */}
          <form
            onSubmit={handleAdd}
            className="rounded-xl border bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-3"
          >
            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              เพิ่มช่วงวันและต้นทุนใหม่
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <Label htmlFor="cost" className="text-[11px] text-zinc-500">
                  ต้นทุนต่อหน่วย (฿) *
                </Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="h-8 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <Label htmlFor="from" className="text-[11px] text-zinc-500">
                  มีผลตั้งแต่ (From) *
                </Label>
                <Input
                  id="from"
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div>
                <Label htmlFor="to" className="text-[11px] text-zinc-500">
                  สิ้นสุดเมื่อ (To - ว่างได้)
                </Label>
                <Input
                  id="to"
                  type="date"
                  value={effectiveTo}
                  onChange={(e) => setEffectiveTo(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="note" className="text-[11px] text-zinc-500">
                  หมายเหตุ
                </Label>
                <Input
                  id="note"
                  placeholder="e.g. ปรับล็อตใหม่"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                {submitting ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                )}
                เพิ่มประวัติต้นทุน
              </Button>
            </div>
          </form>

          {/* History List */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              รายการต้นทุนที่มีผลย้อนหลัง ({history.length} รายการ)
            </div>

            <div className="overflow-hidden rounded-lg border dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-zinc-50 text-[11px] font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400">
                  <tr>
                    <th className="p-2.5">ต้นทุนต่อหน่วย</th>
                    <th className="p-2.5">ช่วงวันที่มีผล (Effective Window)</th>
                    <th className="p-2.5">หมายเหตุ</th>
                    <th className="p-2.5 text-right">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-zinc-800">
                  {loading && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-zinc-400">
                        กำลังโหลด...
                      </td>
                    </tr>
                  )}

                  {!loading && history.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-zinc-400">
                        ยังไม่มีประวัติต้นทุนเฉพาะช่วงวัน (ระบบจะใช้ต้นทุนปัจจุบันของ Master SKU)
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    history.map((h) => (
                      <tr key={h.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="p-2.5 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          ฿{h.cost_price.toFixed(2)}
                        </td>
                        <td className="p-2.5 text-zinc-600 dark:text-zinc-300">
                          {h.effective_from ? h.effective_from.split("T")[0] : "-"} ถึง{" "}
                          {h.effective_to ? (
                            h.effective_to.split("T")[0]
                          ) : (
                            <span className="text-emerald-600 font-medium">ปัจจุบัน (ปัจจุบันขึ้นไป)</span>
                          )}
                        </td>
                        <td className="p-2.5 text-zinc-500">{h.note || "-"}</td>
                        <td className="p-2.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-zinc-400 hover:text-red-600"
                            onClick={() => handleDelete(h.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t px-6 py-3 dark:border-zinc-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            ปิดหน้าต่าง
          </Button>
        </div>
      </div>
    </div>
  );
}
