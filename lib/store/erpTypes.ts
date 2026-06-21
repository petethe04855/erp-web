// erpTypes.ts — all ERP domain types
// Store implementation lives in erpWorkflow.ts.

import type { AuditEvent, Quotation, QuotationLine, QuotationStatus, LeadSource, LiveSession, LiveStatus } from '../mockData.ts'
export type { AuditEvent, Quotation, QuotationLine, QuotationStatus, LeadSource, LiveSession, LiveStatus }

// ── Sales ──────────────────────────────────────────────────────────────────

// Gap 4: added live-commerce statuses
export type SalesOrderStatus =
  | 'Pending' | 'Processing' | 'Completed' | 'Cancelled'
  | 'รอชำระจากไลฟ์' | 'ยืนยัน Cart แล้ว' | 'แพ็กแล้ว/รอส่ง'

export type SalesOrderChannel = 'Manual' | 'LINE' | 'Shopee' | 'TikTok'
export type InvoiceStatus = 'Paid' | 'Unpaid' | 'Partial' | 'Overdue'

export type SalesOrderLine = { sku: string; qty: number }

export type SalesOrder = {
  id: string
  customer: string
  date: string
  amount: number
  status: SalesOrderStatus
  channel: SalesOrderChannel
  items: number
  lines: SalesOrderLine[]      // Gap 2: tracks reserved lines
  qtRef: string | null
  invRef: string | null
  sourceRef: string | null     // Gap 6: platform order ID (TikTok ID, LINE ref, etc.)
  auditTrail: AuditEvent[]     // Gap 9
}

export type Invoice = {
  id: string
  soRef: string
  customer: string
  issueDate: string
  dueDate: string
  amount: number
  paid: number
  status: InvoiceStatus
  auditTrail: AuditEvent[]     // Gap 9
}

// ── Purchasing ─────────────────────────────────────────────────────────────

export type PurchaseRequestStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected'
export type PurchaseOrderStatus = 'Draft' | 'Sent' | 'Partial Received' | 'Completed'
export type StockMovementType = 'IN' | 'OUT'

export type PurchaseRequestItem = { sku: string; name: string; qty: number; note: string }

export type PurchaseRequest = {
  id: string
  requester: string
  reason: string
  neededDate: string
  date: string
  items: PurchaseRequestItem[]
  status: PurchaseRequestStatus
  poRef: string | null
}

export type PurchaseOrderItem = {
  sku: string; name: string; qty: number; unitCost: number; receivedQty: number
}

export type PurchaseOrder = {
  id: string
  supplier: string
  etaDate: string
  date: string
  items: PurchaseOrderItem[]
  status: PurchaseOrderStatus
  prRef: string | null
  totalCost: number
  auditTrail: AuditEvent[]     // Gap 9
}

export type GoodsReceiveItem = {
  sku: string
  qtyReceived: number
  lot: string
  expiryDate: string           // Gap 1: FEFO expiry (yyyy-mm-dd or '' = no expiry)
}

export type GoodsReceive = {
  id: string
  poRef: string
  receiveDate: string
  items: GoodsReceiveItem[]
  auditTrail: AuditEvent[]     // Gap 9
}

export type StockMovement = {
  id: string
  sku: string
  type: StockMovementType
  qty: number
  refDoc: string
  date: string
  note: string
  changedBy: string            // Gap 9
}

// ── Inventory ──────────────────────────────────────────────────────────────

export type ProductCategory = 'Cat' | 'Dog' | 'Bundle' | 'Other'

export type Product = {
  sku: string
  name: string
  type: ProductCategory
  barcode: string
  weightGrams: number          // for shipping cost calculation
  retailPrice: number          // B2C price
  wholesalePrice: number       // B2B price
  price: number                // alias → retailPrice (legacy compat)
  cost: number                 // standard cost (COGS)
  stock: number
  reorder: number
  reservedQty: number          // Gap 2: committed to open SOs
  isBundle: boolean            // true = virtual product (no physical stock)
  isActive: boolean
  note: string
  baseUnit?: 'piece' | 'g' | 'kg'
}

// BOM: defines which components (and quantities) make up a bundle SKU
export type BundleComponent = {
  bundleSku: string          // the bundle/set product
  componentSku: string       // individual component
  qty: number
  unit?: 'piece' | 'g' | 'kg' | 'baht'
  componentType?: 'material' | 'packaging' | 'expense'
  unitCostOverride?: number
}

