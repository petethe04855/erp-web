"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/design/ThemeContext";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function fmtMonth(key: string) {
  const [y, m] = key.split("-");
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
}

interface MonthPickerProps {
  month: string;
  onChange: (month: string) => void;
  nowKey: string;
}

export function MonthPicker({ month, onChange, nowKey }: MonthPickerProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear());

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => {
          setShowPicker((v) => !v);
          setPickerYear(parseInt(month.split("-")[0]));
        }}
        className="cursor-pointer gap-1.5"
      >
        {fmtMonth(month)} ▾
      </Button>
      {showPicker && (
        <>
          <div
            onClick={() => setShowPicker(false)}
            className="fixed inset-0 z-[100]"
          />
          <div
            className="absolute top-full right-0 mt-1.5 p-4 border border-border bg-card rounded-lg shadow-2xl z-[101] w-60"
            style={{ borderColor: "var(--erp-border)" }}
          >
            {/* Year navigation */}
            <div className="flex items-center justify-between mb-3.5">
              <button
                type="button"
                onClick={() => setPickerYear((y) => y - 1)}
                className="w-7 h-7 border rounded-md bg-canvas cursor-pointer flex items-center justify-center text-sm font-medium"
                style={{
                  borderColor: "var(--erp-border)",
                  color: "var(--erp-ink2)",
                }}
              >
                ‹
              </button>
              <span className="text-sm font-bold" style={{ color: "var(--erp-ink)" }}>
                {pickerYear}
              </span>
              <button
                type="button"
                onClick={() => setPickerYear((y) => y + 1)}
                disabled={pickerYear >= parseInt(nowKey.split("-")[0])}
                className="w-7 h-7 border rounded-md bg-canvas cursor-pointer flex items-center justify-center text-sm font-medium disabled:opacity-50"
                style={{
                  borderColor: "var(--erp-border)",
                  color:
                    pickerYear >= parseInt(nowKey.split("-")[0])
                      ? "var(--erp-ink4)"
                      : "var(--erp-ink2)",
                }}
              >
                ›
              </button>
            </div>
            {/* Month grid 4×3 */}
            <div className="grid grid-cols-4 gap-1.5">
              {MONTH_NAMES.map((name, i) => {
                const key = `${pickerYear}-${String(i + 1).padStart(2, "0")}`;
                const isCurrent = key === month;
                const isFuture = key > nowKey;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isFuture}
                    onClick={() => {
                      onChange(key);
                      setShowPicker(false);
                    }}
                    className="py-1.5 border-none rounded-md text-xs font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: isCurrent ? c.accent : "transparent",
                      color: isCurrent ? "#fff" : isFuture ? c.ink4 : c.ink2,
                    }}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
