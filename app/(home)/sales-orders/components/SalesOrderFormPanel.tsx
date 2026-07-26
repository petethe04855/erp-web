'use client'
import React from 'react'
import SlidePanel from '@/components/SlidePanel'
import { Btn, Mono, fmtBaht } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import type { DesignTokens } from '@/lib/design/tokens'
import type { Product } from '@/lib/store/erpWorkflow'

const CHANNELS = ['Manual', 'LINE', 'Shopee', 'TikTok'] as const
export type Line = { sku: string; qty: number | "" }

interface SalesOrderFormPanelProps {
  t: DesignTokens
  open: boolean
  onClose: () => void
  form: { customer: string; date: string; channel: string; qtRef: string; lines: Line[] }
  setForm: React.Dispatch<React.SetStateAction<{ customer: string; date: string; channel: string; qtRef: string; lines: Line[] }>>
  products: Product[]
  lineTotal: number
  onSubmit: () => void
}

export default function SalesOrderFormPanel({
  t,
  open,
  onClose,
  form,
  setForm,
  products,
  lineTotal,
  onSubmit
}: SalesOrderFormPanelProps) {
  const c = t.color
  const sellableProducts = products.filter(p =>
    p.type === 'Finished Product' || p.type === 'Bundle' || p.type === 'Cat' || p.type === 'Dog'
  )

  const addLine = () => setForm(f => ({ ...f, lines: [...f.lines, { sku: '', qty: 1 }] }))
  const removeLine = (i: number) => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }))
  const updateLine = (i: number, field: keyof Line, val: string | number) => {
    setForm(f => ({ ...f, lines: f.lines.map((line, idx) => idx === i ? { ...line, [field]: val } : line) }))
  }

  return (
    <SlidePanel open={open} onClose={onClose} title="สร้าง Sales Order" subtitle="กรอกข้อมูลออร์เดอร์ขายใหม่"
      footer={
        <div className="flex gap-2.5 justify-end">
          <Button variant="outline" onClick={onClose} className="cursor-pointer border-border" style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)', color: '#374151' }}>ยกเลิก</Button>
          <Button onClick={onSubmit} className="bg-[var(--erp-accent)] text-white hover:opacity-90 cursor-pointer shadow-none border-none">บันทึก SO</Button>
        </div>
      }
    >
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              ลูกค้า *
            </Label>
            <Input value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              วันที่
            </Label>
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              ช่องทาง
            </Label>
            <NativeSelect value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))} className="w-full cursor-pointer">
              {CHANNELS.map(ch => <option key={ch}>{ch}</option>)}
            </NativeSelect>
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              QT อ้างอิง
            </Label>
            <Input value={form.qtRef} onChange={e => setForm(f => ({ ...f, qtRef: e.target.value }))} />
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-semibold text-foreground" style={{ color: 'var(--erp-ink)' }}>รายการสินค้า</span>
          <Button variant="ghost" size="sm" onClick={addLine} className="cursor-pointer text-muted-foreground">+ เพิ่มสินค้า</Button>
        </div>
        {form.lines.map((line, i) => {
          const product = sellableProducts.find(p => p.sku === line.sku)
          return (
            <div key={i} className="grid grid-cols-[1fr_80px_100px_28px] gap-2 items-center">
              <NativeSelect value={line.sku} onChange={e => updateLine(i, 'sku', e.target.value)} className="w-full cursor-pointer">
                <option value="">-- เลือกสินค้า --</option>
                {sellableProducts.map(p => <option key={p.sku} value={p.sku}>{p.name}</option>)}
              </NativeSelect>
              <Input type="number" min={1} value={line.qty} onChange={e => updateLine(i, 'qty', e.target.value === '' ? '' : parseInt(e.target.value) || 0)} className="text-center" />
              <Mono t={t} size={12} style={{ textAlign: 'right', display: 'block' }}>{product ? fmtBaht(product.price * Number(line.qty)) : '—'}</Mono>
              {form.lines.length > 1 && (
                <Button 
                  onClick={() => removeLine(i)} 
                  variant="ghost" 
                  size="xs" 
                  className="text-rose-600 hover:text-rose-800 cursor-pointer font-bold text-lg border-none"
                  style={{ color: 'var(--erp-neg)' }}
                >
                  ×
                </Button>
              )}
            </div>
          )
        })}
        <div className="p-3 bg-muted rounded-lg flex justify-between mt-2" style={{ background: 'var(--erp-subtle)' }}>
          <span className="text-sm text-muted-foreground" style={{ color: 'var(--erp-ink2)' }}>รวม</span>
          <Mono t={t} size={18} weight={600} style={{ color: 'var(--erp-ink)' }}>{fmtBaht(lineTotal)}</Mono>
        </div>
      </div>
    </SlidePanel>
  )
}
