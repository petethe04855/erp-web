"use client";
import { useState } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RecordLookup } from "@/features/erp/components/RecordLookup";
import { ItemLines, type ItemLine } from "@/features/erp/components/ItemLines";
import type { CreateQuotationDTO } from "../types/quotation";
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateQuotationDTO) => Promise<unknown>;
  isSubmitting?: boolean;
}
export function QuotationForm(props: Props) {
  const getDefaultValidUntil = () => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split("T")[0];
  };

  const [customer, setCustomer] = useState("");
  const [leadSource, setLeadSource] = useState("");
  const [validUntil, setValidUntil] = useState(getDefaultValidUntil);
  const [lines, setLines] = useState<ItemLine[]>([
    { sku: "", quantity: 1, price: 0 },
  ]);

  const resetForm = () => {
    setCustomer("");
    setLeadSource("");
    setValidUntil(getDefaultValidUntil());
    setLines([{ sku: "", quantity: 1, price: 0 }]);
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
      title="สร้างใบเสนอราคา"
      description="บันทึกผ่าน ERP API เดิม ระบบจะตรวจสอบและคำนวณรายการให้"
      onSubmit={async () => {
        await props.onSubmit({
          customerName: customer,
          validUntil: validUntil,
          leadSource: leadSource.trim() || undefined,
          items: lines.map((l) => ({
            sku: l.sku,
            quantity: l.quantity,
            unitPrice: l.price,
          })),
        });
        resetForm();
      }}
    >
      <RecordLookup
        kind="customers"
        label="ลูกค้า"
        value={customer}
        onChange={setCustomer}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block text-xs font-medium">
          ช่องทางที่มา (Lead source)
          <Input
            className="mt-2"
            type="text"
            placeholder="เช่น Facebook, Line, โทรศัพท์, หน้าร้าน"
            value={leadSource}
            onChange={(e) => setLeadSource(e.target.value)}
          />
        </label>
        <label className="block text-xs font-medium">
          ใช้ได้ถึง (Valid until)
          <Input
            className="mt-2"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            required
          />
        </label>
      </div>
      <ItemLines value={lines} onChange={setLines} inventoryOnly={true} />
    </FormDialog>
  );
}
