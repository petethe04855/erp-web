"use client";
import { useState } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RecordLookup } from "@/features/erp/components/RecordLookup";
import { ItemLines, type ItemLine } from "@/features/erp/components/ItemLines";
import type { CreatePurchaseDTO } from "../types/purchase";
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePurchaseDTO) => Promise<unknown>;
  isSubmitting?: boolean;
}
export function PurchaseOrderForm(props: Props) {
  const [supplier, setSupplier] = useState("");
  const [days, setDays] = useState("7");
  const [lines, setLines] = useState<ItemLine[]>([
    { sku: "", quantity: 1, price: 0 },
  ]);
  return (
    <FormDialog
      {...props}
      title="สร้างใบสั่งซื้อ"
      description="บันทึกผ่าน ERP API เดิม ระบบจะตรวจสอบและคำนวณรายการให้"
      onSubmit={() =>
        props.onSubmit({
          supplierName: supplier,
          expectedDeliveryDays: Number(days),
          items: lines.map((l) => ({
            sku: l.sku,
            quantity: l.quantity,
            unitCost: l.price,
          })),
        })
      }
    >
      <label className="block text-xs font-medium">
        ผู้จัดจำหน่าย
        <Input
          className="mt-2"
          type="text"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          required
        />
      </label>
      <label className="block text-xs font-medium">
        กำหนดรับสินค้าใน (วัน)
        <Input
          className="mt-2"
          type="number"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          min="0"
          required
        />
      </label>
      <ItemLines value={lines} onChange={setLines} />
    </FormDialog>
  );
}
