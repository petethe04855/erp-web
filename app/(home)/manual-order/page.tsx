'use client'
import { useTheme } from '@/lib/design/ThemeContext'
import { TopBar } from '@/components/ui'
import { useState, useRef } from 'react'
import { C, formatBaht } from '@/lib/mockData'
import { useErpStore } from '@/lib/store/useErpStore'
import type { ManualOrder } from '@/lib/store/erpWorkflow'
import SlidePanel from '@/components/SlidePanel'

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  Pending:   { bg: '#FEF3C7', color: '#D97706', label: 'รอยืนยัน' },
  Confirmed: { bg: '#DBEAFE', color: '#2563EB', label: 'ยืนยันแล้ว' },
  Completed: { bg: '#D1FAE5', color: '#059669', label: 'สำเร็จ' },
  Cancelled: { bg: '#FEE2E2', color: '#EF4444', label: 'ยกเลิก' },
}

const CHANNEL_ICON: Record<string, string> = {
  LINE: 'LN', Instagram: 'IG', Facebook: 'FB', Offline: 'OFF', Other: 'OTH',
}

const CHANNELS = ['LINE', 'Instagram', 'Facebook', 'Offline', 'Other']
const TABS = ['ทั้งหมด', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

type MO = ManualOrder
type Line = { sku: string; qty: number }

const th: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--erp-ink4)', background: 'var(--erp-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--erp-border)' }
const td: React.CSSProperties = { padding: '11px 14px', fontSize: 13, borderBottom: '1px solid var(--erp-subtle)' }
const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--erp-ink2)', display: 'block', marginBottom: 5 }
const inp: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid var(--erp-border)', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }

const today = new Date().toISOString().split('T')[0]
const BLANK = { customer: '', phone: '', channel: 'LINE', date: today, notes: '', lines: [{ sku: '', qty: 1 }] as Line[] }

type ImportRow = { customer: string; phone: string; channel: string; amount: string; notes: string }

const TEMPLATE_CSV = 'customer,phone,channel,amount,notes\nคุณตัวอย่าง,081-000-0000,LINE,350,หมายเหตุ'

