'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import type { SalesOrderStatus } from '@/lib/store/erpWorkflow'

const LIVE_CANCELLABLE = ['Pending', 'Processing', 'รอชำระจากไลฟ์', 'ยืนยัน Cart แล้ว', 'แพ็กแล้ว/รอส่ง'] as const

interface SOActionsProps {
  status: SalesOrderStatus
  hasInv: boolean
  onStatus: (s: SalesOrderStatus) => void
  onInvoice: () => void
}

export default function SOActions({
  status,
  hasInv,
  onStatus,
  onInvoice,
}: SOActionsProps) {
  const [confirming, setConfirming] = useState(false)
  const canCancel = (LIVE_CANCELLABLE as readonly string[]).includes(status)

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 justify-end">
        <Button variant="destructive" size="xs" onClick={() => { onStatus('Cancelled'); setConfirming(false) }} className="cursor-pointer">Confirm</Button>
        <Button variant="ghost" size="xs" onClick={() => setConfirming(false)} className="cursor-pointer text-muted-foreground hover:text-foreground">Close</Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {status === 'Pending' && <Button onClick={() => onStatus('Processing')} size="xs" className="cursor-pointer bg-[var(--erp-info)] hover:opacity-90 border-none text-white shadow-none">Start</Button>}
      {status === 'Processing' && <Button onClick={() => onStatus('Completed')} size="xs" className="cursor-pointer bg-[var(--erp-pos)] hover:opacity-90 border-none text-white shadow-none">Complete</Button>}
      {status === 'Completed' && !hasInv && <Button onClick={onInvoice} size="xs" className="cursor-pointer bg-[var(--erp-accent)] hover:opacity-90 border-none text-white shadow-none">Invoice</Button>}
      {status === 'Completed' && hasInv && <span className="text-xs font-semibold text-emerald-600" style={{ color: 'var(--erp-pos)' }}>Invoiced</span>}
      {canCancel && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="w-[26px] h-[26px] p-0 flex items-center justify-center cursor-pointer border border-border rounded-md hover:bg-muted/50"
            style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)', color: 'var(--erp-ink3)' }}
          >
            ...
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => setConfirming(true)} className="text-destructive font-semibold hover:bg-destructive/10 dark:hover:bg-destructive/20 cursor-pointer">
              Cancel order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
