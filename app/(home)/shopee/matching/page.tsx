"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ShopeeMatchingSummaryCard } from "@/features/shopee/components/ShopeeMatchingSummaryCard";
import { ShopeeMatchingTable } from "@/features/shopee/components/ShopeeMatchingTable";
import { useShopeeMatching } from "@/features/shopee/hooks/useShopeeMatching";

export default function ShopeeMatchingPage() {
  const { month, setMonth, items, summary, loading, refetch, exportCSV } =
    useShopeeMatching();

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Shopee Payout Matching"
          description="จับคู่รายงานการโอนเงินจริงจาก Shopee กับคำสั่งซื้อ คำนวณต้นทุนและกำไรสุทธิรายบรรทัด"
          actions={
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              คำนวณใหม่
            </Button>
          }
        />

        <ShopeeMatchingSummaryCard summary={summary} loading={loading} />

        <ShopeeMatchingTable
          month={month}
          setMonth={setMonth}
          items={items}
          loading={loading}
          onExportCSV={exportCSV}
        />
      </div>
    </PageContainer>
  );
}
