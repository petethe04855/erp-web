import { list, read, writeRecord } from "@/lib/api";
import type { QuotationRecord } from "@/types/records";
import type {
  Quotation,
  QuotationDetail,
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
  isExpired: q.isExpired,
  status: q.status,
});
export const quotationApi = {
  getQuotations: (params?: QuotationQueryParams) =>
    list<QuotationRecord, Quotation>("/workspace/quotations", params, map),
  getQuotationByID: (id: string | number) =>
    read<QuotationDetail>("/quotations/" + encodeURIComponent(id)),
  updateStatus: (id: string | number, status: string) =>
    writeRecord("/quotations/" + encodeURIComponent(id) + "/status", { status }, "put"),
  convertQuotation: (id: string | number) =>
    writeRecord<{ quotationId: number; orderId: number; orderNo: string }>(
      "/quotations/" + encodeURIComponent(id) + "/convert",
      {}
    ),
  createQuotation: async (dto: CreateQuotationDTO) => {
    const date = new Date();
    // One batched resolve call instead of one GET per line (N+1).
    const resolved = await writeRecord<Array<{
      sku: string;
      id: number;
      name: string;
      found: boolean;
    }>>("/skus/resolve", { skus: dto.items.map((i) => i.sku) });
    const bySku = new Map(resolved.data.map((r) => [r.sku.toUpperCase(), r]));
    const missing = dto.items.filter(
      (i) => !bySku.get(i.sku.toUpperCase())?.found,
    );
    if (missing.length > 0) {
      throw new Error(
        `SKU not found: ${missing.map((i) => i.sku).join(", ")}`,
      );
    }
    const lines = dto.items.map((item) => {
      const product = bySku.get(item.sku.toUpperCase())!;
      return {
        productId: product.id,
        sku: product.sku,
        name: product.name,
        qty: item.quantity,
        price: item.unitPrice,
      };
    });
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
