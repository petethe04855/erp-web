'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/design/ThemeContext'
import { Btn, Card, Mono, SectionLabel, StatusPill, TopBar, fmtBaht } from '@/components/ui'
import SlidePanel from '@/components/SlidePanel'
import { useErpStore } from '@/lib/store/useErpStore'
import type { ExpenseCategory, ExpenseChannel } from '@/lib/store/erpWorkflow'
import { exportXlsx } from '@/lib/utils/exportUtil'

const CATEGORIES: ExpenseCategory[] = ['ค่าโฆษณา', 'ค่าธรรมเนียมแพลตฟอร์ม', 'COGS/วัตถุดิบ', 'SG&A', 'ค่าขนส่ง', 'ค่าแรง', 'อื่นๆ']
const CHANNELS: ExpenseChannel[] = ['TikTok', 'Shopee', 'LINE', 'Manual', 'ทั่วไป']
const BLANK = {
  date: new Date().toISOString().split('T')[0],
  category: 'ค่าโฆษณา' as ExpenseCategory,
  channel: 'TikTok' as ExpenseChannel,
  amount: '',
  description: '',
  vendor: '',
  invoiceRef: '',
}

function formatDateShort(date: string) {
  const d = new Date(date)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  if (Number.isNaN(d.getTime())) return date
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`
}

function inputStyle(t: ReturnType<typeof useTheme>['tokens']): React.CSSProperties {
  return {
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${t.color.border}`,
    borderRadius: 6,
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    background: t.color.surface,
    color: t.color.ink,
  }
}

