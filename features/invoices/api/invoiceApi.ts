import { list, read, writeRecord } from "@/lib/api";
import type { InvoiceRecord } from "@/types/records";
import type {
  Invoice,
  InvoiceDetail,
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
  paid: i.paid,
  balance: i.balance,
  isOverdue: i.isOverdue,
  status: i.status,
});
export const invoiceApi = {
  getInvoices: (params?: InvoiceQueryParams) =>
    list<InvoiceRecord, Invoice>("/workspace/invoices", params, map),
  getInvoiceByID: (id: string | number) =>
    read<InvoiceDetail>("/invoices/" + encodeURIComponent(id)),
  payInvoice: (id: string | number, amount: number) =>
    writeRecord("/invoices/" + encodeURIComponent(id) + "/payment", {
      amount,
    }),
  createInvoice: async (dto: CreateInvoiceDTO) => {
    const res = await writeRecord<InvoiceRecord>(
      "/invoices/from-so/" + encodeURIComponent(dto.orderNumber),
      {},
    );
    return { ...res, data: map(res.data) };
  },
};
