"use client";
import { useState, useEffect } from "react";
export function useFilters<T extends object>(defaults: T) {
  const [filters, setFilters] = useState<T>(defaults);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFilters((previous) => ({
      ...previous,
      ...Object.fromEntries(
        Object.keys(previous)
          .filter((key) => params.has(key))
          .map((key) => [
            key,
            typeof previous[key as keyof T] === "number"
              ? Number(params.get(key))
              : params.get(key),
          ]),
      ),
    }));
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== "all" && v !== "") params.set(k, String(v));
    });
    window.history.replaceState(
      null,
      "",
      window.location.pathname + "?" + params,
    );
  }, [filters, ready]);
  const [query, setQuery] = useState(filters);
  useEffect(() => {
    const timer = setTimeout(() => setQuery(filters), 350);
    return () => clearTimeout(timer);
  }, [filters]);
  return { filters, setFilters, query };
}
