"use client";

import React, { useMemo, useState } from "react";
import { Search, ArrowUpDown, AlertTriangle } from "lucide-react";
import type { TiktokProvinceRow } from "../types/crm";
import { REGION_FILTERS, UNKNOWN_PROVINCE } from "../constants/regions";

interface ProvinceTableProps {
  provinces: TiktokProvinceRow[];
  isLoading?: boolean;
}

type SortField = "province" | "region" | "orderCount" | "sharePercent" | "itemQty" | "grossSales" | "avgOrderValue";

const COLUMNS: { field: SortField; label: string; align?: "right" }[] = [
  { field: "province", label: "จังหวัด" },
  { field: "region", label: "ภูมิภาค" },
  { field: "orderCount", label: "คำสั่งซื้อ", align: "right" },
  { field: "sharePercent", label: "สัดส่วน (%)", align: "right" },
  { field: "itemQty", label: "จำนวนชิ้น", align: "right" },
  { field: "grossSales", label: "ยอดขายรวม (THB)", align: "right" },
  { field: "avgOrderValue", label: "ยอด/บิล (AOV)", align: "right" },
];

const money = (v: number, digits = 0) =>
  `฿${v.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

export function ProvinceTable({ provinces, isLoading }: ProvinceTableProps) {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");
  const [sortField, setSortField] = useState<SortField>("orderCount");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const rows = useMemo(() => {
    const q = search.toLowerCase().trim();
    return provinces
      .filter((p) => region === "all" || p.region === region)
      .filter((p) => !q || p.province.toLowerCase().includes(q) || (p.region ?? "").toLowerCase().includes(q))
      .sort((a, b) => {
        const vA = a[sortField] ?? "";
        const vB = b[sortField] ?? "";
        if (typeof vA === "string" && typeof vB === "string") {
          return sortAsc ? vA.localeCompare(vB, "th") : vB.localeCompare(vA, "th");
        }
        return sortAsc ? Number(vA) - Number(vB) : Number(vB) - Number(vA);
      });
  }, [provinces, search, region, sortField, sortAsc]);

  const provinceCount = provinces.filter((p) => p.province !== UNKNOWN_PROVINCE).length;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-3 border-b border-neutral-200/80 p-4 dark:border-neutral-800">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              📋 ตารางข้อมูลลูกค้าและยอดขายแยกตามรายจังหวัด ({provinceCount} จังหวัด)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              ค้นหาชื่อจังหวัด หรือคลิกกรองตามภาคเพื่อดูจำนวนคำสั่งซื้อ ยอดรวม และยอดเฉลี่ยต่อบิล
            </p>
          </div>
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="ค้นหาจังหวัดหรือภาค..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {REGION_FILTERS.map((r) => {
            const active = region === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRegion(r.value)}
                className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  active
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-h-[480px] overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 z-10 border-b border-neutral-200/80 bg-neutral-50 font-medium text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400">
            <tr>
              <th className="w-12 px-4 py-3">#</th>
              {COLUMNS.map((c) => (
                <th
                  key={c.field}
                  onClick={() => handleSort(c.field)}
                  className={`cursor-pointer whitespace-nowrap px-4 py-3 hover:text-neutral-900 dark:hover:text-neutral-200 ${c.align === "right" ? "text-right" : ""}`}
                >
                  <span className={`inline-flex items-center gap-1 ${sortField === c.field ? "text-neutral-900 dark:text-neutral-100" : ""}`}>
                    {c.label}
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="px-4 py-3.5">
                    <div className="h-4 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-neutral-400">
                  ไม่พบข้อมูลจังหวัด
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={row.province} className="transition-colors hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                  <td className="px-4 py-3 font-mono text-neutral-400">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">{row.province}</span>
                      {row.province === UNKNOWN_PROVINCE && (
                        <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          ยังไม่ระบุที่อยู่
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="whitespace-nowrap rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      {row.region || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <strong className="text-neutral-900 dark:text-neutral-100">{row.orderCount.toLocaleString()}</strong> บิล
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-cyan-600 dark:text-cyan-400">
                    {row.sharePercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-600 dark:text-neutral-300">{row.itemQty.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                    {money(row.grossSales, 2)}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-700 dark:text-neutral-300">{money(row.avgOrderValue ?? 0, 2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
