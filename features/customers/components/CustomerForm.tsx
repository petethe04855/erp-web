"use client";
import { useState } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RecordLookup } from "@/features/erp/components/RecordLookup";
import { ItemLines, type ItemLine } from "@/features/erp/components/ItemLines";
import type { CreateCustomerDTO } from "../types/customer";
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCustomerDTO) => Promise<unknown>;
  isSubmitting?: boolean;
}
export function CustomerForm(props: Props) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tax, setTax] = useState("");
  return (
    <FormDialog
      {...props}
      title="เพิ่มลูกค้า"
      description="บันทึกผ่าน ERP API เดิม ระบบจะตรวจสอบและคำนวณรายการให้"
      onSubmit={() =>
        props.onSubmit({
          name,
          contactPerson: contact,
          email,
          phone,
          taxId: tax,
        })
      }
    >
      <label className="block text-xs font-medium">
        ชื่อลูกค้า / บริษัท
        <Input
          className="mt-2"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label className="block text-xs font-medium">
        ผู้ติดต่อ
        <Input
          className="mt-2"
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
      </label>
      <label className="block text-xs font-medium">
        อีเมล
        <Input
          className="mt-2"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="block text-xs font-medium">
        โทรศัพท์
        <Input
          className="mt-2"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>
      <label className="block text-xs font-medium">
        เลขประจำตัวผู้เสียภาษี
        <Input
          className="mt-2"
          type="text"
          value={tax}
          onChange={(e) => setTax(e.target.value)}
          pattern="[0-9]{13}"
          maxLength={13}
        />
      </label>
    </FormDialog>
  );
}