export default function ExpensesPage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const expenses = useErpStore(s => s.expenses)
  const createExpense = useErpStore(s => s.createExpense)
  const updateExpense = useErpStore(s => s.updateExpense)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [toast, setToast] = useState('')

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const pending = expenses.filter(expense => !expense.invoiceRef || expense.description.toLowerCase().includes('pending')).reduce((sum, expense) => sum + expense.amount, 0)
  const byCat = CATEGORIES.map(category => ({
    category,
    amount: expenses.filter(expense => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0),
  })).filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount)
  const maxCat = Math.max(...byCat.map(item => item.amount), 1)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function handleSubmit() {
    const amount = parseFloat(form.amount)
    if (!form.description || !amount || !form.vendor) return
    createExpense({ ...form, amount })
    setForm(BLANK)
    setOpen(false)
    showToast(`บันทึกค่าใช้จ่าย ${fmtBaht(amount)} แล้ว`)
  }

  async function handleExport() {
    try {
      await exportXlsx('expenses', `expenses-export-${new Date().toISOString().slice(0, 10)}.xlsx`)
      showToast('Export สำเร็จ')
    } catch (err: any) {
      showToast('Export ล้มเหลว: ' + err.message)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'Finance', 'Expenses']}
        title="Expenses"
        subtitle={`ค่าใช้จ่าย · ${expenses.length} รายการ · ${fmtBaht(total)} เดือนนี้`}
        right={
          <>
            {toast && <span style={{ fontSize: 12, color: c.pos, fontWeight: 600 }}>{toast}</span>}
            <Btn t={t} variant="ghost" onClick={handleExport}>Export</Btn>
            <Btn t={t} variant="primary" onClick={() => setOpen(true)}>+ Record Expense</Btn>
          </>
        }
      />

      <div style={{ padding: '24px 32px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 24, marginBottom: 16, alignItems: 'stretch' }}>
          <Card t={t} pad={false}>
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', height: '100%' }}>
              <div style={{ padding: '18px 22px', borderBottom: `1px solid ${c.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>Total · MTD</div>
                <Mono t={t} size={24} weight={600} style={{ display: 'block', marginTop: 8 }}>{fmtBaht(total)}</Mono>
              </div>
              <div style={{ padding: '18px 22px' }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>Unpaid</div>
                <Mono t={t} size={24} weight={600} color={c.warn} style={{ display: 'block', marginTop: 8 }}>{fmtBaht(pending)}</Mono>
              </div>
            </div>
          </Card>

          <Card t={t}>
            <SectionLabel t={t}>By Category · MTD</SectionLabel>
            {byCat.slice(0, 5).map(item => (
              <div key={item.category} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 100px', alignItems: 'center', gap: 14, padding: '7px 0' }}>
                <span style={{ fontSize: 13, color: c.ink, fontWeight: 500 }}>{item.category}</span>
                <div style={{ height: 8, background: c.subtle, borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${(item.amount / maxCat) * 100}%`, height: '100%', background: c.expense, borderRadius: 999 }} />
                </div>
                <Mono t={t} size={12} weight={500} style={{ textAlign: 'right' }}>{fmtBaht(item.amount)}</Mono>
              </div>
            ))}
          </Card>
        </div>

        <Card t={t} pad={false} style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 880, borderCollapse: 'collapse', fontFamily: t.font.sans }}>
            <thead>
              <tr>
                {[
                  { label: 'Ref' },
                  { label: 'Date' },
                  { label: 'Vendor' },
                  { label: 'Category' },
                  { label: 'Method' },
                  { label: 'Amount', right: true },
                  { label: 'Status' },
                ].map(h => (
                  <th key={h.label} style={{
                    textAlign: h.right ? 'right' : 'left',
                    padding: '11px 22px',
                    fontSize: 10,
                    fontWeight: 500,
                    color: c.ink3,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    borderBottom: `1px solid ${c.border}`,
                    background: c.canvas,
                  }}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, i) => (
                <tr key={expense.id} onMouseEnter={e => e.currentTarget.style.background = c.subtle} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '13px 22px', borderBottom: i < expenses.length - 1 ? `1px solid ${c.border}` : 'none' }}><Mono t={t} size={12} weight={500}>{expense.id}</Mono></td>
                  <td style={{ padding: '13px 22px', borderBottom: i < expenses.length - 1 ? `1px solid ${c.border}` : 'none' }}><Mono t={t} size={12} color={c.ink2}>{formatDateShort(expense.date)}</Mono></td>
                  <td style={{ padding: '13px 22px', borderBottom: i < expenses.length - 1 ? `1px solid ${c.border}` : 'none' }}><span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{expense.vendor}</span></td>
                  <td style={{ padding: '13px 22px', borderBottom: i < expenses.length - 1 ? `1px solid ${c.border}` : 'none' }}><span style={{ fontSize: 12, color: c.ink2 }}>{expense.category}</span></td>
                  <td style={{ padding: '13px 22px', borderBottom: i < expenses.length - 1 ? `1px solid ${c.border}` : 'none' }}><span style={{ fontSize: 12, color: c.ink3 }}>{expense.channel}</span></td>
                  <td style={{ padding: '13px 22px', borderBottom: i < expenses.length - 1 ? `1px solid ${c.border}` : 'none', textAlign: 'right' }}><Mono t={t} size={13} weight={600}>{fmtBaht(expense.amount)}</Mono></td>
                  <td style={{ padding: '13px 22px', borderBottom: i < expenses.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <StatusPill t={t} status={expense.invoiceRef ? 'paid' : 'pending'} />
                      <button
                        onClick={async () => {
                          const nextInvoiceRef = expense.invoiceRef ? '' : 'PAID'
                          await updateExpense(expense.id, { invoiceRef: nextInvoiceRef })
                          showToast(`เปลี่ยนสถานะเป็น ${nextInvoiceRef ? 'Paid' : 'Pending'} แล้ว`)
                        }}
                        style={{
                          background: 'none',
                          border: `1px solid ${c.border}`,
                          color: c.accent,
                          fontSize: 11,
                          fontWeight: 500,
                          cursor: 'pointer',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontFamily: t.font.sans,
                          transition: 'background 120ms',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = c.subtle}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {expense.invoiceRef ? 'Mark Pending' : 'Mark Paid'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <SlidePanel open={open} onClose={() => setOpen(false)} title="บันทึกค่าใช้จ่าย" subtitle="เพิ่มรายการค่าใช้จ่ายใหม่"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setOpen(false)} style={{ padding: '9px 20px', border: `1px solid ${c.border}`, borderRadius: 7, background: c.surface, cursor: 'pointer', fontSize: 13, color: c.ink2 }}>ยกเลิก</button>
            <button onClick={handleSubmit} disabled={!form.description || !form.amount || !form.vendor} style={{ padding: '9px 20px', border: 'none', borderRadius: 7, background: (!form.description || !form.amount || !form.vendor) ? c.border : c.accent, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>บันทึก</button>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>วันที่ *<input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle(t)} /></label>
            <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>จำนวนเงิน *<input type="number" min={0} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={inputStyle(t)} /></label>
          </div>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>รายละเอียด *<input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={inputStyle(t)} /></label>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>หมวดหมู่<select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))} style={inputStyle(t)}>{CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}</select></label>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>ช่องทาง<select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value as ExpenseChannel }))} style={inputStyle(t)}>{CHANNELS.map(ch => <option key={ch}>{ch}</option>)}</select></label>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>Vendor *<input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} style={inputStyle(t)} /></label>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>Invoice ref<input value={form.invoiceRef} onChange={e => setForm(f => ({ ...f, invoiceRef: e.target.value }))} style={inputStyle(t)} /></label>
        </div>
      </SlidePanel>
    </div>
  )
}
