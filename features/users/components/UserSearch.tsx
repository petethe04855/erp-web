"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { SearchPanel } from "@/components/common/SearchPanel";
import { ROLE_CONFIG, type UserFilterState, type UserRole } from "../types/user";

interface UserSearchProps {
  filters: UserFilterState;
  stats: { total: number; active: number; inactive: number };
  onSearch: (val: string) => void;
  onRoleChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onReset: () => void;
}

export function UserSearch({
  filters,
  stats,
  onSearch,
  onRoleChange,
  onStatusChange,
  onReset,
}: UserSearchProps) {
  let activeCount = 0;
  if (filters.search) activeCount++;
  if (filters.role !== "all") activeCount++;
  if (filters.status !== "all") activeCount++;

  return (
    <div className="space-y-4">
      {/* Quick Summary Cards */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
        <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          สรุปผู้ใช้ทั้งหมด
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-neutral-50 p-2.5 dark:bg-neutral-800/60">
            <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {stats.total}
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
              ทั้งหมด
            </div>
          </div>
          <div className="rounded-lg bg-emerald-50 p-2.5 dark:bg-emerald-950/30">
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {stats.active}
            </div>
            <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
              ใช้งานอยู่
            </div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-2.5 dark:bg-neutral-800/40">
            <div className="text-lg font-bold text-neutral-500 dark:text-neutral-400">
              {stats.inactive}
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
              ปิดใช้งาน
            </div>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <SearchPanel
        title="ค้นหา / ตัวกรอง"
        onReset={onReset}
        activeFilterCount={activeCount}
      >
        <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
          ค้นหาผู้ใช้
          <Input
            type="search"
            className="mt-1.5 text-xs"
            value={filters.search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="ค้นหาชื่อ, นามสกุล หรืออีเมล..."
          />
        </label>

        <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
          บทบาท (Role)
          <select
            className="mt-1.5 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            value={filters.role}
            onChange={(e) => onRoleChange(e.target.value)}
          >
            <option value="all">ทุกบทบาท (All Roles)</option>
            {Object.entries(ROLE_CONFIG).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
          สถานะ (Status)
          <select
            className="mt-1.5 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            value={filters.status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">ทุกสถานะ (All Status)</option>
            <option value="active">ใช้งานอยู่ (Active)</option>
            <option value="inactive">ปิดใช้งาน (Inactive)</option>
          </select>
        </label>
      </SearchPanel>
    </div>
  );
}
