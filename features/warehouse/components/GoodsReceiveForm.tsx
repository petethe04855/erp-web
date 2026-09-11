"use client";
import { useState } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
import { SKUSelect } from "@/features/sku/components/SKUSelect";
import type { CreateGoodsReceiveDTO } from "../types/warehouse";
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateGoodsReceiveDTO) => Promise<unknown>;
  isSubmitting?: boolean;
}
export function GoodsReceiveForm(props: Props) {
  const [po, setPo] = useState("");
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState("1");
  const [supplierLot, setSupplierLot] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [expiry, setExpiry] = useState("");

  const resetForm = () => {
    setPo("");
    setSku("");
    setQty("1");
    setSupplierLot("");
    setDate(new Date().toLocaleDateString("en-CA"));
    setExpiry("");
  };

  // Reset when the dialog closes: adjust state during render (React docs
  // pattern) instead of setState-in-effect.
  const [prevOpen, setPrevOpen] = useState(props.open);
  if (prevOpen && !props.open) {
    setPrevOpen(false);
    resetForm();
  } else if (!prevOpen && props.open) {
    setPrevOpen(true);
  }

  return (
    <FormDialog
      {...props}
      title="รับสินค้าเข้าสต็อก"
      description="บันทึกผ่าน ERP API เดิม ระบบจะตรวจสอบและคำนวณรายการให้"
      onSubmit={async () => {
        if (!sku) {
          throw new Error("กรุณาเลือก SKU สินค้า");
        }
        await props.onSubmit({
          poNumber: po,
          sku,
          quantity: Number(qty),
          warehouse: "",
          lotNumber: supplierLot,
          receiveDate: date,
          expiryDate: expiry,
        });
        resetForm();
      }}
    >
      <label className="block text-xs font-medium">
        อ้างอิง PO (เว้นว่างสำหรับรับสินค้าโดยตรง)
        <Input
          className="mt-2"
          type="text"
          value={po}
          onChange={(e) => setPo(e.target.value)}
        />
      </label>
      <SKUSelect
        value={sku}
        onChange={(val) => setSku(val)}
        showDetails={true}
        excludeBundle={true}
      />
      <label className="block text-xs font-medium">
        จำนวนรับ
        <Input
          className="mt-2"
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          min="1"
          step="1"
          required
        />
      </label>
      <label className="block text-xs font-medium">
        วันที่รับสินค้า
        <Input
          className="mt-2"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>
      <label className="block text-xs font-medium">
        วันที่หมดอายุ
        <Input
          className="mt-2"
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          required
          min={date}
        />
      </label>
      <label className="block text-xs font-medium">
        ล็อตผู้จัดจำหน่าย
        <Input
          className="mt-2"
          type="text"
          value={supplierLot}
          onChange={(e) => setSupplierLot(e.target.value)}
        />
      </label>
      <p className="text-xs text-neutral-500">
        ระบบสร้างเลขล็อตและบันทึก Stock Movement ที่ Backend
      </p>
    </FormDialog>
  );
}
