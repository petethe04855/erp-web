"use client";

import React from "react";
import { Check } from "lucide-react";
import type { Platform } from "../types/dashboard";
import { ALL_PLATFORMS } from "../types/dashboard";
import { PLATFORM_META } from "../lib/platforms";

interface PlatformFilterProps {
  value: Platform[];
  onChange: (platforms: Platform[]) => void;
}

/** Toggle which platforms the dashboard shows; at least one stays selected. */
export function PlatformFilter({ value, onChange }: PlatformFilterProps) {
  const isAll = value.length === ALL_PLATFORMS.length;

  const toggle = (p: Platform) => {
    if (value.includes(p)) {
      if (value.length === 1) return; // keep at least one platform
      onChange(value.filter((x) => x !== p));
    } else {
      onChange(ALL_PLATFORMS.filter((x) => x === p || value.includes(x)));
    }
  };

  const chip =
    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer";
  const idle =
    "border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200";

  return (
    <div role="group" aria-label="เลือกแพลตฟอร์มที่จะแสดง" className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[11px] font-medium text-neutral-400">แพลตฟอร์ม:</span>
      <button
        type="button"
        aria-pressed={isAll}
        onClick={() => onChange([...ALL_PLATFORMS])}
        className={`${chip} ${isAll ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900" : idle}`}
      >
        ทั้งหมด
      </button>
      {ALL_PLATFORMS.map((p) => {
        const on = value.includes(p);
        const meta = PLATFORM_META[p];
        return (
          <button
            key={p}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(p)}
            className={`${chip} ${on ? meta.active : idle}`}
          >
            {on ? <Check className="h-3 w-3" /> : <span className={`h-2 w-2 rounded-full ${meta.dot}`} />}
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
