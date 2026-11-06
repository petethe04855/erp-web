"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { ShopeeIncomeSearch } from "@/features/shopee/components/ShopeeIncomeSearch";
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
    limit,
    setLimit,
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

  const handleReset = () => {
    setSearch("");
    setStatus("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Shopee Income Reports"
        description="รายการเงินโอนจริงจาก Shopee Seller Centre และสถานะการจับคู่กับคำสั่งซื้อ"
      />

      <div className="space-y-4">
        {/* Dedicated Income Search & Filter Toolbar */}
        <ShopeeIncomeSearch
          search={search}
          onSearchChange={(s) => {
            setSearch(s);
            setPage(1);
          }}
          status={status}
          onStatusChange={(st) => {
            setStatus(st);
            setPage(1);
          }}
          startDate={startDate}
          onStartDateChange={(d) => {
            setStartDate(d);
            setPage(1);
          }}
          endDate={endDate}
          onEndDateChange={(d) => {
            setEndDate(d);
            setPage(1);
          }}
          limit={limit}
          onLimitChange={handleLimitChange}
          onReset={handleReset}
          onRefresh={refetch}
          onOpenUpload={() => setIsUploadOpen(true)}
          loading={loading}
          totalItems={meta?.total}
        />

        {/* Income Table Area */}
        <ShopeeIncomeTable
          incomes={incomes}
          meta={meta}
          loading={loading}
          page={page}
          setPage={setPage}
          limit={limit}
          onLimitChange={handleLimitChange}
          onRefresh={refetch}
        />
      </div>

      {/* Upload Modal */}
      <ShopeeIncomeUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={refetch}
      />
    </PageContainer>
  );
}
