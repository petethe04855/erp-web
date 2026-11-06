"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import { CustomerSearch } from "@/features/customers/components/CustomerSearch";
import { CustomerTable } from "@/features/customers/components/CustomerTable";
import { CustomerForm } from "@/features/customers/components/CustomerForm";
import type { Customer, CreateCustomerDTO } from "@/features/customers/types/customer";

export default function CustomersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

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
    updateCustomer,
    isCreating,
    isUpdating,
  } = useCustomers();

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (dto: CreateCustomerDTO) => {
    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, dto);
    } else {
      await createCustomer(dto);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Customer Directory"
        description="ข้อมูลจริงจาก Chawy ERP"
      />

      <div className="space-y-4">
        <CustomerSearch
          filters={filters}
          onSearch={handleSearch}
          onStatusChange={handleStatusChange}
          onReset={resetFilters}
          actions={
            <Button size="sm" onClick={handleOpenCreate} className="h-9 whitespace-nowrap">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Customer
            </Button>
          }
        />

        <CustomerTable
          customers={customers}
          meta={meta}
          isLoading={isLoading}
          isError={isError}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onRetry={refetch}
          onEdit={handleOpenEdit}
        />
      </div>

      <CustomerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={editingCustomer}
        isSubmitting={isCreating || isUpdating}
      />
    </PageContainer>
  );
}

