"use client";

import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { ShopeeMatchingSearch } from "@/features/shopee/components/ShopeeMatchingSearch";
import { ShopeeMatchingSummaryCard } from "@/features/shopee/components/ShopeeMatchingSummaryCard";
import { ShopeeMatchingTable } from "@/features/shopee/components/ShopeeMatchingTable";
import { useShopeeMatching } from "@/features/shopee/hooks/useShopeeMatching";

export default function ShopeeMatchingPage() {
  const {
    month,
    setMonth,
    items,
    paginatedItems,
    meta,
    summary,
    loading,
    page,
    setPage,
    limit,
    setLimit,
    refetch,
    exportCSV,
  } = useShopeeMatching();

  const handleResetToCurrent = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    setMonth(`${y}-${m}`);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Shopee Payout Matching"
          description="จับคู่รายงานการโอนเงินจริงจาก Shopee กับคำสั่งซื้อ คำนวณต้นทุนและกำไรสุทธิรายบรรทัด"
        />

        <ShopeeMatchingSearch
          month={month}
          onMonthChange={setMonth}
          onResetToCurrent={handleResetToCurrent}
          onRefetch={refetch}
          onExportCSV={exportCSV}
          limit={limit}
          onLimitChange={handleLimitChange}
          loading={loading}
          totalItems={items.length}
        />

        <ShopeeMatchingSummaryCard summary={summary} loading={loading} />

        <ShopeeMatchingTable
          month={month}
          items={paginatedItems}
          meta={meta}
          page={page}
          setPage={setPage}
          limit={limit}
          onLimitChange={handleLimitChange}
          onRefresh={refetch}
          loading={loading}
        />
      </div>
    </PageContainer>
  );
}
