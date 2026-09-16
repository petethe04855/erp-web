"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import type {
  TikTokOrderQueryParams,
  TikTokSyncResult,
} from "../types/tiktok";

interface TikTokOrderSearchProps {
  filters: TikTokOrderQueryParams;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onStockStatusChange?: (status: string) => void;
  onLimitChange?: (limit: number) => void;
  onReset: () => void;
  onSync: (days: number) => Promise<unknown>;
  isSyncing: boolean;
  syncResult: TikTokSyncResult | null;
}

export function TikTokOrderSearch({
  filters,
  onSearchChange,
  onStatusChange,
  onStockStatusChange,
  onLimitChange,
  onReset,
  onSync,
  isSyncing,
  syncResult,
}: TikTokOrderSearchProps) {
  const [syncDays, setSyncDays] = useState(30);

  return (
    <div className="space-y-6">
      {/* Search & Filter Card */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h2 className="text-sm font-semibold text-neutral-800">
            ค้นหาและตัวกรอง
          </h2>
          <Button size="sm" variant="ghost" onClick={onReset}>
            ล้างตัวกรอง
          </Button>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">
            ค้นหาคำสั่งซื้อ
          </label>
          <Input
            type="search"
            value={filters.search || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="เลขออเดอร์, ชื่อลูกค้า, SKU..."
            className="text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">
            สถานะคำสั่งซื้อ TikTok
          </label>
          <Select
            value={filters.status || "ALL"}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full text-sm"
          >
            <option value="ALL">ทั้งหมด (All)</option>
            <option value="AWAITING_SHIPMENT">รอจัดส่ง (Awaiting Shipment)</option>
            <option value="AWAITING_COLLECTION">รอขนส่งรับ (Awaiting Collection)</option>
            <option value="IN_TRANSIT">กำลังจัดส่ง (In Transit)</option>
            <option value="DELIVERED">จัดส่งแล้ว (Delivered)</option>
            <option value="COMPLETED">สำเร็จ (Completed)</option>
            <option value="CANCELLED">ยกเลิก (Cancelled)</option>
          </Select>
        </div>

        {onStockStatusChange && (
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              สถานะตัดสต็อกใน ERP
            </label>
            <Select
              value={filters.stockStatus || "all"}
              onChange={(e) => onStockStatusChange(e.target.value)}
              className="w-full text-sm"
            >
              <option value="all">ทั้งหมด</option>
              <option value="DEDUCTED">ตัดสต็อกสำเร็จแล้ว</option>
              <option value="PENDING">รอตัดสต็อก</option>
              <option value="FAILED">ตัดสต็อกไม่สำเร็จ (สินค้าไม่พอ)</option>
            </Select>
          </div>
        )}

        {onLimitChange && (
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              จำนวนรายการที่แสดงต่อหน้า
            </label>
            <Select
              value={String(filters.limit || 50)}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="w-full text-sm"
            >
              <option value="20">20 รายการ / หน้า</option>
              <option value="50">50 รายการ / หน้า</option>
              <option value="100">100 รายการ / หน้า</option>
            </Select>
          </div>
        )}
      </div>

      {/* Sync Orders Action Card */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-neutral-800">
          ซิงค์ออเดอร์จาก TikTok
        </h3>
        <p className="text-xs text-neutral-500">
          ดึงคำสั่งซื้อล่าสุดจาก TikTok Shop และตัดสต็อกสินค้าในคลัง ERP โดยอัตโนมัติ
        </p>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">
            ช่วงเวลาย้อนหลัง
          </label>
          <Select
            value={String(syncDays)}
            onChange={(e) => setSyncDays(Number(e.target.value))}
            className="w-full text-sm"
          >
            <option value="7">7 วันย้อนหลัง</option>
            <option value="15">15 วันย้อนหลัง</option>
            <option value="30">30 วันย้อนหลัง</option>
            <option value="60">60 วันย้อนหลัง</option>
          </Select>
        </div>

        <Button
          onClick={() => onSync(syncDays)}
          disabled={isSyncing}
          className="w-full bg-neutral-900 hover:bg-neutral-800 text-white"
          size="sm"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
          />
          {isSyncing ? "กำลังซิงค์ออเดอร์..." : "ซิงค์คำสั่งซื้อทันที"}
        </Button>

        {syncResult && (
          <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-100 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>ซิงค์สำเร็จ {syncResult.synced} รายการ</span>
            </div>
            <div className="text-neutral-600">
              ตัดสต็อก ERP สำเร็จ: {syncResult.stockDeducted} รายการ
            </div>
            {syncResult.stockDeductionErrors &&
              syncResult.stockDeductionErrors.length > 0 && (
                <div className="flex items-start gap-1.5 text-amber-600 pt-1">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    ตัดสต็อกไม่สำเร็จ {syncResult.stockDeductionErrors.length} รายการ
                    (อาจเกิดจากสินค้าหมดหรือยังไม่ได้ผูก SKU)
                  </span>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
