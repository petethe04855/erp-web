"use client";

import { Button } from "@/components/ui/button";
import { ValidationAlert } from "@/components/ValidationAlert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type {
  ProductCategory,
  CreateProductInput,
} from "@/lib/store/erpWorkflow";

interface SkuFormModalProps {
  modalMode: "add" | "edit";
  selectedSku?: string;
  form: CreateProductInput;
  setForm: React.Dispatch<React.SetStateAction<CreateProductInput>>;
  error: string;
  onClose: () => void;
  onSave: () => void;
}

const CATEGORIES: ProductCategory[] = [
  "Cat",
  "Dog",
  "Bundle",
  "Other",
  "Raw Material",
  "Packaging",
  "Sub-component",
  "Finished Product",
];

const UNITS = ["kg", "g", "L", "ใบ", "ดวง", "ถุง", "กล่อง", "ชิ้น"];

export default function SkuFormModal({
  modalMode,
  selectedSku,
  form,
  setForm,
  error,
  onClose,
  onSave,
}: SkuFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-[520px] rounded-xl border border-border bg-card p-7 shadow-2xl"
        style={{
          background: "var(--erp-surface)",
          borderColor: "var(--erp-border)",
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2
            className="m-0 text-base font-bold text-foreground"
            style={{ color: "var(--erp-ink)" }}
          >
            {modalMode === "add"
              ? "สร้างสินค้า/วัตถุดิบ"
              : `แก้ไขสินค้า/วัตถุดิบ - ${selectedSku}`}
          </h2>
          <Button
            variant="ghost"
            size="xs"
            onClick={onClose}
            className="cursor-pointer"
          >
            Close
          </Button>
        </div>

        <ValidationAlert message={error} />

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <Label className="mb-1 block text-xs font-semibold text-muted-foreground">
              รหัส SKU
            </Label>
            <Input
              value={form.sku}
              onChange={(e) =>
                setForm((f) => ({ ...f, sku: e.target.value.toUpperCase() }))
              }
              disabled={modalMode === "edit"}
              placeholder="เช่น RM-CHICKEN"
            />
          </div>

          <div>
            <Label className="mb-1 block text-xs font-semibold text-muted-foreground">
              ชื่อรายการ
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="เช่น เนื้ออกไก่"
            />
          </div>

          <div>
            <Label className="mb-1 block text-xs font-semibold text-muted-foreground">
              ประเภท
            </Label>
            <NativeSelect
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  type: e.target.value as ProductCategory,
                  isBundle: e.target.value === "Sub-component",
                }))
              }
              className="w-full cursor-pointer"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div>
            <Label className="mb-1 block text-xs font-semibold text-muted-foreground">
              หน่วยหลัก
            </Label>
            <NativeSelect
              value={form.baseUnit ?? "ชิ้น"}
              onChange={(e) =>
                setForm((f) => ({ ...f, baseUnit: e.target.value }))
              }
              className="w-full cursor-pointer"
            >
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="col-span-1">
            <Label className="mb-1 block text-xs font-semibold text-muted-foreground">
              ต้นทุนต่อหน่วย (Cost / บาท)
            </Label>
            <Input
              type="number"
              min={0}
              step="any"
              value={
                form.cost === 0 && typeof form.cost === "number"
                  ? ""
                  : form.cost
              }
              onChange={(e) => {
                const val = e.target.value;
                setForm((f) => ({
                  ...f,
                  cost: val === "" ? ("" as unknown as number) : Number(val),
                }));
              }}
            />
          </div>
          <div className="col-span-1">
            <Label className="mb-1 block text-xs font-semibold text-muted-foreground">
              จำนวนคงเหลือ (Stock)
            </Label>
            <Input
              type="number"
              min={0}
              step="any"
              value={form.stock}
              onChange={(e) => {
                const val = e.target.value;
                setForm((f) => ({
                  ...f,
                  stock: val === "" ? ("" as unknown as number) : Number(val),
                }));
              }}
              placeholder="0"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="cursor-pointer border-border"
            style={{
              borderColor: "var(--erp-border)",
              background: "var(--erp-surface)",
              color: "#374151",
            }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={onSave}
            className="cursor-pointer border-none bg-[var(--erp-accent)] font-semibold text-white shadow-none hover:opacity-90"
          >
            {modalMode === "add" ? "บันทึกสินค้า/วัตถุดิบ" : "บันทึกการแก้ไข"}
          </Button>
        </div>
      </div>
    </div>
  );
}
