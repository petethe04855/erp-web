import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "../api/catalogApi";
import { useState, useEffect } from "react";
export interface LookupItem<T = unknown> {
  value: string;
  label: string;
  record?: T;
}

export function useLookup(
  kind: "products" | "customers" | "orders",
  search: string,
) {
  const [term, setTerm] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setTerm(search), 300);
    return () => clearTimeout(timer);
  }, [search]);
  return useQuery<LookupItem[]>({
    queryKey: ["lookup", kind, term],
    queryFn: async () => {
      if (kind === "products")
        return (await catalogApi.products(term)).data.map((r) => ({
          value: r.sku,
          label: r.name,
          record: r,
        }));
      if (kind === "customers")
        return (await catalogApi.customers(term)).data.map((r) => ({
          value: r.name,
          label: r.phone ? `${r.name} (${r.phone})` : r.contactPerson && r.contactPerson !== r.name ? `${r.name} - ${r.contactPerson}` : r.name,
          record: r,
        }));
      return (await catalogApi.orders(term)).data.map((r) => ({
        value: r.code,
        label: `${r.code} - ${r.customer} (฿${Number(r.amount || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })})`,
        record: r,
      }));
    },
  });
}
