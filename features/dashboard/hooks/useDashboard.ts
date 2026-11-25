"use client";

import { useState } from "react";
import { useDashboardQuery } from "../queries/dashboardQueries";
import { formatThaiMonth, monthsOfYear } from "../lib/metrics";

/** Whether the dashboard shows one month or a whole year. */
export type PeriodMode = "month" | "year";

const currentYearMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export function useDashboard() {
  const currentYM = currentYearMonth();
  const currentYear = parseInt(currentYM.slice(0, 4), 10);

  const [mode, setMode] = useState<PeriodMode>("month");
  const [month, setMonth] = useState<string>(currentYM);
  const [year, setYear] = useState<number>(currentYear);

  const months = mode === "month" ? [month] : monthsOfYear(year, currentYM);

  return {
    ...useDashboardQuery(months, currentYM),
    mode,
    setMode,
    month,
    setMonth,
    year,
    setYear,
    /** Every month (YYYY-MM) in the selected period, oldest first. */
    months,
    from: months[0],
    to: months[months.length - 1],
    label: mode === "month" ? formatThaiMonth(month) : `ปี ${year + 543}`,
    isCurrentMonth: month === currentYM,
    isCurrentPeriod: mode === "month" ? month === currentYM : year === currentYear,
    currentYM,
    currentYear,
  };
}
