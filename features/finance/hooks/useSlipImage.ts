"use client";

import { useEffect, useState } from "react";
import { financeApi } from "../api/financeApi";
import { getImageUrl } from "@/lib/utils";

const SLIP_PATH = /\/uploads\/(expenses|incomes)\/([^/?#]+)/i;

/**
 * Maps a stored slip URL (e.g. "/uploads/expenses/a.jpg", possibly absolute)
 * to the authenticated API path, or null if it is not a protected slip.
 */
export function toSlipApiPath(slipUrl?: string | null): string | null {
  if (!slipUrl) return null;
  const m = slipUrl.match(SLIP_PATH);
  if (!m) return null;
  return `/finance/slips/${m[1].toLowerCase()}/${encodeURIComponent(safeDecode(m[2]))}`;
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/**
 * Resolves a slip URL to something an <img> can show. Protected slips are
 * fetched with the login token and exposed as a blob: URL (revoked on change
 * or unmount); anything else (blob:, data:, external links) passes through.
 */
export function useSlipImage(slipUrl?: string | null) {
  const apiPath = toSlipApiPath(slipUrl);
  // Result is tagged with the path it belongs to, so a stale result for a
  // previous path is never shown and no state reset is needed in the effect.
  const [loaded, setLoaded] = useState<{ path: string; src: string; error: boolean } | null>(null);

  useEffect(() => {
    if (!apiPath) return;
    let cancelled = false;
    let objectUrl = "";
    financeApi
      .getSlipObjectUrl(apiPath)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setLoaded({ path: apiPath, src: url, error: false });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ path: apiPath, src: "", error: true });
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [apiPath]);

  if (!apiPath) {
    return { src: slipUrl ? getImageUrl(slipUrl) : "", isLoading: false, error: false };
  }
  if (!loaded || loaded.path !== apiPath) {
    return { src: "", isLoading: true, error: false };
  }
  return { src: loaded.src, isLoading: false, error: loaded.error };
}
