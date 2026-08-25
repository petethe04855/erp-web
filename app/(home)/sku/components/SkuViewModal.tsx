"use client";

import { StockBadge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/store/erpWorkflow";

interface SkuViewModalProps {
  selected: Product;
  bundleComponents?: Array<{ componentSku: string; qty: number; unit?: string; componentType?: string }>;
  componentProducts?: Product[];
  onClose: () => void;
  onEdit: () => void;
}

export default function SkuViewModal({ selected, bundleComponents = [], componentProducts = [], onClose, onEdit }: SkuViewModalProps) {
  const available = Math.max(0, selected.stock - selected.reservedQty);
  const isBundle = Boolean(selected.isBundle);
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
            <div className="mt-1.5 flex items-center gap-2">
              <StockBadge stock={selected.stock} reorder={0} isBundle={isBundle} />
              {isBundle && (
                <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:border-violet-900/30 dark:bg-violet-950/20 dark:text-violet-300">
                  แพ็กสินค้า
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="xs" onClick={onClose}>Close</Button>
        </div>

        {isBundle ? (
          <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4 dark:border-violet-900/30 dark:bg-violet-950/10">
            <div className="mt-3 rounded-lg border border-violet-200 bg-white/70 p-3 dark:border-violet-900/30 dark:bg-black/10">
              <div className="text-xs font-semibold text-violet-800 dark:text-violet-300">สินค้าในแพ็ก</div>
              {bundleComponents.length === 0 ? (
                <div className="mt-2 rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">ไม่พบข้อมูลสินค้าในแพ็ก</div>
              ) : (
                <div className="mt-2 space-y-2">
                  {bundleComponents.map((component, index) => {
                    const product = componentProducts.find((item) => item.sku === component.componentSku);
                    return (
                      <div key={`${component.componentSku}-${index}`} className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-xs">
                        <div>
                          <div className="font-mono font-semibold">{component.componentSku}</div>
                          <div className="text-muted-foreground">{product?.name ?? "ไม่พบข้อมูลสินค้า"}</div>
                        </div>
                        <div className="font-semibold">× {component.qty} {component.unit && component.unit !== "piece" ? component.unit : "ชิ้น"}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="text-sm font-bold text-violet-800 dark:text-violet-300">รายละเอียดแพ็กสินค้า</div>
            <div className="mt-1 text-xs text-violet-700/80 dark:text-violet-300/70">
              SKU นี้เป็นแพ็ก ไม่มี Stock จริงของตัวเอง สต็อกจะคำนวณจาก SKU ส่วนประกอบ
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {rows.filter((row) => row.label !== "สต็อกปัจจุบัน" && row.label !== "สต็อก Reserved").map((row) => (
                <div key={row.label} className="rounded-lg bg-white/70 p-2.5 dark:bg-black/10">
                  <div className="mb-0.5 text-[11px] text-muted-foreground">{row.label}</div>
                  <div className="text-sm font-semibold">{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-2 gap-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-lg p-2.5" style={{ background: "var(--erp-subtle)" }}>
              <div className="mb-0.5 text-[11px] text-muted-foreground">{row.label}</div>
              <div className="text-sm font-semibold">{row.value}</div>
            </div>
          ))}
        </div>
        )}

        {selected.note && <div className="mt-3 rounded-lg border p-2.5 text-xs">{selected.note}</div>}

        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onEdit} variant="outline" size="sm">แก้ไข</Button>
        </div>
      </div>
    </div>
  );
}
