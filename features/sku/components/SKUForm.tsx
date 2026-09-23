"use client";
import { useState } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
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
  const [initialQuantity, setInitialQuantity] = useState("0");

  const resetForm = () => {
    setSku("");
    setName("");
    setInitialQuantity("0");
  };

  // Sync form fields with `open`/`initialData`: adjust state during render (React pattern)
  const formSignature = `${props.open}-${props.initialData?.id ?? "new"}-${props.initialData?.sku ?? ""}`;
  const [prevSignature, setPrevSignature] = useState(formSignature);
  if (prevSignature !== formSignature) {
    setPrevSignature(formSignature);
    if (props.open && props.initialData) {
      const d = props.initialData;
      setSku(d.sku || "");
      setName(d.name || "");
      setInitialQuantity("0");
    } else {
      resetForm();
    }
  }

  return (
    <FormDialog
      {...props}
      title={isEditing ? `แก้ไขข้อมูล SKU: ${props.initialData?.sku}` : "เพิ่ม SKU สินค้า"}
      description={
        isEditing
          ? "แก้ไขข้อมูลและรายละเอียดสินค้าหลักของ SKU"
          : "บันทึกข้อมูลสินค้าหลักในระบบ SKU Master (ราคาต้นทุนและราคาขายจะถูกตั้งค่าจากการรับสินค้าเข้า)"
      }
      isSubmitting={props.isSubmitting}
      onSubmit={async () => {
        const payload: CreateSKUDTO = {
          sku,
          name,
          cost: props.initialData?.cost || 0,
          category: props.initialData?.category || "Finished Product",
          isBundle: false,
          ...(isEditing ? {} : { initialQuantity: Math.max(0, parseInt(initialQuantity, 10) || 0) }),
        };
        await props.onSubmit(payload);
        resetForm();
      }}
    >
      <label className="block text-xs font-medium">
        SKU {isEditing && <span className="text-neutral-400 font-normal">(แก้ไขรหัสได้)</span>}
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
      {!isEditing && (
        <label className="block text-xs font-medium">
          จำนวนสินค้าเริ่มต้น (สต็อกเปิดระบบ)
          <Input
            className="mt-2"
            type="number"
            value={initialQuantity}
            onChange={(e) => setInitialQuantity(e.target.value)}
            min="0"
            step="1"
            required
          />
          <span className="text-[11px] text-neutral-400 mt-1 block">
            กรอกจำนวนสต็อกคงเหลือเริ่มต้นสำหรับ SKU นี้ (สามารถเพิ่มได้เฉพาะตอนสร้างใหม่)
          </span>
        </label>
      )}

      {/* Info note about costing & pricing */}
      <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-400">
        <span className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
          💡 ระบบราคาต้นทุนและราคาขาย:
        </span>
        ราคาต้นทุนและราคาขายจะถูกบันทึกตามแต่ละล็อตโดยอัตโนมัติเมื่อทำรายการ <strong>&quot;รับสินค้าเข้าสต็อก (Goods Receive)&quot;</strong>
      </div>

      <p className="text-xs text-neutral-500">
        การรับสต็อกเพิ่มเติมให้ทำผ่านหน้ารับสินค้า ส่วนการตัดสต็อกแบบชุด/เซ็ตให้ตั้งค่าที่ &quot;ชุดสินค้า Inventory&quot;
      </p>
    </FormDialog>
  );
}
