"use client";

import React, { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";

interface FileDropZoneProps {
  /** Comma-separated extensions, e.g. ".xlsx,.xls,.csv". */
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  title?: string;
  hint?: string;
  onFiles: (files: File[]) => void;
  /** Called with names of files whose extension is not in `accept`. */
  onReject?: (names: string[]) => void;
  /** Tailwind color accent for the hover / drag state. */
  accent?: "orange" | "emerald";
}

function matchesAccept(file: File, accept: string): boolean {
  const exts = accept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (exts.length === 0) return true;
  const name = file.name.toLowerCase();
  return exts.some((ext) => name.endsWith(ext));
}

const ACCENTS = {
  orange: { icon: "text-orange-500", active: "border-orange-500 bg-orange-50/60", hover: "hover:border-orange-500 hover:bg-orange-50/50" },
  emerald: { icon: "text-emerald-500", active: "border-emerald-500 bg-emerald-50/60", hover: "hover:border-emerald-500 hover:bg-emerald-50/50" },
};

/**
 * Click-or-drop file picker. Supports dropping several files at once and
 * filters by extension. While mounted it also stops the browser from opening
 * a file that is dropped outside the zone.
 */
export function FileDropZone({
  accept,
  multiple = false,
  disabled = false,
  title = "คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่",
  hint,
  onFiles,
  onReject,
  accent = "orange",
}: FileDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  const colors = ACCENTS[accent];

  // A drop that misses the zone must not navigate the page to the file.
  useEffect(() => {
    const block = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
    };
    window.addEventListener("dragover", block);
    window.addEventListener("drop", block);
    return () => {
      window.removeEventListener("dragover", block);
      window.removeEventListener("drop", block);
    };
  }, []);

  const handle = (list: FileList | null | undefined) => {
    if (!list || list.length === 0 || disabled) return;
    let files = Array.from(list);
    if (!multiple) files = files.slice(0, 1);
    const ok = files.filter((f) => matchesAccept(f, accept));
    const bad = files.filter((f) => !matchesAccept(f, accept)).map((f) => f.name);
    if (bad.length > 0) onReject?.(bad);
    if (ok.length > 0) onFiles(ok);
  };

  return (
    <label
      data-testid="file-drop-zone"
      onDragEnter={(e) => {
        e.preventDefault();
        depth.current += 1;
        if (!disabled) setDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = disabled ? "none" : "copy";
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        depth.current = 0;
        setDragging(false);
        handle(e.dataTransfer.files);
      }}
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors dark:border-zinc-700 ${
        disabled ? "cursor-not-allowed opacity-60 border-zinc-200" : `cursor-pointer ${colors.hover}`
      } ${dragging ? colors.active : "border-zinc-300"}`}
    >
      <Upload className={`mb-2 h-8 w-8 ${colors.icon}`} />
      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {dragging ? "วางไฟล์ได้เลย" : title}
      </span>
      {hint && <span className="mt-1 text-xs text-zinc-500">{hint}</span>}
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
        onChange={(e) => {
          handle(e.target.files);
          // Allow picking the same file again after removing it.
          e.target.value = "";
        }}
      />
    </label>
  );
}
