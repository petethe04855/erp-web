"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { ShopeeOrderSearch } from "@/features/shopee/components/ShopeeOrderSearch";
import { ShopeeOrdersTable } from "@/features/shopee/components/ShopeeOrdersTable";
import { ShopeeOrderUploadModal } from "@/features/shopee/components/ShopeeOrderUploadModal";
import { useShopeeOrders } from "@/features/shopee/hooks/useShopeeOrders";

export default function ShopeeOrdersPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const {
    orders,
    meta,
    loading,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    refetch,
  } = useShopeeOrders();

  const handleReset = () => {
    setSearch("");
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
        title="Shopee Orders"
        description="รายการคำสั่งซื้อจาก Shopee Seller Centre ตรวจสอบและแก้ไข SKU"
      />

      <div className="space-y-4">
        {/* Dedicated Order Search & Filter Toolbar */}
        <ShopeeOrderSearch
          search={search}
          onSearchChange={(s) => {
            setSearch(s);
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

        {/* Orders Table Area */}
        <ShopeeOrdersTable
          orders={orders}
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
      <ShopeeOrderUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={refetch}
      />
    </PageContainer>
  );
}
