'use client'
import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/design/ThemeContext'
import { TopBar } from '@/components/ui'

const STORAGE_KEY = 'tiktok_access_token'

export default function TikTokSetupPage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const [token, setToken]       = useState('')
  const [saved, setSaved]       = useState(false)
  const [testing, setTesting]   = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setToken(stored)
  }, [])

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, token.trim())
    setSaved(true)
    setTestResult(null)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleTest() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) { setTestResult('กรุณาบันทึก Access Token ก่อน'); return }
    setTesting(true)
    setTestResult(null)
    try {
      const authToken = localStorage.getItem('chawy_token')
      const res = await fetch(`/api/tiktok/settlement?access_token=${encodeURIComponent(stored)}`, {
        headers: { Authorization: authToken ? `Bearer ${authToken}` : '' },
      })
      const json = await res.json() as { settlements?: unknown[]; error?: string }
      if (res.ok) {
        setTestResult(`เชื่อมต่อสำเร็จ — พบ ${json.settlements?.length ?? 0} รายการ settlement`)
      } else {
        setTestResult(json.error ?? 'เชื่อมต่อไม่ได้')
      }
    } catch {
      setTestResult('Network error')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar t={t} title="TikTok Setup" subtitle="เชื่อมต่อ TikTok Shop API เพื่อดึงข้อมูล Settlement" />
      <div style={{ padding: '24px 32px', maxWidth: 640 }}>
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: c.ink4, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: t.font.sans }}>
              Access Token
            </div>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="วาง TikTok Shop Access Token ที่นี่"
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid ' + c.border,
                borderRadius: t.radius, fontSize: 13, fontFamily: t.font.mono, boxSizing: 'border-box',
                background: c.surface, color: c.ink, outline: 'none',
              }}
            />
            <p style={{ fontSize: 11, color: c.ink3, marginTop: 6, fontFamily: t.font.sans }}>
              Token เก็บเฉพาะใน localStorage ของเบราว์เซอร์นี้เท่านั้น
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleSave}
              disabled={!token.trim()}
              style={{
                padding: '9px 20px', background: c.accent, color: '#fff', border: 'none',
                borderRadius: t.radius, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                opacity: token.trim() ? 1 : 0.5, fontFamily: t.font.sans,
              }}
            >
              {saved ? 'บันทึกแล้ว' : 'บันทึก Token'}
            </button>
            <button
              onClick={handleTest}
              disabled={testing}
              style={{
                padding: '9px 20px', background: c.subtle, color: c.ink, border: '1px solid ' + c.border,
                borderRadius: t.radius, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: t.font.sans,
              }}
            >
              {testing ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}
            </button>
          </div>

          {testResult && (
            <div style={{
              padding: '10px 14px', borderRadius: t.radius,
              background: testResult.startsWith('เชื่อมต่อสำเร็จ') ? c.posBg : c.negBg,
              color: testResult.startsWith('เชื่อมต่อสำเร็จ') ? c.pos : c.neg,
              fontSize: 13, fontWeight: 500, fontFamily: t.font.sans,
            }}>
              {testResult}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 20, marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: c.ink, marginBottom: 12, fontFamily: t.font.sans }}>ข้อมูลการตั้งค่า</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, fontFamily: t.font.sans }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: c.ink3 }}>App Key</span>
              <span style={{ color: c.ink, fontFamily: t.font.mono }}>ตั้งใน .env.local</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: c.ink3 }}>App Secret</span>
              <span style={{ color: c.ink, fontFamily: t.font.mono }}>ตั้งใน .env.local</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: c.ink3 }}>Access Token</span>
              <span style={{ color: token ? c.pos : c.ink4, fontWeight: 600 }}>
                {token ? 'ตั้งค่าแล้ว' : 'ยังไม่ได้ตั้งค่า'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