export type StockLot = {       // Gap 1: lot-level tracking for FEFO
  id: string
  sku: string
  lot: string
  qty: number                  // original qty received
  remainingQty: number         // qty available for picking
  expiryDate: string           // yyyy-mm-dd, '' = no expiry
  receivedDate: string
  grRef: string
  poRef: string
}

// ── Sampling ───────────────────────────────────────────────────────────────

export type SamplingStatus = 'Active' | 'Completed' | 'Cancelled'

export type SamplingRecipient = {
  id: string
  name: string
  contact: string
  qtyGiven: number
  date: string
  feedback: string
  converted: boolean
}

export type SamplingCampaign = {   // Gap 5: sampling / trial tracker
  id: string
  name: string
  sku: string
  skuName: string
  targetQty: number
  givenQty: number
  note: string
  startDate: string
  endDate: string
  status: SamplingStatus
  recipients: SamplingRecipient[]
}

// ── User / Role ────────────────────────────────────────────────────────────

export type UserRole = 'owner' | 'sales' | 'warehouse' | 'accountant'

export type AppUser = {        // Gap 7
  id: string
  name: string
  role: UserRole
  isActive?: boolean
  lastLoginAt?: string | null
}

export const APP_USERS: AppUser[] = [
  { id: 'USR-001', name: 'Chawy', role: 'owner' },
  { id: 'USR-002', name: 'จอย', role: 'sales' },
  { id: 'USR-003', name: 'แพร', role: 'warehouse' },
  { id: 'USR-004', name: 'จ็อบ', role: 'accountant' },
]

export const ROLE_LABELS: Record<UserRole, string> = {
  owner:      'เจ้าของ',
  sales:      'ทีมขาย',
  warehouse:  'คลังสินค้า',
  accountant: 'บัญชี',
}

export const ROLE_BADGE_STYLE: Record<UserRole, { bg: string; color: string }> = {
  owner:      { bg: '#EDE9FE', color: '#6D28D9' },
  sales:      { bg: '#DBEAFE', color: '#1D4ED8' },
  warehouse:  { bg: '#D1FAE5', color: '#065F46' },
  accountant: { bg: '#FEF3C7', color: '#92400E' },
}

// Nav hrefs each role may access ('*' = all)
export const ROLE_NAV: Record<UserRole, string[] | '*'> = {
  owner:      '*',
  sales:      ['/', '/dashboard', '/sales-orders', '/quotation', '/invoice', '/manual-order', '/tiktok-orders', '/live-sessions', '/sampling'],
  warehouse:  ['/', '/dashboard', '/sku', '/bom', '/stock', '/goods-receive', '/goods-issue', '/purchase-req', '/purchase-order', '/stock-transfer', '/stock-check', '/sampling'],
  accountant: ['/', '/dashboard', '/invoice', '/sales-orders', '/purchase-order', '/expenses', '/pl', '/budget'],
}

// ── Input types ────────────────────────────────────────────────────────────

export type CreateQuotationInput = {
  customer: string
  validUntil: string
  leadSource: LeadSource
  lines: Array<{ sku: string; qty: number }>
}

export type CreateSalesOrderInput = {
  customer: string
  date?: string
  amount: number
  channel?: SalesOrderChannel
  items?: number
  lines?: SalesOrderLine[]     // Gap 2: for stock reserve
  qtRef?: string | null
  sourceRef?: string | null    // Gap 6
  status?: SalesOrderStatus
}

export type CreateInvoiceInput = {
  soRef?: string
  customer: string
  issueDate?: string
  dueDate?: string
  amount: number
  status?: InvoiceStatus
}

export type CreatePurchaseRequestInput = {
  requester: string
  reason: string
  neededDate: string
  items: Array<{ sku: string; name: string; qty: number; note: string }>
}

export type CreatePurchaseOrderInput = {
  supplier: string
  etaDate: string
  items: Array<{ sku: string; name: string; qty: number; unitCost: number }>
  prRef?: string | null
}

export type CreateGoodsReceiveInput = {
  poRef: string
  receiveDate: string
  items: Array<{ sku: string; qtyReceived: number; lot: string; expiryDate: string }>
}

export type CreateSamplingCampaignInput = {
  name: string
  sku: string
  skuName: string
  targetQty: number
  note: string
  startDate: string
  endDate: string
}

