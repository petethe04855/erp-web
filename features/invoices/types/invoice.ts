export interface InvoiceDetailLine {
  sku?: string;
  name?: string;
  quantity?: number;
  qty?: number;
  unit?: string;
  unitPrice?: number;
  price?: number;
  discount?: number;
  subtotal?: number;
  lineTotal?: number;
}

export interface InvoiceDetail {
  id: number;
  code: string;
  invoiceNo: string;
  soRef?: string;
  orderNo?: string;
  orderId?: number;
  customer: string;
  customerName: string;
  customerAddress?: string;
  customerLogo?: string;
  customerTaxId?: string;
  customerBranch?: string;
  amount: number;
  totalAmount: number;
  paid: number;
  balance?: number;
  status: string;
  paymentMethod?: string;
  issueDate: string;
  date: string;
  dueDate?: string;
  lines: InvoiceDetailLine[];
  itemsCount: number;
  isOverdue?: boolean;
  auditTrail?: Array<{
    action: string;
    actor: string;
    timestamp: string;
  }>;
}

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
  paid?: number;
  balance?: number;
  isOverdue?: boolean;
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
