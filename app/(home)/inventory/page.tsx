"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { TwoColumnLayout } from "@/components/layout/TwoColumnLayout";
import { useInventory } from "@/features/inventory/hooks/useInventory";
import { InventorySearch } from "@/features/inventory/components/InventorySearch";
import { InventoryTable } from "@/features/inventory/components/InventoryTable";
import { StockAdjustmentModal } from "@/features/inventory/components/StockAdjustmentModal";
import { InventoryStock } from "@/features/inventory/types/inventory";

export default function InventoryPage() {
  const [selectedStock, setSelectedStock] = useState<InventoryStock | null>(
    null,
  );
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  const {
    stocks,
    meta,
    isLoading,
    isError,
    filters,
    handleSearch,
    handleWarehouseChange,
    handleStatusChange,
    handlePageChange,
    handleLimitChange,
    resetFilters,
    refetch,
    adjustStock,
    isAdjusting,
  } = useInventory();

  const handleOpenAdjust = (stock: InventoryStock) => {
    setSelectedStock(stock);
    setIsAdjustOpen(true);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Inventory & Stock Balances"
        description="ข้อมูลจริงจาก Chawy ERP"
        actions={null}
      />
      <TwoColumnLayout
        sidebar={
          <InventorySearch
            filters={filters}
            onSearch={handleSearch}
            onWarehouseChange={handleWarehouseChange}
            onStatusChange={handleStatusChange}
            onReset={resetFilters}
          />
        }
        content={
          <InventoryTable
            stocks={stocks}
            meta={meta}
            isLoading={isLoading}
            isError={isError}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onRetry={refetch}
            onAdjust={handleOpenAdjust}
          />
        }
      />

      <StockAdjustmentModal
        open={isAdjustOpen}
        onOpenChange={setIsAdjustOpen}
        selectedStock={selectedStock}
        onSubmit={adjustStock}
        isSubmitting={isAdjusting}
      />
    </PageContainer>
  );
}
