"use client";
import { useState, useEffect, useSyncExternalStore } from "react";

// Read location.search once per component tree using an external store
// subscription on the History API. SSR-safe: returns "" on the server.
function subscribeToLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}
function getLocationSearch(): string {
  return typeof window === "undefined" ? "" : window.location.search;
}
function getServerSnapshot(): string {
  return "";
}

export function useFilters<T extends object>(defaults: T) {
  // Hydrate initial state from URL search params synchronously (no
  // setState-in-effect): numeric fields are parsed, the rest stay strings.
  const initialSearch = useSyncExternalStore(
    subscribeToLocation,
    getLocationSearch,
    getServerSnapshot,
  );
  const [filters, setFilters] = useState<T>(() => {
    const params = new URLSearchParams(initialSearch);
    const next = { ...defaults } as Record<string, unknown>;
    for (const key of Object.keys({ ...defaults })) {
      if (!params.has(key)) continue;
      const raw = params.get(key);
      const defaultValue = (defaults as Record<string, unknown>)[key];
      next[key] = typeof defaultValue === "number" ? Number(raw) : raw;
    }
    return next as T;
  });
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== "all" && v !== "") params.set(k, String(v));
    });
    window.history.replaceState(
      null,
      "",
      window.location.pathname + "?" + params,
    );
  }, [filters]);
  const [query, setQuery] = useState(filters);
  useEffect(() => {
    const timer = setTimeout(() => setQuery(filters), 350);
    return () => clearTimeout(timer);
  }, [filters]);
  return { filters, setFilters, query };
}
