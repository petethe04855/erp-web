"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  useReturnsQuery,
  useReturnMutations,
} from "@/features/returns/queries/returnQueries";
import { ReturnSearch } from "@/features/returns/components/ReturnSearch";
import { ReturnTable } from "@/features/returns/components/ReturnTable";
import { ReturnFormModal } from "@/features/returns/components/ReturnFormModal";
import { ReturnDetailModal } from "@/features/returns/components/ReturnDetailModal";
import { ReturnCompleteModal } from "@/features/returns/components/ReturnCompleteModal";
import type { SalesReturn, CreateReturnDTO, CompleteReturnDTO } from "@/features/returns/types/return";

export default function ReturnsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [returnType, setReturnType] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<SalesReturn | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useReturnsQuery({
    search: search.trim() || undefined,
    status: status !== "all" ? status : undefined,
    return_type: returnType !== "all" ? returnType : undefined,
    page,
    limit,
  });

  const {
    createMutation,
    submitMutation,
    approveMutation,
    rejectMutation,
    cancelMutation,
    completeMutation,
  } = useReturnMutations();

  const returns = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 20, total: 0, totalPages: 1 };

  const handleCreate = async (dto: CreateReturnDTO) => {
    await createMutation.mutateAsync(dto);
  };

  const handleSubmitReturn = async (id: number) => {
    const res = await submitMutation.mutateAsync(id);
    if (res.data) setSelectedReturn(res.data);
  };

  const handleApproveReturn = async (id: number) => {
    const res = await approveMutation.mutateAsync(id);
    if (res.data) setSelectedReturn(res.data);
  };

  const handleRejectReturn = async (id: number, reason: string) => {
    const res = await rejectMutation.mutateAsync({ id, reason });
    if (res.data) setSelectedReturn(res.data);
  };

  const handleCancelReturn = async (id: number, reason: string) => {
    const res = await cancelMutation.mutateAsync({ id, reason });
    if (res.data) setSelectedReturn(res.data);
  };

  const handleCompleteReturn = async (dto: CompleteReturnDTO) => {
    if (!selectedReturn) return;
    const res = await completeMutation.mutateAsync({ id: selectedReturn.id, dto });
    if (res.data) setSelectedReturn(res.data);
    setIsCompleteOpen(false);
  };

  const handleSelectReturn = (ret: SalesReturn) => {
    setSelectedReturn(ret);
    setIsDetailOpen(true);
  };

  const handleReset = () => {
    setSearch("");
    setStatus("all");
    setReturnType("all");
    setPage(1);
  };

  return (
    <PageContainer>
      <PageHeader
        title="รับคืนสินค้า (Sales Returns)"
        description="บันทึกการรับคืนสินค้าจากลูกค้า หรือการคืนสินค้าภายใน และนำเข้าสต็อกอย่างถูกต้อง"
      />

      <div className="space-y-4">
        <ReturnSearch
          search={search}
          status={status}
          returnType={returnType}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
          onStatusChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          onReturnTypeChange={(v) => {
            setReturnType(v);
            setPage(1);
          }}
          onReset={handleReset}
          actions={
            <Button
              size="sm"
              className="gap-1.5 text-xs font-medium bg-primary hover:bg-primary/90 text-white h-9 whitespace-nowrap"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="h-4 w-4" />
              สร้างใบรับคืน
            </Button>
          }
        />

        <ReturnTable
          returns={returns}
          meta={meta}
          isLoading={isLoading}
          isError={isError}
          onPageChange={setPage}
          onLimitChange={setLimit}
          onRetry={refetch}
          onSelectReturn={handleSelectReturn}
        />
      </div>

      {/* Form Dialog */}
      <ReturnFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreate}
      />

      {/* Detail Dialog */}
      <ReturnDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        returnDoc={selectedReturn}
        onSubmit={handleSubmitReturn}
        onApprove={handleApproveReturn}
        onReject={handleRejectReturn}
        onCancel={handleCancelReturn}
        onOpenCompleteModal={() => setIsCompleteOpen(true)}
      />

      {/* Complete/Inspect Dialog */}
      <ReturnCompleteModal
        open={isCompleteOpen}
        onOpenChange={setIsCompleteOpen}
        returnDoc={selectedReturn}
        onComplete={handleCompleteReturn}
      />
    </PageContainer>
  );
}
