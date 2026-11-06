export interface InventoryFormulaItem {
  id?: number;
  componentSku: string;
  qty: number;
  unit: string;
  availableQty?: number;
  componentName?: string;
}

export interface InventoryFormula {
  id: number;
  code: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  availableSets?: number;
  items: InventoryFormulaItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFormulaItemDTO {
  componentSku: string;
  qty: number;
  unit?: string;
}

export interface CreateFormulaDTO {
  code: string;
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  items: CreateFormulaItemDTO[];
}

export interface UpdateFormulaDTO {
  name?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  items?: CreateFormulaItemDTO[];
}
