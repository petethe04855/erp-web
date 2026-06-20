import assert from 'node:assert/strict'
import test from 'node:test'
import type { TiktokOrder, ManualOrder } from './erpTypes.ts'
import { createErpWorkflowStore, initialWorkflowState } from './erpWorkflow.ts'

function freshStore() {
  return createErpWorkflowStore(structuredClone(initialWorkflowState))
}

// ── 1. Create quotation = Draft ─────────────────────────────────
test('create quotation defaults to Draft', () => {
  const store = freshStore()
  const before = store.getState().quotations.length

  const quotation = store.getState().createQuotation({
    customer: 'Phase 1 Customer',
    validUntil: '2026-06-01',
    leadSource: 'Live',
    lines: [{ sku: 'CAT-CHK-30', qty: 2 }],
  })

  assert.equal(quotation.customer, 'Phase 1 Customer')
  assert.equal(quotation.status, 'Draft')
  assert.equal(store.getState().quotations.length, before + 1)
  assert.equal(store.getState().quotations[0].id, quotation.id)
})

// ── 2. Convert QT→SO succeeds when status is Approved ──────────
test('convert quotation to SO succeeds when Approved', () => {
  const store = freshStore()

  // QT-2026-0044 is Approved with no soRef
  const salesOrder = store.getState().convertQuotationToSalesOrder('QT-2026-0044')
  const quotation = store.getState().quotations.find(item => item.id === 'QT-2026-0044')

  assert.ok(salesOrder)
  assert.equal(salesOrder?.qtRef, 'QT-2026-0044')
  assert.equal(quotation?.soRef, salesOrder?.id)
  assert.equal(quotation?.status, 'Converted')
  assert.equal(quotation?.reservedStock, true)
})

// ── 3. Convert QT→SO duplicate is prevented ─────────────────────
test('prevent duplicate SO from same quotation', () => {
  const store = freshStore()

  const first = store.getState().convertQuotationToSalesOrder('QT-2026-0044')
  const countAfterFirst = store.getState().salesOrders.length
  const second = store.getState().convertQuotationToSalesOrder('QT-2026-0044')

  assert.ok(first)
  assert.equal(second, null, 'second convert should return null (duplicate)')
  assert.equal(store.getState().salesOrders.length, countAfterFirst, 'should not add another SO')
})

// ── 4. Create invoice from Completed SO ─────────────────────────
test('create invoice from completed SO', () => {
  const store = freshStore()

  // Convert QT to SO first, then complete it
  const salesOrder = store.getState().convertQuotationToSalesOrder('QT-2026-0044')
  assert.ok(salesOrder)

  // Update SO to Completed (convert creates as Pending now)
  store.getState().updateSalesOrderStatus(salesOrder.id, 'Completed')

  const invoice = store.getState().createInvoiceFromSO(salesOrder.id)
  const duplicate = store.getState().createInvoiceFromSO(salesOrder.id)

  assert.ok(invoice)
  assert.equal(invoice?.soRef, salesOrder.id)
  assert.equal(invoice?.customer, salesOrder.customer)
  assert.equal(duplicate?.id, invoice?.id, 'duplicate returns existing invoice')
  assert.equal(store.getState().invoices.filter(item => item.soRef === salesOrder.id).length, 1)
})

// ── 5. Create invoice from non-Completed SO fails ───────────────
test('create invoice from non-completed SO returns null', () => {
  const store = freshStore()

  // SO-2026-0411 is Pending
  const invoice = store.getState().createInvoiceFromSO('SO-2026-0411')
  assert.equal(invoice, null, 'should not create invoice from Pending SO')

  // SO-2026-0408 is Cancelled
  const invoice2 = store.getState().createInvoiceFromSO('SO-2026-0408')
  assert.equal(invoice2, null, 'should not create invoice from Cancelled SO')
})

