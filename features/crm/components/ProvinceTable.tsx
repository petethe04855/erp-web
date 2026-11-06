"use client";

import React, { useState, useMemo } from "react";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import type { TiktokProvinceRow } from "../types/crm";

interface ProvinceTableProps {
  provinces: TiktokProvinceRow[];
  isLoading?: boolean;
  onSelectProvince?: (province: string) => void;
  selectedProvince?: string;
}

type SortField = "orderCount" | "itemQty" | "grossSales" | "sharePercent";

export function ProvinceTable({
  provinces,
  isLoading,
  onSelectProvince,
  selectedProvince,
}: ProvinceTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("orderCount");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredAndSorted = useMemo(() => {
    return provinces
      .filter((p) => {
        if (!search.trim()) return true;
        return p.province.toLowerCase().includes(search.toLowerCase().trim());
      })
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
      });
  }, [provinces, search, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const paginated = filteredAndSorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            รายการสถิติทุกจังหวัด ({filteredAndSorted.length} จังหวัด)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            เรียงลำดับและค้นหาข้อมูลจังหวัดทั้งหมด
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อจังหวัด..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-neutral-50/80 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 font-medium border-b border-neutral-200/80 dark:border-neutral-800">
            <tr>
              <th className="py-3 px-4 w-14">อันดับ</th>
              <th className="py-3 px-4">จังหวัด</th>
              <th
                onClick={() => handleSort("orderCount")}
                className="py-3 px-4 text-right cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-200"
              >
                <div className="flex items-center justify-end gap-1">
                  จำนวนออเดอร์
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("itemQty")}
                className="py-3 px-4 text-right cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-200"
              >
                <div className="flex items-center justify-end gap-1">
                  จำนวนชิ้น
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("grossSales")}
                className="py-3 px-4 text-right cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-200"
              >
                <div className="flex items-center justify-end gap-1">
                  ยอดขายรวม (฿)
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("sharePercent")}
                className="py-3 px-4 text-right cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-200"
              >
                <div className="flex items-center justify-end gap-1">
                  สัดส่วน (%)
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="py-3.5 px-4">
                    <div className="h-4 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-400">
                  ไม่พบข้อมูลจังหวัด
                </td>
              </tr>
            ) : (
              paginated.map((row, index) => {
                const rank = (page - 1) * pageSize + index + 1;
                const isSelected = selectedProvince === row.province;
                const isUnknown = row.province === "ไม่ทราบจังหวัด";

                return (
                  <tr
                    key={row.province}
                    onClick={() => onSelectProvince?.(isSelected ? "" : row.province)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary/5 dark:bg-primary/10 font-medium"
                        : "hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40"
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-neutral-400">
                      {rank}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {row.province}
                        </span>
                        {isUnknown && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            ยังไม่ระบุที่อยู่
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-neutral-900 dark:text-neutral-100">
                      {row.orderCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-600 dark:text-neutral-300">
                      {row.itemQty.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-neutral-900 dark:text-neutral-100">
                      ฿{row.grossSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono font-medium text-neutral-700 dark:text-neutral-300">
                        {row.sharePercent.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <div>
            หน้า {page} จาก {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
