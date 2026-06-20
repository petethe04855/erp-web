export const C = {
  brand: '#0057D9',
  brandGreen: '#10B981',
  brandAmber: '#F59E0B',
  brandRed: '#EF4444',
  textPrimary: '#001F5C',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  textLabel: '#9CA3AF',
  cardBorder: '#E5E7EB',
}

export function formatBaht(n: number) {
  return '฿' + n.toLocaleString('th-TH', { minimumFractionDigits: 0 })
}

export function formatMonth(m: string) {
  const [y, mo] = m.split('-')
  const months = ['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return `${months[parseInt(mo)]} ${parseInt(y) - 543 + 543}`
}

// ── SKU Products ──────────────────────────────────────────────
export const skuProducts = [
  { sku: 'CAT-CHK-30',  name: 'ไก่อกฟรีซดราย 30g',    type: 'Cat'    as const, barcode: '8850001000011', weightGrams:  80, retailPrice:  89, wholesalePrice:  72, price:  89, cost: 38, stock: 1200, reorder: 100, isBundle: false, isActive: true, note: '' },
  { sku: 'CAT-SAL-100', name: 'แซลมอนฟรีซดราย 100g',  type: 'Cat'    as const, barcode: '8850001000028', weightGrams: 150, retailPrice: 189, wholesalePrice: 155, price: 189, cost: 82, stock:   45, reorder:  80, isBundle: false, isActive: true, note: 'สินค้าขายดี' },
  { sku: 'CAT-DUK-30',  name: 'เป็ดฟรีซดราย 30g',     type: 'Cat'    as const, barcode: '8850001000035', weightGrams:  80, retailPrice:  99, wholesalePrice:  80, price:  99, cost: 42, stock:  890, reorder: 100, isBundle: false, isActive: true, note: '' },
  { sku: 'DOG-CHK-100', name: 'ไก่อกสุนัข 100g',      type: 'Dog'    as const, barcode: '8850001000042', weightGrams: 160, retailPrice: 149, wholesalePrice: 120, price: 149, cost: 65, stock:   12, reorder:  50, isBundle: false, isActive: true, note: '' },
  { sku: 'CAT-MIX-200', name: 'มิกซ์ฟรีซดราย 200g',   type: 'Cat'    as const, barcode: '8850001000059', weightGrams: 260, retailPrice: 299, wholesalePrice: 245, price: 299, cost: 130, stock:   0, reorder:  60, isBundle: false, isActive: true, note: 'หมด — รอผลิตรอบใหม่' },
  { sku: 'DOG-DUK-50',  name: 'เป็ดสุนัข 50g',        type: 'Dog'    as const, barcode: '8850001000066', weightGrams: 110, retailPrice: 129, wholesalePrice: 105, price: 129, cost: 55, stock:  340, reorder:  60, isBundle: false, isActive: true, note: '' },
  { sku: 'BUNDLE-TRIO', name: 'เซ็ต 3 ชิ้น (ไก่×2 + เป็ด×1)', type: 'Bundle' as const, barcode: '', weightGrams: 310, retailPrice: 249, wholesalePrice: 200, price: 249, cost: 118, stock: 0, reorder: 0, isBundle: true, isActive: true, note: 'CAT-CHK-30×2 + CAT-DUK-30×1' },
]

// ── TikTok Orders ─────────────────────────────────────────────
export const tiktokOrders = [
  { id: 'TT240501001', date: '2026-05-01', product: 'ไก่อกฟรีซดราย 30g', sku: 'CAT-CHK-30',  qty: 3, amount: 267,  status: 'COMPLETED',         stockDeducted: true  },
  { id: 'TT240501002', date: '2026-05-01', product: 'แซลมอนฟรีซดราย 100g', sku: 'CAT-SAL-100', qty: 1, amount: 189, status: 'AWAITING_SHIPMENT', stockDeducted: false },
  { id: 'TT240430001', date: '2026-04-30', product: 'เป็ดฟรีซดราย 30g',    sku: 'CAT-DUK-30',  qty: 2, amount: 198, status: 'IN_TRANSIT',         stockDeducted: true  },
  { id: 'TT240430002', date: '2026-04-30', product: 'ไก่อกฟรีซดราย 30g',   sku: 'CAT-CHK-30',  qty: 5, amount: 445, status: 'COMPLETED',         stockDeducted: true  },
  { id: 'TT240429001', date: '2026-04-29', product: 'มิกซ์ฟรีซดราย 200g',  sku: 'CAT-MIX-200', qty: 1, amount: 299, status: 'CANCELLED',          stockDeducted: false },
  { id: 'TT240429002', date: '2026-04-29', product: 'ไก่อกสุนัข 100g',     sku: 'DOG-CHK-100', qty: 2, amount: 298, status: 'DELIVERED',          stockDeducted: true  },
  { id: 'TT240428001', date: '2026-04-28', product: 'แซลมอนฟรีซดราย 100g', sku: 'CAT-SAL-100', qty: 2, amount: 378, status: 'COMPLETED',         stockDeducted: true  },
]

// ── Monthly P&L ───────────────────────────────────────────────
export const monthlyPnL = [
  { month: '2025-11', revenue: 780000,  cogs: 312000, opex: 185000, net: 283000, netPct: 36.3, units: 1420 },
  { month: '2025-12', revenue: 920000,  cogs: 368000, opex: 185000, net: 367000, netPct: 39.9, units: 1680 },
  { month: '2026-01', revenue: 1050000, cogs: 420000, opex: 195000, net: 435000, netPct: 41.4, units: 1920 },
  { month: '2026-02', revenue: 1180000, cogs: 472000, opex: 195000, net: 513000, netPct: 43.5, units: 2160 },
  { month: '2026-03', revenue: 1380000, cogs: 552000, opex: 205000, net: 623000, netPct: 45.1, units: 2520 },
  { month: '2026-04', revenue: 1520000, cogs: 608000, opex: 205000, net: 707000, netPct: 46.5, units: 2780 },
]

// ── Dashboard summary ─────────────────────────────────────────
export const dashboardSummary = {
  todayRevenue: 48600,
  todayOrders: 18,
  monthlyRevenue: 1520000,
  monthlyProfit: 707000,
  lowStockCount: 3,
  outOfStockCount: 1,
}

// ── Quotations ────────────────────────────────────────────────
export type QuotationStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Converted' | 'Expired'
export type LeadSource = 'Live' | 'LINE' | 'Facebook' | 'Shopee' | 'Walk-in' | 'B2B Referral'
export type AuditEvent = { action: string; by: string; at: string; note: string }
export type QuotationLine = { sku: string; qty: number; reservedQty: number }
export type Quotation = {
  id: string
  customer: string
  date: string
  validUntil: string
  amount: number
  status: QuotationStatus
  items: number
  soRef: string | null
  leadSource: LeadSource
  lines: QuotationLine[]
  reservedStock: boolean
  createdBy: string
  updatedBy: string
  updatedAt: string
  auditTrail: AuditEvent[]
}

export const quotations: Quotation[] = [
  { id: 'QT-2026-0045', customer: 'บริษัท ABC Pet Supply',  date: '2026-05-01', validUntil: '2026-05-15', amount: 125400, status: 'Approved',   items: 4, soRef: 'SO-2026-0412', leadSource: 'B2B Referral', lines: [{ sku: 'CAT-CHK-30', qty: 20, reservedQty: 20 }, { sku: 'CAT-SAL-100', qty: 18, reservedQty: 18 }], reservedStock: true, createdBy: 'Admin User', updatedBy: 'Admin User', updatedAt: '2026-05-02T09:30', auditTrail: [{ action: 'Approved', by: 'Admin User', at: '2026-05-02T09:30', note: 'ลูกค้ายืนยันยอดและเงื่อนไขแล้ว' }] },
  { id: 'QT-2026-0044', customer: 'ร้าน Star Pet Shop',     date: '2026-04-30', validUntil: '2026-05-14', amount: 234800, status: 'Approved',    items: 6, soRef: null, leadSource: 'Live', lines: [{ sku: 'CAT-CHK-30', qty: 30, reservedQty: 0 }, { sku: 'CAT-DUK-30', qty: 24, reservedQty: 0 }], reservedStock: false, createdBy: 'Admin User', updatedBy: 'คุณเจ้าของร้าน', updatedAt: '2026-05-01T14:20', auditTrail: [{ action: 'Approved', by: 'คุณเจ้าของร้าน', at: '2026-05-01T14:20', note: 'อนุมัติแล้ว รอสร้าง SO และจองสต็อก' }] },
  { id: 'QT-2026-0043', customer: 'คุณสมใจ (LINE)',          date: '2026-04-28', validUntil: '2026-05-12', amount: 89200,  status: 'Approved',   items: 3, soRef: 'SO-2026-0411', leadSource: 'LINE', lines: [{ sku: 'CAT-SAL-100', qty: 16, reservedQty: 16 }, { sku: 'DOG-DUK-50', qty: 12, reservedQty: 12 }], reservedStock: true, createdBy: 'Admin User', updatedBy: 'คุณเจ้าของร้าน', updatedAt: '2026-05-01T10:15', auditTrail: [{ action: 'Approved', by: 'คุณเจ้าของร้าน', at: '2026-05-01T10:15', note: 'อนุมัติราคาพิเศษ' }] },
  { id: 'QT-2026-0042', customer: 'ขายส่ง Fast Pet Corp',   date: '2026-04-27', validUntil: '2026-05-11', amount: 312000, status: 'Rejected',   items: 8, soRef: null, leadSource: 'B2B Referral', lines: [{ sku: 'CAT-MIX-200', qty: 18, reservedQty: 0 }], reservedStock: false, createdBy: 'Admin User', updatedBy: 'คุณเจ้าของร้าน', updatedAt: '2026-04-28T11:10', auditTrail: [{ action: 'Rejected', by: 'คุณเจ้าของร้าน', at: '2026-04-28T11:10', note: 'Margin ต่ำกว่านโยบาย' }] },
  { id: 'QT-2026-0041', customer: 'Shopee ลูกค้า',          date: '2026-04-25', validUntil: '2026-05-09', amount: 67500,  status: 'Converted',  items: 2, soRef: 'SO-2026-0409', leadSource: 'Shopee', lines: [{ sku: 'CAT-CHK-30', qty: 12, reservedQty: 12 }], reservedStock: true, createdBy: 'Admin User', updatedBy: 'Admin User', updatedAt: '2026-04-29T16:40', auditTrail: [{ action: 'Converted', by: 'Admin User', at: '2026-04-29T16:40', note: 'สร้าง Sales Order และ Reserved stock แล้ว' }] },
  { id: 'QT-2026-0040', customer: 'ร้าน Happy Pet',         date: '2026-04-24', validUntil: '2026-05-08', amount: 45600,  status: 'Draft',      items: 2, soRef: null, leadSource: 'Walk-in', lines: [{ sku: 'DOG-DUK-50', qty: 10, reservedQty: 0 }], reservedStock: false, createdBy: 'Admin User', updatedBy: 'Admin User', updatedAt: '2026-04-24T13:00', auditTrail: [{ action: 'Created', by: 'Admin User', at: '2026-04-24T13:00', note: 'Draft จากหน้าร้าน' }] },
  { id: 'QT-2026-0039', customer: 'บริษัท Woof & Meow',     date: '2026-04-22', validUntil: '2026-05-06', amount: 189000, status: 'Sent',       items: 5, soRef: null, leadSource: 'Facebook', lines: [{ sku: 'CAT-DUK-30', qty: 25, reservedQty: 0 }], reservedStock: false, createdBy: 'Admin User', updatedBy: 'Admin User', updatedAt: '2026-04-22T17:25', auditTrail: [{ action: 'Sent', by: 'Admin User', at: '2026-04-22T17:25', note: 'ส่งให้ลูกค้าเช็กราคา' }] },
  { id: 'QT-2026-0038', customer: 'คุณนิดา (Tel)',           date: '2026-04-20', validUntil: '2026-05-04', amount: 28500,  status: 'Expired',    items: 1, soRef: null, leadSource: 'LINE', lines: [{ sku: 'CAT-CHK-30', qty: 8, reservedQty: 0 }], reservedStock: false, createdBy: 'Admin User', updatedBy: 'System', updatedAt: '2026-05-05T00:01', auditTrail: [{ action: 'Expired', by: 'System', at: '2026-05-05T00:01', note: 'หมดอายุอัตโนมัติ' }] },
]

// ── Sales Orders ──────────────────────────────────────────────
// NOTE: Each SO carries channel (TikTok/Shopee/LINE/Manual) so Finance module
// can compute Revenue per channel without any mock fallback.
// TikTok Live sessions → channel:'TikTok'; Shopee marketplace → channel:'Shopee'; etc.
export const salesOrders = [
  // ── May 2026 ────────────────────────────────────────────────
  { id: 'SO-2026-0412', customer: 'บริษัท ABC Pet Supply',     date: '2026-05-02', amount: 125400, status: 'Completed',  channel: 'Manual',  items: 4,  qtRef: 'QT-2026-0045' },
  { id: 'SO-2026-0411', customer: 'คุณสมใจ (Manual)',          date: '2026-05-01', amount:  89200, status: 'Pending',    channel: 'Manual',  items: 3,  qtRef: 'QT-2026-0043' },
  { id: 'SO-2026-TT05A', customer: 'TikTok Live พ.ค. รอบ 1',  date: '2026-05-04', amount: 186000, status: 'Completed',  channel: 'TikTok',  items: 52, qtRef: null },
  { id: 'SO-2026-TT05B', customer: 'TikTok Live พ.ค. รอบ 2',  date: '2026-05-11', amount: 174000, status: 'Completed',  channel: 'TikTok',  items: 48, qtRef: null },
  { id: 'SO-2026-TT05C', customer: 'TikTok Live พ.ค. รอบ 3',  date: '2026-05-18', amount: 192000, status: 'Processing', channel: 'TikTok',  items: 55, qtRef: null },
  { id: 'SO-2026-SP05A', customer: 'Shopee Orders พ.ค. W1–W2', date: '2026-05-10', amount: 154000, status: 'Completed',  channel: 'Shopee',  items: 40, qtRef: null },
  { id: 'SO-2026-SP05B', customer: 'Shopee Orders พ.ค. W3',    date: '2026-05-17', amount: 128000, status: 'Processing', channel: 'Shopee',  items: 33, qtRef: null },
  { id: 'SO-2026-LN05A', customer: 'LINE Orders พ.ค.',         date: '2026-05-14', amount: 145000, status: 'Completed',  channel: 'LINE',    items: 21, qtRef: null },
  // ── April 2026 ──────────────────────────────────────────────
  { id: 'SO-2026-0410', customer: 'ร้าน Star Pet Shop',        date: '2026-04-30', amount: 234800, status: 'Processing', channel: 'Manual',  items: 6,  qtRef: null },
  { id: 'SO-2026-0409', customer: 'Shopee ลูกค้า',             date: '2026-04-29', amount:  67500, status: 'Completed',  channel: 'Shopee',  items: 2,  qtRef: 'QT-2026-0041' },
  { id: 'SO-2026-0408', customer: 'ขายส่ง Fast Pet Corp',      date: '2026-04-28', amount: 156000, status: 'Cancelled',  channel: 'Manual',  items: 5,  qtRef: null },
  { id: 'SO-2026-0407', customer: 'ร้าน Happy Pet',            date: '2026-04-27', amount:  45600, status: 'Completed',  channel: 'Manual',  items: 2,  qtRef: null },
  { id: 'SO-2026-0405', customer: 'บริษัท Woof & Meow',        date: '2026-04-25', amount: 189000, status: 'Processing', channel: 'Manual',  items: 5,  qtRef: null },
  { id: 'SO-2026-TT04A', customer: 'TikTok Live เม.ย. รอบ 1', date: '2026-04-03', amount: 245000, status: 'Completed',  channel: 'TikTok',  items: 68, qtRef: null },
  { id: 'SO-2026-TT04B', customer: 'TikTok Live เม.ย. รอบ 2', date: '2026-04-11', amount: 228000, status: 'Completed',  channel: 'TikTok',  items: 64, qtRef: null },
  { id: 'SO-2026-TT04C', customer: 'TikTok Live เม.ย. รอบ 3', date: '2026-04-18', amount: 207000, status: 'Completed',  channel: 'TikTok',  items: 58, qtRef: null },
  { id: 'TT240429002',   customer: 'TikTok — ไก่อกสุนัข 100g', date: '2026-04-29', amount:    298, status: 'Completed',  channel: 'TikTok',  items: 1,  qtRef: null },
  { id: 'TT240428001',   customer: 'TikTok — แซลมอนฟรีซดราย', date: '2026-04-28', amount:    378, status: 'Completed',  channel: 'TikTok',  items: 1,  qtRef: null },
  { id: 'SO-2026-SP04A', customer: 'Shopee Orders เม.ย.',      date: '2026-04-16', amount: 170000, status: 'Completed',  channel: 'Shopee',  items: 44, qtRef: null },
  { id: 'SO-2026-LN04A', customer: 'LINE Orders เม.ย.',        date: '2026-04-20', amount: 132424, status: 'Completed',  channel: 'LINE',    items: 19, qtRef: null },
  // ── March 2026 ──────────────────────────────────────────────
  { id: 'SO-2026-TT03A', customer: 'TikTok Live มี.ค. รอบ 1', date: '2026-03-03', amount: 207000, status: 'Completed',  channel: 'TikTok',  items: 58, qtRef: null },
  { id: 'SO-2026-TT03B', customer: 'TikTok Live มี.ค. รอบ 2', date: '2026-03-11', amount: 198000, status: 'Completed',  channel: 'TikTok',  items: 55, qtRef: null },
  { id: 'SO-2026-TT03C', customer: 'TikTok Live มี.ค. รอบ 3', date: '2026-03-25', amount: 215000, status: 'Completed',  channel: 'TikTok',  items: 62, qtRef: null },
  { id: 'SO-2026-SP03A', customer: 'Shopee Orders มี.ค.',      date: '2026-03-16', amount: 276000, status: 'Completed',  channel: 'Shopee',  items: 72, qtRef: null },
  { id: 'SO-2026-LN03A', customer: 'LINE Orders มี.ค.',        date: '2026-03-20', amount: 207000, status: 'Completed',  channel: 'LINE',    items: 30, qtRef: null },
  { id: 'SO-2026-MN03A', customer: 'B2B Manual มี.ค.',         date: '2026-03-27', amount: 277000, status: 'Completed',  channel: 'Manual',  items: 9,  qtRef: null },
  // ── February 2026 ───────────────────────────────────────────
  { id: 'SO-2026-TT02A', customer: 'TikTok Live ก.พ. รอบ 1',  date: '2026-02-04', amount: 173000, status: 'Completed',  channel: 'TikTok',  items: 50, qtRef: null },
  { id: 'SO-2026-TT02B', customer: 'TikTok Live ก.พ. รอบ 2',  date: '2026-02-18', amount: 163000, status: 'Completed',  channel: 'TikTok',  items: 46, qtRef: null },
  { id: 'SO-2026-TT02C', customer: 'TikTok Live ก.พ. รอบ 3',  date: '2026-02-25', amount: 195000, status: 'Completed',  channel: 'TikTok',  items: 58, qtRef: null },
  { id: 'SO-2026-SP02A', customer: 'Shopee Orders ก.พ.',       date: '2026-02-15', amount: 236000, status: 'Completed',  channel: 'Shopee',  items: 62, qtRef: null },
  { id: 'SO-2026-LN02A', customer: 'LINE Orders ก.พ.',         date: '2026-02-20', amount: 177000, status: 'Completed',  channel: 'LINE',    items: 26, qtRef: null },
  { id: 'SO-2026-MN02A', customer: 'B2B Manual ก.พ.',          date: '2026-02-22', amount: 236000, status: 'Completed',  channel: 'Manual',  items: 7,  qtRef: null },
  // ── January 2026 ────────────────────────────────────────────
  { id: 'SO-2026-TT01A', customer: 'TikTok Live ม.ค. รอบ 1',  date: '2026-01-05', amount: 158000, status: 'Completed',  channel: 'TikTok',  items: 45, qtRef: null },
  { id: 'SO-2026-TT01B', customer: 'TikTok Live ม.ค. รอบ 2',  date: '2026-01-12', amount: 143000, status: 'Completed',  channel: 'TikTok',  items: 40, qtRef: null },
  { id: 'SO-2026-TT01C', customer: 'TikTok Live ม.ค. รอบ 3',  date: '2026-01-26', amount: 173000, status: 'Completed',  channel: 'TikTok',  items: 52, qtRef: null },
  { id: 'SO-2026-SP01A', customer: 'Shopee Orders ม.ค.',       date: '2026-01-14', amount: 210000, status: 'Completed',  channel: 'Shopee',  items: 55, qtRef: null },
  { id: 'SO-2026-LN01A', customer: 'LINE Orders ม.ค.',         date: '2026-01-20', amount: 158000, status: 'Completed',  channel: 'LINE',    items: 22, qtRef: null },
  { id: 'SO-2026-MN01A', customer: 'B2B Manual ม.ค.',          date: '2026-01-25', amount: 208000, status: 'Completed',  channel: 'Manual',  items: 8,  qtRef: null },
  // ── December 2025 ───────────────────────────────────────────
  { id: 'SO-2025-TT12A', customer: 'TikTok Live ธ.ค. รอบ 1',  date: '2025-12-03', amount: 148000, status: 'Completed',  channel: 'TikTok',  items: 42, qtRef: null },
  { id: 'SO-2025-TT12B', customer: 'TikTok Live ธ.ค. รอบ 2',  date: '2025-12-17', amount: 134000, status: 'Completed',  channel: 'TikTok',  items: 38, qtRef: null },
  { id: 'SO-2025-TT12C', customer: 'TikTok Live ธ.ค. รอบ 4',  date: '2025-12-27', amount: 120000, status: 'Completed',  channel: 'TikTok',  items: 35, qtRef: null },
  { id: 'SO-2025-SP12A', customer: 'Shopee Orders ธ.ค.',       date: '2025-12-10', amount: 184000, status: 'Completed',  channel: 'Shopee',  items: 48, qtRef: null },
  { id: 'SO-2025-LN12A', customer: 'LINE Orders ธ.ค.',         date: '2025-12-15', amount: 138000, status: 'Completed',  channel: 'LINE',    items: 20, qtRef: null },
  { id: 'SO-2025-MN12A', customer: 'B2B Manual ธ.ค.',          date: '2025-12-20', amount: 196000, status: 'Completed',  channel: 'Manual',  items: 6,  qtRef: null },
]

// ── Manual Orders ─────────────────────────────────────────────
export const manualOrders = [
  { id: 'MO-2026-0025', customer: 'คุณสมใจ สุขดี',    phone: '081-234-5678', channel: 'LINE',      date: '2026-05-02', amount: 356,  status: 'Confirmed', items: 2, notes: 'ขอห่อของขวัญ' },
  { id: 'MO-2026-0024', customer: 'คุณนิดา รักสัตว์',  phone: '089-876-5432', channel: 'Instagram', date: '2026-05-01', amount: 189,  status: 'Pending',   items: 1, notes: '' },
  { id: 'MO-2026-0023', customer: 'ร้าน Paw Zone',      phone: '02-345-6789',  channel: 'Facebook',  date: '2026-04-30', amount: 1290, status: 'Confirmed', items: 3, notes: 'ลูกค้า VIP' },
  { id: 'MO-2026-0022', customer: 'คุณพิม บุญมา',       phone: '092-111-2222', channel: 'Offline',   date: '2026-04-29', amount: 445,  status: 'Completed', items: 2, notes: 'ซื้อที่ร้านโดยตรง' },
  { id: 'MO-2026-0021', customer: 'คุณบอส เลี้ยงแมว',  phone: '064-999-8888', channel: 'LINE',      date: '2026-04-28', amount: 594,  status: 'Cancelled', items: 1, notes: 'ลูกค้ายกเลิก' },
]

// ── Invoices ──────────────────────────────────────────────────
export const invoices = [
  { id: 'INV-2026-0567', soRef: 'SO-2026-0412', customer: 'บริษัท ABC Pet Supply',  issueDate: '2026-05-02', dueDate: '2026-05-17', amount: 125400, paid: 125400, status: 'Paid'     },
  { id: 'INV-2026-0566', soRef: 'SO-2026-0410', customer: 'ร้าน Star Pet Shop',     issueDate: '2026-04-30', dueDate: '2026-05-15', amount: 234800, paid: 0,      status: 'Overdue'  },
  { id: 'INV-2026-0565', soRef: 'SO-2026-0409', customer: 'Shopee ลูกค้า',          issueDate: '2026-04-29', dueDate: '2026-05-14', amount: 67500,  paid: 67500,  status: 'Paid'     },
  { id: 'INV-2026-0564', soRef: 'SO-2026-0407', customer: 'ร้าน Happy Pet',         issueDate: '2026-04-27', dueDate: '2026-05-12', amount: 45600,  paid: 20000,  status: 'Partial'  },
  { id: 'INV-2026-0563', soRef: 'SO-2026-0406', customer: 'TikTok ลูกค้า A',        issueDate: '2026-04-26', dueDate: '2026-05-11', amount: 18900,  paid: 18900,  status: 'Paid'     },
  { id: 'INV-2026-0562', soRef: 'SO-2026-0405', customer: 'บริษัท Woof & Meow',     issueDate: '2026-04-25', dueDate: '2026-05-25', amount: 189000, paid: 0,      status: 'Unpaid'   },
  { id: 'INV-2026-0561', soRef: 'SO-2026-0403', customer: 'ขายส่ง PetMart Group',   issueDate: '2026-04-20', dueDate: '2026-05-05', amount: 278000, paid: 0,      status: 'Overdue'  },
]

// ── Pending Tasks ─────────────────────────────────────────────
export const pendingTasks = [
  { id: 'PR-2026-0089', title: 'ใบขอซื้อ — วัตถุดิบไก่อก 50kg', sub: 'Purchase Requisition · 22 Apr', status: 'Waiting'    },
  { id: 'PO-2026-0234', title: 'สั่งบรรจุภัณฑ์ — 5 รายการ',       sub: 'Purchase Order · ETA 26 Apr',   status: 'In Transit' },
  { id: 'INV-2026-0567', title: 'ใบแจ้งหนี้ครบกำหนด — ABC Pet',   sub: 'Account Payable · เกินกำหนด 3 วัน', status: 'Overdue' },
  { id: 'CNT-2026-001', title: 'นับสต็อค — คลังสินค้าหลัก',       sub: 'Stock Checking · กำหนด 30 Apr',  status: 'Scheduled' },
]

// ── Live & Content Management ────────────────────────────────
export type LivePlatform = 'TikTok' | 'Shopee' | 'Lazada'
export type LiveStatus = 'Pending' | 'Manager_Approved' | 'Rejected'
export type RoundingPolicy = 'actual' | 'quarter_up'

export type LiveStaff = {
  id: string
  name: string
  role: string
  baseSalary: number
  hourlyRate: number
  commissionPct: number
  clipBonus: number
}

export type AdminUser = {
  id: string
  name: string
}

export type LiveSession = {
  id: string
  staff_id: string
  live_date: string
  platform: LivePlatform
  tiktok_account: string
  start_datetime: string
  end_datetime: string
  break_minutes: number
  revenue_generated: number
  has_clip: boolean
  clip_link: string
  live_summary_image: string
  host_notes: string
  status: LiveStatus
  approved_by: string | null
  rejection_reason: string
  createdBy: string
  updatedBy: string
  updatedAt: string
  auditTrail: AuditEvent[]
}

export const liveStaff: LiveStaff[] = [
  { id: 'STF-001', name: 'มายด์', role: 'Live Host', baseSalary: 18000, hourlyRate: 120, commissionPct: 1.8, clipBonus: 120 },
  { id: 'STF-002', name: 'แพรว', role: 'Live Host', baseSalary: 17500, hourlyRate: 115, commissionPct: 1.6, clipBonus: 100 },
  { id: 'STF-003', name: 'บอส', role: 'Content Host', baseSalary: 16500, hourlyRate: 105, commissionPct: 1.4, clipBonus: 100 },
]

export const adminUsers: AdminUser[] = [
  { id: 'ADM-001', name: 'Admin User' },
  { id: 'ADM-002', name: 'คุณเจ้าของร้าน' },
]

export const liveSessions: LiveSession[] = [
  {
    id: 'LIVE-2026-0501',
    staff_id: 'STF-001',
    live_date: '2026-05-01',
    platform: 'TikTok',
    tiktok_account: '@chawy_official',
    start_datetime: '2026-05-01T20:00',
    end_datetime: '2026-05-01T23:15',
    break_minutes: 15,
    revenue_generated: 48600,
    has_clip: true,
    clip_link: 'https://www.tiktok.com/@chawy_official/video/0501',
    live_summary_image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&auto=format&fit=crop',
    host_notes: 'ลูกค้าถามหาอกไก่เยอะ และอยากได้โปร 3 ถุง',
    status: 'Manager_Approved',
    approved_by: 'ADM-001',
    rejection_reason: '',
    createdBy: 'มายด์',
    updatedBy: 'Admin User',
    updatedAt: '2026-05-02T09:10',
    auditTrail: [{ action: 'Approved', by: 'Admin User', at: '2026-05-02T09:10', note: 'ตรวจยอดขายและหลักฐานครบ' }],
  },
  {
    id: 'LIVE-2026-0503',
    staff_id: 'STF-002',
    live_date: '2026-05-03',
    platform: 'TikTok',
    tiktok_account: '@chawy_official',
    start_datetime: '2026-05-03T23:00',
    end_datetime: '2026-05-04T02:00',
    break_minutes: 0,
    revenue_generated: 32200,
    has_clip: false,
    clip_link: '',
    live_summary_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&auto=format&fit=crop',
    host_notes: 'รอบดึกคนถามโปรส่งฟรีเยอะ ควรทำคลิปสรุปโปร',
    status: 'Pending',
    approved_by: null,
    rejection_reason: '',
    createdBy: 'แพรว',
    updatedBy: 'แพรว',
    updatedAt: '2026-05-04T02:05',
    auditTrail: [{ action: 'Created', by: 'แพรว', at: '2026-05-04T02:05', note: 'ส่งบันทึกไลฟ์ข้ามคืน' }],
  },
  {
    id: 'LIVE-2026-0505',
    staff_id: 'STF-001',
    live_date: '2026-05-05',
    platform: 'Shopee',
    tiktok_account: '@chawy_shopee',
    start_datetime: '2026-05-05T19:30',
    end_datetime: '2026-05-05T22:10',
    break_minutes: 10,
    revenue_generated: 56100,
    has_clip: true,
    clip_link: 'https://shopee.co.th/live/chawy/0505',
    live_summary_image: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=900&auto=format&fit=crop',
    host_notes: 'แซลมอน 100g ปิดการขายดีช่วงท้ายไลฟ์',
    status: 'Manager_Approved',
    approved_by: 'ADM-002',
    rejection_reason: '',
    createdBy: 'มายด์',
    updatedBy: 'คุณเจ้าของร้าน',
    updatedAt: '2026-05-06T10:30',
    auditTrail: [{ action: 'Approved', by: 'คุณเจ้าของร้าน', at: '2026-05-06T10:30', note: 'อนุมัติหลังเช็ก Shopee summary' }],
  },
  {
    id: 'LIVE-2026-0507',
    staff_id: 'STF-003',
    live_date: '2026-05-07',
    platform: 'TikTok',
    tiktok_account: '@chawy_official',
    start_datetime: '2026-05-07T18:45',
    end_datetime: '2026-05-07T21:10',
    break_minutes: 20,
    revenue_generated: 18800,
    has_clip: false,
    clip_link: '',
    live_summary_image: '',
    host_notes: 'รูปสรุปยอดยังไม่ชัด ต้องส่งใหม่',
    status: 'Rejected',
    approved_by: 'ADM-001',
    rejection_reason: 'แนบรูปสรุปยอดขายไม่ครบ',
    createdBy: 'บอส',
    updatedBy: 'Admin User',
    updatedAt: '2026-05-08T09:25',
    auditTrail: [{ action: 'Rejected', by: 'Admin User', at: '2026-05-08T09:25', note: 'แนบรูปสรุปยอดขายไม่ครบ' }],
  },
  {
    id: 'LIVE-2026-0509',
    staff_id: 'STF-002',
    live_date: '2026-05-09',
    platform: 'Lazada',
    tiktok_account: '@chawy_lazada',
    start_datetime: '2026-05-09T21:15',
    end_datetime: '2026-05-10T00:35',
    break_minutes: 15,
    revenue_generated: 41450,
    has_clip: true,
    clip_link: 'https://lazada.co.th/live/chawy/0509',
    live_summary_image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&auto=format&fit=crop',
    host_notes: 'ลูกค้าสนใจแพ็กน้องหมา เพิ่ม CTA รอบหน้า',
    status: 'Pending',
    approved_by: null,
    rejection_reason: '',
    createdBy: 'แพรว',
    updatedBy: 'แพรว',
    updatedAt: '2026-05-10T00:40',
    auditTrail: [{ action: 'Created', by: 'แพรว', at: '2026-05-10T00:40', note: 'รออนุมัติรอบ Lazada' }],
  },
  {
    id: 'LIVE-2026-0511',
    staff_id: 'STF-001',
    live_date: '2026-05-11',
    platform: 'TikTok',
    tiktok_account: '@chawy_official',
    start_datetime: '2026-05-11T20:30',
    end_datetime: '2026-05-11T23:05',
    break_minutes: 5,
    revenue_generated: 62700,
    has_clip: false,
    clip_link: '',
    live_summary_image: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=900&auto=format&fit=crop',
    host_notes: 'ขายมิกซ์ 200g ดีมาก ควรตัดคลิปรีวิวสินค้า',
    status: 'Pending',
    approved_by: null,
    rejection_reason: '',
    createdBy: 'มายด์',
    updatedBy: 'มายด์',
    updatedAt: '2026-05-11T23:10',
    auditTrail: [{ action: 'Created', by: 'มายด์', at: '2026-05-11T23:10', note: 'รอตัดคลิปรีวิวสินค้า' }],
  },
]

export function getLiveNetMinutes(session: Pick<LiveSession, 'start_datetime' | 'end_datetime' | 'break_minutes'>) {
  const start = new Date(session.start_datetime)
  const end = new Date(session.end_datetime)
  const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000)
  return Math.max(0, diffMinutes - session.break_minutes)
}

