"use client";

import React, { useState, useEffect, useRef } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, X, Image as ImageIcon } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { formulaApi } from "../api/formulaApi";
import { skuApi } from "@/features/sku/api/skuApi";
import type { SKU } from "@/features/sku/types/sku";
import type { InventoryFormula } from "../types/formula";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: InventoryFormula | null;
  onSaved: () => void;
}

interface FormItem {
  componentSku: string;
  qty: number;
}

export function FormulaFormModal({
  open,
  onOpenChange,
  initialData,
  onSaved,
}: Props) {
  const isEditing = Boolean(initialData);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [items, setItems] = useState<FormItem[]>([
    { componentSku: "", qty: 1 },
  ]);
  const [skuList, setSkuList] = useState<SKU[]>([]);
  const [isLoadingSKUs, setIsLoadingSKUs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load available SKUs from SKU Master
  useEffect(() => {
    if (open) {
      setIsLoadingSKUs(true);
      skuApi
        .getSKUs({ limit: 1000 })
        .then((res) => {
          setSkuList(res.data || []);
        })
        .catch((err) => {
          console.error("Failed to load SKUs:", err);
        })
        .finally(() => {
          setIsLoadingSKUs(false);
        });
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setCode(initialData.code || "");
        setName(initialData.name || "");
        setDescription(initialData.description || "");
        setImage(initialData.image || "");
        setPreviewUrl(initialData.image || "");
        setSelectedFile(null);
        setItems(
          initialData.items && initialData.items.length > 0
            ? initialData.items.map((it) => ({
                componentSku: it.componentSku,
                qty: it.qty,
              }))
            : [{ componentSku: "", qty: 1 }],
        );
      } else {
        setCode("");
        setName("");
        setDescription("");
        setImage("");
        setPreviewUrl("");
        setSelectedFile(null);
        setItems([{ componentSku: "", qty: 1 }]);
      }
      setErrorMessage("");
    }
  }, [open, initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("ขนาดไฟล์ต้องไม่เกิน 5 MB");
      return;
    }

    setSelectedFile(file);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setErrorMessage("");
  };

  const handleRemoveImage = () => {
    setImage("");
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { componentSku: "", qty: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof FormItem,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    if (!code.trim()) {
      setErrorMessage("กรุณาระบุรหัส Inventory (Inventory Code)");
      return;
    }
    if (!name.trim()) {
      setErrorMessage("กรุณาระบุชื่อชุด Inventory");
      return;
    }

    const cleanItems = items
      .filter((it) => it.componentSku.trim().length > 0)
      .map((it) => ({
        componentSku: it.componentSku.trim().toUpperCase(),
        qty: Number(it.qty) || 1,
      }));

    if (cleanItems.length === 0) {
      setErrorMessage("กรุณาเลือกวัตถุดิบอย่างน้อย 1 รายการ");
      return;
    }

    // Check for self-reference
    if (
      cleanItems.some(
        (it) => it.componentSku.toUpperCase() === code.trim().toUpperCase(),
      )
    ) {
      setErrorMessage("รหัสวัตถุดิบต้องไม่ซ้ำกับรหัส Inventory (ห้ามตัดสต็อกตัวเอง)");
      return;
    }

    try {
      setIsSubmitting(true);
      let finalImageUrl = image;

      if (selectedFile) {
        setIsUploading(true);
        try {
          finalImageUrl = await skuApi.uploadImage(selectedFile);
        } catch (uploadErr) {
          setIsUploading(false);
          throw new Error(
            uploadErr instanceof Error
              ? uploadErr.message
              : "อัปโหลดรูปภาพไม่สำเร็จ",
          );
        }
        setIsUploading(false);
      }

      if (isEditing && initialData) {
        await formulaApi.updateFormula(initialData.code, {
          name: name.trim(),
          description: description.trim(),
          image: finalImageUrl || "",
          items: cleanItems,
        });
      } else {
        await formulaApi.createFormula({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim(),
          image: finalImageUrl || "",
          items: cleanItems,
        });
      }
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: { message?: string } } } })
              .response?.data?.error?.message
          : err instanceof Error
            ? err.message
            : "บันทึกข้อมูล Inventory ไม่สำเร็จ";
      setErrorMessage(msg || "บันทึกข้อมูล Inventory ไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? `แก้ไข Inventory: ${code}` : "เพิ่มชุดสินค้า Inventory"}
      description="กำหนดรหัส Inventory และเลือก SKU วัตถุดิบที่จะถูกตัดสต็อกอัตโนมัติเมื่อคำสั่งซื้อถูกจัดส่ง"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        {errorMessage && (
          <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Image Upload Section */}
        <div className="space-y-1.5">
          <span className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
            รูปภาพชุดสินค้า (PNG, JPG, WebP ไม่เกิน 5 MB)
          </span>

          {previewUrl ? (
            <div className="relative inline-block border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 p-1">
              <div className="relative h-28 w-28 flex items-center justify-center">
                <img
                  src={getImageUrl(previewUrl)}
                  alt="Formula preview"
                  className="h-full w-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow hover:bg-rose-700 transition-colors"
                  title="ลบรูปภาพ"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-neutral-500 text-center truncate max-w-[112px] mt-1 px-1">
                {selectedFile ? "รอการบันทึก" : "รูปภาพปัจจุบัน"}
              </p>
            </div>
          ) : (
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${
                isUploading
                  ? "border-neutral-300 bg-neutral-100 cursor-not-allowed dark:border-neutral-700 dark:bg-neutral-800"
                  : "border-neutral-300 hover:border-neutral-400 bg-neutral-50/50 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
              }`}
            >
              {isUploading ? (
                <Loader2 className="h-6 w-6 text-neutral-400 animate-spin mb-1" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 mb-1.5 dark:bg-neutral-700 dark:text-neutral-300">
                  <ImageIcon className="h-4 w-4" />
                </div>
              )}
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {isUploading ? "กำลังอัปโหลดรูปภาพ..." : "คลิกเพื่อเลือกไฟล์รูปภาพชุดสินค้า"}
              </span>
              <span className="text-[11px] text-neutral-400">
                PNG, JPG หรือ WebP ไม่เกิน 5MB
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block text-xs font-medium">
            รหัส Inventory (Inventory Code)
            <Input
              className="mt-1 font-mono uppercase"
              placeholder="เช่น SET-A หรือ INV-01"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={isEditing}
              required
            />
            {isEditing && (
              <span className="text-[11px] text-neutral-400">
                รหัส Inventory ไม่สามารถแก้ไขได้หลังสร้าง
              </span>
            )}
          </label>

          <label className="block text-xs font-medium">
            ชื่อชุด Inventory
            <Input
              className="mt-1"
              placeholder="เช่น ชุดทำความสะอาดพร้อมใช้งาน"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
        </div>

        <label className="block text-xs font-medium">
          คำอธิบายเพิ่มเติม (Optional)
          <Input
            className="mt-1"
            placeholder="หมายเหตุ หรือรายละเอียดสูตร"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        {/* Components Table */}
        <div className="space-y-2 border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 dark:border-neutral-800 dark:bg-neutral-900/40">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                🧩 รายการวัตถุดิบ (SKU วัตถุดิบ)
              </span>
              <span className="text-[11px] text-slate-500">
                เลือก SKU จากรายการสินค้าในระบบเพื่อเป็นส่วนประกอบ
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2.5 gap-1"
              onClick={handleAddItem}
            >
              <Plus className="h-3.5 w-3.5" />
              เพิ่มวัตถุดิบ
            </Button>
          </div>

          <div className="space-y-2 pt-2">
            {isLoadingSKUs ? (
              <div className="flex items-center justify-center p-6 text-xs text-neutral-400">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                กำลังโหลดรายการ SKU สินค้า...
              </div>
            ) : (
              items.map((it, idx) => {
                const selectedSKU = skuList.find(
                  (s) => s.sku.toUpperCase() === it.componentSku.toUpperCase(),
                );
                return (
                  <div key={idx} className="flex flex-col gap-1 border-b border-neutral-100 dark:border-neutral-800 pb-2 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <div className="flex-[3]">
                        <div className="relative">
                          <select
                            value={it.componentSku}
                            onChange={(e) =>
                              handleItemChange(idx, "componentSku", e.target.value)
                            }
                            className="flex h-8 w-full rounded-md border border-input bg-white dark:bg-neutral-800 px-2.5 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
                          >
                            <option value="">-- เลือก SKU วัตถุดิบ --</option>
                            {skuList.map((s) => (
                              <option key={s.id || s.sku} value={s.sku}>
                                {s.sku} — {s.name} (สต็อก: {s.availableStock ?? s.stockQuantity ?? 0})
                              </option>
                            ))}
                            {/* Fallback option if componentSku is not in current skuList */}
                            {it.componentSku &&
                              !skuList.some(
                                (s) =>
                                  s.sku.toUpperCase() === it.componentSku.toUpperCase(),
                              ) && (
                                <option value={it.componentSku}>
                                  {it.componentSku} (กำหนดไว้เดิม)
                                </option>
                              )}
                          </select>
                        </div>
                      </div>
                      <div className="w-28">
                        <Input
                          type="number"
                          min="1"
                          placeholder="จำนวน"
                          className="h-8 text-xs text-right font-mono"
                          value={it.qty}
                          onChange={(e) =>
                            handleItemChange(
                              idx,
                              "qty",
                              Math.max(1, parseInt(e.target.value, 10) || 1),
                            )
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={items.length <= 1}
                        className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => handleRemoveItem(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {selectedSKU && (
                      <div className="flex items-center gap-2 pl-1 text-[11px] text-neutral-500">
                        <span className="truncate max-w-[280px]">
                          📦 {selectedSKU.name}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          พร้อมใช้: {selectedSKU.availableStock ?? selectedSKU.stockQuantity ?? 0} ชิ้น
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </FormDialog>
  );
}
