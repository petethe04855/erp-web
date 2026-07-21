'use client'
import { useEffect } from 'react'
import { useTheme } from '@/lib/design/ThemeContext'

export default function BodyStyle() {
  const { tokens: t, settings } = useTheme()

  useEffect(() => {
    document.body.style.background = t.color.canvas
    document.body.style.color = t.color.ink
    document.body.style.fontFamily = t.font.sans
    document.body.style.fontSize = settings.fontSize + 'px'
    document.documentElement.style.colorScheme = t.isDark ? 'dark' : 'light'

    const r = document.documentElement
    r.style.setProperty('--erp-canvas',        t.color.canvas)
    r.style.setProperty('--erp-surface',       t.color.surface)
    r.style.setProperty('--erp-subtle',        t.color.subtle)
    r.style.setProperty('--erp-border',        t.color.border)
    r.style.setProperty('--erp-border-strong', t.color.borderStrong)
    r.style.setProperty('--erp-ink',           t.color.ink)
    r.style.setProperty('--erp-ink2',          t.color.ink2)
    r.style.setProperty('--erp-ink3',          t.color.ink3)
    r.style.setProperty('--erp-ink4',          t.color.ink4)
    r.style.setProperty('--erp-accent',        t.color.accent)
    r.style.setProperty('--erp-accent-bg',     t.color.accentBg)
    r.style.setProperty('--erp-pos',           t.color.pos)
    r.style.setProperty('--erp-neg',           t.color.neg)
    r.style.setProperty('--erp-warn',          t.color.warn)
    r.style.setProperty('--erp-info',          t.color.info)
    r.style.setProperty('--erp-pos-bg',        t.color.posBg)
    r.style.setProperty('--erp-neg-bg',        t.color.negBg)
    r.style.setProperty('--erp-warn-bg',       t.color.warnBg)
    r.style.setProperty('--erp-info-bg',       t.color.infoBg)
    r.style.setProperty('--erp-expense',       t.color.expense)
    r.style.setProperty('--erp-radius',        t.radius + 'px')
    r.style.setProperty('--erp-font-sans',     t.font.sans)
    r.style.setProperty('--erp-font-mono',     t.font.mono)

    // shadcn and the legacy ERP components now read from the same theme.
    // Keeping this bridge here lets us migrate screens incrementally without
    // producing a second, subtly different light/dark palette.
    r.classList.toggle('dark', t.isDark)
    r.style.setProperty('--background',             t.color.canvas)
    r.style.setProperty('--foreground',             t.color.ink)
    r.style.setProperty('--card',                   t.color.surface)
    r.style.setProperty('--card-foreground',        t.color.ink)
    r.style.setProperty('--popover',                t.color.surface)
    r.style.setProperty('--popover-foreground',     t.color.ink)
    r.style.setProperty('--primary',                t.color.accent)
    r.style.setProperty('--primary-foreground',     t.isDark ? '#0B0E13' : '#FFFFFF')
    r.style.setProperty('--secondary',              t.color.subtle)
    r.style.setProperty('--secondary-foreground',   t.color.ink2)
    r.style.setProperty('--muted',                  t.color.subtle)
    r.style.setProperty('--muted-foreground',       t.color.ink3)
    r.style.setProperty('--accent',                 t.color.accentBg)
    r.style.setProperty('--accent-foreground',      t.color.accent)
    r.style.setProperty('--destructive',            t.color.neg)
    r.style.setProperty('--border',                 t.color.border)
    r.style.setProperty('--input',                  t.color.border)
    r.style.setProperty('--ring',                   t.color.accent)
    r.style.setProperty('--radius',                 t.radius + 'px')
    r.style.setProperty('--radius-md',              Math.max(t.radius - 2, 0) + 'px')
  }, [t, settings.fontSize])

  return null
}
