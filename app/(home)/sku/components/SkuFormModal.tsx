"use client";

import { Button } from "@/components/ui/button";
import { ValidationAlert } from "@/components/ValidationAlert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreateProductInput, Product } from "@/lib/store/erpWorkflow";

interface SkuFormModalProps {
  modalMode: "add" | "edit";
  selectedSku?: string;
  form: CreateProductInput;
  products: Product[];
  setForm: React.Dispatch<React.SetStateAction<CreateProductInput>>;
  error: string;
  onClose: () => void;
  onSave: () => void;
}

export default function SkuFormModal({
  modalMode,
  selectedSku,
  form,
  products,
  setForm,
  error,
  onClose,
  onSave,
}: SkuFormModalProps) {
  const components = form.components ?? [];
  const componentProducts = products.filter(
    (product) =>
      product.isActive &&
      !product.isBundle &&
      ["Finished Product", "Cat", "Dog"].includes(product.type) &&
      product.sku !== form.sku.trim().toUpperCase(),
  );

  function setBundle(enabled: boolean) {
    setForm((current) => ({
      ...current,
      type: enabled ? "Bundle" : "Finished Product",
      isBundle: enabled,
      stock: enabled ? 0 : current.stock,
      components: enabled ? current.components ?? [] : [],
    }));
  }

  function addComponent() {
    setForm((current) => ({
      ...current,
      components: [
        ...(current.components ?? []),
        { componentSku: "", qty: 1, unit: "piece", componentType: "material" },
      ],
    }));
  }

  function updateComponent(index: number, patch: { componentSku?: string; qty?: number }) {
    setForm((current) => ({
      ...current,
      components: (current.components ?? []).map((component, itemIndex) =>
        itemIndex === index ? { ...component, ...patch } : component,
      ),
    }));
  }

  function removeComponent(index: number) {
    setForm((current) => ({
      ...current,
      components: (current.components ?? []).filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-[760px] overflow-y-auto rounded-xl border border-border bg-card p-7 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="m-0 text-base font-bold">
            {modalMode === "add"
              ? "เพิ่มข้อมูล SKU"
              : `แก้ไขสินค้า - ${selectedSku}`}
          </h2>
          <Button variant="ghost" size="xs" onClick={onClose}>
            Close
          </Button>
        </div>

        <ValidationAlert message={error} />

        <div className="mb-5 rounded-lg border border-border bg-muted/30 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={Boolean(form.isBundle)}
              onChange={(event) => setBundle(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--erp-accent)]"
            />
            <span>
              <span className="block text-sm font-semibold">SKU รวมโปรดักแบบแพ็ก</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                สินค้า 1 SKU ประกอบด้วยสินค้าหลายรายการ ระบบจะคำนวณสต็อกจากสินค้าในแพ็ก
              </span>
            </span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <Label className="mb-1 block text-xs font-semibold">
              รหัส SKU *
            </Label>
            <Input
              value={form.sku}
              onChange={(e) =>
                setForm((f) => ({ ...f, sku: e.target.value.toUpperCase() }))
              }
              placeholder="เช่น CHICKEN-BREAST"
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold">
              ชื่อสินค้า *
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="เช่น อกไก่ หรือตับกระต่าย"
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold">Barcode</Label>
            <Input
              value={form.barcode ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, barcode: e.target.value }))
              }
              placeholder="ระบุถ้ามี"
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold">
              ราคาขาย (บาท) *
            </Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.retailPrice || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  retailPrice: Number(e.target.value) || 0,
                }))
              }
              placeholder="0.00"
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold">
              {modalMode === "add" ? "จำนวนเริ่มต้น (Stock)" : "จำนวน Stock"}
            </Label>
            <Input
              type="number"
              min={0}
              step={1}
              value={form.stock || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  stock: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                }))
              }
              placeholder="0"
              disabled={Boolean(form.isBundle)}
            />
            {form.isBundle && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                สต็อกของแพ็กคำนวณจากจำนวนสินค้าส่วนประกอบ
              </p>
            )}
          </div>
          <div className="col-span-2">
            <Label className="mb-1 block text-xs font-semibold">หมายเหตุ</Label>
            <Textarea
              value={form.note ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="รายละเอียดเพิ่มเติม"
            />
          </div>
        </div>

        {form.isBundle && (
          <section className="mt-5 rounded-lg border border-border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">สินค้าในแพ็ก</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  ระบุ SKU และจำนวนที่ใช้ต่อแพ็ก 1 ชุด
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addComponent}>
                + เพิ่มสินค้าในแพ็ก
              </Button>
            </div>

            <div className="space-y-2">
              {components.length === 0 && (
                <div className="rounded-md border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
                  ยังไม่มีสินค้าในแพ็ก กด “เพิ่มสินค้าในแพ็ก” เพื่อเริ่มกำหนดรายการ
                </div>
              )}
              {components.map((component, index) => (
                <div key={`${component.componentSku}-${index}`} className="grid grid-cols-[1fr_110px_auto] items-end gap-2">
                  <div>
                    <Label className="mb-1 block text-xs font-semibold">SKU สินค้า</Label>
                    <select
                      value={component.componentSku}
                      onChange={(event) => updateComponent(index, { componentSku: event.target.value })}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">เลือกสินค้า</option>
                      {componentProducts.map((product) => (
                        <option key={product.sku} value={product.sku}>
                          {product.sku} · {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="mb-1 block text-xs font-semibold">จำนวน/แพ็ก</Label>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={component.qty || ""}
                      onChange={(event) =>
                        updateComponent(index, {
                          qty: Math.max(0, Math.floor(Number(event.target.value) || 0)),
                        })
                      }
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => removeComponent(index)}>
                    ลบ
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          {form.isBundle
            ? "รายการนี้จะเป็นข้อมูลสำหรับคำนวณจำนวนพร้อมขายและตัดสต็อกสินค้าในแพ็ก"
            : "การเปลี่ยนจำนวน Stock จะบันทึกส่วนต่างเป็น Stock Movement อัตโนมัติ"}
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            onClick={onSave}
            className="bg-[var(--erp-accent)] text-white"
          >
            {modalMode === "add" ? "บันทึกสินค้า" : "บันทึกการแก้ไข"}
          </Button>
        </div>
      </div>
    </div>
  );
}
