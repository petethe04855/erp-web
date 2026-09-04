"use client";

import { FileText } from "lucide-react";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card } from "@/components/ui";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatBaht, type LiveStaff } from "@/lib/mockData";

export interface PayrollRowData {
  staff: LiveStaff;
  hours: number;
  revenue: number;
  clips: number;
  hourlyRate: number;
  hourlyPay: number;
  clipBonus: number;
  grossPay: number;
}

interface LivePayrollTableProps {
  payrollMonth: string;
  clipBonusRate: number;
  payrollRows: PayrollRowData[];
  payrollTotals: {
    hours: number;
    hourlyPay: number;
    clipBonus: number;
    grossPay: number;
  };
  canSeeAllPayroll: boolean;
  staffRateDrafts: Record<string, number | "">;
  onStaffRateDraftChange: (staffId: string, val: number | "") => void;
}

export function LivePayrollTable({
  payrollMonth,
  clipBonusRate,
  payrollRows,
  payrollTotals,
  canSeeAllPayroll,
  staffRateDrafts,
  onStaffRateDraftChange,
}: LivePayrollTableProps) {
  const { tokens: t } = useTheme();

  return (
    <Card
      t={t}
      pad={false}
      className="overflow-hidden border border-border bg-card"
      style={{
        borderColor: "var(--erp-border)",
        background: "var(--erp-surface)",
      }}
    >
      <div
        className="p-4 px-5 border-b border-border flex items-center justify-between gap-4"
        style={{ borderColor: "var(--erp-border)" }}
      >
        <div>
          <div
            className="text-sm font-bold text-foreground"
            style={{ color: "var(--erp-ink)" }}
          >
            สรุปเงินค่าไลฟ์ประจำเดือน {payrollMonth}
          </div>
          <div
            className="text-xs text-muted-foreground mt-1"
            style={{ color: "var(--erp-ink3)" }}
          >
            คำนวณเฉพาะรายการที่อนุมัติแล้ว: (ชั่วโมง × เรทรายบุคคล) + (คลิป × ฿
            {clipBonusRate}/คลิป)
          </div>
        </div>
        <FileText
          className="size-5 text-muted-foreground"
          style={{ color: "var(--erp-ink4)" }}
        />
      </div>
      <div className="overflow-x-auto">
        <Table className="w-full border-collapse">
          <TableHeader
            className="bg-muted/50 border-b border-border"
            style={{
              background: "var(--erp-subtle)",
              borderColor: "var(--erp-border)",
            }}
          >
            <TableRow>
              <TableHead
                className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                style={{ color: "var(--erp-ink3)" }}
              >
                พนักงาน
              </TableHead>
              <TableHead
                className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                style={{ color: "var(--erp-ink3)" }}
              >
                ชั่วโมง
              </TableHead>
              <TableHead
                className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                style={{ color: "var(--erp-ink3)" }}
              >
                เรท/ชม.
              </TableHead>
              <TableHead
                className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                style={{ color: "var(--erp-ink3)" }}
              >
                ยอดขาย
              </TableHead>
              <TableHead
                className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                style={{ color: "var(--erp-ink3)" }}
              >
                คลิป
              </TableHead>
              <TableHead
                className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                style={{ color: "var(--erp-ink3)" }}
              >
                Hourly
              </TableHead>
              <TableHead
                className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                style={{ color: "var(--erp-ink3)" }}
              >
                Clip Bonus
              </TableHead>
              <TableHead
                className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                style={{ color: "var(--erp-ink3)" }}
              >
                ยอดจ่าย
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrollRows.map((row) => (
              <TableRow
                key={row.staff.id}
                className="border-b border-border"
                style={{ borderColor: "var(--erp-border)" }}
              >
                <TableCell className="p-4 px-5 align-middle">
                  <div
                    className="text-sm font-bold text-foreground"
                    style={{ color: "var(--erp-ink)" }}
                  >
                    {row.staff.name}
                  </div>
                  <div
                    className="text-xs text-muted-foreground mt-1"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    {row.staff.role}
                  </div>
                </TableCell>
                <TableCell className="p-4 px-5 align-middle text-sm font-bold">
                  {row.hours.toFixed(2)}
                </TableCell>
                <TableCell className="p-4 px-5 align-middle text-right text-sm font-bold">
                  {canSeeAllPayroll ? (
                    <Input
                      type="number"
                      min={1}
                      placeholder="0"
                      value={staffRateDrafts[row.staff.id] ?? ""}
                      onFocus={(event) => event.target.select()}
                      onKeyDown={(event) => {
                        if (
                          event.key === "0" &&
                          (!event.currentTarget.value ||
                            event.currentTarget.value === "0")
                        ) {
                          event.preventDefault();
                        }
                      }}
                      onChange={(event) => {
                        const clean = event.target.value.replace(/^0+/, "");
                        onStaffRateDraftChange(
                          row.staff.id,
                          clean === "" ? "" : Number(clean),
                        );
                      }}
                      className="ml-auto h-8 w-24 text-right"
                    />
                  ) : (
                    formatBaht(row.hourlyRate)
                  )}
                </TableCell>
                <TableCell className="p-4 px-5 align-middle text-right text-sm font-bold">
                  {formatBaht(row.revenue)}
                </TableCell>
                <TableCell className="p-4 px-5 align-middle text-sm">
                  {row.clips}
                </TableCell>
                <TableCell className="p-4 px-5 align-middle text-right text-sm font-bold">
                  {formatBaht(row.hourlyPay)}
                </TableCell>
                <TableCell
                  className="p-4 px-5 align-middle text-right text-sm font-bold"
                  style={{ color: "var(--erp-warn)" }}
                >
                  {formatBaht(row.clipBonus)}
                </TableCell>
                <TableCell className="p-4 px-5 align-middle text-right text-sm font-extrabold">
                  {formatBaht(row.grossPay)}
                </TableCell>
              </TableRow>
            ))}
            {canSeeAllPayroll && (
              <TableRow className="bg-muted/40 font-bold">
                <TableCell className="p-4 px-5">รวมประจำเดือน</TableCell>
                <TableCell className="p-4 px-5">
                  {payrollTotals.hours.toFixed(2)}
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell className="p-4 px-5 text-right">
                  {formatBaht(payrollTotals.hourlyPay)}
                </TableCell>
                <TableCell className="p-4 px-5 text-right">
                  {formatBaht(payrollTotals.clipBonus)}
                </TableCell>
                <TableCell className="p-4 px-5 text-right">
                  {formatBaht(payrollTotals.grossPay)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
