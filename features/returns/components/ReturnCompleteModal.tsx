"use client";

import React, { useState, useEffect } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Select } from "@/components/ui/select";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { uploadEvidenceImage } from "../api/returnApi";
import type {
  SalesReturn,
  CompleteReturnDTO,
  ItemCondition,
} from "../types/return";

/** สภาพที่นำกลับเข้าสต็อกพร้อมขายได้: สภาพดี หรือ ส่งผิด (ตัวสินค้าสมบูรณ์) */
const isRestockable = (condition: ItemCondition) =>
  condition === "GOOD" || condition === "WRONG_ITEM";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnDoc: SalesReturn | null;
  onComplete: (dto: CompleteReturnDTO) => Promise<unknown>;
}

export function ReturnCompleteModal({
  open,
  onOpenChange,
  returnDoc,
  onComplete,
}: Props) {
  const [lines, setLines] = useState<
    Array<{
      line_id: number;
      sku: string;
      name: string;
      quantity: number;
      condition: ItemCondition;
      restock: boolean;
      /** รูปยืนยันที่แนบมากับใบคืนตั้งแต่ตอนสร้าง */
      evidenceImages: string[];
      /** รูปเพิ่มเติมที่คลังถ่าย/แนบตอนตรวจรับ (ส่งเป็น add_evidence_images) */
      newImages: string[];
      uploading: boolean;
    }>
  >([]);

  useEffect(() => {
    if (returnDoc && returnDoc.lines) {
      setLines(
        returnDoc.lines.map((l) => ({
          line_id: l.id || 0,
          sku: l.sku,
          name: l.name,
          quantity: l.quantity,
          condition: l.condition || "GOOD",
          restock: l.restock ?? isRestockable(l.condition || "GOOD"),
          evidenceImages: l.evidence_images ?? [],
          newImages: [],
          uploading: false,
        })),
      );
    }
  }, [returnDoc]);

  const updateLine = (index: number, patch: Partial<(typeof lines)[0]>) => {
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const next = { ...l, ...patch };
        // เข้าสต็อก/ไม่เข้าสต็อก ถูกกำหนดจากสภาพสินค้าโดยอัตโนมัติ
        next.restock = isRestockable(next.condition);
        return next;
      }),
    );
  };

  const handleFileSelect = async (index: number, file: File) => {
    if (!"image/png,image/jpeg".split(",").includes(file.type)) {
      alert("อนุญาตเฉพาะรูปภาพประเภท PNG หรือ JPG เท่านั้น");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("ขนาดไฟล์รูปภาพเกินกำหนด (ต้องไม่เกิน 5 MB)");
      return;
    }
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, uploading: true } : l)),
    );
    try {
      const url = await uploadEvidenceImage(file);
      setLines((prev) =>
        prev.map((l, i) =>
          i === index ? { ...l, uploading: false, newImages: [...l.newImages, url] } : l,
        ),
      );
    } catch (err) {
      setLines((prev) =>
        prev.map((l, i) => (i === index ? { ...l, uploading: false } : l)),
      );
      alert(err instanceof Error ? err.message : "อัปโหลดรูปภาพไม่สำเร็จ");
    }
  };

  const removeNewImage = (index: number, url: string) => {
    setLines((prev) =>
      prev.map((l, i) =>
        i === index ? { ...l, newImages: l.newImages.filter((x) => x !== url) } : l,
      ),
    );
  };

  const handleSubmit = async () => {
    for (const l of lines) {
      // สภาพเสียหาย/หมดอายุ ต้องมีรูปยืนยัน (รูปเดิม + รูปที่เพิ่มตอนตรวจรับ)
      if (!isRestockable(l.condition) && l.evidenceImages.length + l.newImages.length === 0) {
        throw new Error(
          `สินค้า ${l.sku} มีสภาพเสียหาย/หมดอายุ กรุณาแนบรูปถ่ายยืนยันอย่างน้อย 1 รูป`,
        );
      }
    }
    await onComplete({
      lines: lines.map((l) => ({
        line_id: l.line_id,
        condition: l.condition,
        restock: l.restock,
        add_evidence_images:
          l.newImages.length > 0 ? l.newImages : undefined,
      })),
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`ยืนยันการตรวจรับสินค้า: ${returnDoc?.return_no || ""}`}
      description="คลังสินค้าตรวจสอบสภาพสินค้าจริงก่อนรับเข้าคลัง สินค้าสภาพดีจะเพิ่มยอดคงเหลือในระบบทันที"
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          {lines.map((line, idx) => (
            <div
              key={line.line_id || idx}
              className="rounded-lg border border-neutral-200 bg-white p-3 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-neutral-900">{line.sku}</span>
                  <span className="text-neutral-500 ml-2">{line.name}</span>
                </div>
                <span className="font-bold text-neutral-900">
                  รับคืน: {line.quantity} ชิ้น
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] font-semibold text-neutral-600 block mb-1">
                    ผลการตรวจสภาพ
                  </span>
                  <Select
                    className="h-8 text-xs bg-white"
                    value={line.condition}
                    onChange={(e) =>
                      updateLine(idx, {
                        condition: e.target.value as ItemCondition,
                      })
                    }
                  >
                    <option value="GOOD">สภาพดี (GOOD)</option>
                    <option value="DAMAGED">ชำรุด / เสียหาย (DAMAGED)</option>
                    <option value="EXPIRED">หมดอายุ (EXPIRED)</option>
                    <option value="WRONG_ITEM">สินค้าส่งผิด (WRONG_ITEM)</option>
                  </Select>
                </div>

                <div className="flex flex-col justify-end">
                  <div
                    className={`text-xs font-medium h-8 flex items-center ${
                      line.restock ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {line.restock
                      ? "✓ นำกลับเข้าสต็อกพร้อมขาย (Restock)"
                      : "✕ ไม่นำกลับเข้าสต็อก — สินค้าไม่สมบูรณ์"}
                  </div>
                </div>
              </div>

              {/* รูปยืนยันสภาพสินค้า: รูปที่แนบมา + เพิ่มเติมตอนตรวจรับ */}
              <div className="pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-neutral-600">
                    รูปยืนยันสภาพสินค้า
                    {!isRestockable(line.condition) &&
                      line.evidenceImages.length + line.newImages.length === 0 && (
                        <span className="text-rose-500"> * ต้องแนบอย่างน้อย 1 รูป</span>
                      )}
                  </span>
                  <label
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border cursor-pointer transition-colors ${
                      line.uploading
                        ? "opacity-50 cursor-not-allowed border-neutral-200 text-neutral-400"
                        : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {line.uploading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <ImagePlus className="h-3 w-3" />
                    )}
                    {line.uploading ? "กำลังอัปโหลด..." : "เพิ่มรูป"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      disabled={line.uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) void handleFileSelect(idx, file);
                      }}
                    />
                  </label>
                </div>

                {(line.evidenceImages.length > 0 || line.newImages.length > 0) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {line.evidenceImages.map((url) => (
                      <div
                        key={url}
                        className="w-14 h-14 rounded-md overflow-hidden border border-neutral-200"
                        title="แนบมากับใบคืน"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(url)}
                          alt="หลักฐานสภาพสินค้า"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {line.newImages.map((url) => (
                      <div
                        key={url}
                        className="relative w-14 h-14 rounded-md overflow-hidden border border-emerald-300 ring-1 ring-emerald-200 group"
                        title="เพิ่มใหม่ตอนตรวจรับ"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(url)}
                          alt="หลักฐานเพิ่มเติม"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          aria-label="ลบรูป"
                          className="absolute top-0 right-0 bg-black/60 text-white rounded-bl-md p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeNewImage(idx, url)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </FormDialog>
  );
}
