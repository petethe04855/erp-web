import { list, read, writeRecord } from "@/lib/api";
import type { ProductRecord, QuotationRecord } from "@/features/erp/types/records";
import type {
  Quotation,
  QuotationQueryParams,
  CreateQuotationDTO,
} from "../types/quotation";
const map = (q: QuotationRecord): Quotation => ({
  id: q.id,
  quotationNumber: q.code,
  customerName: q.customer,
  issueDate: q.date,
  validUntil: q.validUntil,
  leadSource: q.leadSource,
  totalAmount: q.amount,
  status: q.status,
});
export const quotationApi = {
  getQuotations: (params?: QuotationQueryParams) =>
    list<QuotationRecord, Quotation>("/workspace/quotations", params, map),
  createQuotation: async (dto: CreateQuotationDTO) => {
    const date = new Date();
    const lines = await Promise.all(dto.items.map(async (item) => {
      const product = await read<ProductRecord>(`/products/${encodeURIComponent(item.sku)}`);
      return { productId: product.id, sku: product.sku, name: product.name, qty: item.quantity, price: item.unitPrice };
    }));
    const res = await writeRecord<QuotationRecord>("/quotations", {
      customer: dto.customerName,
      date: date.toLocaleDateString("en-CA"),
      validUntil: dto.validUntil,
      status: "Draft",
      leadSource: dto.leadSource || "Manual",
      lines,
    });
    return { ...res, data: map(res.data) };
  },
};
