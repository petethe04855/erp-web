"use client";

import { useTheme } from "@/lib/design/ThemeContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PayrollDraft {
  hourlyRate: string;
  clipBonus: string;
}

interface LivePayrollTabProps {
  draftPayroll: PayrollDraft;
  onChangeDraftPayroll: (updater: (prev: PayrollDraft) => PayrollDraft) => void;
}

export function LivePayrollTab({
  draftPayroll,
  onChangeDraftPayroll,
}: LivePayrollTabProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const hourlyRateVal = parseFloat(draftPayroll.hourlyRate) || 0;
  const clipBonusVal = parseFloat(draftPayroll.clipBonus) || 0;

  return (
    <div>
      <div className="text-sm font-bold text-foreground mb-1" style={{ color: "var(--erp-ink)" }}>
        Live Payroll Settings
      </div>
      <div className="text-xs text-muted-foreground mb-6" style={{ color: "var(--erp-ink3)" }}>
        อัตราค่าแรงและโบนัสใช้เท่ากันสำหรับพนักงาน Live ทุกคน ไม่มี Commission
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mb-6">
        <div>
          <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
            Hourly Rate (฿/ชั่วโมง)
          </Label>
          <div className="text-[11px] text-muted-foreground mb-1.5" style={{ color: "var(--erp-ink3)" }}>
            อัตราค่าแรงต่อชั่วโมง (เหมือนกันทุกคน)
          </div>
          <Input
            type="number"
            min={0}
            value={draftPayroll.hourlyRate}
            onChange={(e) =>
              onChangeDraftPayroll((prev) => ({ ...prev, hourlyRate: e.target.value }))
            }
          />
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
            Clip Bonus (฿/คลิป)
          </Label>
          <div className="text-[11px] text-muted-foreground mb-1.5" style={{ color: "var(--erp-ink3)" }}>
            โบนัสต่อคลิปที่ตัด (เหมือนกันทุกคน)
          </div>
          <Input
            type="number"
            min={0}
            value={draftPayroll.clipBonus}
            onChange={(e) =>
              onChangeDraftPayroll((prev) => ({ ...prev, clipBonus: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="p-4 rounded-lg text-sm" style={{ background: "var(--erp-accent-subtle)", color: "var(--erp-accent)" }}>
        <strong>ตัวอย่าง:</strong> ทำงาน 2.5 ชั่วโมง, ตัด 1 คลิป → ค่าแรง ฿
        {(2.5 * hourlyRateVal).toLocaleString()} + โบนัส ฿
        {clipBonusVal.toLocaleString()} ={" "}
        <strong>฿{(2.5 * hourlyRateVal + clipBonusVal).toLocaleString()}</strong>
      </div>
    </div>
  );
}
