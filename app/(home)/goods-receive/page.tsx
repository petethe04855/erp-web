'use client'
import { useMemo, useState } from 'react'
import { formatBaht } from '@/lib/mockData'
import { useErpStore } from '@/lib/store/useErpStore'
import { useTheme } from '@/lib/design/ThemeContext'
import { Card, Mono, StatStrip, TopBar } from '@/components/ui'
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'

type ReceiveLine = { sku: string; name: string; qtyOrdered: number; qtyRemaining: number; qtyReceived: number; lot: string; expiryDate: string }

export default function GoodsReceivePage() {
  const { tokens: t } = useTheme()
  const c = t.color
  const grList = useErpStore(s => s.goodsReceives)
  const poList = useErpStore(s => s.purchaseOrders)
  const createGR = useErpStore(s => s.createGoodsReceive)

  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [selectedPO, setSelectedPO] = useState('')
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split('T')[0])
  const [lines, setLines] = useState<ReceiveLine[]>([])

  const eligiblePOs = poList.filter(po => po.status === 'Sent' || po.status === 'Partial Received')
  const rows = useMemo(() => grList.map(gr => {
    const po = poList.find(p => p.id === gr.poRef)
    const value = gr.items.reduce((sum, item) => {
      const poItem = po?.items.find(i => i.sku === item.sku)
      return sum + item.qtyReceived * (poItem?.unitCost ?? 0)
    }, 0)
    const qty = gr.items.reduce((sum, item) => sum + item.qtyReceived, 0)
    return {
      ...gr,
      supplier: po?.supplier ?? 'Unknown supplier',
      value,
      qty,
      status: po?.status === 'Partial Received' ? 'pending' : 'completed',
    }
  }), [grList, poList])
  const total = rows.reduce((s, g) => s + g.value, 0)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function resetPanel() {
    setSelectedPO('')
    setLines([])
    setReceiveDate(new Date().toISOString().split('T')[0])
    setOpen(true)
  }

  function onSelectPO(poId: string) {
    setSelectedPO(poId)
    const po = poList.find(p => p.id === poId)
    setLines(po ? po.items.map(item => ({
      sku: item.sku,
      name: item.name,
      qtyOrdered: item.qty,
      qtyRemaining: item.qty - item.receivedQty,
      qtyReceived: item.qty - item.receivedQty,
      lot: '',
      expiryDate: '',
    })).filter(line => line.qtyRemaining > 0) : [])
  }

  function updateReceiveLine(i: number, field: 'qtyReceived' | 'lot' | 'expiryDate', val: string | number) {
    setLines(ls => ls.map((line, idx) => {
      if (idx !== i) return line
      if (field === 'qtyReceived') {
        const v = Math.max(0, Math.min(line.qtyRemaining, Number(val) || 0))
        return { ...line, qtyReceived: v }
      }
      return { ...line, [field]: String(val) }
    }))
  }

  function handleSubmit() {
    const validItems = lines.filter(l => l.qtyReceived > 0)
    if (!selectedPO || !receiveDate || validItems.length === 0) {
      showToast('กรุณาเลือก PO วันที่รับ และระบุจำนวนอย่างน้อย 1 รายการ')
      return
    }
    const gr = createGR({
      poRef: selectedPO,
      receiveDate,
      items: validItems.map(l => ({ sku: l.sku, qtyReceived: l.qtyReceived, lot: l.lot, expiryDate: l.expiryDate })),
    })
    if (!gr) {
      showToast('ไม่สามารถรับสินค้าได้')
      return
    }
    setOpen(false)
    setSelectedPO('')
    setLines([])
    showToast(`สร้าง ${gr.id} แล้ว · อัปเดต LOT/stock`)
  }

  return (
    <div style={{ minHeight: '100vh', background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={['Chawy', 'Inventory', 'Goods Receive']}
        title="Goods Receive"
        subtitle={`รับสินค้าเข้า · ${rows.length} รายการ · ${formatBaht(total)} มูลค่ารวม`}
        right={
          <>
            {toast && <span style={{ fontSize: 12, fontWeight: 600, color: toast.includes('ไม่') || toast.includes('กรุณา') ? c.neg : c.pos }}>{toast}</span>}
            <Button onClick={resetPanel}>+ Receive Goods</Button>
          </>
        }
      />

      <div style={{ padding: '24px 32px 48px' }}>
        <StatStrip
          t={t}
          tiles={[
            { label: 'Received · MTD', value: formatBaht(total), sub: `${rows.length} receipts` },
            { label: 'Pending QC', value: String(rows.filter(g => g.status === 'pending').length), sub: 'partial receipts', tone: c.warn },
            { label: 'Suppliers', value: String(new Set(rows.map(g => g.supplier)).size), sub: 'this month' },
            { label: 'On-time rate', value: '92%', sub: 'vs ETA' },
          ]}
        />

        <Card t={t} pad={false} style={{ overflow: 'auto' }}>
          <Table className="min-w-[960px]">
            <TableHeader>
              <TableRow>
                {['GR', 'PO Ref', 'Supplier', 'Date'].map(h => (
                  <TableHead key={h} className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {h}
                  </TableHead>
                ))}
                <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Items</TableHead>
                <TableHead className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Quantity</TableHead>
                <TableHead className="text-right py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Value</TableHead>
                <TableHead className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((g) => {
                return (
                  <TableRow key={g.id}>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={12} weight={500}>{g.id}</Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={12} color={c.accent}>{g.poRef}</Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{g.supplier}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={12} color={c.ink2}>{g.receiveDate}</Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <Mono t={t} size={12} color={c.ink2}>{g.items.length}</Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={12} color={c.ink2}>{g.qty}</Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <Mono t={t} size={13} weight={600}>{formatBaht(g.value)}</Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      {g.status === 'pending' ? (
                        <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">
                          Pending
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
                          Completed
                        </Badge>
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
        <SheetContent side="right" className="sm:max-w-[760px] flex flex-col h-full p-0 bg-background">
          <SheetHeader className="p-6 border-b border-border flex-shrink-0">
            <SheetTitle className="text-base font-bold text-foreground">Receive Goods</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1">เลือก PO และระบุ lot / expiry สำหรับ LOT tracking</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Purchase Order</label>
              <select
                value={selectedPO}
                onChange={e => onSelectPO(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select PO</option>
                {eligiblePOs.map(po => <option key={po.id} value={po.id}>{po.id} — {po.supplier} ({formatBaht(po.totalCost)})</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Receive date</label>
              <Input type="date" value={receiveDate} onChange={e => setReceiveDate(e.target.value)} />
            </div>

            {lines.length > 0 && (
              <Card t={t} pad={false} style={{ overflow: 'auto', marginTop: 16 }}>
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      {['Item', 'Remain', 'Receive', 'Lot', 'Expiry'].map(h => (
                        <TableHead key={h} className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line, i) => {
                      return (
                        <TableRow key={line.sku}>
                          <TableCell className="py-3.5 px-6">
                            <span style={{ fontSize: 12, fontWeight: 600, color: c.ink }}>{line.name}</span>
                            <div><Mono t={t} size={10} color={c.ink3}>{line.sku}</Mono></div>
                          </TableCell>
                          <TableCell className="py-3.5 px-6">
                            <Mono t={t} size={12} color={c.warn}>{line.qtyRemaining}</Mono>
                          </TableCell>
                          <TableCell className="py-3.5 px-6">
                            <input
                              type="number"
                              min={0}
                              max={line.qtyRemaining}
                              value={line.qtyReceived}
                              onChange={e => updateReceiveLine(i, 'qtyReceived', e.target.value)}
                              style={{ width: 74, border: `1px solid ${c.border}`, borderRadius: 6, padding: '6px 8px', fontFamily: t.font.mono }}
                            />
                          </TableCell>
                          <TableCell className="py-3.5 px-6">
                            <input
                              value={line.lot}
                              onChange={e => updateReceiveLine(i, 'lot', e.target.value)}
                              placeholder="LOT"
                              style={{ width: 120, border: `1px solid ${c.border}`, borderRadius: 6, padding: '6px 8px' }}
                            />
                          </TableCell>
                          <TableCell className="py-3.5 px-6">
                            <input
                              type="date"
                              value={line.expiryDate}
                              onChange={e => updateReceiveLine(i, 'expiryDate', e.target.value)}
                              style={{ width: 136, border: `1px solid ${c.border}`, borderRadius: 6, padding: '6px 8px' }}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
          <SheetFooter className="border-t border-border p-6 flex-shrink-0">
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} className="bg-[#0F6E58] text-white hover:bg-[#0F6E58]/90">Save Receipt</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
