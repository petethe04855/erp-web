'use client'

import { useState } from 'react'
import { useErpStore } from '@/lib/store/useErpStore'
import { ROLE_LABELS, type AppUser, type UserRole } from '@/lib/store/erpTypes'
import { useTheme } from '@/lib/design/ThemeContext'
import { Btn, Dot, Mono, PremiumTable, PremiumTd, PremiumTh, TopBar } from '@/components/ui'
import SlidePanel from '@/components/SlidePanel'

const BLANK = { id: '', name: '', role: 'sales' as UserRole, password: '' }

export default function UsersPage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const currentUser = useErpStore(s => s.currentUser)
  const storeUsers = useErpStore(s => s.users)
  const createUser = useErpStore(s => s.createUser)
  const updateUser = useErpStore(s => s.updateUser)
  const updateUserStatus = useErpStore(s => s.updateUserStatus)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [editForm, setEditForm] = useState(BLANK)
  const [toast, setToast] = useState('')
  const [busyUserId, setBusyUserId] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const displayUsers = storeUsers
  const active = displayUsers.filter(user => user.isActive !== false).length
  const canManageUsers = currentUser.role === 'owner'

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

  function handleEditClick(user: AppUser) {
    setEditForm({
      id: user.id,
      name: user.name,
      role: user.role,
      password: '',
    })
    setEditOpen(true)
  }

  async function handleStatusChange(user: AppUser) {
    const nextActive = user.isActive === false
    setBusyUserId(user.id)
    try {
      await updateUserStatus(user.id, nextActive)
      showToast(`${nextActive ? 'เปิด' : 'ปิด'}การใช้งาน ${user.name} สำเร็จ`)
    } catch (err: any) {
      showToast(err.message || 'เปลี่ยนสถานะผู้ใช้ไม่สำเร็จ')
    } finally {
      setBusyUserId('')
    }
  }

  function formatLastActive(user: AppUser) {
    if (user.id === currentUser.id) return 'ขณะนี้'
    if (!user.lastLoginAt) return 'ยังไม่เคยเข้าสู่ระบบ'
    return new Intl.DateTimeFormat('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(user.lastLoginAt))
  }

  if (!canManageUsers) {
    return (
      <div style={{ minHeight: '100vh', background: c.canvas }}>
        <TopBar t={t} breadcrumb={['Chawy', 'System', 'Users']} title="ไม่มีสิทธิ์เข้าถึง" subtitle="เฉพาะเจ้าของระบบเท่านั้นที่จัดการผู้ใช้ได้" />
      </div>
    )
  }

  async function handleEditSubmit() {
    if (!editForm.name) {
      showToast('กรุณากรอกชื่อผู้ใช้')
      return
    }
    try {
      await updateUser(editForm.id, {
        name: editForm.name,
        role: editForm.role,
        password: editForm.password || undefined,
      })
      showToast(`แก้ไขผู้ใช้ ${editForm.name} สำเร็จ`)
      setEditOpen(false)
    } catch (err: any) {
      showToast(err.message || 'แก้ไขผู้ใช้ไม่สำเร็จ')
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
              {['User', 'Role', 'Access', 'Last active', 'Status', 'Actions'].map(h => <PremiumTh key={h} t={t}>{h}</PremiumTh>)}
            </tr>
          </thead>
          <tbody>
            {displayUsers.map((user, i) => {
              const last = i === displayUsers.length - 1
              const isCurrentUser = user.id === currentUser.id
              const isEnabled = user.isActive !== false
              return (
                <tr key={user.id} style={{ background: isCurrentUser ? c.subtle : 'transparent', opacity: isEnabled ? 1 : 0.62 }}>
                  <PremiumTd t={t} last={last}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: isCurrentUser ? c.ink : c.subtle, border: `1px solid ${c.border}`, color: isCurrentUser ? c.canvas : c.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
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
                  <PremiumTd t={t} last={last}><span style={{ fontSize: 12, color: c.ink2 }}>{formatLastActive(user)}</span></PremiumTd>
                  <PremiumTd t={t} last={last}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: isEnabled ? c.pos : c.neg }}>
                      <Dot color={isEnabled ? c.pos : c.neg} /> {isEnabled ? 'Active' : 'Inactive'}
                    </span>
                  </PremiumTd>
                  <PremiumTd t={t} last={last} right>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Btn t={t} variant="ghost" onClick={() => handleEditClick(user)}>แก้ไข</Btn>
                      <Btn t={t} variant="ghost" onClick={() => handleStatusChange(user)} disabled={isCurrentUser || busyUserId === user.id}>
                        {busyUserId === user.id ? 'กำลังบันทึก...' : isEnabled ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      </Btn>
                    </div>
                  </PremiumTd>
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

      <SlidePanel open={editOpen} onClose={() => setEditOpen(false)} title="แก้ไขข้อมูลผู้ใช้" subtitle="อัปเดตรายละเอียดของผู้ใช้งานในระบบ"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setEditOpen(false)} style={{ padding: '9px 20px', border: `1px solid ${c.border}`, borderRadius: 7, background: c.surface, cursor: 'pointer', fontSize: 13, color: c.ink2 }}>ยกเลิก</button>
            <button onClick={handleEditSubmit} style={{ padding: '9px 20px', border: 'none', borderRadius: 7, background: c.accent, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>บันทึกการเปลี่ยนแปลง</button>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink3 }}>
            รหัสผู้ใช้ (ไม่สามารถแก้ไขได้)
            <input value={editForm.id} disabled style={{ ...panelInput(c.surface, c.border, c.ink), opacity: 0.6, cursor: 'not-allowed' }} />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
            ชื่อผู้ใช้ (Display Name) *
            <input placeholder="เช่น สมชาย" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={panelInput(c.surface, c.border, c.ink)} />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
            บทบาท (Role) *
            <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value as UserRole }))} style={panelInput(c.surface, c.border, c.ink)}>
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v} ({k})</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
            รหัสผ่านใหม่ (ระบุเมื่อต้องการเปลี่ยนเท่านั้น)
            <input type="password" placeholder="ระบุรหัสผ่านใหม่หากต้องการเปลี่ยน" value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} style={panelInput(c.surface, c.border, c.ink)} />
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
