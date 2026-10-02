import { list, searchList, writeRecord } from "@/lib/api";
import type { ReceiptRecord, IssueRecord } from "@/types/records";
import type {
  GoodsReceiveRecord,
  GoodsIssueRecord,
  GoodsReceiveQueryParams,
  GoodsIssueQueryParams,
  CreateGoodsReceiveDTO,
  CreateGoodsIssueDTO,
} from "../types/warehouse";
const receipt = (r: ReceiptRecord): GoodsReceiveRecord => ({
  id: r.id,
  grnNumber: r.code,
  poNumber: r.poRef,
  receivedDate: r.receiveDate,
});
export function normalizeChannel(channel?: string, orderRef?: string): string {
  if (!channel) return "Manual";
  const upper = channel.toUpperCase().trim();
  if (upper.includes("TIKTOK")) return "TikTok";
  if (upper.includes("SHOPEE")) return "Shopee";
  if (upper.includes("MANUAL")) return "Manual";
  if (upper.includes("ORDER")) {
    const ref = (orderRef || "").toUpperCase().trim();
    if (ref.startsWith("TT") || ref.includes("TIKTOK")) return "TikTok";
    if (ref.startsWith("SP") || ref.includes("SHOPEE")) return "Shopee";
    return "Manual";
  }
  return channel;
}

const issue = (r: IssueRecord): GoodsIssueRecord => ({
  id: r.id,
  issueNumber: r.code,
  orderNumber: r.orderRef,
  reason: r.reason,
  warehouse: normalizeChannel(r.channel, r.orderRef),
  issuedDate: r.date,
  totalItems: r.qty,
});
export const warehouseApi = {
  getGoodsReceives: (params?: GoodsReceiveQueryParams) =>
    searchList<ReceiptRecord, GoodsReceiveRecord>(
      "/workspace/goods-receives/search",
      {
        ...params,
        search: params?.search,
      },
      receipt,
    ),
  getGoodsIssues: (params?: GoodsIssueQueryParams) =>
    searchList<IssueRecord, GoodsIssueRecord>(
      "/workspace/goods-issues/search",
      {
        ...params,
        search: params?.search,
      },
      issue,
    ),
  createGoodsReceive: async (dto: CreateGoodsReceiveDTO) => {
    const res = await writeRecord<ReceiptRecord>("/goods-receives", {
      poRef: dto.poNumber,
      receiveDate: dto.receiveDate,
      items: [
        {
          sku: dto.sku,
          qtyReceived: dto.quantity,
          unitCost: dto.unitCost,
          retailPrice: dto.retailPrice,
          expiryDate: dto.expiryDate,
          supplierLot: dto.lotNumber,
          qcStatus: "Accepted",
        },
      ],
    });
    return { ...res, data: receipt(res.data) };
  },
  createGoodsIssue: async (dto: CreateGoodsIssueDTO) => {
    const res = await writeRecord<IssueRecord>("/goods-issues", {
      sku: dto.sku,
      qty: dto.quantity,
      reason: dto.reason,
      channel: dto.warehouse,
      orderRef: dto.orderNumber,
    });
    return { ...res, data: issue(res.data) };
  },
};
