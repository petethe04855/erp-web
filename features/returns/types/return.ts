export type ReturnStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export type ReturnType = "CUSTOMER" | "INTERNAL";

export type ItemCondition = "GOOD" | "DAMAGED" | "EXPIRED" | "WRONG_ITEM";

export type ReasonCode =
  | "CUSTOMER_CHANGE"
  | "DEFECT"
  | "LATE_DELIVERY"
  | "WRONG_ITEM"
  | "OTHER";

export interface SalesReturnLine {
  id?: number;
  return_id?: number;
  sku: string;
  name: string;
  ordered_qty: number;
  quantity: number;
  unit_price: number;
  line_amount: number;
  condition: ItemCondition;
  restock: boolean;
  reason_code: ReasonCode;
  lot_ref?: string;
}

export interface SalesReturn {
  id: number;
  return_no: string;
  return_type: ReturnType;
  order_id?: number;
  order_no?: string;
  invoice_id?: number;
  invoice_no?: string;
  customer_id?: number;
  customer_name: string;
  channel?: string;
  warehouse_id: number;
  return_date: string;
  status: ReturnStatus;
  reason?: string;
  note?: string;
  cancellation_reason?: string;
  total_qty: number;
  subtotal: number;
  vat_adjust: number;
  net_amount: number;
  created_by?: string;
  approved_by?: string;
  completed_by?: string;
  lines: SalesReturnLine[];
  created_at?: string;
  updated_at?: string;
}

export interface ReturnableItem {
  sku: string;
  name: string;
  ordered_qty: number;
  returned_qty_so_far: number;
  returnable_qty: number;
  unit_price: number;
}

export interface CreateReturnLineDTO {
  sku: string;
  quantity: number;
  condition?: ItemCondition;
  restock?: boolean;
  reason_code?: ReasonCode;
  lot_ref?: string;
}

export interface CreateReturnDTO {
  return_type: ReturnType;
  order_id?: number;
  warehouse_id?: number;
  return_date?: string;
  reason?: string;
  note?: string;
  lines: CreateReturnLineDTO[];
}

export interface UpdateReturnDTO {
  warehouse_id?: number;
  return_date?: string;
  reason?: string;
  note?: string;
  lines: CreateReturnLineDTO[];
}

export interface CompleteReturnLineDTO {
  line_id: number;
  condition: ItemCondition;
  restock: boolean;
}

export interface CompleteReturnDTO {
  lines: CompleteReturnLineDTO[];
}
