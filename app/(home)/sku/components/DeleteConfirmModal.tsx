'use client'
import React from 'react'
import { Button } from '@/components/ui/button'

interface DeleteConfirmModalProps {
  sku: string
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteConfirmModal({ sku, onClose, onConfirm }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-card rounded-xl p-7 w-full max-w-[360px] shadow-2xl border border-border"
        style={{ background: 'var(--erp-surface)', borderColor: 'var(--erp-border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-base font-bold text-foreground mb-2" style={{ color: 'var(--erp-ink)' }}>ยืนยันการลบ?</div>
        <div className="text-xs text-muted-foreground mb-5" style={{ color: 'var(--erp-ink3)' }}>
          ลบ SKU <strong className="text-destructive font-bold">{sku}</strong> ออกจากระบบ?<br />
          การลบจะไม่ส่งผลย้อนหลังกับ Order ที่มีอยู่แล้ว
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="outline" size="sm" className="cursor-pointer border-border" style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)', color: '#374151' }}>ยกเลิก</Button>
          <Button onClick={onConfirm} variant="destructive" size="sm" className="cursor-pointer">ลบ</Button>
        </div>
      </div>
    </div>
  )
}
