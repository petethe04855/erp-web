export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SearchFilterParams extends PaginationParams, SortParams {
  search?: string;
  status?: string;
  [key: string]: unknown;
}
