"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSKU } from "@/features/sku/hooks/useSKU";
import { SKUSearch } from "@/features/sku/components/SKUSearch";
import { SKUTable } from "@/features/sku/components/SKUTable";
import { SKUForm } from "@/features/sku/components/SKUForm";
import { SKUStockAdjustmentModal } from "@/features/sku/components/SKUStockAdjustmentModal";
import { SKU, CreateSKUDTO, UpdateSKUDTO, StockAdjustmentDTO } from "@/features/sku/types/sku";

/**
 * SKU Management Page
 * Adheres strictly to Section 20 of ERP_WEB_ARCHITECTURE.md:
 * - Lightweight composition only
 * - No inline API requests
 * - No inline table or complex business logic
 */
export default function SKUPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSKU, setEditingSKU] = useState<SKU | null>(null);
  const [adjustingSKU, setAdjustingSKU] = useState<SKU | null>(null);

  const {
    skus,
    meta,
    isLoading,
    isError,
    filters,
    handleSearch,
    handleCategoryChange,
    handleStatusChange,
    handlePageChange,
    handleLimitChange,
    resetFilters,
    refetch,
    createSKU,
    updateSKU,
    toggleSKUStatus,
    deleteSKU,
    adjustStock,
    isCreating,
    isUpdating,
    isAdjusting,
  } = useSKU();

  const handleOpenCreate = () => {
    setEditingSKU(null);
    setIsFormOpen(true);
  };

  const handleEdit = (skuItem: SKU) => {
    setEditingSKU(skuItem);
    setIsFormOpen(true);
  };

  const handleAdjustStock = (skuItem: SKU) => {
    setAdjustingSKU(skuItem);
  };

  const handleStockAdjustmentSubmit = async (dto: StockAdjustmentDTO) => {
    await adjustStock(dto);
    setAdjustingSKU(null);
  };

  const handleSubmitForm = async (data: CreateSKUDTO | UpdateSKUDTO) => {
    if (editingSKU) {
      await updateSKU(editingSKU.sku || editingSKU.id, data as UpdateSKUDTO);
    } else {
      await createSKU(data as CreateSKUDTO);
    }
  };

  return (
    <PageContainer>
      {/* Standard Header */}
      <PageHeader
        title="SKU Management"
        description="ข้อมูลจริงจาก Chawy ERP"
      />

      <div className="space-y-4">
        {/* Horizontal Search & Filter Toolbar with New SKU button */}
        <SKUSearch
          filters={filters}
          onSearch={handleSearch}
          onCategoryChange={handleCategoryChange}
          onStatusChange={handleStatusChange}
          onReset={resetFilters}
        >
          <Button size="sm" onClick={handleOpenCreate} className="h-9 whitespace-nowrap">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New SKU
          </Button>
        </SKUSearch>

        {/* Content & Table Area */}
        <SKUTable
          skus={skus}
          meta={meta}
          isLoading={isLoading}
          isError={isError}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onRetry={refetch}
          onDelete={deleteSKU}
          onEdit={handleEdit}
          onAdjustStock={handleAdjustStock}
        />
      </div>

      {/* SKU Create / Edit Modal Form */}
      <SKUForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingSKU}
        onSubmit={handleSubmitForm}
        isSubmitting={isCreating || isUpdating}
      />

      {/* SKU Stock Adjustment Modal */}
      <SKUStockAdjustmentModal
        selectedSKU={adjustingSKU}
        open={Boolean(adjustingSKU)}
        onOpenChange={(open) => {
          if (!open) setAdjustingSKU(null);
        }}
        onSubmit={handleStockAdjustmentSubmit}
        isSubmitting={isAdjusting}
      />
    </PageContainer>
  );
}

