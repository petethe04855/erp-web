'use client'
import { useMemo, useState } from 'react'
import { formatBaht } from '@/lib/mockData'
import SlidePanel from '@/components/SlidePanel'
import { useErpStore } from '@/lib/store/useErpStore'
import type { PurchaseRequestStatus } from '@/lib/store/erpWorkflow'
import { useTheme } from '@/lib/design/ThemeContext'
import { Btn, Field, Mono, PremiumTable, PremiumTd, PremiumTh, SelectField, StatStrip, StatusPill, TextAreaField, TopBar } from '@/components/ui'

import { readApiResponse } from '@/lib/apiResponse'
import { useEffect } from 'react'

type ItemLine = { sku: string; name: string; qty: number; note: string }
const BLANK_LINE: ItemLine = { sku: '', name: '', qty: 1, note: '' }
const BLANK = { requester: '', reason: '', neededDate: '', items: [{ ...BLANK_LINE }] }

const statusMap: Record<PurchaseRequestStatus, string> = {
  Draft: 'draft',
  'Pending Approval': 'pending',
  Approved: 'completed',
  Rejected: 'cancelled',
}

export default function PurchaseReqPage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const list = useErpStore(s => s.purchaseRequests)
  const products = useErpStore(s => s.products)
  const createPR = useErpStore(s => s.createPurchaseRequest)
  const updatePRStatus = useErpStore(s => s.updatePRStatus)
  const convertPRtoPO = useErpStore(s => s.convertPRtoPO)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [toast, setToast] = useState('')
  const [convertOpen, setConvertOpen] = useState(false)
  const [convertPrId, setConvertPrId] = useState('')
  const [convertSupplier, setConvertSupplier] = useState('')
  const [convertEta, setConvertEta] = useState('')
  const [convertCosts, setConvertCosts] = useState<Record<string, number>>({})
  const [bomsList, setBomsList] = useState<any[]>([])

  async function loadBOMs() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/boms`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: typeof window !== 'undefined' ? `Bearer ${localStorage.getItem('chawy_token')}` : '',
        }
      })
      const result = await readApiResponse<any[]>(response)
      setBomsList(result || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadBOMs()
  }, [])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const rows = useMemo(() => list.map(pr => {
    const est = pr.items.reduce((sum, item) => {
      const product = products.find(p => p.sku === item.sku)
      const bom = bomsList.find(b => b.code === item.sku)
      const cost = product ? product.cost : (bom ? bom.cost : 0)
      return sum + item.qty * cost
    }, 0)
    return { ...pr, est, itemSummary: pr.items.map(i => `${i.name || i.sku} x${i.qty}`).join(', ') }
  }), [list, products, bomsList])
  const pending = rows.filter(p => p.status === 'Pending Approval')
  const totalEst = rows.reduce((s, p) => s + p.est, 0)

  function addLine() { setForm(f => ({ ...f, items: [...f.items, { ...BLANK_LINE }] })) }
  function removeLine(i: number) { setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) })) }
  function updateLine(i: number, field: keyof ItemLine, val: string | number) {
    setForm(f => ({ ...f, items: f.items.map((line, idx) => {
      if (idx !== i) return line
      if (field === 'sku') {
        const prod = products.find(p => p.sku === val)
        const bom = bomsList.find(b => b.code === val)
        return { ...line, sku: val as string, name: prod?.name || bom?.name || '' }
      }
      return { ...line, [field]: val }
    }) }))
  }

  function handleSubmit() {
    const validItems = form.items.filter(i => (i.sku || i.name) && i.qty > 0)
    if (!form.requester || !form.neededDate || validItems.length === 0) {
      showToast('กรุณากรอกผู้ขอ วันที่ต้องการ และรายการอย่างน้อย 1 รายการ')
      return
    }
    const pr = createPR({ requester: form.requester, reason: form.reason, neededDate: form.neededDate, items: validItems })
    setForm(BLANK)
    setOpen(false)
    showToast(`สร้าง ${pr.id} แล้ว`)
  }

  function handleStatusChange(prId: string, status: PurchaseRequestStatus) {
    const updated = updatePRStatus(prId, status)
    if (updated) showToast(`${prId} → ${status}`)
  }

  function openConvertToPO(prId: string) {
    const pr = list.find(p => p.id === prId)
    if (!pr) return
    setConvertPrId(prId)
    setConvertSupplier('')
    setConvertEta('')
    const costs: Record<string, number> = {}
    pr.items.forEach(i => {
      const prod = products.find(p => p.sku === i.sku)
      const bom = bomsList.find(b => b.code === i.sku)
      costs[i.sku] = prod ? prod.cost : (bom ? bom.cost : 0)
    })
    setConvertCosts(costs)
    setConvertOpen(true)
  }

  function handleConvert() {
    if (!convertSupplier || !convertEta) { showToast('กรุณากรอกซัพพลายเออร์และ ETA'); return }
    const po = convertPRtoPO(convertPrId, convertSupplier, convertEta, convertCosts)
    setConvertOpen(false)
    if (po) showToast(`${convertPrId} → ${po.id} แล้ว`)
  }

  const convertPr = list.find(p => p.id === convertPrId)

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'Purchasing', 'Purchase Req.']}
        title="Purchase Requisitions"
        subtitle={`ใบขอซื้อ · ${pending.length} รออนุมัติ · ${formatBaht(totalEst)} มูลค่าประมาณ`}
        right={
          <>
            {toast && <span style={{ fontSize: 12, fontWeight: 600, color: toast.includes('กรุณา') ? c.neg : c.pos }}>{toast}</span>}
            <Btn t={t} variant="primary" onClick={() => { setForm(BLANK); setOpen(true) }}>+ New Request</Btn>
          </>
        }
      />

      <div style={{ padding: '24px 32px 48px' }}>
        <StatStrip
          t={t}
          tiles={[
            { label: 'Pending approval', value: String(pending.length), sub: 'awaiting review', tone: pending.length ? c.warn : c.ink },
            { label: 'Est. value', value: formatBaht(pending.reduce((s, p) => s + p.est, 0)), sub: 'pending requests' },
            { label: 'Approved · MTD', value: String(rows.filter(p => p.status === 'Approved').length), sub: 'this month' },
            { label: 'Avg. lead time', value: '4.2 วัน', sub: 'request → PO' },
          ]}
        />

        <PremiumTable t={t} minWidth={980}>
          <thead>
            <tr>
              {['PR', 'Requester', 'Date', 'Item', 'Quantity'].map(h => <PremiumTh key={h} t={t}>{h}</PremiumTh>)}
              <PremiumTh t={t} right>Est. value</PremiumTh>
              <PremiumTh t={t}>Status</PremiumTh>
            </tr>
          </thead>
          <tbody>
            {rows.map((pr, i) => {
              const last = i === rows.length - 1
              return (
                <tr key={pr.id}>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} weight={500}>{pr.id}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><span style={{ fontSize: 13, color: c.ink2 }}>{pr.requester}</span></PremiumTd>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} color={c.ink2}>{pr.date}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{pr.items[0]?.name || pr.items[0]?.sku || '—'}</span>
                    {pr.items.length > 1 && <span style={{ fontSize: 11, color: c.ink3, marginLeft: 6 }}>+{pr.items.length - 1}</span>}
                  </PremiumTd>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} color={c.ink2}>{pr.items.reduce((s, item) => s + item.qty, 0)}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={13} weight={600}>{formatBaht(pr.est)}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}>
                    {pr.status === 'Pending Approval' ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn t={t} variant="accent" onClick={() => handleStatusChange(pr.id, 'Approved')} style={{ padding: '4px 10px', fontSize: 11 }}>Approve</Btn>
                        <Btn t={t} variant="ghost" onClick={() => handleStatusChange(pr.id, 'Rejected')} style={{ padding: '4px 10px', fontSize: 11 }}>Reject</Btn>
                      </div>
                    ) : pr.status === 'Draft' ? (
                      <Btn t={t} variant="ghost" onClick={() => handleStatusChange(pr.id, 'Pending Approval')} style={{ padding: '4px 10px', fontSize: 11 }}>Submit</Btn>
                    ) : pr.status === 'Approved' && !pr.poRef ? (
                      <Btn t={t} variant="accent" onClick={() => openConvertToPO(pr.id)} style={{ padding: '4px 10px', fontSize: 11 }}>Create PO</Btn>
                    ) : (
                      <StatusPill t={t} status={statusMap[pr.status]} />
                    )}
                  </PremiumTd>
                </tr>
              )
            })}
          </tbody>
        </PremiumTable>
      </div>

      <SlidePanel open={open} onClose={() => setOpen(false)} title="New Purchase Request"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn t={t} variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
            <Btn t={t} variant="accent" onClick={handleSubmit}>Save Draft</Btn>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <Field t={t} label="Requester" value={form.requester} onChange={e => setForm(f => ({ ...f, requester: e.target.value }))} />
          <TextAreaField t={t} label="Reason" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
          <Field t={t} label="Needed date" type="date" value={form.neededDate} onChange={e => setForm(f => ({ ...f, neededDate: e.target.value }))} />

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
                        <option value="">Select product / BOM</option>
                        <optgroup label="Products / Raw Materials">
                          {products.map(p => <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>)}
                        </optgroup>
                        <optgroup label="BOMs (Recipes)">
                          {bomsList.map(b => <option key={b.code} value={b.code}>{b.name} ({b.code})</option>)}
                        </optgroup>
                      </SelectField>
                    </td>
                    <td style={{ padding: 10, width: 88 }}>
                      <Field t={t} type="number" min={1} value={line.qty} onChange={e => updateLine(i, 'qty', Math.max(1, parseInt(e.target.value) || 1))} inputStyle={{ textAlign: 'center' }} />
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

      <SlidePanel open={convertOpen} onClose={() => setConvertOpen(false)} title="Create PO from PR" subtitle={convertPrId}
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn t={t} variant="ghost" onClick={() => setConvertOpen(false)}>Cancel</Btn>
            <Btn t={t} variant="accent" onClick={handleConvert}>Create Purchase Order</Btn>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <Field t={t} label="Supplier" value={convertSupplier} onChange={e => setConvertSupplier(e.target.value)} />
          <Field t={t} label="ETA" type="date" value={convertEta} onChange={e => setConvertEta(e.target.value)} />
          {convertPr && (
            <PremiumTable t={t} minWidth={520}>
              <thead>
                <tr>
                  <PremiumTh t={t}>Item</PremiumTh>
                  <PremiumTh t={t}>Qty</PremiumTh>
                  <PremiumTh t={t} right>Unit cost</PremiumTh>
                </tr>
              </thead>
              <tbody>
                {convertPr.items.map((item, i) => {
                  const last = i === convertPr.items.length - 1
                  return (
                    <tr key={`${item.sku}-${i}`}>
                      <PremiumTd t={t} last={last}><span style={{ fontSize: 12, color: c.ink }}>{item.name || item.sku}</span></PremiumTd>
                      <PremiumTd t={t} last={last}><Mono t={t} size={12}>{item.qty}</Mono></PremiumTd>
                      <PremiumTd t={t} last={last} right>
                        <input
                          type="number"
                          min={0}
                          value={convertCosts[item.sku] ?? 0}
                          onChange={e => setConvertCosts(costs => ({ ...costs, [item.sku]: parseFloat(e.target.value) || 0 }))}
                          style={{ width: 100, textAlign: 'right', border: `1px solid ${c.border}`, borderRadius: 6, padding: '6px 8px', fontFamily: t.font.mono }}
                        />
                      </PremiumTd>
                    </tr>
                  )
                })}
              </tbody>
            </PremiumTable>
          )}
        </div>
      </SlidePanel>
    </div>
  )
}
