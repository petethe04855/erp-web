"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Settings, RefreshCw, Calculator, MapPin } from "lucide-react";
import { useTikTokOrders } from "@/features/tiktok/hooks/useTikTok";
import { TikTokOrderSearch } from "@/features/tiktok/components/TikTokOrderSearch";
import { TikTokOrderTable } from "@/features/tiktok/components/TikTokOrderTable";
import type { TikTokOrderQueryParams } from "@/features/tiktok/types/tiktok";

export default function TikTokOrdersPage() {
  const [filters, setFilters] = useState<TikTokOrderQueryParams>({
    search: "",
    status: "ALL",
    stockStatus: "all",
    page: 1,
    limit: 50,
  });

  const {
    orders,
    meta,

    isLoading,
    isError,
    refetch,
    syncOrders,
    isSyncing,
    syncResult,
    backfillProvinces,
    isBackfilling,
    backfillResult,
  } = useTikTokOrders(filters);

  return (
    <PageContainer>
      <PageHeader
        title="TikTok Shop Orders"
        description="รายการคำสั่งซื้อจาก TikTok Shop พร้อมสถานะการตัดสต็อกสินค้าในคลัง ERP"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => backfillProvinces(500)}
              disabled={isBackfilling}
              title="ดึงจังหวัดผู้รับสำหรับออเดอร์เก่าที่ยังไม่มีข้อมูลจังหวัด"
            >
              <MapPin className={`mr-1.5 h-3.5 w-3.5 ${isBackfilling ? "animate-pulse" : ""}`} />
              {isBackfilling ? "กำลังดึงจังหวัด..." : "เติมจังหวัดออเดอร์เก่า"}
            </Button>
            <Link href="/tiktok-calculator">
              <Button variant="outline" size="sm">
                <Calculator className="mr-1.5 h-3.5 w-3.5" />
                คำนวณค่าธรรมเนียม
              </Button>
            </Link>
            <Link href="/tiktok-setup">
              <Button variant="outline" size="sm">
                <Settings className="mr-1.5 h-3.5 w-3.5" />
                ตั้งค่า TikTok Shop
              </Button>
            </Link>
          </div>
        }
      />

      <div className="space-y-4">
        <TikTokOrderSearch
          filters={filters}
          onSearchChange={(search) =>
            setFilters((f) => ({ ...f, search, page: 1 }))
          }
          onStatusChange={(status) =>
            setFilters((f) => ({ ...f, status, page: 1 }))
          }
          onStockStatusChange={(stockStatus) =>
            setFilters((f) => ({ ...f, stockStatus, page: 1 }))
          }
          onLimitChange={(limit) =>
            setFilters((f) => ({ ...f, limit, page: 1 }))
          }
          onReset={() =>
            setFilters({
              search: "",
              status: "ALL",
              stockStatus: "all",
              page: 1,
              limit: filters.limit || 50,
            })
          }
          onSync={(days) => syncOrders(days)}
          isSyncing={isSyncing}
          syncResult={syncResult}
        />

        <TikTokOrderTable
          page={filters.page || 1}
          orders={orders}
          meta={meta}
          isLoading={isLoading}
          isError={isError}
          onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
          onLimitChange={(limit) =>
            setFilters((f) => ({ ...f, limit, page: 1 }))
          }
          onRetry={refetch}
        />

        {backfillResult && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">
            เติมจังหวัดเสร็จแล้ว: สแกน {backfillResult.scanned} ออเดอร์ ·
            ระบุจังหวัดได้ {backfillResult.resolved} · ระบุไม่ได้{" "}
            {backfillResult.unknown}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
