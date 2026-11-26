"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import s from "./booth.module.css";

export interface ToastState {
  message: string;
  tone: "info" | "ok" | "error";
  action?: { label: string; run: () => void };
}

const TOAST_MS = 6000;

/** Toast + confirm dialog of the booth screen (no browser confirm()). */
export function useBoothFeedback() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [confirm, setConfirm] = useState<{ message: string; yes: string; run: () => void } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((t: ToastState) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(t);
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);
  const hide = useCallback(() => setToast(null), []);
  const ask = useCallback((message: string, run: () => void, yes = "ยืนยัน") => setConfirm({ message, yes, run }), []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const node = (
    <>
      {toast && (
        <div role="status" className={`${s.toast} ${toast.tone === "ok" ? s.toastOk : toast.tone === "error" ? s.toastErr : ""}`}>
          <span>{toast.tone === "ok" ? "✓ " : ""}{toast.message}</span>
          {toast.action && (
            <button type="button" onClick={() => { hide(); toast.action?.run(); }}>
              {toast.action.label}
            </button>
          )}
        </div>
      )}
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          yes={confirm.yes}
          onNo={() => setConfirm(null)}
          onYes={() => { const run = confirm.run; setConfirm(null); run(); }}
        />
      )}
    </>
  );
  return { show, hide, ask, node };
}

function ConfirmDialog({ message, yes, onNo, onYes }: { message: string; yes: string; onNo: () => void; onYes: () => void }) {
  const noRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    noRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onNo(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNo]);
  return (
    <div className={s.modal}>
      <div className={s.dialog} role="alertdialog" aria-modal="true" aria-labelledby="boothDlgMsg">
        <p id="boothDlgMsg">{message}</p>
        <div className={s.dialogActions}>
          <button ref={noRef} type="button" className={`${s.btn} ${s.btnAlt}`} onClick={onNo}>ไม่ใช่</button>
          <button type="button" className={`${s.btn} ${s.btnDanger}`} onClick={onYes}>{yes}</button>
        </div>
      </div>
    </div>
  );
}
