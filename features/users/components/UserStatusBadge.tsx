"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface UserStatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export function UserStatusBadge({ isActive, className }: UserStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        isActive
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
          : "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800/60 dark:text-neutral-400 dark:border-neutral-700",
        className,
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          isActive ? "bg-emerald-500" : "bg-neutral-400",
        )}
      />
      {isActive ? "ใช้งานอยู่" : "ปิดใช้งาน"}
    </span>
  );
}
