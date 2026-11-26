"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useCreateBoothSaleMutation } from "../queries/boothQueries";
import { cashResult, previewBill } from "../lib/pricing";
import type { BoothCart, BoothCatalog, BoothPayMethod, BoothSale } from "../types/booth";

const newRef = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

/**
 * Cart, payment and the "sold" action of the booth screen. Each bill gets a
 * client ref when the cart starts; a retry after a dropped connection sends
 * the same ref, so the API never takes the stock out twice.
 */
export function useBoothSell(catalog: BoothCatalog | undefined) {
  const [cart, setCart] = useState<BoothCart>({});
  const [payMethod, setPayMethod] = useState<BoothPayMethod>("cash");
  const [cashReceived, setCashReceived] = useState<number | null>(null);
  const ref = useRef<string>(newRef());
  const mutation = useCreateBoothSaleMutation();

  const bill = useMemo(
    () => (catalog ? previewBill(cart, catalog.config) : null),
    [cart, catalog],
  );
  const cash = bill ? cashResult(bill.total, cashReceived) : null;
  const cashShort = payMethod === "cash" && !!cash && cash.short > 0;

  const adjust = useCallback((skuId: number, delta: number) => {
    setCart((prev) => {
      const next = Math.max(0, (prev[skuId] ?? 0) + delta);
      const out = { ...prev, [skuId]: next };
      if (next === 0) delete out[skuId];
      return out;
    });
    setCashReceived(null);
    // A different cart is a different bill: a new ref keeps a late retry of
    // the old one from being matched to it.
    ref.current = newRef();
  }, []);

  const clear = useCallback(() => {
    setCart({});
    setCashReceived(null);
    setPayMethod("cash");
    ref.current = newRef();
  }, []);

  const choosePay = useCallback((m: BoothPayMethod) => {
    setPayMethod(m);
    setCashReceived(null);
  }, []);

  const sell = useCallback(async (): Promise<BoothSale | null> => {
    if (!bill || bill.isEmpty || cashShort) return null;
    const lines = Object.entries(cart)
      .filter(([, q]) => q > 0)
      .map(([id, qty]) => ({ skuId: Number(id), qty }));
    const result = await mutation.mutateAsync({
      clientRef: ref.current,
      lines,
      paymentMethod: payMethod,
      cashReceived: payMethod === "cash" ? (cashReceived ?? bill.total) : undefined,
      expectedTotal: bill.total,
    });
    clear();
    return result.sale;
  }, [bill, cart, cashReceived, cashShort, clear, mutation, payMethod]);

  return {
    cart,
    bill,
    payMethod,
    cashReceived,
    cash,
    cashShort,
    adjust,
    clear,
    choosePay,
    setCashReceived,
    sell,
    isSelling: mutation.isPending,
  };
}
