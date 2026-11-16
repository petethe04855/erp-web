"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDropZone } from "@/components/form/FileDropZone";
import { useMultiFileImport, type FileImportItem, type ImportSummary } from "../hooks/useMultiFileImport";
import type { DuplicateDetail } from "../types/shopee.types";

interface PreviewBase {
  total_rows: number;
  duplicate_count?: number;
  duplicate_details?: DuplicateDetail[];
}
interface ImportBase {
  inserted_count: number;
  skipped_count: number;
}

interface Props<P extends PreviewBase, R extends ImportBase> {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  subtitle: string;
  dropHint: string;
  accent: "orange" | "emerald";
  preview: (file: File) => Promise<P>;
  importFile: (file: File) => Promise<R>;
  /** One-line summary chips for a previewed file. */
  renderSummary: (p: P) => React.ReactNode;
  /** Expanded sample table for a previewed file. */
  renderSample: (p: P) => React.ReactNode;
}

const STATUS: Record<FileImportItem<unknown, unknown>["status"], { label: string; cls: string }> = {
  previewing: { label: "กำลังตรวจสอบ", cls: "border-zinc-300 text-zinc-600" },
  ready: { label: "พร้อมนำเข้า", cls: "border-emerald-500 text-emerald-700 bg-emerald-50" },
  duplicate: { label: "ข้อมูลซ้ำ - นำเข้าไม่ได้", cls: "border-rose-500 text-rose-700 bg-rose-50" },
  error: { label: "อ่านไฟล์ไม่สำเร็จ", cls: "border-red-500 text-red-700 bg-red-50" },
  importing: { label: "กำลังนำเข้า", cls: "border-blue-500 text-blue-700 bg-blue-50" },
  done: { label: "นำเข้าแล้ว", cls: "border-emerald-600 text-emerald-800 bg-emerald-100" },
  failed: { label: "นำเข้าไม่สำเร็จ", cls: "border-red-500 text-red-700 bg-red-50" },
};

