"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { TwoColumnLayout } from "@/components/layout/TwoColumnLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useProducts } from "@/features/products/hooks/useProducts";
import { ProductSearch } from "@/features/products/components/ProductSearch";
import { ProductTable } from "@/features/products/components/ProductTable";
import { ProductForm } from "@/features/products/components/ProductForm";

export default function ProductsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    products,
    meta,
    isLoading,
    isError,
    filters,
    handleSearch,
    handleCategoryChange,
    handleTypeChange,
    handlePageChange,
    handleLimitChange,
    resetFilters,
    refetch,
    createProduct,
    isCreating,
  } = useProducts();

  return (
    <PageContainer>
      <PageHeader
        title="Product Catalog"
        description="ข้อมูลจริงจาก Chawy ERP"
        actions={
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Product
          </Button>
        }
      />
      <TwoColumnLayout
        sidebar={
          <ProductSearch
            filters={filters}
            onSearch={handleSearch}
            onCategoryChange={handleCategoryChange}
            onTypeChange={handleTypeChange}
            onReset={resetFilters}
          />
        }
        content={
          <ProductTable
            products={products}
            meta={meta}
            isLoading={isLoading}
            isError={isError}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onRetry={refetch}
          />
        }
      />

      <ProductForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={createProduct}
        isSubmitting={isCreating}
      />
    </PageContainer>
  );
}
