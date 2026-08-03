"use client";

import { StockBadge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/store/erpWorkflow";

interface SkuViewModalProps {
  selected: Product;
  onClose: () => void;
  onEdit: () => void;
}

export default function SkuViewModal({ selected, onClose, onEdit }: SkuViewModalProps) {
  const available = Math.max(0, selected.stock - selected.reservedQty);
  const rows = [
    { label: "Barcode", value: selected.barcode || "—" },
    { label: "ราคาขาย", value: `฿${selected.retailPrice.toLocaleString("th-TH")}` },
    { label: "สต็อกปัจจุบัน", value: selected.stock.toLocaleString("th-TH") },
    { label: "สต็อก Reserved", value: selected.reservedQty.toLocaleString("th-TH") },
    { label: "สต็อกพร้อมขาย", value: available.toLocaleString("th-TH") },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-[480px] rounded-xl border border-border bg-card p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="font-mono text-sm font-bold text-[var(--erp-accent)]">{selected.sku}</div>
            <div className="mt-0.5 text-lg font-bold">{selected.name}</div>
            <div className="mt-1.5"><StockBadge stock={selected.stock} reorder={0} isBundle={false} /></div>
          </div>
          <Button variant="ghost" size="xs" onClick={onClose}>Close</Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-lg p-2.5" style={{ background: "var(--erp-subtle)" }}>
              <div className="mb-0.5 text-[11px] text-muted-foreground">{row.label}</div>
              <div className="text-sm font-semibold">{row.value}</div>
            </div>
          ))}
        </div>

        {selected.note && <div className="mt-3 rounded-lg border p-2.5 text-xs">{selected.note}</div>}

        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onEdit} variant="outline" size="sm">แก้ไข</Button>
        </div>
      </div>
    </div>
  );
}
