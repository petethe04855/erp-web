'use client'
import React from 'react'
import { CategoryBadge, StockBadge } from '@/components/ui'
import { Button } from '@/components/ui/button'
import type { Product, BundleComponent } from '@/lib/store/erpWorkflow'

interface SkuViewModalProps {
  selected: Product
  bundleComponents: BundleComponent[]
  products: Product[]
  calcBundleVirtualStock: (sku: string) => number
  onClose: () => void
  onEdit: () => void
  onEditBom: () => void
}

export default function SkuViewModal({
  selected,
  bundleComponents,
  products,
  calcBundleVirtualStock,
  onClose,
  onEdit,
  onEditBom,
}: SkuViewModalProps) {
  const formatBaht = (n: number) => '฿' + n.toLocaleString('th-TH')
  const comps = bundleComponents.filter(c => c.bundleSku === selected.sku)
  const virtualQty = calcBundleVirtualStock(selected.sku)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-card rounded-xl p-7 w-full max-w-[480px] shadow-2xl border border-border"
        style={{ background: 'var(--erp-surface)', borderColor: 'var(--erp-border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-5">
          <div>
            <div className="font-mono text-sm font-bold text-[var(--erp-accent)]">{selected.sku}</div>
            <div className="text-lg font-bold text-foreground mt-0.5" style={{ color: 'var(--erp-ink)' }}>{selected.name}</div>
            <div className="mt-1.5 flex gap-1.5">
              <CategoryBadge type={selected.type} />
              <StockBadge stock={selected.stock} reorder={selected.reorder} isBundle={selected.isBundle} />
            </div>
          </div>
          <Button variant="ghost" size="xs" onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">Close</Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'บาร์โค้ด', value: selected.barcode || '—' },
            { label: 'น้ำหนัก', value: selected.weightGrams ? `${selected.weightGrams}g` : '—' },
            { label: 'ต้นทุน', value: formatBaht(selected.cost) },
            { label: 'Gross Margin B2C', value: `${(((selected.retailPrice - selected.cost) / selected.retailPrice) * 100).toFixed(1)}%` },
            { label: 'ราคา B2C', value: formatBaht(selected.retailPrice) },
            { label: 'ราคา B2B', value: formatBaht(selected.wholesalePrice) },
            { label: 'สต็อกปัจจุบัน', value: selected.isBundle ? 'Virtual' : selected.stock.toLocaleString() },
            { label: 'สต็อก Reserved', value: selected.reservedQty.toLocaleString() },
            { label: 'Reorder Point', value: selected.reorder || '—' },
            { label: 'สต็อกพร้อมขาย', value: selected.isBundle ? 'Virtual' : (selected.stock - selected.reservedQty).toLocaleString() },
          ].map(row => (
            <div key={row.label} className="rounded-lg p-2.5" style={{ background: 'var(--erp-subtle)' }}>
              <div className="text-[11px] text-muted-foreground mb-0.5" style={{ color: 'var(--erp-ink3)' }}>{row.label}</div>
              <div className="text-sm font-semibold text-foreground" style={{ color: 'var(--erp-ink)' }}>{row.value}</div>
            </div>
          ))}
        </div>

        {selected.note && (
          <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 rounded-lg text-xs text-amber-800 dark:text-amber-400">
            {selected.note}
          </div>
        )}

        {selected.isBundle && (
          <div className="mt-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 rounded-lg">
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">🧩 BOM — ส่วนประกอบ</div>
            {comps.length === 0
              ? <div className="text-xs text-muted-foreground">ยังไม่ได้กำหนด BOM — กด BOM เพื่อตั้งค่า</div>
              : <>
                {comps.map(c => {
                  const cp = products.find(p => p.sku === c.componentSku)
                  return (
                    <div key={c.componentSku} className="flex justify-between text-xs mb-1 text-muted-foreground">
                      <span>• {c.componentSku} ({cp?.name ?? '?'})</span>
                      <span className="font-semibold text-foreground">
                        × {c.qty} {c.unit ?? 'piece'} · ฿{(c.componentType === 'expense'
                          ? c.qty * (c.unitCostOverride ?? 0)
                          : c.qty * (cp?.cost ?? 0)).toLocaleString('th-TH', { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )
                })}
                <div className="mt-2 pt-2 border-t border-emerald-200/50 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  สต็อกพร้อมขาย: {virtualQty} ชุด
                </div>
              </>
            }
          </div>
        )}

        <div className="flex justify-end gap-2 mt-5">
          {selected.isBundle && (
            <Button onClick={onEditBom} variant="outline" size="sm" className="cursor-pointer border-border">
              BOM
            </Button>
          )}
          <Button onClick={onEdit} variant="outline" size="sm" className="cursor-pointer border-border" style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)', color: '#374151' }}>
            แก้ไข
          </Button>
        </div>
      </div>
    </div>
  )
}
