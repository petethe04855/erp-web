"use client";

import { Pagination } from "./Pagination";
import { Loading } from "./Loading";
import { ErrorState } from "./ErrorState";
import type { ApiPaginationMeta } from "@/types/api";

export interface Column<T> {
  key: keyof T;
  label: string;
  money?: boolean;
  render?: (row: T) => React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  rows,
  columns,
  meta,
  isLoading,
  isError,
  onRetry,
  onPageChange,
  onLimitChange,
  actions,
}: {
  rows: T[];
  columns: Column<T>[];
  meta: ApiPaginationMeta;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  actions?: (row: T) => React.ReactNode;
}) {
  if (isLoading) return <Loading message="กำลังโหลดข้อมูล…" />;
  if (isError)
    return (
      <ErrorState
        message="โหลดข้อมูลไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ ERP API"
        onRetry={onRetry}
      />
    );

  const limit = meta.limit || 10;
  const totalPages =
    meta.totalPages && meta.totalPages > 0
      ? meta.totalPages
      : Math.max(1, Math.ceil(meta.total / limit));

  return (
    <section className="border border-neutral-200 bg-white rounded-xl overflow-hidden shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          รายการทั้งหมด
        </span>
        <span className="text-xs text-neutral-500">
          {meta.total.toLocaleString("th-TH")} รายการ
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50/80 border-b border-neutral-200/80 dark:bg-neutral-900/50 dark:border-neutral-800">
            <tr>
              {columns.map((c) => (
                <th
                  key={String(c.key)}
                  className={
                    "px-5 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap " +
                    (c.money ? "text-right" : "text-left")
                  }
                >
                  {c.label}
                </th>
              ))}
              {actions && (
                <th className="p-3 text-right text-xs font-semibold text-neutral-500">
                  <span>จัดการ</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/50 transition-colors"
              >
                {columns.map((c) => (
                  <td
                    key={String(c.key)}
                    className={
                      "px-5 py-3.5 whitespace-nowrap " +
                      (c.money
                        ? "text-right tabular-nums font-medium text-neutral-900 dark:text-neutral-100"
                        : "text-left text-neutral-700 dark:text-neutral-300")
                    }
                  >
                    {c.render ? (
                      c.render(row)
                    ) : row[c.key] === null ||
                      row[c.key] === undefined ||
                      row[c.key] === "" ? (
                      "—"
                    ) : c.money ? (
                      new Intl.NumberFormat("th-TH", {
                        style: "currency",
                        currency: "THB",
                      }).format(Number(row[c.key]))
                    ) : (
                      String(row[c.key])
                    )}
                  </td>
                ))}
                {actions && (
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="text-center py-12 text-sm text-neutral-500">
            <p className="font-medium text-neutral-600 dark:text-neutral-400">
              ไม่พบข้อมูลตามเงื่อนไขนี้
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              ลองปรับเปลี่ยนคำค้นหาหรือตัวกรอง
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30">
        <Pagination
          currentPage={meta.page}
          totalPages={totalPages}
          totalItems={meta.total}
          limit={limit}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      </div>
    </section>
  );
}
