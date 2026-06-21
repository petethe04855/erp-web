'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useErpStore } from '@/lib/store/useErpStore'
import { useTheme } from '@/lib/design/ThemeContext'
import { TopBar, PageBody, Card, SectionLabel, Btn, Mono, Dot, MetricTile, fmtBaht, fmtBahtK, fmtNum } from '@/components/ui'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Chart } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

function getLast6MonthKeys(year: number, month: number): string[] {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(year, month - 1 - (5 - i), 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
}

function getMonthDays(year: number, month: number): string[] {
  const days = new Date(year, month, 0).getDate()
  return Array.from({ length: days }, (_, i) => {
    const day = String(i + 1).padStart(2, '0')
    return `${year}-${String(month).padStart(2, '0')}-${day}`
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
  const labels = data.map(d => `Day ${d.d}`)

  const ma = data.map((_, i) => {
    const lo = Math.max(0, i - 3), hi = Math.min(data.length - 1, i + 3)
    let s = 0, n = 0
    for (let k = lo; k <= hi; k++) { s += data[k].rev - data[k].exp; n++ }
    return s / n
  })

  const chartData = {
    labels,
    datasets: [
      {
        type: 'line' as const,
        label: 'ค่าเฉลี่ยกำไร 7 วัน',
        borderColor: c.ink2,
        borderWidth: 1.5,
        fill: false,
        data: ma,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        type: 'bar' as const,
        label: 'รายรับ',
        backgroundColor: c.accent,
        data: data.map(d => d.rev),
        borderRadius: 2,
      },
      {
        type: 'bar' as const,
        label: 'รายจ่าย',
        backgroundColor: c.expense,
        data: data.map(d => d.exp),
        borderRadius: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: c.surface,
        titleColor: c.ink,
        bodyColor: c.ink2,
        borderColor: c.border,
        borderWidth: 1,
        titleFont: { family: t.font.sans, size: 12, weight: 'bold' as const },
        bodyFont: { family: t.font.sans, size: 12 },
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(context.parsed.y)
            }
            return label
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: c.ink3,
          font: { family: t.font.mono, size: 10 },
          maxTicksLimit: 5,
        },
      },
      y: {
        grid: {
          color: c.border,
          lineWidth: 0.6,
        },
        border: {
          dash: [2, 5],
        },
        ticks: {
          color: c.ink3,
          font: { family: t.font.mono, size: 10 },
          callback: (value: any) => {
            if (value >= 1_000_000) return `฿${(value / 1_000_000).toFixed(1)}M`
            if (value >= 1000) return `฿${Math.round(value / 1000)}K`
            return `฿${value}`
          },
        },
      },
    },
  }

  return (
    <div style={{ height, position: 'relative', width: '100%' }}>
      <Chart type="bar" data={chartData} options={options} />
    </div>
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
  const labels = data.map(d => d.month)
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenue',
        backgroundColor: c.subtle,
        borderColor: c.border,
        borderWidth: 1,
        borderRadius: 2,
        data: data.map(d => d.rev),
      },
      {
        label: 'Net profit',
        backgroundColor: c.accent,
        borderRadius: 2,
        data: data.map(d => d.net),
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: c.surface,
        titleColor: c.ink,
        bodyColor: c.ink2,
        borderColor: c.border,
        borderWidth: 1,
        titleFont: { family: t.font.sans, size: 11, weight: 'bold' as const },
        bodyFont: { family: t.font.sans, size: 11 },
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(context.parsed.y)
            }
            return label
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: c.ink3,
          font: { family: t.font.sans, size: 11 },
        },
      },
      y: {
        grid: {
          color: c.border,
          lineWidth: 0.6,
        },
        border: {
          dash: [2, 5],
        },
        ticks: {
          color: c.ink3,
          font: { family: t.font.mono, size: 10 },
          callback: (value: any) => {
            if (value >= 1_000_000) return `฿${(value / 1_000_000).toFixed(1)}M`
            if (value >= 1000) return `฿${Math.round(value / 1000)}K`
            return `฿${value}`
          },
        },
      },
    },
  }

  return (
    <div style={{ height: 140, position: 'relative', marginTop: 10 }}>
      <Bar data={chartData} options={options} />
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
  const currentUser    = useErpStore(s => s.currentUser)

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const periodKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
  const periodLabel = new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' })
    .format(new Date(selectedYear, selectedMonth - 1, 1))

  // KPIs
  const periodOrders = salesOrders.filter(o => o.date.startsWith(periodKey) && o.status !== 'Cancelled')
  const monthlyRevenue = periodOrders.reduce((s, o) => s + o.amount, 0)
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(periodKey)).reduce((s, e) => s + e.amount, 0)
  const monthlyProfit  = monthlyRevenue - monthlyExpenses
  const marginPct      = monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0

  // Selected-month daily series
  const periodDays = getMonthDays(selectedYear, selectedMonth)
  const series30 = periodDays.map((date, i) => ({
    d: i + 1,
    rev: salesOrders.filter(o => o.date === date && o.status !== 'Cancelled').reduce((s, o) => s + o.amount, 0),
    exp: expenses.filter(e => e.date === date).reduce((s, e) => s + e.amount, 0),
  }))
  const totalRev30 = series30.reduce((s, d) => s + d.rev, 0)
  const totalExp30 = series30.reduce((s, d) => s + d.exp, 0)
  const totalNet30 = totalRev30 - totalExp30

  // Weekly breakdown
  const weeks = Array.from({ length: Math.ceil(series30.length / 7) }, (_, w) => {
    const slice = series30.slice(w * 7, w * 7 + 7)
    return { label: `Week ${w + 1}`, rev: slice.reduce((s,d)=>s+d.rev,0), exp: slice.reduce((s,d)=>s+d.exp,0) }
  })

  // Channels from salesOrders
  const channelTotals: Record<string, number> = {}
  periodOrders.forEach(o => {
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
  const last6 = getLast6MonthKeys(selectedYear, selectedMonth)
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

  function handleExport() {
    const csvContent = [
      ['Date', 'Day', 'Revenue (THB)', 'Expenses (THB)', 'Net Profit (THB)'],
      ...series30.map((item, i) => [
        periodDays[i],
        item.d,
        item.rev,
        item.exp,
        item.rev - item.exp
      ])
    ]
      .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `dashboard-cashflow-${periodKey}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'Dashboard']}
        title={`Good morning, ${(currentUser?.name || 'Guest').split(' ')[0]}`}
        subtitle={`${dateStr} · ภาพรวมระบบ Chawy ERP`}
        right={
          <>
            <Btn t={t} variant="ghost" onClick={handleExport}>Export</Btn>
            <Link href="/sales-orders">
              <Btn t={t} variant="primary">+ New Order</Btn>
            </Link>
          </>
        }
      />

      <PageBody t={t} maxWidth="none" style={{ paddingBottom: 48 }}>

        <Card t={t} style={{ marginBottom: 16, padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: c.ink }}>ค้นหาข้อมูลตามช่วงเวลา</div>
              <div style={{ fontSize: 11, color: c.ink3, marginTop: 3 }}>กำลังแสดงข้อมูลเดือน {periodLabel}</div>
            </div>
            <label style={{ display: 'grid', gap: 5, fontSize: 11, color: c.ink3 }}>
              เดือน
              <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} style={{ minWidth: 140, padding: '8px 10px', border: `1px solid ${c.border}`, borderRadius: t.radius, background: c.surface, color: c.ink }}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Intl.DateTimeFormat('th-TH', { month: 'long' }).format(new Date(2026, i, 1))}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: 'grid', gap: 5, fontSize: 11, color: c.ink3 }}>
              ปี
              <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{ minWidth: 110, padding: '8px 10px', border: `1px solid ${c.border}`, borderRadius: t.radius, background: c.surface, color: c.ink }}>
                {Array.from({ length: 7 }, (_, i) => now.getFullYear() - 5 + i).map(year => (
                  <option key={year} value={year}>{year + 543}</option>
                ))}
              </select>
            </label>
            <Btn t={t} variant="ghost" onClick={() => { setSelectedMonth(now.getMonth() + 1); setSelectedYear(now.getFullYear()) }}>
              เดือนปัจจุบัน
            </Btn>
          </div>
        </Card>

        {/* KPI Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          <MetricTile t={t} primary label="Orders · Selected Month" value={fmtNum(periodOrders.length)} sub={periodLabel} />
          <MetricTile t={t} label="Revenue · Selected Month" value={fmtBaht(monthlyRevenue)} delta={null} sub={periodKey} />
          <MetricTile t={t} label="Net Profit · Selected Month" value={fmtBaht(monthlyProfit)} sub={`${marginPct.toFixed(1)}% margin`} />
          <MetricTile t={t} label="Low / Out of Stock" value={fmtNum(products.filter(p=>p.stock<=p.reorder&&!p.isBundle).length)} sub={`${products.filter(p=>p.stock===0&&!p.isBundle).length} out of stock`} />
        </div>

        {/* Cash Flow Card */}
        <Card t={t} style={{ marginBottom: 24, padding: 0 }}>
          {/* Header */}
          <div style={{ padding: '22px 24px 18px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `1px solid ${c.border}` }}>
            <div>
              <SectionLabel t={t} style={{ marginBottom: 4 }}>Cash Flow · {periodLabel}</SectionLabel>
              <div style={{ fontSize: 13, color: c.ink3, fontFamily: t.font.sans }}>รายรับและรายจ่ายรายวันของเดือนที่เลือก</div>
            </div>
          </div>

          {/* Stat tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: `1px solid ${c.border}` }}>
            {[
              { label: 'Revenue · Period',  value: fmtBaht(totalRev30), swatch: c.accent,  sub: `${periodDays.length} days` },
              { label: 'Expenses · Period', value: fmtBaht(totalExp30), swatch: c.expense, sub: totalRev30 > 0 ? `${(totalExp30/totalRev30*100).toFixed(1)}% of revenue` : '—' },
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
          <div style={{ borderTop: `1px solid ${c.border}`, padding: '14px 24px', display: 'grid', gridTemplateColumns: `repeat(${weeks.length}, 1fr)`, gap: 0 }}>
            {weeks.map((w, i) => (
              <div key={w.label} style={{ paddingRight: 16, borderRight: i < weeks.length - 1 ? `1px solid ${c.border}` : 'none', paddingLeft: i === 0 ? 0 : 16 }}>
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
              }>Revenue by Channel · {periodLabel}</SectionLabel>
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
              <SectionLabel t={t} style={{ marginBottom: 6 }}>Profit & Loss · 6 Months ending {periodLabel}</SectionLabel>
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
