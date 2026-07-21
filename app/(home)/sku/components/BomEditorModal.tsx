'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import { Input } from '@/components/ui/input'
import type { Product } from '@/lib/store/erpWorkflow'

interface BomEditorModalProps {
  bomSku: string
  bomProduct: Product
  products: Product[]
  bomRows: BomRow[]
  setBomRows: React.Dispatch<React.SetStateAction<BomRow[]>>
  onClose: () => void
  onSave: () => void
}
export type BomRow = { componentSku: string; qty: number; unit: 'piece' | 'g' | 'kg' | 'baht'; componentType: 'material' | 'packaging' | 'expense'; unitCostOverride: number; yieldFactor: number }

export default function BomEditorModal({
  bomSku,
  bomProduct,
  products,
  bomRows,
  setBomRows,
  onClose,
  onSave
}: BomEditorModalProps) {
  const addBomRow = () => setBomRows(rows => [...rows, { componentSku: '', qty: 1, unit: 'piece', componentType: 'material', unitCostOverride: 0, yieldFactor: 1 }])
  const removeBomRow = (idx: number) => setBomRows(rows => rows.filter((_, i) => i !== idx))
  const updateBomRow = (idx: number, field: keyof BomRow, val: string | number) => {
    setBomRows(rows => rows.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  }

  const validRows = bomRows.filter(r => (r.componentType === 'expense' || r.componentSku) && r.qty > 0)
  const bomCost = validRows.reduce((sum, row) => {
    if (row.componentType === 'expense') return sum + row.qty * row.unitCostOverride
    const product = products.find(p => p.sku === row.componentSku)
    if (!product) return sum
    let factor = 1
    if (row.unit === 'g' && product.baseUnit === 'kg') factor = 0.001
    if (row.unit === 'kg' && product.baseUnit === 'g') factor = 1000
    return sum + (row.qty / (row.yieldFactor || 1)) * factor * product.cost
  }, 0)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-card rounded-xl p-7 w-full max-w-[820px] max-h-[90vh] overflow-y-auto shadow-2xl border border-border"
        style={{ background: 'var(--erp-surface)', borderColor: 'var(--erp-border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-base font-bold text-foreground m-0" style={{ color: 'var(--erp-ink)' }}>🧩 BOM — {bomProduct.name}</h2>
            <p className="text-xs text-muted-foreground mt-1" style={{ color: 'var(--erp-ink3)' }}>กำหนดส่วนประกอบสำหรับสินค้าเซ็ต</p>
          </div>
          <Button variant="ghost" size="xs" onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">Close</Button>
        </div>

        {validRows.length > 0 && (
          <div className="mb-4 p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 rounded-lg">
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">Virtual Stock Preview (ก่อนบันทึก)</div>
            <div className="flex gap-4 flex-wrap">
              {validRows.filter(r => r.componentType !== 'expense').map(r => {
                const cp = products.find(p => p.sku === r.componentSku)
                if (!cp) return null
                const avail = Math.max(0, cp.stock - cp.reservedQty)
                let required = r.qty / (r.yieldFactor || 1)
                if (r.unit === 'g' && cp.baseUnit === 'kg') required /= 1000
                if (r.unit === 'kg' && cp.baseUnit === 'g') required *= 1000
                const canMake = Math.floor(avail / required)
                return (
                  <div key={r.componentSku} className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{r.componentSku}</span>: {avail} ÷ {r.qty} = <span className={`font-bold ${canMake > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{canMake} เซ็ต</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-1.5 text-sm font-bold text-blue-600 dark:text-blue-400">
              สต็อกเซ็ตที่ขายได้ = {Math.min(...validRows.filter(r => r.componentType !== 'expense').map(r => {
                const cp = products.find(p => p.sku === r.componentSku)
                if (!cp) return 0
                let required = r.qty / (r.yieldFactor || 1)
                if (r.unit === 'g' && cp.baseUnit === 'kg') required /= 1000
                if (r.unit === 'kg' && cp.baseUnit === 'g') required *= 1000
                return Math.floor(Math.max(0, cp.stock - cp.reservedQty) / required)
              }))} ชุด
            </div>
          </div>
        )}

        <div className="mb-3">
          <div className="p-2.5 mb-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 rounded-lg text-sm font-bold text-emerald-700 dark:text-emerald-400">
            ต้นทุน BOM ต่อหน่วย: ฿{bomCost.toLocaleString('th-TH', { maximumFractionDigits: 2 })}
          </div>
          <div className="grid grid-cols-[105px_1fr_70px_75px_75px_90px_36px] gap-2 mb-1.5 px-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <div>ประเภท</div>
            <div>SKU ส่วนประกอบ</div>
            <div className="text-center">จำนวน</div>
            <div>หน่วย</div>
            <div>Yield</div>
            <div>ต้นทุน/หน่วย</div>
            <div />
          </div>
          {bomRows.map((row, idx) => (
            <div key={idx} className="grid grid-cols-[105px_1fr_70px_75px_75px_90px_36px] gap-2 mb-1.5 items-center">
              <NativeSelect value={row.componentType} onChange={e => updateBomRow(idx, 'componentType', e.target.value)} className="h-9 cursor-pointer">
                <option value="material">วัตถุดิบ</option>
                <option value="packaging">บรรจุภัณฑ์</option>
                <option value="expense">ค่าใช้จ่าย</option>
              </NativeSelect>
              <NativeSelect
                disabled={row.componentType === 'expense'}
                value={row.componentSku}
                onChange={e => updateBomRow(idx, 'componentSku', e.target.value)}
                className="h-9 cursor-pointer"
              >
                <option value="">— เลือก SKU —</option>
                {products.filter(p => !p.isBundle && p.sku !== bomSku).map(p => (
                  <option key={p.sku} value={p.sku}>{p.sku} — {p.name}</option>
                ))}
              </NativeSelect>
              <Input 
                type="number" 
                min={1} 
                value={row.qty}
                onChange={e => updateBomRow(idx, 'qty', +e.target.value)}
                className="h-9 text-center"
              />
              <NativeSelect value={row.unit} onChange={e => updateBomRow(idx, 'unit', e.target.value)} className="h-9 cursor-pointer">
                {row.componentType === 'expense' 
                  ? <option value="baht">บาท</option> 
                  : <><option value="piece">ชิ้น</option><option value="g">กรัม</option><option value="kg">กก.</option></>
                }
              </NativeSelect>
              <Input
                type="number"
                min={0.01}
                max={1}
                step={0.01}
                disabled={row.componentType === 'expense'}
                value={row.componentType === 'expense' ? 1 : row.yieldFactor}
                onChange={e => updateBomRow(idx, 'yieldFactor', +e.target.value)}
                className="h-9 text-center"
                aria-label="Yield rate"
              />
              <Input 
                type="number" 
                min={0} 
                disabled={row.componentType !== 'expense'} 
                value={row.unitCostOverride} 
                onChange={e => updateBomRow(idx, 'unitCostOverride', +e.target.value)} 
                className="h-9"
              />
              <Button 
                onClick={() => removeBomRow(idx)} 
                variant="destructive" 
                size="xs" 
                className="h-9 cursor-pointer font-bold border border-rose-200 bg-[#FFF5F5] hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400"
              >
                ×
              </Button>
            </div>
          ))}
        </div>

        <Button 
          onClick={addBomRow} 
          variant="outline" 
          size="xs"
          className="border-dashed w-auto px-4 py-2 cursor-pointer text-muted-foreground"
          style={{ borderColor: '#D1D5DB' }}
        >
          + เพิ่มส่วนประกอบ
        </Button>

        <div className="flex justify-end gap-2 mt-5">
          <Button onClick={onClose} variant="outline" size="sm" className="cursor-pointer border-border" style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)', color: '#374151' }}>
            ยกเลิก
          </Button>
          <Button onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer border-none shadow-none">
            บันทึก BOM
          </Button>
        </div>
      </div>
    </div>
  )
}
