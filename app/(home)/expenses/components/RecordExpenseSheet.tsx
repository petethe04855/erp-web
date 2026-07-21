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
import type { ExpenseCategory, ExpenseChannel } from "@/lib/store/erpWorkflow";

const CATEGORIES: ExpenseCategory[] = [
  "ค่าโฆษณา",
  "ค่าธรรมเนียมแพลตฟอร์ม",
  "COGS/วัตถุดิบ",
  "SG&A",
  "ค่าขนส่ง",
  "ค่าแรง",
  "อื่นๆ",
];
const CHANNELS: ExpenseChannel[] = [
  "TikTok",
  "Shopee",
  "LINE",
  "Manual",
  "ทั่วไป",
];

const BLANK = {
  date: new Date().toISOString().split("T")[0],
  category: "ค่าโฆษณา" as ExpenseCategory,
  channel: "TikTok" as ExpenseChannel,
  amount: "",
  description: "",
  vendor: "",
  invoiceRef: "",
};

interface RecordExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (expense: {
    date: string;
    category: ExpenseCategory;
    channel: ExpenseChannel;
    amount: number;
    description: string;
    vendor: string;
    invoiceRef: string;
  }) => void;
}

export function RecordExpenseSheet({
  open,
  onOpenChange,
  onSubmit,
}: RecordExpenseSheetProps) {
  const [form, setForm] = useState(BLANK);

  function handleSubmit() {
    const amount = parseFloat(form.amount);
    if (!form.description || !amount || !form.vendor) return;
    onSubmit({ ...form, amount });
    setForm(BLANK);
    onOpenChange(false);
  }

  const isFormInvalid = !form.description || !form.amount || !form.vendor;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[min(520px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle
            className="text-base font-bold text-foreground"
            style={{ color: "var(--erp-ink)" }}
          >
            บันทึกค่าใช้จ่าย
          </SheetTitle>
        </SheetHeader>
        <SheetBody className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                className="text-xs font-semibold text-muted-foreground mb-1 block"
                style={{ color: "var(--erp-ink2)" }}
              >
                วันที่ *
              </Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
            <div>
              <Label
                className="text-xs font-semibold text-muted-foreground mb-1 block"
                style={{ color: "var(--erp-ink2)" }}
              >
                จำนวนเงิน *
              </Label>
              <Input
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              รายละเอียด *
            </Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="เช่น ค่าโฆษณา Facebook 07/26"
            />
          </div>
          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              หมวดหมู่
            </Label>
            <NativeSelect
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target.value as ExpenseCategory,
                }))
              }
              className="w-full cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              ช่องทาง
            </Label>
            <NativeSelect
              value={form.channel}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  channel: e.target.value as ExpenseChannel,
                }))
              }
              className="w-full cursor-pointer"
            >
              {CHANNELS.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Vendor *
            </Label>
            <Input
              value={form.vendor}
              onChange={(e) =>
                setForm((f) => ({ ...f, vendor: e.target.value }))
              }
              placeholder="เช่น Meta Platforms"
            />
          </div>
          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Invoice ref
            </Label>
            <Input
              value={form.invoiceRef}
              onChange={(e) =>
                setForm((f) => ({ ...f, invoiceRef: e.target.value }))
              }
              placeholder="เช่น INV-2026-001"
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
            disabled={isFormInvalid}
            className="bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none cursor-pointer"
          >
            บันทึก
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
