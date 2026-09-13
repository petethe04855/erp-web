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
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("0");

  const resetForm = () => {
    setSku("");
    setName("");
    setPrice("");
    setCost("0");
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
      setPrice(String(d.price ?? ""));
      setCost(String(d.cost ?? "0"));
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
          ? "แก้ไขข้อมูลสินค้า รายละเอียด และราคา/ต้นทุนของ SKU"
          : "บันทึกข้อมูลสินค้าหลักในระบบ SKU Master"
      }
      isSubmitting={props.isSubmitting}
      onSubmit={async () => {
        await props.onSubmit({
          sku,
          name,
          price: Number(price),
          cost: Number(cost),
          category: props.initialData?.category || "Finished Product",
          isBundle: false,
        });
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
      <p className="text-xs text-neutral-500">
        การรับสต็อกให้ทำผ่านหน้ารับสินค้า ส่วนการตัดสต็อกแบบชุด/เซ็ตให้ตั้งค่าที่ &quot;สูตรตัดสต็อก (Inventory Formula)&quot;
      </p>
    </FormDialog>
  );
}
