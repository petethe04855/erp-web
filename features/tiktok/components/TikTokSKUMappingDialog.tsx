"use client";

import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useTikTokMappings } from "../hooks/useTikTok";
import type { SKUMapping } from "../types/tiktok";

interface TikTokSKUMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TikTokSKUMappingDialog({
  open,
  onOpenChange,
}: TikTokSKUMappingDialogProps) {
  const { mappings, isLoading, refetch, saveMapping, isSaving } =
    useTikTokMappings();
  const [tiktokSku, setTiktokSku] = useState("");
  const [erpSku, setErpSku] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mappings;
    return mappings.filter(
      (m: SKUMapping) =>
        m.tiktokSku.toLowerCase().includes(q) ||
        m.erpSku.toLowerCase().includes(q),
    );
  }, [mappings, search]);

  const resetForm = () => {
    setTiktokSku("");
    setErpSku("");
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    const tSku = tiktokSku.trim().toUpperCase();
    const eSku = erpSku.trim().toUpperCase();

    if (!tSku || !eSku) {
      setFormError("กรุณากรอก SKU ฝั่ง TikTok และ ERP");
      return;
    }
    if (
      mappings.some(
        (m: SKUMapping) =>
          m.tiktokSku.toUpperCase() === tSku && m.erpSku.toUpperCase() === eSku,
      )
    ) {
      setFormError("มีการ map คู่นี้อยู่แล้ว");
      return;
    }

    try {
      await saveMapping({ tiktokSku: tSku, erpSku: eSku });
      resetForm();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    }
  };

  const close = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        role="dialog"
        aria-modal="true"
        aria-label="TikTok SKU Mapping"
        onClose={() => close(false)}
        className="max-h-[85vh] max-w-xl overflow-auto"
      >
        <DialogTitle className="text-left font-semibold text-base">
          จับคู่ SKU: TikTok ↔ ERP
        </DialogTitle>
        <p className="text-xs text-muted-foreground mt-1">
          ระบบจะใช้การจับคู่นี้ในการตัดสต็อก ERP เมื่อมีคำสั่งซื้อจาก TikTok Shop
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tiktok-sku" className="text-xs">
                SKU ฝั่ง TikTok
              </Label>
              <Input
                id="tiktok-sku"
                className="mt-1 text-xs"
                value={tiktokSku}
                onChange={(e) => {
                  setTiktokSku(e.target.value);
                  setFormError(null);
                }}
                placeholder="เช่น TT-SHIRT-01"
                required
              />
            </div>
            <div>
              <Label htmlFor="erp-sku" className="text-xs">
                SKU ฝั่ง ERP
              </Label>
              <Input
                id="erp-sku"
                className="mt-1 text-xs"
                value={erpSku}
                onChange={(e) => {
                  setErpSku(e.target.value);
                  setFormError(null);
                }}
                placeholder="เช่น SHIRT-01"
                required
              />
            </div>
          </div>

          {formError && (
            <p role="alert" className="text-xs text-rose-600">
              {formError}
            </p>
          )}
          {saveError && (
            <p role="alert" className="text-xs text-rose-600">
              {saveError}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="mr-1.5 h-3.5 w-3.5" />
              )}
              เพิ่มการจับคู่
            </Button>
          </div>
        </form>

        <div className="mt-4 border-t pt-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold">การจับคู่ทั้งหมด</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              title="รีเฟรช"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Input
            type="search"
            className="mt-2 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา SKU..."
          />

          <div className="mt-2 max-h-60 overflow-auto rounded-lg border">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 p-4 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                กำลังโหลด…
              </div>
            ) : filtered.length === 0 ? (
              <p className="p-4 text-center text-xs text-muted-foreground">
                ยังไม่มีการจับคู่
              </p>
            ) : (
              <ul className="divide-y">
                {filtered.map((m: SKUMapping) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold">{m.tiktokSku}</span>
                      <span className="mx-1.5 text-muted-foreground">→</span>
                      <span className="font-medium">{m.erpSku}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
