'use client'
import React from 'react'
import { ProductCategory } from '@/components/ui'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'

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
    <div className="flex gap-2.5 mb-4 flex-wrap items-center">
      <Input
        value={search} 
        onChange={e => setSearch(e.target.value)}
        placeholder="ค้นหา SKU, ชื่อ, บาร์โค้ด..."
        className="flex-1 min-w-[200px]"
      />
      <div className="flex gap-1.5 flex-wrap">
        {types.map(t => (
          <button 
            key={t} 
            onClick={() => setFilterType(t)} 
            className={`
              px-3.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors
              ${filterType === t 
                ? 'border-[var(--erp-accent)] bg-[var(--erp-accent-bg)] text-[var(--erp-accent)]' 
                : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
              }
            `}
            style={filterType !== t ? { borderColor: 'var(--erp-border)', color: 'var(--erp-ink3)' } : undefined}
          >
            {t === 'All' ? 'ทั้งหมด' : labels[t]}
          </button>
        ))}
      </div>
      <NativeSelect
        value={filterActive}
        onChange={e => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
        className="w-auto h-9 text-xs font-semibold cursor-pointer border-border"
        style={{ borderColor: 'var(--erp-border)' }}
      >
        <option value="active">เฉพาะ Active</option>
        <option value="inactive">เฉพาะ Inactive</option>
        <option value="all">ทั้งหมด</option>
      </NativeSelect>
    </div>
  )
}
