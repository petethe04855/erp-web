"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formulaApi } from "../api/formulaApi";
import type { InventoryFormula } from "../types/formula";

export function useInventory() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [togglingCode, setTogglingCode] = useState<string | null>(null);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  const {
    data: allFormulas = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["inventory-formulas"],
    queryFn: () => formulaApi.getFormulas(),
  });

  // Client-side filtering & pagination (matching standard UI pattern)
  const filteredFormulas = useMemo(() => {
    return allFormulas.filter((item) => {
      const matchSearch =
        !search ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(search.toLowerCase()));

      const matchStatus =
        status === "all"
          ? true
          : status === "active"
            ? item.isActive
            : !item.isActive;

      return matchSearch && matchStatus;
    });
  }, [allFormulas, search, status]);

  const paginatedFormulas = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredFormulas.slice(startIndex, startIndex + limit);
  }, [filteredFormulas, page, limit]);

  const meta = useMemo(
    () => ({
      page,
      limit,
      total: filteredFormulas.length,
      totalPages: Math.max(1, Math.ceil(filteredFormulas.length / limit)),
    }),
    [filteredFormulas.length, page, limit],
  );

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
  };

  const handleLimitChange = (l: number) => {
    setLimit(l);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setPage(1);
    setLimit(10);
  };

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (formula: InventoryFormula) => {
      setTogglingCode(formula.code);
      return formulaApi.toggleStatus(formula.code, !formula.isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-formulas"] });
    },
    onSettled: () => {
      setTogglingCode(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (formula: InventoryFormula) => {
      setDeletingCode(formula.code);
      return formulaApi.deleteFormula(formula.code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-formulas"] });
    },
    onSettled: () => {
      setDeletingCode(null);
    },
  });

  const handleToggleStatus = useCallback(
    async (formula: InventoryFormula) => {
      try {
        await toggleStatusMutation.mutateAsync(formula);
      } catch (err: unknown) {
        alert(
          "เปลี่ยนสถานะไม่สำเร็จ: " +
            (err instanceof Error ? err.message : String(err)),
        );
      }
    },
    [toggleStatusMutation],
  );

  const handleDelete = useCallback(
    async (formula: InventoryFormula) => {
      if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบชุด Inventory ${formula.code}?`)) {
        return;
      }
      try {
        await deleteMutation.mutateAsync(formula);
      } catch (err: unknown) {
        alert(
          "ลบไม่สำเร็จ: " + (err instanceof Error ? err.message : String(err)),
        );
      }
    },
    [deleteMutation],
  );

  return {
    formulas: paginatedFormulas,
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
  };
}
