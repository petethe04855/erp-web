export interface QuotationItem {
  id: number;
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface QuotationDetailLine {
  id?: number;
  productId?: number;
  sku: string;
  name: string;
  description?: string;
  qty: number;
  quantity?: number;
  price: number;
  unitPrice?: number;
  subtotal: number;
}

export interface QuotationDetail {
  id: number;
  code: string;
  customer: string;
  customerAddress?: string;
  customerLogo?: string;
  date: string;
  validUntil: string;
  amount: number;
  status: string;
  leadSource?: string;
  note?: string;
  soRef?: string;
  lines: QuotationDetailLine[];
  itemsCount: number;
  isExpired?: boolean;
  auditTrail?: Array<{
    action: string;
    actor: string;
    timestamp: string;
  }>;
}

export interface Quotation {
  id: number;
  quotationNumber: string;
  customerName: string;
  issueDate: string;
  validUntil: string;
  leadSource?: string;
  totalAmount: number;
  isExpired?: boolean;
  status: string;
}

export interface QuotationQueryParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateQuotationDTO {
  customerName: string;
  validUntil: string;
  leadSource?: string;
  items: Array<{
    sku: string;
    quantity: number;
    unitPrice: number;
  }>;
}
