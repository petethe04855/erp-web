"use client";
import { useState, useEffect } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RecordLookup } from "@/features/erp/components/RecordLookup";
import { ItemLines, type ItemLine } from "@/features/erp/components/ItemLines";
import type { CreateSKUDTO } from "../types/sku";
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSKUDTO) => Promise<unknown>;
  isSubmitting?: boolean;
}
export function SKUForm(props: Props) {
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("0");
  const [bundle, setBundle] = useState(false);
  const [lines, setLines] = useState<ItemLine[]>([
    { sku: "", quantity: 1, price: 0 },
  ]);

  const resetForm = () => {
    setSku("");
    setName("");
    setPrice("");
    setCost("0");
    setBundle(false);
    setLines([{ sku: "", quantity: 1, price: 0 }]);
  };

  useEffect(() => {
    if (!props.open) {
      resetForm();
    }
  }, [props.open]);

  return (
    <FormDialog
      {...props}
      title="เพิ่ม SKU / Bundle"
      description="บันทึกผ่าน ERP API เดิม ระบบจะตรวจสอบและคำนวณรายการให้"
      onSubmit={async () => {
        await props.onSubmit({
          sku,
          name,
          price: Number(price),
          cost: Number(cost),
          category: bundle ? "Bundle" : "Finished Product",
          isBundle: bundle,
          bundleItems: bundle
            ? lines.map((l) => ({ componentSku: l.sku, quantity: l.quantity }))
            : undefined,
        });
        resetForm();
      }}
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
      <label className="flex gap-2 text-sm">
        <input
          type="checkbox"
          checked={bundle}
          onChange={(e) => setBundle(e.target.checked)}
        />
        เป็นชุดสินค้า Bundle
      </label>
      {bundle && <ItemLines value={lines} onChange={setLines} prices={false} />}
      <p className="text-xs text-neutral-500">
        การรับสต็อกให้ทำผ่านหน้ารับสินค้า
      </p>
    </FormDialog>
  );
}
