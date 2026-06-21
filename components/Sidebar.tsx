'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useErpStore } from '@/lib/store/useErpStore'
import { ROLE_NAV, ROLE_LABELS } from '@/lib/store/erpTypes'
import type { ModuleSettings } from '@/lib/store/erpTypes'
import { useTheme } from '@/lib/design/ThemeContext'
import { Dot } from '@/components/ui'

type NavSection = { section: string }
type NavItem = { label: string; subTH: string; href: string; badge?: number }
type NavEntry = NavSection | NavItem

const MODULE_KEY: Record<string, keyof ModuleSettings | null> = {
  '/':                  null,
  '/quotation':         'quotation',
  '/sales-orders':      'salesOrders',
  '/invoice':           'invoice',
  '/returns':           'returns',
  '/purchase-req':      'purchaseReq',
  '/purchase-order':    'purchaseOrder',
  '/sku':               'skuMaster',
  '/stock':             'stockBalance',
  '/goods-receive':     'goodsReceive',
  '/goods-issue':       'goodsIssue',
  '/stock-transfer':    'stockTransfer',
  '/stock-check':       'stockCheck',
  '/expenses':          'expenses',
  '/pl':                'plReport',
  '/budget':            'budget',
  '/tiktok-orders':     'tiktokOrders',
  '/live-sessions':     'liveContent',
  '/manual-order':      'manualOrder',
  '/tiktok-calculator': 'tiktokCalculator',
  '/sampling':          'sampling',
  '/users':             'userManagement',
  '/settings':          null,
  '/tiktok-setup':      'tiktokSetup',
}

const NAV_STATIC: NavEntry[] = [
  { section: 'Overview' },
  { label: 'Dashboard',             subTH: 'ภาพรวม',               href: '/'                 },
  { section: 'Sales' },
  { label: 'Quotation',             subTH: 'ใบเสนอราคา',           href: '/quotation'         },
  { label: 'Sales Orders',          subTH: 'ออร์เดอร์ขาย',         href: '/sales-orders'      },
  { label: 'Invoices',              subTH: 'ใบแจ้งหนี้',           href: '/invoice'           },
  { label: 'Returns',               subTH: 'คืนสินค้า',            href: '/returns'           },
  { section: 'Purchasing' },
  { label: 'Purchase Req.',         subTH: 'ใบขอซื้อ',             href: '/purchase-req'      },
  { label: 'Purchase Order',        subTH: 'ใบสั่งซื้อ',           href: '/purchase-order'    },
  { section: 'Inventory' },
  { label: 'SKU Master',            subTH: 'ข้อมูลสินค้า',         href: '/sku'               },
  { label: 'Stock Balance',         subTH: 'สต็อคคงคลัง',         href: '/stock'             },
  { label: 'Goods Receive',         subTH: 'รับสินค้าเข้า',        href: '/goods-receive'     },
  { label: 'Goods Issue',           subTH: 'เบิกสินค้าออก',        href: '/goods-issue'       },
  { label: 'Stock Transfer',        subTH: 'โอนสต็อค',             href: '/stock-transfer'    },
  { label: 'Stock Checking',        subTH: 'นับสต็อค',             href: '/stock-check'       },
  { section: 'Finance' },
  { label: 'Expenses',              subTH: 'ค่าใช้จ่าย',            href: '/expenses'          },
  { label: 'P&L Report',            subTH: 'กำไร-ขาดทุน',           href: '/pl'                },
  { label: 'Budget',                subTH: 'งบประมาณ',              href: '/budget'            },
  { section: 'Channels' },
  { label: 'TikTok Orders',         subTH: 'ออร์เดอร์ TikTok',     href: '/tiktok-orders'     },
  { label: 'Live & Content',        subTH: 'ไลฟ์และคอนเทนต์',     href: '/live-sessions'     },
  { label: 'Manual Order',          subTH: 'บันทึกออเดอร์อื่นๆ',   href: '/manual-order'      },
  // { label: 'TikTok Calculator',     subTH: 'คำนวณค่าธรรมเนียม',    href: '/tiktok-calculator' },
  // { label: 'Sampling',              subTH: 'แจกตัวอย่าง',           href: '/sampling'          },
  { section: 'System' },
  { label: 'User Management',       subTH: 'จัดการผู้ใช้',          href: '/users'             },
  { label: 'Settings',              subTH: 'ตั้งค่าหลัก',           href: '/settings'          },
  { label: 'TikTok Setup',          subTH: 'เชื่อม API',             href: '/tiktok-setup'      },
]

