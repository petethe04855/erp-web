'use client'
import Link from 'next/link'
import { useErpStore } from '@/lib/store/useErpStore'
import { useTheme } from '@/lib/design/ThemeContext'
import { TopBar, PageBody, Card, SectionLabel, Btn, Mono, Dot, MetricTile, fmtBaht, fmtBahtK, fmtNum } from '@/components/ui'

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

function getLast6MonthKeys(): string[] {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
}

function getLast30Days(): string[] {
  const now = new Date()
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().slice(0, 10)
  })
}

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function monthShort(key: string) {
  const m = parseInt(key.slice(5, 7), 10) - 1
  return MONTH_SHORT[m] ?? key
}

// ── Cash Flow SVG Chart ───────────────────────────────────────────────────────

function CashFlowChart({ t, data, height = 280 }: {
  t: ReturnType<typeof useTheme>['tokens']
  data: { d: number; rev: number; exp: number }[]
  height?: number
}) {
  const c = t.color
  const w = 900, padL = 56, padR = 16, padT = 24, padB = 30
  const innerW = w - padL - padR, innerH = height - padT - padB
  const allVals = data.flatMap(d => [d.rev, d.exp]).filter(v => v > 0)
  const maxVal = allVals.length > 0 ? Math.max(...allVals) * 1.12 : 100000

  const niceStep = (() => {
    const target = maxVal / 4
    const pow = Math.pow(10, Math.floor(Math.log10(Math.max(target, 1))))
    const n = target / pow
    const m = n >= 5 ? 5 : n >= 2 ? 2 : 1
    return m * pow
  })()
  const yMax = Math.ceil(maxVal / niceStep) * niceStep
  const ticks: number[] = []
  for (let v = 0; v <= yMax; v += niceStep) ticks.push(v)

  const fmtK = (v: number) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v/1000)}K` : v

  const slot = innerW / data.length
  const barW = Math.min((slot - 4) / 2, 8)
  const yOf = (v: number) => padT + (1 - v / yMax) * innerH

  const ma = data.map((_, i) => {
    const lo = Math.max(0, i - 3), hi = Math.min(data.length - 1, i + 3)
    let s = 0, n = 0
    for (let k = lo; k <= hi; k++) { s += data[k].rev - data[k].exp; n++ }
    return s / n
  })
  const xCenter = (i: number) => padL + slot * (i + 0.5)
  const maPath = ma.map((v, i) => `${i ? 'L' : 'M'}${xCenter(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(' ')
  const peakIdx = data.reduce((best, d, i) => d.rev > data[best].rev ? i : best, 0)

  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="revBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.accent} stopOpacity={1} />
          <stop offset="100%" stopColor={c.accent} stopOpacity={0.5} />
        </linearGradient>
        <linearGradient id="expBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.expense} stopOpacity={1} />
          <stop offset="100%" stopColor={c.expense} stopOpacity={0.5} />
        </linearGradient>
      </defs>
      {ticks.map((v, i) => {
        const y = yOf(v)
        return (
          <g key={i}>
            <line x1={padL} x2={padL + innerW} y1={y} y2={y} stroke={c.border} strokeWidth={0.6} strokeDasharray={v === 0 ? 'none' : '2 5'} />
            <text x={padL - 10} y={y + 3.5} fontSize={10} fill={c.ink3} fontFamily={t.font.mono} textAnchor="end">฿{fmtK(v)}</text>
          </g>
        )
      })}
      {data.map((d, i) => {
        const cx = xCenter(i)
        const yRev = yOf(d.rev), yExp = yOf(d.exp), yZero = yOf(0)
        return (
          <g key={i}>
            {d.rev > 0 && <rect x={cx - barW - 1} y={yRev} width={barW} height={yZero - yRev} fill="url(#revBarGrad)" rx={1} />}
            {d.exp > 0 && <rect x={cx + 1} y={yExp} width={barW} height={yZero - yExp} fill="url(#expBarGrad)" rx={1} opacity={0.85} />}
          </g>
        )
      })}
      <path d={maPath} stroke={c.ink2} strokeWidth={1.25} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.45} />
      {data[peakIdx]?.rev > 0 && (() => {
        const cx = xCenter(peakIdx)
        const cy = yOf(data[peakIdx].rev)
        const lx = Math.min(cx + 10, padL + innerW - 90)
        const ly = Math.max(cy - 28, padT + 4)
        return (
          <g>
            <line x1={cx} x2={lx} y1={cy - 6} y2={ly + 14} stroke={c.ink3} strokeWidth={0.6} strokeDasharray="2 3" opacity={0.6} />
            <rect x={lx} y={ly} width={86} height={22} fill={c.surface} stroke={c.border} strokeWidth={1} rx={4} />
            <text x={lx + 8} y={ly + 14} fontSize={10} fontFamily={t.font.mono} fill={c.ink} fontWeight={600}>
              Peak {fmtBahtK(data[peakIdx].rev)}
            </text>
          </g>
        )
      })()}
      {[0, Math.floor(data.length/4), Math.floor(data.length/2), Math.floor(data.length*3/4), data.length-1].map(i => (
        <text key={i} x={xCenter(i)} y={height - 10} fontSize={10} fill={c.ink3} fontFamily={t.font.mono} textAnchor="middle">
          Day {data[i]?.d}
        </text>
      ))}
    </svg>
  )
}

