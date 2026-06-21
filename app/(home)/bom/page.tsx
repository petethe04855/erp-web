'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useErpStore } from '@/lib/store/useErpStore'
import { useTheme } from '@/lib/design/ThemeContext'
import { Btn, Card, Mono, PremiumTable, PremiumTd, PremiumTh, TopBar } from '@/components/ui'
import BomEditorModal from '@/app/(home)/sku/components/BomEditorModal'

type BomRow = {
  componentSku: string
  qty: number
  unit: 'piece' | 'g' | 'kg' | 'baht'
  componentType: 'material' | 'packaging' | 'expense'
  unitCostOverride: number
}

export default function BomPage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const products = useErpStore(s => s.products)
  const components = useErpStore(s => s.bundleComponents)
  const setBundleComponents = useErpStore(s => s.setBundleComponents)
  const calcVirtualStock = useErpStore(s => s.calcBundleVirtualStock)
  const bundles = products.filter(product => product.isBundle)
  const [editingSku, setEditingSku] = useState<string | null>(null)
  const [rows, setRows] = useState<BomRow[]>([])
  const [message, setMessage] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedParentSku, setSelectedParentSku] = useState('')

  const editingProduct = products.find(product => product.sku === editingSku)
  const availableParents = bundles.filter(bundle => !components.some(item => item.bundleSku === bundle.sku))

  function openEditor(sku: string) {
    const existing = components.filter(component => component.bundleSku === sku)
    setRows(existing.length ? existing.map(component => ({
      componentSku: component.componentSku,
      qty: component.qty,
      unit: component.unit ?? 'piece',
      componentType: component.componentType ?? 'material',
      unitCostOverride: component.unitCostOverride ?? 0,
    })) : [{
      componentSku: '',
      qty: 1,
      unit: 'piece',
      componentType: 'material',
      unitCostOverride: 0,
    }])
    setEditingSku(sku)
  }

  function save() {
    if (!editingSku) return
    const validRows = rows.filter(row => (row.componentType === 'expense' || row.componentSku) && row.qty > 0)
    if (validRows.length === 0) {
      setMessage('กรุณาเพิ่มส่วนประกอบอย่างน้อย 1 รายการ')
      return
    }
    setBundleComponents({
      bundleSku: editingSku,
      components: validRows,
    })
    setMessage(`บันทึก BOM ${editingSku} แล้ว`)
    setEditingSku(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'Inventory', 'BOM']}
        title="Bill of Materials"
        subtitle="จัดการสูตร ส่วนประกอบ และต้นทุนสินค้าสำเร็จรูป"
        right={<Btn t={t} variant="primary" onClick={() => {
          setMessage('')
          setSelectedParentSku(availableParents[0]?.sku ?? '')
          setCreateOpen(true)
        }}>+ เพิ่ม BOM</Btn>}
      />
      <div style={{ padding: '24px 32px 48px' }}>
        {message && (
          <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 8, background: c.accentBg, color: c.accent, fontSize: 13 }}>
            {message}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          <Card t={t}><div style={{ fontSize: 11, color: c.ink3 }}>สินค้าตัวแม่</div><Mono t={t} size={24} weight={600}>{bundles.length}</Mono></Card>
          <Card t={t}><div style={{ fontSize: 11, color: c.ink3 }}>มีสูตร BOM แล้ว</div><Mono t={t} size={24} weight={600}>{new Set(components.map(item => item.bundleSku)).size}</Mono></Card>
          <Card t={t}><div style={{ fontSize: 11, color: c.ink3 }}>รายการส่วนประกอบ</div><Mono t={t} size={24} weight={600}>{components.length}</Mono></Card>
        </div>

        <PremiumTable t={t} minWidth={850}>
          <thead><tr>{['SKU ตัวแม่', 'ชื่อสินค้า', 'จำนวนส่วนประกอบ', 'ต้นทุน BOM', 'Virtual stock', 'สถานะสูตร', ''].map(label => <PremiumTh key={label} t={t}>{label}</PremiumTh>)}</tr></thead>
          <tbody>
            {bundles.length === 0 && (
              <tr>
                <PremiumTd t={t} last>
                  <div style={{ padding: 30, textAlign: 'center', color: c.ink3 }}>
                    ยังไม่มี SKU ตัวแม่สำหรับสร้าง BOM · <Link href="/sku" style={{ color: c.accent }}>ไปสร้าง SKU ประเภท Bundle</Link>
                  </div>
                </PremiumTd>
              </tr>
            )}
            {bundles.map((bundle, index) => {
              const bomItems = components.filter(item => item.bundleSku === bundle.sku)
              const last = index === bundles.length - 1
              return (
                <tr key={bundle.sku}>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} weight={600}>{bundle.sku}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}>{bundle.name}</PremiumTd>
                  <PremiumTd t={t} last={last}>{bomItems.length}</PremiumTd>
                  <PremiumTd t={t} last={last}><Mono t={t} size={13}>฿{bundle.cost.toLocaleString('th-TH', { maximumFractionDigits: 2 })}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}>{calcVirtualStock(bundle.sku).toLocaleString()}</PremiumTd>
                  <PremiumTd t={t} last={last}><span style={{ color: bomItems.length ? c.pos : c.warn }}>{bomItems.length ? 'พร้อมใช้งาน' : 'ยังไม่มีสูตร'}</span></PremiumTd>
                  <PremiumTd t={t} last={last} right><Btn t={t} variant="ghost" onClick={() => openEditor(bundle.sku)}>{bomItems.length ? 'แก้ไขสูตร' : 'สร้างสูตร'}</Btn></PremiumTd>
                </tr>
              )
            })}
          </tbody>
        </PremiumTable>
      </div>

      {editingSku && editingProduct && (
        <BomEditorModal
          bomSku={editingSku}
          bomProduct={editingProduct}
          products={products}
          bomRows={rows}
          setBomRows={setRows}
          onClose={() => setEditingSku(null)}
          onSave={save}
        />
      )}

      {createOpen && (
        <div
          onClick={() => setCreateOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 210, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div onClick={event => event.stopPropagation()}>
          <Card t={t} style={{ width: 460, maxWidth: '92vw', padding: 24 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: c.ink }}>เพิ่ม BOM ใหม่</div>
            <div style={{ fontSize: 12, color: c.ink3, marginTop: 4, marginBottom: 18 }}>เลือก SKU ตัวแม่ที่ต้องการสร้างสูตร</div>

            {availableParents.length > 0 ? (
              <>
                <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: c.ink2 }}>
                  SKU ตัวแม่
                  <select
                    value={selectedParentSku}
                    onChange={event => setSelectedParentSku(event.target.value)}
                    style={{ padding: '9px 11px', border: `1px solid ${c.border}`, borderRadius: t.radius, background: c.surface, color: c.ink }}
                  >
                    {availableParents.map(product => (
                      <option key={product.sku} value={product.sku}>{product.sku} — {product.name}</option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <div style={{ padding: 14, borderRadius: 8, background: c.subtle, color: c.ink2, fontSize: 13 }}>
                {bundles.length === 0
                  ? 'ยังไม่มี SKU ประเภท Bundle กรุณาสร้าง SKU ตัวแม่ก่อน'
                  : 'SKU ตัวแม่ทุกตัวมี BOM แล้ว กรุณาใช้ปุ่ม “แก้ไขสูตร” ในตาราง'}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <Btn t={t} variant="ghost" onClick={() => setCreateOpen(false)}>ยกเลิก</Btn>
              {bundles.length === 0 && <Link href="/sku"><Btn t={t} variant="ghost">ไปหน้า SKU</Btn></Link>}
              <Btn
                t={t}
                variant="primary"
                disabled={!selectedParentSku}
                onClick={() => {
                  if (!selectedParentSku) return
                  setCreateOpen(false)
                  openEditor(selectedParentSku)
                }}
              >
                เพิ่มส่วนประกอบ
              </Btn>
            </div>
          </Card>
          </div>
        </div>
      )}
    </div>
  )
}
