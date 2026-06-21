'use client'
import { useState } from 'react'
import { useErpStore } from '@/lib/store/useErpStore'
import { useTheme } from '@/lib/design/ThemeContext'
import { exportXlsx } from '@/lib/utils/exportUtil'
import { Btn, Mono, PremiumTable, PremiumTd, PremiumTh, SectionLabel, StatStrip, StatusPill, TopBar, fmtBaht, fmtNum } from '@/components/ui'

type SettlementRecord = {
  orderId: string
  netIncome: number
  totalFee: number
  settlementRef: string
}

function orderStatus(status: string) {
  if (status === 'COMPLETED' || status === 'DELIVERED') return 'completed'
  if (status === 'AWAITING_SHIPMENT') return 'pending'
  if (status === 'IN_TRANSIT') return 'shipped'
  if (status === 'CANCELLED') return 'cancelled'
  return status
}

export default function TikTokOrdersPage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const tiktokOrders = useErpStore(s => s.tiktokOrders)
  const liveSessions = useErpStore(s => s.liveSessions)
  const applyTiktokSettlement = useErpStore(s => s.applyTiktokSettlement)

  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)

  const activeOrders = tiktokOrders.filter(o => o.status !== 'CANCELLED')
  const totalGmv = activeOrders.reduce((s, o) => s + o.amount, 0)
  const netTotal = activeOrders.filter(o => o.settled).reduce((s, o) => s + (o.netRevenue ?? 0), 0)
  const pending = tiktokOrders.filter(o => o.status === 'AWAITING_SHIPMENT').length
  const avgOrder = activeOrders.length ? totalGmv / activeOrders.length : 0

  async function handleSyncSettlement() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('tiktok_access_token') : null
    if (!token) {
      setSyncMsg('กรุณาตั้งค่า Access Token ที่หน้า TikTok Setup ก่อน')
      return
    }
    setSyncing(true)
    setSyncMsg(null)
    try {
      const authToken = localStorage.getItem('chawy_token')
      const res = await fetch(`/api/tiktok/settlement?access_token=${encodeURIComponent(token)}`, {
        headers: { Authorization: authToken ? `Bearer ${authToken}` : '' },
      })
      const json = await res.json() as { settlements?: SettlementRecord[]; error?: string }
      if (!res.ok) throw new Error(json.error ?? 'API error')
      const records = json.settlements ?? []
      let matched = 0
      for (const rec of records) {
        const result = applyTiktokSettlement({ orderId: rec.orderId, netRevenue: rec.netIncome, platformFee: rec.totalFee, settlementRef: rec.settlementRef })
        if (result) matched++
      }
      setSyncMsg(`Sync สำเร็จ — อัปเดต ${matched} / ${records.length} รายการ`)
    } catch (err) {
      setSyncMsg(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSyncing(false)
    }
  }

  async function handleExport() {
    try {
      await exportXlsx('tiktok-orders', `tiktok-orders-export-${new Date().toISOString().slice(0, 10)}.xlsx`)
      setSyncMsg('Export สำเร็จ')
    } catch (err: any) {
      setSyncMsg('Export ล้มเหลว: ' + err.message)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'Channels', 'TikTok Orders']}
        title="TikTok Shop"
        subtitle="ออร์เดอร์และไลฟ์ TikTok · พฤษภาคม 2026"
        right={
          <>
            {syncMsg && <span style={{ fontSize: 12, fontWeight: 600, color: syncMsg.startsWith('Sync สำเร็จ') ? c.pos : c.neg }}>{syncMsg}</span>}
            <Btn t={t} variant="ghost" onClick={handleExport}>Export</Btn>
            <Btn t={t} variant="primary" onClick={handleSyncSettlement}>{syncing ? 'Syncing...' : 'Sync Settlement'}</Btn>
          </>
        }
      />

      <div style={{ padding: '24px 32px 48px' }}>
        <StatStrip
          t={t}
          tiles={[
            { label: 'GMV · last live', value: fmtBaht(liveSessions[0]?.revenue_generated ?? totalGmv), sub: liveSessions[0]?.live_date?.slice(5) ?? 'latest', tone: c.ink },
            { label: 'GMV · MTD', value: fmtBaht(totalGmv), sub: `${liveSessions.length || 1} sessions` },
            { label: 'Avg. order', value: fmtBaht(avgOrder), sub: 'gross / order' },
            { label: 'Orders pending', value: fmtNum(pending), sub: 'awaiting shipment', tone: pending ? c.warn : c.ink },
          ]}
        />

        {liveSessions.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionLabel t={t}>Recent Live Sessions</SectionLabel>
            <PremiumTable t={t} minWidth={840}>
              <thead>
                <tr>
                  {['Date', 'Host', 'Status'].map(h => <PremiumTh key={h} t={t}>{h}</PremiumTh>)}
                  <PremiumTh t={t} right>Orders</PremiumTh>
                  <PremiumTh t={t} right>GMV</PremiumTh>
                </tr>
              </thead>
              <tbody>
                {liveSessions.slice(0, 5).map((session, i) => {
                  const last = i === Math.min(liveSessions.length, 5) - 1
                  return (
                    <tr key={session.id}>
                      <PremiumTd t={t} last={last}><Mono t={t} size={12} weight={500}>{session.live_date}</Mono></PremiumTd>
                      <PremiumTd t={t} last={last}><span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{session.tiktok_account}</span></PremiumTd>
                      <PremiumTd t={t} last={last}><StatusPill t={t} status={session.status === 'Manager_Approved' ? 'completed' : 'pending'} /></PremiumTd>
                      <PremiumTd t={t} last={last} right><Mono t={t} size={12}>{Math.max(1, Math.round(session.revenue_generated / Math.max(avgOrder, 1)))}</Mono></PremiumTd>
                      <PremiumTd t={t} last={last} right><Mono t={t} size={13} weight={600}>{fmtBaht(session.revenue_generated)}</Mono></PremiumTd>
                    </tr>
                  )
                })}
              </tbody>
            </PremiumTable>
          </div>
        )}

        <SectionLabel t={t}>Order Feed</SectionLabel>
        <PremiumTable t={t} minWidth={1040}>
          <thead>
            <tr>
              {['Order', 'Handle', 'Product'].map(h => <PremiumTh key={h} t={t}>{h}</PremiumTh>)}
              <PremiumTh t={t} right>Qty</PremiumTh>
              <PremiumTh t={t} right>Amount</PremiumTh>
              <PremiumTh t={t} right>Net</PremiumTh>
              <PremiumTh t={t}>Status</PremiumTh>
            </tr>
          </thead>
          <tbody>
            {tiktokOrders.map((order, i) => {
              const last = i === tiktokOrders.length - 1
              return (
                <tr key={order.id}>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} weight={500}>{order.id}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><span style={{ fontSize: 12, color: c.accent, fontWeight: 500 }}>@tiktok</span></PremiumTd>
                  <PremiumTd t={t} last={last}><span style={{ fontSize: 13, color: c.ink }}>{order.product}</span><div style={{ fontSize: 11, color: c.ink3 }}>{order.sku}</div></PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={12} color={c.ink2}>{order.qty}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={13} weight={600}>{fmtBaht(order.amount)}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={12} color={order.settled ? c.pos : c.ink3}>{order.settled ? fmtBaht(order.netRevenue ?? 0) : '—'}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><StatusPill t={t} status={orderStatus(order.status)} /></PremiumTd>
                </tr>
              )
            })}
          </tbody>
        </PremiumTable>
      </div>
    </div>
  )
}
