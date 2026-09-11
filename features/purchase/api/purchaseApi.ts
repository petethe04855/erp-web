import { list, writeRecord } from "@/lib/api";
import type { PurchaseRecord } from "@/features/erp/types/records";
import type {
  PurchaseOrder,
  PurchaseQueryParams,
  CreatePurchaseDTO,
} from "../types/purchase";
const map = (p: PurchaseRecord): PurchaseOrder => ({
  id: p.id,
  poNumber: p.code,
  supplierName: p.supplier,
  orderDate: p.date,
  expectedDeliveryDate: p.etaDate,
  totalAmount: p.totalCost,
  status: p.status,
});
export const purchaseApi = {
  getPurchaseOrders: (params?: PurchaseQueryParams) =>
    list<PurchaseRecord, PurchaseOrder>(
      "/workspace/purchase-orders",
      params,
      map,
    ),
  createPurchaseOrder: async (dto: CreatePurchaseDTO) => {
    // ETA date resolution is the backend's job (purchasing workflow owns
    // delivery scheduling); frontend sends only the requested lead days.
    const res = await writeRecord<PurchaseRecord>("/purchase-orders", {
      supplier: dto.supplierName,
      expectedDeliveryDays: dto.expectedDeliveryDays,
      items: dto.items.map((i) => ({
        sku: i.sku,
        quantity: i.quantity,
        qty: i.quantity,
        unitCost: i.unitCost,
      })),
    });
    return { ...res, data: map(res.data) };
  },
};