// ── 6. PR Approved → create PO ──────────────────────────────────
test('PR Approved can be converted to PO', () => {
  const store = freshStore()

  // Create a PR
  const pr = store.getState().createPurchaseRequest({
    requester: 'ทดสอบ',
    reason: 'ขาดวัตถุดิบ',
    neededDate: '2026-06-01',
    items: [{ sku: 'CAT-CHK-30', name: 'ไก่อกฟรีซดราย 30g', qty: 50, note: '' }],
  })
  assert.equal(pr.status, 'Draft')

  // Approve it
  store.getState().updatePRStatus(pr.id, 'Pending Approval')
  store.getState().updatePRStatus(pr.id, 'Approved')

  // Convert to PO
  const po = store.getState().convertPRtoPO(pr.id, 'ซัพพลายเออร์ A', '2026-06-15', { 'CAT-CHK-30': 38 })
  assert.ok(po)
  assert.equal(po?.prRef, pr.id)
  assert.equal(po?.supplier, 'ซัพพลายเออร์ A')
  assert.equal(po?.items.length, 1)
  assert.equal(po?.items[0].qty, 50)
  assert.equal(po?.items[0].unitCost, 38)
  assert.equal(po?.totalCost, 50 * 38)

  // PR should have poRef
  const updatedPR = store.getState().purchaseRequests.find(p => p.id === pr.id)
  assert.equal(updatedPR?.poRef, po?.id)
})

// ── 7. GR adds stock and creates movement ───────────────────────
test('goods receive adds stock and creates movement', () => {
  const store = freshStore()

  // Create PO directly
  const po = store.getState().createPurchaseOrder({
    supplier: 'Test Supplier',
    etaDate: '2026-06-10',
    items: [
      { sku: 'CAT-CHK-30', name: 'ไก่อกฟรีซดราย 30g', qty: 100, unitCost: 38 },
      { sku: 'CAT-SAL-100', name: 'แซลมอนฟรีซดราย 100g', qty: 50, unitCost: 82 },
    ],
  })

  // Send the PO
  store.getState().updatePOStatus(po.id, 'Sent')

  const stockBefore_CHK = store.getState().products.find(p => p.sku === 'CAT-CHK-30')!.stock
  const stockBefore_SAL = store.getState().products.find(p => p.sku === 'CAT-SAL-100')!.stock

  // Receive goods
  const gr = store.getState().createGoodsReceive({
    poRef: po.id,
    receiveDate: '2026-06-10',
    items: [
      { sku: 'CAT-CHK-30', qtyReceived: 60, lot: 'LOT-001', expiryDate: '' },
      { sku: 'CAT-SAL-100', qtyReceived: 50, lot: 'LOT-002', expiryDate: '' },
    ],
  })

  assert.ok(gr)

  // Check stock increased
  const stockAfter_CHK = store.getState().products.find(p => p.sku === 'CAT-CHK-30')!.stock
  const stockAfter_SAL = store.getState().products.find(p => p.sku === 'CAT-SAL-100')!.stock
  assert.equal(stockAfter_CHK, stockBefore_CHK + 60)
  assert.equal(stockAfter_SAL, stockBefore_SAL + 50)

  // Check stock movements created
  const movements = store.getState().stockMovements.filter(m => m.refDoc === gr!.id)
  assert.equal(movements.length, 2)
  assert.ok(movements.every(m => m.type === 'IN'))

  // Check PO status updated (partially received since CHK got 60/100)
  const updatedPO = store.getState().purchaseOrders.find(p => p.id === po.id)
  assert.equal(updatedPO?.status, 'Partial Received')
  assert.equal(updatedPO?.items[0].receivedQty, 60)
  assert.equal(updatedPO?.items[1].receivedQty, 50) // fully received

  // Receive the rest
  const gr2 = store.getState().createGoodsReceive({
    poRef: po.id,
    receiveDate: '2026-06-12',
    items: [{ sku: 'CAT-CHK-30', qtyReceived: 40, lot: 'LOT-003', expiryDate: '' }],
  })
  assert.ok(gr2)

  const finalPO = store.getState().purchaseOrders.find(p => p.id === po.id)
  assert.equal(finalPO?.status, 'Completed')
})

