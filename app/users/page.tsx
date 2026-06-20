'use client'
import { useErpStore } from '@/lib/store/useErpStore'
import { APP_USERS, ROLE_LABELS } from '@/lib/store/erpTypes'
import { useTheme } from '@/lib/design/ThemeContext'
import { Btn, Dot, Mono, PremiumTable, PremiumTd, PremiumTh, TopBar } from '@/components/ui'

export default function UsersPage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const currentUser = useErpStore(s => s.currentUser)
  const setCurrentUser = useErpStore(s => s.setCurrentUser)
  const active = APP_USERS.length

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'System', 'Users']}
        title="User Management"
        subtitle={`จัดการผู้ใช้ · ${APP_USERS.length} บัญชี · ${active} ใช้งานอยู่`}
        right={<Btn t={t} variant="primary">+ Invite User</Btn>}
      />
      <div style={{ padding: '24px 32px 48px' }}>
        <PremiumTable t={t} minWidth={900}>
          <thead>
            <tr>
              {['User', 'Role', 'Access', 'Last active', 'Status', ''].map(h => <PremiumTh key={h} t={t}>{h}</PremiumTh>)}
            </tr>
          </thead>
          <tbody>
            {APP_USERS.map((user, i) => {
              const last = i === APP_USERS.length - 1
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
    </div>
  )
}
