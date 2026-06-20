'use client'
import { useState } from 'react'
import { useTheme, ACCENTS } from '@/lib/design/ThemeContext'
import type { AccentKey } from '@/lib/design/ThemeContext'

export default function TweaksPanel() {
  const { settings, tokens: t, setTweak, reset } = useTheme()
  const [open, setOpen] = useState(false)
  const c = t.color

  const sectionLabel: React.CSSProperties = {
    fontSize: 10, fontWeight: 500, letterSpacing: '0.10em',
    textTransform: 'uppercase', color: c.ink3,
    padding: '14px 0 8px', fontFamily: t.font.sans,
  }
  const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: 12, marginBottom: 10,
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 12, color: c.ink2, fontFamily: t.font.sans, fontWeight: 500,
  }

  function SegmentButtons({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
    return (
      <div style={{
        display: 'inline-flex', border: `1px solid ${c.border}`,
        borderRadius: Math.max(t.radius - 2, 0), overflow: 'hidden',
        background: c.canvas,
      }}>
        {options.map((opt, i) => (
          <button key={opt} onClick={() => onChange(opt)} style={{
            padding: '4px 10px', fontSize: 11,
            background: value === opt ? c.surface : 'transparent',
            border: 'none',
            borderLeft: i === 0 ? 'none' : `1px solid ${c.border}`,
            color: value === opt ? c.ink : c.ink3,
            cursor: 'pointer', fontFamily: t.font.sans,
            fontWeight: value === opt ? 600 : 500,
            letterSpacing: '-0.005em',
          }}>{opt}</button>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Tweak theme"
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 100,
          width: 36, height: 36, borderRadius: '50%',
          background: c.surface, border: `1px solid ${c.border}`,
          cursor: 'pointer', fontSize: 15,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          color: c.ink2,
        }}
      >T</button>

      {/* Panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 64, right: 20, zIndex: 100,
          width: 280, background: c.surface,
          border: `1px solid ${c.borderStrong}`,
          borderRadius: t.radius, padding: '0 16px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          fontFamily: t.font.sans,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${c.border}`, padding: '12px 0',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: c.ink, letterSpacing: '-0.01em' }}>
              Theme
            </span>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: c.ink3, fontSize: 14, padding: 2,
            }}>Close</button>
          </div>

          {/* Theme section */}
          <div style={sectionLabel}>Appearance</div>

          <div style={rowStyle}>
            <span style={labelStyle}>Mode</span>
            <SegmentButtons
              options={['light', 'dark']}
              value={settings.theme}
              onChange={v => setTweak('theme', v as 'light' | 'dark')}
            />
          </div>

          <div style={{ ...rowStyle, alignItems: 'flex-start' }}>
            <span style={labelStyle}>Accent</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {(Object.keys(ACCENTS) as AccentKey[]).map(key => {
                const col = ACCENTS[key][settings.theme === 'dark' ? 'd' : 'l']
                const active = settings.accent === key
                return (
                  <button key={key} title={ACCENTS[key].name} onClick={() => setTweak('accent', key)} style={{
                    width: 20, height: 20, borderRadius: '50%', background: col,
                    border: active ? `2px solid ${c.ink}` : `2px solid transparent`,
                    cursor: 'pointer', padding: 0,
                    outline: active ? `2px solid ${c.surface}` : 'none',
                    outlineOffset: -4,
                  }} />
                )
              })}
            </div>
          </div>

          {!t.isDark && (
            <div style={rowStyle}>
              <span style={labelStyle}>Tone</span>
              <SegmentButtons
                options={['paper', 'cool', 'neutral']}
                value={settings.tone}
                onChange={v => setTweak('tone', v as 'paper' | 'cool' | 'neutral')}
              />
            </div>
          )}

          {/* Layout section */}
          <div style={sectionLabel}>Layout</div>

          <div style={rowStyle}>
            <span style={labelStyle}>Density</span>
            <SegmentButtons
              options={['compact', 'regular', 'comfy']}
              value={settings.density}
              onChange={v => setTweak('density', v as 'compact' | 'regular' | 'comfy')}
            />
          </div>

          <div style={{ ...rowStyle, marginBottom: 8 }}>
            <span style={labelStyle}>Radius</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="range" min={0} max={12} step={1} value={settings.radius}
                onChange={e => setTweak('radius', Number(e.target.value))}
                style={{ width: 80, accentColor: c.accent }} />
              <span style={{ fontSize: 11, color: c.ink3, fontFamily: t.font.mono, minWidth: 28 }}>
                {settings.radius}px
              </span>
            </div>
          </div>

          <div style={{ ...rowStyle, marginBottom: 14 }}>
            <span style={labelStyle}>Font size</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="range" min={12} max={16} step={1} value={settings.fontSize}
                onChange={e => setTweak('fontSize', Number(e.target.value))}
                style={{ width: 80, accentColor: c.accent }} />
              <span style={{ fontSize: 11, color: c.ink3, fontFamily: t.font.mono, minWidth: 28 }}>
                {settings.fontSize}px
              </span>
            </div>
          </div>

          {/* Reset */}
          <button onClick={reset} style={{
            width: '100%', padding: '7px 0',
            background: 'transparent', border: `1px solid ${c.border}`,
            borderRadius: Math.max(t.radius - 2, 0),
            fontSize: 11, color: c.ink3, cursor: 'pointer',
            fontFamily: t.font.sans, fontWeight: 500, letterSpacing: '-0.005em',
          }}>
            Reset to defaults
          </button>
        </div>
      )}
    </>
  )
}
