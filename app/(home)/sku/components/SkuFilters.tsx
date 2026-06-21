'use client'
import React from 'react'
import { ProductCategory } from '@/components/ui'

interface SkuFiltersProps {
  search: string
  setSearch: (s: string) => void
  filterType: ProductCategory | 'All'
  setFilterType: (t: ProductCategory | 'All') => void
  filterActive: 'all' | 'active' | 'inactive'
  setFilterActive: (a: 'all' | 'active' | 'inactive') => void
}

export default function SkuFilters({
  search,
  setSearch,
  filterType,
  setFilterType,
  filterActive,
  setFilterActive
}: SkuFiltersProps) {
  const types: Array<ProductCategory | 'All'> = ['All', 'Cat', 'Dog', 'Bundle', 'Other']
  const labels: Record<ProductCategory, string> = { Cat: 'แมว', Dog: 'สุนัข', Bundle: 'เซ็ต', Other: 'อื่นๆ' }

  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="ค้นหา SKU, ชื่อ, บาร์โค้ด..."
        style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--erp-border)', fontSize: 13 }}
      />
      <div style={{ display: 'flex', gap: 6 }}>
        {types.map(t => (
          <button key={t} onClick={() => setFilterType(t)} style={{
            padding: '7px 14px', borderRadius: 8, border: '1px solid',
            borderColor: filterType === t ? 'var(--erp-accent)' : 'var(--erp-border)',
            background: filterType === t ? 'var(--erp-accent-bg)' : '#fff',
            color: filterType === t ? 'var(--erp-accent)' : 'var(--erp-ink3)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            {t === 'All' ? 'ทั้งหมด' : labels[t]}
          </button>
        ))}
      </div>
      <select
        value={filterActive}
        onChange={e => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
        style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--erp-border)', fontSize: 13, color: '#374151' }}
      >
        <option value="active">เฉพาะ Active</option>
        <option value="inactive">เฉพาะ Inactive</option>
        <option value="all">ทั้งหมด</option>
      </select>
    </div>
  )
}
