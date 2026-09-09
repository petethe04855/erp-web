"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { TwoColumnLayout } from "@/components/layout/TwoColumnLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePurchase } from "@/features/purchase/hooks/usePurchase";
import { PurchaseOrderSearch } from "@/features/purchase/components/PurchaseOrderSearch";
import { PurchaseOrderTable } from "@/features/purchase/components/PurchaseOrderTable";
import { PurchaseOrderForm } from "@/features/purchase/components/PurchaseOrderForm";

export default function PurchaseOrderPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    purchaseOrders,
    meta,
    isLoading,
    isError,
    filters,
    handleSearch,
    handleStatusChange,
    handlePageChange,
    handleLimitChange,
    resetFilters,
    refetch,
    createPurchaseOrder,
    isCreating,
  } = usePurchase();

  return (
    <PageContainer>
      <PageHeader
        title="Purchase Orders"
        description="ข้อมูลจริงจาก Chawy ERP"
        actions={
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Purchase Order
          </Button>
        }
      />
      <TwoColumnLayout
        sidebar={
          <PurchaseOrderSearch
            filters={filters}
            onSearch={handleSearch}
            onStatusChange={handleStatusChange}
            onReset={resetFilters}
          />
        }
        content={
          <PurchaseOrderTable
            purchaseOrders={purchaseOrders}
            meta={meta}
            isLoading={isLoading}
            isError={isError}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onRetry={refetch}
          />
        }
      />

      <PurchaseOrderForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={createPurchaseOrder}
        isSubmitting={isCreating}
      />
    </PageContainer>
  );
}
