"use client";

import { useState } from "react";
import { Link as LinkIcon, Image as ImageIcon, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { useTheme } from "@/lib/design/ThemeContext";
import {
  getLiveNetMinutes,
  getRoundedLiveMinutes,
  getLiveDecimalHours,
  hasLiveOverlap,
  type LivePlatform,
  type RoundingPolicy,
} from "@/lib/mockData";

const PLATFORMS: LivePlatform[] = ["TikTok", "Shopee", "Lazada"];
const LIVE_ACCOUNTS: Record<LivePlatform, string[]> = {
  TikTok: ["@chawy_official", "@chawy_petfood", "@chawy_live"],
  Shopee: ["@chawy_shopee", "@chawy_shop_live"],
  Lazada: ["@chawy_lazada", "@chawy_lazlive"],
};

const BLANK_FORM = {
  staff_id: "STF-001",
  live_date: "2026-05-13",
  platform: "TikTok" as LivePlatform,
  tiktok_account: "@chawy_official",
  start_datetime: "2026-05-13T20:00",
  end_datetime: "2026-05-13T22:30",
  break_minutes: 0,
  revenue_generated: 0,
  has_clip: false,
  clip_link: "",
  live_summary_image: "",
  host_notes: "",
};

interface Staff {
  id: string;
  name: string;
}

interface Session {
  id: string;
  staff_id: string;
  live_date: string;
  start_datetime: string;
  end_datetime: string;
}

interface StaffCheckoutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  liveStaff: Staff[];
  sessions: Session[];
  roundingPolicy: RoundingPolicy;
  onSubmit: (data: {
    staff_id: string;
    live_date: string;
    platform: LivePlatform;
    tiktok_account: string;
    start_datetime: string;
    end_datetime: string;
    break_minutes: number;
    revenue_generated: number;
    has_clip: boolean;
    clip_link: string;
    live_summary_image: string;
    host_notes: string;
    rejection_reason: string;
  }) => void;
  showToast: (msg: string) => void;
}

