import axios from "@/lib/axios";
import type {
  InventoryFormula,
  CreateFormulaDTO,
  UpdateFormulaDTO,
} from "../types/formula";

export const formulaApi = {
  getFormulas: async (search?: string, status?: string): Promise<InventoryFormula[]> => {
    const res = await axios.get<{
      success: boolean;
      data: InventoryFormula[];
    }>("/inventory-formulas", {
      params: { search, status },
    });
    return res.data.data || [];
  },

  getFormulaByCode: async (code: string): Promise<InventoryFormula> => {
    const res = await axios.get<{
      success: boolean;
      data: InventoryFormula;
    }>(`/inventory-formulas/${encodeURIComponent(code)}`);
    return res.data.data;
  },

  createFormula: async (dto: CreateFormulaDTO): Promise<InventoryFormula> => {
    const res = await axios.post<{
      success: boolean;
      data: InventoryFormula;
    }>("/inventory-formulas", dto);
    return res.data.data;
  },

  updateFormula: async (
    code: string,
    dto: UpdateFormulaDTO,
  ): Promise<InventoryFormula> => {
    const res = await axios.put<{
      success: boolean;
      data: InventoryFormula;
    }>(`/inventory-formulas/${encodeURIComponent(code)}`, dto);
    return res.data.data;
  },

  toggleStatus: async (
    code: string,
    isActive: boolean,
  ): Promise<InventoryFormula> => {
    const res = await axios.patch<{
      success: boolean;
      data: InventoryFormula;
    }>(`/inventory-formulas/${encodeURIComponent(code)}/status`, { isActive });
    return res.data.data;
  },

  deleteFormula: async (code: string): Promise<void> => {
    await axios.delete(`/inventory-formulas/${encodeURIComponent(code)}`);
  },
};

