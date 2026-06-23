'use client'
import { useMemo, useState } from 'react'
import { useErpStore } from '@/lib/store/useErpStore'
import { exportXlsx } from '@/lib/utils/exportUtil'
import type { ReturnReason, ReturnCondition } from '@/lib/store/erpWorkflow'
import { useTheme } from '@/lib/design/ThemeContext'
import { Card, Mono, StatStrip, TopBar, fmtBaht } from '@/components/ui'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'

const REASONS: ReturnReason[] = ['สินค้าชำรุด', 'ผิดสินค้า', 'ลูกค้าเปลี่ยนใจ', 'ผิดขนาด/รุ่น', 'อื่นๆ']
const BLANK = { soRef: '', sku: '', qty: 1, condition: 'ดี' as ReturnCondition, reason: 'สินค้าชำรุด' as ReturnReason, note: '', channel: 'Manual' }

export default function ReturnsPage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const salesOrders = useErpStore(s => s.salesOrders)
  const stockReturns = useErpStore(s => s.stockReturns)
  const products = useErpStore(s => s.products)
  const createStockReturn = useErpStore(s => s.createStockReturn)
  const updateStockReturnStatus = useErpStore(s => s.updateStockReturnStatus)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const completedSOs = salesOrders.filter(o => o.status === 'Completed')
  const rows = useMemo(() => stockReturns.map(ret => {
    const product = products.find(p => p.sku === ret.sku)
    const so = salesOrders.find(o => o.id === ret.soRef)
    const amount = (product?.price ?? 0) * ret.qty
    const status = ret.status ? ret.status.toLowerCase() : (ret.refunded ? 'completed' : 'pending')
    return { ...ret, customer: so?.customer ?? 'Walk-in / Manual', amount, status }
  }), [stockReturns, products, salesOrders])
  const total = rows.reduce((s, r) => s + r.amount, 0)
  const openCount = rows.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length
  const topReason = REASONS.map(reason => ({
    reason,
    count: stockReturns.filter(r => r.reason === reason).length,
  })).sort((a, b) => b.count - a.count)[0]

  function handleSubmit() {
    if (!form.sku || form.qty < 1) return
    const result = createStockReturn({ soRef: form.soRef, sku: form.sku, qty: form.qty, condition: form.condition, reason: form.reason, note: form.note, channel: form.channel })
    setForm(BLANK)
    setOpen(false)
    showToast(`รับคืน ${result.id} แล้ว · สถานะ: รอดำเนินการ`)
  }

  function handleUpdateStatus(id: string, newStatus: 'Completed' | 'Cancelled') {
    updateStockReturnStatus(id, newStatus)
    showToast(`อัปเดต ${id} เป็น ${newStatus === 'Completed' ? 'ของกลับมาแล้ว' : 'ยกเลิก'} สำเร็จ`)
  }

  async function handleExport() {
    try {
      await exportXlsx('returns', `returns-export-${new Date().toISOString().slice(0, 10)}.xlsx`)
      showToast('Export สำเร็จ')
    } catch (err: any) {
      showToast('Export ล้มเหลว: ' + err.message)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar
         t={t}
         breadcrumb={['Chawy', 'Sales', 'Returns']}
         title="Returns"
         subtitle={`คืนสินค้า · ${rows.length} รายการ · ${fmtBaht(total)} มูลค่ารวม`}
         right={
           <>
             {toast && <span style={{ fontSize: 12, fontWeight: 600, color: c.pos }}>{toast}</span>}
             <Button variant="outline" onClick={handleExport}>Export</Button>
             <Button onClick={() => setOpen(true)}>+ New Return</Button>
           </>
         }
      />

      <div style={{ padding: '24px 32px 48px' }}>
        <StatStrip
          t={t}
          tiles={[
            { label: 'Total value', value: fmtBaht(total), sub: 'this month' },
            { label: 'Open RMAs', value: String(openCount), sub: 'awaiting action', tone: openCount ? c.warn : c.ink },
            { label: 'Return rate', value: `${((rows.length / Math.max(1, salesOrders.length)) * 100).toFixed(1)}%`, sub: 'of orders' },
            { label: 'Top reason', value: topReason?.reason ?? '—', sub: `${topReason?.count ?? 0} returns` },
          ]}
        />

        <Card t={t} pad={false} style={{ overflow: 'auto' }}>
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                {['RMA', 'SO Ref', 'Customer', 'Channel', 'Date', 'Reason'].map(h => (
                  <TableHead key={h} className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {h}
                  </TableHead>
                ))}
                <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Qty</TableHead>
                <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Amount</TableHead>
                <TableHead className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                <TableHead className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                return (
                  <TableRow key={r.id}>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={12} weight={500}>{r.id}</Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={12} color={r.soRef ? c.accent : c.ink3}>{r.soRef || '—'}</Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{r.customer}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span style={{ fontSize: 13, fontWeight: 500, color: c.ink2 }}>{r.channel}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={12} color={c.ink2}>{r.date}</Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span style={{ fontSize: 13, color: c.ink }}>{r.reason}</span>
                      <span style={{ fontSize: 11, color: c.ink3, marginLeft: 6 }}>{r.condition}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <Mono t={t} size={12} color={c.ink2}>{r.qty}</Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <Mono t={t} size={13} weight={600}>{fmtBaht(r.amount)}</Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      {r.status === 'completed' && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
                          Completed
                        </Badge>
                      )}
                      {r.status === 'cancelled' && (
                        <Badge variant="destructive">
                          Cancelled
                        </Badge>
                      )}
                      {r.status === 'pending' && (
                        <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      {r.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Button onClick={() => handleUpdateStatus(r.id, 'Completed')} className="h-6 px-2 text-[10px] bg-[#0F6E58] text-white hover:bg-[#0F6E58]/90">ของกลับมาแล้ว</Button>
                          <Button variant="outline" onClick={() => handleUpdateStatus(r.id, 'Cancelled')} className="h-6 px-2 text-[10px]">ยกเลิก</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="sm:max-w-[520px] flex flex-col h-full p-0 bg-background">
          <SheetHeader className="p-6 border-b border-border flex-shrink-0">
            <SheetTitle className="text-base font-bold text-foreground">New Return</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1">บันทึกการรับสินค้ากลับจากลูกค้า</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sales Order</label>
              <select
                value={form.soRef}
                onChange={e => {
                  const soId = e.target.value
                  const so = salesOrders.find(o => o.id === soId)
                  setForm(f => ({ ...f, soRef: soId, channel: so ? so.channel : f.channel }))
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">No SO reference</option>
                {completedSOs.map(o => <option key={o.id} value={o.id}>{o.id} — {o.customer}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</label>
              <select
                value={form.sku}
                onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select product</option>
                {products.map(p => <option key={p.sku} value={p.sku}>{p.name}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quantity</label>
              <Input
                type="number"
                min={1}
                value={form.qty}
                onChange={e => setForm(f => ({ ...f, qty: Math.max(1, parseInt(e.target.value) || 1) }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Condition</label>
              <select
                value={form.condition}
                onChange={e => setForm(f => ({ ...f, condition: e.target.value as ReturnCondition }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="ดี">ดี · add back to stock</option>
                <option value="เสียหาย">เสียหาย · do not add stock</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Channel</label>
              <select
                value={form.channel}
                disabled={!!form.soRef}
                onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="Manual">Manual</option>
                <option value="LINE">LINE</option>
                <option value="Shopee">Shopee</option>
                <option value="TikTok">TikTok</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reason</label>
              <select
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value as ReturnReason }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Note</label>
              <Textarea
                value={form.note}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder="รายละเอียดอื่นๆ"
              />
            </div>
          </div>
          <SheetFooter className="border-t border-border p-6 flex-shrink-0">
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} className="bg-[#0F6E58] text-white hover:bg-[#0F6E58]/90" disabled={!form.sku}>Save Return</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
