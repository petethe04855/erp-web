'use client'
import { useState } from 'react'
import { useTheme } from '@/lib/design/ThemeContext'
import { Btn, Card, TopBar } from '@/components/ui'
import { useErpStore } from '@/lib/store/useErpStore'
import type { ModuleSettings } from '@/lib/store/erpTypes'

type Tab = 'company' | 'notifications' | 'products' | 'reorder' | 'modules' | 'livePayroll' | 'about'
const TABS: Array<{ id: Tab; label: string; sub: string }> = [
  { id: 'company',       label: 'Company',       sub: 'ข้อมูลบริษัท' },
  { id: 'notifications', label: 'Notifications', sub: 'การแจ้งเตือน' },
  { id: 'products',      label: 'Products',      sub: 'หมวดหมู่สินค้า' },
  { id: 'reorder',       label: 'Reorder',       sub: 'Reorder Level' },
  { id: 'modules',       label: 'Modules',       sub: 'เปิด-ปิด Module' },
  { id: 'livePayroll',   label: 'Live Payroll',  sub: 'อัตราค่าแรง' },
  { id: 'about',         label: 'About',         sub: 'เกี่ยวกับระบบ' },
]

const MODULE_SECTIONS: Array<{
  section: string
  items: Array<{ key: keyof ModuleSettings; label: string; desc: string }>
}> = [
  {
    section: 'SALES',
    items: [
      { key: 'quotation',   label: 'Quotation',   desc: 'ใบเสนอราคา' },
      { key: 'salesOrders', label: 'Sales Order', desc: 'ออร์เดอร์ขาย' },
      { key: 'invoice',     label: 'Invoice',     desc: 'ใบแจ้งหนี้' },
      { key: 'returns',     label: 'Returns',     desc: 'คืนสินค้า' },
    ],
  },
  {
    section: 'PURCHASING',
    items: [
      { key: 'purchaseReq',   label: 'Purchase Requisition', desc: 'ใบขอซื้อ' },
      { key: 'purchaseOrder', label: 'Purchase Order',       desc: 'ใบสั่งซื้อ' },
    ],
  },
  {
    section: 'INVENTORY',
    items: [
      { key: 'skuMaster',     label: 'SKU Master',     desc: 'ข้อมูลสินค้า' },
      { key: 'stockBalance',  label: 'Stock Balance',  desc: 'สต็อคคงคลัง' },
      { key: 'goodsReceive',  label: 'Goods Receive',  desc: 'รับสินค้าเข้า' },
      { key: 'goodsIssue',    label: 'Goods Issue',    desc: 'เบิกสินค้าออก' },
      { key: 'stockTransfer', label: 'Stock Transfer', desc: 'โอนสต็อค' },
      { key: 'stockCheck',    label: 'Stock Checking', desc: 'นับสต็อค' },
    ],
  },
  {
    section: 'FINANCE',
    items: [
      { key: 'expenses', label: 'Expenses',   desc: 'ค่าใช้จ่าย' },
      { key: 'plReport', label: 'P&L Report', desc: 'กำไร-ขาดทุน' },
      { key: 'budget',   label: 'Budget',     desc: 'งบประมาณ' },
    ],
  },
  {
    section: 'CHANNELS',
    items: [
      { key: 'tiktokOrders',     label: 'TikTok Orders',     desc: 'ออร์เดอร์ TikTok' },
      { key: 'liveContent',      label: 'Live & Content',    desc: 'ไลฟ์และคอนเทนต์' },
      { key: 'manualOrder',      label: 'Manual Order',      desc: 'บันทึกออเดอร์อื่นๆ' },
      { key: 'tiktokCalculator', label: 'TikTok Calculator', desc: 'คำนวณค่าธรรมเนียม' },
      { key: 'sampling',         label: 'Sampling',          desc: 'แจกตัวอย่าง' },
    ],
  },
  {
    section: 'SYSTEM',
    items: [
      { key: 'userManagement', label: 'User Management', desc: 'จัดการผู้ใช้' },
      { key: 'tiktokSetup',    label: 'TikTok Setup',    desc: 'เชื่อม API' },
    ],
  },
]

