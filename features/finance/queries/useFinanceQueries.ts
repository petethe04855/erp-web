import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeApi } from "../api/financeApi";
import type {
  JournalQueryParams,
  ExpenseQueryParams,
  CreateExpenseDTO,
  UpdateExpenseDTO,
} from "../types/finance";

export const financeKeys = {
  all: ["finance"] as const,
  journal: (params?: JournalQueryParams) => ["finance", "journal", params] as const,
  journalDetail: (id: number) => ["finance", "journal", id] as const,
  expenses: (params?: ExpenseQueryParams) => ["finance", "expenses", params] as const,
  pnl: (params?: { from?: string; to?: string; channel?: string }) => ["finance", "reports", "pnl", params] as const,
  gl: (params?: { from?: string; to?: string; account_id?: number }) => ["finance", "reports", "gl", params] as const,
  tb: (params?: { from?: string; to?: string }) => ["finance", "reports", "tb", params] as const,
  revenueByChannel: (params?: { from?: string; to?: string }) => ["finance", "reports", "revenueByChannel", params] as const,
};

export function useJournalEntries(params?: JournalQueryParams) {
  return useQuery({
    queryKey: financeKeys.journal(params),
    queryFn: () => financeApi.getJournalEntries(params),
  });
}

export function useJournalDetail(id: number) {
  return useQuery({
    queryKey: financeKeys.journalDetail(id),
    queryFn: () => financeApi.getJournalEntryById(id),
    enabled: id > 0,
  });
}

export function useExpenseByCode(code?: string | null) {
  return useQuery({
    queryKey: ["finance", "expenses", "by-code", code] as const,
    queryFn: () => financeApi.getExpenseByCode(code as string),
    enabled: !!code,
    retry: false,
  });
}

export function useExpenses(params?: ExpenseQueryParams) {
  return useQuery({
    queryKey: financeKeys.expenses(params),
    queryFn: () => financeApi.getExpenses(params),
  });
}

export function useExpenseMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateExpenseDTO) => financeApi.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExpenseDTO }) =>
      financeApi.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });

  const voidMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => financeApi.voidExpense(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });

  return {
    createExpense: createMutation.mutateAsync,
    updateExpense: updateMutation.mutateAsync,
    voidExpense: voidMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isVoiding: voidMutation.isPending,
  };
}

export function usePnLReport(params?: { from?: string; to?: string; channel?: string }) {
  return useQuery({
    queryKey: financeKeys.pnl(params),
    queryFn: () => financeApi.getProfitAndLoss(params),
  });
}

export function useGLReport(params?: { from?: string; to?: string; account_id?: number }) {
  return useQuery({
    queryKey: financeKeys.gl(params),
    queryFn: () => financeApi.getGeneralLedger(params),
  });
}

export function useTrialBalanceReport(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: financeKeys.tb(params),
    queryFn: () => financeApi.getTrialBalance(params),
  });
}

export function useRevenueByChannelReport(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: financeKeys.revenueByChannel(params),
    queryFn: () => financeApi.getRevenueByChannel(params),
  });
}
