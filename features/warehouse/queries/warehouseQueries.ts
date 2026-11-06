import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { warehouseApi } from "../api/warehouseApi";
import {
  GoodsReceiveQueryParams,
  GoodsIssueQueryParams,
  CreateGoodsReceiveDTO,
  CreateGoodsIssueDTO,
} from "../types/warehouse";

export const WAREHOUSE_QUERY_KEYS = {
  all: ["warehouse"] as const,
  receives: (params?: GoodsReceiveQueryParams) =>
    [...WAREHOUSE_QUERY_KEYS.all, "receives", params] as const,
  issues: (params?: GoodsIssueQueryParams) =>
    [...WAREHOUSE_QUERY_KEYS.all, "issues", params] as const,
};

export function useGoodsReceiveListQuery(params?: GoodsReceiveQueryParams) {
  return useQuery({
    queryKey: WAREHOUSE_QUERY_KEYS.receives(params),
    queryFn: () => warehouseApi.getGoodsReceives(params),
  });
}

export function useCreateGoodsReceiveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateGoodsReceiveDTO) =>
      warehouseApi.createGoodsReceive(dto),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useGoodsIssueListQuery(params?: GoodsIssueQueryParams) {
  return useQuery({
    queryKey: WAREHOUSE_QUERY_KEYS.issues(params),
    queryFn: () => warehouseApi.getGoodsIssues(params),
  });
}

export function useCreateGoodsIssueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateGoodsIssueDTO) =>
      warehouseApi.createGoodsIssue(dto),
    onSuccess: () => {
      queryClient.invalidateQueries();
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["skus"] });
      queryClient.refetchQueries({ queryKey: ["inventory"] });
    },
  });
}