export function getRoundedLiveMinutes(minutes: number, policy: RoundingPolicy) {
  if (policy === 'quarter_up') return Math.ceil(minutes / 15) * 15
  return minutes
}

export function getLiveDecimalHours(minutes: number) {
  return Number((minutes / 60).toFixed(2))
}

export function getLiveCommission(revenue: number, commissionPct: number) {
  return Math.round(revenue * commissionPct) / 100
}

export function getLiveHourlyPay(minutes: number, hourlyRate: number) {
  return Math.round(getLiveDecimalHours(minutes) * hourlyRate)
}

export function getClipBonus(hasClipCount: number, clipBonus: number) {
  return hasClipCount * clipBonus
}

// ── Content Analytics Mock Data ──────────────────────────────
export type ContentPost = {
  title: string
  platform: string
  reach: number
  eng: number
  date: string
}

export type ContentSchedule = {
  platform: string
  status: 'scheduled' | 'draft'
  topic: string
  date: string
  time: string
  host: string
}

export const contentPosts: ContentPost[] = [
  { title: 'รีวิวไก่อกฟรีซดราย: แนวทิ้งก่อนนั้น', platform: 'TikTok',    reach: 84200, eng: 6.8, date: '2026-05-29' },
  { title: 'เรื่องดัดหลังระวังการพลัดหล่น',         platform: 'Instagram', reach: 32400, eng: 4.2, date: '2026-05-27' },
  { title: 'โปรโมเช็น 3 ชิ้น ลด 15%',               platform: 'Facebook',  reach: 56800, eng: 3.9, date: '2026-05-25' },
  { title: 'ทำไมแมวถึงชอบอาหารแห้งฟรีซดราย',        platform: 'TikTok',    reach: 71300, eng: 5.5, date: '2026-05-22' },
  { title: 'เปรียบเทียบ: ฟรีซดราย vs อาหารทั่วไป',  platform: 'YouTube',   reach: 44100, eng: 7.1, date: '2026-05-20' },
]

