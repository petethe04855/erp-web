'use client'
import React from 'react'
import type { Product } from '@/lib/store/erpWorkflow'

interface BomEditorModalProps {
  bomSku: string
  bomProduct: Product
  products: Product[]
  bomRows: Array<{ componentSku: string; qty: number }>
  setBomRows: React.Dispatch<React.SetStateAction<Array<{ componentSku: string; qty: number }>>>
  onClose: () => void
  onSave: () => void
}

export default function BomEditorModal({
  bomSku,
  bomProduct,
  products,
  bomRows,
  setBomRows,
  onClose,
  onSave
}: BomEditorModalProps) {
  const addBomRow = () => setBomRows(rows => [...rows, { componentSku: '', qty: 1 }])
  const removeBomRow = (idx: number) => setBomRows(rows => rows.filter((_, i) => i !== idx))
  const updateBomRow = (idx: number, field: 'componentSku' | 'qty', val: string | number) => {
    setBomRows(rows => rows.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  }

  const validRows = bomRows.filter(r => r.componentSku && r.qty > 0)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--erp-surface)', borderRadius: 12, padding: 28, width: 520,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--erp-ink)' }}>🧩 BOM — {bomProduct.name}</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--erp-ink3)' }}>กำหนดส่วนประกอบสำหรับสินค้าเซ็ต</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF' }}>Close</button>
        </div>

        {validRows.length > 0 && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: '#EFF6FF', borderRadius: 8, border: '1px solid #BFDBFE' }}>
            <div style={{ fontSize: 11, color: '#1D4ED8', fontWeight: 600, marginBottom: 4 }}>Virtual Stock Preview (ก่อนบันทึก)</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {validRows.map(r => {
                const cp = products.find(p => p.sku === r.componentSku)
                if (!cp) return null
                const avail = Math.max(0, cp.stock - cp.reservedQty)
                const canMake = Math.floor(avail / r.qty)
                return (
                  <div key={r.componentSku} style={{ fontSize: 12, color: '#374151' }}>
                    <span style={{ fontWeight: 600 }}>{r.componentSku}</span>: {avail} ÷ {r.qty} = <span style={{ fontWeight: 700, color: canMake > 0 ? '#059669' : '#EF4444' }}>{canMake} เซ็ต</span>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: '#1D4ED8' }}>
              สต็อกเซ็ตที่ขายได้ = {Math.min(...validRows.map(r => {
                const cp = products.find(p => p.sku === r.componentSku)
                if (!cp) return 0
                return Math.floor(Math.max(0, cp.stock - cp.reservedQty) / r.qty)
              }))} ชุด
            </div>
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 36px', gap: 8, marginBottom: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--erp-ink3)' }}>SKU ส่วนประกอบ</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--erp-ink3)' }}>จำนวน/เซ็ต</div>
            <div />
          </div>
          {bomRows.map((row, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 36px', gap: 8, marginBottom: 6 }}>
              <select
                value={row.componentSku}
                onChange={e => updateBomRow(idx, 'componentSku', e.target.value)}
                style={{ padding: '7px 10px', borderRadius: 7, border: '1px solid var(--erp-border)', fontSize: 13, background: 'var(--erp-surface)', color: 'var(--erp-ink)' }}
              >
                <option value="">— เลือก SKU —</option>
                {products.filter(p => !p.isBundle && p.sku !== bomSku).map(p => (
                  <option key={p.sku} value={p.sku}>{p.sku} — {p.name}</option>
                ))}
              </select>
              <input
                type="number" min={1} value={row.qty}
                onChange={e => updateBomRow(idx, 'qty', +e.target.value)}
                style={{ padding: '7px 10px', borderRadius: 7, border: '1px solid var(--erp-border)', fontSize: 13, textAlign: 'center', background: 'var(--erp-surface)', color: 'var(--erp-ink)' }}
              />
              <button onClick={() => removeBomRow(idx)} style={{
                borderRadius: 7, border: '1px solid #FEE2E2', background: '#FFF5F5',
                color: '#EF4444', cursor: 'pointer', fontSize: 16,
              }}>×</button>
            </div>
          ))}
        </div>

        <button onClick={addBomRow} style={{
          padding: '6px 14px', borderRadius: 7, border: '1px dashed #D1D5DB',
          background: 'var(--erp-subtle)', color: 'var(--erp-ink3)', fontSize: 12, cursor: 'pointer', marginBottom: 16,
        }}>+ เพิ่มส่วนประกอบ</button>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid var(--erp-border)', background: 'var(--erp-surface)', color: '#374151', fontSize: 13, cursor: 'pointer' }}>ยกเลิก</button>
          <button onClick={onSave} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#059669', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>บันทึก BOM</button>
        </div>
      </div>
    </div>
  )
}
