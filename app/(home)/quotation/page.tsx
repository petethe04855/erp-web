"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { TwoColumnLayout } from "@/components/layout/TwoColumnLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuotation } from "@/features/quotation/hooks/useQuotation";
import { QuotationSearch } from "@/features/quotation/components/QuotationSearch";
import { QuotationTable } from "@/features/quotation/components/QuotationTable";
import { QuotationStatsRow } from "@/features/quotation/components/QuotationStatsRow";
import { QuotationForm } from "@/features/quotation/components/QuotationForm";

export default function QuotationPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    quotations,
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
    createQuotation,
    isCreating,
  } = useQuotation();

  return (
    <PageContainer>
      <PageHeader
        title="Sales Quotations"
        description="ข้อมูลจริงจาก Chawy ERP"
        actions={
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Quotation
          </Button>
        }
      />
      <TwoColumnLayout
        sidebar={
          <QuotationSearch
            filters={filters}
            onSearch={handleSearch}
            onStatusChange={handleStatusChange}
            onReset={resetFilters}
          />
        }
        content={
          <div className="space-y-4">
            <QuotationStatsRow quotations={quotations} />
            <QuotationTable
              quotations={quotations}
              meta={meta}
              isLoading={isLoading}
              isError={isError}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              onRetry={refetch}
            />
          </div>
        }
      />

      <QuotationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={createQuotation}
        isSubmitting={isCreating}
      />
    </PageContainer>
  );
}
