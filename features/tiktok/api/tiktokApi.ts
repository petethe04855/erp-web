import { read, readWithMeta, writeRecord } from "@/lib/api";
import type { ApiPaginationMeta } from "@/types/api";
import type {
  TikTokConnection,
  TikTokOrder,
  TikTokOrderItem,
  TikTokOrderQueryParams,
  TikTokSyncResult,
  TikTokSyncRun,
  SKUMapping,
  SyncLog,
} from "../types/tiktok";

interface RawTikTokOrder {
  id: string | number;
  status?: string;
  product?: string;
  sku?: string;
  qty?: number;
  amount?: number;
  stockDeducted?: boolean;
  date?: string;
  items?: Array<{
    id?: number;
    lineItemId?: string;
    sku?: string;
    productName?: string;
    qty?: number;
    quantity?: number;
    unitPrice?: number;
    amount?: number;
  }>;
  tiktokOrderId?: string;
  orderStatus?: string;
}

interface RawMapping {
  id: number;
  tiktokSku?: string;
  tiktok_sku?: string;
  erpSku?: string;
  local_sku?: string;
  ratio?: number;
  createdAt?: string;
  created_at?: string;
}

export const tiktokApi = {
  getConnection: () => read<TikTokConnection>("/integrations/tiktok/connection"),

  startConnect: async () => {
    const res = await writeRecord<{ authorizationUrl: string }>(
      "/integrations/tiktok/connect",
      {},
    );
    return res.data;
  },

  syncOrders: async (days: number = 30): Promise<TikTokSyncResult> => {
    const res = await writeRecord<TikTokSyncResult>(
      `/integrations/tiktok/orders/sync?days=${days}`,
      {},
    );
    return res.data;
  },

  getOrders: async (
    params?: TikTokOrderQueryParams,
  ): Promise<{ orders: TikTokOrder[]; total: number; meta: ApiPaginationMeta }> => {
    const raw = await readWithMeta<
      RawTikTokOrder[]
    >("/integrations/tiktok/orders", params);

    const rawOrders = raw.data || [];
    const orders: TikTokOrder[] = rawOrders.map((raw) => {
      // If raw is already formatted in Frontend style
      if (raw.tiktokOrderId && raw.orderStatus) {
        return raw as TikTokOrder;
      }

      // Backend domain entity structure adapter
      const items: TikTokOrderItem[] = (raw.items || []).map((it) => ({
        id: it.id || it.lineItemId || "",
        orderId: raw.id || "",
        tiktokItemId: it.lineItemId || "",
        skuId: it.sku || "",
        sellerSku: it.sku || "",
        productName: it.productName || raw.product || "สินค้า TikTok",
        skuName: it.sku || "",
        quantity: it.qty || it.quantity || 1,
        originalPrice: it.unitPrice || it.amount || 0,
        salePrice: it.unitPrice || (it.amount && it.qty ? it.amount / it.qty : 0),
        erpSku: it.sku || "",
        isBundle: false,
      }));

      // If no items list but has product/sku in header
      if (items.length === 0 && (raw.product || raw.sku)) {
        items.push({
          id: `${raw.id}-1`,
          orderId: raw.id,
          productName: raw.product || "สินค้า TikTok",
          sellerSku: raw.sku || "",
          erpSku: raw.sku || "",
          quantity: raw.qty || 1,
          salePrice: raw.amount ? (raw.qty ? raw.amount / raw.qty : raw.amount) : 0,
        });
      }

      return {
        id: raw.id,
        tiktokOrderId: String(raw.id),
        orderStatus: raw.status || "UNKNOWN",
        buyerUid: "",
        recipientName: "ลูกค้า TikTok",
        recipientPhone: "",
        recipientAddress: "",
        recipientCity: "",
        recipientProvince: "",
        recipientPostalCode: "",
        totalAmount: raw.amount || 0,
        shippingFee: 0,
        paymentMethod: "TikTok Shop",
        deliveryOption: "Standard",
        shippingProvider: "",
        trackingNumber: "",
        stockDeducted: Boolean(raw.stockDeducted),
        stockDeductionStatus: raw.stockDeducted ? "DEDUCTED" : "PENDING",
        orderCreatedAt: raw.date,
        items,
      };
    });

    return {
      orders,
      total: raw.meta?.total ?? orders.length,
      meta: raw.meta ?? {
        page: params?.page ?? 1,
        limit: params?.limit ?? 50,
        total: orders.length,
        totalPages: Math.ceil(orders.length / (params?.limit ?? 50)) || 1,
      },
    };
  },

  getMappings: async (): Promise<SKUMapping[]> => {
    const raw = await read<{ data: RawMapping[] }>(
      "/integrations/tiktok/mappings",
    );
    const rawList = raw.data || [];
    return rawList.map((m) => ({
      id: m.id,
      tiktokSku: m.tiktokSku || m.tiktok_sku || "",
      erpSku: m.erpSku || m.local_sku || "",
      ratio: m.ratio || 1,
      createdAt: m.createdAt || m.created_at || "",
    }));
  },

  saveMapping: async (mapping: Partial<SKUMapping>): Promise<SKUMapping> => {
    const payload = {
      tiktokSku: mapping.tiktokSku,
      tiktok_sku: mapping.tiktokSku,
      erpSku: mapping.erpSku,
      local_sku: mapping.erpSku,
      ratio: mapping.ratio || 1,
    };
    const res = await writeRecord<Partial<RawMapping>>(
      "/integrations/tiktok/mappings",
      payload,
    );
    const saved = res.data || {};
    return {
      id: saved.id || 0,
      tiktokSku: saved.tiktokSku || mapping.tiktokSku || "",
      erpSku: saved.erpSku || mapping.erpSku || "",
      ratio: saved.ratio || 1,
    };
  },

  getSyncRuns: async (limit: number = 1): Promise<TikTokSyncRun[]> => {
    const raw = await read<TikTokSyncRun[]>("/integrations/tiktok/sync-runs", { limit });
    return Array.isArray(raw) ? raw : [];
  },

  getSyncLogs: async (): Promise<SyncLog[]> => {
    const raw = await read<{ data: SyncLog[] }>("/integrations/tiktok/logs");
    return raw.data || [];
  },
};
