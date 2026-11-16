import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/features/orders/api/orderApi";
import { returnApi } from "@/features/returns/api/returnApi";

/**
 * Source-document lookups for the General Journal. A journal entry only stores
 * (source_type, source_ref); these hooks resolve that ref to the document the
 * event came from so the detail modal can show it automatically.
 */

export function useJournalSourceOrder(orderNo?: string | null) {
  return useQuery({
    queryKey: ["finance", "journal-source", "order", orderNo] as const,
    queryFn: async () => {
      const res = await orderApi.getOrders({ search: orderNo as string, limit: 5 });
      return res.data.find((o) => o.orderNumber === orderNo) ?? null;
    },
    enabled: !!orderNo,
    retry: false,
  });
}

export function useJournalSourceReturn(returnNo?: string | null) {
  return useQuery({
    queryKey: ["finance", "journal-source", "return", returnNo] as const,
    queryFn: async () => {
      const res = await returnApi.getReturns({ search: returnNo as string, limit: 5 });
      return res.data.find((r) => r.return_no === returnNo) ?? null;
    },
    enabled: !!returnNo,
    retry: false,
  });
}
