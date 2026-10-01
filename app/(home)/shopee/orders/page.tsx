"use client";

import React, { useState } from "react";
import { Upload, RefreshCw } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
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
    search,
    setSearch,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    refetch,
  } = useShopeeOrders();

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Shopee Orders"
          description="รายการคำสั่งซื้อจาก Shopee Seller Centre ตรวจสอบและแก้ไข SKU"
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
                นำเข้าไฟล์ Order
              </Button>
            </div>
          }
        />

        <ShopeeOrdersTable
          orders={orders}
          meta={meta}
          loading={loading}
          page={page}
          setPage={setPage}
          search={search}
          setSearch={setSearch}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onRefresh={refetch}
        />

        <ShopeeOrderUploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={refetch}
        />
      </div>
    </PageContainer>
  );
}