export const liveSchedule: ContentSchedule[] = [
  { platform: 'TikTok Live',   status: 'scheduled', topic: 'รีวิวอาหารใหม่ แฮมอน+ไก่',       date: '2026-05-31', time: '20:00', host: 'พัมรวย' },
  { platform: 'Facebook Live', status: 'scheduled', topic: 'โปรโมเช็นมีดูนาน',               date: '2026-06-01', time: '19:30', host: 'นิ่งเส่น' },
  { platform: 'TikTok Live',   status: 'draft',     topic: 'ตอบคำถามเรื่องอาหารแมว',         date: '2026-06-02', time: '20:00', host: 'พัมรวย' },
]

export function hasLiveOverlap(
  sessions: Array<Pick<LiveSession, 'id' | 'staff_id' | 'start_datetime' | 'end_datetime' | 'status'>>,
  candidate: Pick<LiveSession, 'staff_id' | 'start_datetime' | 'end_datetime'>,
  ignoreId?: string
) {
  const candidateStart = new Date(candidate.start_datetime).getTime()
  const candidateEnd = new Date(candidate.end_datetime).getTime()
  return sessions.some(session => {
    if (session.id === ignoreId || session.staff_id !== candidate.staff_id || session.status === 'Rejected') return false
    const start = new Date(session.start_datetime).getTime()
    const end = new Date(session.end_datetime).getTime()
    return candidateStart < end && candidateEnd > start
  })
}
