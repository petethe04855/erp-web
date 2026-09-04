"use client";

import { Download, Printer } from "lucide-react";
import { useTheme } from "@/lib/design/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RoundingPolicy } from "@/lib/mockData";

interface LiveOperationsBarProps {
  payrollMonth: string;
  onPayrollMonthChange: (month: string) => void;
  canSeeAllPayroll: boolean;
  hourlyRateDraft: number | "";
  onHourlyRateDraftChange: (val: number | "") => void;
  savingPayroll: boolean;
  payrollSaveMessage: string;
  onSavePayrollRates: () => void;
  roundingPolicy: RoundingPolicy;
  onRoundingPolicyChange: (policy: RoundingPolicy) => void;
  onExportCsv: () => void;
  onPrintPdf: () => void;
}

export function LiveOperationsBar({
  payrollMonth,
  onPayrollMonthChange,
  canSeeAllPayroll,
  hourlyRateDraft,
  onHourlyRateDraftChange,
  savingPayroll,
  payrollSaveMessage,
  onSavePayrollRates,
  roundingPolicy,
  onRoundingPolicyChange,
  onExportCsv,
  onPrintPdf,
}: LiveOperationsBarProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  return (
    <>
      {/* Live Operations divider */}
      <div
        className="border-t border-border pt-6 mt-4"
        style={{ borderColor: "var(--erp-border)" }}
      >
        <div
          className="text-base font-bold text-foreground"
          style={{ color: "var(--erp-ink)" }}
        >
          Live Operations
        </div>
        <div
          className="text-xs text-muted-foreground mt-1"
          style={{ color: "var(--erp-ink3)" }}
        >
          บันทึกเวลา ยอดขาย คลิป และ Payroll Export
        </div>
      </div>

      {/* Rounding toggle + export buttons */}
      <div className="flex gap-2 items-center justify-end flex-wrap">
        <div className="grid gap-1">
          <Label className="text-[11px] text-muted-foreground">
            เดือนเงินเดือน
          </Label>
          <Input
            type="month"
            value={payrollMonth}
            onChange={(event) => onPayrollMonthChange(event.target.value)}
            className="h-9 w-40"
          />
        </div>
        {canSeeAllPayroll && (
          <div className="grid gap-1">
            <Label className="text-[11px] text-muted-foreground">
              เรทเริ่มต้นต่อชั่วโมง (บาท)
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                placeholder="0"
                value={hourlyRateDraft}
                onFocus={(event) => event.target.select()}
                onKeyDown={(event) => {
                  if (
                    event.key === "0" &&
                    (!event.currentTarget.value || event.currentTarget.value === "0")
                  ) {
                    event.preventDefault();
                  }
                }}
                onChange={(event) => {
                  const clean = event.target.value.replace(/^0+/, "");
                  onHourlyRateDraftChange(clean === "" ? "" : Number(clean));
                }}
                className="h-9 w-32"
              />
              <Button
                size="sm"
                disabled={savingPayroll}
                onClick={onSavePayrollRates}
                className="h-9 bg-[var(--erp-accent)] text-white cursor-pointer"
              >
                {savingPayroll ? "กำลังบันทึก..." : "บันทึกเรท"}
              </Button>
            </div>
            {payrollSaveMessage && (
              <div
                className={`text-xs ${
                  payrollSaveMessage.startsWith("บันทึกไม่สำเร็จ")
                    ? "text-destructive"
                    : "text-emerald-700"
                }`}
              >
                {payrollSaveMessage}
              </div>
            )}
          </div>
        )}
        <div
          className="inline-flex p-1 bg-muted rounded-lg border border-border"
          style={{
            background: "var(--erp-subtle)",
            borderColor: "var(--erp-border)",
          }}
        >
          {[
            { key: "actual", label: "Actual" },
            { key: "quarter_up", label: "15m Up" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onRoundingPolicyChange(item.key as RoundingPolicy)}
              className="px-3 py-1.5 border-none rounded-md text-xs font-bold cursor-pointer transition-all"
              style={{
                background:
                  roundingPolicy === item.key
                    ? "var(--erp-surface)"
                    : "transparent",
                color:
                  roundingPolicy === item.key ? c.accent : "var(--erp-ink3)",
                boxShadow:
                  roundingPolicy === item.key
                    ? "0 1px 2px rgba(0,0,0,0.08)"
                    : "none",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={onExportCsv}
          className="cursor-pointer gap-1.5 h-9"
        >
          <Download className="size-4" /> CSV
        </Button>
        <Button
          variant="outline"
          onClick={onPrintPdf}
          className="cursor-pointer gap-1.5 h-9"
        >
          <Printer className="size-4" /> PDF
        </Button>
      </div>
    </>
  );
}
