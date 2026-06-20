'use client'

import { useState } from 'react'
import { useErpStore } from '@/lib/store/useErpStore'
import { APP_USERS, ROLE_LABELS, type UserRole } from '@/lib/store/erpTypes'
import { useTheme } from '@/lib/design/ThemeContext'
import { Btn, Dot, Mono, PremiumTable, PremiumTd, PremiumTh, TopBar } from '@/components/ui'
import SlidePanel from '@/components/SlidePanel'

const BLANK = { id: '', name: '', role: 'sales' as UserRole, password: '' }

export default function UsersPage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const currentUser = useErpStore(s => s.currentUser)
  const setCurrentUser = useErpStore(s => s.setCurrentUser)
  const storeUsers = useErpStore(s => s.users)
  const createUser = useErpStore(s => s.createUser)

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const displayUsers = storeUsers.length ? storeUsers : APP_USERS
  const active = displayUsers.length

  async function handleSubmit() {
    if (!form.id || !form.name || !form.password) {
      showToast('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }
    // Prefix User ID with USR- if not present, but only if they type numeric ID
    let finalId = form.id
    if (/^\d+$/.test(finalId)) {
      finalId = 'USR-' + finalId.padStart(3, '0')
    }

    try {
      await createUser({
        id: finalId,
        name: form.name,
        role: form.role,
        password: form.password,
      })
      showToast(`สร้างผู้ใช้ ${form.name} สำเร็จ`)
      setForm(BLANK)
      setCreateOpen(false)
    } catch (err: any) {
      showToast(err.message || 'สร้างผู้ใช้ไม่สำเร็จ')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'System', 'Users']}
        title="User Management"
        subtitle={`จัดการผู้ใช้ · ${displayUsers.length} บัญชี · ${active} ใช้งานอยู่`}
        right={
          <>
            {toast && <span style={{ fontSize: 12, color: c.pos, fontWeight: 600 }}>{toast}</span>}
            <Btn t={t} variant="primary" onClick={() => setCreateOpen(true)}>+ Create User</Btn>
          </>
        }
      />
      <div style={{ padding: '24px 32px 48px' }}>
        <PremiumTable t={t} minWidth={900}>
          <thead>
            <tr>
              {['User', 'Role', 'Access', 'Last active', 'Status', ''].map(h => <PremiumTh key={h} t={t}>{h}</PremiumTh>)}
            </tr>
          </thead>
          <tbody>
            {displayUsers.map((user, i) => {
              const last = i === displayUsers.length - 1
              const isActive = user.id === currentUser.id
              return (
                <tr key={user.id} onClick={() => setCurrentUser(user)} style={{ cursor: 'pointer', background: isActive ? c.subtle : 'transparent' }}>
                  <PremiumTd t={t} last={last}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: isActive ? c.ink : c.subtle, border: `1px solid ${c.border}`, color: isActive ? c.canvas : c.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                        {user.name.trim().charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: c.ink }}>{user.name}</div>
                        <Mono t={t} size={11} color={c.ink3} style={{ marginTop: 1, display: 'block' }}>{user.id.toLowerCase()}@chawy.local</Mono>
                      </div>
                    </div>
                  </PremiumTd>
                  <PremiumTd t={t} last={last}>
                    <span style={{ fontSize: 13, color: c.ink }}>{ROLE_LABELS[user.role]}</span>
                    <span style={{ fontSize: 11, color: c.ink3, marginLeft: 6 }}>{user.role}</span>
                  </PremiumTd>
                  <PremiumTd t={t} last={last}>
                    <span style={{ fontSize: 11, color: c.ink2, background: c.subtle, padding: '3px 9px', borderRadius: 4, border: `1px solid ${c.border}`, fontWeight: 500 }}>
                      {user.role === 'owner' ? 'All modules' : `${ROLE_LABELS[user.role]} access`}
                    </span>
                  </PremiumTd>
                  <PremiumTd t={t} last={last}><span style={{ fontSize: 12, color: c.ink2 }}>{isActive ? 'Now' : 'Today'}</span></PremiumTd>
                  <PremiumTd t={t} last={last}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: c.pos }}>
                      <Dot color={c.pos} /> Active
                    </span>
                  </PremiumTd>
                  <PremiumTd t={t} last={last} right><span style={{ fontSize: 13, color: c.ink3 }}>›</span></PremiumTd>
                </tr>
              )
            })}
          </tbody>
        </PremiumTable>
      </div>

      <SlidePanel open={createOpen} onClose={() => setCreateOpen(false)} title="สร้างผู้ใช้ใหม่" subtitle="เพิ่มผู้ใช้งานระบบ ERP ใหม่"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setCreateOpen(false)} style={{ padding: '9px 20px', border: `1px solid ${c.border}`, borderRadius: 7, background: c.surface, cursor: 'pointer', fontSize: 13, color: c.ink2 }}>ยกเลิก</button>
            <button onClick={handleSubmit} style={{ padding: '9px 20px', border: 'none', borderRadius: 7, background: c.accent, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>บันทึกผู้ใช้</button>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
            รหัสผู้ใช้ (User ID / Username) *
            <input placeholder="เช่น USR-005 หรือ somchai" value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} style={panelInput(c.surface, c.border, c.ink)} />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
            ชื่อผู้ใช้ (Display Name) *
            <input placeholder="เช่น สมชาย" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={panelInput(c.surface, c.border, c.ink)} />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
            บทบาท (Role) *
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))} style={panelInput(c.surface, c.border, c.ink)}>
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v} ({k})</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
            รหัสผ่าน (Password) *
            <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={panelInput(c.surface, c.border, c.ink)} />
          </label>
        </div>
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
