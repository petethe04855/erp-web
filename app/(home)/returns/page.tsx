'use client'
import { useMemo, useState } from 'react'
import { useErpStore } from '@/lib/store/useErpStore'
import { exportXlsx } from '@/lib/utils/exportUtil'

import SlidePanel from '@/components/SlidePanel'
import type { ReturnReason, ReturnCondition } from '@/lib/store/erpWorkflow'
import { useTheme } from '@/lib/design/ThemeContext'
import { Btn, Field, Mono, PremiumTable, PremiumTd, PremiumTh, SelectField, StatStrip, StatusPill, TextAreaField, TopBar, fmtBaht } from '@/components/ui'

const REASONS: ReturnReason[] = ['สินค้าชำรุด', 'ผิดสินค้า', 'ลูกค้าเปลี่ยนใจ', 'ผิดขนาด/รุ่น', 'อื่นๆ']
const BLANK = { soRef: '', sku: '', qty: 1, condition: 'ดี' as ReturnCondition, reason: 'สินค้าชำรุด' as ReturnReason, note: '', channel: 'Manual' }

export default function ReturnsPage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const salesOrders = useErpStore(s => s.salesOrders)
  const stockReturns = useErpStore(s => s.stockReturns)
  const products = useErpStore(s => s.products)
  const createStockReturn = useErpStore(s => s.createStockReturn)
  const updateStockReturnStatus = useErpStore(s => s.updateStockReturnStatus)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const completedSOs = salesOrders.filter(o => o.status === 'Completed')
  const rows = useMemo(() => stockReturns.map(ret => {
    const product = products.find(p => p.sku === ret.sku)
    const so = salesOrders.find(o => o.id === ret.soRef)
    const amount = (product?.price ?? 0) * ret.qty
    const status = ret.status ? ret.status.toLowerCase() : (ret.refunded ? 'completed' : 'pending')
    return { ...ret, customer: so?.customer ?? 'Walk-in / Manual', amount, status }
  }), [stockReturns, products, salesOrders])
  const total = rows.reduce((s, r) => s + r.amount, 0)
  const openCount = rows.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length
  const topReason = REASONS.map(reason => ({
    reason,
    count: stockReturns.filter(r => r.reason === reason).length,
  })).sort((a, b) => b.count - a.count)[0]

  function handleSubmit() {
    if (!form.sku || form.qty < 1) return
    const result = createStockReturn({ soRef: form.soRef, sku: form.sku, qty: form.qty, condition: form.condition, reason: form.reason, note: form.note, channel: form.channel })
    setForm(BLANK)
    setOpen(false)
    showToast(`รับคืน ${result.id} แล้ว · สถานะ: รอดำเนินการ`)
  }

  function handleUpdateStatus(id: string, newStatus: 'Completed' | 'Cancelled') {
    updateStockReturnStatus(id, newStatus)
    showToast(`อัปเดต ${id} เป็น ${newStatus === 'Completed' ? 'ของกลับมาแล้ว' : 'ยกเลิก'} สำเร็จ`)
  }

  async function handleExport() {
    try {
      await exportXlsx('returns', `returns-export-${new Date().toISOString().slice(0, 10)}.xlsx`)
      showToast('Export สำเร็จ')
    } catch (err: any) {
      showToast('Export ล้มเหลว: ' + err.message)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar
         t={t}
         breadcrumb={['Chawy', 'Sales', 'Returns']}
         title="Returns"
         subtitle={`คืนสินค้า · ${rows.length} รายการ · ${fmtBaht(total)} มูลค่ารวม`}
         right={
           <>
             {toast && <span style={{ fontSize: 12, fontWeight: 600, color: c.pos }}>{toast}</span>}
             <Btn t={t} variant="ghost" onClick={handleExport}>Export</Btn>
             <Btn t={t} variant="primary" onClick={() => setOpen(true)}>+ New Return</Btn>
           </>
         }
      />

      <div style={{ padding: '24px 32px 48px' }}>
        <StatStrip
          t={t}
          tiles={[
            { label: 'Total value', value: fmtBaht(total), sub: 'this month' },
            { label: 'Open RMAs', value: String(openCount), sub: 'awaiting action', tone: openCount ? c.warn : c.ink },
            { label: 'Return rate', value: `${((rows.length / Math.max(1, salesOrders.length)) * 100).toFixed(1)}%`, sub: 'of orders' },
            { label: 'Top reason', value: topReason?.reason ?? '—', sub: `${topReason?.count ?? 0} returns` },
          ]}
        />

        <PremiumTable t={t} minWidth={1000}>
          <thead>
            <tr>
              {['RMA', 'SO Ref', 'Customer', 'Channel', 'Date', 'Reason'].map(h => <PremiumTh key={h} t={t}>{h}</PremiumTh>)}
              <PremiumTh t={t} right>Qty</PremiumTh>
              <PremiumTh t={t} right>Amount</PremiumTh>
              <PremiumTh t={t}>Status</PremiumTh>
              <PremiumTh t={t}>Actions</PremiumTh>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const last = i === rows.length - 1
              return (
                <tr key={r.id}>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} weight={500}>{r.id}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} color={r.soRef ? c.accent : c.ink3}>{r.soRef || '—'}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{r.customer}</span></PremiumTd>
                  <PremiumTd t={t} last={last}><span style={{ fontSize: 13, fontWeight: 500, color: c.ink2 }}>{r.channel}</span></PremiumTd>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} color={c.ink2}>{r.date}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}>
                    <span style={{ fontSize: 13, color: c.ink }}>{r.reason}</span>
                    <span style={{ fontSize: 11, color: c.ink3, marginLeft: 6 }}>{r.condition}</span>
                  </PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={12} color={c.ink2}>{r.qty}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={13} weight={600}>{fmtBaht(r.amount)}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><StatusPill t={t} status={r.status} /></PremiumTd>
                  <PremiumTd t={t} last={last}>
                    {r.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn t={t} variant="accent" onClick={() => handleUpdateStatus(r.id, 'Completed')} style={{ padding: '4px 8px', fontSize: 11 }}>ของกลับมาแล้ว</Btn>
                        <Btn t={t} variant="ghost" onClick={() => handleUpdateStatus(r.id, 'Cancelled')} style={{ padding: '4px 8px', fontSize: 11 }}>ยกเลิก</Btn>
                      </div>
                    )}
                  </PremiumTd>
                </tr>
              )
            })}
          </tbody>
        </PremiumTable>
      </div>

      <SlidePanel open={open} onClose={() => setOpen(false)} title="New Return" subtitle="บันทึกการรับสินค้ากลับจากลูกค้า"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn t={t} variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
            <Btn t={t} variant="accent" onClick={handleSubmit} style={{ opacity: form.sku ? 1 : 0.45 }}>Save Return</Btn>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <SelectField t={t} label="Sales Order" value={form.soRef} onChange={e => {
            const soId = e.target.value
            const so = salesOrders.find(o => o.id === soId)
            setForm(f => ({ ...f, soRef: soId, channel: so ? so.channel : f.channel }))
          }}>
            <option value="">No SO reference</option>
            {completedSOs.map(o => <option key={o.id} value={o.id}>{o.id} — {o.customer}</option>)}
          </SelectField>
          <SelectField t={t} label="Product" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}>
            <option value="">Select product</option>
            {products.map(p => <option key={p.sku} value={p.sku}>{p.name}</option>)}
          </SelectField>
          <Field t={t} label="Quantity" type="number" min={1} value={form.qty} onChange={e => setForm(f => ({ ...f, qty: Math.max(1, parseInt(e.target.value) || 1) }))} />
          <SelectField t={t} label="Condition" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value as ReturnCondition }))}>
            <option value="ดี">ดี · add back to stock</option>
            <option value="เสียหาย">เสียหาย · do not add stock</option>
          </SelectField>
          <SelectField t={t} label="Channel" value={form.channel} disabled={!!form.soRef} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}>
            <option value="Manual">Manual</option>
            <option value="LINE">LINE</option>
            <option value="Shopee">Shopee</option>
            <option value="TikTok">TikTok</option>
          </SelectField>
          <SelectField t={t} label="Reason" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value as ReturnReason }))}>
            {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </SelectField>
          <TextAreaField t={t} label="Note" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
        </div>
      </SlidePanel>
    </div>
  )
}
