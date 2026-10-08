import { read, search } from "@/lib/api";
import type { ProvinceQueryParams, ProvinceSearchRequest, TiktokProvinceReport } from "../types/crm";

export const crmApi = {
  getTiktokProvinces: async (params?: ProvinceQueryParams): Promise<TiktokProvinceReport> => {
    return read<TiktokProvinceReport>("/crm/tiktok/provinces", params);
  },
  searchTiktokProvince: async (body: ProvinceSearchRequest): Promise<TiktokProvinceReport> => {
    return search<TiktokProvinceReport>("/crm/tiktok/provinces/search", body);
  },
};
