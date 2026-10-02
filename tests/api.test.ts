import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the centralized axios client so no HTTP is performed.
vi.mock("@/lib/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from "@/lib/axios";
import { orderApi } from "@/features/orders/api/orderApi";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import { warehouseApi } from "@/features/warehouse/api/warehouseApi";
import { quotationApi } from "@/features/quotation/api/quotationApi";
import { recordApi } from "@/features/erp/api/recordApi";
import { purchaseApi } from "@/features/purchase/api/purchaseApi";
import { tiktokApi } from "@/features/tiktok/api/tiktokApi";

const mockedGet = vi.mocked(apiClient.get);
const mockedPost = vi.mocked(apiClient.post);

const listResponse = (data: unknown[], total = data.length) => ({
  data: {
    success: true,
    data,
    meta: { page: 1, limit: 20, total },
  },
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("orderApi.getOrders", () => {
  it("maps invRef to the real invoice payment status", async () => {
    mockedPost.mockResolvedValueOnce(
      listResponse([
        {
          id: 1,
          code: "SO-1",
          customer: "C",
          date: "2026-01-01",
          amount: 107,
          status: "PENDING",
          channel: "Manual",
          items: 2,
          invRef: "PAID",
        },
      ]),
    );

    const res = await orderApi.getOrders({ page: 1, limit: 20 });
    expect(res.data[0].paymentStatus).toBe("PAID");
  });

  it("sends the paymentStatus filter to the backend", async () => {
    mockedPost.mockResolvedValueOnce(listResponse([]));

    await orderApi.getOrders({ paymentStatus: "paid" } as never);
    const call = mockedPost.mock.calls[0];
    expect(call[0]).toBe("/workspace/orders/search");
    expect((call[1] as Record<string, unknown>).paymentStatus).toBe("paid");
  });

  it("drops the filter when set to all", async () => {
    mockedPost.mockResolvedValueOnce(listResponse([]));

    await orderApi.getOrders({ paymentStatus: "all" } as never);
    const body = mockedPost.mock.calls[0][1] as Record<string, unknown>;
    expect(body.paymentStatus).toBeUndefined();
  });
});

describe("inventoryApi.getStocks", () => {
  it("derives the percent from the backend reorder point, not a fake baseline", async () => {
    mockedPost.mockResolvedValueOnce(
      listResponse([
        {
          id: 1,
          sku: "A",
          name: "Product A",
          stock: 100,
          reservedQty: 20,
          available: 80,
          reorder: 40,
          isBundle: false,
        },
      ]),
    );

    const res = await inventoryApi.getStocks({ page: 1 });
    expect(res.data[0].onHand).toBe(100);
    expect(res.data[0].available).toBe(80);
    expect(res.data[0].stockStatus).toBe("healthy");
  });
});

describe("warehouseApi", () => {
  it("forwards the search filter for goods receives", async () => {
    mockedPost.mockResolvedValueOnce(listResponse([]));

    await warehouseApi.getGoodsReceives({ search: "GR-1", page: 1 });
    expect(mockedPost.mock.calls[0][0]).toBe("/workspace/goods-receives/search");
    const body = mockedPost.mock.calls[0][1] as Record<string, unknown>;
    expect(body.search).toBe("GR-1");
  });

  it("forwards the search filter for goods issues", async () => {
    mockedPost.mockResolvedValueOnce(listResponse([]));

    await warehouseApi.getGoodsIssues({ search: "SKU-9" });
    expect(mockedPost.mock.calls[0][0]).toBe("/workspace/goods-issues/search");
    const body = mockedPost.mock.calls[0][1] as Record<string, unknown>;
    expect(body.search).toBe("SKU-9");
  });
});

describe("quotationApi.createQuotation", () => {
  it("resolves all SKUs in ONE batched call instead of N+1", async () => {
    mockedPost
      // /skus/resolve
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            { sku: "A", id: 1, name: "Product A", found: true },
            { sku: "B", id: 2, name: "Product B", found: true },
          ],
        },
      })
      // /quotations
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: 9,
            code: "QT-1",
            customer: "C",
            date: "2026-01-01",
            validUntil: "2026-01-16",
            amount: 300,
            status: "Draft",
          },
        },
      });

    await quotationApi.createQuotation({
      customerName: "C",
      items: [
        { sku: "A", quantity: 1, unitPrice: 100 },
        { sku: "B", quantity: 2, unitPrice: 100 },
      ],
    } as never);

    expect(mockedPost).toHaveBeenCalledTimes(2);
    expect(mockedPost.mock.calls[0][0]).toBe("/skus/resolve");
  });

  it("rejects when a SKU cannot be resolved", async () => {
    mockedPost.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ sku: "X", id: 0, name: "", found: false }],
      },
    });

    await expect(
      quotationApi.createQuotation({
        customerName: "C",
        items: [{ sku: "X", quantity: 1, unitPrice: 10 }],
      } as never),
    ).rejects.toThrow(/SKU not found/);
  });
});

