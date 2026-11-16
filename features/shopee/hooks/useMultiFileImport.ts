"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type FileImportStatus =
  | "previewing"
  | "ready"
  | "duplicate"
  | "error"
  | "importing"
  | "done"
  | "failed";

export interface FileImportItem<P, R> {
  id: string;
  file: File;
  status: FileImportStatus;
  preview?: P;
  result?: R;
  error?: string;
}

interface PreviewLike {
  duplicate_count?: number;
}

interface ImportLike {
  inserted_count: number;
  skipped_count: number;
}

export interface ImportSummary {
  imported: number;
  inserted: number;
  skipped: number;
  /** Files blocked at import time because a re-check found duplicates. */
  blocked: string[];
  failed: string[];
}

const dupCount = (p?: PreviewLike) => p?.duplicate_count ?? 0;

/**
 * Manages a list of upload files: each is previewed on add, files whose
 * preview reports duplicates are blocked from import, and import runs one
 * file at a time. Each file is re-previewed right before its import, so data
 * already brought in by an earlier file in the same batch is also caught as
 * a duplicate and blocked.
 */
export function useMultiFileImport<P extends PreviewLike, R extends ImportLike>(opts: {
  preview: (file: File) => Promise<P>;
  importFile: (file: File) => Promise<R>;
}) {
  const [items, setItems] = useState<FileImportItem<P, R>[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);
  const seq = useRef(0);
  const optsRef = useRef(opts);
  const itemsRef = useRef<FileImportItem<P, R>[]>([]);
  useEffect(() => {
    optsRef.current = opts;
  });
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const patch = useCallback((id: string, p: Partial<FileImportItem<P, R>>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...p } : it)));
  }, []);

  const runPreview = useCallback(
    async (id: string, file: File) => {
      patch(id, { status: "previewing", error: undefined });
      try {
        const preview = await optsRef.current.preview(file);
        patch(id, { preview, status: dupCount(preview) > 0 ? "duplicate" : "ready" });
      } catch (err) {
        patch(id, { status: "error", error: err instanceof Error ? err.message : "อ่านไฟล์ไม่สำเร็จ" });
      }
    },
    [patch],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      const sameFile: string[] = [];
      const added: FileImportItem<P, R>[] = [];
      const known = [...itemsRef.current];
      for (const file of files) {
        const exists = known.some((it) => it.file.name === file.name && it.file.size === file.size);
        if (exists) {
          sameFile.push(file.name);
          continue;
        }
        const item: FileImportItem<P, R> = { id: `f${++seq.current}`, file, status: "previewing" };
        known.push(item);
        added.push(item);
      }
      itemsRef.current = known;
      setItems((prev) => [...prev, ...added]);
      setRejected(sameFile.map((n) => `${n} (เลือกไฟล์นี้ไว้แล้ว)`));
      // Preview one after another to keep load on the API predictable.
      void (async () => {
        for (const a of added) await runPreview(a.id, a.file);
      })();
    },
    [runPreview],
  );

  const removeFile = useCallback((id: string) => {
    itemsRef.current = itemsRef.current.filter((it) => it.id !== id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const retry = useCallback(
    (id: string) => {
      const it = items.find((x) => x.id === id);
      if (it) void runPreview(id, it.file);
    },
    [items, runPreview],
  );

  const importAll = useCallback(async (): Promise<ImportSummary> => {
    const summary: ImportSummary = { imported: 0, inserted: 0, skipped: 0, blocked: [], failed: [] };
    const queue = items.filter((it) => it.status === "ready");
    setIsImporting(true);
    try {
      for (const it of queue) {
        patch(it.id, { status: "importing", error: undefined });
        try {
          // Re-check: an earlier file in this batch may have imported the same rows.
          const fresh = await optsRef.current.preview(it.file);
          if (dupCount(fresh) > 0) {
            patch(it.id, { preview: fresh, status: "duplicate" });
            summary.blocked.push(it.file.name);
            continue;
          }
          const result = await optsRef.current.importFile(it.file);
          patch(it.id, { result, status: "done" });
          summary.imported += 1;
          summary.inserted += result.inserted_count;
          summary.skipped += result.skipped_count;
        } catch (err) {
          patch(it.id, { status: "failed", error: err instanceof Error ? err.message : "นำเข้าไม่สำเร็จ" });
          summary.failed.push(it.file.name);
        }
      }
    } finally {
      setIsImporting(false);
    }
    return summary;
  }, [items, patch]);

  const reset = useCallback(() => {
    itemsRef.current = [];
    setItems([]);
    setRejected([]);
  }, []);

  return {
    items,
    isImporting,
    isPreviewing: items.some((it) => it.status === "previewing"),
    readyCount: items.filter((it) => it.status === "ready").length,
    duplicateCount: items.filter((it) => it.status === "duplicate").length,
    rejected,
    setRejected,
    addFiles,
    removeFile,
    retry,
    importAll,
    reset,
  };
}