export default function ManualOrderPage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const list = useErpStore(s => s.manualOrders)
  const products = useErpStore(s => s.products)
  const addManualOrder = useErpStore(s => s.addManualOrder)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [activeTab, setActiveTab] = useState('ทั้งหมด')
  const [search, setSearch] = useState('')

  const [importOpen, setImportOpen] = useState(false)
  const [importRows, setImportRows] = useState<ImportRow[]>([])
  const [importError, setImportError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = list.filter(o =>
    (activeTab === 'ทั้งหมด' || o.status === activeTab) &&
    (o.customer.toLowerCase().includes(search.toLowerCase()) ||
     o.id.toLowerCase().includes(search.toLowerCase()) ||
     o.phone.includes(search))
  )

  const totalAmount = list.reduce((s, o) => s + o.amount, 0)
  const pendingCount = list.filter(o => o.status === 'Pending').length
  const confirmedCount = list.filter(o => o.status === 'Confirmed').length

  const lineTotal = form.lines.reduce((s, l) => {
    const p = products.find(p => p.sku === l.sku)
    return s + (p ? p.price * l.qty : 0)
  }, 0)

  function addLine() { setForm(f => ({ ...f, lines: [...f.lines, { sku: '', qty: 1 }] })) }
  function removeLine(i: number) { setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) })) }
  function updateLine(i: number, field: keyof Line, val: string | number) {
    setForm(f => ({ ...f, lines: f.lines.map((l, idx) => idx === i ? { ...l, [field]: val } : l) }))
  }

  function handleSubmit() {
    if (!form.customer) return
    const validLines = form.lines.filter(l => l.sku)
    addManualOrder({
      customer: form.customer,
      phone: form.phone,
      channel: form.channel,
      amount: lineTotal || 0,
      items: validLines.length || 1,
      notes: form.notes,
    })
    setForm(BLANK)
    setOpen(false)
  }

  function parseCSV(text: string): ImportRow[] {
    const lines = text.trim().split('\n')
    if (lines.length < 2) throw new Error('ไฟล์ CSV ว่างเปล่า')
    const headers = lines[0].split(',').map(h => h.trim())
    const required = ['customer', 'phone', 'channel', 'amount']
    const missing = required.filter(r => !headers.includes(r))
    if (missing.length) throw new Error(`ขาดคอลัมน์: ${missing.join(', ')}`)
    return lines.slice(1).filter(l => l.trim()).map(line => {
      const vals = line.split(',').map(v => v.trim())
      const row: Record<string, string> = {}
      headers.forEach((h, i) => { row[h] = vals[i] ?? '' })
      return { customer: row.customer, phone: row.phone, channel: row.channel, amount: row.amount, notes: row.notes ?? '' }
    })
  }

  async function handleFile(file: File) {
    setImportError('')
    setImportRows([])
    try {
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext === 'csv') {
        const text = await file.text()
        setImportRows(parseCSV(text))
      } else if (ext === 'xlsx' || ext === 'xls') {
        throw new Error('ตอนนี้รองรับ CSV เท่านั้น กรุณา export Excel เป็น .csv ก่อนนำเข้า')
      } else {
        throw new Error('รองรับเฉพาะไฟล์ .csv')
      }
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด')
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function confirmImport() {
    if (!importRows.length) return
    importRows.forEach(row => addManualOrder({
      customer: row.customer || 'ไม่ระบุ',
      phone: row.phone || '',
      channel: CHANNELS.includes(row.channel) ? row.channel : 'Other',
      amount: parseFloat(row.amount) || 0,
      items: 1,
      notes: row.notes || '',
    }))
    setImportRows([])
    setImportOpen(false)
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'manual_order_template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--erp-ink)', margin: 0 }}>Manual Order</h1>
          <p style={{ fontSize: 13, color: 'var(--erp-ink3)', marginTop: 4 }}>บันทึกออร์เดอร์ช่องทางอื่นๆ</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setImportOpen(true)} style={{ padding: '8px 16px', background: 'var(--erp-surface)', color: 'var(--erp-ink2)', border: '1px solid var(--erp-border)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            นำเข้าไฟล์
          </button>
          <button onClick={() => setOpen(true)} style={{ padding: '8px 18px', background: 'var(--erp-accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + สร้างออร์เดอร์
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'ออร์เดอร์ทั้งหมด', value: `${list.length} รายการ`, sub: formatBaht(totalAmount), color: 'var(--erp-ink)' },
          { label: 'รอยืนยัน', value: `${pendingCount} รายการ`, sub: 'สถานะ Pending', color: '#D97706' },
          { label: 'ยืนยันแล้ว', value: `${confirmedCount} รายการ`, sub: 'สถานะ Confirmed', color: '#2563EB' },
          { label: 'ช่องทาง', value: `${new Set(list.map(o => o.channel)).size} ช่อง`, sub: CHANNELS.filter(ch => list.some(o => o.channel === ch)).join(' · '), color: 'var(--erp-accent)' },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--erp-ink4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.color, marginTop: 6 }}>{c.value}</div>
            <div style={{ fontSize: 12, color: 'var(--erp-ink3)', marginTop: 2 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Channel breakdown */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {CHANNELS.map(ch => {
          const count = list.filter(o => o.channel === ch).length
          return (
            <div key={ch} className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <span style={{ fontSize: 18 }}>{CHANNEL_ICON[ch]}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--erp-ink)' }}>{ch}</div>
                <div style={{ fontSize: 11, color: 'var(--erp-ink3)' }}>{count} รายการ</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--erp-border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาลูกค้า / เลขที่ / โทรศัพท์..." style={{ padding: '7px 12px', border: '1px solid var(--erp-border)', borderRadius: 6, fontSize: 13, outline: 'none', width: 240 }} />
          <div style={{ display: 'flex', gap: 4 }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: activeTab === tab ? 'var(--erp-accent)' : 'var(--erp-subtle)', color: activeTab === tab ? '#fff' : 'var(--erp-ink2)' }}>{tab}</button>
            ))}
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--erp-ink3)' }}>{filtered.length} รายการ</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['เลขที่', 'ลูกค้า', 'โทรศัพท์', 'ช่องทาง', 'วันที่', 'สินค้า', 'มูลค่า', 'สถานะ', 'หมายเหตุ'].map(h => (
              <th key={h} style={{ ...th, textAlign: h === 'มูลค่า' ? 'right' : 'left' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.map((o, i) => {
              const s = STATUS_STYLE[o.status]
              return (
                <tr key={o.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ ...td, fontFamily: 'monospace', fontSize: 12, color: 'var(--erp-accent)', fontWeight: 600 }}>{o.id}</td>
                  <td style={{ ...td, fontWeight: 500, color: 'var(--erp-ink)' }}>{o.customer}</td>
                  <td style={{ ...td, color: 'var(--erp-ink3)', fontFamily: 'monospace', fontSize: 12 }}>{o.phone}</td>
                  <td style={td}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: 'var(--erp-subtle)', fontSize: 11, fontWeight: 500, color: 'var(--erp-ink2)' }}>
                      {CHANNEL_ICON[o.channel]} {o.channel}
                    </span>
                  </td>
                  <td style={{ ...td, color: 'var(--erp-ink3)' }}>{o.date}</td>
                  <td style={{ ...td, textAlign: 'center', color: 'var(--erp-ink3)' }}>{o.items} รายการ</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 600, color: 'var(--erp-ink)' }}>{formatBaht(o.amount)}</td>
                  <td style={td}><span style={{ padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>{s.label}</span></td>
                  <td style={{ ...td, color: 'var(--erp-ink3)', fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.notes || '—'}</td>
                </tr>
              )
            })}
            {filtered.length === 0 && <tr><td colSpan={9} style={{ ...td, textAlign: 'center', color: 'var(--erp-ink3)', padding: 40 }}>ไม่พบข้อมูล</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add Order Panel */}
      <SlidePanel open={open} onClose={() => setOpen(false)} title="สร้างออร์เดอร์ใหม่" subtitle="บันทึกออร์เดอร์จากช่องทางต่างๆ"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setOpen(false)} style={{ padding: '9px 20px', border: '1px solid var(--erp-border)', borderRadius: 7, background: 'var(--erp-surface)', cursor: 'pointer', fontSize: 13, color: 'var(--erp-ink2)' }}>ยกเลิก</button>
            <button onClick={handleSubmit} style={{ padding: '9px 20px', border: 'none', borderRadius: 7, background: 'var(--erp-accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>บันทึกออร์เดอร์</button>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={lbl}>ชื่อลูกค้า *</label>
            <input value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} placeholder="ชื่อลูกค้า" style={inp} />
          </div>
          <div>
            <label style={lbl}>เบอร์โทรศัพท์</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0xx-xxx-xxxx" style={inp} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={lbl}>ช่องทางการสั่ง</label>
            <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))} style={inp}>
              {CHANNELS.map(ch => <option key={ch} value={ch}>{CHANNEL_ICON[ch]} {ch}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>วันที่สั่ง</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp} />
          </div>
        </div>

        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--erp-ink)' }}>รายการสินค้า</span>
          <button onClick={addLine} style={{ padding: '5px 12px', fontSize: 12, border: '1px dashed var(--erp-border-strong)', borderRadius: 6, background: 'var(--erp-accent-bg)', color: 'var(--erp-accent)', cursor: 'pointer', fontWeight: 500 }}>+ เพิ่มสินค้า</button>
        </div>

        <div style={{ border: '1px solid var(--erp-border)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--erp-subtle)' }}>
                {['สินค้า', 'จำนวน', 'ราคา/ชิ้น', 'รวม', ''].map(h => (
                  <th key={h} style={{ padding: '8px 10px', fontSize: 11, fontWeight: 600, color: 'var(--erp-ink4)', textAlign: 'left', borderBottom: '1px solid var(--erp-border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {form.lines.map((line, i) => {
                const prod = products.find(p => p.sku === line.sku)
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--erp-subtle)' }}>
                    <td style={{ padding: '8px 10px' }}>
                      <select value={line.sku} onChange={e => updateLine(i, 'sku', e.target.value)} style={{ ...inp, padding: '6px 8px', fontSize: 12 }}>
                        <option value="">-- เลือกสินค้า --</option>
                        {products.map(p => <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '8px 10px', width: 70 }}>
                      <input type="number" min={1} value={line.qty} onChange={e => updateLine(i, 'qty', Math.max(1, parseInt(e.target.value) || 1))} style={{ ...inp, padding: '6px 8px', fontSize: 12, textAlign: 'center' }} />
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--erp-ink3)' }}>{prod ? formatBaht(prod.price) : '—'}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 600 }}>{prod ? formatBaht(prod.price * line.qty) : '—'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      {form.lines.length > 1 && <button onClick={() => removeLine(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 16 }}>×</button>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {lineTotal > 0 && (
          <div style={{ padding: '12px 16px', background: 'var(--erp-accent-bg)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--erp-ink)' }}>มูลค่ารวม</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--erp-accent)' }}>{formatBaht(lineTotal)}</span>
          </div>
        )}

        <div>
          <label style={lbl}>หมายเหตุ</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="หมายเหตุเพิ่มเติม..." rows={3} style={{ ...inp, resize: 'vertical' }} />
        </div>
      </SlidePanel>

      {/* Import File Panel */}
      <SlidePanel open={importOpen} onClose={() => { setImportOpen(false); setImportRows([]); setImportError('') }} title="นำเข้าออร์เดอร์จากไฟล์" subtitle="รองรับ CSV"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={downloadTemplate} style={{ padding: '9px 16px', border: '1px solid var(--erp-border)', borderRadius: 7, background: 'var(--erp-surface)', cursor: 'pointer', fontSize: 12, color: 'var(--erp-ink2)' }}>
              ดาวน์โหลด Template CSV
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setImportOpen(false); setImportRows([]); setImportError('') }} style={{ padding: '9px 20px', border: '1px solid var(--erp-border)', borderRadius: 7, background: 'var(--erp-surface)', cursor: 'pointer', fontSize: 13, color: 'var(--erp-ink2)' }}>ยกเลิก</button>
              <button onClick={confirmImport} disabled={!importRows.length} style={{ padding: '9px 20px', border: 'none', borderRadius: 7, background: importRows.length ? 'var(--erp-accent)' : '#D1D5DB', color: '#fff', cursor: importRows.length ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600 }}>
                ยืนยันนำเข้า {importRows.length > 0 ? `(${importRows.length} รายการ)` : ''}
              </button>
            </div>
          </div>
        }
      >
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--erp-accent)' : '#D1D5DB'}`,
            borderRadius: 12,
            padding: '40px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? 'var(--erp-accent-bg)' : 'var(--erp-subtle)',
            transition: 'all 0.15s',
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 10 }}></div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--erp-ink)', marginBottom: 4 }}>วางไฟล์ที่นี่ หรือคลิกเพื่อเลือก</div>
          <div style={{ fontSize: 12, color: 'var(--erp-ink3)' }}>.csv</div>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        </div>

        {importError && (
          <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, marginBottom: 16, color: '#991B1B', fontSize: 13 }}>
            {importError}
          </div>
        )}

        {importRows.length > 0 && (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--erp-ink)', marginBottom: 10 }}>
              พบข้อมูล {importRows.length} รายการ — ตรวจสอบก่อนนำเข้า
            </div>
            <div style={{ border: '1px solid var(--erp-border)', borderRadius: 8, overflow: 'hidden', maxHeight: 300, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0 }}>
                  <tr>{['ลูกค้า', 'โทรศัพท์', 'ช่องทาง', 'มูลค่า', 'หมายเหตุ'].map(h => (
                    <th key={h} style={{ ...th, background: 'var(--erp-subtle)', position: 'sticky', top: 0 }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {importRows.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                      <td style={td}>{row.customer}</td>
                      <td style={{ ...td, fontFamily: 'monospace', fontSize: 12 }}>{row.phone}</td>
                      <td style={td}>{row.channel}</td>
                      <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{row.amount ? formatBaht(parseFloat(row.amount) || 0) : '—'}</td>
                      <td style={{ ...td, color: 'var(--erp-ink3)', fontSize: 12 }}>{row.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!importRows.length && !importError && (
          <div style={{ padding: '12px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, fontSize: 12, color: '#166534' }}>
            <strong>รูปแบบไฟล์ CSV:</strong> customer, phone, channel, amount, notes<br />
            <strong>ช่องทางที่รองรับ:</strong> {CHANNELS.join(', ')}
          </div>
        )}
      </SlidePanel>
    </div>
  )
}
