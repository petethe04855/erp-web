export type AccentKey = 'jade' | 'navy' | 'plum' | 'copper' | 'ink'
export type ToneKey = 'paper' | 'cool' | 'neutral'
export type DensityKey = 'compact' | 'regular' | 'comfy'

export const ACCENTS: Record<AccentKey, { l: string; d: string; name: string }> = {
  jade: { l: '#0F6E58', d: '#5EC8AD', name: 'Jade' },
  navy: { l: '#1E3A8A', d: '#7DA6FF', name: 'Navy' },
  plum: { l: '#5B2A86', d: '#C4A1E8', name: 'Plum' },
  copper: { l: '#A14D1B', d: '#E5A472', name: 'Copper' },
  ink: { l: '#1A1A1A', d: '#ECEAE3', name: 'Mono' },
}

export interface DesignTokens {
  theme: string
  isDark: boolean
  radius: number
  density: { row: number; padY: number; padX: number; gap: number }
  color: {
    canvas: string; surface: string; subtle: string
    border: string; borderStrong: string
    ink: string; ink2: string; ink3: string; ink4: string
    accent: string; accentBg: string
    pos: string; neg: string; warn: string; info: string
    posBg: string; negBg: string; warnBg: string; infoBg: string
    expense: string
  }
  font: { sans: string; mono: string }
}

export interface TokenOptions {
  theme?: 'light' | 'dark'
  accent?: AccentKey
  radius?: number
  density?: DensityKey
  tone?: ToneKey
}

function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace('#', '')
  const full = raw.length === 3 ? raw.split('').map(ch => ch + ch).join('') : raw
  const value = Number.parseInt(full, 16)
  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255
  return `rgba(${r},${g},${b},${alpha})`
}

export function getTokens(opts?: TokenOptions): DesignTokens {
  const {
    theme = 'light',
    accent = 'jade',
    radius = 6,
    density = 'regular',
    tone = 'paper',
  } = opts ?? {}

  const isDark = theme === 'dark'
  const a = ACCENTS[accent] ?? ACCENTS.jade

  const dens =
    density === 'compact' ? { row: 36, padY: 8,  padX: 14, gap: 4  } :
    density === 'comfy'   ? { row: 52, padY: 14, padX: 20, gap: 12 } :
                            { row: 44, padY: 11, padX: 16, gap: 8  }

  const lightBgs: Record<ToneKey, { canvas: string; surface: string; subtle: string; border: string; borderStrong: string }> = {
    paper:   { canvas: '#FBFAF7', surface: '#FFFFFF', subtle: '#F4F2EC', border: '#E8E4DA', borderStrong: '#D7D2C5' },
    cool:    { canvas: '#F7F8FA', surface: '#FFFFFF', subtle: '#EFF1F5', border: '#E2E5EB', borderStrong: '#CDD2DB' },
    neutral: { canvas: '#F8F8F8', surface: '#FFFFFF', subtle: '#EFEFEF', border: '#E5E5E5', borderStrong: '#D0D0D0' },
  }

  const bgs = isDark
    ? { canvas: '#0B0E13', surface: '#12161D', subtle: '#181D26', border: '#212732', borderStrong: '#2D3441' }
    : (lightBgs[tone] ?? lightBgs.paper)

  return {
    theme,
    isDark,
    radius,
    density: dens,
    color: {
      ...bgs,
      ink:   isDark ? '#ECEAE3' : '#171717',
      ink2:  isDark ? '#B8B5AC' : '#525050',
      ink3:  isDark ? '#7A766E' : '#8A8881',
      ink4:  isDark ? '#52504A' : '#B2AFA6',
      accent: isDark ? a.d : a.l,
      accentBg: hexToRgba(isDark ? a.d : a.l, isDark ? 0.1 : 0.06),
      pos:   isDark ? '#4ADE80' : '#0E7C49',
      neg:   isDark ? '#F87171' : '#B91C1C',
      warn:  isDark ? '#FCD34D' : '#B45309',
      info:  isDark ? '#7DD3FC' : '#1E5F8B',
      posBg: isDark ? 'rgba(74,222,128,0.10)'  : 'rgba(14,124,73,0.08)',
      negBg: isDark ? 'rgba(248,113,113,0.10)' : 'rgba(185,28,28,0.06)',
      warnBg: isDark ? 'rgba(252,211,77,0.10)' : 'rgba(180,83,9,0.08)',
      infoBg: isDark ? 'rgba(125,211,252,0.10)': 'rgba(30,95,139,0.08)',
      expense: isDark ? '#FB923C' : '#C2410C',
    },
    font: {
      sans: "'IBM Plex Sans Thai', 'Inter', system-ui, sans-serif",
      mono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
    },
  }
}
