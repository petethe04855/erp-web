'use client'
import { useMemo, useState } from 'react'
import { formatBaht } from '@/lib/mockData'
import SlidePanel from '@/components/SlidePanel'
import { useErpStore } from '@/lib/store/useErpStore'
import { useTheme } from '@/lib/design/ThemeContext'
import { Btn, Field, Mono, PremiumTable, PremiumTd, PremiumTh, SelectField, StatStrip, StatusPill, TopBar } from '@/components/ui'

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
            <Btn t={t} variant="primary" onClick={resetPanel}>+ Receive Goods</Btn>
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

        <PremiumTable t={t} minWidth={960}>
          <thead>
            <tr>
              {['GR', 'PO Ref', 'Supplier', 'Date'].map(h => <PremiumTh key={h} t={t}>{h}</PremiumTh>)}
              <PremiumTh t={t} right>Items</PremiumTh>
              <PremiumTh t={t}>Quantity</PremiumTh>
              <PremiumTh t={t} right>Value</PremiumTh>
              <PremiumTh t={t}>Status</PremiumTh>
            </tr>
          </thead>
          <tbody>
            {rows.map((g, i) => {
              const last = i === rows.length - 1
              return (
                <tr key={g.id}>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} weight={500}>{g.id}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} color={c.accent}>{g.poRef}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{g.supplier}</span></PremiumTd>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} color={c.ink2}>{g.receiveDate}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={12} color={c.ink2}>{g.items.length}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} color={c.ink2}>{g.qty}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={13} weight={600}>{formatBaht(g.value)}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><StatusPill t={t} status={g.status} /></PremiumTd>
                </tr>
              )
            })}
          </tbody>
        </PremiumTable>
      </div>

      <SlidePanel open={open} onClose={() => setOpen(false)} title="Receive Goods" subtitle="เลือก PO และระบุ lot / expiry สำหรับ LOT tracking"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn t={t} variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
            <Btn t={t} variant="accent" onClick={handleSubmit}>Save Receipt</Btn>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <SelectField t={t} label="Purchase Order" value={selectedPO} onChange={e => onSelectPO(e.target.value)}>
            <option value="">Select PO</option>
            {eligiblePOs.map(po => <option key={po.id} value={po.id}>{po.id} — {po.supplier} ({formatBaht(po.totalCost)})</option>)}
          </SelectField>
          <Field t={t} label="Receive date" type="date" value={receiveDate} onChange={e => setReceiveDate(e.target.value)} />

          {lines.length > 0 && (
            <PremiumTable t={t} minWidth={720}>
              <thead>
                <tr>
                  {['Item', 'Remain', 'Receive', 'Lot', 'Expiry'].map(h => <PremiumTh key={h} t={t}>{h}</PremiumTh>)}
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => {
                  const last = i === lines.length - 1
                  return (
                    <tr key={line.sku}>
                      <PremiumTd t={t} last={last}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: c.ink }}>{line.name}</span>
                        <div><Mono t={t} size={10} color={c.ink3}>{line.sku}</Mono></div>
                      </PremiumTd>
                      <PremiumTd t={t} last={last}><Mono t={t} size={12} color={c.warn}>{line.qtyRemaining}</Mono></PremiumTd>
                      <PremiumTd t={t} last={last}><input type="number" min={0} max={line.qtyRemaining} value={line.qtyReceived} onChange={e => updateReceiveLine(i, 'qtyReceived', e.target.value)} style={{ width: 74, border: `1px solid ${c.border}`, borderRadius: 6, padding: '6px 8px', fontFamily: t.font.mono }} /></PremiumTd>
                      <PremiumTd t={t} last={last}><input value={line.lot} onChange={e => updateReceiveLine(i, 'lot', e.target.value)} placeholder="LOT" style={{ width: 120, border: `1px solid ${c.border}`, borderRadius: 6, padding: '6px 8px' }} /></PremiumTd>
                      <PremiumTd t={t} last={last}><input type="date" value={line.expiryDate} onChange={e => updateReceiveLine(i, 'expiryDate', e.target.value)} style={{ width: 136, border: `1px solid ${c.border}`, borderRadius: 6, padding: '6px 8px' }} /></PremiumTd>
                    </tr>
                  )
                })}
              </tbody>
            </PremiumTable>
          )}
        </div>
      </SlidePanel>
    </div>
  )
}
