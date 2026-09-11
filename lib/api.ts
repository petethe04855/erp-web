import api from "./axios";
import type { ApiResponse, ApiListResponse } from "@/types/api";
export async function read<T>(path: string, params?: object): Promise<T> {
  const response = await api.get<ApiResponse<T>>(path, { params });
  if (response.data.success !== true)
    throw new Error("API returned an unsuccessful response");
  return response.data.data;
}

/**
 * Like read() but returns the whole envelope including optional meta — for
 * endpoints that return a plain array plus a total without full pagination
 * (e.g. GET /integrations/tiktok/orders).
 */
export async function readWithMeta<T>(
  path: string,
  params?: object,
): Promise<{ data: T; meta?: { total: number } }> {
  const response = await api.get<ApiResponse<T> & { meta?: { total: number } }>(
    path,
    { params },
  );
  if (response.data.success !== true)
    throw new Error("API returned an unsuccessful response");
  return { data: response.data.data, meta: response.data.meta };
}
export async function writeRecord<T>(
  path: string,
  body: unknown,
  method: "post" | "put" = "post",
): Promise<ApiResponse<T>> {
  const response = await api[method]<ApiResponse<T>>(path, body);
  if (response.data.success !== true)
    throw new Error("API returned an unsuccessful response");
  return response.data;
}
export async function deleteRecord<T = unknown>(
  path: string,
): Promise<ApiResponse<T>> {
  const response = await api.delete<ApiResponse<T>>(path);
  if (response.data.success !== true)
    throw new Error("API returned an unsuccessful response");
  return response.data;
}
export function cleanParams(params: object = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== "all" && v !== "" && v !== undefined,
    ),
  );
}
export async function list<A, B>(
  path: string,
  params: object | undefined,
  map: (row: A) => B,
): Promise<ApiListResponse<B>> {
  const response = await api.get<ApiListResponse<A>>(path, {
    params: cleanParams(params),
  });
  const body = response.data;
  if (body.success !== true || !Array.isArray(body.data) || !body.meta)
    throw new Error("ERP API contract mismatch: paginated response required");
  return {
    ...body,
    data: body.data.map(map),
    meta: {
      ...body.meta,
      totalPages: Math.max(1, Math.ceil(body.meta.total / body.meta.limit)),
    },
  };
}
