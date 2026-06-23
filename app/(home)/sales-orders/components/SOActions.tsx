"use client";
import React, { useState, useEffect, useRef } from "react";
import type { SalesOrderStatus } from "@/lib/store/erpWorkflow";

const LIVE_CANCELLABLE = [
  "Pending",
  "Processing",
  "รอชำระจากไลฟ์",
  "ยืนยัน Cart แล้ว",
  "แพ็กแล้ว/รอส่ง",
] as const;

function smallActionStyle(bg: string, color = "#fff"): React.CSSProperties {
  return {
    padding: "5px 10px",
    fontSize: 11,
    border: "none",
    borderRadius: 5,
    background: bg,
    color,
    cursor: "pointer",
    fontWeight: 600,
    whiteSpace: "nowrap",
  };
}

interface SOActionsProps {
  status: SalesOrderStatus;
  hasInv: boolean;
  onStatus: (s: SalesOrderStatus) => void;
  onInvoice: () => void;
}

export default function SOActions({
  status,
  hasInv,
  onStatus,
  onInvoice,
}: SOActionsProps) {
  const [confirming, setConfirming] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const canCancel = (LIVE_CANCELLABLE as readonly string[]).includes(status);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  if (confirming) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={() => {
            onStatus("Cancelled");
            setConfirming(false);
          }}
          style={smallActionStyle("#B91C1C")}
        >
          Confirm
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={smallActionStyle("transparent", "var(--erp-ink3)")}
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        justifyContent: "flex-end",
      }}
    >
      {status === "Pending" && (
        <button
          onClick={() => onStatus("Processing")}
          style={smallActionStyle("var(--erp-info)")}
        >
          Start
        </button>
      )}
      {status === "Processing" && (
        <button
          onClick={() => onStatus("Completed")}
          style={smallActionStyle("var(--erp-pos)")}
        >
          Complete
        </button>
      )}
      {status === "Completed" && !hasInv && (
        <button
          onClick={onInvoice}
          style={smallActionStyle("var(--erp-accent)")}
        >
          Invoice
        </button>
      )}
      {status === "Completed" && hasInv && (
        <span
          style={{ fontSize: 11, color: "var(--erp-pos)", fontWeight: 600 }}
        >
          Invoiced
        </span>
      )}
      {canCancel && (
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              width: 26,
              height: 26,
              border: "1px solid var(--erp-border)",
              borderRadius: 5,
              background: "var(--erp-surface)",
              cursor: "pointer",
              color: "var(--erp-ink3)",
            }}
          >
            ...
          </button>
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 30,
                zIndex: 50,
                background: "var(--erp-surface)",
                border: "1px solid var(--erp-border)",
                borderRadius: 8,
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                minWidth: 132,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setConfirming(true);
                }}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "var(--erp-neg)",
                  fontWeight: 600,
                  textAlign: "left",
                }}
              >
                Cancel order
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
