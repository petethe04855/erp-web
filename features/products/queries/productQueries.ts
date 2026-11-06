import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../api/productApi";
import { ProductQueryParams, CreateProductDTO } from "../types/product";

export const PRODUCT_QUERY_KEYS = {
  all: ["products"] as const,
  lists: () => [...PRODUCT_QUERY_KEYS.all, "list"] as const,
  list: (params?: ProductQueryParams) =>
    [...PRODUCT_QUERY_KEYS.lists(), params] as const,
};

export function useProductListQuery(params?: ProductQueryParams) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.list(params),
    queryFn: () => productApi.getProducts(params),
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductDTO) => productApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
