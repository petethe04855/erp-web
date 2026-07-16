'use client'
import { useTheme } from '@/lib/design/ThemeContext'
import { TopBar, CategoryBadge, StockBadge } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { useState } from 'react'
import { useErpStore } from '@/lib/store/useErpStore'
import type { Product, ProductCategory, CreateProductInput, UpdateProductInput } from '@/lib/store/erpWorkflow'

// Import Sub-Components
import SkuStats from './components/SkuStats'
import SkuFilters from './components/SkuFilters'
import SkuFormModal from './components/SkuFormModal'
import SkuViewModal from './components/SkuViewModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'

const EMPTY_FORM: CreateProductInput = {
  sku: '', name: '', type: 'Cat', barcode: '', weightGrams: 0,
  retailPrice: 0, wholesalePrice: 0, cost: 0, reorder: 0, isBundle: false, note: '', baseUnit: 'piece',
}

function formatBaht(n: number) { return '฿' + n.toLocaleString('th-TH') }

type ModalMode = 'add' | 'edit' | 'view' | null

export default function SkuPage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const products = useErpStore(s => s.products)
  const bundleComponents = useErpStore(s => s.bundleComponents)
  const addProduct = useErpStore(s => s.addProduct)
  const updateProduct = useErpStore(s => s.updateProduct)
  const deleteProduct = useErpStore(s => s.deleteProduct)
  const calcBundleVirtualStock = useErpStore(s => s.calcBundleVirtualStock)

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<ProductCategory | 'All'>('All')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('active')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selected, setSelected] = useState<Product | null>(null)
  const [form, setForm] = useState<CreateProductInput>(EMPTY_FORM)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Filtered list
  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.barcode.includes(q)
    const matchType = filterType === 'All' || p.type === filterType
    const matchActive = filterActive === 'all' || (filterActive === 'active' ? p.isActive : !p.isActive)
    return matchSearch && matchType && matchActive
  })

  // Stats
  const active = products.filter(p => p.isActive)
  const lowStock = active.filter(p => !p.isBundle && p.stock > 0 && p.stock < p.reorder)
  const outStock = active.filter(p => !p.isBundle && p.stock === 0)
  const bundles = active.filter(p => p.isBundle)

  // Handlers
  function openAdd() {
    setForm({ ...EMPTY_FORM })
    setError('')
    setModalMode('add')
  }

  function openEdit(p: Product) {
    setSelected(p)
    setForm({
      sku: p.sku, name: p.name, type: p.type,
      barcode: p.barcode, weightGrams: p.weightGrams,
      retailPrice: p.retailPrice, wholesalePrice: p.wholesalePrice,
      cost: p.cost, reorder: p.reorder, isBundle: p.isBundle, note: p.note,
      baseUnit: p.baseUnit ?? 'piece',
    })
    setError('')
    setModalMode('edit')
  }

  function openView(p: Product) {
    setSelected(p)
    setModalMode('view')
  }

  function closeModal() {
    setModalMode(null)
    setSelected(null)
    setError('')
  }

  function handleSave() {
    if (!form.sku.trim()) { setError('กรุณากรอก SKU'); return }
    if (!form.name.trim()) { setError('กรุณากรอกชื่อสินค้า'); return }
    if (form.type !== 'Other' && form.retailPrice <= 0) { setError('ราคาขายต้องมากกว่า 0'); return }
    if (form.cost <= 0) { setError('ต้นทุนต้องมากกว่า 0'); return }
    if (form.type !== 'Other' && (!form.weightGrams || form.weightGrams <= 0)) { setError('น้ำหนักสินค้าต้องมากกว่า 0'); return }
    try {
      if (modalMode === 'add') {
        addProduct({ ...form, isBundle: form.type === 'Bundle' })
      } else if (modalMode === 'edit' && selected) {
        const input: UpdateProductInput = {
          sku: selected.sku, name: form.name, type: form.type,
          barcode: form.barcode, weightGrams: form.weightGrams,
          retailPrice: form.retailPrice, wholesalePrice: form.wholesalePrice,
          price: form.retailPrice, cost: form.cost, reorder: form.reorder,
          isBundle: form.type === 'Bundle', note: form.note,
          baseUnit: form.baseUnit,
        }
        updateProduct(input)
      }
      closeModal()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด')
    }
  }

  function handleToggleActive(p: Product) {
    updateProduct({ sku: p.sku, isActive: !p.isActive })
  }

  function handleDelete(sku: string) {
    deleteProduct(sku)
    setDeleteConfirm(null)
  }

  return (
    <div className="min-h-screen bg-canvas" style={{ background: c.canvas }}>
      <TopBar t={t} title="SKU Master" subtitle="ข้อมูลสินค้า" />
      <div className="px-8 py-6">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground m-0" style={{ color: 'var(--erp-ink)' }}>SKU Master</h1>
            <p className="text-xs text-muted-foreground mt-1" style={{ color: 'var(--erp-ink3)' }}>จัดการข้อมูลสินค้า (Master Data)</p>
          </div>
          <Button onClick={openAdd} className="bg-[var(--erp-accent)] text-white gap-1.5 h-9 px-4 text-xs font-semibold rounded-lg shadow-none cursor-pointer">
            + เพิ่มสินค้า
          </Button>
        </div>

        {/* Stats */}
        <SkuStats 
          activeCount={active.length} 
          lowStockCount={lowStock.length} 
          outStockCount={outStock.length} 
          bundleCount={bundles.length} 
        />

        {/* Filters */}
        <SkuFilters 
          search={search}
          setSearch={setSearch}
          filterType={filterType}
          setFilterType={setFilterType}
          filterActive={filterActive}
          setFilterActive={setFilterActive}
        />

        {/* Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden" style={{ background: 'var(--erp-surface)', borderColor: 'var(--erp-border)' }}>
          <Table className="w-full border-collapse">
            <TableHeader className="bg-muted/50 border-b border-border" style={{ background: 'var(--erp-subtle)', borderColor: 'var(--erp-border)' }}>
              <TableRow>
                {['SKU', 'ชื่อสินค้า', 'ประเภท', 'ต้นทุน', 'ราคาขาย B2C', 'ราคา B2B', 'น้ำหนัก', 'สต็อก', 'Reorder', 'สถานะ', ''].map(h => (
                  <TableHead key={h} className="p-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--erp-ink3)' }}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="p-10 text-center text-muted-foreground text-sm">
                    ไม่พบสินค้า
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((p, i) => (
                <TableRow key={p.sku} className="hover:bg-muted/30 border-b border-border" style={{
                  borderColor: 'var(--erp-subtle)',
                  opacity: p.isActive ? 1 : 0.5,
                }}>
                  <TableCell className="p-3">
                    <span className="font-mono text-xs font-bold text-[var(--erp-accent)] cursor-pointer"
                      onClick={() => openView(p)}>{p.sku}</span>
                  </TableCell>
                  <TableCell className="p-3">
                    <div className="text-sm font-semibold text-foreground" style={{ color: 'var(--erp-ink)' }}>{p.name}</div>
                    {p.barcode && <div className="text-xs text-muted-foreground" style={{ color: 'var(--erp-ink3)' }}>{p.barcode}</div>}
                  </TableCell>
                  <TableCell className="p-3"><CategoryBadge type={p.type} /></TableCell>
                  <TableCell className="p-3 text-sm text-foreground" style={{ color: 'var(--erp-ink)' }}>{formatBaht(p.cost)}</TableCell>
                  <TableCell className="p-3 text-sm font-semibold text-emerald-600 dark:text-emerald-500">{formatBaht(p.retailPrice)}</TableCell>
                  <TableCell className="p-3 text-sm text-muted-foreground" style={{ color: 'var(--erp-ink3)' }}>{formatBaht(p.wholesalePrice)}</TableCell>
                  <TableCell className="p-3 text-xs text-muted-foreground" style={{ color: 'var(--erp-ink3)' }}>{p.weightGrams > 0 ? `${p.weightGrams}g` : '-'}</TableCell>
                  <TableCell className="p-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground" style={{ color: 'var(--erp-ink)' }}>
                        {p.isBundle ? calcBundleVirtualStock(p.sku) : p.stock.toLocaleString()}
                      </span>
                      <StockBadge
                        stock={p.isBundle ? calcBundleVirtualStock(p.sku) : p.stock}
                        reorder={p.reorder}
                        isBundle={p.isBundle}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="p-3 text-sm text-muted-foreground" style={{ color: 'var(--erp-ink3)' }}>{p.reorder || '—'}</TableCell>
                  <TableCell className="p-3">
                    <button onClick={() => handleToggleActive(p)} className={`
                      px-2.5 py-1 rounded-full border text-[11px] font-semibold cursor-pointer transition-colors
                      ${p.isActive 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400' 
                        : 'border-border bg-muted text-muted-foreground'
                      }
                    `} style={!p.isActive ? { borderColor: 'var(--erp-border)', background: 'var(--erp-subtle)', color: '#9CA3AF' } : undefined}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </TableCell>
                  <TableCell className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      <Button onClick={() => openEdit(p)} variant="outline" size="xs" className="cursor-pointer border-border" style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)', color: '#374151' }}>แก้ไข</Button>
                      <Button onClick={() => setDeleteConfirm(p.sku)} variant="destructive" size="xs" className="cursor-pointer bg-[#FFF5F5] border-[#FEE2E2] hover:bg-destructive/10 text-destructive border" style={{ borderColor: '#FEE2E2' }}>ลบ</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-2 text-xs text-muted-foreground" style={{ color: 'var(--erp-ink3)' }}>แสดง {filtered.length} จาก {products.length} รายการ</div>

        {/* Modals */}
        {(modalMode === 'add' || modalMode === 'edit') && (
          <SkuFormModal
            modalMode={modalMode}
            selectedSku={selected?.sku}
            form={form}
            setForm={setForm}
            error={error}
            onClose={closeModal}
            onSave={handleSave}
          />
        )}

        {modalMode === 'view' && selected && (
          <SkuViewModal
            selected={selected}
            bundleComponents={bundleComponents}
            products={products}
            calcBundleVirtualStock={calcBundleVirtualStock}
            onClose={closeModal}
            onEdit={() => { closeModal(); openEdit(selected) }}
          />
        )}

        {deleteConfirm && (
          <DeleteConfirmModal
            sku={deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            onConfirm={() => handleDelete(deleteConfirm)}
          />
        )}

      </div>
    </div>
  )
}
