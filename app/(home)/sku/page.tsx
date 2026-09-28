"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Plus, UploadCloud, Download } from "lucide-react";
import { useSKU } from "@/features/sku/hooks/useSKU";
import { SKUSearch } from "@/features/sku/components/SKUSearch";
import { SKUTable } from "@/features/sku/components/SKUTable";
import { SKUForm } from "@/features/sku/components/SKUForm";
import { SKUStockAdjustmentModal } from "@/features/sku/components/SKUStockAdjustmentModal";
import { SKUImportModal } from "@/features/sku/components/SKUImportModal";
import {
  SKU,
  CreateSKUDTO,
  UpdateSKUDTO,
  StockAdjustmentDTO,
} from "@/features/sku/types/sku";

/**
 * SKU Management Page
 * Adheres strictly to Section 20 of ERP_WEB_ARCHITECTURE.md:
 * - Lightweight composition only
 * - No inline API requests
 * - No inline table or complex business logic
 */
export default function SKUPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSKU, setEditingSKU] = useState<SKU | null>(null);
  const [adjustingSKU, setAdjustingSKU] = useState<SKU | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

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
    updateSKU,
    toggleSKUStatus,
    deleteSKU,
    adjustStock,
    importSKU,
    downloadTemplate,
    isCreating,
    isUpdating,
    isAdjusting,
    isImporting,
  } = useSKU();

  const handleOpenCreate = () => {
    setEditingSKU(null);
    setIsFormOpen(true);
  };

  const handleEdit = (skuItem: SKU) => {
    setEditingSKU(skuItem);
    setIsFormOpen(true);
  };

  const handleAdjustStock = (skuItem: SKU) => {
    setAdjustingSKU(skuItem);
  };

  const handleStockAdjustmentSubmit = async (dto: StockAdjustmentDTO) => {
    await adjustStock(dto);
    setAdjustingSKU(null);
  };

  const handleSubmitForm = async (data: CreateSKUDTO | UpdateSKUDTO) => {
    if (editingSKU) {
      await updateSKU(editingSKU.sku || editingSKU.id, data as UpdateSKUDTO);
    } else {
      await createSKU(data as CreateSKUDTO);
    }
  };

  return (
    <PageContainer>
      {/* Standard Header */}
      <PageHeader
        title="SKU Management"
        description="ข้อมูลจริงจาก Chawy ERP"
      />

      <div className="space-y-4">
        {/* Horizontal Search & Filter Toolbar with Action buttons */}
        <SKUSearch
          filters={filters}
          onSearch={handleSearch}
          onCategoryChange={handleCategoryChange}
          onStatusChange={handleStatusChange}
          onReset={resetFilters}
        >
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="h-9 whitespace-nowrap text-xs gap-1.5"
              title="ดาวน์โหลดไฟล์แม่แบบ Excel สำหรับอัปโหลด SKU"
            >
              <Download className="h-3.5 w-3.5 text-neutral-500" />
              ดาวน์โหลด Template
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsImportOpen(true)}
              className="h-9 whitespace-nowrap text-xs gap-1.5 border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
              title="นำเข้า SKU จากไฟล์ Excel (.xlsx)"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              นำเข้า XLSX
            </Button>
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="h-9 whitespace-nowrap text-xs"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New SKU
            </Button>
          </div>
        </SKUSearch>

        {/* Content & Table Area */}
        <SKUTable
          skus={skus}
          meta={meta}
          isLoading={isLoading}
          isError={isError}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onRetry={refetch}
          onDelete={deleteSKU}
          onEdit={handleEdit}
          onChangeStatus={toggleSKUStatus}
          onAdjustStock={handleAdjustStock}
        />
      </div>

      {/* SKU Create / Edit Modal Form */}
      <SKUForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingSKU}
        onSubmit={handleSubmitForm}
        isSubmitting={isCreating || isUpdating}
      />

      {/* SKU Stock Adjustment Modal */}
      <SKUStockAdjustmentModal
        selectedSKU={adjustingSKU}
        open={Boolean(adjustingSKU)}
        onOpenChange={(open) => {
          if (!open) setAdjustingSKU(null);
        }}
        onSubmit={handleStockAdjustmentSubmit}
        isSubmitting={isAdjusting}
      />

      {/* SKU Excel Import Modal */}
      <SKUImportModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImport={importSKU}
        onDownloadTemplate={downloadTemplate}
        isImporting={isImporting}
      />
    </PageContainer>
  );
}

