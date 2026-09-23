"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { usePurchaseListQuery } from "@/features/purchase/queries/purchaseQueries";
import type { PurchaseOrder } from "@/features/purchase/types/purchase";
import { recordApi } from "@/features/erp/api/recordApi";
import { Input } from "@/components/ui/input";
import { FileText, Loader2, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface POSelectProps {
  value: string; // poNumber e.g. "PO-202603-0001"
  onChange: (poNumber: string, poData?: PurchaseOrder, poDetail?: any) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function POSelect({
  value,
  onChange,
  disabled = false,
  className,
  placeholder = "พิมพ์ค้นหาเลขที่ PO หรือเลือกจากรายการ...",
}: POSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || "");
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch PO list with reasonable limit
  const { data, isLoading } = usePurchaseListQuery({ limit: 100 });
  const purchaseOrders: PurchaseOrder[] = useMemo(() => data?.data || [], [data]);

  // Keep input display synced with external `value`
  useEffect(() => {
    setSearchTerm(value || "");
  }, [value]);

  // Filter based on input
  const filteredPOs = useMemo(() => {
    if (!searchTerm.trim()) {
      return purchaseOrders;
    }
    const lower = searchTerm.toLowerCase().trim();
    return purchaseOrders.filter((po) => {
      const matchNo = po.poNumber?.toLowerCase().includes(lower);
      const matchSup = po.supplierName?.toLowerCase().includes(lower);
      const matchStatus = po.status?.toLowerCase().includes(lower);
      return matchNo || matchSup || matchStatus;
    });
  }, [purchaseOrders, searchTerm]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectPO = async (po: PurchaseOrder) => {
    setSearchTerm(po.poNumber);
    setOpen(false);

    try {
      // Fetch full details of the PO (including items/lines)
      const detail = await recordApi.get("purchase-orders", po.id);
      onChange(po.poNumber, po, detail);
    } catch {
      onChange(po.poNumber, po, undefined);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange(val, undefined, undefined);
    if (!open) setOpen(true);
  };

  const handleClear = () => {
    setSearchTerm("");
    onChange("", undefined, undefined);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          placeholder={placeholder}
          className="pr-16 text-xs bg-white dark:bg-neutral-900"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchTerm && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-neutral-400 hover:text-neutral-600 p-0.5 rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen((prev) => !prev)}
            className="text-neutral-400 hover:text-neutral-600 p-0.5 rounded"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-neutral-200 bg-white p-1 text-xs shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          {isLoading ? (
            <div className="flex items-center justify-center p-3 text-neutral-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังโหลดรายการ PO...
            </div>
          ) : filteredPOs.length === 0 ? (
            <div className="p-3 text-center text-neutral-400">
              {searchTerm ? `ไม่พบ PO ที่ตรงกับ "${searchTerm}" (สามารถใช้เลขที่พิมพ์ได้)` : "ไม่มีข้อมูลใบสั่งซื้อ"}
            </div>
          ) : (
            filteredPOs.map((po) => {
              const isSelected = po.poNumber === value;
              const isReceived = po.status?.toLowerCase() === "received";

              return (
                <div
                  key={po.id}
                  onClick={() => handleSelectPO(po)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 cursor-pointer rounded transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800",
                    isSelected && "bg-neutral-100 dark:bg-neutral-800 font-medium",
                    isReceived && "opacity-60"
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                    <div className="truncate">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {po.poNumber}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        {po.supplierName || "ไม่ระบุผู้จัดจำหน่าย"} · {po.orderDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-semibold border",
                        isReceived
                          ? "bg-neutral-100 text-neutral-600 border-neutral-200"
                          : po.status?.toLowerCase() === "partial received"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      )}
                    >
                      {po.status || "Pending"}
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
