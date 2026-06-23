"use client";
import React from "react";

interface DeleteConfirmModalProps {
  sku: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  sku,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--erp-surface)",
          borderRadius: 12,
          padding: 28,
          width: 360,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--erp-ink)",
            marginBottom: 8,
          }}
        >
          ยืนยันการลบ?
        </div>
        <div
          style={{ fontSize: 13, color: "var(--erp-ink3)", marginBottom: 20 }}
        >
          ลบ SKU <strong style={{ color: "#EF4444" }}>{sku}</strong> ออกจากระบบ?
          <br />
          การลบจะไม่ส่งผลย้อนหลังกับ Order ที่มีอยู่แล้ว
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid var(--erp-border)",
              background: "var(--erp-surface)",
              color: "#374151",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "#EF4444",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ลบ
          </button>
        </div>
      </div>
    </div>
  );
}
