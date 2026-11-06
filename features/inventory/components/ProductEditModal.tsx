"use client";

import { useState, useEffect, useRef } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { skuApi } from "@/features/sku/api/skuApi";
import type { InventoryStock } from "../types/inventory";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: InventoryStock | null;
  onSuccess: () => void;
}

export function ProductEditModal({ open, onOpenChange, stock, onSuccess }: Props) {
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("0");
  const [image, setImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load product details when opening modal
  useEffect(() => {
    let active = true;
    if (open && stock) {
      setSku(stock.sku);
      setName(stock.productName);
      setImage(stock.image || "");
      setPreviewUrl(stock.image || "");
      setSelectedFile(null);
      setUploadError("");
      setIsLoadingDetails(true);

      skuApi
        .getSKUById(stock.sku)
        .then((res) => {
          if (!active) return;
          if (res.data) {
            setSku(res.data.sku || stock.sku);
            setName(res.data.name || stock.productName);
            setPrice(String(res.data.price ?? ""));
            setCost(String(res.data.cost ?? "0"));
            if (res.data.image) {
              setImage(res.data.image);
              setPreviewUrl(res.data.image);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to fetch product details:", err);
        })
        .finally(() => {
          if (active) setIsLoadingDetails(false);
        });
    } else if (!open) {
      setSku("");
      setName("");
      setPrice("");
      setCost("0");
      setImage("");
      setSelectedFile(null);
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
      setUploadError("");
      setIsUploading(false);
      setIsSaving(false);
      setIsLoadingDetails(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }

    return () => {
      active = false;
    };
  }, [open, stock]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size <= 5MB
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError("ขนาดไฟล์เกินกำหนด (ต้องไม่เกิน 5 MB)");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate type PNG or JPG/JPEG
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setUploadError("อนุญาตเฉพาะรูปภาพประเภท PNG หรือ JPG เท่านั้น");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadError("");
    setSelectedFile(file);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
  };

  const handleRemoveImage = () => {
    setImage("");
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!stock) return;
    setIsSaving(true);
    let finalImageUrl = image;

    try {
      if (selectedFile) {
        setIsUploading(true);
        try {
          finalImageUrl = await skuApi.uploadImage(selectedFile);
        } catch (err) {
          setIsUploading(false);
          throw new Error(
            err instanceof Error ? err.message : "อัปโหลดรูปภาพไม่สำเร็จ",
          );
        }
        setIsUploading(false);
      }

      await skuApi.updateSKU(stock.sku, {
        sku,
        name,
        price: Number(price) || 0,
        cost: Number(cost) || 0,
        image: finalImageUrl || "",
        category: stock.category || "Finished Product",
      });

      onOpenChange(false);
      onSuccess();
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`แก้ไขข้อมูลสินค้า: ${stock?.sku ?? ""}`}
      description="แก้ไขรหัสสินค้า, ชื่อสินค้า, ราคา, ต้นทุน และรูปภาพสินค้า"
      isSubmitting={isSaving || isUploading || isLoadingDetails}
      onSubmit={handleSubmit}
    >
      {isLoadingDetails ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400 mr-2" />
          <span className="text-sm text-neutral-500">กำลังโหลดข้อมูลสินค้า...</span>
        </div>
      ) : (
        <>
          {/* Product Image Upload Section */}
          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
              รูปภาพสินค้า (PNG หรือ JPG ขนาดไม่เกิน 5 MB)
            </span>

            {previewUrl ? (
              <div className="relative inline-block border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 p-1">
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <img
                    src={getImageUrl(previewUrl)}
                    alt="Product preview"
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
              <div className="flex flex-col gap-2">
                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${
                    isUploading
                      ? "border-neutral-300 bg-neutral-100 cursor-not-allowed dark:border-neutral-700 dark:bg-neutral-800"
                      : "border-neutral-300 hover:border-neutral-400 bg-neutral-50/50 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
                  }`}
                >
                  {isUploading ? (
                    <Loader2 className="h-7 w-7 text-neutral-400 animate-spin mb-1.5" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 mb-1.5 dark:bg-neutral-700 dark:text-neutral-300">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    {isUploading ? "กำลังอัปโหลดรูปภาพ..." : "คลิกเพื่อเลือกไฟล์รูปภาพ"}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    PNG หรือ JPG ไม่เกิน 5MB
                  </span>
                </div>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              disabled={isUploading}
              onChange={handleImageFileChange}
            />

            {uploadError && (
              <p className="text-xs text-rose-500 mt-1">
                ⚠️ {uploadError}
              </p>
            )}
          </div>

          <label className="block text-xs font-medium">
            SKU <span className="text-neutral-400 font-normal">(แก้ไขรหัสได้)</span>
            <Input
              className="mt-2"
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              required
            />
          </label>
          <label className="block text-xs font-medium">
            ชื่อสินค้า
            <Input
              className="mt-2"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="block text-xs font-medium">
            ราคาขาย (บาท)
            <Input
              className="mt-2"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
          </label>
          <label className="block text-xs font-medium">
            ต้นทุน (บาท)
            <Input
              className="mt-2"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </label>
        </>
      )}
    </FormDialog>
  );
}
