"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { TwoColumnLayout } from "@/components/layout/TwoColumnLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useGoodsIssue } from "@/features/warehouse/hooks/useGoodsIssue";
import { GoodsIssueSearch } from "@/features/warehouse/components/GoodsIssueSearch";
import { GoodsIssueTable } from "@/features/warehouse/components/GoodsIssueTable";
import { GoodsIssueForm } from "@/features/warehouse/components/GoodsIssueForm";

export default function GoodsIssuePage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    issues,
    meta,
    isLoading,
    isError,
    filters,
    handleSearch,
    handleReasonChange,
    handlePageChange,
    resetFilters,
    refetch,
    createIssue,
    isCreating,
  } = useGoodsIssue();

  return (
    <PageContainer>
      <PageHeader
        title="Goods Issue (GIN)"
        description="ข้อมูลจริงจาก Chawy ERP"
        actions={
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Goods Issue
          </Button>
        }
      />
      <TwoColumnLayout
        sidebar={
          <GoodsIssueSearch
            filters={filters}
            onSearch={handleSearch}
            onReasonChange={handleReasonChange}
            onReset={resetFilters}
          />
        }
        content={
          <GoodsIssueTable
            issues={issues}
            meta={meta}
            isLoading={isLoading}
            isError={isError}
            onPageChange={handlePageChange}
            onRetry={refetch}
          />
        }
      />

      <GoodsIssueForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={createIssue}
        isSubmitting={isCreating}
      />
    </PageContainer>
  );
}
