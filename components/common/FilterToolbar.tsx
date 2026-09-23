"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterToolbarProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  onReset?: () => void;
  activeFilterCount?: number;
  className?: string;
}

/**
 * FilterToolbar
 * Standard horizontal filter toolbar for ERP management pages.
 * Displays search inputs, dropdown filters, reset button, and right-aligned action buttons (e.g. New Record).
 */
export function FilterToolbar({
  children,
  actions,
  onReset,
  activeFilterCount = 0,
  className,
}: FilterToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:flex-row lg:items-center lg:justify-between",
        className
      )}
    >
      {/* Left side: Search inputs and filter dropdowns */}
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {children}

        {/* Reset filter button */}
        {onReset && activeFilterCount > 0 && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onReset}
            className="h-9 px-2.5 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            title="ล้างตัวกรองทั้งหมด"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            ล้างตัวกรอง ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Right side: Action buttons (e.g. New Button, Export, Sync) */}
      {actions && (
        <div className="flex shrink-0 items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 lg:border-t-0 lg:pt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
