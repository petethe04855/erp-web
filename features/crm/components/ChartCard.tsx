"use client";

import React from "react";

/** Light-theme Chart.js colors shared by the CRM charts. */
export const CHART_THEME = {
  tick: "#6b7280",
  legend: "#374151",
  gridX: "rgba(0, 0, 0, 0.04)",
  gridY: "rgba(0, 0, 0, 0.06)",
} as const;

interface ChartCardProps {
  title: string;
  desc?: React.ReactNode;
  actions?: React.ReactNode;
  /** Chart area height in px (HTML uses 300 / 350 / 280). */
  height?: number;
  children: React.ReactNode;
}

/** Chart card with the layout of .chart-card / .chart-header / .chart-container from the analytics HTML. */
export function ChartCard({ title, desc, actions, height = 300, children }: ChartCardProps) {
  return (
    <div className="min-w-0 rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="mb-0.5 text-base font-bold text-neutral-900 dark:text-neutral-100">{title}</h3>
          {desc && <p className="text-[0.78rem] text-neutral-500 dark:text-neutral-400">{desc}</p>}
        </div>
        {actions}
      </div>
      <div className="relative w-full" style={{ height }}>
        {children}
      </div>
    </div>
  );
}

interface ChartToggleProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** Segmented buttons matching .filter-btn-group in the analytics HTML. */
export function ChartToggle<T extends string>({ value, options, onChange }: ChartToggleProps<T>) {
  return (
    <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-[3px] dark:border-neutral-700 dark:bg-neutral-800">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
            value === o.value
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
              : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
