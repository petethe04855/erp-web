'use client'
import React from 'react'
import { Card, Mono, fmtBaht, fmtNum } from '@/components/ui'
import type { DesignTokens } from '@/lib/design/tokens'

interface SalesOrderStatsProps {
  t: DesignTokens
  totalAmount: number
  filteredCount: number
  itemCount: number
  largestAmount: number
}

export default function SalesOrderStats({ t, totalAmount, filteredCount, itemCount, largestAmount }: SalesOrderStatsProps) {
  const c = t.color
  return (
    <Card t={t} pad={false} className="mb-4 overflow-hidden border border-border bg-card" style={{ borderColor: 'var(--erp-border)' }}>
      <div className="grid grid-cols-2 md:grid-cols-4">
        {[
          { label: 'Selection total', value: fmtBaht(totalAmount), sub: `${filteredCount} orders` },
          { label: 'Average order', value: fmtBaht(filteredCount ? totalAmount / filteredCount : 0), sub: 'per order' },
          { label: 'Items shipped', value: fmtNum(itemCount), sub: 'across selection' },
          { label: 'Largest order', value: fmtBaht(largestAmount), sub: 'in selection' },
        ].map((item, i) => (
          <div 
            key={item.label} 
            className="p-[16px_22px] border-b md:border-b-0 border-border"
            style={{ 
              borderRight: i < 3 ? `1px solid var(--erp-border)` : 'none',
              borderColor: 'var(--erp-border)',
            }}
          >
            <div className="text-[10px] font-medium tracking-[0.10em] uppercase text-muted-foreground" style={{ color: 'var(--erp-ink3)' }}>{item.label}</div>
            <Mono t={t} size={20} weight={600} style={{ display: 'block', marginTop: 8 }}>{item.value}</Mono>
            <div className="text-xs text-muted-foreground mt-1" style={{ color: 'var(--erp-ink3)' }}>{item.sub}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
