'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/design/ThemeContext'
import { Btn, Card, Mono, StatusPill, TopBar, fmtBaht, fmtNum } from '@/components/ui'
import { useErpStore } from '@/lib/store/useErpStore'
import type { SalesOrderStatus } from '@/lib/store/erpWorkflow'
import { exportXlsx } from '@/lib/utils/exportUtil'

// Import Sub-Components
import SalesOrderStats from './components/SalesOrderStats'
import SOActions from './components/SOActions'
import SalesOrderFormPanel from './components/SalesOrderFormPanel'

const FILTERS: Array<{ key: 'all' | SalesOrderStatus; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Processing', label: 'Processing' },
  { key: 'Completed', label: 'Completed' },
  { key: 'Cancelled', label: 'Cancelled' },
]

type Line = { sku: string; qty: number }
const BLANK = { customer: '', date: new Date().toISOString().split('T')[0], channel: 'Manual', qtRef: '', lines: [{ sku: '', qty: 1 }] as Line[] }

function formatDateShort(date: string) {
  const d = new Date(date)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  if (Number.isNaN(d.getTime())) return date
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`
}

export default function SalesOrdersPage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const salesOrders = useErpStore(state => state.salesOrders)
  const invoices = useErpStore(state => state.invoices)
  const products = useErpStore(state => state.products)
  const createSalesOrder = useErpStore(state => state.createSalesOrder)
  const createInvoiceFromSO = useErpStore(state => state.createInvoiceFromSO)
  const updateSalesOrderStatus = useErpStore(state => state.updateSalesOrderStatus)
  
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [filter, setFilter] = useState<'all' | SalesOrderStatus>('all')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  const filtered = salesOrders.filter(order => {
    if (filter !== 'all' && order.status !== filter) return false
    if (search && !(order.id.toLowerCase().includes(search.toLowerCase()) || order.customer.toLowerCase().includes(search.toLowerCase()))) return false
    return true
  })
  
  const totalAmount = filtered.reduce((s, order) => s + order.amount, 0)
  const counts = FILTERS.reduce<Record<string, number>>((acc, item) => {
    acc[item.key] = item.key === 'all' ? salesOrders.length : salesOrders.filter(order => order.status === item.key).length
    return acc
  }, {})
  
  const lineTotal = form.lines.reduce((s, line) => {
    const product = products.find(p => p.sku === line.sku)
    return s + (product ? product.price * line.qty : 0)
  }, 0)

  const itemsShipped = filtered.reduce((s, order) => s + order.items, 0)
  const largestOrder = Math.max(...(filtered.length ? filtered.map(order => order.amount) : [0]))

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function handleSubmit() {
    if (!form.customer) return
    const validLines = form.lines.filter(line => line.sku)
    createSalesOrder({
      customer: form.customer,
      date: form.date,
      amount: lineTotal || 0,
      status: 'Pending',
      channel: form.channel as 'Manual' | 'LINE' | 'Shopee' | 'TikTok',
      items: validLines.length || 1,
      qtRef: form.qtRef || null,
      lines: validLines,
    })
    setForm(BLANK)
    setOpen(false)
    showToast('สร้าง Sales Order แล้ว')
  }

  function handleCreateInvoice(soId: string) {
    try {
      const inv = createInvoiceFromSO(soId)
      showToast(inv ? `สร้าง ${inv.id} แล้ว` : 'สร้าง Invoice ไม่ได้')
    } catch (err: any) {
      showToast(err.message || 'เกิดข้อผิดพลาดในการสร้าง Invoice')
    }
  }

  async function handleExport() {
    try {
      await exportXlsx('sales-orders', `sales-orders-export-${new Date().toISOString().slice(0, 10)}.xlsx`)
      showToast('Export สำเร็จ')
    } catch (err: any) {
      showToast('Export ล้มเหลว: ' + err.message)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'Sales', 'Orders']}
        title="Sales Orders"
        subtitle={`${salesOrders.length} orders · ${fmtBaht(salesOrders.reduce((s, order) => s + order.amount, 0))} total`}
        right={
          <>
            {toast && <span style={{ fontSize: 12, color: c.pos, fontWeight: 600 }}>{toast}</span>}
            <Btn t={t} variant="ghost" onClick={handleExport}>Export CSV</Btn>
            <Btn t={t} variant="primary" onClick={() => setOpen(true)}>+ New Order</Btn>
          </>
        }
      />

      <div style={{ padding: '24px 32px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 16 }}>
          <div style={{ display: 'flex', gap: 0, border: `1px solid ${c.border}`, borderRadius: t.radius, overflow: 'hidden', background: c.surface }}>
            {FILTERS.map((item, i) => (
              <button key={item.key} onClick={() => setFilter(item.key)} style={{
                padding: '7px 14px',
                background: filter === item.key ? c.subtle : 'transparent',
                color: filter === item.key ? c.ink : c.ink2,
                border: 'none',
                borderLeft: i === 0 ? 'none' : `1px solid ${c.border}`,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: filter === item.key ? 600 : 500,
                fontFamily: t.font.sans,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                letterSpacing: '-0.005em',
              }}>
                {item.label}
                <span style={{
                  fontFamily: t.font.mono,
                  fontSize: 10,
                  color: filter === item.key ? c.ink2 : c.ink3,
                  background: filter === item.key ? c.surface : c.subtle,
                  padding: '1px 6px',
                  borderRadius: 4,
                }}>{counts[item.key]}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา order หรือ ลูกค้า..." style={{
              padding: '7px 12px',
              fontSize: 12,
              fontFamily: t.font.sans,
              background: c.surface,
              color: c.ink,
              border: `1px solid ${c.border}`,
              borderRadius: t.radius,
              width: 240,
              outline: 'none',
            }} />
            <Btn t={t} variant="ghost">Filters</Btn>
          </div>
        </div>

        {/* Stats Row */}
        <SalesOrderStats 
          t={t}
          totalAmount={totalAmount}
          filteredCount={filtered.length}
          itemCount={itemsShipped}
          largestAmount={largestOrder}
        />

        <Card t={t} pad={false} style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 980, borderCollapse: 'collapse', fontFamily: t.font.sans }}>
            <thead>
              <tr>
                {['Order', 'Customer', 'Channel', 'Date', 'Items', 'Amount', 'Status', 'Action'].map((h, i) => (
                  <th key={h} style={{
                    textAlign: i === 4 || i === 5 || i === 7 ? 'right' : 'left',
                    padding: '11px 22px',
                    fontSize: 10,
                    fontWeight: 500,
                    color: c.ink3,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    borderBottom: `1px solid ${c.border}`,
                    background: c.canvas,
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => {
                const hasInv = invoices.some(inv => inv.soRef === order.id)
                return (
                  <tr key={order.id} onMouseEnter={e => e.currentTarget.style.background = c.subtle} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 22px', borderBottom: i < filtered.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                      <Mono t={t} size={12} weight={500}>{order.id}</Mono>
                    </td>
                    <td style={{ padding: '14px 22px', borderBottom: i < filtered.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: c.ink, letterSpacing: '-0.005em' }}>{order.customer}</div>
                    </td>
                    <td style={{ padding: '14px 22px', borderBottom: i < filtered.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                      <span style={{ fontSize: 12, color: c.ink2 }}>{order.channel}</span>
                    </td>
                    <td style={{ padding: '14px 22px', borderBottom: i < filtered.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                      <Mono t={t} size={12} color={c.ink2}>{formatDateShort(order.date)}</Mono>
                    </td>
                    <td style={{ padding: '14px 22px', borderBottom: i < filtered.length - 1 ? `1px solid ${c.border}` : 'none', textAlign: 'right' }}>
                      <Mono t={t} size={12} color={c.ink2}>{order.items}</Mono>
                    </td>
                    <td style={{ padding: '14px 22px', borderBottom: i < filtered.length - 1 ? `1px solid ${c.border}` : 'none', textAlign: 'right' }}>
                      <Mono t={t} size={13} weight={600}>{fmtBaht(order.amount)}</Mono>
                    </td>
                    <td style={{ padding: '14px 22px', borderBottom: i < filtered.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                      <StatusPill t={t} status={order.status} />
                    </td>
                    <td style={{ padding: '14px 22px', borderBottom: i < filtered.length - 1 ? `1px solid ${c.border}` : 'none', textAlign: 'right', minWidth: 170 }}>
                      <SOActions
                        status={order.status}
                        hasInv={hasInv}
                        onStatus={status => updateSalesOrderStatus(order.id, status)}
                        onInvoice={() => handleCreateInvoice(order.id)}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ padding: 60, textAlign: 'center', color: c.ink3, fontSize: 13 }}>ไม่พบ order ที่ตรงกับเงื่อนไข</div>}
        </Card>
      </div>

      <SalesOrderFormPanel
        t={t}
        open={open}
        onClose={() => setOpen(false)}
        form={form}
        setForm={setForm}
        products={products}
        lineTotal={lineTotal}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
