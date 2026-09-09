"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { TwoColumnLayout } from "@/components/layout/TwoColumnLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useInvoices } from "@/features/invoices/hooks/useInvoices";
import { InvoiceSearch } from "@/features/invoices/components/InvoiceSearch";
import { InvoiceTable } from "@/features/invoices/components/InvoiceTable";
import { InvoiceForm } from "@/features/invoices/components/InvoiceForm";

export default function InvoicesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    invoices,
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
    createInvoice,
    isCreating,
  } = useInvoices();

  return (
    <PageContainer>
      <PageHeader
        title="Invoices & Billing"
        description="ข้อมูลจริงจาก Chawy ERP"
        actions={
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Invoice
          </Button>
        }
      />
      <TwoColumnLayout
        sidebar={
          <InvoiceSearch
            filters={filters}
            onSearch={handleSearch}
            onStatusChange={handleStatusChange}
            onReset={resetFilters}
          />
        }
        content={
          <InvoiceTable
            invoices={invoices}
            meta={meta}
            isLoading={isLoading}
            isError={isError}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onRetry={refetch}
          />
        }
      />

      <InvoiceForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={createInvoice}
        isSubmitting={isCreating}
      />
    </PageContainer>
  );
}
