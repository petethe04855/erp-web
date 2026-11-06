"use client";
import { useState } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RecordLookup } from "@/features/erp/components/RecordLookup";
import { ItemLines, type ItemLine } from "@/features/erp/components/ItemLines";
import type { CreateInvoiceDTO } from "../types/invoice";
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateInvoiceDTO) => Promise<unknown>;
  isSubmitting?: boolean;
}
export function InvoiceForm(props: Props) {
  const [order, setOrder] = useState("");
  return (
    <FormDialog
      {...props}
      title="สร้างใบแจ้งหนี้จากใบสั่งขาย"
      description="บันทึกผ่าน ERP API เดิม ระบบจะตรวจสอบและคำนวณรายการให้"
      onSubmit={() => props.onSubmit({ orderNumber: order })}
    >
      <RecordLookup
        kind="orders"
        label="ใบสั่งขาย"
        value={order}
        onChange={setOrder}
      />
      <p className="text-xs text-neutral-500">
        ลูกค้า รายการสินค้า ราคา และยอดรวมมาจากใบสั่งขาย
        ระบบจะคืนใบแจ้งหนี้เดิมหากสร้างไว้แล้ว
      </p>
    </FormDialog>
  );
}
