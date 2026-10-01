"use client";

import React, { useState } from "react";
import { Upload, RefreshCw } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ShopeeIncomeTable } from "@/features/shopee/components/ShopeeIncomeTable";
import { ShopeeIncomeUploadModal } from "@/features/shopee/components/ShopeeIncomeUploadModal";
import { useShopeeIncome } from "@/features/shopee/hooks/useShopeeIncome";

export default function ShopeeIncomePage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const {
    incomes,
    meta,
    loading,
    page,
    setPage,
    search,
    setSearch,
    status,
    setStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    refetch,
  } = useShopeeIncome();

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Shopee Income Reports"
          description="รายการเงินโอนจริงจาก Shopee Seller Centre และสถานะการจับคู่กับคำสั่งซื้อ"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                รีเฟรช
              </Button>
              <Button
                size="sm"
                onClick={() => setIsUploadOpen(true)}
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                นำเข้ารายงานรายรับ (.xlsx)
              </Button>
            </div>
          }
        />

        <ShopeeIncomeTable
          incomes={incomes}
          meta={meta}
          loading={loading}
          page={page}
          setPage={setPage}
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onRefresh={refetch}
        />

        <ShopeeIncomeUploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={refetch}
        />
      </div>
    </PageContainer>
  );
}
