'use client'
import { useTheme } from '@/lib/design/ThemeContext'
import { TopBar } from '@/components/ui'
import { useState } from 'react'
import { C } from '@/lib/mockData'
import SlidePanel from '@/components/SlidePanel'
import { useErpStore } from '@/lib/store/useErpStore'
import type { SamplingCampaign } from '@/lib/store/erpWorkflow'

const th: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--erp-ink4)', background: 'var(--erp-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--erp-border)', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '11px 14px', fontSize: 13, borderBottom: '1px solid var(--erp-subtle)', verticalAlign: 'top' }
const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: 'var(--erp-ink2)', display: 'block', marginBottom: 5 }
const inp: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid var(--erp-border)', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: 'var(--erp-surface)' }

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Active:    { bg: '#D1FAE5', color: '#059669' },
  Completed: { bg: '#DBEAFE', color: '#2563EB' },
  Cancelled: { bg: 'var(--erp-subtle)', color: 'var(--erp-ink3)' },
}

const today = new Date().toISOString().split('T')[0]
const BLANK_CAMPAIGN = { name: '', sku: '', skuName: '', targetQty: 0, note: '', startDate: today, endDate: today }
const BLANK_RECIPIENT = { campaignId: '', name: '', contact: '', qtyGiven: 1, date: today, feedback: '', converted: false }

