"use client";
import { useState } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RecordLookup } from "@/features/erp/components/RecordLookup";
import { ItemLines, type ItemLine } from "@/features/erp/components/ItemLines";
import type { CreateProductDTO } from "../types/product";
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateProductDTO) => Promise<unknown>;
  isSubmitting?: boolean;
}
export function ProductForm(props: Props) {
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("0");
  const [unit, setUnit] = useState("piece");
  return (
    <FormDialog
      {...props}
      title="เพิ่มสินค้า"
      description="บันทึกผ่าน ERP API เดิม ระบบจะตรวจสอบและคำนวณรายการให้"
      onSubmit={() =>
        props.onSubmit({
          code: sku,
          name,
          category: "Finished Product",
          type: "Finished Product",
          unit,
          standardPrice: Number(price),
          standardCost: Number(cost),
        })
      }
    >
      <label className="block text-xs font-medium">
        SKU
        <Input
          className="mt-2"
          type="text"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
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
      <label className="block text-xs font-medium">
        หน่วยสินค้า
        <Input
          className="mt-2"
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          required
        />
      </label>
    </FormDialog>
  );
}
