"use client";

import React, { useRef } from "react";
import { Package, TrendingUp, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardView = "sales" | "customers" | "profit";

export const DASHBOARD_VIEWS: { id: DashboardView; label: string; icon: LucideIcon }[] = [
  { id: "sales", label: "ยอดขายและแนวโน้ม", icon: TrendingUp },
  { id: "customers", label: "ลูกค้า", icon: Users },
  { id: "profit", label: "สินค้า กำไร และบัญชี", icon: Package },
];

/** Reads `?view=` from a query string. */
export function viewFromSearch(search: string): DashboardView | null {
  const v = new URLSearchParams(search).get("view");
  return DASHBOARD_VIEWS.some((x) => x.id === v) ? (v as DashboardView) : null;
}

export const tabId = (v: DashboardView) => `dashboard-tab-${v}`;
export const panelId = (v: DashboardView) => `dashboard-panel-${v}`;

interface DashboardTabsProps {
  value: DashboardView;
  onChange: (view: DashboardView) => void;
}

/** The dashboard's main sections, as tabs. */
export function DashboardTabs({ value, onChange }: DashboardTabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + DASHBOARD_VIEWS.length) % DASHBOARD_VIEWS.length;
    onChange(DASHBOARD_VIEWS[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="ส่วนของแดชบอร์ด"
      className="-mx-1 mb-4 flex gap-1 overflow-x-auto border-b border-neutral-200 px-1 dark:border-neutral-800"
    >
      {DASHBOARD_VIEWS.map((v, i) => {
        const on = v.id === value;
        const Icon = v.icon;
        return (
          <button
            key={v.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={tabId(v.id)}
            type="button"
            role="tab"
            aria-selected={on}
            aria-controls={panelId(v.id)}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(v.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "-mb-px inline-flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              on
                ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
