"use client";
import { useState } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SKUSelect } from "@/features/sku/components/SKUSelect";
import type { CreateGoodsIssueDTO } from "../types/warehouse";
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateGoodsIssueDTO) => Promise<unknown>;
  isSubmitting?: boolean;
}
export function GoodsIssueForm(props: Props) {
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState("1");
  const [reason, setReason] = useState("");
  const [channel, setChannel] = useState("Manual");
  const [ref, setRef] = useState("");

  const resetForm = () => {
    setSku("");
    setQty("1");
    setReason("");
    setChannel("Manual");
    setRef("");
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
      title="เบิกสินค้า"
      description="บันทึกผ่าน ERP API เดิม ระบบจะตรวจสอบและคำนวณรายการให้"
      onSubmit={async () => {
        if (!sku) {
          throw new Error("กรุณาเลือก SKU สินค้า");
        }
        await props.onSubmit({
          sku,
          quantity: Number(qty),
          reason,
          warehouse: channel,
          orderNumber: ref,
        });
        resetForm();
      }}
    >
      <SKUSelect
        value={sku}
        onChange={(val) => setSku(val)}
        showDetails={true}
        excludeBundle={true}
      />
      <label className="block text-xs font-medium">
        จำนวนเบิก
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
        เหตุผลการเบิก
        <Input
          className="mt-2"
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </label>
      <label className="block text-xs">
        ช่องทาง
        <Select value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option>Manual</option>
          <option>Shopee</option>
          <option>TikTok</option>
        </Select>
      </label>
      <label className="block text-xs font-medium">
        อ้างอิงคำสั่งซื้อ
        <Input
          className="mt-2"
          type="text"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          required={channel !== "Manual"}
        />
      </label>
    </FormDialog>
  );
}