export function StaffCheckoutSheet({
  open,
  onOpenChange,
  liveStaff,
  sessions,
  roundingPolicy,
  onSubmit,
  showToast,
}: StaffCheckoutSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [form, setForm] = useState<{
    staff_id: string;
    live_date: string;
    platform: LivePlatform;
    tiktok_account: string;
    start_datetime: string;
    end_datetime: string;
    break_minutes: number | "";
    revenue_generated: number | "";
    has_clip: boolean;
    clip_link: string;
    live_summary_image: string;
    host_notes: string;
  }>(BLANK_FORM);

  const formNetMinutes = getLiveNetMinutes({
    ...form,
    break_minutes: Number(form.break_minutes || 0),
  });
  const formHours = getLiveDecimalHours(
    getRoundedLiveMinutes(formNetMinutes, roundingPolicy)
  );

  function submitSession() {
    if (formNetMinutes <= 0) {
      showToast("เวลาจบต้องมากกว่าเวลาเริ่ม");
      return;
    }
    if (
      hasLiveOverlap(sessions as any, {
        staff_id: form.staff_id,
        start_datetime: form.start_datetime,
        end_datetime: form.end_datetime,
      })
    ) {
      showToast("เวลานี้ซ้อนกับ log เดิมของพนักงานคนนี้");
      return;
    }
    if (form.break_minutes === "" || form.revenue_generated === "") {
      showToast("กรุณากรอกเวลาพักและยอดขาย (ใส่ 0 ได้หากไม่มี)");
      return;
    }

    onSubmit({
      ...form,
      break_minutes: Number(form.break_minutes),
      revenue_generated: Number(form.revenue_generated),
      rejection_reason: "",
    });
    setForm(BLANK_FORM);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[min(520px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base font-bold text-foreground" style={{ color: "var(--erp-ink)" }}>
            Staff Check-out
          </SheetTitle>
          <div className="text-xs text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>
            บันทึกไลฟ์หลังจบ · รอ Manager อนุมัติ
          </div>
        </SheetHeader>
        <SheetBody className="grid gap-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                พนักงาน
              </Label>
              <NativeSelect
                value={form.staff_id}
                onChange={(e) => setForm((f) => ({ ...f, staff_id: e.target.value }))}
                className="w-full cursor-pointer"
              >
                {liveStaff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                แพลตฟอร์ม
              </Label>
              <NativeSelect
                value={form.platform}
                onChange={(e) => {
                  const p = e.target.value as LivePlatform;
                  setForm((f) => ({
                    ...f,
                    platform: p,
                    tiktok_account: LIVE_ACCOUNTS[p][0],
                  }));
                }}
                className="w-full cursor-pointer"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              บัญชีไลฟ์
            </Label>
            <NativeSelect
              value={form.tiktok_account}
              onChange={(e) => setForm((f) => ({ ...f, tiktok_account: e.target.value }))}
              className="w-full cursor-pointer"
            >
              {LIVE_ACCOUNTS[form.platform].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                วันที่ไลฟ์
              </Label>
              <Input
                type="date"
                value={form.live_date}
                onChange={(e) => setForm((f) => ({ ...f, live_date: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                พัก (นาที)
              </Label>
              <Input
                type="number"
                min={0}
                value={form.break_minutes}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    break_minutes:
                      e.target.value === ""
                        ? ""
                        : Math.max(0, Number(e.target.value) || 0),
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                เริ่ม
              </Label>
              <Input
                type="datetime-local"
                value={form.start_datetime}
                onChange={(e) => setForm((f) => ({ ...f, start_datetime: e.target.value }))}
                className="text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                จบ
              </Label>
              <Input
                type="datetime-local"
                value={form.end_datetime}
                onChange={(e) => setForm((f) => ({ ...f, end_datetime: e.target.value }))}
                className="text-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg flex justify-between items-center" style={{ background: "var(--erp-subtle)" }}>
            <span className="text-xs text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>
              Net working time
            </span>
            <span className="text-sm font-bold text-foreground" style={{ color: "var(--erp-ink)" }}>
              {formNetMinutes} นาที · {formHours.toFixed(2)} ชม.
            </span>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              ยอดขายสุทธิจากไลฟ์
            </Label>
            <Input
              type="number"
              min={0}
              value={form.revenue_generated}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  revenue_generated:
                    e.target.value === ""
                      ? ""
                      : Math.max(0, Number(e.target.value) || 0),
                }))
              }
            />
          </div>

          <div className="flex items-center gap-2.5 py-1">
            <Checkbox
              id="has_clip"
              checked={form.has_clip}
              onCheckedChange={(checked) =>
                setForm((f) => ({ ...f, has_clip: Boolean(checked) }))
              }
            />
            <Label htmlFor="has_clip" className="text-sm font-semibold text-foreground cursor-pointer select-none">
              มีคลิปหลังไลฟ์แล้ว
            </Label>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              <LinkIcon className="size-3 inline-block align-text-bottom mr-1" /> ลิงก์คลิป
            </Label>
            <Input
              value={form.clip_link}
              onChange={(e) => setForm((f) => ({ ...f, clip_link: e.target.value }))}
              placeholder="https://"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              <ImageIcon className="size-3 inline-block align-text-bottom mr-1" /> รูปสรุปไลฟ์
            </Label>
            <Input
              value={form.live_summary_image}
              onChange={(e) => setForm((f) => ({ ...f, live_summary_image: e.target.value }))}
              placeholder="URL รูป Screenshot"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              Host notes / Feedback
            </Label>
            <Textarea
              value={form.host_notes}
              onChange={(e) => setForm((f) => ({ ...f, host_notes: e.target.value }))}
              rows={3}
              placeholder="บันทึกย่อหลังการไลฟ์..."
            />
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
            onClick={submitSession}
            className="bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none cursor-pointer flex items-center gap-1.5"
          >
            <Send className="size-4" /> Submit for Approval
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
