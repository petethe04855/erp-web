"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { useInventory } from "@/features/inventory/hooks/useInventory";
import { InventorySearch } from "@/features/inventory/components/InventorySearch";
import { InventoryTable } from "@/features/inventory/components/InventoryTable";
import { FormulaFormModal } from "@/features/inventory/components/FormulaFormModal";
import { InventoryDetailModal } from "@/features/inventory/components/InventoryDetailModal";
import type { InventoryFormula } from "@/features/inventory/types/formula";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function InventoryPage() {
  const [selectedFormula, setSelectedFormula] = useState<InventoryFormula | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<InventoryFormula | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    formulas,
    meta,
    isLoading,
    isError,
    search,
    status,
    togglingCode,
    deletingCode,
    handleSearch,
    handleStatusChange,
    handlePageChange,
    handleLimitChange,
    resetFilters,
    refetch,
    handleToggleStatus,
    handleDelete,
  } = useInventory();

  const handleOpenCreate = () => {
    setEditingFormula(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (formula: InventoryFormula) => {
    setEditingFormula(formula);
    setIsFormOpen(true);
  };

  const handleOpenView = (formula: InventoryFormula) => {
    setSelectedFormula(formula);
    setIsDetailOpen(true);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Inventory Management"
        description="จัดการชุดสินค้าและสต็อกที่ประกอบจาก SKU วัตถุดิบ"
      />

      <div className="space-y-4">
        <InventorySearch
          search={search}
          status={status}
          onSearch={handleSearch}
          onStatusChange={handleStatusChange}
          onReset={resetFilters}
          actions={
            <Button
              size="sm"
              className="gap-1.5 text-xs font-medium h-9 whitespace-nowrap"
              onClick={handleOpenCreate}
            >
              <Plus className="h-4 w-4" />
              New Inventory
            </Button>
          }
        />

        <InventoryTable
          formulas={formulas}
          meta={meta}
          isLoading={isLoading}
          isError={isError}
          togglingCode={togglingCode}
          deletingCode={deletingCode}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onRetry={refetch}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          onCreateNew={handleOpenCreate}
        />
      </div>

      {/* Detail Modal */}
      <InventoryDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        formula={selectedFormula}
        onEdit={handleOpenEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
        isToggling={Boolean(togglingCode && selectedFormula?.code === togglingCode)}
      />

      {/* Create / Edit Form Modal */}
      <FormulaFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingFormula}
        onSaved={refetch}
      />
    </PageContainer>
  );
}
