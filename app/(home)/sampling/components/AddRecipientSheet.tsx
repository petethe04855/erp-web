"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { useTheme } from "@/lib/design/ThemeContext";

interface RecipientFormState {
  campaignId: string;
  name: string;
  contact: string;
  qtyGiven: number | "";
  date: string;
  feedback: string;
  converted: boolean;
}

const getTodayString = () => new Date().toISOString().split("T")[0];

const BLANK_RECIPIENT = (campaignId: string): RecipientFormState => ({
  campaignId,
  name: "",
  contact: "",
  qtyGiven: 1,
  date: getTodayString(),
  feedback: "",
  converted: false,
});

interface AddRecipientSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  campaignName: string;
  onSubmit: (data: {
    campaignId: string;
    name: string;
    contact: string;
    qtyGiven: number;
    date: string;
    feedback: string;
    converted: boolean;
  }) => void;
  showToast: (msg: string) => void;
}

export function AddRecipientSheet({
  open,
  onOpenChange,
  campaignId,
  campaignName,
  onSubmit,
  showToast,
}: AddRecipientSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [form, setForm] = useState<RecipientFormState>(BLANK_RECIPIENT(campaignId));

  useEffect(() => {
    if (open) {
      setForm(BLANK_RECIPIENT(campaignId));
    }
  }, [open, campaignId]);

  function handleSubmit() {
    if (!form.name || form.qtyGiven === "" || Number(form.qtyGiven) <= 0) {
      showToast("กรุณากรอกชื่อผู้รับและจำนวนที่มากกว่า 0");
      return;
    }
    onSubmit({
      campaignId: form.campaignId,
      name: form.name,
      contact: form.contact,
      qtyGiven: Number(form.qtyGiven),
      date: form.date,
      feedback: form.feedback,
      converted: form.converted,
    });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[min(540px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base font-bold text-foreground" style={{ color: "var(--erp-ink)" }}>
            เพิ่มผู้รับ Sample
          </SheetTitle>
          <div className="text-xs text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>
            {campaignName}
          </div>
        </SheetHeader>
        <SheetBody className="grid gap-4 overflow-y-auto">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              ชื่อผู้รับ *
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="ชื่อ-นามสกุล หรือ Handle"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              ช่องทางติดต่อ
            </Label>
            <Input
              value={form.contact}
              onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
              placeholder="LINE ID / เบอร์โทร / Instagram"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                จำนวนที่ให้ (ชิ้น) *
              </Label>
              <Input
                type="number"
                min={1}
                value={form.qtyGiven}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    qtyGiven: e.target.value === "" ? "" : parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                วันที่แจก
              </Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              Feedback (ถ้ามี)
            </Label>
            <Input
              value={form.feedback}
              onChange={(e) => setForm((f) => ({ ...f, feedback: e.target.value }))}
              placeholder="ความคิดเห็น / ผลตอบรับ"
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/40" style={{ borderColor: "var(--erp-border)", background: "var(--erp-subtle)" }}>
            <Switch
              id="converted"
              checked={form.converted}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, converted: checked }))}
            />
            <Label
              htmlFor="converted"
              className="text-xs font-semibold text-foreground cursor-pointer select-none"
              style={{ color: "var(--erp-ink)" }}
            >
              ผู้รับนี้กลายเป็นลูกค้าแล้ว (Converted)
            </Label>
          </div>
        </SheetBody>
        <SheetFooter className="flex justify-end gap-2 border-t p-4 px-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer border-border"
            style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)", color: "#374151" }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[var(--erp-pos)] text-white hover:opacity-90 border-none shadow-none cursor-pointer"
            style={{ background: "var(--erp-pos)" }}
          >
            บันทึกผู้รับ
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