// ── 8. GR cannot receive more than PO remaining ─────────────────
test('goods receive rejects over-receive', () => {
  const store = freshStore()

  const po = store.getState().createPurchaseOrder({
    supplier: 'Test',
    etaDate: '2026-06-10',
    items: [{ sku: 'CAT-CHK-30', name: 'ไก่อก', qty: 10, unitCost: 38 }],
  })
  store.getState().updatePOStatus(po.id, 'Sent')

  // Try to receive 15 when PO only has 10
  const gr = store.getState().createGoodsReceive({
    poRef: po.id,
    receiveDate: '2026-06-10',
    items: [{ sku: 'CAT-CHK-30', qtyReceived: 15, lot: '', expiryDate: '' }],
  })

  assert.equal(gr, null, 'should reject over-receive')
})

// ── 9. TiktokOrder and ManualOrder types exist ──────────────────
test('TiktokOrder and ManualOrder types exist in erpTypes', () => {
  const tt: TiktokOrder = {
    id: 'TT-001', date: '2026-05-24', product: 'ไก่อก 30g', sku: 'CAT-CHK-30',
    qty: 2, amount: 178, status: 'COMPLETED', stockDeducted: true, imported: false,
  }
  const mo: ManualOrder = {
    id: 'MO-001', customer: 'Test', phone: '08x', channel: 'LINE',
    date: '2026-05-24', amount: 200, status: 'Pending', items: 1, notes: '',
  }
  assert.equal(tt.imported, false)
  assert.equal(mo.status, 'Pending')
})

// ── TikTok Order store tests ───────────────────────────────────
test('addTiktokOrder creates order with imported=false', () => {
  const store = freshStore()
  const before = store.getState().tiktokOrders.length

  store.getState().addTiktokOrder({
    product: 'ไก่อก 30g', sku: 'CAT-CHK-30', qty: 2, amount: 178,
  })

  const orders = store.getState().tiktokOrders
  assert.equal(orders.length, before + 1)
  assert.equal(orders[0].imported, false)
  assert.equal(orders[0].sku, 'CAT-CHK-30')
})

test('markTiktokOrderImported sets imported=true', () => {
  const store = freshStore()
  const order = store.getState().tiktokOrders[0]

  store.getState().markTiktokOrderImported(order.id)

  const updated = store.getState().tiktokOrders.find(o => o.id === order.id)
  assert.equal(updated?.imported, true)
})

// ── Live Session store tests ───────────────────────────────────
test('addLiveSession appends to liveSessions', () => {
  const store = freshStore()
  const before = store.getState().liveSessions.length

  store.getState().addLiveSession({
    staff_id: 'STF-001',
    live_date: '2026-05-24',
    platform: 'TikTok',
    tiktok_account: '@chawy_official',
    start_datetime: '2026-05-24T20:00',
    end_datetime: '2026-05-24T23:00',
    break_minutes: 0,
    revenue_generated: 12000,
    has_clip: false,
    clip_link: '',
    live_summary_image: '',
    host_notes: 'Test session',
    rejection_reason: '',
  })

  assert.equal(store.getState().liveSessions.length, before + 1)
  assert.equal(store.getState().liveSessions[0].status, 'Pending')
})

test('updateLiveSessionStatus changes status', () => {
  const store = freshStore()
  const session = store.getState().liveSessions[0]

  store.getState().updateLiveSessionStatus(session.id, 'Manager_Approved')

  const updated = store.getState().liveSessions.find(s => s.id === session.id)
  assert.equal(updated?.status, 'Manager_Approved')
})

// ── Manual Order store tests ───────────────────────────────────
test('addManualOrder appends to manualOrders', () => {
  const store = freshStore()
  const before = store.getState().manualOrders.length

  store.getState().addManualOrder({
    customer: 'คุณทดสอบ', phone: '081-000-0000', channel: 'LINE', amount: 350,
  })

  const orders = store.getState().manualOrders
  assert.equal(orders.length, before + 1)
  assert.equal(orders[0].customer, 'คุณทดสอบ')
  assert.equal(orders[0].status, 'Pending')
})

