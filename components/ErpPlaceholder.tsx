'use client'

import { Card, PageBody, TopBar } from '@/components/ui'
import { useTheme } from '@/lib/design/ThemeContext'

interface Props {
  title: string
  subTH: string
  icon: string
  description: string
  features?: string[]
}

export default function ErpPlaceholder({ title, subTH, icon, description, features = [] }: Props) {
  const { tokens: t } = useTheme()
  const c = t.color

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar t={t} title={title} subtitle={subTH} />
      <PageBody t={t} maxWidth={900}>
        <Card t={t} style={{ padding: 48, textAlign: 'center' }}>
          <div style={{
            width: 64,
            height: 64,
            margin: '0 auto 18px',
            borderRadius: t.radius,
            background: c.accentBg,
            color: c.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 30,
            fontFamily: t.font.mono,
            fontWeight: 600,
          }}>{icon}</div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: c.ink, margin: '0 0 8px', letterSpacing: '-0.015em' }}>{title}</h2>
          <p style={{ fontSize: 13, color: c.ink3, maxWidth: 520, margin: '0 auto 24px', lineHeight: 1.7 }}>{description}</p>
          {features.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 560, margin: '0 auto' }}>
              {features.map(f => (
                <span key={f} style={{ padding: '4px 10px', borderRadius: Math.max(t.radius - 2, 0), background: c.subtle, color: c.ink2, border: `1px solid ${c.border}`, fontSize: 12, fontWeight: 500 }}>
                  {f}
                </span>
              ))}
            </div>
          )}
          <div style={{ marginTop: 32, padding: '10px 14px', background: c.subtle, borderRadius: t.radius, display: 'inline-block', border: `1px solid ${c.border}` }}>
            <span style={{ fontSize: 12, color: c.ink3, fontFamily: t.font.mono }}>Module in progress</span>
          </div>
        </Card>
      </PageBody>
    </div>
  )
}