export default function SamplingPage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const campaigns = useErpStore(s => s.samplingCampaigns)
  const products = useErpStore(s => s.products)
  const createSamplingCampaign = useErpStore(s => s.createSamplingCampaign)
  const addSamplingRecipient = useErpStore(s => s.addSamplingRecipient)
  const updateSamplingStatus = useErpStore(s => s.updateSamplingStatus)

  const [open, setOpen] = useState(false)
  const [recipientOpen, setRecipientOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<SamplingCampaign | null>(null)
  const [campaignForm, setCampaignForm] = useState(BLANK_CAMPAIGN)
  const [recipientForm, setRecipientForm] = useState(BLANK_RECIPIENT)
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function onSkuChange(sku: string) {
    const p = products.find(p => p.sku === sku)
    setCampaignForm(f => ({ ...f, sku, skuName: p?.name ?? '' }))
  }

  function handleCreateCampaign() {
    if (!campaignForm.name || !campaignForm.sku || campaignForm.targetQty <= 0) {
      showToast('กรุณากรอกชื่อแคมเปญ สินค้า และจำนวนเป้าหมาย')
      return
    }
    createSamplingCampaign(campaignForm)
    setCampaignForm(BLANK_CAMPAIGN)
    setOpen(false)
    showToast('สร้างแคมเปญ Sampling แล้ว')
  }

  function handleAddRecipient() {
    if (!recipientForm.name || recipientForm.qtyGiven <= 0) {
      showToast('กรุณากรอกชื่อผู้รับและจำนวน')
      return
    }
    const result = addSamplingRecipient({ ...recipientForm, campaignId: selectedCampaign!.id })
    if (result) {
      setRecipientForm(BLANK_RECIPIENT)
      setRecipientOpen(false)
      setSelectedCampaign(result)
      showToast('บันทึกผู้รับ Sample แล้ว')
    }
  }

  function openAddRecipient(c: SamplingCampaign) {
    setSelectedCampaign(c)
    setRecipientForm({ ...BLANK_RECIPIENT, campaignId: c.id })
    setRecipientOpen(true)
  }

  const totalGiven = campaigns.reduce((s, c) => s + c.givenQty, 0)
  const converted = campaigns.flatMap(c => c.recipients).filter(r => r.converted).length
  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar t={t} title="Sampling" subtitle="ติดตามแจกตัวอย่าง" />
      <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {toast && <span style={{ fontSize: 12, color: 'var(--erp-pos)', fontWeight: 700 }}>{toast}</span>}
          <button onClick={() => setOpen(true)} style={{ padding: '8px 18px', background: 'var(--erp-accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + สร้างแคมเปญ
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'แคมเปญ Active', value: `${activeCampaigns}`, sub: `${campaigns.length} ทั้งหมด`, color: '#059669' },
          { label: 'แจก Sample แล้ว', value: `${totalGiven} ชิ้น`, sub: 'รวมทุกแคมเปญ', color: 'var(--erp-accent)' },
          { label: 'Converted', value: `${converted}`, sub: 'ผู้รับที่กลายเป็นลูกค้า', color: '#7C3AED' },
          { label: 'Conversion Rate', value: totalGiven > 0 ? `${((converted / totalGiven) * 100).toFixed(1)}%` : '—', sub: 'converted / given', color: '#D97706' },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: '13px 16px', borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--erp-ink4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</div>
            <div style={{ fontSize: 21, fontWeight: 800, color: c.color, marginTop: 5 }}>{c.value}</div>
            <div style={{ fontSize: 12, color: 'var(--erp-ink3)', marginTop: 2 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Campaigns */}
      {campaigns.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--erp-ink3)' }}>
          <div style={{ fontSize: 11, marginBottom: 12, fontWeight: 700, color: 'var(--erp-ink3)', letterSpacing: '0.08em' }}>SAMPLE</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>ยังไม่มีแคมเปญ Sampling</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>คลิก + สร้างแคมเปญ เพื่อเริ่มต้น</div>
        </div>
      ) : (
        campaigns.map(c => {
          const s = STATUS_STYLE[c.status]
          const pct = c.targetQty > 0 ? Math.min(100, Math.round((c.givenQty / c.targetQty) * 100)) : 0
          const convCount = c.recipients.filter(r => r.converted).length
          return (
            <div key={c.id} className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--erp-subtle)', display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--erp-ink)' }}>{c.name}</span>
                    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, ...s }}>{c.status}</span>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--erp-ink3)' }}>{c.id}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--erp-ink3)' }}>
                    SKU: <span style={{ color: 'var(--erp-accent)', fontWeight: 600 }}>{c.sku}</span> · {c.skuName}
                    {' · '}วันที่ {c.startDate} ถึง {c.endDate}
                  </div>
                  {c.note && <div style={{ fontSize: 12, color: 'var(--erp-ink3)', marginTop: 4, fontStyle: 'italic' }}>{c.note}</div>}
                </div>
                <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--erp-accent)' }}>{c.givenQty}<span style={{ fontSize: 12, color: 'var(--erp-ink3)' }}>/{c.targetQty}</span></div>
                    <div style={{ fontSize: 10, color: 'var(--erp-ink3)', marginTop: 2 }}>แจกแล้ว</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#7C3AED' }}>{convCount}</div>
                    <div style={{ fontSize: 10, color: 'var(--erp-ink3)', marginTop: 2 }}>Converted</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#059669' }}>{c.recipients.length > 0 ? `${Math.round((convCount / c.recipients.length) * 100)}%` : '—'}</div>
                    <div style={{ fontSize: 10, color: 'var(--erp-ink3)', marginTop: 2 }}>Conv. Rate</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {c.status === 'Active' && (
                    <>
                      <button onClick={() => openAddRecipient(c)} style={{ padding: '6px 14px', fontSize: 12, border: 'none', borderRadius: 6, background: '#D1FAE5', color: '#059669', cursor: 'pointer', fontWeight: 700 }}>+ เพิ่มผู้รับ</button>
                      <button onClick={() => { updateSamplingStatus(c.id, 'Completed'); showToast(`${c.id} → Completed`) }} style={{ padding: '6px 12px', fontSize: 12, border: 'none', borderRadius: 6, background: '#DBEAFE', color: '#2563EB', cursor: 'pointer', fontWeight: 600 }}>จบแคมเปญ</button>
                    </>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ padding: '8px 20px 4px', borderBottom: c.recipients.length > 0 ? '1px solid var(--erp-subtle)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--erp-ink3)' }}>ความคืบหน้า</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: pct >= 100 ? '#059669' : 'var(--erp-ink)' }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--erp-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#059669' : 'var(--erp-accent)', borderRadius: 3, transition: 'width 0.3s' }} />
                </div>
              </div>

              {/* Recipients table */}
              {c.recipients.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                    <thead>
                      <tr>{['ชื่อผู้รับ', 'ช่องทาง', 'จำนวน', 'วันที่', 'Feedback', 'Converted'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {c.recipients.map((r, i) => (
                        <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                          <td style={{ ...td, fontWeight: 600, color: 'var(--erp-ink)' }}>{r.name}</td>
                          <td style={{ ...td, fontSize: 12, color: 'var(--erp-ink3)' }}>{r.contact || '—'}</td>
                          <td style={{ ...td, fontWeight: 700, color: 'var(--erp-accent)' }}>{r.qtyGiven} ชิ้น</td>
                          <td style={{ ...td, color: 'var(--erp-ink3)' }}>{r.date}</td>
                          <td style={{ ...td, color: 'var(--erp-ink3)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.feedback || '—'}</td>
                          <td style={td}>
                            {r.converted
                              ? <span style={{ padding: '2px 10px', borderRadius: 20, background: '#D1FAE5', color: '#059669', fontSize: 11, fontWeight: 700 }}>ซื้อแล้ว</span>
                              : <span style={{ padding: '2px 10px', borderRadius: 20, background: 'var(--erp-subtle)', color: 'var(--erp-ink3)', fontSize: 11 }}>รอติดตาม</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })
      )}

      {/* Create Campaign Panel */}
      <SlidePanel open={open} onClose={() => setOpen(false)} title="สร้างแคมเปญ Sampling" subtitle="ติดตามการแจกตัวอย่างสินค้า"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setOpen(false)} style={{ padding: '9px 20px', border: '1px solid var(--erp-border)', borderRadius: 7, background: 'var(--erp-surface)', cursor: 'pointer', fontSize: 13, color: 'var(--erp-ink2)' }}>ยกเลิก</button>
            <button onClick={handleCreateCampaign} style={{ padding: '9px 20px', border: 'none', borderRadius: 7, background: 'var(--erp-accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>สร้างแคมเปญ</button>
          </div>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>ชื่อแคมเปญ *</label>
          <input value={campaignForm.name} onChange={e => setCampaignForm(f => ({ ...f, name: e.target.value }))} placeholder="เช่น ชาวี Snack Trial Q2" style={inp} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>สินค้าที่แจก *</label>
          <select value={campaignForm.sku} onChange={e => onSkuChange(e.target.value)} style={inp}>
            <option value="">-- เลือกสินค้า --</option>
            {products.map(p => <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>จำนวนเป้าหมาย (ชิ้น) *</label>
          <input type="number" min={1} value={campaignForm.targetQty || ''} onChange={e => setCampaignForm(f => ({ ...f, targetQty: parseInt(e.target.value) || 0 }))} placeholder="0" style={inp} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={lbl}>วันเริ่ม</label>
            <input type="date" value={campaignForm.startDate} onChange={e => setCampaignForm(f => ({ ...f, startDate: e.target.value }))} style={inp} />
          </div>
          <div>
            <label style={lbl}>วันสิ้นสุด</label>
            <input type="date" value={campaignForm.endDate} onChange={e => setCampaignForm(f => ({ ...f, endDate: e.target.value }))} style={inp} />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>หมายเหตุ</label>
          <input value={campaignForm.note} onChange={e => setCampaignForm(f => ({ ...f, note: e.target.value }))} placeholder="วัตถุประสงค์ หรือรายละเอียดเพิ่มเติม" style={inp} />
        </div>
      </SlidePanel>

      {/* Add Recipient Panel */}
      <SlidePanel open={recipientOpen} onClose={() => setRecipientOpen(false)}
        title="เพิ่มผู้รับ Sample" subtitle={selectedCampaign?.name ?? ''}
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setRecipientOpen(false)} style={{ padding: '9px 20px', border: '1px solid var(--erp-border)', borderRadius: 7, background: 'var(--erp-surface)', cursor: 'pointer', fontSize: 13, color: 'var(--erp-ink2)' }}>ยกเลิก</button>
            <button onClick={handleAddRecipient} style={{ padding: '9px 20px', border: 'none', borderRadius: 7, background: 'var(--erp-pos)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>บันทึกผู้รับ</button>
          </div>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>ชื่อผู้รับ *</label>
          <input value={recipientForm.name} onChange={e => setRecipientForm(f => ({ ...f, name: e.target.value }))} placeholder="ชื่อ-นามสกุล หรือ Handle" style={inp} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>ช่องทางติดต่อ</label>
          <input value={recipientForm.contact} onChange={e => setRecipientForm(f => ({ ...f, contact: e.target.value }))} placeholder="LINE ID / เบอร์โทร / Instagram" style={inp} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={lbl}>จำนวนที่ให้ (ชิ้น) *</label>
            <input type="number" min={1} value={recipientForm.qtyGiven} onChange={e => setRecipientForm(f => ({ ...f, qtyGiven: parseInt(e.target.value) || 1 }))} style={inp} />
          </div>
          <div>
            <label style={lbl}>วันที่แจก</label>
            <input type="date" value={recipientForm.date} onChange={e => setRecipientForm(f => ({ ...f, date: e.target.value }))} style={inp} />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Feedback (ถ้ามี)</label>
          <input value={recipientForm.feedback} onChange={e => setRecipientForm(f => ({ ...f, feedback: e.target.value }))} placeholder="ความคิดเห็น / ผลตอบรับ" style={inp} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--erp-subtle)', borderRadius: 8 }}>
          <input type="checkbox" id="converted" checked={recipientForm.converted} onChange={e => setRecipientForm(f => ({ ...f, converted: e.target.checked }))} style={{ width: 16, height: 16 }} />
          <label htmlFor="converted" style={{ fontSize: 13, fontWeight: 600, color: 'var(--erp-ink)', cursor: 'pointer' }}>ผู้รับนี้กลายเป็นลูกค้าแล้ว (Converted)</label>
        </div>
      </SlidePanel>
      </div>
    </div>
  )
}
