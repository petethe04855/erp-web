'use client'
import { useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function SlidePanel({ open, onClose, title, subtitle, children, footer }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(520px, 100vw)',
        background: 'var(--erp-surface)', zIndex: 101, display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 32px rgba(0,0,0,0.15)', fontFamily: 'var(--erp-font-sans)',
      }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--erp-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--erp-ink)' }}>{title}</h2>
            {subtitle && <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--erp-ink3)' }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: 'var(--erp-ink4)', lineHeight: 1, padding: 2 }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>{children}</div>
        {footer && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--erp-border)', flexShrink: 0 }}>{footer}</div>
        )}
      </div>
    </>
  )
}
