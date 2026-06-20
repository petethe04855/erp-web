'use client'
import { useMemo, useState } from 'react'
import { formatBaht } from '@/lib/mockData'
import SlidePanel from '@/components/SlidePanel'
import { useErpStore } from '@/lib/store/useErpStore'
import type { PurchaseOrderStatus } from '@/lib/store/erpWorkflow'
import { useTheme } from '@/lib/design/ThemeContext'
import { Btn, Field, Mono, PremiumTable, PremiumTd, PremiumTh, SelectField, StatStrip, StatusPill, TopBar } from '@/components/ui'

type ItemLine = { sku: string; name: string; qty: number; unitCost: number }
const BLANK_LINE: ItemLine = { sku: '', name: '', qty: 1, unitCost: 0 }
const BLANK = { supplier: '', etaDate: '', items: [{ ...BLANK_LINE }] }
const statusMap: Record<PurchaseOrderStatus, string> = {
  Draft: 'draft',
  Sent: 'sent',
  'Partial Received': 'pending',
  Completed: 'completed',
}

export default function PurchaseOrderPage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const list = useErpStore(s => s.purchaseOrders)
  const products = useErpStore(s => s.products)
  const createPO = useErpStore(s => s.createPurchaseOrder)
  const updatePOStatus = useErpStore(s => s.updatePOStatus)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [toast, setToast] = useState('')

  const rows = useMemo(() => list.map(po => ({
    ...po,
    openValue: po.status === 'Completed' ? 0 : po.totalCost,
  })), [list])
  const total = rows.reduce((s, p) => s + p.totalCost, 0)
  const openValue = rows.reduce((s, p) => s + p.openValue, 0)
  const lineTotal = form.items.reduce((s, line) => s + line.qty * line.unitCost, 0)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }
  function addLine() { setForm(f => ({ ...f, items: [...f.items, { ...BLANK_LINE }] })) }
  function removeLine(i: number) { setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) })) }
  function updateLine(i: number, field: keyof ItemLine, val: string | number) {
    setForm(f => ({ ...f, items: f.items.map((line, idx) => {
      if (idx !== i) return line
      if (field === 'sku') {
        const prod = products.find(p => p.sku === val)
        return { ...line, sku: val as string, name: prod?.name ?? '', unitCost: prod?.cost ?? 0 }
      }
      return { ...line, [field]: val }
    }) }))
  }

  function handleSubmit() {
    const validItems = form.items.filter(i => (i.sku || i.name) && i.qty > 0)
    if (!form.supplier || !form.etaDate || validItems.length === 0) {
      showToast('กรุณากรอกซัพพลายเออร์ วัน ETA และรายการ')
      return
    }
    const po = createPO({ supplier: form.supplier, etaDate: form.etaDate, items: validItems })
    setForm(BLANK)
    setOpen(false)
    showToast(`สร้าง ${po.id} แล้ว`)
  }

  function handleStatusChange(poId: string, status: PurchaseOrderStatus) {
    const updated = updatePOStatus(poId, status)
    if (updated) showToast(`${poId} → ${status}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'Purchasing', 'Purchase Orders']}
        title="Purchase Orders"
        subtitle={`ใบสั่งซื้อ · ${rows.length} รายการ · ${formatBaht(openValue)} ค้างรับ`}
        right={
          <>
            {toast && <span style={{ fontSize: 12, fontWeight: 600, color: toast.includes('กรุณา') ? c.neg : c.pos }}>{toast}</span>}
            <Btn t={t} variant="ghost">Export</Btn>
            <Btn t={t} variant="primary" onClick={() => { setForm(BLANK); setOpen(true) }}>+ New PO</Btn>
          </>
        }
      />

      <div style={{ padding: '24px 32px 48px' }}>
        <StatStrip
          t={t}
          tiles={[
            { label: 'Total ordered', value: formatBaht(total), sub: 'this month' },
            { label: 'Open value', value: formatBaht(openValue), sub: 'awaiting receipt' },
            { label: 'Overdue POs', value: '0', sub: 'past ETA', tone: c.neg },
            { label: 'Suppliers', value: String(new Set(rows.map(p => p.supplier)).size), sub: 'active' },
          ]}
        />

        <PremiumTable t={t} minWidth={940}>
          <thead>
            <tr>
              {['PO', 'Supplier', 'Order date', 'ETA'].map(h => <PremiumTh key={h} t={t}>{h}</PremiumTh>)}
              <PremiumTh t={t} right>Items</PremiumTh>
              <PremiumTh t={t} right>Amount</PremiumTh>
              <PremiumTh t={t}>Status</PremiumTh>
            </tr>
          </thead>
          <tbody>
            {rows.map((po, i) => {
              const last = i === rows.length - 1
              return (
                <tr key={po.id}>
                  <PremiumTd t={t} last={last}>
                    <Mono t={t} size={12} weight={500}>{po.id}</Mono>
                    {po.status === 'Draft' && <Btn t={t} variant="ghost" onClick={() => handleStatusChange(po.id, 'Sent')} style={{ marginLeft: 8, padding: '3px 8px', fontSize: 10 }}>Send</Btn>}
                  </PremiumTd>
                  <PremiumTd t={t} last={last}><span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{po.supplier}</span></PremiumTd>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} color={c.ink2}>{po.date}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} color={c.ink2}>{po.etaDate}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={12} color={c.ink2}>{po.items.length}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={13} weight={600}>{formatBaht(po.totalCost)}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><StatusPill t={t} status={statusMap[po.status]} /></PremiumTd>
                </tr>
              )
            })}
          </tbody>
        </PremiumTable>
      </div>

      <SlidePanel open={open} onClose={() => setOpen(false)} title="New Purchase Order" subtitle={`Total ${formatBaht(lineTotal)}`}
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
            <Mono t={t} size={14} weight={600}>{formatBaht(lineTotal)}</Mono>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn t={t} variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
              <Btn t={t} variant="accent" onClick={handleSubmit}>Save PO</Btn>
            </div>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <Field t={t} label="Supplier" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} />
          <Field t={t} label="ETA" type="date" value={form.etaDate} onChange={e => setForm(f => ({ ...f, etaDate: e.target.value }))} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: c.ink2 }}>Items</span>
            <Btn t={t} variant="ghost" onClick={addLine}>+ Add item</Btn>
          </div>
          <div style={{ border: `1px solid ${c.border}`, borderRadius: t.radius, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {form.items.map((line, i) => (
                  <tr key={i} style={{ borderBottom: i === form.items.length - 1 ? 'none' : `1px solid ${c.border}` }}>
                    <td style={{ padding: 10 }}>
                      <SelectField t={t} value={line.sku} onChange={e => updateLine(i, 'sku', e.target.value)}>
                        <option value="">Select product</option>
                        {products.map(p => <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>)}
                      </SelectField>
                    </td>
                    <td style={{ padding: 10, width: 84 }}>
                      <Field t={t} type="number" min={1} value={line.qty} onChange={e => updateLine(i, 'qty', Math.max(1, parseInt(e.target.value) || 1))} inputStyle={{ textAlign: 'center' }} />
                    </td>
                    <td style={{ padding: 10, width: 106 }}>
                      <Field t={t} type="number" min={0} value={line.unitCost} onChange={e => updateLine(i, 'unitCost', parseFloat(e.target.value) || 0)} inputStyle={{ textAlign: 'right' }} />
                    </td>
                    <td style={{ padding: 10, width: 42 }}>
                      {form.items.length > 1 && <Btn t={t} variant="ghost" onClick={() => removeLine(i)} style={{ padding: '6px 9px' }}>×</Btn>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SlidePanel>
    </div>
  )
}