function Toggle({ t, on, onToggle }: { t: ReturnType<typeof useTheme>['tokens']; on: boolean; onToggle: () => void }) {
  const c = t.color
  return (
    <button
      onClick={onToggle}
      style={{ display: 'inline-flex', alignItems: 'center', width: 40, height: 22, borderRadius: 999, background: on ? c.accent : c.borderStrong, padding: 3, border: 'none', cursor: 'pointer', flexShrink: 0 }}
    >
      <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', transform: on ? 'translateX(18px)' : 'translateX(0)', transition: 'transform 160ms', boxShadow: '0 1px 2px rgba(0,0,0,0.25)', display: 'block' }} />
    </button>
  )
}

function Field({ t, label, sub, children }: { t: ReturnType<typeof useTheme>['tokens']; label: string; sub?: string; children: React.ReactNode }) {
  const c = t.color
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: c.ink2, marginBottom: 5 }}>{label}</label>
      {sub && <div style={{ fontSize: 11, color: c.ink3, marginBottom: 5 }}>{sub}</div>}
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const { tokens: t } = useTheme()
  const c = t.color

  const settings       = useErpStore(s => s.settings)
  const updateSettings = useErpStore(s => s.updateSettings)
  const products       = useErpStore(s => s.products)
  const updateProduct  = useErpStore(s => s.updateProduct)

  const [activeTab, setActiveTab] = useState<Tab>('company')
  const [saved, setSaved]   = useState(false)

  const [company, setCompany] = useState(() => ({
    ...settings.company,
    vatRate: String(settings.company.vatRate),
  }))

  const [payrollDraft, setPayrollDraft] = useState(() => ({
    hourlyRate: String(settings.livePayroll.hourlyRate),
    clipBonus:  String(settings.livePayroll.clipBonus),
  }))

  const [reorderDraft, setReorderDraft] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    for (const p of products) if (!p.isBundle) map[p.sku] = p.reorder
    return map
  })

  const [categories, setCategories] = useState(['อาหารแห้ง', 'อาหารเปียก', 'ขนม', 'อาหารเสริม', 'อื่นๆ'])
  const [newCat, setNewCat] = useState('')

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  function saveCompany() {
    updateSettings({ company: { ...company, vatRate: parseFloat(company.vatRate) || 0 } })
    flash()
  }

  function saveLivePayroll() {
    updateSettings({
      livePayroll: {
        hourlyRate: Math.max(0, parseFloat(payrollDraft.hourlyRate) || 0),
        clipBonus:  Math.max(0, parseFloat(payrollDraft.clipBonus)  || 0),
      },
    })
    flash()
  }

  function saveReorder() {
    for (const p of products) {
      if (p.isBundle) continue
      const newVal = reorderDraft[p.sku] ?? p.reorder
      if (newVal !== p.reorder) updateProduct({ sku: p.sku, reorder: newVal })
    }
    flash()
  }

  function toggleNotif(key: keyof typeof settings.notifications) {
    if (key === 'nearExpiryDays') return
    const n = settings.notifications
    updateSettings({ notifications: { ...n, [key]: !n[key as keyof typeof n] } })
  }

  function toggleModule(key: keyof ModuleSettings) {
    updateSettings({ modules: { ...settings.modules, [key]: !settings.modules[key] } })
  }

  const showSave = activeTab === 'company' || activeTab === 'reorder' || activeTab === 'livePayroll'

  const inp: React.CSSProperties = {
    width: '100%', padding: '8px 12px', border: `1px solid ${c.border}`,
    borderRadius: t.radius, fontSize: 13, outline: 'none',
    background: c.surface, color: c.ink, boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'System', 'Settings']}
        title="Master Settings"
        subtitle="ตั้งค่าหลัก · ข้อมูลบริษัทและการกำหนดค่าระบบ"
        right={showSave ? (
          <Btn t={t} variant="primary" onClick={() => {
            if (activeTab === 'company') saveCompany()
            else if (activeTab === 'reorder') saveReorder()
            else saveLivePayroll()
          }}>
            {saved ? 'Saved ✓' : 'Save Changes'}
          </Btn>
        ) : undefined}
      />

      <div style={{ padding: '24px 32px 48px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, alignItems: 'start', maxWidth: 1040 }}>

        {/* Tab nav */}
        <Card t={t} style={{ padding: 8 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSaved(false) }}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: t.radius, border: 'none',
                cursor: 'pointer', textAlign: 'left', display: 'block', marginBottom: 2,
                background: activeTab === tab.id ? c.accentBg : 'transparent',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400, color: activeTab === tab.id ? c.accent : c.ink2 }}>{tab.label}</div>
              <div style={{ fontSize: 11, color: c.ink3, marginTop: 1 }}>{tab.sub}</div>
            </button>
          ))}
        </Card>

        {/* Content */}
        <Card t={t} style={{ padding: '24px 28px' }}>

          {/* Company */}
          {activeTab === 'company' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.ink, marginBottom: 20 }}>ข้อมูลบริษัท</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {([
                  { field: 'name',    label: 'ชื่อบริษัท / แบรนด์ *' },
                  { field: 'taxId',   label: 'เลขประจำตัวผู้เสียภาษี' },
                  { field: 'phone',   label: 'โทรศัพท์' },
                  { field: 'email',   label: 'อีเมล' },
                  { field: 'website', label: 'เว็บไซต์' },
                ] as Array<{ field: keyof typeof company; label: string }>).map(({ field, label }) => (
                  <Field key={field} t={t} label={label}>
                    <input value={String(company[field])} onChange={e => setCompany(p => ({ ...p, [field]: e.target.value }))} style={inp} />
                  </Field>
                ))}
                <Field t={t} label="ที่อยู่">
                  <textarea value={company.address} onChange={e => setCompany(p => ({ ...p, address: e.target.value }))} rows={2} style={{ ...inp, resize: 'vertical' }} />
                </Field>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.ink, marginBottom: 16, paddingTop: 16, borderTop: `1px solid ${c.border}` }}>ค่าระบบ</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <Field t={t} label="สกุลเงิน">
                  <select value={company.currency} onChange={e => setCompany(p => ({ ...p, currency: e.target.value }))} style={inp}>
                    {['THB', 'USD', 'SGD'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field t={t} label="VAT (%)">
                  <input value={company.vatRate} onChange={e => setCompany(p => ({ ...p, vatRate: e.target.value }))} style={inp} />
                </Field>
                <Field t={t} label="Invoice Prefix">
                  <input value={company.invoicePrefix} onChange={e => setCompany(p => ({ ...p, invoicePrefix: e.target.value }))} style={inp} />
                </Field>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.ink, marginBottom: 8 }}>ตั้งค่าการแจ้งเตือน</div>
              <div style={{ fontSize: 12, color: c.ink3, marginBottom: 16, background: c.surface, padding: '8px 12px', borderRadius: t.radius, border: `1px solid ${c.border}` }}>
                การเปลี่ยนแปลงบันทึกทันที
              </div>
              {[
                { key: 'nearExpiry' as const, label: 'แจ้งเตือนสินค้าใกล้หมดอายุ', desc: 'เตือนเมื่อ Lot มีวันหมดอายุน้อยกว่าที่กำหนด' },
                { key: 'lowStock'   as const, label: 'แจ้งเตือนสต็อกต่ำ',            desc: 'เตือนเมื่อสต็อกต่ำกว่า Reorder Level' },
                { key: 'latePO'     as const, label: 'แจ้งเตือน PO ล่าช้า',           desc: 'เตือนเมื่อ PO เกิน ETA แล้วยังไม่รับของ' },
                { key: 'newSO'      as const, label: 'แจ้งเตือน SO ใหม่',              desc: 'เตือนเมื่อมีออร์เดอร์เข้าใหม่' },
                { key: 'paymentDue' as const, label: 'แจ้งเตือนใบแจ้งหนี้ครบกำหนด',  desc: 'เตือนก่อน Invoice ครบกำหนด 3 วัน' },
              ].map((item, i, arr) => (
                <div key={item.key} style={{ padding: '14px 0', borderBottom: i < arr.length - 1 ? `1px solid ${c.border}` : 'none', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: c.ink3, marginTop: 3 }}>{item.desc}</div>
                    {item.key === 'nearExpiry' && settings.notifications.nearExpiry && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <span style={{ fontSize: 12, color: c.ink2 }}>แจ้งเตือนก่อน</span>
                        <input
                          type="number" min={1} max={90}
                          value={settings.notifications.nearExpiryDays}
                          onChange={e => updateSettings({ notifications: { ...settings.notifications, nearExpiryDays: parseInt(e.target.value) || 30 } })}
                          style={{ width: 60, padding: '5px 8px', border: `1px solid ${c.border}`, borderRadius: t.radius, fontSize: 12, textAlign: 'center', outline: 'none', background: c.surface, color: c.ink }}
                        />
                        <span style={{ fontSize: 12, color: c.ink2 }}>วัน</span>
                      </div>
                    )}
                  </div>
                  <Toggle t={t} on={Boolean(settings.notifications[item.key])} onToggle={() => toggleNotif(item.key)} />
                </div>
              ))}
            </div>
          )}

          {/* Products */}
          {activeTab === 'products' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.ink, marginBottom: 16 }}>หมวดหมู่สินค้า</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                  value={newCat} onChange={e => setNewCat(e.target.value)}
                  placeholder="ชื่อหมวดหมู่ใหม่..."
                  style={{ ...inp, flex: 1 }}
                  onKeyDown={e => { if (e.key === 'Enter' && newCat.trim()) { setCategories(p => [...p, newCat.trim()]); setNewCat('') } }}
                />
                <Btn t={t} variant="primary" onClick={() => { if (newCat.trim()) { setCategories(p => [...p, newCat.trim()]); setNewCat('') } }}>+ เพิ่ม</Btn>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {categories.map((cat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: t.radius, background: c.surface, border: `1px solid ${c.border}` }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: c.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: c.ink }}>{cat}</span>
                    <button onClick={() => setCategories(p => p.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.neg, fontSize: 18, lineHeight: 1, padding: '0 4px' }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reorder */}
          {activeTab === 'reorder' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.ink, marginBottom: 4 }}>Reorder Level</div>
              <div style={{ fontSize: 13, color: c.ink3, marginBottom: 16 }}>กำหนดจำนวนขั้นต่ำที่จะแจ้งเตือนให้สั่งซื้อเพิ่ม</div>
              <div style={{ border: `1px solid ${c.border}`, borderRadius: t.radius, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: c.surface }}>
                      {['สินค้า', 'SKU', 'สต็อก', 'Reorder'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: c.ink3, borderBottom: `1px solid ${c.border}`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.filter(p => !p.isBundle).map((p, i) => (
                      <tr key={p.sku} style={{ background: i % 2 === 0 ? c.canvas : c.surface }}>
                        <td style={{ padding: '11px 14px', fontSize: 13, borderBottom: `1px solid ${c.border}`, fontWeight: 500, color: c.ink }}>{p.name}</td>
                        <td style={{ padding: '11px 14px', fontSize: 11, borderBottom: `1px solid ${c.border}`, fontFamily: 'monospace', color: c.ink3 }}>{p.sku}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13, borderBottom: `1px solid ${c.border}`, fontWeight: 700, color: p.stock <= (reorderDraft[p.sku] ?? p.reorder) ? c.neg : c.pos }}>{p.stock}</td>
                        <td style={{ padding: '11px 14px', borderBottom: `1px solid ${c.border}` }}>
                          <input
                            type="number" min={0}
                            value={reorderDraft[p.sku] ?? p.reorder}
                            onChange={e => setReorderDraft(d => ({ ...d, [p.sku]: parseInt(e.target.value) || 0 }))}
                            style={{ width: 80, padding: '5px 8px', border: `1px solid ${c.border}`, borderRadius: t.radius, fontSize: 13, textAlign: 'center', outline: 'none', background: c.surface, color: c.ink }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modules */}
          {activeTab === 'modules' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.ink, marginBottom: 8 }}>เปิด-ปิด Modules</div>
              <div style={{ fontSize: 12, color: c.ink2, marginBottom: 20, padding: '10px 14px', background: c.surface, borderRadius: t.radius, border: `1px solid ${c.border}`, borderLeft: `3px solid ${c.warn}` }}>
                ปิด module แล้วข้อมูลยังอยู่ครบ — แค่ซ่อนออกจาก sidebar. Dashboard และ Settings เปิดเสมอ
              </div>
              {MODULE_SECTIONS.map(group => (
                <div key={group.section} style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: c.ink3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{group.section}</div>
                  <div style={{ border: `1px solid ${c.border}`, borderRadius: t.radius, overflow: 'hidden' }}>
                    {group.items.map((item, idx) => (
                      <div
                        key={item.key}
                        style={{
                          padding: '14px 16px',
                          borderBottom: idx < group.items.length - 1 ? `1px solid ${c.border}` : 'none',
                          display: 'flex', alignItems: 'center', gap: 16,
                          background: settings.modules[item.key] ? c.canvas : c.surface,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: settings.modules[item.key] ? c.ink : c.ink3 }}>{item.label}</div>
                          <div style={{ fontSize: 11, color: c.ink3, marginTop: 2 }}>{item.desc}</div>
                        </div>
                        <Toggle t={t} on={settings.modules[item.key]} onToggle={() => toggleModule(item.key)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Live Payroll */}
          {activeTab === 'livePayroll' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.ink, marginBottom: 4 }}>Live Payroll Settings</div>
              <div style={{ fontSize: 13, color: c.ink3, marginBottom: 20 }}>
                อัตราค่าแรงและโบนัสใช้เท่ากันสำหรับพนักงาน Live ทุกคน ไม่มี Commission
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 460, marginBottom: 24 }}>
                <Field t={t} label="Hourly Rate (฿/ชั่วโมง)" sub="อัตราค่าแรงต่อชั่วโมง (เหมือนกันทุกคน)">
                  <input type="number" min={0} value={payrollDraft.hourlyRate} onChange={e => setPayrollDraft(d => ({ ...d, hourlyRate: e.target.value }))} style={inp} />
                </Field>
                <Field t={t} label="Clip Bonus (฿/คลิป)" sub="โบนัสต่อคลิปที่ตัด (เหมือนกันทุกคน)">
                  <input type="number" min={0} value={payrollDraft.clipBonus} onChange={e => setPayrollDraft(d => ({ ...d, clipBonus: e.target.value }))} style={inp} />
                </Field>
              </div>
              <div style={{ padding: '14px 16px', background: c.accentBg, borderRadius: t.radius, fontSize: 13, color: c.accent }}>
                <strong>ตัวอย่าง:</strong> ทำงาน 2.5 ชั่วโมง, ตัด 1 คลิป → ค่าแรง ฿{(2.5 * (parseFloat(payrollDraft.hourlyRate) || 0)).toLocaleString()} + โบนัส ฿{(parseFloat(payrollDraft.clipBonus) || 0).toLocaleString()} = <strong>฿{(2.5 * (parseFloat(payrollDraft.hourlyRate) || 0) + (parseFloat(payrollDraft.clipBonus) || 0)).toLocaleString()}</strong>
              </div>
            </div>
          )}

          {/* About */}
          {activeTab === 'about' && (
            <div>
              <div style={{ textAlign: 'center', padding: '28px 0 24px' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${c.accent}, ${c.accent}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>🐾</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: c.ink }}>Chawy ERP</div>
                <div style={{ fontSize: 13, color: c.ink3, marginTop: 4 }}>ระบบบริหารจัดการสำหรับธุรกิจอาหารสัตว์เลี้ยง</div>
                <div style={{ display: 'inline-block', marginTop: 12, padding: '4px 14px', borderRadius: 20, background: c.accentBg, color: c.accent, fontSize: 12, fontWeight: 600 }}>Version 2.1.0</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Sales',      items: ['Quotation', 'Sales Order', 'Invoice', 'Live Commerce', 'Sampling'] },
                  { label: 'Inventory',  items: ['Stock Balance', 'Lot/FEFO', 'Goods Receive', 'Goods Issue', 'Stock Transfer', 'Stock Check'] },
                  { label: 'Purchasing', items: ['Purchase Request', 'Purchase Order', 'Returns'] },
                ].map(section => (
                  <div key={section.label} style={{ padding: 14, borderRadius: t.radius, background: c.surface, border: `1px solid ${c.border}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: c.accent, marginBottom: 8 }}>{section.label}</div>
                    {section.items.map(item => (
                      <div key={item} style={{ fontSize: 12, color: c.ink2, padding: '3px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: c.pos, fontSize: 10 }}>✓</span> {item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

        </Card>
      </div>
    </div>
  )
}
