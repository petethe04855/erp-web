'use client'
import React from 'react'
import SlidePanel from '@/components/SlidePanel'
import { Btn, Mono } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import type { DesignTokens } from '@/lib/design/tokens'
import type { Product } from '@/lib/store/erpWorkflow'
import { readApiResponse } from '@/lib/apiResponse'
import { ValidationAlert } from '@/components/ValidationAlert'

const CHANNELS = ['Manual', 'LINE', 'Shopee', 'TikTok'] as const
export type Line = { sku: string; qty: number | ""; bomId?: number; bomUnitCost?: number; bomAvailableQty?: number }

type BOMOption = {
  id: number
  code: string
  name: string
  version?: number
  status: string
  fgSku?: string
  cost: number
  outputQty: number
  components?: Array<{
    componentSku: string
    qty: number
    unit: string
    scrapRate?: number
    yieldFactor?: number
    componentType?: string
  }>
  outputUnit?: string
}

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('chawy_token') : ''
  return { Authorization: token ? `Bearer ${token}` : '' }
}

function fmtBaht2(value: number) {
  return `฿${Number.isFinite(value) ? value.toFixed(2) : '0.00'}`
}

function availableFromBom(bom: BOMOption, products: Product[]) {
  const required = new Map<string, number>()
  for (const component of bom.components || []) {
    if (component.componentType === 'expense' || !component.componentSku) continue
    const product = products.find(item => item.sku === component.componentSku)
    if (!product) return 0
    let perFinishedUnit = component.qty / Math.max(bom.outputQty || 1, 1) / (component.yieldFactor || 1)
    if (component.scrapRate && component.scrapRate > 0) perFinishedUnit /= 1 - component.scrapRate / 100
    if (component.unit === 'g' && product.baseUnit === 'kg') perFinishedUnit /= 1000
    if (component.unit === 'kg' && product.baseUnit === 'g') perFinishedUnit *= 1000
    required.set(component.componentSku, (required.get(component.componentSku) || 0) + perFinishedUnit)
  }
  if (required.size === 0) return 0
  return Math.min(...Array.from(required, ([sku, qty]) => {
    const product = products.find(item => item.sku === sku)!
    return Math.floor(Math.max(0, product.stock - product.reservedQty) / qty)
  }))
}

interface SalesOrderFormPanelProps {
  t: DesignTokens
  open: boolean
  onClose: () => void
  form: { customer: string; date: string; channel: string; qtRef: string; lines: Line[] }
  setForm: React.Dispatch<React.SetStateAction<{ customer: string; date: string; channel: string; qtRef: string; lines: Line[] }>>
  products: Product[]
  lineTotal: number
  error: string
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
  error,
  onSubmit
}: SalesOrderFormPanelProps) {
  const c = t.color
  const [boms, setBoms] = React.useState<BOMOption[]>([])
  const sellableProducts = products.filter(p =>
    p.type === 'Finished Product' || p.type === 'Bundle' || p.type === 'Cat' || p.type === 'Dog'
  )
  const bomSkus = new Set(boms.map(bom => bom.fgSku).filter(Boolean))
  const directProducts = sellableProducts.filter(product => !bomSkus.has(product.sku))

  React.useEffect(() => {
    if (!open) return
    fetch(`${getApiUrl()}/api/boms`, { headers: getHeaders() })
      .then(response => readApiResponse<BOMOption[]>(response))
      .then(result => setBoms(result || []))
      .catch(() => setBoms([]))
  }, [open])

  const addLine = () => setForm(f => ({ ...f, lines: [...f.lines, { sku: '', qty: 1 }] }))
  const removeLine = (i: number) => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }))
  const updateLine = (i: number, field: keyof Line, val: string | number) => {
    setForm(f => ({ ...f, lines: f.lines.map((line, idx) => idx === i ? { ...line, [field]: val } : line) }))
  }
  const selectProduct = (i: number, value: string) => {
    const [sku, bomId] = value.split('::')
    const bom = boms.find(item => item.id === Number(bomId))
    const bomAvailableQty = bom ? availableFromBom(bom, products) : undefined
    setForm(f => ({
      ...f,
      lines: f.lines.map((line, idx) => idx === i
        ? {
            ...line,
            sku,
            bomId: bomId ? Number(bomId) : undefined,
            bomUnitCost: bom ? bom.cost / Math.max(bom.outputQty || 1, 1) : undefined,
            bomAvailableQty,
          }
        : line),
    }))
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
        <ValidationAlert message={error} />
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
          const selectedBom = boms.find(b => b.id === line.bomId)
          const unitPrice = Number(line.bomUnitCost ?? (product?.isBundle ? product.cost : (product?.retailPrice ?? product?.price ?? 0)))
          const qty = Number(line.qty)
          const lineAmount = Number.isFinite(unitPrice) && Number.isFinite(qty) ? unitPrice * qty : 0
          return (
            <div key={i} className="space-y-1">
              <div className="grid grid-cols-[1fr_80px_100px_28px] gap-2 items-center">
                <NativeSelect value={line.bomId ? `${line.sku}::${line.bomId}` : line.sku} onChange={e => selectProduct(i, e.target.value)} className="w-full cursor-pointer">
                  <option value="">-- เลือกสินค้า --</option>
                  {boms.filter(bom => bom.fgSku).map(bom => (
                    <option key={`bom-${bom.id}`} value={`${bom.fgSku}::${bom.id}`}>
                      {bom.name} ({bom.fgSku}) · ผลผลิตมาตรฐาน: {bom.outputQty} {bom.outputUnit || 'ชิ้น'} · {bom.code}
                    </option>
                  ))}
                  {directProducts.map(p => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </NativeSelect>
              <Input type="number" min={1} max={line.bomAvailableQty} value={line.qty} onChange={e => updateLine(i, 'qty', e.target.value === '' ? '' : parseInt(e.target.value) || 0)} className="text-center" />
                <Mono t={t} size={12} style={{ textAlign: 'right', display: 'block' }}>
                  {product || selectedBom
                    ? product?.isBundle
                      ? `${fmtBaht2(unitPrice)} / ชิ้น`
                      : fmtBaht2(lineAmount)
                    : '—'}
              </Mono>
              {line.bomAvailableQty !== undefined && (
                <div className="col-span-4 -mt-1 text-right text-[11px] text-muted-foreground">
                  BOM ผลิต/ขายได้สูงสุด {line.bomAvailableQty.toLocaleString()} ชิ้น
                </div>
              )}
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
              {selectedBom && (
                <div className="text-[11px] text-emerald-700 pl-1 font-medium">
                  🧩 สูตร {selectedBom.code}: ผลผลิตมาตรฐาน {selectedBom.outputQty} {selectedBom.outputUnit || 'ชิ้น'} · ต้นทุนต่อหน่วย {fmtBaht2(line.bomUnitCost || 0)}
                </div>
              )}
            </div>
          )
        })}
        <div className="p-3 bg-muted rounded-lg flex justify-between mt-2" style={{ background: 'var(--erp-subtle)' }}>
          <span className="text-sm text-muted-foreground" style={{ color: 'var(--erp-ink2)' }}>รวม</span>
          <Mono t={t} size={18} weight={600} style={{ color: 'var(--erp-ink)' }}>{fmtBaht2(lineTotal)}</Mono>
        </div>
      </div>
    </SlidePanel>
  )
}
