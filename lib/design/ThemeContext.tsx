'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getTokens, ACCENTS } from './tokens'
import type { AccentKey, ToneKey, DensityKey, DesignTokens } from './tokens'

export interface ThemeSettings {
  theme: 'light' | 'dark'
  accent: AccentKey
  tone: ToneKey
  density: DensityKey
  radius: number
  fontSize: number
}

const DEFAULTS: ThemeSettings = {
  theme: 'light',
  accent: 'jade',
  tone: 'paper',
  density: 'regular',
  radius: 6,
  fontSize: 14,
}

const LS_KEY = 'chawy-theme-tweaks'
const THEMES: ThemeSettings['theme'][] = ['light', 'dark']
const TONES: ToneKey[] = ['paper', 'cool', 'neutral']
const DENSITIES: DensityKey[] = ['compact', 'regular', 'comfy']
const MIN_RADIUS = 0
const MAX_RADIUS = 12
const MIN_FONT_SIZE = 12
const MAX_FONT_SIZE = 16

export interface ThemeContextValue {
  settings: ThemeSettings
  tokens: DesignTokens
  setTweak: <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => void
  reset: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  settings: DEFAULTS,
  tokens: getTokens(DEFAULTS),
  setTweak: () => {},
  reset: () => {},
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function clampNumber(value: unknown, min: number, max: number): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.min(max, Math.max(min, value))
}

function parseStoredSettings(value: unknown): Partial<ThemeSettings> {
  if (!isRecord(value)) return {}

  const next: Partial<ThemeSettings> = {}

  if (THEMES.includes(value.theme as ThemeSettings['theme'])) {
    next.theme = value.theme as ThemeSettings['theme']
  }

  if (typeof value.accent === 'string' && value.accent in ACCENTS) {
    next.accent = value.accent as AccentKey
  }

  if (TONES.includes(value.tone as ToneKey)) {
    next.tone = value.tone as ToneKey
  }

  if (DENSITIES.includes(value.density as DensityKey)) {
    next.density = value.density as DensityKey
  }

  const radius = clampNumber(value.radius, MIN_RADIUS, MAX_RADIUS)
  if (radius !== undefined) next.radius = radius

  const fontSize = clampNumber(value.fontSize, MIN_FONT_SIZE, MAX_FONT_SIZE)
  if (fontSize !== undefined) next.fontSize = fontSize

  return next
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULTS)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY)
      if (stored) {
        const parsed = parseStoredSettings(JSON.parse(stored))
        setSettings(prev => ({ ...prev, ...parsed }))
      }
    } catch {}
  }, [])

  const setTweak = useCallback(<K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setSettings(DEFAULTS)
    try { localStorage.removeItem(LS_KEY) } catch {}
  }, [])

  const tokens = getTokens(settings)

  return (
    <ThemeContext.Provider value={{ settings, tokens, setTweak, reset }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}

export { ACCENTS }
export type { AccentKey, ToneKey, DensityKey }
