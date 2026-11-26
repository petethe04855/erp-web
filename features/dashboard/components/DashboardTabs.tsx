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
    <div className="mb-4">
      <div
        role="tablist"
        aria-label="ส่วนของแดชบอร์ด"
        className="inline-flex max-w-full items-center gap-1 overflow-x-auto overflow-y-hidden rounded-xl border border-neutral-200/90 bg-neutral-100/80 p-1 shadow-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden dark:border-neutral-800 dark:bg-neutral-900/80"
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
                "inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1 dark:focus-visible:ring-neutral-100",
                on
                  ? "bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-950/5 dark:bg-neutral-800 dark:text-neutral-50 dark:ring-white/10"
                  : "text-neutral-500 hover:bg-white/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-200",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  on ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-400 dark:text-neutral-500",
                )}
                aria-hidden
              />
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
