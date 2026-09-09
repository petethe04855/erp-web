export interface QuotationItem {
  id: number;
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Quotation {
  id: number;
  quotationNumber: string;
  customerName: string;
  issueDate: string;
  validUntil: string;
  leadSource?: string;
  totalAmount: number;
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
