"use client";
import React from "react";
import { ProductCategory } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { CreateProductInput } from "@/lib/store/erpWorkflow";

interface SkuFormModalProps {
  modalMode: "add" | "edit";
  selectedSku?: string;
  form: CreateProductInput;
  setForm: React.Dispatch<React.SetStateAction<CreateProductInput>>;
  error: string;
  onClose: () => void;
  onSave: () => void;
}

export default function SkuFormModal({
  modalMode,
  selectedSku,
  form,
  setForm,
  error,
  onClose,
  onSave,
}: SkuFormModalProps) {
  const CATEGORIES: ProductCategory[] = ["Cat", "Dog", "Bundle", "Other"];
  const labels: Record<ProductCategory, string> = {
    Cat: "แมว",
    Dog: "สุนัข",
    Bundle: "เซ็ต",
    Other: "อื่นๆ",
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-card rounded-xl p-7 w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl border border-border"
        style={{ background: "var(--erp-surface)", borderColor: "var(--erp-border)" }}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold text-foreground m-0" style={{ color: "var(--erp-ink)" }}>
            {modalMode === "add"
              ? "+ เพิ่มสินค้าใหม่"
              : `แก้ไขสินค้า — ${selectedSku}`}
          </h2>
          <Button
            variant="ghost"
            size="xs"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Close
          </Button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 p-2.5 rounded-lg text-xs mb-3.5">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              SKU *
            </Label>
            <Input
              value={form.sku}
              onChange={(e) =>
                setForm((f) => ({ ...f, sku: e.target.value.toUpperCase() }))
              }
              disabled={modalMode === "edit"}
              placeholder="เช่น CAT-CHK-30"
              className="bg-background disabled:opacity-50"
              style={modalMode === "edit" ? { background: "var(--erp-subtle)" } : undefined}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              ประเภท *
            </Label>
            <NativeSelect
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  type: e.target.value as ProductCategory,
                  isBundle: e.target.value === "Bundle",
                }))
              }
              className="w-full cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {labels[c]}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="col-span-2">
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              ชื่อสินค้า *
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="เช่น ไก่อกฟรีซดราย 30g"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              บาร์โค้ด
            </Label>
            <Input
              value={form.barcode ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, barcode: e.target.value }))
              }
              placeholder="13 หลัก EAN"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              น้ำหนัก (กรัม) {form.type === "Other" ? "" : "*"}
            </Label>
            <Input
              type="number"
              min={0}
              value={form.weightGrams === 0 ? "" : (form.weightGrams ?? "")}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  weightGrams: e.target.value === "" ? 0 : +e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              หน่วยสต็อกหลัก
            </Label>
            <NativeSelect
              value={form.baseUnit ?? "piece"}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  baseUnit: e.target.value as "piece" | "g" | "kg",
                }))
              }
              className="w-full cursor-pointer"
            >
              <option value="piece">ชิ้น</option>
              <option value="g">กรัม</option>
              <option value="kg">กิโลกรัม</option>
            </NativeSelect>
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              ต้นทุน (Cost) ฿ *
            </Label>
            <Input
              type="number"
              min={0}
              value={form.cost === 0 ? "" : form.cost}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  cost: e.target.value === "" ? 0 : +e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              ราคาขาย B2C ฿ {form.type === "Other" ? "" : "*"}
            </Label>
            <Input
              type="number"
              min={0}
              value={form.retailPrice === 0 ? "" : form.retailPrice}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  retailPrice: e.target.value === "" ? 0 : +e.target.value,
                  price: e.target.value === "" ? 0 : +e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              ราคาขาย B2B (ส่ง) ฿
            </Label>
            <Input
              type="number"
              min={0}
              value={
                form.wholesalePrice === 0 ? "" : (form.wholesalePrice ?? "")
              }
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  wholesalePrice: e.target.value === "" ? 0 : +e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Reorder Point
            </Label>
            <Input
              type="number"
              min={0}
              value={form.reorder === 0 ? "" : (form.reorder ?? "")}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  reorder: e.target.value === "" ? 0 : +e.target.value,
                }))
              }
            />
          </div>
          <div className="col-span-2">
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              หมายเหตุ
            </Label>
            <Input
              value={form.note ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="หมายเหตุเพิ่มเติม"
            />
          </div>
        </div>

        {form.cost > 0 && form.retailPrice > 0 && (
          <div className="mt-3.5 p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 rounded-lg flex gap-5">
            <div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                Gross Margin
              </div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {(
                  ((form.retailPrice - form.cost) / form.retailPrice) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                กำไรต่อชิ้น
              </div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                ฿{(form.retailPrice - form.cost).toLocaleString("th-TH")}
              </div>
            </div>
            {(form.wholesalePrice ?? 0) > 0 && (
              <div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                  Margin B2B
                </div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {(
                    (((form.wholesalePrice ?? 0) - form.cost) /
                      (form.wholesalePrice ?? 1)) *
                    100
                  ).toFixed(1)}
                  %
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-5">
          <Button
            variant="outline"
            onClick={onClose}
            className="cursor-pointer border-border"
            style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)", color: "#374151" }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={onSave}
            className="bg-[var(--erp-accent)] hover:opacity-90 text-white font-semibold cursor-pointer shadow-none border-none"
          >
            {modalMode === "add" ? "บันทึกสินค้า" : "บันทึกการแก้ไข"}
          </Button>
        </div>
      </div>
    </div>
  );
}
