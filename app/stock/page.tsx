'use client'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useErpStore } from '@/lib/store/useErpStore'
import { useTheme } from '@/lib/design/ThemeContext'
import { Btn, Mono, PremiumTable, PremiumTd, PremiumTh, StatStrip, TopBar, fmtBaht, fmtBahtK, fmtNum } from '@/components/ui'

function earliestLot(lots: ReturnType<typeof useErpStore.getState>['stockLots'], sku: string) {
  return lots
    .filter(l => l.sku === sku && l.remainingQty > 0)
    .sort((a, b) => {
      if (!a.expiryDate && !b.expiryDate) return 0
      if (!a.expiryDate) return 1
      if (!b.expiryDate) return -1
      return a.expiryDate.localeCompare(b.expiryDate)
    })[0]
}

export default function StockPage() {
  const router = useRouter()
  const { tokens: t } = useTheme()
  const c = t.color
  const products = useErpStore(s => s.products)
  const stockLots = useErpStore(s => s.stockLots)

  const rows = useMemo(() => products.map(product => {
    const lot = earliestLot(stockLots, product.sku)
    const onHand = product.stock
    const value = onHand * product.cost
    const status = onHand === 0 ? 'out' : onHand <= product.reorder ? 'low' : 'ok'
    const ratio = Math.min(onHand / Math.max(product.reorder * 2, 1), 1)
    return { ...product, lot, onHand, value, status, ratio }
  }), [products, stockLots])

  const totalValue = rows.reduce((s, p) => s + p.value, 0)
  const totalUnits = rows.reduce((s, p) => s + p.onHand, 0)
  const lowStock = rows.filter(p => p.onHand > 0 && p.onHand <= p.reorder).length
  const outOfStock = rows.filter(p => p.onHand === 0).length

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'Inventory', 'Stock Balance']}
        title="Stock Balance"
        subtitle={`${rows.length} SKUs tracked · ${fmtBahtK(totalValue)} on-hand value`}
        right={
          <>
            <Btn t={t} variant="ghost" onClick={() => router.push('/stock-check')}>Stock Check</Btn>
            <Btn t={t} variant="ghost" onClick={() => router.push('/stock-check')}>Adjust</Btn>
            <Btn t={t} variant="primary" onClick={() => router.push('/goods-receive')}>+ Receive Goods</Btn>
          </>
        }
      />

      <div style={{ padding: '24px 32px 48px' }}>
        <StatStrip
          t={t}
          tiles={[
            { label: 'On-hand value', value: fmtBaht(totalValue), sub: 'across all SKUs' },
            { label: 'Total units', value: fmtNum(totalUnits), sub: 'physical inventory' },
            { label: 'Low stock', value: String(lowStock), sub: 'below reorder point', tone: c.warn },
            { label: 'Out of stock', value: String(outOfStock), sub: 'reorder required', tone: c.neg },
          ]}
        />

        <PremiumTable t={t} minWidth={1060}>
          <thead>
            <tr>
              {['SKU', 'Product', 'Lot'].map(h => <PremiumTh key={h} t={t}>{h}</PremiumTh>)}
              <PremiumTh t={t} right>On hand</PremiumTh>
              <PremiumTh t={t} right>Reorder</PremiumTh>
              <PremiumTh t={t}>Stock level</PremiumTh>
              <PremiumTh t={t} right>Value</PremiumTh>
              <PremiumTh t={t} right>30D trend</PremiumTh>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => {
              const last = i === rows.length - 1
              const barColor = p.status === 'out' ? c.neg : p.status === 'low' ? c.warn : c.pos
              return (
                <tr key={p.sku}>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} weight={500}>{p.sku}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><div style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{p.name}</div></PremiumTd>
                  <PremiumTd t={t} last={last}>
                    <Mono t={t} size={11} color={p.lot ? c.ink3 : c.ink4}>
                      {p.lot ? `${p.lot.lot}${p.lot.expiryDate ? ` · exp ${p.lot.expiryDate}` : ''}` : 'No active lot'}
                    </Mono>
                  </PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={13} weight={600} color={p.status === 'out' ? c.neg : c.ink}>{fmtNum(p.onHand)}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={12} color={c.ink3}>{p.reorder}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160 }}>
                      <div style={{ flex: 1, height: 6, background: c.subtle, borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(p.ratio * 100, p.onHand > 0 ? 6 : 0)}%`, height: '100%', background: barColor }} />
                      </div>
                      <span style={{ fontSize: 11, color: barColor, fontWeight: 500, minWidth: 50 }}>
                        {p.status === 'out' ? 'Out' : p.status === 'low' ? 'Low' : 'Healthy'}
                      </span>
                    </div>
                  </PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={12}>{fmtBaht(p.value)}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={11} color={c.ink3}>+0.0%</Mono></PremiumTd>
                </tr>
              )
            })}
          </tbody>
        </PremiumTable>
      </div>
    </div>
  )
}
