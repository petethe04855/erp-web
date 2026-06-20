'use client'
import React from 'react'
import { ProductCategory } from '@/components/ui'
import type { CreateProductInput } from '@/lib/store/erpWorkflow'

interface SkuFormModalProps {
  modalMode: 'add' | 'edit'
  selectedSku?: string
  form: CreateProductInput
  setForm: React.Dispatch<React.SetStateAction<CreateProductInput>>
  error: string
  onClose: () => void
  onSave: () => void
}

export default function SkuFormModal({
  modalMode,
  selectedSku,
  form,
  setForm,
  error,
  onClose,
  onSave
}: SkuFormModalProps) {
  const CATEGORIES: ProductCategory[] = ['Cat', 'Dog', 'Bundle', 'Other']
  const labels: Record<ProductCategory, string> = { Cat: 'แมว', Dog: 'สุนัข', Bundle: 'เซ็ต', Other: 'อื่นๆ' }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    }}>
      <div style={{
        background: 'var(--erp-surface)', borderRadius: 12, padding: 28, width: 560,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--erp-ink)' }}>
            {modalMode === 'add' ? '+ เพิ่มสินค้าใหม่' : `แก้ไขสินค้า — ${selectedSku}`}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF' }}>Close</button>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>SKU *</label>
            <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value.toUpperCase() }))}
              disabled={modalMode === 'edit'}
              placeholder="เช่น CAT-CHK-30"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--erp-border)', fontSize: 13, boxSizing: 'border-box', background: modalMode === 'edit' ? 'var(--erp-subtle)' : '#fff' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>ประเภท *</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ProductCategory, isBundle: e.target.value === 'Bundle' }))}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--erp-border)', fontSize: 13, boxSizing: 'border-box' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{labels[c]}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>ชื่อสินค้า *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="เช่น ไก่อกฟรีซดราย 30g"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--erp-border)', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>บาร์โค้ด</label>
            <input value={form.barcode ?? ''} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))}
              placeholder="13 หลัก EAN"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--erp-border)', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>น้ำหนัก (กรัม)</label>
            <input type="number" min={1} value={form.weightGrams === 0 ? '' : (form.weightGrams ?? '')} onChange={e => setForm(f => ({ ...f, weightGrams: e.target.value === '' ? 0 : +e.target.value }))}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--erp-border)', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>ต้นทุน (Cost) ฿ *</label>
            <input type="number" min={1} value={form.cost === 0 ? '' : form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value === '' ? 0 : +e.target.value }))}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--erp-border)', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>ราคาขาย B2C ฿ *</label>
            <input type="number" min={1} value={form.retailPrice === 0 ? '' : form.retailPrice} onChange={e => setForm(f => ({ ...f, retailPrice: e.target.value === '' ? 0 : +e.target.value, price: e.target.value === '' ? 0 : +e.target.value }))}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--erp-border)', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>ราคาขาย B2B (ส่ง) ฿</label>
            <input type="number" min={1} value={form.wholesalePrice === 0 ? '' : (form.wholesalePrice ?? '')} onChange={e => setForm(f => ({ ...f, wholesalePrice: e.target.value === '' ? 0 : +e.target.value }))}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--erp-border)', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Reorder Point</label>
            <input type="number" min={1} value={form.reorder === 0 ? '' : (form.reorder ?? '')} onChange={e => setForm(f => ({ ...f, reorder: e.target.value === '' ? 0 : +e.target.value }))}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--erp-border)', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>หมายเหตุ</label>
            <input value={form.note ?? ''} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="หมายเหตุเพิ่มเติม"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--erp-border)', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
        </div>

        {form.cost > 0 && form.retailPrice > 0 && (
          <div style={{ marginTop: 14, padding: '10px 14px', background: '#F0FDF4', borderRadius: 8, border: '1px solid #BBF7D0', display: 'flex', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: '#065F46', fontWeight: 600 }}>Gross Margin</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>
                {(((form.retailPrice - form.cost) / form.retailPrice) * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#065F46', fontWeight: 600 }}>กำไรต่อชิ้น</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>฿{(form.retailPrice - form.cost).toLocaleString('th-TH')}</div>
            </div>
            {(form.wholesalePrice ?? 0) > 0 && (
              <div>
                <div style={{ fontSize: 11, color: '#065F46', fontWeight: 600 }}>Margin B2B</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>
                  {((((form.wholesalePrice ?? 0) - form.cost) / (form.wholesalePrice ?? 1)) * 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid var(--erp-border)', background: 'var(--erp-surface)', color: '#374151', fontSize: 13, cursor: 'pointer' }}>
            ยกเลิก
          </button>
          <button onClick={onSave} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--erp-accent)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {modalMode === 'add' ? 'บันทึกสินค้า' : 'บันทึกการแก้ไข'}
          </button>
        </div>
      </div>
    </div>
  )
}