function isModuleVisible(href: string, modules: ModuleSettings): boolean {
  const key = MODULE_KEY[href]
  if (key === null || key === undefined) return true
  return modules[key]
}

function filterNav(entries: NavEntry[], modules: ModuleSettings, allowedHrefs: string[] | '*'): NavEntry[] {
  const result: NavEntry[] = []
  let pendingSection: NavSection | null = null
  for (const entry of entries) {
    if ('section' in entry) {
      pendingSection = entry
    } else {
      const allowed = allowedHrefs === '*' || allowedHrefs.includes(entry.href)
      const visible = isModuleVisible(entry.href, modules)
      if (allowed && visible) {
        if (pendingSection) { result.push(pendingSection); pendingSection = null }
        result.push(entry)
      }
    }
  }
  return result
}

function groupNav(entries: NavEntry[]): Array<{ section: string; items: NavItem[] }> {
  const groups: Array<{ section: string; items: NavItem[] }> = []
  let current: { section: string; items: NavItem[] } | null = null

  for (const entry of entries) {
    if ('section' in entry) {
      current = { section: entry.section, items: [] }
      groups.push(current)
    } else if (current) {
      current.items.push(entry)
    }
  }

  return groups.filter(group => group.items.length > 0)
}

function Caret({ open, color }: { open: boolean; color: string }) {
  return (
    <span style={{
      width: 7,
      height: 7,
      borderRight: `1.5px solid ${color}`,
      borderBottom: `1.5px solid ${color}`,
      transform: open ? 'rotate(45deg)' : 'rotate(-45deg)',
      transition: 'transform 160ms ease',
      flexShrink: 0,
      marginTop: open ? -2 : 0,
      marginRight: open ? 0 : 2,
    }} />
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => ({
    Overview: true,
    Sales: true,
    Purchasing: true,
    Inventory: true,
    Finance: true,
    Channels: true,
    System: true,
  }))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { tokens: t } = useTheme()
  const c = t.color

  useEffect(() => {
    if (!drawerOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [drawerOpen])

  const currentUser  = useErpStore(s => s.currentUser)
  const stockReturns = useErpStore(s => s.stockReturns)
  const liveSessions = useErpStore(s => s.liveSessions)
  const modules      = useErpStore(s => s.settings.modules)

  const pendingReturns     = stockReturns.filter(r => !r.refunded).length
  const pendingLiveSessions = liveSessions.filter(s => s.status === 'Pending').length

  const NAV_WITH_BADGES: NavEntry[] = NAV_STATIC.map(item => {
    if ('section' in item) return item
    if (item.href === '/returns' && pendingReturns > 0) return { ...item, badge: pendingReturns }
    if (item.href === '/live-sessions' && pendingLiveSessions > 0) return { ...item, badge: pendingLiveSessions }
    return item
  })

  const allowedHrefs = ROLE_NAV[currentUser.role]
  const NAV = filterNav(NAV_WITH_BADGES, modules, allowedHrefs)
  const groups = groupNav(NAV)

  return (
    <>
      <button
        type="button"
        className="app-hamburger"
        aria-label="Open navigation"
        onClick={() => setDrawerOpen(true)}
      >☰</button>
      {drawerOpen && <div  onClick={() => setDrawerOpen(false)} />}
      <aside className={`app-sidebar${drawerOpen ? ' is-open' : ''}`} style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: 252,
      background: c.canvas,
      borderRight: `1px solid ${c.border}`,
      display: 'flex', flexDirection: 'column',
      zIndex: 50,
      overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{
        padding: '18px 20px',
        borderBottom: `1px solid ${c.border}`,
        display: 'flex', alignItems: 'center',
        gap: 10, flexShrink: 0,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: t.radius, flexShrink: 0,
          background: c.ink,
          color: c.canvas,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: t.font.mono, fontWeight: 600, fontSize: 13, letterSpacing: '-0.02em',
        }}>C</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: c.ink, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            Chawy
          </div>
          <div style={{ fontSize: 11, color: c.ink3, marginTop: 1 }}>Pet Food ERP</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 10px 16px' }}>
        {groups.map(group => {
          const isOpen = openGroups[group.section] ?? true
          const hasActive = group.items.some(item => pathname === item.href)
          return (
            <div key={group.section} style={{ marginBottom: 2 }}>
              <button
                type="button"
                onClick={() => setOpenGroups(prev => ({ ...prev, [group.section]: !isOpen }))}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 10px 7px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: t.font.sans,
                  textAlign: 'left',
                }}
              >
                <span style={{
                  flex: 1,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: hasActive && !isOpen ? c.accent : c.ink3,
                }}>{group.section}</span>
                {hasActive && !isOpen && <Dot color={c.accent} size={5} />}
                <Caret open={isOpen} color={c.ink4} />
              </button>

              <div style={{
                overflow: 'hidden',
                maxHeight: isOpen ? group.items.length * 49 + 8 : 0,
                opacity: isOpen ? 1 : 0,
                transition: 'max-height 220ms ease, opacity 160ms ease',
              }}>
                {group.items.map(item => {
                  const active = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)} style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 10px 6px 14px',
                      marginBottom: 1,
                      background: active ? c.accentBg : 'transparent',
                      borderLeft: `2px solid ${active ? c.accent : 'transparent'}`,
                      borderRadius: active ? `0 ${Math.max(t.radius - 2, 0)}px ${Math.max(t.radius - 2, 0)}px 0` : 0,
                      textDecoration: 'none',
                      transition: 'background 120ms',
                      fontFamily: t.font.sans,
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = c.subtle }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
                    >
                      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <span style={{
                          fontSize: 13,
                          fontWeight: active ? 600 : 500,
                          color: active ? c.accent : c.ink2,
                          letterSpacing: '-0.005em',
                          lineHeight: 1.25,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>{item.label}</span>
                        <span style={{
                          fontSize: 10,
                          color: c.ink3,
                          lineHeight: 1.25,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>{item.subTH}</span>
                      </span>
                      {item.badge ? (
                        <span style={{
                          fontFamily: t.font.mono,
                          fontSize: 10,
                          fontWeight: 500,
                          color: c.ink2,
                          background: c.subtle,
                          border: `1px solid ${c.border}`,
                          padding: '1px 6px',
                          borderRadius: 4,
                          flexShrink: 0,
                        }}>{item.badge}</span>
                      ) : null}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ borderTop: `1px solid ${c.border}`, padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link href="/users" style={{ textDecoration: 'none' }} onClick={() => setDrawerOpen(false)}>
          <button style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px',
            background: 'transparent',
            border: `1px solid ${c.border}`,
            borderRadius: t.radius,
            cursor: 'pointer', fontFamily: t.font.sans, textAlign: 'left',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = c.subtle}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: c.subtle, border: `1px solid ${c.border}`,
              color: c.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, flexShrink: 0,
            }}>{currentUser.name ? currentUser.name[0] : 'U'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: c.ink,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{currentUser.name || 'User'}</div>
              <div style={{ fontSize: 10, color: c.ink3, marginTop: 1 }}>
                {currentUser.role ? ROLE_LABELS[currentUser.role] : 'ผู้ใช้'}
              </div>
            </div>
          </button>
        </Link>
        <button 
          onClick={() => {
            localStorage.removeItem('chawy_token');
            window.location.href = '/login';
          }}
          style={{
            width: '100%',
            padding: '6px',
            backgroundColor: 'transparent',
            border: '1px solid #EF4444',
            color: '#EF4444',
            borderRadius: t.radius,
            fontSize: 11,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: t.font.sans,
            textAlign: 'center'
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
        >
          ออกจากระบบ (Logout)
        </button>
      </div>
    </aside>
    </>
  )
}
