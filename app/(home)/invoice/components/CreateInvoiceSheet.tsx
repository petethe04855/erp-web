"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { useTheme } from "@/lib/design/ThemeContext";
import { ValidationAlert } from "@/components/ValidationAlert";

const today = new Date().toISOString().split("T")[0];
const due14 = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
const BLANK = {
  soRef: "",
  customer: "",
  customerAddress: "",
  customerTaxId: "",
  customerBranch: "สำนักงานใหญ่",
  purchaseOrderRef: "",
  paymentTerms: "14 วัน",
  lineDescription: "",
  issueDate: today,
  dueDate: due14,
  amount: 0,
};

interface SalesOrder {
  id: number | string;
  code?: string;
  customer: string;
  amount: number;
}

interface CreateInvoiceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eligibleSOs: SalesOrder[];
  onSubmit: (data: {
    soRef?: string;
    customer: string;
    customerAddress: string;
    customerTaxId: string;
    customerBranch: string;
    purchaseOrderRef: string;
    paymentTerms: string;
    lines?: Array<{ sku: string; name: string; qty: number; unit: string; unitPrice: number; lineTotal: number }>;
    issueDate: string;
    dueDate: string;
    amount: number;
  }) => void;
  showToast: (msg: string) => void;
}

export function CreateInvoiceSheet({
  open,
  onOpenChange,
  eligibleSOs,
  onSubmit,
  showToast,
}: CreateInvoiceSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [form, setForm] = useState<{
    soRef: string;
    customer: string;
    customerAddress: string;
    customerTaxId: string;
    customerBranch: string;
    purchaseOrderRef: string;
    paymentTerms: string;
    lineDescription: string;
    issueDate: string;
    dueDate: string;
    amount: number | "";
  }>(BLANK);
  const [validationError, setValidationError] = useState("");

  function onSoSelect(soId: string) {
    const so = eligibleSOs.find((s) => s.id === soId);
    if (so) {
      setForm((f) => ({
        ...f,
        soRef: soId,
        customer: so.customer,
        amount: so.amount,
      }));
    } else {
      setForm((f) => ({ ...f, soRef: soId }));
    }
  }

  function handleSubmit() {
    if (!form.customer) {
      setValidationError("กรุณากรอกชื่อบริษัท");
      return;
    }
    if (!form.customerAddress.trim()) {
      setValidationError("กรุณากรอกที่อยู่ออกบิลของบริษัทลูกค้า");
      return;
    }
    if (form.amount === "" || Number(form.amount) <= 0) {
      setValidationError("กรุณากรอกมูลค่าที่มากกว่า 0");
      return;
    }
    if (!form.soRef && !form.lineDescription.trim()) {
      setValidationError("กรุณาระบุรายการสำหรับ Manual invoice");
      return;
    }
    if (form.customerTaxId && !/^\d{13}$/.test(form.customerTaxId.trim())) {
      setValidationError("เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก");
      return;
    }
    if (form.dueDate < form.issueDate) {
      setValidationError("วันครบกำหนดต้อง >= วันที่ออก");
      return;
    }

    onSubmit({
      soRef: form.soRef || undefined,
      customer: form.customer,
      customerAddress: form.customerAddress,
      customerTaxId: form.customerTaxId,
      customerBranch: form.customerBranch,
      purchaseOrderRef: form.purchaseOrderRef,
      paymentTerms: form.paymentTerms,
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      amount: Number(form.amount),
      lines: form.soRef ? undefined : [{ sku: "MANUAL", name: form.lineDescription, qty: 1, unit: "service", unitPrice: Number(form.amount), lineTotal: Number(form.amount) }],
    });
    setValidationError("");
    setForm(BLANK);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[min(520px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle
            className="text-base font-bold text-foreground"
            style={{ color: "var(--erp-ink)" }}
          >
            สร้างใบแจ้งหนี้
          </SheetTitle>
        </SheetHeader>
        <ValidationAlert message={validationError} />
        <SheetBody className="grid gap-4 overflow-y-auto">
          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Sales Order อ้างอิง
            </Label>
            <NativeSelect
              value={form.soRef}
              onChange={(e) => onSoSelect(e.target.value)}
              className="w-full cursor-pointer"
            >
              <option value="">-- เลือก SO หรือสร้าง Manual invoice --</option>
              {eligibleSOs.map((so) => (
                <option key={so.id} value={so.id}>
                  {so.id} — {so.customer} ({so.amount.toLocaleString()} บาท)
                </option>
              ))}
            </NativeSelect>
          </div>

          {!form.soRef && <div><Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>รายการในใบแจ้งหนี้ *</Label><Input value={form.lineDescription} onChange={(e) => setForm((f) => ({ ...f, lineDescription: e.target.value }))} placeholder="เช่น ค่าบริการ / สินค้าตามข้อตกลง" /></div>}

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>ที่อยู่ออกบิล *</Label>
            <textarea value={form.customerAddress} onChange={(e) => setForm((f) => ({ ...f, customerAddress: e.target.value }))} placeholder="ชื่ออาคาร เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์" className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>เลขผู้เสียภาษี</Label><Input value={form.customerTaxId} onChange={(e) => setForm((f) => ({ ...f, customerTaxId: e.target.value }))} placeholder="13 หลัก" /></div>
            <div><Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>สาขา</Label><Input value={form.customerBranch} onChange={(e) => setForm((f) => ({ ...f, customerBranch: e.target.value }))} placeholder="สำนักงานใหญ่" /></div>
          </div>

          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              ชื่อบริษัท *
            </Label>
            <Input
              value={form.customer}
              onChange={(e) =>
                setForm((f) => ({ ...f, customer: e.target.value }))
              }
              placeholder="ชื่อบริษัทลูกค้า"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                className="text-xs font-semibold text-muted-foreground mb-1 block"
                style={{ color: "var(--erp-ink2)" }}
              >
                วันที่ออกใบ
              </Label>
              <Input
                type="date"
                value={form.issueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, issueDate: e.target.value }))
                }
              />
            </div>
            <div>
              <Label
                className="text-xs font-semibold text-muted-foreground mb-1 block"
                style={{ color: "var(--erp-ink2)" }}
              >
                ครบกำหนดชำระ
              </Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>PO ลูกค้า</Label><Input value={form.purchaseOrderRef} onChange={(e) => setForm((f) => ({ ...f, purchaseOrderRef: e.target.value }))} placeholder="PO-..." /></div>
            <div><Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>เงื่อนไขชำระเงิน</Label><Input value={form.paymentTerms} onChange={(e) => setForm((f) => ({ ...f, paymentTerms: e.target.value }))} placeholder="เช่น 30 วัน" /></div>
          </div>

          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              มูลค่า (บาท) *
            </Label>
            <Input
              type="number"
              min={0}
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  amount:
                    e.target.value === ""
                      ? ""
                      : parseFloat(e.target.value) || 0,
                }))
              }
              placeholder="0.00"
            />
          </div>
        </SheetBody>
        <SheetFooter className="flex justify-end gap-2 border-t p-4 px-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer border-border"
            style={{
              borderColor: "var(--erp-border)",
              background: "var(--erp-surface)",
              color: "#374151",
            }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none cursor-pointer"
          >
            บันทึกใบแจ้งหนี้
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
