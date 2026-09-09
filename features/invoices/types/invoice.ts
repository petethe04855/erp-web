export interface Invoice {
  id: number;
  invoiceNumber: string;
  orderNumber: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
}

export interface InvoiceQueryParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateInvoiceDTO {
  orderNumber: string;
}
