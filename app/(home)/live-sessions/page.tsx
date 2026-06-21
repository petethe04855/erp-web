'use client'
import { useMemo, useState, type CSSProperties } from 'react'
import {
  Check, CheckSquare, Download, FileText,
  Image as ImageIcon, Link as LinkIcon,
  Printer, Send, Square, Video, X,
} from 'lucide-react'
import { useTheme } from '@/lib/design/ThemeContext'
import {
  Btn, Card, Mono, SectionLabel, StatusPill, TopBar, fmtNum,
} from '@/components/ui'
import {
  adminUsers, contentPosts, formatBaht, getClipBonus,
  getLiveDecimalHours, getLiveHourlyPay, getLiveNetMinutes,
  getRoundedLiveMinutes, hasLiveOverlap, liveStaff,
  type LivePlatform, type LiveStatus, type RoundingPolicy,
} from '@/lib/mockData'
import { useErpStore } from '@/lib/store/useErpStore'
import type { ContentScheduleStatus } from '@/lib/store/erpWorkflow'

const PLATFORMS: LivePlatform[] = ['TikTok', 'Shopee', 'Lazada']
const LIVE_ACCOUNTS: Record<LivePlatform, string[]> = {
  TikTok: ['@chawy_official', '@chawy_petfood', '@chawy_live'],
  Shopee: ['@chawy_shopee', '@chawy_shop_live'],
  Lazada: ['@chawy_lazada', '@chawy_lazlive'],
}
const SCHEDULE_PLATFORMS = ['TikTok Live', 'Facebook Live', 'Shopee Live', 'Instagram Live'] as const
const SCHEDULE_ACCOUNTS: Record<string, string[]> = {
  'TikTok Live':    ['@chawy_official', '@chawy_petfood', '@chawy_live'],
  'Facebook Live':  ['@chawy_fb', '@chawy_fanpage'],
  'Shopee Live':    ['@chawy_shopee'],
  'Instagram Live': ['@chawy_ig'],
}
const STATUS_STYLE: Record<LiveStatus, { bg: string; color: string; label: string }> = {
  Pending:          { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  Manager_Approved: { bg: '#D1FAE5', color: '#065F46', label: 'Approved' },
  Rejected:         { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
}

const BLANK_FORM = {
  staff_id: 'STF-001', live_date: '2026-05-13', platform: 'TikTok' as LivePlatform,
  tiktok_account: '@chawy_official', start_datetime: '2026-05-13T20:00',
  end_datetime: '2026-05-13T22:30', break_minutes: 0,
  revenue_generated: 0, has_clip: false, clip_link: '', live_summary_image: '', host_notes: '',
}

function dateLabel(v: string) {
  return new Intl.DateTimeFormat('th-TH', { day: '2-digit', month: 'short' }).format(new Date(v))
}
function timeLabel(v: string) {
  return new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' }).format(new Date(v))
}
function getStaffName(id: string) {
  return liveStaff.find(s => s.id === id)?.name ?? id
}
function calcDuration(start: string, end: string): string | null {
  if (!start || !end) return null
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) return null
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 && m > 0 ? `${h} ชม. ${m} นาที` : h > 0 ? `${h} ชม.` : `${m} นาที`
}

export default function LiveSessionsPage() {
  const { tokens: t } = useTheme()
  const c = t.color

  const sessions               = useErpStore(s => s.liveSessions)
  const addLiveSession         = useErpStore(s => s.addLiveSession)
  const updateLiveSessionStatus = useErpStore(s => s.updateLiveSessionStatus)
  const contentSchedule        = useErpStore(s => s.contentSchedule)
  const addContentSchedule     = useErpStore(s => s.addContentSchedule)
  const updateContentScheduleStatus = useErpStore(s => s.updateContentScheduleStatus)
  const livePayroll            = useErpStore(s => s.settings.livePayroll)
  const currentUser            = useErpStore(s => s.currentUser)
  const canSeeAllPayroll = currentUser.role === 'owner' || currentUser.role === 'accountant'

  const [showPanel, setShowPanel] = useState(false)
  const [showCheckoutPanel, setShowCheckoutPanel] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const BLANK_SCHEDULE = { platform: 'TikTok Live', account: '@chawy_official', status: 'scheduled' as ContentScheduleStatus, topic: '', date: '', startTime: '20:00', endTime: '22:00' }
  const [scheduleForm, setScheduleForm] = useState(BLANK_SCHEDULE)
  const [scheduleErrors, setScheduleErrors] = useState<{ date?: string; topic?: string; time?: string }>({})

  const [form, setForm]   = useState(BLANK_FORM)
  const [roundingPolicy, setRoundingPolicy] = useState<RoundingPolicy>('actual')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [toast, setToast] = useState('')

  const formNetMinutes = getLiveNetMinutes(form)
  const formHours      = getLiveDecimalHours(getRoundedLiveMinutes(formNetMinutes, roundingPolicy))

  const analytics = useMemo(() => {
    const active  = sessions.filter(s => getLiveNetMinutes(s) > 0 && s.status !== 'Rejected')
    const clips   = active.filter(s => s.has_clip).length
    const revenue = active.reduce((sum, s) => sum + s.revenue_generated, 0)
    const mins    = active.reduce((sum, s) => sum + getRoundedLiveMinutes(getLiveNetMinutes(s), roundingPolicy), 0)
    return {
      active, clips, revenue,
      totalHours: getLiveDecimalHours(mins),
      contentRate: active.length ? Math.round((clips / active.length) * 100) : 0,
      pending: sessions.filter(s => s.status === 'Pending'),
      contentGaps: active.filter(s => !s.has_clip),
    }
  }, [roundingPolicy, sessions])

  const payrollRows = useMemo(() => liveStaff.map(staff => {
    const rows     = sessions.filter(s => s.staff_id === staff.id && s.status !== 'Rejected')
    const minutes  = rows.reduce((sum, s) => sum + getRoundedLiveMinutes(getLiveNetMinutes(s), roundingPolicy), 0)
    const revenue  = rows.reduce((sum, s) => sum + s.revenue_generated, 0)
    const clips    = rows.filter(s => s.has_clip).length
    const hourlyPay = getLiveHourlyPay(minutes, livePayroll.hourlyRate)
    const clipBonus = getClipBonus(clips, livePayroll.clipBonus)
    return { staff, hours: getLiveDecimalHours(minutes), revenue, clips, hourlyPay, clipBonus, grossPay: hourlyPay + clipBonus }
  }), [roundingPolicy, sessions, livePayroll])

  function submitSession() {
    if (formNetMinutes <= 0) { setToast('เวลาจบต้องมากกว่าเวลาเริ่ม'); return }
    if (hasLiveOverlap(sessions, { staff_id: form.staff_id, start_datetime: form.start_datetime, end_datetime: form.end_datetime })) {
      setToast('เวลานี้ซ้อนกับ log เดิมของพนักงานคนนี้'); return
    }
    addLiveSession({ ...form, break_minutes: Number(form.break_minutes), revenue_generated: Number(form.revenue_generated), rejection_reason: '' })
    setForm(BLANK_FORM)
    setToast('ส่งรายการไลฟ์เพื่ออนุมัติแล้ว')
    setTimeout(() => setToast(''), 3000)
  }

  function approve(ids: string[]) {
    ids.forEach(id => updateLiveSessionStatus(id, 'Manager_Approved'))
    setSelectedIds([])
    setToast(`อนุมัติแล้ว ${ids.length} รายการ`)
    setTimeout(() => setToast(''), 3000)
  }

  function reject(id: string) {
    updateLiveSessionStatus(id, 'Rejected')
    setSelectedIds(ids => ids.filter(r => r !== id))
  }

  function exportPayrollCsv() {
    const header = ['พนักงาน', 'ชั่วโมงรวม', 'ยอดขายรวม', 'จำนวนคลิป', 'ค่าแรง', 'โบนัสคลิป', 'ยอดจ่าย']
    const rows = payrollRows.map(r => [r.staff.name, r.hours.toFixed(2), r.revenue, r.clips, r.hourlyPay, r.clipBonus, r.grossPay.toFixed(2)])
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'live-payroll.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const totalReach  = contentPosts.reduce((s, p) => s + p.reach, 0)
  const avgEng      = contentPosts.reduce((s, p) => s + p.eng, 0) / contentPosts.length
  const maxReach    = Math.max(...contentPosts.map(p => p.reach))
  const scheduledCount = contentSchedule.filter(s => s.status === 'scheduled').length

  function submitSchedule() {
    const errors: typeof scheduleErrors = {}
    if (!scheduleForm.date) errors.date = 'กรุณาเลือกวันที่'
    if (!scheduleForm.topic.trim()) errors.topic = 'กรุณาใส่หัวข้อ'
    if (!calcDuration(scheduleForm.startTime, scheduleForm.endTime)) errors.time = 'เวลาจบต้องมากกว่าเวลาเริ่ม'
    if (Object.keys(errors).length > 0) { setScheduleErrors(errors); return }
    addContentSchedule(scheduleForm)
    setScheduleForm(BLANK_SCHEDULE)
    setScheduleErrors({})
    setShowPanel(false)
    setToast('เพิ่มรายการ Schedule แล้ว')
    setTimeout(() => setToast(''), 3000)
  }

  const th: CSSProperties = { padding: '11px 22px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: c.ink3, letterSpacing: '0.10em', textTransform: 'uppercase', borderBottom: `1px solid ${c.border}`, background: c.canvas }
  const td: CSSProperties = { padding: '14px 22px', fontSize: 12, borderBottom: `1px solid ${c.border}`, verticalAlign: 'top' }
  const opsTh: CSSProperties = { padding: '10px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: c.ink4, background: c.subtle, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap' }
  const opsTd: CSSProperties = { padding: '11px 12px', fontSize: 12, borderBottom: `1px solid ${c.subtle}`, verticalAlign: 'top' }
  const lbl: CSSProperties = { fontSize: 12, fontWeight: 700, color: c.ink2, display: 'block', marginBottom: 6 }
  const inp: CSSProperties = { width: '100%', padding: '9px 11px', border: `1px solid ${c.border}`, borderRadius: t.radius, fontSize: 13, outline: 'none', background: c.surface, color: c.ink, boxSizing: 'border-box' }

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>

      {/* Dim overlay */}
      {showPanel && (
        <div onClick={() => setShowPanel(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />
      )}

      {/* Slide Panel */}
      {showPanel && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 360, background: c.surface, borderLeft: `1px solid ${c.border}`, zIndex: 50, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)' }}>
          {/* Header */}
          <div style={{ background: c.accent, padding: '18px 24px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>Schedule Live</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>เพิ่มรายการไลฟ์ใหม่</div>
            </div>
            <button onClick={() => setShowPanel(false)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
          </div>

          {/* Form body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ ...lbl, marginBottom: 5 }}>แพลตฟอร์ม</label>
              <select value={scheduleForm.platform} onChange={e => {
                const platform = e.target.value
                setScheduleForm(f => ({ ...f, platform, account: SCHEDULE_ACCOUNTS[platform]?.[0] ?? '' }))
              }} style={{ ...inp, background: c.subtle }}>
                {SCHEDULE_PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ ...lbl, marginBottom: 5 }}>ชื่อช่อง</label>
              <select value={scheduleForm.account} onChange={e => setScheduleForm(f => ({ ...f, account: e.target.value }))} style={{ ...inp, background: c.subtle }}>
                {(SCHEDULE_ACCOUNTS[scheduleForm.platform] ?? []).map(a => <option key={a}>{a}</option>)}
              </select>
              <div style={{ fontSize: 11, color: c.ink4, marginTop: 4 }}>ตัวเลือกเปลี่ยนตามแพลตฟอร์มที่เลือก</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ ...lbl, marginBottom: 5 }}>วันที่ไลฟ์</label>
              <input type="date" value={scheduleForm.date} onChange={e => { setScheduleForm(f => ({ ...f, date: e.target.value })); setScheduleErrors(er => ({ ...er, date: undefined })) }} style={{ ...inp, background: c.subtle, boxSizing: 'border-box' }} />
              {scheduleErrors.date && <div style={{ fontSize: 11, color: c.neg, marginTop: 4 }}>{scheduleErrors.date}</div>}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ ...lbl, marginBottom: 5 }}>ช่วงเวลาไลฟ์</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: c.ink3, marginBottom: 4 }}>เริ่ม</div>
                  <input type="time" value={scheduleForm.startTime} onChange={e => { setScheduleForm(f => ({ ...f, startTime: e.target.value })); setScheduleErrors(er => ({ ...er, time: undefined })) }} style={{ ...inp, background: c.subtle, fontSize: 12, boxSizing: 'border-box' }} />
                </div>
                <div style={{ fontSize: 18, color: c.ink4, marginTop: 16, textAlign: 'center' }}>→</div>
                <div>
                  <div style={{ fontSize: 10, color: c.ink3, marginBottom: 4 }}>จบ</div>
                  <input type="time" value={scheduleForm.endTime} onChange={e => { setScheduleForm(f => ({ ...f, endTime: e.target.value })); setScheduleErrors(er => ({ ...er, time: undefined })) }} style={{ ...inp, background: c.subtle, fontSize: 12, boxSizing: 'border-box' }} />
                </div>
              </div>
              {calcDuration(scheduleForm.startTime, scheduleForm.endTime) ? (
                <div style={{ marginTop: 8, padding: '7px 12px', background: c.subtle, borderRadius: t.radius, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: c.ink3 }}>ระยะเวลา</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: c.ink }}>{calcDuration(scheduleForm.startTime, scheduleForm.endTime)}</span>
                </div>
              ) : scheduleErrors.time ? (
                <div style={{ fontSize: 11, color: c.neg, marginTop: 4 }}>{scheduleErrors.time}</div>
              ) : null}
            </div>

            <div>
              <label style={{ ...lbl, marginBottom: 5 }}>
                หัวข้อ / Topic{' '}
                <span style={{ color: c.accent, fontWeight: 500, textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>* จำเป็น</span>
              </label>
              <input value={scheduleForm.topic} onChange={e => { setScheduleForm(f => ({ ...f, topic: e.target.value })); setScheduleErrors(er => ({ ...er, topic: undefined })) }} placeholder="เช่น รีวิวอาหารใหม่ แฮมอน+ไก่..." style={{ ...inp, background: c.subtle }} />
              {scheduleErrors.topic && <div style={{ fontSize: 11, color: c.neg, marginTop: 4 }}>{scheduleErrors.topic}</div>}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 24px', borderTop: `1px solid ${c.border}`, background: c.surface, display: 'flex', gap: 10, flexShrink: 0 }}>
            <button onClick={() => setShowPanel(false)} style={{ flex: 1, padding: 11, border: `1px solid ${c.border}`, borderRadius: t.radius, fontSize: 13, color: c.ink2, background: c.canvas, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>ยกเลิก</button>
            <button onClick={submitSchedule} style={{ flex: 2, padding: 11, border: 'none', borderRadius: t.radius, fontSize: 13, fontWeight: 700, color: '#fff', background: c.accent, cursor: 'pointer', fontFamily: 'inherit' }}>บันทึก Schedule</button>
          </div>
        </div>
      )}

      <TopBar
        t={t}
        breadcrumb={['Chawy', 'Channels', 'Live & Content']}
        title="Live & Content"
        subtitle="ไลฟ์และคอนเทนต์ · ปฏิทินไลฟ์และผลงานโพสต์"
        right={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {toast && <span style={{ fontSize: 12, color: c.pos, fontWeight: 700 }}>{toast}</span>}
            <Btn t={t} variant="ghost" onClick={() => setShowCalendar(v => !v)}>
              {showCalendar ? 'List View' : 'Content Calendar'}
            </Btn>
            <Btn t={t} variant="primary" onClick={() => { setShowPanel(v => !v); setScheduleErrors({}) }}>
              {showPanel ? 'Cancel' : '+ Schedule Live'}
            </Btn>
          </div>
        }
      />

      <div style={{ padding: '24px 32px 48px' }}>

        {/* ── KPI Tiles ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Reach · MTD', value: fmtNum(totalReach), sub: `${contentPosts.length} posts`, primary: true },
            { label: 'Avg. Engagement',   value: `${avgEng.toFixed(1)}%`, sub: 'across posts' },
            { label: 'Scheduled Lives',   value: scheduledCount.toString(), sub: 'upcoming' },
            { label: 'Best Post Reach',   value: fmtNum(maxReach), sub: 'top performer' },
          ].map(tile => (
            <div key={tile.label} style={{ background: tile.primary ? c.subtle : c.surface, border: `1px solid ${c.border}`, borderRadius: t.radius, padding: '18px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: c.ink3 }}>{tile.label}</div>
              <Mono t={t} size={24} weight={600} style={{ display: 'block', marginTop: 10 }}>{tile.value}</Mono>
              <div style={{ fontSize: 11, color: c.ink3, marginTop: 6 }}>{tile.sub}</div>
            </div>
          ))}
        </div>


        {/* ── Content Calendar View ─────────────────────────────── */}
        {showCalendar && (
          <Card t={t} pad={false} style={{ marginBottom: 24 }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${c.border}`, fontSize: 14, fontWeight: 700, color: c.ink }}>Content Calendar</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['วันที่', 'เวลา', 'แพลตฟอร์ม', 'หัวข้อ', 'Host', 'Status', ''].map(h => (
                    <th key={h} style={{ ...th, textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...contentSchedule].sort((a, b) => a.date.localeCompare(b.date)).map((s, i, arr) => (
                  <tr key={s.id} onMouseEnter={e => (e.currentTarget.style.background = c.subtle)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ ...td, borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}><Mono t={t} size={12}>{s.date}</Mono></td>
                    <td style={{ ...td, borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}><Mono t={t} size={12}>{s.startTime}–{s.endTime}</Mono></td>
                    <td style={{ ...td, borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none', color: c.accent, fontWeight: 500 }}>{s.platform}</td>
                    <td style={{ ...td, borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none', fontWeight: 500, color: c.ink }}>{s.topic}</td>
                    <td style={{ ...td, borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}><Mono t={t} size={11} color={c.accent}>{s.account}</Mono></td>
                    <td style={{ ...td, borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                      <StatusPill t={t} status={s.status === 'scheduled' ? 'shipped' : s.status} />
                    </td>
                    <td style={{ ...td, borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {s.status === 'draft' && (
                          <button onClick={() => updateContentScheduleStatus(s.id, 'scheduled')} style={{ fontSize: 11, padding: '3px 8px', border: `1px solid ${c.border}`, borderRadius: t.radius, background: c.surface, color: c.ink2, cursor: 'pointer' }}>Confirm</button>
                        )}
                        {s.status === 'scheduled' && (
                          <button onClick={() => updateContentScheduleStatus(s.id, 'done')} style={{ fontSize: 11, padding: '3px 8px', border: `1px solid ${c.border}`, borderRadius: t.radius, background: c.surface, color: c.ink2, cursor: 'pointer' }}>Done</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* ── Upcoming Live Schedule ─────────────────────────────── */}
        <SectionLabel t={t}>Upcoming Live Schedule</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {contentSchedule.filter(s => s.status !== 'done').slice(0, 3).map(s => (
            <Card t={t} key={s.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: c.accent, letterSpacing: '0.04em' }}>{s.platform}</span>
                <StatusPill t={t} status={s.status === 'scheduled' ? 'shipped' : 'draft'} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: c.ink, letterSpacing: '-0.01em', lineHeight: 1.35, minHeight: 42 }}>{s.topic}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${c.border}` }}>
                <div>
                  <div style={{ fontSize: 10, color: c.ink3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>วันเวลา</div>
                  <Mono t={t} size={12} weight={500} style={{ marginTop: 2, display: 'block' }}>{s.date} · {s.startTime}–{s.endTime}</Mono>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <div style={{ fontSize: 10, color: c.ink3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>ช่อง</div>
                  <Mono t={t} size={12} weight={500} color={c.accent} style={{ marginTop: 2, display: 'block' }}>{s.account}</Mono>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Content Performance ────────────────────────────────── */}
        <SectionLabel t={t}>Content Performance</SectionLabel>
        <Card t={t} pad={false} style={{ marginBottom: 32 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[{ l: 'Content' }, { l: 'Platform' }, { l: 'Reach', r: true }, { l: 'Engagement', r: true }, { l: 'Posted', r: true }].map(h => (
                  <th key={h.l} style={{ ...th, textAlign: h.r ? 'right' : 'left' }}>{h.l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contentPosts.map((p, i, arr) => (
                <tr key={i} style={{ cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = c.subtle)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...td, borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{p.title}</span>
                  </td>
                  <td style={{ ...td, borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                    <span style={{ fontSize: 12, color: c.ink2 }}>{p.platform}</span>
                  </td>
                  <td style={{ ...td, textAlign: 'right', borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                      <div style={{ width: 70, height: 6, background: c.subtle, borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${(p.reach / maxReach) * 100}%`, height: '100%', background: c.accent }} />
                      </div>
                      <Mono t={t} size={13} weight={600} style={{ minWidth: 60, textAlign: 'right' }}>{fmtNum(p.reach)}</Mono>
                    </div>
                  </td>
                  <td style={{ ...td, textAlign: 'right', borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                    <Mono t={t} size={12} weight={500} color={p.eng >= 6 ? c.pos : c.ink2}>{p.eng.toFixed(1)}%</Mono>
                  </td>
                  <td style={{ ...td, textAlign: 'right', borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                    <Mono t={t} size={11} color={c.ink3}>{p.date}</Mono>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* ── Live Operations divider ────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 28, marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: c.ink, marginBottom: 2 }}>Live Operations</div>
          <div style={{ fontSize: 13, color: c.ink3 }}>บันทึกเวลา ยอดขาย คลิป และ Payroll Export</div>
        </div>

        {/* Rounding toggle + export buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end', marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', padding: 3, background: c.subtle, borderRadius: 8, border: `1px solid ${c.border}` }}>
            {[{ key: 'actual', label: 'Actual' }, { key: 'quarter_up', label: '15m Up' }].map(item => (
              <button key={item.key} onClick={() => setRoundingPolicy(item.key as RoundingPolicy)} style={{
                padding: '6px 12px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: roundingPolicy === item.key ? c.surface : 'transparent',
                color: roundingPolicy === item.key ? c.accent : c.ink3,
                boxShadow: roundingPolicy === item.key ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              }}>{item.label}</button>
            ))}
          </div>
          <button onClick={exportPayrollCsv} style={{ padding: '8px 12px', border: `1px solid ${c.border}`, background: c.surface, borderRadius: t.radius, color: c.ink2, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Download size={15} /> CSV
          </button>
          <button onClick={() => window.print()} style={{ padding: '8px 12px', border: 'none', background: c.accent, borderRadius: t.radius, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Printer size={15} /> PDF
          </button>
        </div>

        {/* ── Checkout slide panel ──────────────────────────────── */}
        {showCheckoutPanel && (
          <div onClick={() => setShowCheckoutPanel(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />
        )}
        {showCheckoutPanel && (
          <div style={{ position: 'fixed', top: 0, left: 252, bottom: 0, width: 400, background: c.surface, borderRight: `1px solid ${c.border}`, zIndex: 50, display: 'flex', flexDirection: 'column', boxShadow: '8px 0 32px rgba(0,0,0,0.12)' }}>
            <div style={{ background: c.accent, padding: '18px 24px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Staff Check-out</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>บันทึกไลฟ์หลังจบ · รอ Manager อนุมัติ</div>
              </div>
              <button onClick={() => setShowCheckoutPanel(false)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={lbl}>พนักงาน</label>
                  <select value={form.staff_id} onChange={e => setForm(f => ({ ...f, staff_id: e.target.value }))} style={{ ...inp, background: c.subtle }}>
                    {liveStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>แพลตฟอร์ม</label>
                  <select value={form.platform} onChange={e => { const p = e.target.value as LivePlatform; setForm(f => ({ ...f, platform: p, tiktok_account: LIVE_ACCOUNTS[p][0] })) }} style={{ ...inp, background: c.subtle }}>
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>บัญชีไลฟ์</label>
                <select value={form.tiktok_account} onChange={e => setForm(f => ({ ...f, tiktok_account: e.target.value }))} style={{ ...inp, background: c.subtle }}>
                  {LIVE_ACCOUNTS[form.platform].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={lbl}>วันที่ไลฟ์</label>
                  <input type="date" value={form.live_date} onChange={e => setForm(f => ({ ...f, live_date: e.target.value }))} style={{ ...inp, background: c.subtle, boxSizing: 'border-box' }} />
                </div>
                <div><label style={lbl}>พัก (นาที)</label>
                  <input type="number" min={0} value={form.break_minutes} onChange={e => setForm(f => ({ ...f, break_minutes: Math.max(0, Number(e.target.value) || 0) }))} style={{ ...inp, background: c.subtle }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={lbl}>เริ่ม</label>
                  <input type="datetime-local" value={form.start_datetime} onChange={e => setForm(f => ({ ...f, start_datetime: e.target.value }))} style={{ ...inp, background: c.subtle, fontSize: 12, boxSizing: 'border-box' }} />
                </div>
                <div><label style={lbl}>จบ</label>
                  <input type="datetime-local" value={form.end_datetime} onChange={e => setForm(f => ({ ...f, end_datetime: e.target.value }))} style={{ ...inp, background: c.subtle, fontSize: 12, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ padding: 11, borderRadius: t.radius, background: c.subtle, display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: c.ink3, fontWeight: 600 }}>Net working time</span>
                <span style={{ fontSize: 13, color: c.ink, fontWeight: 700 }}>{formNetMinutes} นาที · {formHours.toFixed(2)} ชม.</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>ยอดขายสุทธิจากไลฟ์</label>
                <input type="number" min={0} value={form.revenue_generated} onChange={e => setForm(f => ({ ...f, revenue_generated: Math.max(0, Number(e.target.value) || 0) }))} style={{ ...inp, background: c.subtle }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 0 12px' }}>
                <input id="has_clip" type="checkbox" checked={form.has_clip} onChange={e => setForm(f => ({ ...f, has_clip: e.target.checked }))} />
                <label htmlFor="has_clip" style={{ fontSize: 13, fontWeight: 600, color: c.ink2 }}>มีคลิปหลังไลฟ์แล้ว</label>
              </div>
              <div style={{ display: 'grid', gap: 12, marginBottom: 12 }}>
                <div><label style={lbl}><LinkIcon size={13} style={{ verticalAlign: 'text-bottom' }} /> ลิงก์คลิป</label>
                  <input value={form.clip_link} onChange={e => setForm(f => ({ ...f, clip_link: e.target.value }))} placeholder="https://" style={{ ...inp, background: c.subtle }} />
                </div>
                <div><label style={lbl}><ImageIcon size={13} style={{ verticalAlign: 'text-bottom' }} /> รูปสรุปไลฟ์</label>
                  <input value={form.live_summary_image} onChange={e => setForm(f => ({ ...f, live_summary_image: e.target.value }))} placeholder="URL รูป Screenshot" style={{ ...inp, background: c.subtle }} />
                </div>
              </div>
              <div><label style={lbl}>Host notes / Feedback</label>
                <textarea value={form.host_notes} onChange={e => setForm(f => ({ ...f, host_notes: e.target.value }))} rows={3} style={{ ...inp, background: c.subtle, resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${c.border}`, background: c.surface, display: 'flex', gap: 10, flexShrink: 0 }}>
              <button onClick={() => setShowCheckoutPanel(false)} style={{ flex: 1, padding: 11, border: `1px solid ${c.border}`, borderRadius: t.radius, fontSize: 13, color: c.ink2, background: c.canvas, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>ยกเลิก</button>
              <button onClick={() => { submitSession(); setShowCheckoutPanel(false) }} style={{ flex: 2, padding: 11, border: 'none', borderRadius: t.radius, fontSize: 13, fontWeight: 700, color: '#fff', background: c.accent, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Send size={15} /> Submit for Approval
              </button>
            </div>
          </div>
        )}

        {/* ── Control Tower (full width) ────────────────────────── */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: t.radius, marginBottom: 18 }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: c.ink }}>Control Tower · Review Queue</div>
                <div style={{ fontSize: 12, color: c.ink3, marginTop: 2 }}>{analytics.pending.length} รายการรอตรวจ</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowCheckoutPanel(v => !v)} style={{ padding: '8px 12px', border: `1px solid ${c.border}`, borderRadius: t.radius, background: showCheckoutPanel ? c.accentBg : c.surface, color: showCheckoutPanel ? c.accent : c.ink2, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Video size={14} /> {showCheckoutPanel ? 'ปิดฟอร์ม' : 'Log Session'}
                </button>
                <button disabled={selectedIds.length === 0} onClick={() => approve(selectedIds)} style={{ padding: '8px 12px', border: 'none', borderRadius: t.radius, background: selectedIds.length ? c.pos : c.border, color: selectedIds.length ? '#fff' : c.ink4, fontSize: 12, fontWeight: 700, cursor: selectedIds.length ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <CheckSquare size={15} /> Bulk Approve ({selectedIds.length})
                </button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={opsTh}></th><th style={opsTh}>Live</th><th style={opsTh}>เวลา</th><th style={{ ...opsTh, textAlign: 'right' }}>Revenue</th><th style={opsTh}>Content</th><th style={opsTh}>Note</th><th style={opsTh}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.pending.map(session => {
                    const selected = selectedIds.includes(session.id)
                    const minutes = getRoundedLiveMinutes(getLiveNetMinutes(session), roundingPolicy)
                    return (
                      <tr key={session.id}>
                        <td style={opsTd}>
                          <button onClick={() => setSelectedIds(ids => ids.includes(session.id) ? ids.filter(r => r !== session.id) : [...ids, session.id])} style={{ border: 'none', background: 'transparent', color: selected ? c.accent : c.ink4, cursor: 'pointer', padding: 0 }}>
                            {selected ? <CheckSquare size={17} /> : <Square size={17} />}
                          </button>
                        </td>
                        <td style={opsTd}>
                          <div style={{ fontWeight: 700, color: c.ink }}>{getStaffName(session.staff_id)}</div>
                          <div style={{ color: c.ink3, marginTop: 2 }}>{dateLabel(session.live_date)} · {session.platform}</div>
                        </td>
                        <td style={opsTd}>
                          <div style={{ color: c.ink, fontWeight: 600 }}>{timeLabel(session.start_datetime)} - {timeLabel(session.end_datetime)}</div>
                          <div style={{ color: c.ink3, marginTop: 2 }}>{minutes} นาที · {getLiveDecimalHours(minutes).toFixed(2)} ชม.</div>
                        </td>
                        <td style={{ ...opsTd, textAlign: 'right', fontWeight: 700, color: c.ink }}>{formatBaht(session.revenue_generated)}</td>
                        <td style={opsTd}>
                          <span style={{ color: session.has_clip ? c.pos : c.warn, fontWeight: 700 }}>{session.has_clip ? 'มีคลิป' : 'ไม่มีคลิป'}</span>
                        </td>
                        <td style={{ ...opsTd, maxWidth: 180, color: c.ink2 }}>{session.host_notes}</td>
                        <td style={opsTd}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => approve([session.id])} style={{ padding: 6, borderRadius: 6, border: 'none', background: c.posBg, color: c.pos, cursor: 'pointer' }}><Check size={14} /></button>
                            <button onClick={() => reject(session.id)} style={{ padding: 6, borderRadius: 6, border: 'none', background: c.negBg, color: c.neg, cursor: 'pointer' }}><X size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {analytics.pending.length === 0 && <tr><td colSpan={7} style={{ ...opsTd, textAlign: 'center', color: c.ink3, padding: 30 }}>ไม่มีรายการรออนุมัติ</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

        {/* ── Payroll + Content Gap ──────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(300px, 0.9fr)', gap: 18, marginBottom: 18 }}>
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: t.radius }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: c.ink }}>Payroll Export Preview</div>
                <div style={{ fontSize: 12, color: c.ink3, marginTop: 2 }}>(Total Hours × ฿{livePayroll.hourlyRate}/ชม.) + (Clips × ฿{livePayroll.clipBonus}/คลิป)</div>
              </div>
              <FileText size={18} color={c.ink4} />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  {['พนักงาน', 'ชั่วโมง', 'ยอดขาย', 'คลิป', 'Hourly', 'Clip Bonus', 'ยอดจ่าย'].map(h => (
                    <th key={h} style={{ ...opsTh, textAlign: ['ยอดขาย', 'Hourly', 'Clip Bonus', 'ยอดจ่าย'].includes(h) ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {(canSeeAllPayroll ? payrollRows : payrollRows.filter(r => r.staff.name === currentUser.name)).map(row => (
                    <tr key={row.staff.id}>
                      <td style={opsTd}>
                        <div style={{ fontWeight: 700, color: c.ink }}>{row.staff.name}</div>
                        <div style={{ color: c.ink3, marginTop: 2 }}>{row.staff.role}</div>
                      </td>
                      <td style={{ ...opsTd, fontWeight: 700 }}>{row.hours.toFixed(2)}</td>
                      <td style={{ ...opsTd, textAlign: 'right', fontWeight: 700 }}>{formatBaht(row.revenue)}</td>
                      <td style={opsTd}>{row.clips}</td>
                      <td style={{ ...opsTd, textAlign: 'right', fontWeight: 700 }}>{formatBaht(row.hourlyPay)}</td>
                      <td style={{ ...opsTd, textAlign: 'right', color: c.warn, fontWeight: 700 }}>{formatBaht(row.clipBonus)}</td>
                      <td style={{ ...opsTd, textAlign: 'right', fontWeight: 800 }}>{formatBaht(row.grossPay)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: t.radius }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${c.border}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: c.ink }}>Content Gap Report</div>
              <div style={{ fontSize: 12, color: c.ink3, marginTop: 2 }}>ไลฟ์แล้วแต่ยังไม่มีคลิป</div>
            </div>
            <div style={{ padding: 12, display: 'grid', gap: 8 }}>
              {analytics.contentGaps.map(session => (
                <div key={session.id} style={{ border: `1px solid ${c.border}`, borderRadius: t.radius, padding: 11, background: c.canvas }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c.ink }}>{dateLabel(session.live_date)} · {getStaffName(session.staff_id)}</div>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: STATUS_STYLE[session.status].bg, color: STATUS_STYLE[session.status].color, fontWeight: 600 }}>{STATUS_STYLE[session.status].label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: c.ink3, marginTop: 5 }}>{session.platform} · {formatBaht(session.revenue_generated)}</div>
                </div>
              ))}
              {analytics.contentGaps.length === 0 && <div style={{ color: c.ink3, fontSize: 13, padding: 18, textAlign: 'center' }}>ไม่มีช่องว่าง Content</div>}
            </div>
          </div>
        </div>

        {/* ── Live Session Ledger ────────────────────────────────── */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: t.radius }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${c.border}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: c.ink }}>Live Session Ledger</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['Session', 'บัญชี', 'เวลา', 'Net', 'Revenue', 'Content', 'Status', 'Audit'].map(h => (
                  <th key={h} style={{ ...opsTh, textAlign: ['Net', 'Revenue'].includes(h) ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {sessions.map(session => {
                  const minutes = getRoundedLiveMinutes(getLiveNetMinutes(session), roundingPolicy)
                  return (
                    <tr key={session.id}>
                      <td style={opsTd}>
                        <div style={{ fontFamily: 'monospace', color: c.accent, fontWeight: 700 }}>{session.id}</div>
                        <div style={{ color: c.ink3, marginTop: 2 }}>{getStaffName(session.staff_id)} · {dateLabel(session.live_date)}</div>
                      </td>
                      <td style={opsTd}>{session.tiktok_account}</td>
                      <td style={opsTd}>{timeLabel(session.start_datetime)} - {timeLabel(session.end_datetime)}</td>
                      <td style={{ ...opsTd, textAlign: 'right', fontWeight: 700 }}>{minutes}m</td>
                      <td style={{ ...opsTd, textAlign: 'right', fontWeight: 700 }}>{formatBaht(session.revenue_generated)}</td>
                      <td style={opsTd}>{session.has_clip ? 'Clip' : 'No clip'} · {session.live_summary_image ? 'Image' : 'No image'}</td>
                      <td style={opsTd}><span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: STATUS_STYLE[session.status].bg, color: STATUS_STYLE[session.status].color, fontWeight: 600 }}>{STATUS_STYLE[session.status].label}</span></td>
                      <td style={{ ...opsTd, color: c.ink3 }}>
                        <div>{adminUsers.find(a => a.id === session.approved_by)?.name ?? session.updatedBy}</div>
                        <div style={{ marginTop: 2, fontSize: 11 }}>{session.updatedAt}</div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
