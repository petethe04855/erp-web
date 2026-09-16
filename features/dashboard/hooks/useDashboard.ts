"use client";
import { useState } from "react";
import { useDashboardQuery } from "../queries/dashboardQueries";
export function useDashboard() {
  const [month, setMonth] = useState(() =>
    new Date().toLocaleDateString("en-CA").slice(0, 7),
  );
  return { ...useDashboardQuery(month), month, setMonth };
}