export type AddSamplingRecipientInput = {
  campaignId: string
  name: string
  contact: string
  qtyGiven: number
  date: string
  feedback?: string
  converted?: boolean
}

// ── Goods Issue ────────────────────────────────────────────────────────────

export type GoodsIssueReason = 'ตัวอย่าง' | 'เสียหาย/หมดอายุ' | 'ใช้ภายใน' | 'โปรโมชัน' | 'อื่นๆ'

export type GoodsIssue = {
  id: string
  sku: string
  skuName: string
  qty: number
  reason: GoodsIssueReason
  note: string
  date: string
  issuedBy: string
}

export type CreateGoodsIssueInput = {
  sku: string
  qty: number
  reason: GoodsIssueReason
  note: string
}

// ── Returns ────────────────────────────────────────────────────────────────

export type ReturnReason = 'สินค้าชำรุด' | 'ผิดสินค้า' | 'ลูกค้าเปลี่ยนใจ' | 'ผิดขนาด/รุ่น' | 'อื่นๆ'
export type ReturnCondition = 'ดี' | 'เสียหาย'

export type StockReturn = {
  id: string
  soRef: string
  sku: string
  skuName: string
  qty: number
  condition: ReturnCondition
  reason: ReturnReason
  note: string
  date: string
  returnedBy: string
  refunded: boolean
  channel: string
  status: 'Pending' | 'Completed' | 'Cancelled'
}

export type CreateStockReturnInput = {
  soRef: string
  sku: string
  qty: number
  condition: ReturnCondition
  reason: ReturnReason
  note: string
  channel?: string
}

// ── Stock Adjustment (from physical count) ─────────────────────────────────

export type StockAdjustmentItem = {
  sku: string
  skuName: string
  systemQty: number
  actualQty: number
  variance: number
}

export type StockAdjustment = {
  id: string
  date: string
  checkedBy: string
  note: string
  items: StockAdjustmentItem[]
}

export type CreateStockAdjustmentInput = {
  note: string
  items: Array<{ sku: string; actualQty: number }>
}

// ── Stock Transfer ─────────────────────────────────────────────────────────

export type StockTransfer = {
  id: string
  sku: string
  skuName: string
  qty: number
  fromLocation: string
  toLocation: string
  note: string
  date: string
  transferredBy: string
}

export type CreateStockTransferInput = {
  sku: string
  qty: number
  fromLocation: string
  toLocation: string
  note: string
}

// ── Finance & Accounting ───────────────────────────────────────────────────

export type ExpenseCategory =
  | 'ค่าโฆษณา'
  | 'ค่าธรรมเนียมแพลตฟอร์ม'
  | 'COGS/วัตถุดิบ'
  | 'SG&A'
  | 'ค่าขนส่ง'
  | 'ค่าแรง'
  | 'อื่นๆ'

export type ExpenseChannel = 'TikTok' | 'Shopee' | 'LINE' | 'Manual' | 'ทั่วไป'

export type Expense = {
  id: string
  date: string
  category: ExpenseCategory
  channel: ExpenseChannel
  amount: number
  description: string
  vendor: string
  invoiceRef: string
  createdBy: string
}

export type CreateExpenseInput = {
  date?: string
  category: ExpenseCategory
  channel: ExpenseChannel
  amount: number
  description: string
  vendor: string
  invoiceRef?: string
}

export type MonthBudget = {
  id: string
  year: number
  month: number
  category: ExpenseCategory
  channel: ExpenseChannel
  budgetAmount: number
}

export type UpsertBudgetInput = {
  year: number
  month: number
  category: ExpenseCategory
  channel: ExpenseChannel
  budgetAmount: number
}

// ── Product / SKU ──────────────────────────────────────────────────────────

export type CreateProductInput = {
  sku: string
  name: string
  type: ProductCategory
  barcode?: string
  weightGrams?: number
  retailPrice: number
  wholesalePrice?: number
  cost: number
  reorder?: number
  isBundle?: boolean
  note?: string
  baseUnit?: 'piece' | 'g' | 'kg'
}

export type UpdateProductInput = Partial<Omit<Product, 'sku' | 'reservedQty' | 'stock'>> & { sku: string }

export type SetBundleComponentsInput = {
  bundleSku: string
  components: Array<{
    componentSku: string
    qty: number
    unit?: 'piece' | 'g' | 'kg' | 'baht'
    componentType?: 'material' | 'packaging' | 'expense'
    unitCostOverride?: number
  }>
}

