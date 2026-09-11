"use client";
import { useState, useEffect, useRef } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ItemLines, type ItemLine } from "@/features/erp/components/ItemLines";
import { skuApi } from "../api/skuApi";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import type { CreateSKUDTO, UpdateSKUDTO, SKU } from "../types/sku";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSKUDTO | UpdateSKUDTO) => Promise<unknown>;
  isSubmitting?: boolean;
  initialData?: SKU | null;
}

export function SKUForm(props: Props) {
  const isEditing = Boolean(props.initialData);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("0");
  const [bundle, setBundle] = useState(false);
  const [image, setImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [lines, setLines] = useState<ItemLine[]>([
    { sku: "", quantity: 1, price: 0 },
  ]);

  const [isLoadingComponents, setIsLoadingComponents] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setSku("");
    setName("");
    setPrice("");
    setCost("0");
    setBundle(false);
    setImage("");
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setUploadError("");
    setIsUploading(false);
    setIsLoadingComponents(false);
    setLines([{ sku: "", quantity: 1, price: 0 }]);
  };

  // Clear the native file input when the form resets (DOM sync in effect is
  // allowed; refs must not be touched during render).
  useEffect(() => {
    if (!props.open && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [props.open]);

  // When editing a bundle SKU, fetch components from API if not already present
  useEffect(() => {
    let active = true;
    if (props.open && props.initialData && props.initialData.isBundle && props.initialData.sku) {
      const initialSku = props.initialData.sku;
      if (!props.initialData.bundleItems || props.initialData.bundleItems.length === 0) {
        setIsLoadingComponents(true);
        skuApi
          .getBundleComponents(initialSku)
          .then((comps) => {
            if (!active) return;
            if (comps && comps.length > 0) {
              setLines(
                comps.map((c) => ({
                  sku: c.componentSku,
                  quantity: c.qty,
                  price: 0,
                })),
              );
            }
          })
          .catch((err) => {
            console.error("Failed to load bundle components:", err);
          })
          .finally(() => {
            if (active) setIsLoadingComponents(false);
          });
      }
    }
    return () => {
      active = false;
    };
  }, [props.open, props.initialData?.id, props.initialData?.sku, props.initialData?.isBundle]);

  // Sync form fields with `open`/`initialData`: adjust state during render
  // (React docs pattern) instead of setState-in-effect.
  const formSignature = `${props.open}-${props.initialData?.id ?? "new"}-${props.initialData?.sku ?? ""}`;
  const [prevSignature, setPrevSignature] = useState(formSignature);
  if (prevSignature !== formSignature) {
    setPrevSignature(formSignature);
    if (props.open && props.initialData) {
      const d = props.initialData;
      setSku(d.sku || "");
      setName(d.name || "");
      setPrice(String(d.price ?? ""));
      setCost(String(d.cost ?? "0"));
      setBundle(Boolean(d.isBundle));
      setImage(d.image || "");
      setSelectedFile(null);
      setPreviewUrl(d.image || "");
      setUploadError("");
      if (d.bundleItems && d.bundleItems.length > 0) {
        setLines(
          d.bundleItems.map((b) => ({
            sku: b.componentSku,
            quantity: b.quantity,
            price: 0,
          })),
        );
      } else {
        setLines([{ sku: "", quantity: 1, price: 0 }]);
      }
    } else {
      resetForm();
    }
  }

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
    // Create local object URL for instant preview without uploading yet
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

  return (
    <FormDialog
      {...props}
      title={isEditing ? `แก้ไขข้อมูล SKU: ${props.initialData?.sku}` : "เพิ่ม SKU / Bundle"}
      description={
        isEditing
          ? "แก้ไขข้อมูลสินค้า รายละเอียด และรูปภาพของ SKU"
          : "บันทึกผ่าน ERP API เดิม ระบบจะตรวจสอบและคำนวณรายการให้"
      }
      isSubmitting={props.isSubmitting || isUploading}
      onSubmit={async () => {
        let finalImageUrl = image;

        // Only upload the image file to the API when the user actually submits the form!
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

        await props.onSubmit({
          sku,
          name,
          price: Number(price),
          cost: Number(cost),
          category: bundle ? "Bundle" : "Finished Product",
          isBundle: bundle,
          image: finalImageUrl || "",
          bundleItems: bundle
            ? lines.map((l) => ({ componentSku: l.sku, quantity: l.quantity }))
            : undefined,
        });
        resetForm();
      }}
    >
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
                  ? "bg-neutral-50 border-neutral-300 cursor-not-allowed dark:bg-neutral-800/50"
                  : "border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50/50 dark:border-neutral-700 dark:hover:bg-neutral-800/30"
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 py-1">
                  <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
                  <span className="text-xs text-neutral-500 font-medium">
                    กำลังอัปโหลดรูปภาพ…
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 py-1 text-center">
                  <div className="rounded-full bg-neutral-100 p-2 text-neutral-500 dark:bg-neutral-800">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-300">
                    <span className="font-semibold text-primary">คลิกเพื่อเลือกไฟล์รูปภาพ</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    PNG หรือ JPG ไม่เกิน 5MB
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              onChange={handleImageFileChange}
              disabled={isUploading}
            />
          </div>
        )}

        {uploadError && (
          <p className="text-xs text-rose-500 font-medium mt-1">
            ⚠️ {uploadError}
          </p>
        )}
      </div>

      <label className="block text-xs font-medium">
        SKU
        <Input
          className="mt-2"
          type="text"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          disabled={isEditing}
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
      <label className="flex gap-2 text-sm">
        <input
          type="checkbox"
          checked={bundle}
          onChange={(e) => setBundle(e.target.checked)}
        />
        เป็นชุดสินค้า Bundle
      </label>
      {bundle && (
        isLoadingComponents ? (
          <div className="flex items-center justify-center p-6 border border-dashed rounded-xl bg-neutral-50/50 dark:bg-neutral-800/30">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400 mr-2" />
            <span className="text-xs text-neutral-500">กำลังโหลดรายการส่วนประกอบ...</span>
          </div>
        ) : (
          <ItemLines value={lines} onChange={setLines} prices={false} />
        )
      )}
      <p className="text-xs text-neutral-500">
        การรับสต็อกให้ทำผ่านหน้ารับสินค้า
      </p>
    </FormDialog>
  );
}
