'use client'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useErpStore } from '@/lib/store/useErpStore'
import { useTheme } from '@/lib/design/ThemeContext'
import { Card, Mono, StatStrip, TopBar, fmtBaht, fmtBahtK, fmtNum } from '@/components/ui'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'

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
            <Button variant="outline" onClick={() => router.push('/stock-check')}>Stock Check</Button>
            <Button variant="outline" onClick={() => router.push('/stock-check')}>Adjust</Button>
            <Button onClick={() => router.push('/goods-receive')} className="bg-[#0F6E58] text-white hover:bg-[#0F6E58]/90">+ Receive Goods</Button>
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

        <Card t={t} pad={false} style={{ overflow: 'auto' }}>
          <Table className="min-w-[1060px]">
            <TableHeader>
              <TableRow>
                {['SKU', 'Product', 'Lot'].map(h => (
                  <TableHead key={h} className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {h}
                  </TableHead>
                ))}
                <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">On hand</TableHead>
                <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Reorder</TableHead>
                <TableHead className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Stock level</TableHead>
                <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Value</TableHead>
                <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">30D trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => {
                const barColor = p.status === 'out' ? c.neg : p.status === 'low' ? c.warn : c.pos
                return (
                  <TableRow key={p.sku}>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={12} weight={500}>{p.sku}</Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <div style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{p.name}</div>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={11} color={p.lot ? c.ink3 : c.ink4}>
                        {p.lot ? `${p.lot.lot}${p.lot.expiryDate ? ` · exp ${p.lot.expiryDate}` : ''}` : 'No active lot'}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <Mono t={t} size={13} weight={600} color={p.status === 'out' ? c.neg : c.ink}>{fmtNum(p.onHand)}</Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <Mono t={t} size={12} color={c.ink3}>{p.reorder}</Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160 }}>
                        <div style={{ flex: 1, height: 6, background: c.subtle, borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.max(p.ratio * 100, p.onHand > 0 ? 6 : 0)}%`, height: '100%', background: barColor }} />
                        </div>
                        <span style={{ fontSize: 11, color: barColor, fontWeight: 500, minWidth: 50 }}>
                          {p.status === 'out' ? 'Out' : p.status === 'low' ? 'Low' : 'Healthy'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <Mono t={t} size={12}>{fmtBaht(p.value)}</Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <Mono t={t} size={11} color={c.ink3}>+0.0%</Mono>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
