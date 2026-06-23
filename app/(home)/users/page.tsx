'use client'

import { useState } from 'react'
import { useErpStore } from '@/lib/store/useErpStore'
import { ROLE_LABELS, type AppUser, type UserRole } from '@/lib/store/erpTypes'
import { useTheme } from '@/lib/design/ThemeContext'
import { Card, Mono, TopBar } from '@/components/ui'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'

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
            <Button onClick={() => setCreateOpen(true)}>+ Create User</Button>
          </>
        }
      />
      <div style={{ padding: '24px 32px 48px' }}>
        <Card t={t} pad={false} style={{ overflow: 'auto' }}>
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                {['User', 'Role', 'Access', 'Last active', 'Status', 'Actions'].map(h => (
                  <TableHead key={h} className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayUsers.map((user, i) => {
                const isCurrentUser = user.id === currentUser.id
                const isEnabled = user.isActive !== false
                return (
                  <TableRow key={user.id} className={!isEnabled ? 'opacity-60' : ''} style={{ background: isCurrentUser ? c.subtle : 'transparent' }}>
                    <TableCell className="py-3.5 px-6">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: isCurrentUser ? c.ink : c.subtle, border: `1px solid ${c.border}`, color: isCurrentUser ? c.canvas : c.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                          {user.name.trim().charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: c.ink }}>{user.name}</div>
                          <Mono t={t} size={11} color={c.ink3} style={{ marginTop: 1, display: 'block' }}>{user.id.toLowerCase()}@chawy.local</Mono>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span style={{ fontSize: 13, color: c.ink }}>{ROLE_LABELS[user.role]}</span>
                      <span style={{ fontSize: 11, color: c.ink3, marginLeft: 6 }}>{user.role}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span style={{ fontSize: 11, color: c.ink2, background: c.subtle, padding: '3px 9px', borderRadius: 4, border: `1px solid ${c.border}`, fontWeight: 500 }}>
                        {user.role === 'owner' ? 'All modules' : `${ROLE_LABELS[user.role]} access`}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span style={{ fontSize: 12, color: c.ink2 }}>{formatLastActive(user)}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      {isEnabled ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Button variant="ghost" onClick={() => handleEditClick(user)}>แก้ไข</Button>
                        <Button variant="ghost" onClick={() => handleStatusChange(user)} disabled={isCurrentUser || busyUserId === user.id}>
                          {busyUserId === user.id ? 'กำลังบันทึก...' : isEnabled ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent side="right" className="sm:max-w-[520px] flex flex-col h-full p-0 bg-background">
          <SheetHeader className="p-6 border-b border-border flex-shrink-0">
            <SheetTitle className="text-base font-bold text-foreground">สร้างผู้ใช้ใหม่</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1">เพิ่มผู้ใช้งานระบบ ERP ใหม่</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">รหัสผู้ใช้ (User ID / Username) *</label>
              <Input placeholder="เช่น USR-005 หรือ somchai" value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ชื่อผู้ใช้ (Display Name) *</label>
              <Input placeholder="เช่น สมชาย" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">บทบาท (Role) *</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring">
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v} ({k})</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">รหัสผ่าน (Password) *</label>
              <Input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
          </div>
          <SheetFooter className="border-t border-border p-6 flex-shrink-0">
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>ยกเลิก</Button>
              <Button onClick={handleSubmit} className="bg-[#0F6E58] text-white hover:bg-[#0F6E58]/90">บันทึกผู้ใช้</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="sm:max-w-[520px] flex flex-col h-full p-0 bg-background">
          <SheetHeader className="p-6 border-b border-border flex-shrink-0">
            <SheetTitle className="text-base font-bold text-foreground">แก้ไขข้อมูลผู้ใช้</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1">อัปเดตรายละเอียดของผู้ใช้งานในระบบ</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">รหัสผู้ใช้ (ไม่สามารถแก้ไขได้)</label>
              <Input value={editForm.id} disabled className="opacity-60 cursor-not-allowed" />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ชื่อผู้ใช้ (Display Name) *</label>
              <Input placeholder="เช่น สมชาย" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">บทบาท (Role) *</label>
              <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value as UserRole }))} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring">
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v} ({k})</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">รหัสผ่านใหม่ (ระบุเมื่อต้องการเปลี่ยนเท่านั้น)</label>
              <Input type="password" placeholder="ระบุรหัสผ่านใหม่หากต้องการเปลี่ยน" value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} />
            </div>
          </div>
          <SheetFooter className="border-t border-border p-6 flex-shrink-0">
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => setEditOpen(false)}>ยกเลิก</Button>
              <Button onClick={handleEditSubmit} className="bg-[#0F6E58] text-white hover:bg-[#0F6E58]/90">บันทึกการเปลี่ยนแปลง</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

