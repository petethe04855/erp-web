"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/axios";
import { STOCKOUT_KEYS } from "../queries/stockoutQueries";

const RECONNECT_MS = 5000;

/** Splits an SSE text buffer into complete events; returns the rest. */
export function parseSSE(buffer: string): { events: { event: string; data: string }[]; rest: string } {
  const events: { event: string; data: string }[] = [];
  const parts = buffer.replace(/\r\n/g, "\n").split("\n\n");
  const rest = parts.pop() ?? "";
  for (const block of parts) {
    let event = "message";
    const data: string[] = [];
    for (const line of block.split("\n")) {
      if (line.startsWith(":")) continue;
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) data.push(line.slice(5).trim());
    }
    if (data.length) events.push({ event, data: data.join("\n") });
  }
  return { events, rest };
}

/**
 * Listens to GET /stock/stream (Server-Sent Events) and reloads the count
 * numbers the moment another device saves, voids or reviews a batch. It uses
 * fetch rather than EventSource so the token stays in the Authorization
 * header. Returns whether the stream is connected; screens keep polling as a
 * fallback either way.
 */
export function useStockOutStream(enabled = true) {
  const client = useQueryClient();
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || typeof fetch === "undefined") return;
    let stopped = false;
    let ctrl: AbortController | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const connect = async () => {
      if (stopped) return;
      ctrl = new AbortController();
      try {
        const token = localStorage.getItem("chawy_v2_token");
        const res = await fetch(`${API_BASE_URL}/stock/stream`, {
          headers: { Accept: "text/event-stream", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          signal: ctrl.signal,
          cache: "no-store",
        });
        if (!res.ok || !res.body) throw new Error(`stream HTTP ${res.status}`);
        setLive(true);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parsed = parseSSE(buffer);
          buffer = parsed.rest;
          if (parsed.events.some((e) => e.event === "change")) {
            client.invalidateQueries({ queryKey: STOCKOUT_KEYS.all });
          }
        }
      } catch {
        // offline, server restarted, or stream not available: fall back to polling
      } finally {
        setLive(false);
        if (!stopped) timer = setTimeout(connect, RECONNECT_MS);
      }
    };
    connect();
    return () => {
      stopped = true;
      ctrl?.abort();
      if (timer) clearTimeout(timer);
    };
  }, [client, enabled]);

  return live;
}
