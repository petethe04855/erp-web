'use client'
import { useMemo, useState } from 'react'
import { formatBaht } from '@/lib/mockData'
import SlidePanel from '@/components/SlidePanel'
import { useErpStore } from '@/lib/store/useErpStore'
import type { GoodsIssueReason } from '@/lib/store/erpWorkflow'
import { useTheme } from '@/lib/design/ThemeContext'
import { Btn, Field, Mono, PremiumTable, PremiumTd, PremiumTh, SelectField, StatStrip, StatusPill, TextAreaField, TopBar } from '@/components/ui'

const REASONS: GoodsIssueReason[] = ['ตัวอย่าง', 'เสียหาย/หมดอายุ', 'ใช้ภายใน', 'โปรโมชัน', 'อื่นๆ']
const BLANK = { sku: '', qty: 1, reason: 'ใช้ภายใน' as GoodsIssueReason, note: '' }

function department(reason: GoodsIssueReason) {
  if (reason === 'โปรโมชัน' || reason === 'ตัวอย่าง') return 'Marketing'
  if (reason === 'เสียหาย/หมดอายุ') return 'Warehouse'
  if (reason === 'ใช้ภายใน') return 'Operations'
  return 'Inventory'
}

export default function GoodsIssuePage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const products = useErpStore(s => s.products)
  const goodsIssues = useErpStore(s => s.goodsIssues)
  const createGoodsIssue = useErpStore(s => s.createGoodsIssue)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [toast, setToast] = useState('')

  const selectedProduct = products.find(p => p.sku === form.sku)
  const available = selectedProduct ? selectedProduct.stock - selectedProduct.reservedQty : 0
  const isOverStock = !!form.sku && form.qty > available

  const rows = useMemo(() => goodsIssues.map(issue => {
    const product = products.find(p => p.sku === issue.sku)
    return {
      ...issue,
      dept: department(issue.reason),
      value: issue.qty * (product?.cost ?? 0),
      status: 'completed',
    }
  }), [goodsIssues, products])
  const total = rows.reduce((s, g) => s + g.value, 0)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function handleSubmit() {
    if (!form.sku || form.qty < 1) return
    const result = createGoodsIssue({ sku: form.sku, qty: form.qty, reason: form.reason, note: form.note })
    if (!result) {
      showToast('สต๊อกไม่พอ กรุณาตรวจสอบ')
      return
    }
    setForm(BLANK)
    setOpen(false)
    showToast(`สร้าง ${result.id} แล้ว · ตัด stock FEFO`)
  }

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'Inventory', 'Goods Issue']}
        title="Goods Issue"
        subtitle={`เบิกสินค้าออก · ${rows.length} รายการ · ${formatBaht(total)} มูลค่ารวม`}
        right={
          <>
            {toast && <span style={{ fontSize: 12, fontWeight: 600, color: toast.includes('ไม่') ? c.neg : c.pos }}>{toast}</span>}
            <Btn t={t} variant="primary" onClick={() => setOpen(true)}>+ Issue Goods</Btn>
          </>
        }
      />

      <div style={{ padding: '24px 32px 48px' }}>
        <StatStrip
          t={t}
          tiles={[
            { label: 'Issued · MTD', value: formatBaht(total), sub: `${rows.length} issues` },
            { label: 'To production', value: formatBaht(rows.filter(g => g.dept === 'Operations').reduce((s, g) => s + g.value, 0)), sub: 'Operations' },
            { label: 'Pending', value: '0', sub: 'awaiting pick', tone: c.warn },
            { label: 'Departments', value: String(new Set(rows.map(g => g.dept)).size), sub: 'requesting' },
          ]}
        />

        <PremiumTable t={t} minWidth={960}>
          <thead>
            <tr>
              {['GI', 'Purpose', 'Department', 'Date'].map(h => <PremiumTh key={h} t={t}>{h}</PremiumTh>)}
              <PremiumTh t={t} right>Items</PremiumTh>
              <PremiumTh t={t}>Quantity</PremiumTh>
              <PremiumTh t={t} right>Value</PremiumTh>
              <PremiumTh t={t}>Status</PremiumTh>
            </tr>
          </thead>
          <tbody>
            {rows.map((g, i) => {
              const last = i === rows.length - 1
              return (
                <tr key={g.id}>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} weight={500}>{g.id}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{g.reason}</span>
                    <div style={{ fontSize: 11, color: c.ink3, marginTop: 2 }}>{g.skuName}</div>
                  </PremiumTd>
                  <PremiumTd t={t} last={last}><span style={{ fontSize: 12, color: c.ink2 }}>{g.dept}</span></PremiumTd>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} color={c.ink2}>{g.date}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={12} color={c.ink2}>1</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} color={c.ink2}>{g.qty}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={13} weight={600}>{formatBaht(g.value)}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><StatusPill t={t} status={g.status} /></PremiumTd>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr><PremiumTd t={t} last colSpan={8} style={{ textAlign: 'center', padding: 40, color: c.ink3 }}>No goods issue records</PremiumTd></tr>
            )}
          </tbody>
        </PremiumTable>
      </div>

      <SlidePanel open={open} onClose={() => setOpen(false)} title="Issue Goods" subtitle="บันทึกการนำสินค้าออกจากคลัง"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn t={t} variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
            <Btn t={t} variant="accent" onClick={handleSubmit} style={{ opacity: !form.sku || isOverStock ? 0.45 : 1 }}>Save Issue</Btn>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <SelectField t={t} label="Product" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}>
            <option value="">Select product</option>
            {products.map(p => {
              const avail = p.stock - p.reservedQty
              return <option key={p.sku} value={p.sku}>{p.name} · available {avail}</option>
            })}
          </SelectField>

          {selectedProduct && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: `1px solid ${c.border}`, borderRadius: t.radius, overflow: 'hidden' }}>
              {[
                ['Stock', selectedProduct.stock],
                ['Reserved', selectedProduct.reservedQty],
                ['Available', available],
              ].map(([label, value], i) => (
                <div key={label} style={{ padding: 12, borderRight: i < 2 ? `1px solid ${c.border}` : 'none' }}>
                  <div style={{ fontSize: 10, color: c.ink3, textTransform: 'uppercase', letterSpacing: '0.10em' }}>{label}</div>
                  <Mono t={t} size={18} weight={600}>{value}</Mono>
                </div>
              ))}
            </div>
          )}

          <Field t={t} label="Quantity" type="number" min={1} max={available} value={form.qty} onChange={e => setForm(f => ({ ...f, qty: Math.max(1, parseInt(e.target.value) || 1) }))} inputStyle={{ borderColor: isOverStock ? c.neg : c.border }} />
          {isOverStock && <div style={{ marginTop: -10, fontSize: 11, color: c.neg }}>เกินสต๊อกพร้อมเบิก ({available} ชิ้น)</div>}

          <SelectField t={t} label="Purpose" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value as GoodsIssueReason }))}>
            {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </SelectField>
          <TextAreaField t={t} label="Note" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
        </div>
      </SlidePanel>
    </div>
  )
}