// ── Channel Bar ───────────────────────────────────────────────────────────────

function ChannelBar({ t, name, rev, delta, max }: { t: ReturnType<typeof useTheme>['tokens']; name: string; rev: number; delta: number; max: number }) {
  const c = t.color
  const pct = max > 0 ? (rev / max) * 100 : 0
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 100px 70px', alignItems: 'center', gap: 14, padding: '10px 0' }}>
      <div style={{ fontSize: 13, color: c.ink, fontWeight: 500, letterSpacing: '-0.005em', fontFamily: t.font.sans }}>{name}</div>
      <div style={{ height: 8, background: c.subtle, borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: c.accent, borderRadius: 999 }} />
      </div>
      <Mono t={t} size={13} weight={500}>{fmtBaht(rev)}</Mono>
      <Mono t={t} size={11} weight={500} color={delta >= 0 ? c.pos : c.neg} style={{ textAlign: 'right' }}>
        {delta >= 0 ? '+' : '−'}{Math.abs(delta).toFixed(1)}%
      </Mono>
    </div>
  )
}

// ── Alert Row ─────────────────────────────────────────────────────────────────

function AlertRow({ t, sev, title, meta, age, divider }: {
  t: ReturnType<typeof useTheme>['tokens']
  sev: 'high' | 'med' | 'low'; title: string; meta: string; age: string; divider?: boolean
}) {
  const c = t.color
  const color = sev === 'high' ? c.neg : sev === 'med' ? c.warn : c.ink3
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: divider ? `1px solid ${c.border}` : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 76 }}>
        <Dot color={color} size={6} />
        <span style={{ fontSize: 10, color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, fontFamily: t.font.sans }}>
          {sev === 'high' ? 'Critical' : sev === 'med' ? 'Warning' : 'Notice'}
        </span>
      </div>
      <div>
        <div style={{ fontSize: 13, color: c.ink, fontWeight: 500, letterSpacing: '-0.005em', fontFamily: t.font.sans }}>{title}</div>
        <div style={{ fontSize: 12, color: c.ink3, marginTop: 2, fontFamily: t.font.sans }}>{meta}</div>
      </div>
      <Mono t={t} size={11} color={c.ink3}>{age}</Mono>
    </div>
  )
}

// ── P&L Mini Bars ─────────────────────────────────────────────────────────────

function PnlBars({ t, data }: { t: ReturnType<typeof useTheme>['tokens']; data: { month: string; rev: number; net: number }[] }) {
  const c = t.color
  const max = Math.max(...data.map(d => d.rev), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 140, padding: '10px 0 0' }}>
      {data.map(d => {
        const revH = (d.rev / max) * 110
        const netH = (d.net / max) * 110
        return (
          <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 110, width: '100%', justifyContent: 'center' }}>
              <div style={{ width: '38%', height: revH, background: c.subtle, border: `1px solid ${c.border}`, borderRadius: 2 }} />
              <div style={{ width: '38%', height: Math.max(netH, 2), background: c.accent, borderRadius: 2 }} />
            </div>
            <Mono t={t} size={10} color={c.ink3}>{d.month}</Mono>
          </div>
        )
      })}
    </div>
  )
}