function DuplicateList({ details }: { details?: DuplicateDetail[] }) {
  if (!details || details.length === 0) return null;
  return (
    <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-rose-200 bg-white p-2 divide-y divide-zinc-100 text-xs dark:border-rose-900 dark:bg-zinc-900/90 dark:divide-zinc-800">
      {details.map((dup, idx) => (
        <div key={idx} className="flex items-center justify-between gap-2 py-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{dup.identifier}</span>
            <span className="text-zinc-600 dark:text-zinc-400">{dup.message}</span>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] whitespace-nowrap ${
              dup.duplicate_type === "DB_EXISTING"
                ? "border-amber-500 text-amber-700 bg-amber-50"
                : "border-rose-500 text-rose-700 bg-rose-50"
            }`}
          >
            {dup.duplicate_type === "DB_EXISTING" ? "มีในระบบแล้ว" : "ซ้ำในไฟล์"}
          </Badge>
        </div>
      ))}
    </div>
  );
}

/**
 * Multi-file Shopee import dialog: drag-and-drop or pick several files, each is
 * checked for duplicates, and files with duplicate data are blocked.
 */
export function ShopeeMultiFileUpload<P extends PreviewBase, R extends ImportBase>(props: Props<P, R>) {
  const { isOpen, onClose, onSuccess, title, subtitle, dropHint, accent, renderSummary, renderSample } = props;
  const imp = useMultiFileImport<P, R>({ preview: props.preview, importFile: props.importFile });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  if (!isOpen) return null;

  const close = () => {
    if (imp.isImporting) return;
    imp.reset();
    setSummary(null);
    setExpanded(null);
    onClose();
  };

  const handleImport = async () => {
    setSummary(null);
    const s = await imp.importAll();
    setSummary(s);
    if (s.inserted > 0) onSuccess();
    if (s.failed.length === 0 && s.blocked.length === 0 && imp.duplicateCount === 0 && s.imported > 0) {
      setTimeout(close, 1500);
    }
  };

  const btnColor = accent === "orange" ? "bg-orange-600 hover:bg-orange-700" : "bg-emerald-600 hover:bg-emerald-700";
  const busy = imp.isImporting || imp.isPreviewing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b px-6 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          </div>
          <button
            onClick={close}
            aria-label="ปิด"
            className="cursor-pointer rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {imp.rejected.length > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <div className="font-semibold">ไม่ได้เพิ่มไฟล์ต่อไปนี้</div>
                <div className="text-xs">{imp.rejected.join(", ")}</div>
              </div>
            </div>
          )}

          {imp.duplicateCount > 0 && (
            <div role="alert" className="flex items-start gap-3 rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <div className="font-semibold">พบข้อมูลซ้ำ {imp.duplicateCount} ไฟล์ — ไฟล์เหล่านี้จะไม่ถูกนำเข้า</div>
                <div className="text-xs">
                  ข้อมูลในไฟล์มีอยู่ในระบบแล้ว หรือซ้ำกันในไฟล์ กดที่ชื่อไฟล์เพื่อดูรายการที่ซ้ำ แล้วแก้ไขไฟล์ก่อนอัปโหลดใหม่
                </div>
              </div>
            </div>
          )}

          {summary && (
            <div
              className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${
                summary.failed.length || summary.blocked.length
                  ? "border-amber-300 bg-amber-50 text-amber-900"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <div>
                  นำเข้าสำเร็จ {summary.imported} ไฟล์ ({summary.inserted.toLocaleString()} รายการ)
                </div>
                {summary.blocked.length > 0 && (
                  <div className="text-xs">ไม่นำเข้าเพราะพบข้อมูลซ้ำกับไฟล์ก่อนหน้า: {summary.blocked.join(", ")}</div>
                )}
                {summary.failed.length > 0 && (
                  <div className="text-xs">นำเข้าไม่สำเร็จ: {summary.failed.join(", ")}</div>
                )}
              </div>
            </div>
          )}

          <FileDropZone
            accept=".xlsx,.xls,.csv"
            multiple
            disabled={imp.isImporting}
            hint={dropHint}
            accent={accent}
            onFiles={(files) => {
              setSummary(null);
              imp.addFiles(files);
            }}
            onReject={(names) => imp.setRejected(names.map((n) => `${n} (รองรับเฉพาะ .xlsx, .xls, .csv)`))}
          />

          {imp.items.length > 0 && (
            <ul className="divide-y rounded-lg border dark:divide-zinc-800 dark:border-zinc-800">
              {imp.items.map((it) => {
                const st = STATUS[it.status];
                const open = expanded === it.id;
                const canExpand = !!it.preview;
                return (
                  <li key={it.id} className={it.status === "duplicate" ? "bg-rose-50/40" : ""}>
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <button
                        type="button"
                        disabled={!canExpand}
                        onClick={() => setExpanded(open ? null : it.id)}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-default"
                      >
                        {canExpand ? (
                          open ? <ChevronDown className="h-4 w-4 flex-shrink-0 text-zinc-400" /> : <ChevronRight className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                        ) : (
                          <FileText className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                        )}
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{it.file.name}</div>
                          <div className="flex flex-wrap items-center gap-x-3 text-xs text-zinc-500">
                            <span>{(it.file.size / 1024).toFixed(1)} KB</span>
                            {it.preview && renderSummary(it.preview)}
                            {it.preview && (it.preview.duplicate_count ?? 0) > 0 && (
                              <span className="font-semibold text-rose-600">ซ้ำ {it.preview.duplicate_count} รายการ</span>
                            )}
                            {it.result && <span className="text-emerald-700">เข้า {it.result.inserted_count} รายการ</span>}
                            {it.error && <span className="text-red-600">{it.error}</span>}
                          </div>
                        </div>
                      </button>
                      <Badge variant="outline" className={`whitespace-nowrap text-[10px] ${st.cls}`}>
                        {(it.status === "previewing" || it.status === "importing") && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                        {st.label}
                      </Badge>
                      {(it.status === "error" || it.status === "failed") && (
                        <button type="button" title="ลองใหม่" onClick={() => imp.retry(it.id)} className="rounded p-1 text-zinc-500 hover:bg-zinc-100">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      {it.status !== "importing" && it.status !== "done" && (
                        <button
                          type="button"
                          title="เอาไฟล์ออก"
                          disabled={imp.isImporting}
                          onClick={() => imp.removeFile(it.id)}
                          className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {open && it.preview && (
                      <div className="space-y-2 px-3 pb-3">
                        {it.status === "duplicate" && <DuplicateList details={it.preview.duplicate_details} />}
                        {renderSample(it.preview)}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4 dark:border-zinc-800">
          <div className="text-xs text-zinc-500">
            {imp.items.length > 0 && (
              <>
                {imp.items.length} ไฟล์ · พร้อมนำเข้า {imp.readyCount}
                {imp.duplicateCount > 0 && <span className="text-rose-600"> · ข้อมูลซ้ำ {imp.duplicateCount}</span>}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={close} disabled={imp.isImporting}>
              {summary ? "ปิด" : "ยกเลิก"}
            </Button>
            <Button
              onClick={handleImport}
              disabled={busy || imp.readyCount === 0}
              className={`cursor-pointer text-white ${btnColor}`}
            >
              {imp.isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              นำเข้า {imp.readyCount} ไฟล์
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
