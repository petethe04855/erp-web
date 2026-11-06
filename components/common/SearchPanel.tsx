"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw } from "lucide-react";

export interface SearchPanelProps {
  title?: string;
  onReset?: () => void;
  activeFilterCount?: number;
  children: React.ReactNode;
  className?: string;
}

export function SearchPanel({
  title = "ค้นหา / ตัวกรอง",
  onReset,
  activeFilterCount = 0,
  children,
  className = "",
}: SearchPanelProps) {
  return (
    <aside
      className={`space-y-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            {title}
          </h2>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {activeFilterCount}
            </span>
          )}
        </div>

        {onReset && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onReset}
            className="h-7 px-2 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            title="ล้างตัวกรองทั้งหมด"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            ล้าง
          </Button>
        )}
      </div>

      <div className="space-y-4">{children}</div>
    </aside>
  );
}
