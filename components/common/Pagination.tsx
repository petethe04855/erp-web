"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  limit?: number;
  limitOptions?: number[];
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  showQuickJump?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  limit = 10,
  limitOptions = [10, 20, 50, 100],
  onPageChange,
  onLimitChange,
  showQuickJump = true,
}) => {
  const [jumpPage, setJumpPage] = useState("");

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setJumpPage("");
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-4 text-xs">
      {/* Left: Item Counter & Rows Per Page */}
      <div className="flex flex-wrap items-center gap-4 text-muted-foreground w-full sm:w-auto justify-between sm:justify-start">
        {totalItems !== undefined && (
          <p>
            แสดง{" "}
            <span className="font-semibold text-foreground">
              {totalItems > 0 ? (currentPage - 1) * limit + 1 : 0}
            </span>{" "}
            ถึง{" "}
            <span className="font-semibold text-foreground">
              {Math.min(currentPage * limit, totalItems)}
            </span>{" "}
            จากทั้งหมด{" "}
            <span className="font-semibold text-foreground">
              {totalItems.toLocaleString("th-TH")}
            </span>{" "}
            รายการ
          </p>
        )}

        {onLimitChange && (
          <div className="flex items-center space-x-1.5">
            <span>แสดง</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs text-neutral-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span>แถว/หน้า</span>
          </div>
        )}
      </div>

      {/* Right: Page Navigation & Quick Jump */}
      <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto w-full sm:w-auto justify-center sm:justify-end">
        {/* First Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0"
          title="หน้าแรก"
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First Page</span>
        </Button>

        {/* Previous */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0"
          title="ก่อนหน้า"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous Page</span>
        </Button>

        {/* Numbered Page Buttons */}
        <div className="hidden sm:flex items-center space-x-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1.5 py-1 text-muted-foreground"
                >
                  …
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <Button
                key={p}
                variant={isCurrent ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(Number(p))}
                className={`h-8 min-w-[32px] px-2 text-xs font-medium ${
                  isCurrent ? "pointer-events-none" : ""
                }`}
              >
                {p}
              </Button>
            );
          })}
        </div>

        {/* Mobile Page Indicator */}
        <span className="sm:hidden text-xs font-medium px-2">
          {currentPage} / {totalPages || 1}
        </span>

        {/* Next */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || totalPages === 0}
          className="h-8 w-8 p-0"
          title="ถัดไป"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next Page</span>
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages || totalPages === 0}
          className="h-8 w-8 p-0"
          title="หน้าสุดท้าย"
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Last Page</span>
        </Button>

        {/* Quick Jump Input */}
        {showQuickJump && totalPages > 1 && (
          <form
            onSubmit={handleJump}
            className="flex items-center space-x-1 ml-2 pl-2 border-l border-neutral-200 dark:border-neutral-800"
          >
            <span className="text-muted-foreground">ไปหน้า</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              placeholder={String(currentPage)}
              className="h-8 w-12 rounded-md border border-neutral-300 bg-white px-1.5 text-center text-xs text-neutral-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
            >
              ไป
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