// ── TikTok Orders ──────────────────────────────────────────────────────────

export type TiktokOrderStatus =
  | 'COMPLETED' | 'AWAITING_SHIPMENT' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'

export type TiktokOrder = {
  id: string
  date: string
  product: string
  sku: string
  qty: number
  amount: number            // original order total (gross revenue)
  status: TiktokOrderStatus
  stockDeducted: boolean
  imported: boolean
  // Settlement fields — populated after syncing TikTok Finance API
  netRevenue?: number       // amount after all TikTok deductions
  platformFee?: number      // sum of all fees (commission + transaction + shipping subsidy, etc.)
  settled?: boolean         // true once settlement data has been applied
  settlementRef?: string    // settlement period identifier from TikTok (e.g. "2026-05-01_2026-05-14")
}

export type CreateTiktokOrderInput = {
  id?: string
  date?: string
  product: string
  sku: string
  qty: number
  amount: number
  status?: TiktokOrderStatus
  stockDeducted?: boolean
}

export type ApplySettlementInput = {
  orderId: string           // matches TiktokOrder.id
  netRevenue: number
  platformFee: number
  settlementRef: string
}

// ── Manual Orders ──────────────────────────────────────────────────────────

export type ManualOrderStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'

export type ManualOrder = {
  id: string
  customer: string
  phone: string
  channel: string
  date: string
  amount: number
  status: ManualOrderStatus
  items: number
  notes: string
}

export type CreateManualOrderInput = {
  customer: string
  phone: string
  channel: string
  amount: number
  items?: number
  notes?: string
}

// ── Settings ───────────────────────────────────────────────────────────────

export type CompanySettings = {
  name: string
  taxId: string
  address: string
  phone: string
  email: string
  website: string
  currency: string
  vatRate: number           // e.g. 7 (%)
  invoicePrefix: string     // e.g. 'INV-2026-'
  soPrefix: string          // e.g. 'SO-2026-'
}

export type NotificationSettings = {
  nearExpiry: boolean
  nearExpiryDays: number    // days before expiry to warn
  lowStock: boolean
  latePO: boolean
  newSO: boolean
  paymentDue: boolean
}

/** One boolean per toggleable sidebar nav item.
 *  Dashboard ('/') and Master Setting ('/settings') are always visible.
 *  false = hidden from sidebar (data is never deleted, just not shown). */
export type ModuleSettings = {
  // SALES
  quotation: boolean         // /quotation
  salesOrders: boolean       // /sales-orders
  invoice: boolean           // /invoice
  returns: boolean           // /returns
  // PURCHASING
  purchaseReq: boolean       // /purchase-req
  purchaseOrder: boolean     // /purchase-order
  // INVENTORY
  skuMaster: boolean         // /sku
  stockBalance: boolean      // /stock
  goodsReceive: boolean      // /goods-receive
  goodsIssue: boolean        // /goods-issue
  stockTransfer: boolean     // /stock-transfer
  stockCheck: boolean        // /stock-check
  // FINANCE
  expenses: boolean          // /expenses
  plReport: boolean          // /pl
  budget: boolean            // /budget
  // CHANNELS
  tiktokOrders: boolean      // /tiktok-orders
  liveContent: boolean       // /live-sessions
  manualOrder: boolean       // /manual-order
  tiktokCalculator: boolean  // /tiktok-calculator
  sampling: boolean          // /sampling
  // SYSTEM
  userManagement: boolean    // /users
  tiktokSetup: boolean       // /tiktok-setup
}

// ── Content Schedule ───────────────────────────────────────────────────────
export type ContentScheduleStatus = 'scheduled' | 'draft' | 'done'

export type ContentScheduleItem = {
  id: string
  platform: string
  account: string            // e.g. "@chawy_official" — replaces host
  status: ContentScheduleStatus
  topic: string
  date: string               // yyyy-mm-dd
  startTime: string          // HH:mm — was "time"
  endTime: string            // HH:mm
  createdAt: string
}

export type LivePayrollSettings = {
  /** ฿ per hour — same global rate for all live staff */
  hourlyRate: number
  /** ฿ per clip — same global bonus for all live staff */
  clipBonus: number
}

export type ErpSettings = {
  company: CompanySettings
  notifications: NotificationSettings
  modules: ModuleSettings
  livePayroll: LivePayrollSettings
}
