import { list, writeRecord } from "@/lib/api";
import type { OrderRecord } from "@/features/erp/types/records";
import type { Order, OrderQueryParams, CreateOrderDTO } from "../types/order";
const map = (o: OrderRecord): Order => ({
  id: o.id,
  orderNumber: o.code,
  customerName: o.customer,
  orderDate: o.date,
  totalAmount: o.amount,
  fulfillmentStatus: o.status,
  paymentStatus: o.invRef || "—",
  channel: o.channel || "Manual",
  itemsCount: o.items,
});
export const orderApi = {
  getOrders: (params?: OrderQueryParams) =>
    list<OrderRecord, Order>(
      "/workspace/orders",
      {
        ...params,
        status: params?.fulfillmentStatus && params?.fulfillmentStatus !== "all" ? params.fulfillmentStatus : undefined,
        paymentStatus: params?.paymentStatus && params?.paymentStatus !== "all" ? params.paymentStatus : undefined,
        channel: params?.channel && params?.channel !== "all" ? params.channel : undefined,
        fulfillmentStatus: undefined,
      },
      map,
    ),
  createOrder: async (dto: CreateOrderDTO) => {
    const res = await writeRecord<OrderRecord>("/sales-orders", {
      customer: dto.customerName,
      channel: dto.channel || "Manual",
      includeVat: dto.includeVat ?? true,
      lines: dto.items.map((i) => ({
        sku: i.sku,
        qty: i.quantity,
        unitPrice: i.price,
      })),
    });
    return { ...res, data: map(res.data) };
  },
};
