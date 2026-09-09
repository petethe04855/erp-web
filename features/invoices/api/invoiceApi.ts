import { list, writeRecord } from "@/lib/api";
import type { InvoiceRecord } from "@/features/erp/types/records";
import type {
  Invoice,
  InvoiceQueryParams,
  CreateInvoiceDTO,
} from "../types/invoice";
const map = (i: InvoiceRecord): Invoice => ({
  id: i.id,
  invoiceNumber: i.code,
  orderNumber: i.soRef,
  customerName: i.customer,
  issueDate: i.issueDate,
  dueDate: i.dueDate,
  subtotal: i.subtotal,
  taxAmount: i.vatAmount,
  totalAmount: i.amount,
  status: i.status,
});
export const invoiceApi = {
  getInvoices: (params?: InvoiceQueryParams) =>
    list<InvoiceRecord, Invoice>("/workspace/invoices", params, map),
  createInvoice: async (dto: CreateInvoiceDTO) => {
    const res = await writeRecord<InvoiceRecord>(
      "/invoices/from-so/" + encodeURIComponent(dto.orderNumber),
      {},
    );
    return { ...res, data: map(res.data) };
  },
};
