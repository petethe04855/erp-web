import apiClient from "@/lib/axios";
import type {
  TikTokConnection,
  TikTokOrder,
  TikTokOrderQueryParams,
  TikTokSyncResult,
  SKUMapping,
  SyncLog,
} from "../types/tiktok";

export const tiktokApi = {
  getConnection: async (): Promise<TikTokConnection> => {
    const res = await apiClient.get<{ success: boolean; data: TikTokConnection }>(
      "/integrations/tiktok/connection",
    );
    return res.data.data;
  },

  startConnect: async (): Promise<{ authorizationUrl: string }> => {
    const res = await apiClient.post<{ success: boolean; data: { authorizationUrl: string } }>(
      "/integrations/tiktok/connect",
    );
    return res.data.data;
  },

  syncOrders: async (days: number = 30): Promise<TikTokSyncResult> => {
    const res = await apiClient.post<{ success: boolean; data: TikTokSyncResult }>(
      `/integrations/tiktok/orders/sync?days=${days}`,
    );
    return res.data.data;
  },

  getOrders: async (
    params?: TikTokOrderQueryParams,
  ): Promise<{ orders: TikTokOrder[]; total: number }> => {
    const res = await apiClient.get<{
      success: boolean;
      data: any[];
      meta?: { total: number };
    }>("/integrations/tiktok/orders", { params });

    const rawOrders = res.data.data || [];
    const orders: TikTokOrder[] = rawOrders.map((raw: any) => {
      // If raw is already formatted in Frontend style
      if (raw.tiktokOrderId && raw.orderStatus) {
        return raw as TikTokOrder;
      }

      // Backend domain entity structure adapter
      const items: any[] = (raw.items || []).map((it: any) => ({
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
        tiktokOrderId: raw.id,
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
      total: res.data.meta?.total ?? orders.length,
    };
  },

  getMappings: async (): Promise<SKUMapping[]> => {
    const res = await apiClient.get<{ success: boolean; data: any[] }>(
      "/integrations/tiktok/mappings",
    );
    const rawList = res.data.data || [];
    return rawList.map((m: any) => ({
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
    const res = await apiClient.post<{ success: boolean; data: any }>(
      "/integrations/tiktok/mappings",
      payload,
    );
    const saved = res.data.data || {};
    return {
      id: saved.id || 0,
      tiktokSku: saved.tiktokSku || mapping.tiktokSku || "",
      erpSku: saved.erpSku || mapping.erpSku || "",
      ratio: saved.ratio || 1,
    };
  },

  getSyncLogs: async (): Promise<SyncLog[]> => {
    const res = await apiClient.get<{ success: boolean; data: SyncLog[] }>(
      "/integrations/tiktok/logs",
    );
    return res.data.data || [];
  },
};
