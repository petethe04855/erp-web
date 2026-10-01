"use client";

import { useState, useCallback } from "react";
import { useDashboardQuery } from "../queries/dashboardQueries";

export function useDashboard() {
  const getCurrentYM = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  };

  const currentYM = getCurrentYM();
  const [month, setMonth] = useState<string>(currentYM);

  const shiftMonth = useCallback(
    (offset: number) => {
      const [yStr, mStr] = (month || currentYM).split("-");
      const d = new Date(parseInt(yStr, 10), parseInt(mStr, 10) - 1 + offset, 1);
      const newY = d.getFullYear();
      const newM = String(d.getMonth() + 1).padStart(2, "0");
      setMonth(`${newY}-${newM}`);
    },
    [month, currentYM]
  );

  const resetToCurrent = useCallback(() => {
    setMonth(currentYM);
  }, [currentYM]);

  return {
    ...useDashboardQuery(month),
    month,
    setMonth,
    shiftMonth,
    resetToCurrent,
    isCurrentMonth: month === currentYM,
    currentYM,
  };
}
