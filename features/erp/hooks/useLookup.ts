import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "../api/catalogApi";
import { useState, useEffect } from "react";
export function useLookup(
  kind: "products" | "customers" | "orders",
  search: string,
) {
  const [term, setTerm] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setTerm(search), 300);
    return () => clearTimeout(timer);
  }, [search]);
  return useQuery({
    queryKey: ["lookup", kind, term],
    queryFn: async () => {
      if (kind === "products")
        return (await catalogApi.products(term)).data.map((r) => ({
          value: r.sku,
          label: r.name,
        }));
      if (kind === "customers")
        return (await catalogApi.customers(term)).data.map((r) => ({
          value: r.name,
          label: r.id,
        }));
      return (await catalogApi.orders(term)).data.map((r) => ({
        value: r.code,
        label: r.customer,
      }));
    },
  });
}
