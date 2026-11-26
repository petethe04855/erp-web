import { read, writeRecord } from "@/lib/api";
import type {
  BoothCatalog,
  BoothConfig,
  BoothSale,
  BoothSaleResult,
  CreateBoothSaleDTO,
} from "../types/booth";

export const boothApi = {
  getCatalog: () => read<BoothCatalog>("/booth/catalog"),

  saveConfig: async (config: BoothConfig) =>
    (await writeRecord<BoothCatalog>("/booth/config", config, "put")).data,

  listSales: (date?: string) =>
    read<BoothSale[]>("/booth/sales", date ? { date } : undefined),

  createSale: async (dto: CreateBoothSaleDTO) =>
    (await writeRecord<BoothSaleResult>("/booth/sales", dto)).data,

  voidSale: async (id: number, reason?: string) =>
    (await writeRecord<BoothSale>(`/booth/sales/${id}/void`, { reason: reason ?? "" })).data,
};
