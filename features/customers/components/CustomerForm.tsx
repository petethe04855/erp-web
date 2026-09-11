"use client";

import { useState, useRef, useEffect } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, Building2 } from "lucide-react";
import { customerApi } from "../api/customerApi";
import { getImageUrl } from "@/lib/utils";
import type { CreateCustomerDTO } from "../types/customer";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCustomerDTO) => Promise<unknown>;
  isSubmitting?: boolean;
}

export function CustomerForm(props: Props) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tax, setTax] = useState("");
  const [address, setAddress] = useState("");

  // Logo / Image Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!props.open) {
      setName("");
      setContact("");
      setEmail("");
      setPhone("");
      setTax("");
      setAddress("");
      setSelectedFile(null);
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
      setUploadError("");
      setIsUploading(false);
    }
  }, [props.open]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("ขนาดไฟล์เกินกำหนด (ต้องไม่เกิน 5 MB)");
      return;
    }

    // Validate type
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setUploadError("อนุญาตเฉพาะรูปภาพประเภท PNG หรือ JPG เท่านั้น");
      return;
    }

    setUploadError("");
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    const localUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(localUrl);
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    let finalLogoUrl = "";

    if (selectedFile) {
      try {
        setIsUploading(true);
        setUploadError("");
        finalLogoUrl = await customerApi.uploadImage(selectedFile);
      } catch (err) {
        setUploadError(
          err instanceof Error ? err.message : "อัปโหลดรูปภาพไม่สำเร็จ"
        );
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    await props.onSubmit({
      name,
      contactPerson: contact,
      email,
      phone,
      taxId: tax,
      address,
      logo: finalLogoUrl,
    });
  };

  return (
    <FormDialog
      {...props}
      title="เพิ่มลูกค้า"
      description="บันทึกข้อมูลลูกค้าและรูปบริษัท ระบบจะตรวจสอบและจัดเก็บให้อัตโนมัติ"
      isSubmitting={props.isSubmitting || isUploading}
      onSubmit={handleSubmit}
    >
      {/* Company Logo Upload */}
      <div className="space-y-1.5">
        <span className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
          รูปบริษัท / โลโก้ลูกค้า (PNG หรือ JPG ไม่เกิน 5 MB)
        </span>

        {previewUrl ? (
          <div className="relative inline-block border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 p-1">
            <div className="relative h-24 w-24 flex items-center justify-center">
              <img
                src={getImageUrl(previewUrl)}
                alt="Company Logo Preview"
                className="h-full w-full object-contain rounded-md"
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
            <p className="text-[10px] text-neutral-500 text-center truncate max-w-[96px] mt-1 px-1">
              {selectedFile ? "รอการบันทึก" : "โลโก้บริษัท"}
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
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-300">
                    <span className="font-semibold text-primary">
                      คลิกเพื่อเลือกไฟล์รูปบริษัท / โลโก้
                    </span>
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
        ชื่อลูกค้า / บริษัท
        <Input
          className="mt-2"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label className="block text-xs font-medium">
        ผู้ติดต่อ
        <Input
          className="mt-2"
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
      </label>
      <label className="block text-xs font-medium">
        อีเมล
        <Input
          className="mt-2"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="block text-xs font-medium">
        โทรศัพท์
        <Input
          className="mt-2"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>
      <label className="block text-xs font-medium">
        เลขประจำตัวผู้เสียภาษี
        <Input
          className="mt-2"
          type="text"
          value={tax}
          onChange={(e) => setTax(e.target.value)}
          pattern="[0-9]{13}"
          maxLength={13}
        />
      </label>
      <label className="block text-xs font-medium">
        ที่อยู่
        <Input
          className="mt-2"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="ที่อยู่สำนักงานใหญ่ หรือสถานที่จัดส่ง"
        />
      </label>
    </FormDialog>
  );
}
