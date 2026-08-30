"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTheme } from "@/lib/design/ThemeContext";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: number | string;
  outstanding: number;
  onSubmit: (amount: number, details: { accountCode: string; method: string; reference: string }) => void;
  showToast: (msg: string) => void;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  invoiceId,
  outstanding,
  onSubmit,
  showToast,
}: RecordPaymentDialogProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [payAmount, setPayAmount] = useState<number | "">(0);
  const [accountCode, setAccountCode] = useState("1100");
  const [method, setMethod] = useState("Cash");
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (open) {
      setPayAmount(outstanding);
    }
  }, [open, outstanding]);

  function handlePayment() {
    if (payAmount === "" || Number(payAmount) <= 0) {
      showToast("กรุณากรอกจำนวนเงินชำระมากกว่า 0");
      return;
    }
    onSubmit(Number(payAmount), { accountCode, method, reference: reference.trim() });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[400px] p-6">
        <DialogHeader className="mb-4">
          <DialogTitle
            className="text-base font-bold text-foreground"
            style={{ color: "var(--erp-ink)" }}
          >
            บันทึกการรับชำระ
          </DialogTitle>
          <div
            className="text-xs text-muted-foreground"
            style={{ color: "var(--erp-ink3)" }}
          >
            รับชำระสำหรับ {invoiceId}
          </div>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              จำนวนเงินที่รับชำระ (บาท)
            </Label>
            <Input
              type="number"
              min={0}
              value={payAmount}
              onChange={(e) =>
                setPayAmount(
                  e.target.value === "" ? "" : parseFloat(e.target.value) || 0,
                )
              }
              placeholder="0.00"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="mb-1 block text-xs font-semibold">ช่องทางชำระ</Label><select value={method} onChange={(e) => setMethod(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="Cash">เงินสด</option><option value="Bank Transfer">โอนเงิน</option><option value="PromptPay">PromptPay</option></select></div>
            <div><Label className="mb-1 block text-xs font-semibold">เข้าบัญชี</Label><select value={accountCode} onChange={(e) => setAccountCode(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="1100">เงินสด</option><option value="1110">ธนาคาร</option></select></div>
          </div>
          <div><Label className="mb-1 block text-xs font-semibold">เลขอ้างอิงการชำระ</Label><Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="เลขที่สลิป/รายการโอน (ถ้ามี)" /></div>
        </div>
        <DialogFooter className="flex justify-end gap-2 mt-5">
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
            onClick={handlePayment}
            className="bg-[var(--erp-pos)] text-white hover:opacity-90 border-none shadow-none cursor-pointer"
            style={{ backgroundColor: c.pos }}
          >
            บันทึกการชำระ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
