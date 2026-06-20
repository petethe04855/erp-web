'use client'
import { useState } from 'react'
import { formatBaht, type LeadSource, type QuotationStatus } from '@/lib/mockData'
import SlidePanel from '@/components/SlidePanel'
import { useErpStore } from '@/lib/store/useErpStore'
import { useTheme } from '@/lib/design/ThemeContext'
import { Btn, Field, Mono, PremiumTable, PremiumTd, PremiumTh, SelectField, StatusPill, TopBar } from '@/components/ui'

type Line = { sku: string; qty: number }
const LEAD_SOURCES: LeadSource[] = ['Live', 'LINE', 'Facebook', 'Shopee', 'Walk-in', 'B2B Referral']
const BLANK_FORM = { customer: '', leadSource: 'Live' as LeadSource, validUntil: addDaysIso(15), lines: [{ sku: '', qty: 1 }] as Line[] }

function addDaysIso(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}



function quoteStatus(status: QuotationStatus) {
  if (status === 'Approved' || status === 'Converted') return 'completed'
  if (status === 'Rejected' || status === 'Expired') return 'cancelled'
  if (status === 'Sent') return 'sent'
  return 'draft'
}

export default function QuotationPage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const list = useErpStore(state => state.quotations)
  const products = useErpStore(state => state.products)
  const createQuotation = useErpStore(state => state.createQuotation)
  const convertQuotationToSalesOrder = useErpStore(state => state.convertQuotationToSalesOrder)
  const updateQuotationStatus = useErpStore(state => state.updateQuotationStatus)

  const getProductName = (sku: string) => products.find(p => p.sku === sku)?.name ?? sku

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(BLANK_FORM)
  const [toast, setToast] = useState('')

  const total = list.reduce((s, q) => s + q.amount, 0)
  const lineTotal = form.lines.reduce((s, line) => {
    const product = products.find(p => p.sku === line.sku)
    return s + (product ? product.price * line.qty : 0)
  }, 0)

  function showToast(message: string) { setToast(message); setTimeout(() => setToast(''), 3000) }
  function addLine() { setForm(f => ({ ...f, lines: [...f.lines, { sku: '', qty: 1 }] })) }
  function removeLine(i: number) { setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) })) }
  function updateLine(i: number, field: keyof Line, val: string | number) {
    setForm(f => ({ ...f, lines: f.lines.map((line, idx) => idx === i ? { ...line, [field]: val } : line) }))
  }

  function handleSubmit() {
    const validLines = form.lines.filter(l => l.sku && l.qty > 0)
    if (!form.customer || !form.validUntil || validLines.length === 0) {
      showToast('กรุณากรอกลูกค้า วันหมดอายุ และสินค้า')
      return
    }
    const newQt = createQuotation({ customer: form.customer, validUntil: form.validUntil, leadSource: form.leadSource, lines: validLines })
    setForm(BLANK_FORM)
    setOpen(false)
    showToast(`สร้าง ${newQt.id} แล้ว`)
  }

  function transition(id: string, status: QuotationStatus, note: string) {
    const updated = updateQuotationStatus(id, status, note)
    if (updated) showToast(`${id} → ${status}`)
  }

  function convertToSO(id: string) {
    const salesOrder = convertQuotationToSalesOrder(id)
    if (salesOrder) showToast(`${id} → ${salesOrder.id} แล้ว`)
  }

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'Sales', 'Quotations']}
        title="Quotations"
        subtitle={`ใบเสนอราคา · ${list.length} รายการ · ${formatBaht(total)} pipeline`}
        right={
          <>
            {toast && <span style={{ fontSize: 12, fontWeight: 600, color: toast.includes('กรุณา') ? c.neg : c.pos }}>{toast}</span>}
            <Btn t={t} variant="primary" onClick={() => { setForm({ ...BLANK_FORM, validUntil: addDaysIso(15) }); setOpen(true) }}>+ New Quotation</Btn>
          </>
        }
      />

      <div style={{ padding: '24px 32px 48px' }}>
        <PremiumTable t={t} minWidth={920}>
          <thead>
            <tr>
              {['Quote', 'Customer', 'Issued', 'Valid until'].map(h => <PremiumTh key={h} t={t}>{h}</PremiumTh>)}
              <PremiumTh t={t} right>Amount</PremiumTh>
              <PremiumTh t={t}>Status</PremiumTh>
            </tr>
          </thead>
          <tbody>
            {list.map((q, i) => {
              const last = i === list.length - 1
              return (
                <tr key={q.id}>
                  <PremiumTd t={t} last={last}>
                    <Mono t={t} size={12} weight={500}>{q.id}</Mono>
                    <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
                      {q.status === 'Draft' && <Btn t={t} variant="ghost" onClick={() => transition(q.id, 'Sent', 'ส่งให้ลูกค้าแล้ว รออนุมัติ')} style={{ padding: '3px 8px', fontSize: 10 }}>Send</Btn>}
                      {q.status === 'Sent' && <Btn t={t} variant="accent" onClick={() => transition(q.id, 'Approved', 'Admin/Owner อนุมัติใบเสนอราคา')} style={{ padding: '3px 8px', fontSize: 10 }}>Approve</Btn>}
                      {q.status === 'Approved' && !q.soRef && <Btn t={t} variant="accent" onClick={() => convertToSO(q.id)} style={{ padding: '3px 8px', fontSize: 10 }}>Create SO</Btn>}
                    </div>
                  </PremiumTd>
                  <PremiumTd t={t} last={last}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{q.customer}</span>
                    <div style={{ fontSize: 11, color: c.ink3, marginTop: 2 }}>{q.leadSource} · {q.items} items</div>
                  </PremiumTd>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} color={c.ink2}>{q.date}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} color={c.ink2}>{q.validUntil}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={13} weight={600}>{formatBaht(q.amount)}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><StatusPill t={t} status={quoteStatus(q.status)} /></PremiumTd>
                </tr>
              )
            })}
          </tbody>
        </PremiumTable>
      </div>

      <SlidePanel open={open} onClose={() => setOpen(false)} title="New Quotation" subtitle={`Total ${formatBaht(lineTotal)}`}
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
            <Mono t={t} size={14} weight={600}>{formatBaht(lineTotal)}</Mono>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn t={t} variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
              <Btn t={t} variant="accent" onClick={handleSubmit}>Save Draft</Btn>
            </div>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <Field t={t} label="Customer" value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <SelectField t={t} label="Lead source" value={form.leadSource} onChange={e => setForm(f => ({ ...f, leadSource: e.target.value as LeadSource }))}>
              {LEAD_SOURCES.map(source => <option key={source}>{source}</option>)}
            </SelectField>
            <Field t={t} label="Valid until" type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: c.ink2 }}>Items</span>
            <Btn t={t} variant="ghost" onClick={addLine}>+ Add item</Btn>
          </div>
          <div style={{ border: `1px solid ${c.border}`, borderRadius: t.radius, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {form.lines.map((line, i) => {
                  const product = products.find(p => p.sku === line.sku)
                  return (
                    <tr key={i} style={{ borderBottom: i === form.lines.length - 1 ? 'none' : `1px solid ${c.border}` }}>
                      <td style={{ padding: 10 }}>
                        <SelectField t={t} value={line.sku} onChange={e => updateLine(i, 'sku', e.target.value)}>
                          <option value="">Select product</option>
                          {products.map(p => <option key={p.sku} value={p.sku}>{p.name} · stock {p.stock}</option>)}
                        </SelectField>
                        {line.sku && <div style={{ fontSize: 11, color: c.ink3, marginTop: 4 }}>{getProductName(line.sku)}</div>}
                      </td>
                      <td style={{ padding: 10, width: 86 }}>
                        <Field t={t} type="number" min={1} value={line.qty} onChange={e => updateLine(i, 'qty', Math.max(1, parseInt(e.target.value) || 1))} inputStyle={{ textAlign: 'center' }} />
                      </td>
                      <td style={{ padding: 10, width: 110, textAlign: 'right' }}>
                        <Mono t={t} size={12}>{product ? formatBaht(product.price * line.qty) : '—'}</Mono>
                      </td>
                      <td style={{ padding: 10, width: 42 }}>
                        {form.lines.length > 1 && <Btn t={t} variant="ghost" onClick={() => removeLine(i)} style={{ padding: '6px 9px' }}>×</Btn>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </SlidePanel>
    </div>
  )
}
