'use client'

import React, { useMemo, useState } from 'react'
import { useTheme } from '@/lib/design/ThemeContext'
import { Btn, Card, Dot, Mono, SectionLabel, StatusPill, TopBar, fmtNum } from '@/components/ui'
import SlidePanel from '@/components/SlidePanel'
import { useErpStore } from '@/lib/store/useErpStore'
import type { Invoice } from '@/lib/store/erpWorkflow'
import { exportXlsx } from '@/lib/utils/exportUtil'

function fmtBaht(n: number, dec = 0): string {
  const sign = n < 0 ? '−' : ''
  const v = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
  return `${sign}${v}`
}

const today = new Date().toISOString().split('T')[0]
const due14 = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
const BLANK = { soRef: '', customer: '', issueDate: today, dueDate: due14, amount: 0 }

function formatDate(date: string) {
  const d = new Date(date)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  if (Number.isNaN(d.getTime())) return date
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function daysBetween(from: string, to: string) {
  const a = new Date(from).getTime()
  const b = new Date(to).getTime()
  if (Number.isNaN(a) || Number.isNaN(b)) return 14
  return Math.max(0, Math.round((b - a) / 86400000))
}

function enrichStatus(inv: Invoice): Invoice {
  if (inv.status === 'Unpaid' && inv.dueDate < today) return { ...inv, status: 'Overdue' }
  return inv
}

export default function InvoicePage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const invoices = useErpStore(state => state.invoices)
  const salesOrders = useErpStore(state => state.salesOrders)
  const products = useErpStore(state => state.products)
  const createInvoice = useErpStore(state => state.createInvoice)
  const recordPayment = useErpStore(state => state.recordPayment)
  const settings = useErpStore(state => state.settings)

  const processedList = useMemo(() => invoices.map(enrichStatus), [invoices])
  const [selectedId, setSelectedId] = useState(processedList.find(i => i.status !== 'Paid')?.id ?? processedList[0]?.id ?? '')
  const selected = processedList.find(i => i.id === selectedId) ?? processedList[0]

  const [createOpen, setCreateOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  const [payAmount, setPayAmount] = useState(0)
  const [form, setForm] = useState(BLANK)
  const [toast, setToast] = useState('')

  const salesOrder = selected ? salesOrders.find(so => so.id === selected.soRef) : null
  const eligibleSOs = salesOrders.filter(so => so.status === 'Completed' && !invoices.some(inv => inv.soRef === so.id))

  const vatRate = settings.company.vatRate || 7

  const lines = useMemo(() => {
    if (!selected) return []
    if (salesOrder?.lines.length) {
      const subtotalQty = salesOrder.lines.reduce((s, line) => s + line.qty, 0) || 1
      return salesOrder.lines.map(line => {
        const product = products.find(p => p.sku === line.sku)
        const amount = Math.round(selected.amount * (line.qty / subtotalQty))
        const price = line.qty > 0 ? Math.round(amount / line.qty) : amount
        return {
          sku: line.sku,
          name: product?.name ?? line.sku,
          qty: line.qty,
          price: product?.wholesalePrice ?? product?.price ?? price,
          amount,
        }
      })
    }
    return [{
      sku: selected.soRef || selected.id,
      name: `Invoice amount — ${selected.customer}`,
      qty: 1,
      price: selected.amount,
      amount: selected.amount,
    }]
  }, [products, salesOrder, selected])

  const subtotal = lines.reduce((s, l) => s + l.amount, 0)
  const vat = Math.round(subtotal * vatRate / 100)
  const totalDue = subtotal + vat

  if (!selected) {
    return (
      <div style={{ minHeight: '100vh', background: c.canvas, width: '100%' }}>
        <TopBar
          t={t}
          title="Invoice"
          subtitle="ใบแจ้งหนี้"
          right={<Btn t={t} variant="accent" onClick={() => setCreateOpen(true)}>+ สร้างใบแจ้งหนี้</Btn>}
        />
        <div style={{ padding: '24px 32px 48px' }}>
          <Card t={t} style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: c.ink }}>ยังไม่มีใบแจ้งหนี้ (No Invoices)</h3>
            <p style={{ fontSize: 13, color: c.ink3, marginTop: 8, marginBottom: 20 }}>คุณสามารถสร้างใบแจ้งหนี้ใหม่ได้โดยคลิกปุ่มด้านล่าง</p>
            <Btn t={t} variant="accent" onClick={() => setCreateOpen(true)}>+ สร้างใบแจ้งหนี้แรก</Btn>
          </Card>
        </div>

        <SlidePanel open={createOpen} onClose={() => setCreateOpen(false)} title="สร้างใบแจ้งหนี้" subtitle="กรอกข้อมูลใบแจ้งหนี้ใหม่"
          footer={
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setCreateOpen(false)} style={{ padding: '9px 20px', border: `1px solid ${c.border}`, borderRadius: 7, background: c.surface, cursor: 'pointer', fontSize: 13, color: c.ink2 }}>ยกเลิก</button>
              <button onClick={handleCreate} style={{ padding: '9px 20px', border: 'none', borderRadius: 7, background: c.accent, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>บันทึกใบแจ้งหนี้</button>
            </div>
          }
        >
          <div style={{ display: 'grid', gap: 16 }}>
            <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
              Sales Order อ้างอิง
              <select value={form.soRef} onChange={e => onSoSelect(e.target.value)} style={panelInput(c.surface, c.border, c.ink)}>
                <option value="">-- เลือก SO หรือสร้าง Manual invoice --</option>
                {eligibleSOs.map(so => (
                  <option key={so.id} value={so.id}>{so.id} — {so.customer} ({fmtBaht(so.amount)})</option>
                ))}
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
              ลูกค้า *
              <input value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} style={panelInput(c.surface, c.border, c.ink)} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
                วันที่ออกใบ
                <input type="date" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} style={panelInput(c.surface, c.border, c.ink)} />
              </label>
              <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
                ครบกำหนดชำระ
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={panelInput(c.surface, c.border, c.ink)} />
              </label>
            </div>
            <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
              มูลค่า (บาท) *
              <input type="number" min={0} value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} style={panelInput(c.surface, c.border, c.ink)} />
            </label>
          </div>
        </SlidePanel>
      </div>
    )
  }

  const outstanding = selected.amount - selected.paid
  const terms = daysBetween(selected.issueDate, selected.dueDate)
  const customerInvoices = processedList.filter(inv => inv.customer === selected.customer)
  const customerRevenue = customerInvoices.reduce((s, inv) => s + inv.amount, 0)
  const openInvoices = customerInvoices.filter(inv => inv.status !== 'Paid').length

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function onSoSelect(soId: string) {
    const so = salesOrders.find(s => s.id === soId)
    if (so) setForm(f => ({ ...f, soRef: soId, customer: so.customer, amount: so.amount }))
    else setForm(f => ({ ...f, soRef: soId }))
  }

  function handleCreate() {
    if (!form.customer || !form.amount) return
    if (form.dueDate < form.issueDate) {
      showToast('วันครบกำหนดต้อง >= วันที่ออก')
      return
    }
    if (form.soRef && invoices.some(inv => inv.soRef === form.soRef)) {
      showToast('มี Invoice จาก SO นี้แล้ว')
      return
    }
    const inv = createInvoice({
      soRef: form.soRef || undefined,
      customer: form.customer,
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      amount: form.amount,
    })
    setSelectedId(inv.id)
    setForm(BLANK)
    setCreateOpen(false)
    showToast(`สร้าง ${inv.id} แล้ว`)
  }

  function openPayment() {
    setPayAmount(outstanding)
    setPayOpen(true)
  }

  function handlePayment() {
    if (payAmount <= 0) return
    const updated = recordPayment(selected.id, payAmount)
    setPayOpen(false)
    if (updated) {
      setSelectedId(updated.id)
      showToast(`${updated.id} → ${updated.status === 'Paid' ? 'ชำระครบ' : 'ชำระบางส่วน'}`)
    }
  }

  async function handleExport() {
    try {
      await exportXlsx('invoices', `invoices-export-${new Date().toISOString().slice(0, 10)}.xlsx`)
      showToast('Export สำเร็จ')
    } catch (err: any) {
      showToast('Export ล้มเหลว: ' + err.message)
    }
  }

  async function handleDownloadPdf() {
    if (!selected) return
    try {
      showToast('กำลังเตรียมไฟล์ PDF...')
      const html2pdf = (await import('html2pdf.js')).default

      // Temporarily show print company details programmatically
      const companyDetails = document.querySelectorAll('.print-company-detail') as NodeListOf<HTMLElement>
      companyDetails.forEach(el => {
        el.style.setProperty('display', 'block', 'important')
      })

      const element = document.querySelector('.invoice-card') as HTMLElement
      if (!element) {
        showToast('ไม่พบข้อมูล Invoice Card')
        return
      }

      const opt = {
        margin:       10,
        filename:     `${selected.id}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      }

      await html2pdf().set(opt).from(element).save()
      showToast('ดาวน์โหลด PDF สำเร็จ')
    } catch (err: any) {
      console.error(err)
      showToast('ดาวน์โหลด PDF ล้มเหลว')
    } finally {
      // Restore company details display to default (hidden on screen)
      const companyDetails = document.querySelectorAll('.print-company-detail') as NodeListOf<HTMLElement>
      companyDetails.forEach(el => {
        el.style.removeProperty('display')
      })
    }
  }

  const actionRight = (
    <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {toast && <span style={{ fontSize: 12, color: c.pos, fontWeight: 600 }}>{toast}</span>}
      <Btn t={t} variant="ghost" onClick={handleExport}>Export CSV</Btn>
      <Btn t={t} variant="ghost" onClick={() => window.print()}>Print</Btn>
      <Btn t={t} variant="ghost" onClick={handleDownloadPdf}>Download PDF</Btn>
      <Btn t={t} variant="ghost">Send to customer</Btn>
      <Btn t={t} variant="primary" onClick={openPayment}>Record payment</Btn>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <div className="no-print">
        <TopBar
          t={t}
          breadcrumb={['Chawy', 'Sales', 'Invoices', selected.id]}
          title={selected.id}
          subtitle={
            <span>
              Reference <Mono t={t} size={13} color={c.accent}>{selected.soRef}</Mono>
              {' · '}{selected.customer}
            </span>
          }
          right={actionRight}
        />
      </div>

      <div className="invoice-page-grid" style={{
        padding: '24px 32px 48px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 320px',
        gap: 24,
        alignItems: 'flex-start',
      }}>
        <div>
          <div className="invoice-card">
            <Card t={t} pad={false}>
            <div style={{ padding: '28px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: c.ink, marginBottom: 4 }}>{settings.company.name}</div>
                <div className="print-company-detail" style={{ display: 'none' }}>
                  <div style={{ fontSize: 12, color: c.ink2, lineHeight: 1.6, marginBottom: 4 }}>{settings.company.address}</div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: c.ink3 }}>
                    <span>Tax ID <Mono t={t} size={11} color={c.ink2}>{settings.company.taxId}</Mono></span>
                    <span>·</span>
                    <span>{settings.company.phone}</span>
                    <span>·</span>
                    <span>{settings.company.email}</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3, marginTop: 8 }}>Invoice</div>
                <Mono t={t} size={24} weight={600} style={{ display: 'block', marginTop: 6 }}>{selected.id}</Mono>
              </div>
              <div style={{ textAlign: 'right' }}>
                <StatusPill t={t} status={selected.status} />
                <Mono t={t} size={11} color={c.ink3} style={{ display: 'block', marginTop: 6 }}>
                  Issued {formatDate(selected.issueDate)}
                </Mono>
              </div>
            </div>

            <div style={{
              padding: '28px 32px',
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 1fr',
              gap: 32,
              borderBottom: `1px solid ${c.border}`,
            }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3, marginBottom: 8 }}>Bill to</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.ink, letterSpacing: '-0.005em' }}>{selected.customer}</div>
                <div style={{ fontSize: 12, color: c.ink2, marginTop: 4, lineHeight: 1.6 }}>
                  Customer record from ERP invoice ledger
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, color: c.ink3 }}>
                  <span>SO <Mono t={t} size={11} color={c.ink2}>{selected.soRef}</Mono></span>
                  <span>·</span>
                  <span>{salesOrder?.channel ?? 'Manual'} channel</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3, marginBottom: 8 }}>Due date</div>
                <Mono t={t} size={14} weight={500}>{formatDate(selected.dueDate)}</Mono>
                <div style={{ fontSize: 11, color: c.ink3, marginTop: 4 }}>Net {terms} · {terms} days from issue</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3, marginBottom: 8 }}>Amount due</div>
                <Mono t={t} size={20} weight={600}>{fmtBaht(outstanding)}</Mono>
                <div style={{ fontSize: 11, color: c.ink3, marginTop: 4 }}>
                  {selected.paid > 0 ? `${fmtBaht(selected.paid)} paid` : 'awaiting payment'}
                </div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font.sans }}>
              <thead>
                <tr>
                  {[
                    { label: 'SKU', w: 130 },
                    { label: 'Description', w: 'auto' },
                    { label: 'Qty', w: 80, right: true },
                    { label: 'Unit price (THB)', w: 120, right: true },
                    { label: 'Amount (THB)', w: 130, right: true },
                  ].map(h => (
                    <th key={h.label} style={{
                      textAlign: h.right ? 'right' : 'left',
                      padding: '14px 32px',
                      fontSize: 10,
                      fontWeight: 500,
                      color: c.ink3,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                      borderBottom: `1px solid ${c.border}`,
                      whiteSpace: 'nowrap',
                      width: h.w,
                    }}>{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map(line => (
                  <tr key={line.sku}>
                    <td style={{ padding: '14px 32px', borderBottom: `1px solid ${c.border}` }}>
                      <Mono t={t} size={12} weight={500}>{line.sku}</Mono>
                    </td>
                    <td style={{ padding: '14px 32px', borderBottom: `1px solid ${c.border}` }}>
                      <span style={{ fontSize: 13, color: c.ink, letterSpacing: '-0.005em' }}>{line.name}</span>
                    </td>
                    <td style={{ padding: '14px 32px', borderBottom: `1px solid ${c.border}`, textAlign: 'right' }}>
                      <Mono t={t} size={12} color={c.ink2}>{fmtNum(line.qty)}</Mono>
                    </td>
                    <td style={{ padding: '14px 32px', borderBottom: `1px solid ${c.border}`, textAlign: 'right' }}>
                      <Mono t={t} size={12} color={c.ink2}>{fmtNum(line.price)}</Mono>
                    </td>
                    <td style={{ padding: '14px 32px', borderBottom: `1px solid ${c.border}`, textAlign: 'right' }}>
                      <Mono t={t} size={13} weight={500}>{fmtNum(line.amount)}</Mono>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── Totals ── */}
            <div style={{ padding: '20px 32px 28px', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Subtotal',   val: subtotal,  color: c.ink2, weight: 500 },
                  { label: `VAT (${vatRate}%)`, val: vat, color: c.ink2, weight: 500 },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: c.ink3 }}>{r.label}</span>
                    <Mono t={t} size={13} weight={r.weight} color={r.color}>{fmtBaht(r.val)}</Mono>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>Total due</span>
                  <Mono t={t} size={22} weight={600}>{fmtBaht(totalDue)}</Mono>
                </div>
              </div>
            </div>

          </Card>
          </div>

          <div className="no-print" style={{ marginTop: 24 }}>
            <SectionLabel t={t}>Activity</SectionLabel>
            <Card t={t}>
              {(selected.auditTrail.length ? selected.auditTrail : [{ action: 'Created', by: 'System', at: selected.issueDate, note: 'สร้างใบแจ้งหนี้' }]).map((event, i, arr) => (
                <div key={`${event.action}-${event.at}-${i}`} style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  alignItems: 'baseline',
                  gap: 16,
                  padding: '12px 0',
                  borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none',
                }}>
                  <Dot color={i === 0 ? c.accent : c.ink4} />
                  <div>
                    <div style={{ fontSize: 13, color: c.ink, letterSpacing: '-0.005em' }}>
                      <span style={{ fontWeight: 600 }}>{event.by}</span>
                      <span style={{ color: c.ink2 }}> {event.action}</span>
                    </div>
                    {event.note && <div style={{ fontSize: 12, color: c.ink3, marginTop: 2 }}>{event.note}</div>}
                  </div>
                  <Mono t={t} size={11} color={c.ink3}>{event.at}</Mono>
                </div>
              ))}
            </Card>
          </div>

          <div className="no-print" style={{ marginTop: 24 }}>
            <SectionLabel t={t} action={<Btn t={t} variant="ghost" onClick={() => setCreateOpen(true)}>Create invoice</Btn>}>Invoice ledger</SectionLabel>
            <Card t={t} pad={false} style={{ overflow: 'hidden' }}>
              {processedList.slice(0, 6).map(inv => {
                const active = inv.id === selected.id
                return (
                  <button key={inv.id} type="button" onClick={() => setSelectedId(inv.id)} style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '140px 1fr 120px 110px',
                    gap: 16,
                    alignItems: 'center',
                    padding: '12px 16px',
                    border: 'none',
                    borderBottom: `1px solid ${c.border}`,
                    background: active ? c.accentBg : c.surface,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: t.font.sans,
                  }}>
                    <Mono t={t} size={12} weight={600} color={active ? c.accent : c.ink}>{inv.id}</Mono>
                    <span style={{ fontSize: 13, color: c.ink2 }}>{inv.customer}</span>
                    <Mono t={t} size={12} weight={500}>{fmtBaht(inv.amount - inv.paid)}</Mono>
                    <StatusPill t={t} status={inv.status} />
                  </button>
                )
              })}
            </Card>
          </div>
        </div>

        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 120 }}>
          <Card t={t}>
            <SectionLabel t={t}>Payment</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <Mono t={t} size={26} weight={600} style={{ display: 'block' }}>{fmtBaht(outstanding)}</Mono>
                <div style={{ fontSize: 11, color: c.ink3, marginTop: 4 }}>Due in {terms} days · {formatDate(selected.dueDate)}</div>
              </div>
              <div style={{ height: 1, background: c.border }} />
              {[
                { label: 'Outstanding', val: outstanding },
                { label: 'Paid', val: selected.paid },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: c.ink3 }}>{row.label}</span>
                  <Mono t={t} size={12} weight={500}>{fmtBaht(row.val)}</Mono>
                </div>
              ))}
              <Btn t={t} variant="accent" onClick={openPayment} style={{ padding: '9px 14px', fontSize: 13, marginTop: 4 }}>Record payment</Btn>
            </div>
          </Card>

          <Card t={t}>
            <SectionLabel t={t}>Customer summary</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Lifetime revenue', value: fmtBaht(customerRevenue) },
                { label: 'Open invoices', value: String(openInvoices) },
                { label: 'Avg. payment terms', value: `${terms}.0 days` },
                { label: 'Credit limit', value: fmtBaht(Math.max(500000, customerRevenue)) },
                { label: 'Credit used', value: fmtBaht(customerInvoices.reduce((s, inv) => s + Math.max(0, inv.amount - inv.paid), 0)) },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12, color: c.ink3 }}>{row.label}</span>
                  <Mono t={t} size={12} weight={500}>{row.value}</Mono>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <SlidePanel open={createOpen} onClose={() => setCreateOpen(false)} title="สร้างใบแจ้งหนี้" subtitle="กรอกข้อมูลใบแจ้งหนี้ใหม่"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setCreateOpen(false)} style={{ padding: '9px 20px', border: `1px solid ${c.border}`, borderRadius: 7, background: c.surface, cursor: 'pointer', fontSize: 13, color: c.ink2 }}>ยกเลิก</button>
            <button onClick={handleCreate} style={{ padding: '9px 20px', border: 'none', borderRadius: 7, background: c.accent, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>บันทึกใบแจ้งหนี้</button>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
            Sales Order อ้างอิง
            <select value={form.soRef} onChange={e => onSoSelect(e.target.value)} style={panelInput(c.surface, c.border, c.ink)}>
              <option value="">-- เลือก SO หรือสร้าง Manual invoice --</option>
              {eligibleSOs.map(so => (
                <option key={so.id} value={so.id}>{so.id} — {so.customer} ({fmtBaht(so.amount)})</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
            ลูกค้า *
            <input value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} style={panelInput(c.surface, c.border, c.ink)} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
              วันที่ออกใบ
              <input type="date" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} style={panelInput(c.surface, c.border, c.ink)} />
            </label>
            <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
              ครบกำหนดชำระ
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={panelInput(c.surface, c.border, c.ink)} />
            </label>
          </div>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
            มูลค่า (บาท) *
            <input type="number" min={0} value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} style={panelInput(c.surface, c.border, c.ink)} />
          </label>
        </div>
      </SlidePanel>

      <SlidePanel open={payOpen} onClose={() => setPayOpen(false)} title="บันทึกการรับชำระ" subtitle={selected.id}
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setPayOpen(false)} style={{ padding: '9px 20px', border: `1px solid ${c.border}`, borderRadius: 7, background: c.surface, cursor: 'pointer', fontSize: 13, color: c.ink2 }}>ยกเลิก</button>
            <button onClick={handlePayment} style={{ padding: '9px 20px', border: 'none', borderRadius: 7, background: c.pos, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>บันทึกการชำระ</button>
          </div>
        }
      >
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
          จำนวนเงินที่รับชำระ (บาท)
          <input type="number" min={0} value={payAmount || ''} onChange={e => setPayAmount(parseFloat(e.target.value) || 0)} style={panelInput(c.surface, c.border, c.ink)} />
        </label>
      </SlidePanel>
    </div>
  )
}

function panelInput(surface: string, border: string, ink: string): React.CSSProperties {
  return {
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${border}`,
    borderRadius: 6,
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    background: surface,
    color: ink,
  }
}
