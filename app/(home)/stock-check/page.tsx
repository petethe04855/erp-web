'use client'
import { useState } from 'react'
import { useErpStore } from '@/lib/store/useErpStore'
import SlidePanel from '@/components/SlidePanel'
import { useTheme } from '@/lib/design/ThemeContext'
import { TopBar } from '@/components/ui'

const th: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--erp-ink4)', background: 'var(--erp-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--erp-border)' }
const td: React.CSSProperties = { padding: '12px 14px', fontSize: 13, borderBottom: '1px solid var(--erp-border)', color: 'var(--erp-ink2)' }
const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--erp-ink2)', display: 'block', marginBottom: 5 }
const inp: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid var(--erp-border)', borderRadius: 'var(--erp-radius)', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: 'var(--erp-surface)', color: 'var(--erp-ink)' }

export default function StockCheckPage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const products = useErpStore(s => s.products)
  const stockAdjustments = useErpStore(s => s.stockAdjustments)
  const createStockAdjustment = useErpStore(s => s.createStockAdjustment)

  const [counts, setCounts] = useState<Record<string, string>>({})
  const [note, setNote] = useState('')
  const [counting, setCounting] = useState(false)
  const [toast, setToast] = useState('')
  const [histOpen, setHistOpen] = useState(false)
  const [expandedAdj, setExpandedAdj] = useState<string | null>(null)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3500) }

  function startCount() {
    const init: Record<string, string> = {}
    products.forEach(p => { init[p.sku] = String(p.stock) })
    setCounts(init); setCounting(true); setNote('')
  }

  function cancelCount() { setCounts({}); setCounting(false) }

  const variances = products.map(p => ({
    sku: p.sku, name: p.name, systemQty: p.stock,
    actual: counts[p.sku] !== undefined ? parseInt(counts[p.sku]) || 0 : p.stock,
    variance: (parseInt(counts[p.sku]) || 0) - p.stock,
  }))
  const totalVariance = variances.reduce((s, v) => s + v.variance, 0)

  function handleSubmit() {
    const items = products.map(p => ({ sku: p.sku, actualQty: parseInt(counts[p.sku]) || 0 }))
    createStockAdjustment({ note, items })
    setCounting(false); setCounts({}); setNote('')
    showToast('บันทึกการตรวจนับเรียบร้อย สต๊อกอัปเดตแล้ว')
  }

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar t={t} title="Stock Checking" subtitle="ตรวจนับสต๊อกและปรับยอด"
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {toast && <span style={{ fontSize: 12, fontWeight: 700, color: c.pos, fontFamily: t.font.sans }}>{toast}</span>}
            <button onClick={() => setHistOpen(true)} style={{ padding: '8px 16px', background: c.subtle, color: c.ink2, border: '1px solid ' + c.border, borderRadius: t.radius, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: t.font.sans }}>
              ประวัติ ({stockAdjustments.length})
            </button>
            {!counting && (
              <button onClick={startCount} style={{ padding: '8px 18px', background: c.accent, color: '#fff', border: 'none', borderRadius: t.radius, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: t.font.sans }}>
                เริ่มนับสต๊อก
              </button>
            )}
          </div>
        }
      />
      <div style={{ padding: '24px 32px' }}>
        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'สินค้าทั้งหมด', value: products.length, sub: 'รายการ', color: c.ink },
            { label: 'รอบนับทั้งหมด', value: stockAdjustments.length, sub: 'ครั้ง', color: c.info },
            { label: 'มี Variance', value: counting ? variances.filter(v => v.variance !== 0).length : '—', sub: 'รายการ', color: c.warn },
            { label: 'Variance รวม', value: counting ? (totalVariance >= 0 ? `+${totalVariance}` : totalVariance) : '—', sub: 'ชิ้น', color: totalVariance > 0 ? c.pos : totalVariance < 0 ? c.neg : c.ink3 },
          ].map(item => (
            <div key={item.label} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 11, color: c.ink4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: t.font.sans }}>{item.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: item.color, marginTop: 6, fontFamily: t.font.mono }}>{item.value}</div>
              <div style={{ fontSize: 12, color: c.ink3, fontFamily: t.font.sans }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {!counting ? (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid ' + c.border, fontFamily: t.font.sans }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: c.ink }}>สต๊อกปัจจุบัน (ระบบ)</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['สินค้า', 'SKU', 'สต๊อกระบบ', 'จอง', 'พร้อมขาย', 'Reorder'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const avail = p.stock - p.reservedQty
                  return (
                    <tr key={p.sku}>
                      <td style={{ ...td, fontWeight: 500, color: c.ink }}>{p.name}</td>
                      <td style={{ ...td, fontFamily: t.font.mono, fontSize: 11 }}>{p.sku}</td>
                      <td style={{ ...td, fontWeight: 700, color: c.ink, fontFamily: t.font.mono }}>{p.stock}</td>
                      <td style={{ ...td, color: p.reservedQty > 0 ? c.warn : c.ink3, fontFamily: t.font.mono }}>{p.reservedQty}</td>
                      <td style={td}><span style={{ fontWeight: 700, color: avail <= p.reorder ? c.neg : c.pos, fontFamily: t.font.mono }}>{avail}</span></td>
                      <td style={{ ...td, color: p.stock <= p.reorder ? c.neg : c.ink3, fontWeight: p.stock <= p.reorder ? 700 : 400, fontFamily: t.font.mono }}>
                        {p.stock <= p.reorder ? '' : ''}{p.reorder}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div style={{ padding: '20px', textAlign: 'center', color: c.ink3, fontSize: 13, borderTop: '1px dashed ' + c.border, fontFamily: t.font.sans }}>
              กด <strong>&ldquo;เริ่มนับสต๊อก&rdquo;</strong> เพื่อเริ่มการตรวจนับและปรับปรุงยอด
            </div>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid ' + c.border, display: 'flex', alignItems: 'center', gap: 12, background: c.warnBg }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.warn }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: c.warn, fontFamily: t.font.sans }}>กำลังนับสต๊อก — กรอกยอดจริงที่นับได้</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button onClick={cancelCount} style={{ padding: '6px 14px', border: '1px solid var(--erp-border)', borderRadius: 6, background: 'var(--erp-surface)', cursor: 'pointer', fontSize: 12, color: 'var(--erp-ink2)', fontFamily: 'var(--erp-font-sans)' }}>ยกเลิก</button>
                <button onClick={handleSubmit} style={{ padding: '6px 16px', border: 'none', borderRadius: 6, background: 'var(--erp-pos)', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'var(--erp-font-sans)' }}>บันทึกและปรับยอด</button>
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['สินค้า', 'ยอดระบบ', 'ยอดนับจริง', 'Variance', 'สถานะ'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {variances.map(v => {
                  const diff = v.variance
                  return (
                    <tr key={v.sku} style={{ background: diff !== 0 ? (diff > 0 ? c.posBg : c.negBg) : 'transparent' }}>
                      <td style={{ ...td, fontWeight: 500, color: c.ink }}>{v.name}</td>
                      <td style={{ ...td, fontWeight: 600, textAlign: 'center', fontFamily: t.font.mono }}>{v.systemQty}</td>
                      <td style={{ ...td, textAlign: 'center' }}>
                        <input type="number" min={0} value={counts[v.sku] ?? String(v.systemQty)}
                          onChange={e => setCounts(prev => ({ ...prev, [v.sku]: e.target.value }))}
                          style={{ width: 80, padding: '6px 8px', border: `1px solid ${diff !== 0 ? (diff > 0 ? c.pos : c.neg) : c.border}`, borderRadius: 6, fontSize: 13, textAlign: 'center', outline: 'none', fontWeight: 700, background: 'var(--erp-surface)', color: 'var(--erp-ink)' }}
                        />
                      </td>
                      <td style={{ ...td, textAlign: 'center', fontWeight: 700, color: diff > 0 ? c.pos : diff < 0 ? c.neg : c.ink3, fontFamily: t.font.mono }}>
                        {diff > 0 ? `+${diff}` : diff === 0 ? '—' : diff}
                      </td>
                      <td style={td}>
                        {diff === 0
                          ? <span style={{ fontSize: 11, color: c.pos, fontWeight: 600, fontFamily: t.font.sans }}>ตรง</span>
                          : <span style={{ fontSize: 11, color: diff > 0 ? c.pos : c.neg, fontWeight: 600, fontFamily: t.font.sans }}>{diff > 0 ? '▲ เพิ่ม' : '▼ ขาด'}</span>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div style={{ padding: '16px 20px', borderTop: '1px solid ' + c.border, background: c.subtle }}>
              <label style={lbl}>บันทึกรอบนับ (หมายเหตุ)</label>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="เช่น ตรวจนับรอบเดือน พ.ค. 2026" style={inp} />
            </div>
          </div>
        )}

        {/* History Panel */}
        <SlidePanel open={histOpen} onClose={() => setHistOpen(false)} title="ประวัติการตรวจนับ" subtitle={`ทั้งหมด ${stockAdjustments.length} รอบ`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stockAdjustments.length === 0 && <p style={{ textAlign: 'center', color: 'var(--erp-ink3)', padding: '40px 0', fontSize: 14 }}>ยังไม่มีประวัติการตรวจนับ</p>}
            {stockAdjustments.map(adj => {
              const varItems = adj.items.filter(i => i.variance !== 0)
              const isExpanded = expandedAdj === adj.id
              return (
                <div key={adj.id} style={{ border: '1px solid var(--erp-border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div onClick={() => setExpandedAdj(isExpanded ? null : adj.id)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--erp-subtle)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--erp-accent)', fontFamily: 'var(--erp-font-mono)' }}>{adj.id}</div>
                      <div style={{ fontSize: 12, color: 'var(--erp-ink3)', marginTop: 2, fontFamily: 'var(--erp-font-sans)' }}>{adj.date} · {adj.checkedBy} · {adj.note || 'ไม่มีหมายเหตุ'}</div>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: varItems.length > 0 ? 'var(--erp-warnBg, #FEF3C7)' : 'var(--erp-posBg, #D1FAE5)', color: varItems.length > 0 ? 'var(--erp-warn)' : 'var(--erp-pos)' }}>
                      {varItems.length > 0 ? `มี Variance ${varItems.length} รายการ` : 'ไม่มี Variance'}
                    </span>
                    <span style={{ color: 'var(--erp-ink3)', fontSize: 14 }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                  {isExpanded && (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr>{['สินค้า', 'ระบบ', 'จริง', 'Variance'].map(h => <th key={h} style={{ ...th, fontSize: 10 }}>{h}</th>)}</tr></thead>
                      <tbody>
                        {adj.items.map(item => (
                          <tr key={item.sku} style={{ background: item.variance !== 0 ? (item.variance > 0 ? 'var(--erp-posBg, #F0FDF4)' : 'var(--erp-negBg, #FEF2F2)') : 'transparent' }}>
                            <td style={{ ...td, fontSize: 12 }}>{item.skuName}</td>
                            <td style={{ ...td, fontSize: 12, textAlign: 'center', fontFamily: 'var(--erp-font-mono)' }}>{item.systemQty}</td>
                            <td style={{ ...td, fontSize: 12, textAlign: 'center', fontWeight: 700, fontFamily: 'var(--erp-font-mono)' }}>{item.actualQty}</td>
                            <td style={{ ...td, fontSize: 12, textAlign: 'center', fontWeight: 700, color: item.variance > 0 ? 'var(--erp-pos)' : item.variance < 0 ? 'var(--erp-neg)' : 'var(--erp-ink3)', fontFamily: 'var(--erp-font-mono)' }}>
                              {item.variance > 0 ? `+${item.variance}` : item.variance === 0 ? '—' : item.variance}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )
            })}
          </div>
        </SlidePanel>
      </div>
    </div>
  )
}