// ── Dashboard Page ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { tokens: t } = useTheme()
  const c = t.color

  const salesOrders    = useErpStore(s => s.salesOrders)
  const expenses       = useErpStore(s => s.expenses)
  const invoices       = useErpStore(s => s.invoices)
  const products       = useErpStore(s => s.products)
  const purchaseReqs   = useErpStore(s => s.purchaseRequests)
  const purchaseOrders = useErpStore(s => s.purchaseOrders)
  const stockLots      = useErpStore(s => s.stockLots)

  const today        = new Date().toISOString().slice(0, 10)
  const currentMonth = today.slice(0, 7)

  // KPIs
  const todayOrders   = salesOrders.filter(o => o.date === today && o.status !== 'Cancelled')
  const todayRevenue  = todayOrders.reduce((s, o) => s + o.amount, 0)
  const monthlyRevenue = salesOrders.filter(o => o.date.startsWith(currentMonth) && o.status !== 'Cancelled').reduce((s, o) => s + o.amount, 0)
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(currentMonth)).reduce((s, e) => s + e.amount, 0)
  const monthlyProfit  = monthlyRevenue - monthlyExpenses
  const marginPct      = monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0

  // 30-day series
  const last30Days = getLast30Days()
  const series30 = last30Days.map((date, i) => ({
    d: i + 1,
    rev: salesOrders.filter(o => o.date === date && o.status !== 'Cancelled').reduce((s, o) => s + o.amount, 0),
    exp: expenses.filter(e => e.date === date).reduce((s, e) => s + e.amount, 0),
  }))
  const totalRev30 = series30.reduce((s, d) => s + d.rev, 0)
  const totalExp30 = series30.reduce((s, d) => s + d.exp, 0)
  const totalNet30 = totalRev30 - totalExp30

  // Weekly breakdown
  const weeks = Array.from({ length: 5 }, (_, w) => {
    const slice = series30.slice(w * 6, w * 6 + 6)
    return { label: `Week ${w + 1}`, rev: slice.reduce((s,d)=>s+d.rev,0), exp: slice.reduce((s,d)=>s+d.exp,0) }
  })

  // Channels from salesOrders
  const channelTotals: Record<string, number> = {}
  salesOrders.filter(o => o.status !== 'Cancelled').forEach(o => {
    const ch = o.channel || 'Other'
    channelTotals[ch] = (channelTotals[ch] ?? 0) + o.amount
  })
  const channels = Object.entries(channelTotals)
    .map(([name, rev]) => ({ name, rev, delta: 0 }))
    .sort((a, b) => b.rev - a.rev)
    .slice(0, 5)
  const maxChan = Math.max(...channels.map(c => c.rev), 1)

  // Alerts
  const nearExpiryLots  = stockLots.filter(l => l.expiryDate && l.remainingQty > 0 && daysUntil(l.expiryDate) <= 30)
  const latePOs         = purchaseOrders.filter(po => po.status !== 'Completed' && po.etaDate && daysUntil(po.etaDate) < 0)
  const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue')
  const pendingPRs      = purchaseReqs.filter(pr => pr.status === 'Pending Approval')
  const lowStockItems   = products.filter(p => p.stock === 0 && !p.isBundle)

  type AlertItem = { sev: 'high' | 'med' | 'low'; title: string; meta: string; age: string }
  const alerts: AlertItem[] = [
    ...lowStockItems.slice(0, 2).map(p => ({ sev: 'high' as const, title: `${p.name} หมดสต็อค`, meta: `${p.sku} · reorder required`, age: 'now' })),
    ...latePOs.slice(0, 2).map(po => ({ sev: 'high' as const, title: `PO ${po.id} เกิน ETA`, meta: `${po.supplier} · ${fmtBaht(po.totalCost)}`, age: `${Math.abs(daysUntil(po.etaDate!))}d` })),
    ...overdueInvoices.slice(0, 2).map(inv => ({ sev: 'med' as const, title: `Invoice ${inv.id} เกินกำหนด`, meta: `${fmtBaht(inv.amount)} ค้างชำระ`, age: '—' })),
    ...nearExpiryLots.slice(0, 2).map(lot => ({ sev: 'med' as const, title: `Lot ${lot.lot} ใกล้หมดอายุ`, meta: `${lot.sku} · ${lot.remainingQty} ชิ้น · ${daysUntil(lot.expiryDate!)} วัน`, age: `${daysUntil(lot.expiryDate!)}d` })),
    ...pendingPRs.slice(0, 2).map(pr => ({ sev: 'low' as const, title: `PR ${pr.id} รออนุมัติ`, meta: pr.items.length > 0 ? `${pr.items.length} รายการ` : '—', age: '—' })),
  ].slice(0, 6)

  // 6-month P&L
  const last6 = getLast6MonthKeys()
  const pnl6 = last6.map(month => {
    const rev = salesOrders.filter(o => o.date.startsWith(month) && o.status !== 'Cancelled').reduce((s, o) => s + o.amount, 0)
    const exp = expenses.filter(e => e.date.startsWith(month)).reduce((s, e) => s + e.amount, 0)
    const net = Math.max(rev - exp, 0)
    const mPct = rev > 0 ? (net / rev * 100) : 0
    return { month: monthShort(month), rev, net, mPct }
  })

  const latestMargin = pnl6[pnl6.length - 1]?.mPct ?? 0

  const nowDate = new Date()
  const dateStr = `${MONTH_SHORT[nowDate.getMonth()]} ${nowDate.getDate()}, ${nowDate.getFullYear()}`

  return (
    <div>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'Dashboard']}
        title={`Good morning, ${useErpStore.getState().currentUser.name.split(' ')[0]}`}
        subtitle={`${dateStr} · ภาพรวมระบบ Chawy ERP`}
        right={
          <>
            <Btn t={t} variant="ghost">Export</Btn>
            <Link href="/sales-orders">
              <Btn t={t} variant="primary">+ New Order</Btn>
            </Link>
          </>
        }
      />

      <PageBody t={t} maxWidth="none" style={{ paddingBottom: 48 }}>

        {/* KPI Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          <MetricTile t={t} primary label="Revenue · Today"  value={fmtBaht(todayRevenue)}  sub={`${todayOrders.length} orders`} />
          <MetricTile t={t} label="Revenue · MTD"   value={fmtBaht(monthlyRevenue)}  delta={null} sub={currentMonth} />
          <MetricTile t={t} label="Net Profit · MTD" value={fmtBaht(monthlyProfit)}  sub={`${marginPct.toFixed(1)}% margin`} />
          <MetricTile t={t} label="Low / Out of Stock" value={fmtNum(products.filter(p=>p.stock<=p.reorder&&!p.isBundle).length)} sub={`${products.filter(p=>p.stock===0&&!p.isBundle).length} out of stock`} />
        </div>

        {/* Cash Flow Card */}
        <Card t={t} style={{ marginBottom: 24, padding: 0 }}>
          {/* Header */}
          <div style={{ padding: '22px 24px 18px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `1px solid ${c.border}` }}>
            <div>
              <SectionLabel t={t} style={{ marginBottom: 4 }}>Cash Flow · 30 Days</SectionLabel>
              <div style={{ fontSize: 13, color: c.ink3, fontFamily: t.font.sans }}>Daily revenue vs expenses · last 30 days</div>
            </div>
          </div>

          {/* Stat tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: `1px solid ${c.border}` }}>
            {[
              { label: 'Revenue · 30D',  value: fmtBaht(totalRev30), swatch: c.accent,  sub: '30 days' },
              { label: 'Expenses · 30D', value: fmtBaht(totalExp30), swatch: c.expense, sub: totalRev30 > 0 ? `${(totalExp30/totalRev30*100).toFixed(1)}% of revenue` : '—' },
              { label: 'Net Cash Flow',  value: fmtBaht(totalNet30), swatch: null,       sub: totalRev30 > 0 ? `${(totalNet30/totalRev30*100).toFixed(1)}% margin` : '—' },
            ].map((s, i) => (
              <div key={s.label} style={{ padding: '20px 24px 22px', borderRight: i < 2 ? `1px solid ${c.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  {s.swatch && <span style={{ width: 10, height: 10, background: s.swatch, borderRadius: 2, display: 'inline-block' }} />}
                  <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3, fontFamily: t.font.sans }}>{s.label}</span>
                </div>
                <Mono t={t} size={24} weight={600} style={{ display: 'block', letterSpacing: '-0.02em' }}>{s.value}</Mono>
                <div style={{ fontSize: 11, color: c.ink3, marginTop: 8, fontFamily: t.font.sans }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Legend + Chart */}
          <div style={{ padding: '12px 16px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '4px 8px 8px 40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 16, background: c.accent, borderRadius: 2, display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: c.ink, fontWeight: 500, fontFamily: t.font.sans }}>รายรับ</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 16, background: c.expense, borderRadius: 2, display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: c.ink, fontWeight: 500, fontFamily: t.font.sans }}>รายจ่าย</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 2, background: c.ink2, opacity: 0.5, borderRadius: 2, display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: c.ink3, fontFamily: t.font.sans }}>ค่าเฉลี่ยกำไร 7 วัน</span>
              </div>
            </div>
            <CashFlowChart t={t} data={series30} />
          </div>

          {/* Weekly breakdown */}
          <div style={{ borderTop: `1px solid ${c.border}`, padding: '14px 24px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0 }}>
            {weeks.map((w, i) => (
              <div key={w.label} style={{ paddingRight: 16, borderRight: i < 4 ? `1px solid ${c.border}` : 'none', paddingLeft: i === 0 ? 0 : 16 }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.ink3, fontFamily: t.font.sans }}>{w.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                  <Mono t={t} size={14} weight={600}>{fmtBahtK(w.rev - w.exp)}</Mono>
                  <span style={{ fontSize: 10, color: c.ink3, fontFamily: t.font.sans }}>net</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Channels + Alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: channels.length > 0 ? '1.4fr 1fr' : '1fr', gap: 24, marginBottom: 24 }}>
          {channels.length > 0 && (
            <Card t={t}>
              <SectionLabel t={t} action={
                <Link href="/sales-orders" style={{ fontSize: 11, color: c.accent, textDecoration: 'none', fontFamily: t.font.sans, fontWeight: 500 }}>View all →</Link>
              }>Revenue by Channel · MTD</SectionLabel>
              {channels.map(ch => (
                <ChannelBar key={ch.name} t={t} name={ch.name} rev={ch.rev} delta={ch.delta} max={maxChan} />
              ))}
            </Card>
          )}
          {alerts.length > 0 && (
            <Card t={t}>
              <SectionLabel t={t} action={<Mono t={t} size={11} color={c.ink3}>{alerts.length} active</Mono>}>Alerts</SectionLabel>
              {alerts.map((a, i) => (
                <AlertRow key={i} t={t} sev={a.sev} title={a.title} meta={a.meta} age={a.age} divider={i > 0} />
              ))}
            </Card>
          )}
        </div>

        {/* P&L 6-month */}
        <Card t={t}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <SectionLabel t={t} style={{ marginBottom: 6 }}>Profit & Loss · 6 Months</SectionLabel>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
                <span style={{ fontSize: 11, color: c.ink3, fontFamily: t.font.sans }}>Net margin</span>
                <Mono t={t} size={20} weight={600} style={{ marginLeft: 10 }}>{latestMargin.toFixed(1)}%</Mono>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: c.subtle, border: `1px solid ${c.border}`, display: 'inline-block', borderRadius: 2 }} />
                <span style={{ fontSize: 11, color: c.ink2, fontFamily: t.font.sans }}>Revenue</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: c.accent, display: 'inline-block', borderRadius: 2 }} />
                <span style={{ fontSize: 11, color: c.ink2, fontFamily: t.font.sans }}>Net profit</span>
              </div>
              <Link href="/pl" style={{ fontSize: 11, color: c.accent, textDecoration: 'none', fontFamily: t.font.sans, fontWeight: 500 }}>Open P&L →</Link>
            </div>
          </div>
          <PnlBars t={t} data={pnl6} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${c.border}` }}>
            {pnl6.map(d => (
              <div key={d.month} style={{ textAlign: 'left' }}>
                <Mono t={t} size={13} weight={600}>{fmtBahtK(d.net)}</Mono>
                <div style={{ fontSize: 10, color: c.ink3, marginTop: 2, fontFamily: t.font.mono }}>{d.mPct.toFixed(1)}% margin</div>
              </div>
            ))}
          </div>
        </Card>

      </PageBody>
    </div>
  )
}
