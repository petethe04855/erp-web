"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBoothAuthStore } from "@/stores/boothAuthStore";
import { RejectedError, stockoutApi } from "../api/stockoutApi";
import {
  addVoid,
  EMPTY_QUEUE,
  enqueue,
  loadQueue,
  markFailed,
  newClientId,
  removeBatch,
  removeVoid,
  saveQueue,
  sendable,
  type QueueState,
} from "../lib/queue";
import { STOCKOUT_KEYS } from "../queries/stockoutQueries";

export type SyncStatus = "synced" | "syncing" | "offline";

const RETRY_MS = 5000;

/**
 * Saves every batch on the device first and sends it when it can. Resending
 * uses the same clientId, so a batch that did reach the server before the
 * connection dropped is never taken out twice.
 */
export function useStockOutSync() {
  const client = useQueryClient();
  const userId = useBoothAuthStore((s) => s.user?.id ?? null);
  const [queue, setQueue] = useState<QueueState>(EMPTY_QUEUE);
  const [status, setStatus] = useState<SyncStatus>("synced");
  const [storageOk, setStorageOk] = useState(true);
  const qRef = useRef<QueueState>(EMPTY_QUEUE);
  const flushing = useRef(false);
  const sending = useRef<string | null>(null);
  const undoAfterSend = useRef<Set<string>>(new Set());
  const sent = useRef<Map<string, number>>(new Map());

  const commit = useCallback((next: QueueState) => {
    qRef.current = next;
    setQueue(next);
    setStorageOk(saveQueue(next));
  }, []);

  // The queue lives in localStorage, which only exists after hydration.
  useEffect(() => {
    const q = loadQueue();
    qRef.current = q;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading an external store once on mount
    setQueue(q);
  }, []);

  const refresh = useCallback(() => {
    client.invalidateQueries({ queryKey: STOCKOUT_KEYS.all });
    client.invalidateQueries({ queryKey: ["inventory"] });
  }, [client]);

  const voidOnServer = useCallback(
    async (id: number) => {
      try {
        await stockoutApi.void(id);
        commit(removeVoid(qRef.current, id));
        return true;
      } catch (e) {
        if (e instanceof RejectedError) {
          commit(removeVoid(qRef.current, id));
          throw e;
        }
        commit(addVoid(qRef.current, id));
        return false;
      }
    },
    [commit],
  );

  const flush = useCallback(async () => {
    if (flushing.current) return;
    flushing.current = true;
    let offline = false;
    let changed = false;
    try {
      if (qRef.current.batches.length || qRef.current.voids.length) setStatus("syncing");
      for (const b of sendable(qRef.current)) {
        sending.current = b.clientId;
        try {
          const batch = await stockoutApi.create({ clientId: b.clientId, createdAt: b.createdAt, lines: b.lines });
          sent.current.set(b.clientId, batch.id);
          commit(removeBatch(qRef.current, b.clientId));
          changed = true;
          if (undoAfterSend.current.delete(b.clientId)) await voidOnServer(batch.id).catch(() => undefined);
        } catch (e) {
          if (e instanceof RejectedError) {
            commit(markFailed(qRef.current, b.clientId, e.message));
            continue;
          }
          offline = true;
          break;
        } finally {
          sending.current = null;
        }
      }
      if (!offline) {
        for (const id of [...qRef.current.voids]) {
          const ok = await voidOnServer(id).catch(() => true);
          if (!ok) {
            offline = true;
            break;
          }
          changed = true;
        }
      }
    } finally {
      flushing.current = false;
      setStatus(offline ? "offline" : "synced");
      if (changed) refresh();
    }
  }, [commit, refresh, voidOnServer]);

  useEffect(() => {
    const t = setInterval(() => {
      if (qRef.current.batches.some((b) => !b.error) || qRef.current.voids.length) flush();
    }, RETRY_MS);
    const online = () => flush();
    window.addEventListener("online", online);
    flush();
    return () => {
      clearInterval(t);
      window.removeEventListener("online", online);
    };
  }, [flush]);

  /** Saves a round on the device and starts sending it; returns its clientId. */
  const save = useCallback(
    (lines: { skuId: number; qty: number }[]) => {
      const clientId = newClientId();
      commit(enqueue(qRef.current, { clientId, createdAt: new Date().toISOString(), userId, lines }));
      flush();
      return clientId;
    },
    [commit, flush, userId],
  );

  /** Undo of the round just saved: drop it if unsent, void it on the server if sent. */
  const undo = useCallback(
    async (clientId: string) => {
      if (sending.current === clientId) {
        undoAfterSend.current.add(clientId);
        return;
      }
      if (qRef.current.batches.some((b) => b.clientId === clientId)) {
        commit(removeBatch(qRef.current, clientId));
        return;
      }
      const id = sent.current.get(clientId);
      if (id) {
        await voidOnServer(id);
        refresh();
      }
    },
    [commit, refresh, voidOnServer],
  );

  const discard = useCallback((clientId: string) => commit(removeBatch(qRef.current, clientId)), [commit]);

  return {
    queue,
    status,
    storageOk,
    unsent: queue.batches.filter((b) => !b.error).length,
    failed: queue.batches.filter((b) => b.error),
    save,
    undo,
    discard,
    flush,
  };
}
