"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useGoodsReceive } from "@/features/warehouse/hooks/useGoodsReceive";
import { GoodsReceiveSearch } from "@/features/warehouse/components/GoodsReceiveSearch";
import { GoodsReceiveTable } from "@/features/warehouse/components/GoodsReceiveTable";
import { GoodsReceiveForm } from "@/features/warehouse/components/GoodsReceiveForm";

export default function GoodsReceivePage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    receives,
    meta,
    isLoading,
    isError,
    filters,
    handleSearch,
    handleStatusChange,
    handlePageChange,
    resetFilters,
    refetch,
    createReceive,
    isCreating,
  } = useGoodsReceive();

  return (
    <PageContainer>
      <PageHeader
        title="Goods Receive (GRN)"
        description="ข้อมูลจริงจาก Chawy ERP"
      />

      <div className="space-y-4">
        <GoodsReceiveSearch
          filters={filters}
          onSearch={handleSearch}
          onStatusChange={handleStatusChange}
          onReset={resetFilters}
          actions={
            <Button size="sm" onClick={() => setIsFormOpen(true)} className="h-9 whitespace-nowrap">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Goods Receipt
            </Button>
          }
        />

        <GoodsReceiveTable
          receives={receives}
          meta={meta}
          isLoading={isLoading}
          isError={isError}
          onPageChange={handlePageChange}
          onRetry={refetch}
        />
      </div>

      <GoodsReceiveForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={createReceive}
        isSubmitting={isCreating}
      />
    </PageContainer>
  );
}
