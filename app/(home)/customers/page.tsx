"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { TwoColumnLayout } from "@/components/layout/TwoColumnLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import { CustomerSearch } from "@/features/customers/components/CustomerSearch";
import { CustomerTable } from "@/features/customers/components/CustomerTable";
import { CustomerForm } from "@/features/customers/components/CustomerForm";

export default function CustomersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    customers,
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
    createCustomer,
    isCreating,
  } = useCustomers();

  return (
    <PageContainer>
      <PageHeader
        title="Customer Directory"
        description="ข้อมูลจริงจาก Chawy ERP"
        actions={
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Customer
          </Button>
        }
      />
      <TwoColumnLayout
        sidebar={
          <CustomerSearch
            filters={filters}
            onSearch={handleSearch}
            onStatusChange={handleStatusChange}
            onReset={resetFilters}
          />
        }
        content={
          <CustomerTable
            customers={customers}
            meta={meta}
            isLoading={isLoading}
            isError={isError}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onRetry={refetch}
          />
        }
      />

      <CustomerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={createCustomer}
        isSubmitting={isCreating}
      />
    </PageContainer>
  );
}
