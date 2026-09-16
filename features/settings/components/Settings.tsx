"use client";
import { useState } from "react";
import { useSettings } from "../hooks/useSettings";
import type { Company } from "../api/settingsApi";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { useAuthStore } from "@/stores/authStore";
import { useRef } from "react";
import { settingsApi } from "../api/settingsApi";
import { getImageUrl } from "@/lib/utils";
import { Upload, X } from "lucide-react";

export function Settings() {
  const { query, mutation } = useSettings();
  const [draft, setDraft] = useState<Company | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role === "owner";
  const company = draft || query.data?.company;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company) return;
    try {
      setIsUploading(true);
      setUploadError("");
      const url = await settingsApi.uploadLogo(file);
      setDraft({ ...company, logoUrl: url });
      mutation.reset();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "อัปโหลดโลโก้ไม่สำเร็จ");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = () => {
    if (!company) return;
    setDraft({ ...company, logoUrl: "" });
    mutation.reset();
  };
  return (
    <PageContainer>
      <PageHeader
        title="ตั้งค่าบริษัท"
        description="ข้อมูลบริษัทชุดเดียวกับระบบ ERP เดิม · แก้ไขได้เฉพาะ Owner"
      />
      {query.isPending ? (
        <Loading />
      ) : query.isError ? (
        <ErrorState
          message={query.error.message}
          onRetry={() => query.refetch()}
        />
      ) : (
        company && (
          <form
            className="max-w-3xl border rounded-xl bg-white p-6 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate(company, { onSuccess: () => setDraft(null) });
            }}
          >
            {/* Company Logo Section */}
            <div className="space-y-2 border-b pb-4">
              <span className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                โลโก้บริษัทสำหรับเอกสาร PDF (Quotation, Sales Order, Invoice)
              </span>
              <div className="flex items-center gap-4">
                {company.logoUrl ? (
                  <div className="relative inline-block border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 p-1">
                    <div className="relative h-20 w-20 flex items-center justify-center">
                      <img
                        src={getImageUrl(company.logoUrl)}
                        alt="Company Logo"
                        className="h-full w-full object-contain rounded-md"
                      />
                      {canEdit && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow hover:bg-rose-700 transition-colors"
                          title="ลบโลโก้"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-20 w-20 border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center text-neutral-400 bg-neutral-50 text-xs">
                    <span>ไม่มีโลโก้</span>
                  </div>
                )}

                {canEdit && (
                  <div className="space-y-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="company-logo-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-1.5" />
                      {isUploading ? "กำลังอัปโหลด…" : company.logoUrl ? "เปลี่ยนรูปโลโก้" : "อัปโหลดโลโก้"}
                    </Button>
                    <p className="text-[11px] text-neutral-500">
                      รองรับ PNG, JPG ขนาดไม่เกิน 5 MB
                    </p>
                    {uploadError && (
                      <p className="text-xs text-rose-500">{uploadError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <fieldset
              disabled={!canEdit || mutation.isPending}
              className="grid sm:grid-cols-2 gap-5"
            >
              {(
                [
                  ["name", "ชื่อบริษัท"],
                  ["taxId", "เลขประจำตัวผู้เสียภาษี"],
                  ["address", "ที่อยู่"],
                  ["phone", "โทรศัพท์"],
                  ["email", "อีเมล"],
                  ["website", "เว็บไซต์"],
                  ["currency", "สกุลเงิน"],
                  ["vatRate", "VAT (%)"],
                  ["invoicePrefix", "คำนำหน้า Invoice"],
                  ["soPrefix", "คำนำหน้า SO"],
                  ["defaultReorderPoint", "จุดสั่งซื้อซ้ำเริ่มต้น (Reorder Point)"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="text-xs">
                  {label}
                  <Input
                    className="mt-2"
                    type={key === "vatRate" ? "number" : "text"}
                    value={company[key]}
                    onChange={(e) => {
                      mutation.reset();
                      setDraft({
                        ...company,
                        [key]:
                          key === "vatRate"
                            ? Number(e.target.value)
                            : e.target.value,
                      });
                    }}
                    required={key === "name"}
                  />
                </label>
              ))}
            </fieldset>
            {mutation.error && (
              <p role="alert" className="text-sm">
                {mutation.error.message}
              </p>
            )}
            {mutation.isSuccess && (
              <p role="status" className="text-sm">
                บันทึกข้อมูลบริษัทสำเร็จ
              </p>
            )}
            <Button disabled={!canEdit || mutation.isPending}>
              {mutation.isPending ? "กำลังบันทึก…" : "บันทึกการตั้งค่า"}
            </Button>
          </form>
        )
      )}
    </PageContainer>
  );
}