// ── applyTiktokSettlement ────────────────────────────────────────────────────

test('applyTiktokSettlement updates netRevenue, platformFee, settled, settlementRef', () => {
  const store = freshStore()
  const orderId = store.getState().tiktokOrders[0].id

  const result = store.getState().applyTiktokSettlement({
    orderId,
    netRevenue: 950,
    platformFee: 50,
    settlementRef: '2026-05-01_2026-05-14',
  })

  assert.ok(result, 'should return the updated order')
  assert.equal(result!.netRevenue, 950)
  assert.equal(result!.platformFee, 50)
  assert.equal(result!.settled, true)
  assert.equal(result!.settlementRef, '2026-05-01_2026-05-14')

  const stored = store.getState().tiktokOrders.find(o => o.id === orderId)
  assert.equal(stored!.settled, true)
})

test('applyTiktokSettlement returns null for unknown orderId', () => {
  const store = freshStore()
  const result = store.getState().applyTiktokSettlement({
    orderId: 'TT-DOES-NOT-EXIST',
    netRevenue: 100,
    platformFee: 10,
    settlementRef: '2026-05',
  })
  assert.equal(result, null)
})

test('applyTiktokSettlement is idempotent — re-applying updates values', () => {
  const store = freshStore()
  const orderId = store.getState().tiktokOrders[0].id

  store.getState().applyTiktokSettlement({
    orderId,
    netRevenue: 900,
    platformFee: 100,
    settlementRef: '2026-05-01_2026-05-14',
  })

  const result = store.getState().applyTiktokSettlement({
    orderId,
    netRevenue: 920,
    platformFee: 80,
    settlementRef: '2026-05-01_2026-05-14',
  })

  assert.equal(result!.netRevenue, 920)
  assert.equal(result!.platformFee, 80)
})

// ── updateSettings ──────────────────────────────────────────────────────────

test('updateSettings: updates company name', () => {
  const store = freshStore()
  const before = store.getState().settings.company.name

  store.getState().updateSettings({
    company: { ...store.getState().settings.company, name: 'New Brand' },
  })

  assert.equal(store.getState().settings.company.name, 'New Brand')
  assert.notEqual(before, 'New Brand')
})

test('updateSettings: toggling a module does not affect other modules', () => {
  const store = freshStore()
  const beforeModules = store.getState().settings.modules

  store.getState().updateSettings({
    modules: { ...beforeModules, quotation: false },
  })

  const after = store.getState().settings.modules
  assert.equal(after.quotation, false)
  // all other modules untouched
  assert.equal(after.salesOrders, true)
  assert.equal(after.invoice, true)
  assert.equal(after.tiktokOrders, true)
})

test('updateSettings: partial patch (company only) does not lose notifications or modules', () => {
  const store = freshStore()
  const beforeNotifs = store.getState().settings.notifications
  const beforeModules = store.getState().settings.modules

  store.getState().updateSettings({
    company: { ...store.getState().settings.company, vatRate: 0 },
  })

  assert.deepEqual(store.getState().settings.notifications, beforeNotifs)
  assert.deepEqual(store.getState().settings.modules, beforeModules)
  assert.equal(store.getState().settings.company.vatRate, 0)
})

// ── LivePayrollSettings ──────────────────────────────────────────────────────
test('updateSettings: updates livePayroll rates', () => {
  const store = freshStore()

  store.getState().updateSettings({
    livePayroll: { hourlyRate: 150, clipBonus: 200 },
  })

  assert.equal(store.getState().settings.livePayroll.hourlyRate, 150)
  assert.equal(store.getState().settings.livePayroll.clipBonus, 200)
})

test('updateSettings: partial patch preserves livePayroll', () => {
  const store = freshStore()
  const before = structuredClone(store.getState().settings.livePayroll)

  store.getState().updateSettings({
    company: { ...store.getState().settings.company, name: 'Changed' },
  })

  assert.deepEqual(store.getState().settings.livePayroll, before)
})
