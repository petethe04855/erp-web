"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { TwoColumnLayout } from "@/components/layout/TwoColumnLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSKU } from "@/features/sku/hooks/useSKU";
import { SKUSearch } from "@/features/sku/components/SKUSearch";
import { SKUTable } from "@/features/sku/components/SKUTable";
import { SKUForm } from "@/features/sku/components/SKUForm";
import { SKU, CreateSKUDTO, UpdateSKUDTO } from "@/features/sku/types/sku";

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
    isCreating,
    isUpdating,
  } = useSKU();

  const handleOpenCreate = () => {
    setEditingSKU(null);
    setIsFormOpen(true);
  };

  const handleEdit = (skuItem: SKU) => {
    setEditingSKU(skuItem);
    setIsFormOpen(true);
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
        actions={
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New SKU
          </Button>
        }
      />
      <TwoColumnLayout
        sidebar={
          <SKUSearch
            filters={filters}
            onSearch={handleSearch}
            onCategoryChange={handleCategoryChange}
            onStatusChange={handleStatusChange}
            onReset={resetFilters}
          />
        }
        content={
          <SKUTable
            skus={skus}
            meta={meta}
            isLoading={isLoading}
            isError={isError}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onRetry={refetch}
            onToggleStatus={toggleSKUStatus}
            onDelete={deleteSKU}
            onEdit={handleEdit}
          />
        }
      />

      {/* SKU Create / Edit Modal Form */}
      <SKUForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingSKU}
        onSubmit={handleSubmitForm}
        isSubmitting={isCreating || isUpdating}
      />
    </PageContainer>
  );
}
