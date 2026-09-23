"use client";

import { useState, useEffect } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
import type { CreateCustomerDTO, Customer } from "../types/customer";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCustomerDTO) => Promise<unknown>;
  initialData?: Customer | null;
  isSubmitting?: boolean;
  zIndex?: number;
}

export function CustomerForm(props: Props) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tax, setTax] = useState("");
  const [address, setAddress] = useState("");

  const isEditing = Boolean(props.initialData);

  useEffect(() => {
    if (props.open) {
      if (props.initialData) {
        setName(props.initialData.name || "");
        setContact(props.initialData.contactPerson || "");
        setEmail(props.initialData.email || "");
        setPhone(props.initialData.phone || "");
        setTax(props.initialData.taxId || "");
        setAddress(props.initialData.address || "");
      } else {
        setName("");
        setContact("");
        setEmail("");
        setPhone("");
        setTax("");
        setAddress("");
      }
    }
  }, [props.open, props.initialData]);

  const handleSubmit = async () => {
    await props.onSubmit({
      name,
      contactPerson: contact,
      email,
      phone,
      taxId: tax,
      address,
      logo: props.initialData?.logo || "",
    });
  };

  return (
    <FormDialog
      {...props}
      title={isEditing ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มลูกค้า"}
      description={
        isEditing
          ? `แก้ไขข้อมูลลูกค้า ${props.initialData?.name || props.initialData?.code || ""}`
          : "บันทึกข้อมูลลูกค้า ระบบจะตรวจสอบและจัดเก็บให้อัตโนมัติ"
      }
      isSubmitting={props.isSubmitting}
      onSubmit={handleSubmit}
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
      <label className="block text-xs font-medium">
        ที่อยู่
        <Input
          className="mt-2"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="ที่อยู่สำนักงานใหญ่ หรือสถานที่จัดส่ง"
        />
      </label>
    </FormDialog>
  );
}
