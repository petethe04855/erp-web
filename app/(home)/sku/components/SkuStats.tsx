'use client'
import React from 'react'

interface SkuStatsProps {
  activeCount: number
  lowStockCount: number
  outStockCount: number
  bundleCount: number
}

export default function SkuStats({ activeCount, lowStockCount, outStockCount, bundleCount }: SkuStatsProps) {
  const stats = [
    { label: 'SKU ทั้งหมด',   value: activeCount,     icon: '📦', color: 'text-[var(--erp-accent)]', bg: 'bg-[var(--erp-accent-bg)]' },
    { label: 'ใกล้หมด',       value: lowStockCount,   icon: '⚠️',  color: 'text-amber-600 dark:text-amber-400', bg: 'bg-[#FEF3C7] dark:bg-amber-950/20' },
    { label: 'หมดสต็อก',      value: outStockCount,   icon: '🛑', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-[#FEE2E2] dark:bg-rose-950/20' },
    { label: 'สินค้าเซ็ต',    value: bundleCount,    icon: '🛍️', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-[#D1FAE5] dark:bg-emerald-950/20' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {stats.map(s => (
        <div key={s.label} className={`rounded-xl p-3.5 ${s.bg}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{s.icon}</span>
            <span className={`text-[11px] font-semibold ${s.color}`}>{s.label}</span>
          </div>
          <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
        </div>
      ))}
    </div>
  )
}