describe("recordApi.pay", () => {
  it("does not hard-code account or payment method", async () => {
    mockedPost.mockResolvedValueOnce({ data: { success: true, data: {} } });

    await recordApi.pay(1, 250);
    const body = mockedPost.mock.calls[0][1] as Record<string, unknown>;
    expect(body).toEqual({ amount: 250 });
    expect(body.accountCode).toBeUndefined();
    expect(body.method).toBeUndefined();
  });
});

describe("purchaseApi.createPurchaseOrder", () => {
  it("sends lead days and leaves ETA computation to the backend", async () => {
    mockedPost.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          id: 1,
          code: "PO-1",
          supplier: "S",
          date: "2026-01-01",
          etaDate: "2026-01-08",
          totalCost: 100,
          status: "PENDING",
        },
      },
    });

    await purchaseApi.createPurchaseOrder({
      supplierName: "S",
      expectedDeliveryDays: 7,
      items: [{ sku: "A", quantity: 1, unitCost: 100 }],
    });

    const body = mockedPost.mock.calls[0][1] as Record<string, unknown>;
    expect(body.expectedDeliveryDays).toBe(7);
    expect(body.etaDate).toBeUndefined();
  });
});

describe("purchaseApi.getPurchaseOrders", () => {
  it("calls POST /workspace/purchase-orders/search with query parameters", async () => {
    mockedPost.mockResolvedValueOnce(
      listResponse([
        {
          id: 1,
          code: "PO-100",
          supplier: "Supplier A",
          date: "2026-01-01",
          etaDate: "2026-01-08",
          totalCost: 500,
          status: "APPROVED",
        },
      ]),
    );

    const res = await purchaseApi.getPurchaseOrders({ search: "PO-100", status: "APPROVED" });
    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(mockedPost.mock.calls[0][0]).toBe("/workspace/purchase-orders/search");
    const body = mockedPost.mock.calls[0][1] as Record<string, unknown>;
    expect(body.search).toBe("PO-100");
    expect(body.status).toBe("APPROVED");
    expect(res.data[0].poNumber).toBe("PO-100");
  });
});

describe("tiktokApi.getOrders", () => {
  it("calls POST /integrations/tiktok/orders/search with filter body", async () => {
    mockedPost.mockResolvedValueOnce({
      data: {
        success: true,
        data: [
          {
            id: 101,
            tiktokOrderId: "TT-12345",
            orderStatus: "AWAITING_SHIPMENT",
          },
        ],
        meta: { page: 1, limit: 50, total: 1 },
      },
    });

    const res = await tiktokApi.getOrders({ search: "TT-12345", status: "AWAITING_SHIPMENT" });
    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(mockedPost.mock.calls[0][0]).toBe("/integrations/tiktok/orders/search");
    const body = mockedPost.mock.calls[0][1] as Record<string, unknown>;
    expect(body.search).toBe("TT-12345");
    expect(body.status).toBe("AWAITING_SHIPMENT");
    expect(res.orders[0].tiktokOrderId).toBe("TT-12345");
  });
});

