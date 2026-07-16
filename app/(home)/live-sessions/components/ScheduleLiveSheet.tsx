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

const SCHEDULE_PLATFORMS = [
  "TikTok Live",
  "Facebook Live",
  "Shopee Live",
  "Instagram Live",
] as const;

const SCHEDULE_ACCOUNTS: Record<string, string[]> = {
  "TikTok Live": ["@chawy_official", "@chawy_petfood", "@chawy_live"],
  "Facebook Live": ["@chawy_fb", "@chawy_fanpage"],
  "Shopee Live": ["@chawy_shopee"],
  "Instagram Live": ["@chawy_ig"],
};

const BLANK_SCHEDULE = {
  platform: "TikTok Live",
  account: "@chawy_official",
  status: "scheduled" as const,
  topic: "",
  date: "",
  startTime: "20:00",
  endTime: "22:00",
};

function calcDuration(start: string, end: string): string | null {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 && m > 0
    ? `${h} ชม. ${m} นาที`
    : h > 0
    ? `${h} ชม.`
    : `${m} นาที`;
}

interface ScheduleLiveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    platform: string;
    account: string;
    status: "scheduled";
    topic: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
  showToast: (msg: string) => void;
}

export function ScheduleLiveSheet({
  open,
  onOpenChange,
  onSubmit,
  showToast,
}: ScheduleLiveSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [scheduleForm, setScheduleForm] = useState(BLANK_SCHEDULE);
  const [scheduleErrors, setScheduleErrors] = useState<{
    date?: string;
    topic?: string;
    time?: string;
  }>({});

  function submitSchedule() {
    const errors: typeof scheduleErrors = {};
    if (!scheduleForm.date) errors.date = "กรุณาเลือกวันที่";
    if (!scheduleForm.topic.trim()) errors.topic = "กรุณาใส่หัวข้อ";
    if (!calcDuration(scheduleForm.startTime, scheduleForm.endTime)) {
      errors.time = "เวลาจบต้องมากกว่าเวลาเริ่ม";
    }

    if (Object.keys(errors).length > 0) {
      setScheduleErrors(errors);
      return;
    }

    onSubmit(scheduleForm);
    setScheduleForm(BLANK_SCHEDULE);
    setScheduleErrors({});
    onOpenChange(false);
  }

  const duration = calcDuration(scheduleForm.startTime, scheduleForm.endTime);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[min(520px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base font-bold text-foreground" style={{ color: "var(--erp-ink)" }}>
            Schedule Live
          </SheetTitle>
        </SheetHeader>
        <SheetBody className="grid gap-4 overflow-y-auto">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              แพลตฟอร์ม
            </Label>
            <NativeSelect
              value={scheduleForm.platform}
              onChange={(e) => {
                const platform = e.target.value;
                setScheduleForm((f) => ({
                  ...f,
                  platform,
                  account: SCHEDULE_ACCOUNTS[platform]?.[0] ?? "",
                }));
              }}
              className="w-full cursor-pointer"
            >
              {SCHEDULE_PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              ชื่อช่อง
            </Label>
            <NativeSelect
              value={scheduleForm.account}
              onChange={(e) => setScheduleForm((f) => ({ ...f, account: e.target.value }))}
              className="w-full cursor-pointer"
            >
              {(SCHEDULE_ACCOUNTS[scheduleForm.platform] ?? []).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </NativeSelect>
            <div className="text-[11px] text-muted-foreground mt-1" style={{ color: "var(--erp-ink4)" }}>
              ตัวเลือกเปลี่ยนตามแพลตฟอร์มที่เลือก
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              วันที่ไลฟ์
            </Label>
            <Input
              type="date"
              value={scheduleForm.date}
              onChange={(e) => {
                setScheduleForm((f) => ({ ...f, date: e.target.value }));
                setScheduleErrors((er) => ({ ...er, date: undefined }));
              }}
            />
            {scheduleErrors.date && (
              <div className="text-xs text-red-500 mt-1" style={{ color: "var(--erp-neg)" }}>
                {scheduleErrors.date}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                เวลาเริ่ม
              </Label>
              <Input
                type="time"
                value={scheduleForm.startTime}
                onChange={(e) => {
                  setScheduleForm((f) => ({ ...f, startTime: e.target.value }));
                  setScheduleErrors((er) => ({ ...er, time: undefined }));
                }}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                เวลาจบ
              </Label>
              <Input
                type="time"
                value={scheduleForm.endTime}
                onChange={(e) => {
                  setScheduleForm((f) => ({ ...f, endTime: e.target.value }));
                  setScheduleErrors((er) => ({ ...er, time: undefined }));
                }}
              />
            </div>
          </div>

          {duration ? (
            <div className="mt-1 p-3 bg-muted rounded-lg flex justify-between items-center" style={{ background: "var(--erp-subtle)" }}>
              <span className="text-xs text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>
                ระยะเวลา
              </span>
              <span className="text-sm font-semibold text-foreground" style={{ color: "var(--erp-ink)" }}>
                {duration}
              </span>
            </div>
          ) : (
            scheduleErrors.time && (
              <div className="text-xs text-red-500 mt-1" style={{ color: "var(--erp-neg)" }}>
                {scheduleErrors.time}
              </div>
            )
          )}

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              หัวข้อ / Topic *
            </Label>
            <Input
              value={scheduleForm.topic}
              onChange={(e) => {
                setScheduleForm((f) => ({ ...f, topic: e.target.value }));
                setScheduleErrors((er) => ({ ...er, topic: undefined }));
              }}
              placeholder="เช่น รีวิวอาหารใหม่ แฮมอน+ไก่..."
            />
            {scheduleErrors.topic && (
              <div className="text-xs text-red-500 mt-1" style={{ color: "var(--erp-neg)" }}>
                {scheduleErrors.topic}
              </div>
            )}
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
            onClick={submitSchedule}
            className="bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none cursor-pointer"
          >
            บันทึก Schedule
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
