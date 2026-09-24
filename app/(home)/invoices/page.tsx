"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useInvoices } from "@/features/invoices/hooks/useInvoices";
import { InvoiceSearch } from "@/features/invoices/components/InvoiceSearch";
import { InvoiceTable } from "@/features/invoices/components/InvoiceTable";
import { InvoiceStatsRow } from "@/features/invoices/components/InvoiceStatsRow";
import { OutstandingCustomersPanel } from "@/features/invoices/components/OutstandingCustomersPanel";
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
      />

      <div className="space-y-4">
        <InvoiceSearch
          filters={filters}
          onSearch={handleSearch}
          onStatusChange={handleStatusChange}
          onReset={resetFilters}
          actions={
            <Button size="sm" onClick={() => setIsFormOpen(true)} className="h-9 whitespace-nowrap">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Invoice
            </Button>
          }
        />

        <InvoiceStatsRow invoices={invoices} />
        <OutstandingCustomersPanel invoices={invoices} />
        <InvoiceTable
          invoices={invoices}
          meta={meta}
          isLoading={isLoading}
          isError={isError}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onRetry={refetch}
        />
      </div>

      <InvoiceForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={createInvoice}
        isSubmitting={isCreating}
      />
    </PageContainer>
  );
}
