import { read } from "@/lib/api";
import type { ProvinceQueryParams, TiktokProvinceReport } from "../types/crm";

export const crmApi = {
  getTiktokProvinces: async (params?: ProvinceQueryParams): Promise<TiktokProvinceReport> => {
    return read<TiktokProvinceReport>("/crm/tiktok/provinces", params);
  },
};
