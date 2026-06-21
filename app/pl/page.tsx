'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/design/ThemeContext'
import { Btn, Card, Mono, TopBar, fmtBaht } from '@/components/ui'
import { useErpStore } from '@/lib/store/useErpStore'
import type { ExpenseCategory, ExpenseChannel } from '@/lib/store/erpWorkflow'
import { exportXlsx } from '@/lib/utils/exportUtil'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtMonth(key: string) {
  const [y, m] = key.split('-')
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`
}

function prevMonthOf(key: string) {
  const [y, m] = key.split('-').map(Number)
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`
}
const CHANNELS: Array<ExpenseChannel | 'ทั้งหมด'> = ['ทั้งหมด', 'TikTok', 'Shopee', 'LINE', 'Manual']
const COGS: ExpenseCategory = 'COGS/วัตถุดิบ'
const OPEX: ExpenseCategory[] = ['ค่าโฆษณา', 'ค่าธรรมเนียมแพลตฟอร์ม', 'ค่าขนส่ง', 'SG&A', 'ค่าแรง', 'อื่นๆ']

function deltaPct(cur: number, prev: number) {
  return prev ? ((cur - prev) / prev) * 100 : 0
}

export default function PLPage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const salesOrders = useErpStore(s => s.salesOrders)
  const expenses = useErpStore(s => s.expenses)
  const tiktokOrders = useErpStore(s => s.tiktokOrders)
  const nowKey = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` })()
  const [month, setMonth] = useState(nowKey)
  const [channel, setChannel] = useState<ExpenseChannel | 'ทั้งหมด'>('ทั้งหมด')
  const [showPicker, setShowPicker] = useState(false)
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear())
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const prevMonth = prevMonthOf(month)

  function revenueFor(targetMonth: string) {
    return salesOrders
      .filter(order =>
        order.date.startsWith(targetMonth) &&
        order.status !== 'Cancelled' &&
        (channel === 'ทั้งหมด' || order.channel === channel)
      )
      .reduce((sum, order) => {
        if (order.channel === 'TikTok') {
          const source = tiktokOrders.find(tto => tto.id === order.sourceRef)
          if (source?.settled && source.netRevenue !== undefined) return sum + source.netRevenue
        }
        return sum + order.amount
      }, 0)
  }

  function expenseRowsFor(targetMonth: string) {
    return expenses.filter(expense =>
      expense.date.startsWith(targetMonth) &&
      (channel === 'ทั้งหมด' || expense.channel === channel || expense.channel === 'ทั่วไป')
    )
  }

  function amountFor(targetMonth: string, category: ExpenseCategory) {
    return expenseRowsFor(targetMonth).filter(expense => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0)
  }

  const revCur = revenueFor(month)
  const revPrev = revenueFor(prevMonth)
  const cogsCur = amountFor(month, COGS)
  const cogsPrev = amountFor(prevMonth, COGS)
  const opexCur = OPEX.reduce((sum, cat) => sum + amountFor(month, cat), 0)
  const opexPrev = OPEX.reduce((sum, cat) => sum + amountFor(prevMonth, cat), 0)
  const grossCur = revCur - cogsCur
  const grossPrev = revPrev - cogsPrev
  const netCur = grossCur - opexCur
  const netPrev = grossPrev - opexPrev

  function Row({ label, en, cur, prev, kind = 'normal', indent = false }: {
    label: string
    en?: string
    cur: number
    prev: number
    kind?: 'normal' | 'head' | 'cost'
    indent?: boolean
  }) {
    const delta = deltaPct(cur, prev)
    const isHead = kind === 'head'
    const color = delta >= 0 ? (kind === 'cost' ? c.neg : c.pos) : (kind === 'cost' ? c.pos : c.neg)
    return (
      <tr style={{ background: isHead ? c.subtle : 'transparent' }}>
        <td style={{ padding: isHead ? '14px 24px' : '10px 24px', paddingLeft: indent ? 44 : 24, borderBottom: `1px solid ${c.border}` }}>
          <span style={{ fontSize: 13, fontWeight: isHead ? 600 : 500, color: indent ? c.ink2 : c.ink, letterSpacing: '-0.005em' }}>{label}</span>
          {en && <span style={{ fontSize: 11, color: c.ink3, marginLeft: 8 }}>{en}</span>}
        </td>
        <td style={{ padding: isHead ? '14px 24px' : '10px 24px', borderBottom: `1px solid ${c.border}`, textAlign: 'right' }}>
          <Mono t={t} size={13} weight={isHead ? 600 : 500} color={cur < 0 ? c.neg : c.ink}>{fmtBaht(cur)}</Mono>
        </td>
        <td style={{ padding: isHead ? '14px 24px' : '10px 24px', borderBottom: `1px solid ${c.border}`, textAlign: 'right' }}>
          <Mono t={t} size={12} color={c.ink3}>{fmtBaht(prev)}</Mono>
        </td>
        <td style={{ padding: isHead ? '14px 24px' : '10px 24px', borderBottom: `1px solid ${c.border}`, textAlign: 'right' }}>
          {prev ? <Mono t={t} size={12} weight={500} color={color}>{delta >= 0 ? '+' : '−'}{Math.abs(delta).toFixed(1)}%</Mono> : <span style={{ color: c.ink4 }}>—</span>}
        </td>
      </tr>
    )
  }

  function TotalRow({ label, cur, prev, accent = false }: { label: string; cur: number; prev: number; accent?: boolean }) {
    const delta = deltaPct(cur, prev)
    return (
      <tr style={{ background: accent ? c.accentBg : c.subtle }}>
        <td style={{ padding: '16px 24px', borderTop: `1px solid ${c.borderStrong}`, borderBottom: `1px solid ${c.border}` }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: accent ? c.accent : c.ink, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{label}</span>
        </td>
        <td style={{ padding: '16px 24px', borderTop: `1px solid ${c.borderStrong}`, borderBottom: `1px solid ${c.border}`, textAlign: 'right' }}>
          <Mono t={t} size={16} weight={600} color={accent ? c.accent : c.ink}>{fmtBaht(cur)}</Mono>
        </td>
        <td style={{ padding: '16px 24px', borderTop: `1px solid ${c.borderStrong}`, borderBottom: `1px solid ${c.border}`, textAlign: 'right' }}>
          <Mono t={t} size={13} color={c.ink3}>{fmtBaht(prev)}</Mono>
        </td>
        <td style={{ padding: '16px 24px', borderTop: `1px solid ${c.borderStrong}`, borderBottom: `1px solid ${c.border}`, textAlign: 'right' }}>
          {prev ? <Mono t={t} size={13} weight={600} color={delta >= 0 ? c.pos : c.neg}>{delta >= 0 ? '+' : '−'}{Math.abs(delta).toFixed(1)}%</Mono> : <span style={{ color: c.ink4 }}>—</span>}
        </td>
      </tr>
    )
  }

  async function handleExport() {
    try {
      await exportXlsx(`pl?month=${month}&channel=${channel}`, `pl-report-export-${month}.xlsx`)
      showToast('Export สำเร็จ')
    } catch (err: any) {
      showToast('Export ล้มเหลว: ' + err.message)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'Finance', 'P&L Report']}
        title="Profit & Loss"
        subtitle={`งบกำไรขาดทุน · ${fmtMonth(month)} เทียบกับ ${fmtMonth(prevMonth)}`}
         right={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {toast && <span style={{ fontSize: 12, color: c.pos, fontWeight: 600 }}>{toast}</span>}
            <Btn t={t} variant="ghost" onClick={handleExport}>Export XLSX</Btn>
            <Btn t={t} variant="ghost">Export PDF</Btn>
            <div style={{ position: 'relative' }}>
              <Btn t={t} variant="ghost" onClick={() => { setShowPicker(v => !v); setPickerYear(parseInt(month.split('-')[0])) }}>
                {fmtMonth(month)} ▾
              </Btn>
              {showPicker && (
                <>
                  <div onClick={() => setShowPicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: c.surface, border: `1px solid ${c.border}`, borderRadius: t.radius, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 101, padding: 16, width: 240 }}>
                    {/* Year navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <button onClick={() => setPickerYear(y => y - 1)} style={{ width: 28, height: 28, border: `1px solid ${c.border}`, borderRadius: 6, background: c.canvas, color: c.ink2, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                      <span style={{ fontSize: 14, fontWeight: 700, color: c.ink }}>{pickerYear}</span>
                      <button onClick={() => setPickerYear(y => y + 1)} disabled={pickerYear >= parseInt(nowKey.split('-')[0])} style={{ width: 28, height: 28, border: `1px solid ${c.border}`, borderRadius: 6, background: c.canvas, color: pickerYear >= parseInt(nowKey.split('-')[0]) ? c.ink4 : c.ink2, cursor: pickerYear >= parseInt(nowKey.split('-')[0]) ? 'default' : 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                    </div>
                    {/* Month grid 4×3 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                      {MONTH_NAMES.map((name, i) => {
                        const key = `${pickerYear}-${String(i + 1).padStart(2, '0')}`
                        const isCurrent = key === month
                        const isFuture = key > nowKey
                        return (
                          <button key={key} disabled={isFuture} onClick={() => { setMonth(key); setShowPicker(false) }} style={{
                            padding: '7px 0', border: 'none', borderRadius: 6, fontSize: 12, cursor: isFuture ? 'default' : 'pointer', fontFamily: t.font.sans, fontWeight: isCurrent ? 700 : 400,
                            background: isCurrent ? c.accent : isFuture ? 'transparent' : c.canvas,
                            color: isCurrent ? '#fff' : isFuture ? c.ink4 : c.ink2,
                          }}>{name}</button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        }
      />

      <div style={{ padding: '24px 32px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, justifyContent: 'flex-end' }}>
          {CHANNELS.map(item => (
            <Btn key={item} t={t} variant={channel === item ? 'primary' : 'ghost'} onClick={() => setChannel(item)}>{item}</Btn>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total revenue', value: revCur, delta: deltaPct(revCur, revPrev) },
            { label: 'Gross profit', value: grossCur, delta: deltaPct(grossCur, grossPrev), sub: `${revCur ? (grossCur / revCur * 100).toFixed(1) : '0.0'}% margin` },
            { label: 'Operating exp.', value: opexCur, delta: deltaPct(opexCur, opexPrev), cost: true },
            { label: 'Net profit', value: netCur, delta: deltaPct(netCur, netPrev), primary: true, sub: `${revCur ? (netCur / revCur * 100).toFixed(1) : '0.0'}% net margin` },
          ].map(item => (
            <div key={item.label} style={{
              background: item.primary ? c.accentBg : c.surface,
              border: `1px solid ${item.primary ? c.accent : c.border}`,
              borderRadius: t.radius,
              padding: '18px 20px 20px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>{item.label}</div>
              <Mono t={t} size={24} weight={600} color={item.primary ? c.accent : c.ink} style={{ display: 'block', marginTop: 12, letterSpacing: '-0.02em' }}>{fmtBaht(item.value)}</Mono>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                <Mono t={t} size={11} weight={500} color={item.delta >= 0 ? (item.cost ? c.neg : c.pos) : (item.cost ? c.pos : c.neg)}>
                  {item.delta >= 0 ? '↑' : '↓'} {Math.abs(item.delta).toFixed(1)}%
                </Mono>
                <span style={{ fontSize: 11, color: c.ink3 }}>{item.sub || `vs ${fmtMonth(prevMonth)}`}</span>
              </div>
            </div>
          ))}
        </div>

        <Card t={t} pad={false}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font.sans }}>
            <thead>
              <tr>
                {[
                  { label: 'Account' },
                  { label: fmtMonth(month), right: true },
                  { label: fmtMonth(prevMonth), right: true },
                  { label: 'Change', right: true },
                ].map(h => (
                  <th key={h.label} style={{
                    textAlign: h.right ? 'right' : 'left',
                    padding: '12px 24px',
                    fontSize: 10,
                    fontWeight: 500,
                    color: c.ink3,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    borderBottom: `1px solid ${c.borderStrong}`,
                    background: c.canvas,
                  }}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="รายได้" en="Revenue" cur={revCur} prev={revPrev} kind="head" />
              <Row label="ยอดขายสินค้า" en="Product sales" cur={revCur} prev={revPrev} indent />
              <Row label="ต้นทุนขาย" en="Cost of goods sold" cur={cogsCur} prev={cogsPrev} kind="head" />
              <Row label="ต้นทุนวัตถุดิบ" en="Raw materials" cur={cogsCur} prev={cogsPrev} kind="cost" indent />
              <TotalRow label="กำไรขั้นต้น · Gross profit" cur={grossCur} prev={grossPrev} />
              <Row label="ค่าใช้จ่ายดำเนินงาน" en="Operating expenses" cur={opexCur} prev={opexPrev} kind="head" />
              {OPEX.map(cat => (
                <Row key={cat} label={cat} cur={amountFor(month, cat)} prev={amountFor(prevMonth, cat)} kind="cost" indent />
              ))}
              <TotalRow label="กำไรสุทธิ · Net profit" cur={netCur} prev={netPrev} accent />
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
