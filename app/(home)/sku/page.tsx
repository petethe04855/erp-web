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

/**
 * SKU Management Page
 * Adheres strictly to Section 20 of ERP_WEB_ARCHITECTURE.md:
 * - Lightweight composition only
 * - No inline API requests
 * - No inline table or complex business logic
 */
export default function SKUPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

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
    toggleSKUStatus,
    deleteSKU,
    isCreating,
  } = useSKU();

  return (
    <PageContainer>
      {/* Standard Header */}
      <PageHeader
        title="SKU Management"
        description="ข้อมูลจริงจาก Chawy ERP"
        actions={
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
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
          />
        }
      />

      {/* SKU Create / Edit Modal Form */}
      <SKUForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={createSKU}
        isSubmitting={isCreating}
      />
    </PageContainer>
  );
}
