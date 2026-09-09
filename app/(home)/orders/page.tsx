"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { TwoColumnLayout } from "@/components/layout/TwoColumnLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { OrderSearch } from "@/features/orders/components/OrderSearch";
import { OrderTable } from "@/features/orders/components/OrderTable";
import { OrderForm } from "@/features/orders/components/OrderForm";

export default function OrdersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    orders,
    meta,
    isLoading,
    isError,
    filters,
    handleSearch,
    handleFulfillmentChange,
    handlePaymentChange,
    handleChannelChange,
    handlePageChange,
    handleLimitChange,
    resetFilters,
    refetch,
    createOrder,
    isCreating,
  } = useOrders();

  return (
    <PageContainer>
      <PageHeader
        title="Sales Orders"
        description="ข้อมูลจริงจาก Chawy ERP"
        actions={
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Order
          </Button>
        }
      />
      <TwoColumnLayout
        sidebar={
          <OrderSearch
            filters={filters}
            onSearch={handleSearch}
            onFulfillmentChange={handleFulfillmentChange}
            onPaymentChange={handlePaymentChange}
            onChannelChange={handleChannelChange}
            onReset={resetFilters}
          />
        }
        content={
          <OrderTable
            orders={orders}
            meta={meta}
            isLoading={isLoading}
            isError={isError}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onRetry={refetch}
          />
        }
      />

      <OrderForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={createOrder}
        isSubmitting={isCreating}
      />
    </PageContainer>
  );
}
