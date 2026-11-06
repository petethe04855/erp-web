"use client";
import { useState } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RecordLookup } from "@/features/erp/components/RecordLookup";
import { ItemLines, type ItemLine } from "@/features/erp/components/ItemLines";
import type { InventoryStock, StockAdjustmentDTO } from "../types/inventory";
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStock: InventoryStock | null;
  onSubmit: (dto: StockAdjustmentDTO) => Promise<unknown>;
  isSubmitting?: boolean;
}
export function StockAdjustmentModal(props: Props) {
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  return (
    <FormDialog
      {...props}
      title="บันทึกผลตรวจนับสต็อก"
      description={props.selectedStock?.sku}
      onSubmit={() => {
        if (!props.selectedStock) throw new Error("กรุณาเลือกสินค้า");
        return props.onSubmit({
          sku: props.selectedStock.sku,
          warehouse: "",
          type: "adjustment",
          quantity: Number(qty),
          reason,
        });
      }}
    >
      <label className="block text-xs font-medium">
        จำนวนที่นับได้จริง (สามารถเป็น 0)
        <Input
          className="mt-2"
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          min="0"
          step="1"
          required
        />
      </label>
      <label className="block text-xs font-medium">
        เหตุผล
        <Input
          className="mt-2"
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </label>
      <p className="text-xs text-neutral-500">
        Backend จะคำนวณผลต่าง ตรวจสอบจำนวนจอง และปรับสต็อกใน Transaction
      </p>
    </FormDialog>
  );
}
