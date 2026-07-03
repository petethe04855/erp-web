'use client'
import { useMemo, useState } from 'react'
import { formatBaht } from '@/lib/mockData'
import SlidePanel from '@/components/SlidePanel'
import { useErpStore } from '@/lib/store/useErpStore'
import { useTheme } from '@/lib/design/ThemeContext'
import { Btn, Field, Mono, PremiumTable, PremiumTd, PremiumTh, SelectField, StatStrip, StatusPill, TopBar } from '@/components/ui'
import type { LandedCostLine } from '@/lib/store/erpWorkflow'

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
  
  // Landed Cost inputs
  const [landedCosts, setLandedCosts] = useState<LandedCostLine[]>([])
  
  // Detail Panel
  const [selectedGR, setSelectedGR] = useState<any | null>(null)

  const eligiblePOs = poList.filter(po => po.status === 'Sent' || po.status === 'Partial Received')
  const rows = useMemo(() => grList.map(gr => {
    const po = poList.find(p => p.id === gr.poRef)
    const value = gr.items.reduce((sum, item) => {
      const poItem = po?.items.find(i => i.sku === item.sku)
      return sum + item.qtyReceived * (poItem?.unitCost ?? 0)
    }, 0)
    
    const landedValue = gr.items.reduce((sum, item) => {
      const unitCost = item.landedUnitCost || po?.items.find(i => i.sku === item.sku)?.unitCost || 0
      return sum + item.qtyReceived * unitCost
    }, 0)

    const qty = gr.items.reduce((sum, item) => sum + item.qtyReceived, 0)
    return {
      ...gr,
      supplier: po?.supplier ?? 'Unknown supplier',
      value,
      landedValue,
      qty,
      status: po?.status === 'Partial Received' ? 'pending' : 'completed',
    }
  }), [grList, poList])
  
  const total = rows.reduce((s, g) => s + g.value, 0)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function resetPanel() {
    setSelectedPO('')
    setLines([])
    setLandedCosts([])
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

  // Landed Cost Handlers
  function addLandedCostLine() {
    setLandedCosts(prev => [...prev, { type: 'freight', amount: 0, allocatable: true, note: '' }])
  }

  function removeLandedCostLine(idx: number) {
    setLandedCosts(prev => prev.filter((_, i) => i !== idx))
  }

  function updateLandedCostLine<K extends keyof LandedCostLine>(idx: number, field: K, val: LandedCostLine[K]) {
    setLandedCosts(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item))
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
      landedCosts: landedCosts.filter(lc => lc.amount > 0),
    })
    if (!gr) {
      showToast('ไม่สามารถรับสินค้าได้')
      return
    }
    setOpen(false)
    setSelectedPO('')
    setLines([])
    setLandedCosts([])
    showToast(`สร้าง ${gr.id} แล้ว · อัปเดต LOT/stock และคำนวณ Landed Cost`)
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
              <PremiumTh t={t} right>Base Value</PremiumTh>
              <PremiumTh t={t} right>Landed Value</PremiumTh>
              <PremiumTh t={t}>Status</PremiumTh>
            </tr>
          </thead>
          <tbody>
            {rows.map((g, i) => {
              const last = i === rows.length - 1
              return (
                <tr key={g.id} onClick={() => setSelectedGR(g)} style={{ cursor: 'pointer' }}>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} weight={500}>{g.id}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} color={c.accent}>{g.poRef}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><span style={{ fontSize: 13, fontWeight: 500, color: c.ink }}>{g.supplier}</span></PremiumTd>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} color={c.ink2}>{g.receiveDate}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={12} color={c.ink2}>{g.items.length}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><Mono t={t} size={12} color={c.ink2}>{g.qty}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={13} color={c.ink3}>{formatBaht(g.value)}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last} right><Mono t={t} size={13} weight={600} color={g.landedValue > g.value ? c.accent : c.ink}>{formatBaht(g.landedValue)}</Mono></PremiumTd>
                  <PremiumTd t={t} last={last}><StatusPill t={t} status={g.status} /></PremiumTd>
                </tr>
              )
            })}
          </tbody>
        </PremiumTable>
      </div>

      {/* ── SlidePanel: Create Goods Receive ── */}
      <SlidePanel open={open} onClose={() => setOpen(false)} title="Receive Goods" subtitle="เลือก PO, ระบุข้อมูลนำเข้าแฝง (Landed Costs) และระบุ lot / expiry"
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

          {/* Landed Costs section */}
          <div style={{ border: `1px dashed ${c.border}`, borderRadius: 8, padding: 16, display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: c.ink }}>ค่าใช้จ่ายแฝงนำเข้า (Landed Cost)</span>
              <Btn t={t} variant="ghost" onClick={addLandedCostLine}>+ เพิ่มค่าใช้จ่าย</Btn>
            </div>
            
            {landedCosts.length > 0 && (
              <div style={{ display: 'grid', gap: 8 }}>
                {landedCosts.map((lc, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                      value={lc.type}
                      onChange={e => updateLandedCostLine(idx, 'type', e.target.value as any)}
                      style={{ border: `1px solid ${c.border}`, borderRadius: 6, padding: '4px 6px', background: c.canvas, fontSize: 12 }}
                    >
                      <option value="freight">ค่าขนส่ง (Freight)</option>
                      <option value="duty">ภาษี (Duty)</option>
                      <option value="shipping">ชิปปิง (Shipping)</option>
                      <option value="other">อื่นๆ (Other)</option>
                    </select>
                    
                    <input
                      type="number"
                      placeholder="จำนวน (บาท)"
                      value={lc.amount || ''}
                      onChange={e => updateLandedCostLine(idx, 'amount', Number(e.target.value) || 0)}
                      style={{ border: `1px solid ${c.border}`, borderRadius: 6, padding: '4px 6px', width: 100, fontFamily: t.font.mono, fontSize: 12 }}
                    />
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer', color: c.ink2 }}>
                      <input
                        type="checkbox"
                        checked={lc.allocatable}
                        onChange={e => updateLandedCostLine(idx, 'allocatable', e.target.checked)}
                      />
                      ปันทุน
                    </label>

                    <input
                      type="text"
                      placeholder="บันทึก..."
                      value={lc.note}
                      onChange={e => updateLandedCostLine(idx, 'note', e.target.value)}
                      style={{ border: `1px solid ${c.border}`, borderRadius: 6, padding: '4px 6px', flex: 1, fontSize: 12 }}
                    />
                    
                    <Btn t={t} variant="ghost" onClick={() => removeLandedCostLine(idx)} style={{ color: c.neg }}>✕</Btn>
                  </div>
                ))}
              </div>
            )}
          </div>

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

      {/* ── SlidePanel: View Goods Receive Details ── */}
      <SlidePanel open={!!selectedGR} onClose={() => setSelectedGR(null)} title={`Receipt ${selectedGR?.id}`} subtitle={`รับเข้าจาก PO: ${selectedGR?.poRef} เมื่อ ${selectedGR?.receiveDate}`}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Btn t={t} variant="ghost" onClick={() => setSelectedGR(null)}>Close</Btn>
          </div>
        }
      >
        {selectedGR && (
          <div style={{ display: 'grid', gap: 20 }}>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: c.ink }}>รายการสินค้าที่รับเข้า (Received Items)</h4>
              <PremiumTable t={t} minWidth={600}>
                <thead>
                  <tr>
                    {['SKU / Name', 'Lot / Expiry', 'Qty Received', 'Landed Cost / Unit'].map(h => <PremiumTh key={h} t={t}>{h}</PremiumTh>)}
                  </tr>
                </thead>
                <tbody>
                  {selectedGR.items.map((item: any, idx: number) => {
                    const last = idx === selectedGR.items.length - 1
                    return (
                      <tr key={idx}>
                        <PremiumTd t={t} last={last}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: c.ink }}>{item.sku}</span>
                          <div style={{ fontSize: 11, color: c.ink3 }}>{poList.find(p => p.id === selectedGR.poRef)?.items.find(i => i.sku === item.sku)?.name || 'Unknown item'}</div>
                        </PremiumTd>
                        <PremiumTd t={t} last={last}>
                          <Mono t={t} size={11} color={c.ink2}>Lot: {item.lot || '-'}</Mono>
                          <div style={{ fontSize: 10, color: c.ink3 }}>Exp: {item.expiryDate || '-'}</div>
                        </PremiumTd>
                        <PremiumTd t={t} last={last}><Mono t={t} size={12}>{item.qtyReceived}</Mono></PremiumTd>
                        <PremiumTd t={t} last={last}>
                          <Mono t={t} size={12} weight={600} color={c.accent}>
                            {formatBaht(item.landedUnitCost || poList.find(p => p.id === selectedGR.poRef)?.items.find(i => i.sku === item.sku)?.unitCost || 0)}
                          </Mono>
                        </PremiumTd>
                      </tr>
                    )
                  })}
                </tbody>
              </PremiumTable>
            </div>

            {selectedGR.landedCosts && selectedGR.landedCosts.length > 0 && (
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: c.ink }}>ค่าใช้จ่ายแฝง (Landed Costs)</h4>
                <PremiumTable t={t} minWidth={600}>
                  <thead>
                    <tr>
                      {['Type', 'Amount', 'Allocatable', 'Note'].map(h => <PremiumTh key={h} t={t}>{h}</PremiumTh>)}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGR.landedCosts.map((lc: any, idx: number) => {
                      const last = idx === selectedGR.landedCosts.length - 1
                      return (
                        <tr key={idx}>
                          <PremiumTd t={t} last={last}><span style={{ fontSize: 12, textTransform: 'capitalize', fontWeight: 600 }}>{lc.type}</span></PremiumTd>
                          <PremiumTd t={t} last={last}><Mono t={t} size={12}>{formatBaht(lc.amount)}</Mono></PremiumTd>
                          <PremiumTd t={t} last={last}><span style={{ fontSize: 12, color: lc.allocatable ? c.pos : c.ink3 }}>{lc.allocatable ? 'Yes (ปันส่วน)' : 'No'}</span></PremiumTd>
                          <PremiumTd t={t} last={last}><span style={{ fontSize: 12, color: c.ink2 }}>{lc.note || '-'}</span></PremiumTd>
                        </tr>
                      )
                    })}
                  </tbody>
                </PremiumTable>
              </div>
            )}
          </div>
        )}
      </SlidePanel>
    </div>
  )
}
