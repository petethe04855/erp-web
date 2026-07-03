import { createStore } from 'zustand/vanilla'
import {
  invoices as seedInvoices,
  quotations as seedQuotations,
  salesOrders as seedSalesOrders,
  skuProducts as seedProducts,
  tiktokOrders as seedTiktokOrders,
  liveSessions as seedLiveSessions,
  manualOrders as seedManualOrders,
  type QuotationStatus,
} from '../mockData.ts'
import type {
  AuditEvent, Quotation, QuotationLine, LeadSource,
  SalesOrderStatus, SalesOrderChannel, InvoiceStatus,
  SalesOrderLine, SalesOrder, Invoice,
  PurchaseRequestStatus, PurchaseOrderStatus, StockMovementType,
  PurchaseRequestItem, PurchaseRequest,
  PurchaseOrderItem, PurchaseOrder,
  GoodsReceiveItem, GoodsReceive, StockMovement, LandedCostLine,
  Product, StockLot, ProductCategory, BundleComponent,
  SamplingStatus, SamplingRecipient, SamplingCampaign,
  AppUser,
  CreateQuotationInput, CreateSalesOrderInput, CreateInvoiceInput,
  CreatePurchaseRequestInput, CreatePurchaseOrderInput,
  CreateGoodsReceiveInput, CreateSamplingCampaignInput, AddSamplingRecipientInput,
  GoodsIssueReason, GoodsIssue, CreateGoodsIssueInput,
  ReturnCondition, ReturnReason, StockReturn, CreateStockReturnInput,
  StockAdjustmentItem, StockAdjustment, CreateStockAdjustmentInput,
  StockTransfer, CreateStockTransferInput,
  ExpenseCategory, ExpenseChannel, Expense, CreateExpenseInput,
  MonthBudget, UpsertBudgetInput,
  CreateProductInput, UpdateProductInput, SetBundleComponentsInput,
  TiktokOrder, TiktokOrderStatus, CreateTiktokOrderInput,
  ManualOrder, ManualOrderStatus, CreateManualOrderInput,
  LiveSession, LiveStatus,
  ApplySettlementInput,
  ErpSettings,
  LivePayrollSettings,
  ContentScheduleItem, ContentScheduleStatus,
} from './erpTypes.ts'

export type {
  SalesOrderStatus, SalesOrderChannel, InvoiceStatus,
  SalesOrderLine, SalesOrder, Invoice,
  PurchaseRequestStatus, PurchaseOrderStatus, StockMovementType,
  PurchaseRequestItem, PurchaseRequest,
  PurchaseOrderItem, PurchaseOrder,
  GoodsReceiveItem, GoodsReceive, StockMovement, LandedCostLine,
  Product, StockLot, ProductCategory, BundleComponent,
  SamplingStatus, SamplingRecipient, SamplingCampaign,
  AppUser,
  CreateSalesOrderInput, CreateInvoiceInput,
  CreatePurchaseRequestInput, CreatePurchaseOrderInput,
  CreateGoodsReceiveInput, CreateSamplingCampaignInput, AddSamplingRecipientInput,
  GoodsIssueReason, GoodsIssue, CreateGoodsIssueInput,
  ReturnCondition, ReturnReason, StockReturn, CreateStockReturnInput,
  StockAdjustmentItem, StockAdjustment, CreateStockAdjustmentInput,
  StockTransfer, CreateStockTransferInput,
  ExpenseCategory, ExpenseChannel, Expense, CreateExpenseInput,
  MonthBudget, UpsertBudgetInput,
  CreateProductInput, UpdateProductInput, SetBundleComponentsInput,
  TiktokOrder, TiktokOrderStatus, CreateTiktokOrderInput,
  ManualOrder, ManualOrderStatus, CreateManualOrderInput,
  LiveSession, LiveStatus,
  ApplySettlementInput,
  LivePayrollSettings,
  ContentScheduleItem, ContentScheduleStatus,
} from './erpTypes.ts'

export const SCHEMA_VERSION = 15
export const ERP_WORKFLOW_PERSIST_KEY = 'chawy-erp-workflow-v1'

// ── State & Actions ────────────────────────────────────────────────────────

export type ErpWorkflowState = {
  schemaVersion: number
  quotations: Quotation[]
  salesOrders: SalesOrder[]
  invoices: Invoice[]
  purchaseRequests: PurchaseRequest[]
  purchaseOrders: PurchaseOrder[]
  goodsReceives: GoodsReceive[]
  stockMovements: StockMovement[]
  products: Product[]
  stockLots: StockLot[]                   // Gap 1
  samplingCampaigns: SamplingCampaign[]   // Gap 5
  currentUser: AppUser                    // Gap 7
  goodsIssues: GoodsIssue[]
  stockReturns: StockReturn[]
  stockAdjustments: StockAdjustment[]
  stockTransfers: StockTransfer[]
  expenses: Expense[]
  budgets: MonthBudget[]
  bundleComponents: BundleComponent[]   // BOM: bundle → components mapping
  tiktokOrders: TiktokOrder[]
  liveSessions: LiveSession[]
  contentSchedule: ContentScheduleItem[]
  manualOrders: ManualOrder[]
  settings: ErpSettings
}

export type ErpWorkflowActions = {
  createQuotation: (input: CreateQuotationInput) => Quotation
  updateQuotationStatus: (id: string, status: QuotationStatus, note: string) => Quotation | null
  convertQuotationToSalesOrder: (quotationId: string) => SalesOrder | null
  createSalesOrder: (input: CreateSalesOrderInput) => SalesOrder
  updateSalesOrderStatus: (soId: string, status: SalesOrderStatus) => SalesOrder | null
  createInvoice: (input: CreateInvoiceInput) => Invoice
  createInvoiceFromSO: (salesOrderId: string) => Invoice | null
  recordPayment: (invoiceId: string, amount: number) => Invoice | null
  createPurchaseRequest: (input: CreatePurchaseRequestInput) => PurchaseRequest
  updatePRStatus: (prId: string, status: PurchaseRequestStatus) => PurchaseRequest | null
  convertPRtoPO: (prId: string, supplier: string, etaDate: string, itemCosts: Record<string, number>) => PurchaseOrder | null
  createPurchaseOrder: (input: CreatePurchaseOrderInput) => PurchaseOrder
  updatePOStatus: (poId: string, status: PurchaseOrderStatus) => PurchaseOrder | null
  createGoodsReceive: (input: CreateGoodsReceiveInput) => GoodsReceive | null
  createSamplingCampaign: (input: CreateSamplingCampaignInput) => SamplingCampaign   // Gap 5
  addSamplingRecipient: (input: AddSamplingRecipientInput) => SamplingCampaign | null // Gap 5
  updateSamplingStatus: (id: string, status: SamplingStatus) => SamplingCampaign | null // Gap 5
  setCurrentUser: (user: AppUser) => void  // Gap 7
  createGoodsIssue: (input: CreateGoodsIssueInput) => GoodsIssue | null
  createStockReturn: (input: CreateStockReturnInput) => StockReturn
  updateStockReturnStatus: (id: string, status: 'Completed' | 'Cancelled') => StockReturn | null
  createStockAdjustment: (input: CreateStockAdjustmentInput) => StockAdjustment
  createStockTransfer: (input: CreateStockTransferInput) => StockTransfer | null
  createExpense: (input: CreateExpenseInput) => Expense
  upsertBudget: (input: UpsertBudgetInput) => MonthBudget
  addProduct: (input: CreateProductInput) => Product
  updateProduct: (input: UpdateProductInput) => Product | null
  deleteProduct: (sku: string) => boolean
  setBundleComponents: (input: SetBundleComponentsInput) => BundleComponent[]
  calcBundleVirtualStock: (bundleSku: string) => number
  addTiktokOrder: (input: CreateTiktokOrderInput) => TiktokOrder
  markTiktokOrderImported: (id: string) => void
  applyTiktokSettlement: (input: ApplySettlementInput) => TiktokOrder | null
  addLiveSession: (input: Omit<LiveSession, 'id' | 'status' | 'approved_by' | 'createdBy' | 'updatedBy' | 'updatedAt' | 'auditTrail'>) => LiveSession
  updateLiveSessionStatus: (id: string, status: LiveStatus) => LiveSession | null
  addContentSchedule: (input: Omit<ContentScheduleItem, 'id' | 'createdAt'>) => ContentScheduleItem
  updateContentScheduleStatus: (id: string, status: ContentScheduleStatus) => ContentScheduleItem | null
  addManualOrder: (input: CreateManualOrderInput) => ManualOrder
  updateSettings: (patch: Partial<ErpSettings>) => void
}

export type ErpWorkflowStore = ErpWorkflowState & ErpWorkflowActions

type StoreSet = (partial: Partial<ErpWorkflowStore> | ((s: ErpWorkflowStore) => Partial<ErpWorkflowStore>)) => void
type StoreGet = () => ErpWorkflowStore

// ── Seed data ──────────────────────────────────────────────────────────────

const seededSalesOrders: SalesOrder[] = seedSalesOrders.map(o => ({
  ...o,
  status: o.status as SalesOrderStatus,
  channel: o.channel as SalesOrderChannel,
  invRef: null,
  lines: [],
  sourceRef: null,
  auditTrail: [],
}))

const seededInvoices: Invoice[] = seedInvoices.map(inv => ({
  ...inv,
  status: inv.status as InvoiceStatus,
  auditTrail: [],
}))

const seededProducts: Product[] = seedProducts.map(p => ({ ...p, reservedQty: 0 }))

const seedExpenses: Expense[] = [
  { id: 'EXP-2026-0001', date: '2026-05-01', category: 'ค่าโฆษณา',              channel: 'TikTok',  amount: 18000, description: 'TikTok Ads - แคมเปญ May', vendor: 'TikTok Business',    invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0002', date: '2026-05-01', category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'TikTok',  amount:  9200, description: 'GP TikTok Shop 5.8%',     vendor: 'TikTok Shop',        invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0003', date: '2026-05-01', category: 'ค่าโฆษณา',              channel: 'Shopee',  amount:  6500, description: 'Shopee Ads ค่า CPC',      vendor: 'Shopee',             invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0004', date: '2026-05-01', category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'Shopee',  amount:  4200, description: 'GP Shopee 3.5%',          vendor: 'Shopee',             invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0005', date: '2026-05-03', category: 'ค่าขนส่ง',              channel: 'TikTok',  amount:  8400, description: 'ค่าจัดส่ง Kerry May W1',  vendor: 'Kerry Express',      invoiceRef: '', createdBy: 'จอย' },
  { id: 'EXP-2026-0006', date: '2026-05-03', category: 'ค่าขนส่ง',              channel: 'Shopee',  amount:  3200, description: 'ค่าจัดส่ง J&T May W1',    vendor: 'J&T Express',        invoiceRef: '', createdBy: 'จอย' },
  { id: 'EXP-2026-0007', date: '2026-05-05', category: 'SG&A',                  channel: 'ทั่วไป',  amount: 22000, description: 'เงินเดือนทีมงาน',          vendor: 'Payroll',            invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0008', date: '2026-05-05', category: 'SG&A',                  channel: 'ทั่วไป',  amount:  8500, description: 'ค่าเช่าคลังสินค้า',        vendor: 'คลัง ABC',           invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0009', date: '2026-05-07', category: 'COGS/วัตถุดิบ',         channel: 'ทั่วไป',  amount: 42000, description: 'ซื้อวัตถุดิบ ไก่ ล็อต 05/26', vendor: 'Thai Freeze Co.', invoiceRef: 'PO-2026-0001', createdBy: 'แพร' },
  { id: 'EXP-2026-0010', date: '2026-05-10', category: 'ค่าโฆษณา',              channel: 'LINE',    amount:  4000, description: 'LINE Official Account Ads', vendor: 'LINE Corporation',  invoiceRef: '', createdBy: 'จอย' },
  { id: 'EXP-2026-0011', date: '2026-05-12', category: 'ค่าขนส่ง',              channel: 'ทั่วไป',  amount:  5600, description: 'ค่าจัดส่ง B2B (Manual)',   vendor: 'Flash Express',      invoiceRef: '', createdBy: 'แพร' },
  { id: 'EXP-2026-0012', date: '2026-05-15', category: 'SG&A',                  channel: 'ทั่วไป',  amount:  3200, description: 'ค่าไฟฟ้า-น้ำ',            vendor: 'กฟน.',               invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0013', date: '2026-04-01', category: 'ค่าโฆษณา',              channel: 'TikTok',  amount: 15000, description: 'TikTok Ads - เมษายน',     vendor: 'TikTok Business',    invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0014', date: '2026-04-01', category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'TikTok',  amount:  7800, description: 'GP TikTok April',          vendor: 'TikTok Shop',        invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0015', date: '2026-04-05', category: 'SG&A',                  channel: 'ทั่วไป',  amount: 22000, description: 'เงินเดือนทีมงาน เมษา',     vendor: 'Payroll',            invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0016', date: '2026-04-05', category: 'COGS/วัตถุดิบ',         channel: 'ทั่วไป',  amount: 38000, description: 'ซื้อวัตถุดิบ เมษา',        vendor: 'Thai Freeze Co.',    invoiceRef: '', createdBy: 'แพร' },
  { id: 'EXP-2026-0017', date: '2026-04-10', category: 'ค่าขนส่ง',              channel: 'TikTok',  amount:  7200, description: 'ค่าจัดส่ง TikTok เมษา',   vendor: 'Kerry Express',      invoiceRef: '', createdBy: 'จอย' },
  { id: 'EXP-2026-0018', date: '2026-03-01', category: 'ค่าโฆษณา',              channel: 'TikTok',  amount: 12000, description: 'TikTok Ads - มีนาคม',         vendor: 'TikTok Business',    invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0019', date: '2026-03-05', category: 'SG&A',                  channel: 'ทั่วไป',  amount: 22000, description: 'เงินเดือนทีมงาน มีนา',         vendor: 'Payroll',            invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0020', date: '2026-03-07', category: 'COGS/วัตถุดิบ',         channel: 'ทั่วไป',  amount: 35000, description: 'ซื้อวัตถุดิบ มีนา',            vendor: 'Thai Freeze Co.',    invoiceRef: '', createdBy: 'แพร' },
  { id: 'EXP-2026-0021', date: '2026-03-01', category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'TikTok',  amount:  9200, description: 'GP TikTok Shop มีนาคม',        vendor: 'TikTok Shop',        invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0022', date: '2026-03-03', category: 'ค่าขนส่ง',              channel: 'TikTok',  amount:  7800, description: 'ค่าจัดส่ง Kerry มีนา',         vendor: 'Kerry Express',      invoiceRef: '', createdBy: 'จอย' },
  { id: 'EXP-2026-0023', date: '2026-03-05', category: 'SG&A',                  channel: 'ทั่วไป',  amount:  8500, description: 'ค่าเช่าคลังสินค้า มีนา',       vendor: 'คลัง ABC',           invoiceRef: '', createdBy: 'Chawy' },
  // ── February 2026 ──────────────────────────────────────────────────────────
  { id: 'EXP-2026-0024', date: '2026-02-01', category: 'ค่าโฆษณา',              channel: 'TikTok',  amount: 16000, description: 'TikTok Ads - กุมภาพันธ์',     vendor: 'TikTok Business',    invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0025', date: '2026-02-01', category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'TikTok',  amount:  9800, description: 'GP TikTok Shop ก.พ.',         vendor: 'TikTok Shop',        invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0026', date: '2026-02-01', category: 'ค่าโฆษณา',              channel: 'Shopee',  amount:  7200, description: 'Shopee Ads ก.พ.',             vendor: 'Shopee',             invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0027', date: '2026-02-05', category: 'SG&A',                  channel: 'ทั่วไป',  amount: 22000, description: 'เงินเดือนทีมงาน ก.พ.',        vendor: 'Payroll',            invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0028', date: '2026-02-05', category: 'SG&A',                  channel: 'ทั่วไป',  amount:  8500, description: 'ค่าเช่าคลังสินค้า ก.พ.',      vendor: 'คลัง ABC',           invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0029', date: '2026-02-07', category: 'COGS/วัตถุดิบ',         channel: 'ทั่วไป',  amount: 37000, description: 'ซื้อวัตถุดิบ ก.พ.',           vendor: 'Thai Freeze Co.',    invoiceRef: '', createdBy: 'แพร' },
  { id: 'EXP-2026-0030', date: '2026-02-10', category: 'ค่าขนส่ง',              channel: 'TikTok',  amount:  9400, description: 'ค่าจัดส่ง Kerry ก.พ.',         vendor: 'Kerry Express',      invoiceRef: '', createdBy: 'จอย' },
  // ── January 2026 ───────────────────────────────────────────────────────────
  { id: 'EXP-2026-0031', date: '2026-01-01', category: 'ค่าโฆษณา',              channel: 'TikTok',  amount: 15000, description: 'TikTok Ads - มกราคม',         vendor: 'TikTok Business',    invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0032', date: '2026-01-01', category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'TikTok',  amount:  8800, description: 'GP TikTok Shop ม.ค.',         vendor: 'TikTok Shop',        invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0033', date: '2026-01-05', category: 'SG&A',                  channel: 'ทั่วไป',  amount: 22000, description: 'เงินเดือนทีมงาน ม.ค.',        vendor: 'Payroll',            invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0034', date: '2026-01-05', category: 'SG&A',                  channel: 'ทั่วไป',  amount:  8500, description: 'ค่าเช่าคลังสินค้า ม.ค.',      vendor: 'คลัง ABC',           invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-0035', date: '2026-01-07', category: 'COGS/วัตถุดิบ',         channel: 'ทั่วไป',  amount: 33000, description: 'ซื้อวัตถุดิบ ม.ค.',           vendor: 'Thai Freeze Co.',    invoiceRef: '', createdBy: 'แพร' },
  { id: 'EXP-2026-0036', date: '2026-01-10', category: 'ค่าขนส่ง',              channel: 'TikTok',  amount:  8200, description: 'ค่าจัดส่ง Kerry ม.ค.',         vendor: 'Kerry Express',      invoiceRef: '', createdBy: 'จอย' },
  // ── December 2025 ──────────────────────────────────────────────────────────
  { id: 'EXP-2025-0001', date: '2025-12-01', category: 'ค่าโฆษณา',              channel: 'TikTok',  amount: 14000, description: 'TikTok Ads - ธันวาคม',        vendor: 'TikTok Business',    invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2025-0002', date: '2025-12-01', category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'TikTok',  amount:  7500, description: 'GP TikTok Shop ธ.ค.',         vendor: 'TikTok Shop',        invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2025-0003', date: '2025-12-05', category: 'SG&A',                  channel: 'ทั่วไป',  amount: 22000, description: 'เงินเดือนทีมงาน ธ.ค.',        vendor: 'Payroll',            invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2025-0004', date: '2025-12-05', category: 'SG&A',                  channel: 'ทั่วไป',  amount:  8500, description: 'ค่าเช่าคลังสินค้า ธ.ค.',      vendor: 'คลัง ABC',           invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2025-0005', date: '2025-12-07', category: 'COGS/วัตถุดิบ',         channel: 'ทั่วไป',  amount: 29000, description: 'ซื้อวัตถุดิบ ธ.ค.',           vendor: 'Thai Freeze Co.',    invoiceRef: '', createdBy: 'แพร' },
  { id: 'EXP-2025-0006', date: '2025-12-10', category: 'ค่าขนส่ง',              channel: 'TikTok',  amount:  7200, description: 'ค่าจัดส่ง Kerry ธ.ค.',         vendor: 'Kerry Express',      invoiceRef: '', createdBy: 'จอย' },

  // ── COGS monthly recognition (~40% of each month's revenue) ────────────────
  // Revenue per month: Dec 920K / Jan 1,050K / Feb 1,180K / Mar 1,380K / Apr 1,520K / May 1,194K
  // These entries represent cost of goods actually recognized for the period.
  { id: 'EXP-2025-C001', date: '2025-12-28', category: 'COGS/วัตถุดิบ', channel: 'ทั่วไป', amount: 339000, description: 'COGS รวม ธ.ค. (ต้นทุนสินค้าที่ขาย)',  vendor: 'Thai Freeze Co.', invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-C001', date: '2026-01-30', category: 'COGS/วัตถุดิบ', channel: 'ทั่วไป', amount: 387000, description: 'COGS รวม ม.ค. (ต้นทุนสินค้าที่ขาย)',  vendor: 'Thai Freeze Co.', invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-C002', date: '2026-02-28', category: 'COGS/วัตถุดิบ', channel: 'ทั่วไป', amount: 435000, description: 'COGS รวม ก.พ. (ต้นทุนสินค้าที่ขาย)',  vendor: 'Thai Freeze Co.', invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-C003', date: '2026-03-28', category: 'COGS/วัตถุดิบ', channel: 'ทั่วไป', amount: 517000, description: 'COGS รวม มี.ค. (ต้นทุนสินค้าที่ขาย)', vendor: 'Thai Freeze Co.', invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-C004', date: '2026-04-28', category: 'COGS/วัตถุดิบ', channel: 'ทั่วไป', amount: 570000, description: 'COGS รวม เม.ย. (ต้นทุนสินค้าที่ขาย)', vendor: 'Thai Freeze Co.', invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-C005', date: '2026-05-25', category: 'COGS/วัตถุดิบ', channel: 'ทั่วไป', amount: 436000, description: 'COGS รวม พ.ค. (ต้นทุนสินค้าที่ขาย)',  vendor: 'Thai Freeze Co.', invoiceRef: '', createdBy: 'Chawy' },

  // ── OpEx supplement — shipping, ads, platform fees, labor per month ─────────
  // Target OpEx ~15% of revenue per month so Net Margin lands ~45%.
  // ── December 2025 ──
  { id: 'EXP-2025-O001', date: '2025-12-28', category: 'ค่าขนส่ง',              channel: 'ทั่วไป',  amount:  27300, description: 'ค่าจัดส่งรวม ธ.ค. (Kerry+J&T)',   vendor: 'Kerry/J&T',       invoiceRef: '', createdBy: 'จอย' },
  { id: 'EXP-2025-O002', date: '2025-12-01', category: 'ค่าโฆษณา',              channel: 'Shopee',  amount:   5000, description: 'Shopee Ads ธ.ค.',               vendor: 'Shopee',          invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2025-O003', date: '2025-12-01', category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'Shopee',  amount:   4600, description: 'GP Shopee ธ.ค.',               vendor: 'Shopee',          invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2025-O004', date: '2025-12-01', category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'TikTok',  amount:  15800, description: 'GP TikTok ธ.ค. (ส่วนเพิ่ม)',   vendor: 'TikTok Shop',     invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2025-O005', date: '2025-12-28', category: 'ค่าแรง',                channel: 'ทั่วไป',  amount:  18400, description: 'ค่าแรงพนักงานแพ็ค ธ.ค.',       vendor: 'Payroll',         invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2025-O006', date: '2025-12-01', category: 'ค่าโฆษณา',              channel: 'TikTok',  amount:  13600, description: 'TikTok Ads ธ.ค. (ส่วนเพิ่ม)',   vendor: 'TikTok Business', invoiceRef: '', createdBy: 'Chawy' },
  // ── January 2026 ──
  { id: 'EXP-2026-O001', date: '2026-01-30', category: 'ค่าขนส่ง',              channel: 'ทั่วไป',  amount:  38850, description: 'ค่าจัดส่งรวม ม.ค. (Kerry+J&T)', vendor: 'Kerry/J&T',       invoiceRef: '', createdBy: 'จอย' },
  { id: 'EXP-2026-O002', date: '2026-01-01', category: 'ค่าโฆษณา',              channel: 'Shopee',  amount:   5500, description: 'Shopee Ads ม.ค.',               vendor: 'Shopee',          invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O003', date: '2026-01-01', category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'Shopee',  amount:   5200, description: 'GP Shopee ม.ค.',               vendor: 'Shopee',          invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O004', date: '2026-01-01', category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'TikTok',  amount:  17700, description: 'GP TikTok ม.ค. (ส่วนเพิ่ม)',   vendor: 'TikTok Shop',     invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O005', date: '2026-01-30', category: 'ค่าแรง',                channel: 'ทั่วไป',  amount:  21000, description: 'ค่าแรงพนักงานแพ็ค ม.ค.',       vendor: 'Payroll',         invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O006', date: '2026-01-01', category: 'ค่าโฆษณา',              channel: 'TikTok',  amount:  10500, description: 'TikTok Ads ม.ค. (ส่วนเพิ่ม)',   vendor: 'TikTok Business', invoiceRef: '', createdBy: 'Chawy' },
  // ── February 2026 ──
  { id: 'EXP-2026-O007', date: '2026-02-28', category: 'ค่าขนส่ง',              channel: 'ทั่วไป',  amount:  44700, description: 'ค่าจัดส่งรวม ก.พ. (Kerry+J&T)', vendor: 'Kerry/J&T',       invoiceRef: '', createdBy: 'จอย' },
  { id: 'EXP-2026-O008', date: '2026-02-01', category: 'ค่าโฆษณา',              channel: 'Shopee',  amount:   6500, description: 'Shopee Ads ก.พ. (ส่วนเพิ่ม)',  vendor: 'Shopee',          invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O009', date: '2026-02-01', category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'Shopee',  amount:   5800, description: 'GP Shopee ก.พ.',               vendor: 'Shopee',          invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O010', date: '2026-02-01', category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'TikTok',  amount:  19800, description: 'GP TikTok ก.พ. (ส่วนเพิ่ม)',   vendor: 'TikTok Shop',     invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O011', date: '2026-02-28', category: 'ค่าแรง',                channel: 'ทั่วไป',  amount:  23600, description: 'ค่าแรงพนักงานแพ็ค ก.พ.',       vendor: 'Payroll',         invoiceRef: '', createdBy: 'Chawy' },
  // ── March 2026 ──
  { id: 'EXP-2026-O012', date: '2026-03-28', category: 'ค่าขนส่ง',              channel: 'ทั่วไป',  amount:  54300, description: 'ค่าจัดส่งรวม มี.ค. (Kerry+J&T)', vendor: 'Kerry/J&T',       invoiceRef: '', createdBy: 'จอย' },
  { id: 'EXP-2026-O013', date: '2026-03-01', category: 'ค่าโฆษณา',              channel: 'Shopee',  amount:   7400, description: 'Shopee Ads มี.ค.',              vendor: 'Shopee',          invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O014', date: '2026-03-01', category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'Shopee',  amount:   6600, description: 'GP Shopee มี.ค.',              vendor: 'Shopee',          invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O015', date: '2026-03-01', category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'TikTok',  amount:  23200, description: 'GP TikTok มี.ค. (ส่วนเพิ่ม)',  vendor: 'TikTok Shop',     invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O016', date: '2026-03-28', category: 'ค่าแรง',                channel: 'ทั่วไป',  amount:  27600, description: 'ค่าแรงพนักงานแพ็ค มี.ค.',      vendor: 'Payroll',         invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O017', date: '2026-03-01', category: 'ค่าโฆษณา',              channel: 'TikTok',  amount:  28400, description: 'TikTok Ads มี.ค. (ส่วนเพิ่ม)',  vendor: 'TikTok Business', invoiceRef: '', createdBy: 'Chawy' },
  // ── April 2026 ──
  { id: 'EXP-2026-O018', date: '2026-04-28', category: 'ค่าขนส่ง',              channel: 'ทั่วไป',  amount:  61200, description: 'ค่าจัดส่งรวม เม.ย. (Kerry+J&T)', vendor: 'Kerry/J&T',       invoiceRef: '', createdBy: 'จอย' },
  { id: 'EXP-2026-O019', date: '2026-04-01', category: 'ค่าโฆษณา',              channel: 'Shopee',  amount:   8100, description: 'Shopee Ads เม.ย.',              vendor: 'Shopee',          invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O020', date: '2026-04-01', category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'Shopee',  amount:   6600, description: 'GP Shopee เม.ย.',              vendor: 'Shopee',          invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O021', date: '2026-04-01', category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'TikTok',  amount:  31200, description: 'GP TikTok เม.ย. (ส่วนเพิ่ม)',  vendor: 'TikTok Shop',     invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O022', date: '2026-04-28', category: 'ค่าแรง',                channel: 'ทั่วไป',  amount:  30400, description: 'ค่าแรงพนักงานแพ็ค เม.ย.',      vendor: 'Payroll',         invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O023', date: '2026-04-01', category: 'ค่าโฆษณา',              channel: 'TikTok',  amount:  30600, description: 'TikTok Ads เม.ย. (ส่วนเพิ่ม)',  vendor: 'TikTok Business', invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O024', date: '2026-04-05', category: 'SG&A',                  channel: 'ทั่วไป',  amount:  17400, description: 'SG&A เม.ย. (ส่วนเพิ่ม)',        vendor: 'Various',         invoiceRef: '', createdBy: 'Chawy' },
  // ── May 2026 ──
  { id: 'EXP-2026-O025', date: '2026-05-28', category: 'ค่าขนส่ง',              channel: 'ทั่วไป',  amount:  20000, description: 'ค่าจัดส่งรวม พ.ค. W3-W4',       vendor: 'Kerry/J&T',       invoiceRef: '', createdBy: 'จอย' },
  { id: 'EXP-2026-O026', date: '2026-05-01', category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'TikTok',  amount:  15100, description: 'GP TikTok พ.ค. (ส่วนเพิ่ม)',   vendor: 'TikTok Shop',     invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O027', date: '2026-05-28', category: 'ค่าแรง',                channel: 'ทั่วไป',  amount:  24000, description: 'ค่าแรงพนักงานแพ็ค พ.ค.',       vendor: 'Payroll',         invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O028', date: '2026-05-01', category: 'ค่าโฆษณา',              channel: 'TikTok',  amount:  13700, description: 'TikTok Ads พ.ค. (ส่วนเพิ่ม)',   vendor: 'TikTok Business', invoiceRef: '', createdBy: 'Chawy' },
  { id: 'EXP-2026-O029', date: '2026-05-05', category: 'SG&A',                  channel: 'ทั่วไป',  amount:  12500, description: 'SG&A พ.ค. (ส่วนเพิ่ม)',         vendor: 'Various',         invoiceRef: '', createdBy: 'Chawy' },
]

const seededTiktokOrders: TiktokOrder[] = seedTiktokOrders.map(o => ({
  ...o,
  status: o.status as TiktokOrderStatus,
  imported: false,
}))

const seededManualOrders: ManualOrder[] = seedManualOrders.map(o => ({
  ...o,
  status: o.status as ManualOrderStatus,
}))

// Seed budgets for May 2026 — calibrated against actual expense seed data
// Actuals: COGS ฿478K, Ads-TT ฿31.7K, Ads-SP ฿6.5K, Fee-TT ฿24.3K, Fee-SP ฿4.2K,
//          Shipping ฿25.6K, SG&A ฿46.2K, Labor ฿24K
// Goal: realistic mix — some categories on-target, some slightly over, some under
const seedBudgets: MonthBudget[] = [
  // ─── พ.ค. 2026 ───────────────────────────────────────────────────────────
  { id: 'BUD-001', year: 2026, month: 5, category: 'COGS/วัตถุดิบ',         channel: 'ทั่วไป',  budgetAmount: 460000 }, // actual ฿478K → 104% ⚠
  { id: 'BUD-002', year: 2026, month: 5, category: 'ค่าโฆษณา',              channel: 'TikTok',  budgetAmount:  35000 }, // actual ฿31.7K → 91% ✓
  { id: 'BUD-003', year: 2026, month: 5, category: 'ค่าโฆษณา',              channel: 'Shopee',  budgetAmount:   8000 }, // actual ฿6.5K → 81% ✓
  { id: 'BUD-004', year: 2026, month: 5, category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'TikTok',  budgetAmount:  22000 }, // actual ฿24.3K → 110% ⚠
  { id: 'BUD-005', year: 2026, month: 5, category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'Shopee',  budgetAmount:   5000 }, // actual ฿4.2K → 84% ✓
  { id: 'BUD-006', year: 2026, month: 5, category: 'ค่าขนส่ง',              channel: 'ทั่วไป',  budgetAmount:  24000 }, // actual ฿25.6K → 107% ⚠
  { id: 'BUD-007', year: 2026, month: 5, category: 'SG&A',                  channel: 'ทั่วไป',  budgetAmount:  48000 }, // actual ฿46.2K → 96% ✓
  { id: 'BUD-008', year: 2026, month: 5, category: 'ค่าแรง',                channel: 'ทั่วไป',  budgetAmount:  22000 }, // actual ฿24K → 109% ⚠
  // ─── เม.ย. 2026 (reference budgets for trend) ────────────────────────────
  { id: 'BUD-101', year: 2026, month: 4, category: 'COGS/วัตถุดิบ',         channel: 'ทั่วไป',  budgetAmount: 550000 },
  { id: 'BUD-102', year: 2026, month: 4, category: 'ค่าโฆษณา',              channel: 'TikTok',  budgetAmount:  42000 },
  { id: 'BUD-103', year: 2026, month: 4, category: 'ค่าธรรมเนียมแพลตฟอร์ม', channel: 'TikTok',  budgetAmount:  28000 },
  { id: 'BUD-104', year: 2026, month: 4, category: 'ค่าขนส่ง',              channel: 'ทั่วไป',  budgetAmount:  58000 },
  { id: 'BUD-105', year: 2026, month: 4, category: 'SG&A',                  channel: 'ทั่วไป',  budgetAmount:  52000 },
  { id: 'BUD-106', year: 2026, month: 4, category: 'ค่าแรง',                channel: 'ทั่วไป',  budgetAmount:  28000 },
]

export const DEFAULT_SETTINGS: ErpSettings = {
  company: {
    name: 'Chawy Pet Food',
    taxId: '0123456789012',
    address: '123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
    phone: '02-123-4567',
    email: 'hello@chawypet.com',
    website: 'www.chawypet.com',
    currency: 'THB',
    vatRate: 7,
    invoicePrefix: 'INV-2026-',
    soPrefix: 'SO-2026-',
  },
  notifications: {
    nearExpiry: true,
    nearExpiryDays: 30,
    lowStock: true,
    latePO: true,
    newSO: true,
    paymentDue: true,
  },
  modules: {
    quotation: true,
    salesOrders: true,
    invoice: true,
    returns: true,
    purchaseReq: true,
    purchaseOrder: true,
    skuMaster: true,
    stockBalance: true,
    goodsReceive: true,
    goodsIssue: true,
    stockTransfer: true,
    stockCheck: true,
    expenses: true,
    plReport: true,
    budget: true,
    tiktokOrders: true,
    liveContent: true,
    manualOrder: true,
    tiktokCalculator: true,
    sampling: true,
    userManagement: true,
    tiktokSetup: true,
  },
  livePayroll: {
    hourlyRate: 120,
    clipBonus: 100,
  },
}

export const initialWorkflowState: ErpWorkflowState = {
  schemaVersion: SCHEMA_VERSION,
  quotations: seedQuotations,
  salesOrders: seededSalesOrders,
  invoices: seededInvoices,
  purchaseRequests: [
    {
      id: 'PR-2026-0005',
      requester: 'แพร',
      reason: 'สต็อก CAT-SAL-100 ต่ำกว่า Reorder Point — เหลือ 45 ชิ้น ต้องการเพิ่ม 300 ชิ้น',
      neededDate: '2026-05-30',
      date: '2026-05-20',
      items: [
        { sku: 'CAT-SAL-100', name: 'แซลมอนฟรีซดราย 100g', qty: 300, note: 'เร่งด่วน สต็อกใกล้หมด' },
        { sku: 'DOG-CHK-100', name: 'ไก่อกสุนัข 100g',      qty: 150, note: 'Low stock' },
      ],
      status: 'Pending Approval',
      poRef: null,
    },
    {
      id: 'PR-2026-0004',
      requester: 'แพร',
      reason: 'เตรียมสต็อกรับช่วง Mid Year Sale มิ.ย. 69',
      neededDate: '2026-05-28',
      date: '2026-05-15',
      items: [
        { sku: 'CAT-CHK-30',  name: 'ไก่อกฟรีซดราย 30g',  qty: 500, note: 'สินค้าขายดีอันดับ 1' },
        { sku: 'CAT-DUK-30',  name: 'เป็ดฟรีซดราย 30g',   qty: 400, note: '' },
        { sku: 'CAT-MIX-200', name: 'มิกซ์ฟรีซดราย 200g', qty: 200, note: 'Out of stock ด่วน' },
      ],
      status: 'Approved',
      poRef: 'PO-2026-0003',
    },
    {
      id: 'PR-2026-0003',
      requester: 'Chawy',
      reason: 'เตรียมสต็อกรับ Cat Expo 25-27 เม.ย.',
      neededDate: '2026-04-20',
      date: '2026-04-10',
      items: [
        { sku: 'CAT-CHK-30',  name: 'ไก่อกฟรีซดราย 30g',  qty: 300, note: 'บูธ Cat Expo' },
        { sku: 'CAT-SAL-100', name: 'แซลมอนฟรีซดราย 100g', qty: 200, note: 'บูธ Cat Expo' },
        { sku: 'CAT-DUK-30',  name: 'เป็ดฟรีซดราย 30g',   qty: 200, note: '' },
      ],
      status: 'Approved',
      poRef: 'PO-2026-0002',
    },
  ],
  purchaseOrders: [
    {
      id: 'PO-2026-0003',
      supplier: 'Thai Freeze Co., Ltd.',
      etaDate: '2026-05-28',
      date: '2026-05-16',
      prRef: 'PR-2026-0004',
      status: 'Sent',
      totalCost: 216000,
      items: [
        { sku: 'CAT-CHK-30',  name: 'ไก่อกฟรีซดราย 30g',  qty: 500, unitCost: 38,  receivedQty: 0 },
        { sku: 'CAT-DUK-30',  name: 'เป็ดฟรีซดราย 30g',   qty: 400, unitCost: 42,  receivedQty: 0 },
        { sku: 'CAT-MIX-200', name: 'มิกซ์ฟรีซดราย 200g', qty: 200, unitCost: 130, receivedQty: 0 },
      ],
      auditTrail: [
        { action: 'Created', by: 'Chawy', at: '2026-05-16T09:00', note: 'จาก PR-2026-0004' },
        { action: 'Sent',    by: 'Chawy', at: '2026-05-16T10:30', note: 'ส่ง PO ให้ Thai Freeze แล้ว' },
      ],
    },
    {
      id: 'PO-2026-0002',
      supplier: 'Thai Freeze Co., Ltd.',
      etaDate: '2026-04-22',
      date: '2026-04-11',
      prRef: 'PR-2026-0003',
      status: 'Completed',
      totalCost: 107600,
      items: [
        { sku: 'CAT-CHK-30',  name: 'ไก่อกฟรีซดราย 30g',  qty: 300, unitCost: 38,  receivedQty: 300 },
        { sku: 'CAT-SAL-100', name: 'แซลมอนฟรีซดราย 100g', qty: 200, unitCost: 82,  receivedQty: 200 },
        { sku: 'CAT-DUK-30',  name: 'เป็ดฟรีซดราย 30g',   qty: 200, unitCost: 42,  receivedQty: 200 },
      ],
      auditTrail: [
        { action: 'Created',   by: 'Chawy', at: '2026-04-11T10:00', note: 'จาก PR-2026-0003' },
        { action: 'Sent',      by: 'Chawy', at: '2026-04-11T11:00', note: 'ส่งให้ Thai Freeze' },
        { action: 'Completed', by: 'แพร',   at: '2026-04-21T14:00', note: 'รับครบทุก SKU' },
      ],
    },
    {
      id: 'PO-2026-0001',
      supplier: 'PackRight Solutions',
      etaDate: '2026-05-10',
      date: '2026-04-28',
      prRef: null,
      status: 'Partial Received',
      totalCost: 24500,
      items: [
        { sku: 'PKG-FOIL-A4', name: 'ถุงฟอยล์ขนาด A4 (500 ใบ)', qty: 5,  unitCost: 2800, receivedQty: 5  },
        { sku: 'PKG-ZIP-S',   name: 'ถุง Zip-lock S (1000 ใบ)',   qty: 10, unitCost: 650,  receivedQty: 5  },
      ],
      auditTrail: [
        { action: 'Created',          by: 'Chawy', at: '2026-04-28T09:00', note: 'งบบรรจุภัณฑ์ Q2' },
        { action: 'Sent',             by: 'Chawy', at: '2026-04-28T10:00', note: '' },
        { action: 'Partial Received', by: 'แพร',   at: '2026-05-08T13:30', note: 'ได้รับเฉพาะ Zip-lock S 5 ลัง รอส่งเพิ่ม' },
      ],
    },
  ],
  goodsReceives: [
    {
      id: 'GR-2026-0002',
      poRef: 'PO-2026-0002',
      receiveDate: '2026-04-21',
      items: [
        { sku: 'CAT-CHK-30',  qtyReceived: 300, lot: 'LOT-CHK-APR26', expiryDate: '2027-04-21' },
        { sku: 'CAT-SAL-100', qtyReceived: 200, lot: 'LOT-SAL-APR26', expiryDate: '2027-04-21' },
        { sku: 'CAT-DUK-30',  qtyReceived: 200, lot: 'LOT-DUK-APR26', expiryDate: '2027-04-21' },
      ],
      auditTrail: [
        { action: 'Received', by: 'แพร', at: '2026-04-21T14:00', note: 'รับครบ ตรวจสภาพสินค้าปกติ' },
      ],
    },
    {
      id: 'GR-2026-0001',
      poRef: 'PO-2026-0001',
      receiveDate: '2026-05-08',
      items: [
        { sku: 'PKG-ZIP-S', qtyReceived: 5000, lot: 'LOT-PKG-MAY26-1', expiryDate: '' },
      ],
      auditTrail: [
        { action: 'Received', by: 'แพร', at: '2026-05-08T13:30', note: 'Zip-lock S 5 ลัง รับแล้ว รอ lot 2' },
      ],
    },
  ],
  stockMovements: [],
  products: seededProducts,
  stockLots: [],
  samplingCampaigns: [],
  currentUser: { id: 'USR-001', name: 'Chawy', role: 'owner' },
  goodsIssues: [],
  stockReturns: [
    {
      id: 'RET-2026-0001',
      soRef: 'SO-2026-0408',
      sku: 'CAT-SAL-100',
      skuName: 'แซลมอนฟรีซดราย 100g',
      qty: 2,
      condition: 'เสียหาย',
      reason: 'สินค้าชำรุด',
      note: 'แพ็กเกจบุบ ลูกค้าถ่ายรูปส่งมาแล้ว',
      date: '2026-05-18',
      returnedBy: 'จอย',
      refunded: false,
      channel: 'TikTok',
      status: 'Completed',
    },
    {
      id: 'RET-2026-0002',
      soRef: 'SO-2026-0411',
      sku: 'CAT-CHK-30',
      skuName: 'ไก่อกฟรีซดราย 30g',
      qty: 1,
      condition: 'ดี',
      reason: 'ลูกค้าเปลี่ยนใจ',
      note: 'ลูกค้าสั่งผิดไซส์ ของยังซีล',
      date: '2026-05-20',
      returnedBy: 'แพร',
      refunded: false,
      channel: 'LINE',
      status: 'Completed',
    },
  ],
  stockAdjustments: [],
  stockTransfers: [],
  expenses: seedExpenses,
  budgets: seedBudgets,
  bundleComponents: [
    // BUNDLE-TRIO = CAT-CHK-30 × 2 + CAT-DUK-30 × 1
    { bundleSku: 'BUNDLE-TRIO', componentSku: 'CAT-CHK-30', qty: 2 },
    { bundleSku: 'BUNDLE-TRIO', componentSku: 'CAT-DUK-30', qty: 1 },
  ],
  tiktokOrders: seededTiktokOrders,
  liveSessions: seedLiveSessions,
  contentSchedule: [
    { id: 'CS-0001', platform: 'TikTok Live',   account: '@chawy_official', status: 'scheduled', topic: 'รีวิวอาหารใหม่ แฮมอน+ไก่',  date: '2026-05-31', startTime: '20:00', endTime: '22:30', createdAt: '2026-05-28T10:00' },
    { id: 'CS-0002', platform: 'Facebook Live', account: '@chawy_fb',       status: 'scheduled', topic: 'โปรโมชันมีดูนาน',            date: '2026-06-01', startTime: '19:30', endTime: '21:00', createdAt: '2026-05-28T10:05' },
    { id: 'CS-0003', platform: 'TikTok Live',   account: '@chawy_petfood',  status: 'draft',     topic: 'ตอบคำถามเรื่องอาหารแมว',    date: '2026-06-02', startTime: '20:00', endTime: '22:00', createdAt: '2026-05-29T09:00' },
  ] as ContentScheduleItem[],
  manualOrders: seededManualOrders,
  settings: DEFAULT_SETTINGS,
}

// ── Helpers ────────────────────────────────────────────────────────────────

function todayIso() { return new Date().toISOString().split('T')[0] }
function nowIso()   { return new Date().toISOString().slice(0, 16) }
function addDaysIso(days: number) {
  const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0]
}
function nextId(prefix: string, ids: string[]) {
  const max = ids.reduce((h, id) => {
    const n = Number(id.replace(prefix, '')); return Number.isFinite(n) ? Math.max(h, n) : h
  }, 0)
  return `${prefix}${String(max + 1).padStart(4, '0')}`
}
function lineAmount(lines: Array<{ sku: string; qty: number }>, products: Product[]) {
  return lines.reduce((s, l) => {
    const p = products.find(p => p.sku === l.sku); return s + (p ? p.price * l.qty : 0)
  }, 0)
}

// Virtual stock for a bundle: MIN(floor(component_available / qty_needed))
function calcVirtualStock(bundleSku: string, products: Product[], bundleComponents: BundleComponent[]): number {
  const comps = bundleComponents.filter(c => c.bundleSku === bundleSku)
  if (comps.length === 0) return 0
  let virtualQty = Infinity
  for (const comp of comps) {
    const prod = products.find(p => p.sku === comp.componentSku)
    if (!prod) return 0
    const available = Math.max(0, prod.stock - prod.reservedQty)
    virtualQty = Math.min(virtualQty, Math.floor(available / comp.qty))
  }
  return virtualQty === Infinity ? 0 : virtualQty
}

// Expand bundle lines into component lines for reserve/deduction
function expandBundleLines(
  lines: Array<{ sku: string; qty: number }>,
  products: Product[],
  bundleComponents: BundleComponent[]
): Array<{ sku: string; qty: number }> {
  const expanded: Array<{ sku: string; qty: number }> = []
  for (const line of lines) {
    const prod = products.find(p => p.sku === line.sku)
    if (prod?.isBundle) {
      const comps = bundleComponents.filter(c => c.bundleSku === line.sku)
      for (const comp of comps) {
        const existing = expanded.find(e => e.sku === comp.componentSku)
        if (existing) { existing.qty += comp.qty * line.qty }
        else { expanded.push({ sku: comp.componentSku, qty: comp.qty * line.qty }) }
      }
    } else {
      const existing = expanded.find(e => e.sku === line.sku)
      if (existing) { existing.qty += line.qty }
      else { expanded.push({ sku: line.sku, qty: line.qty }) }
    }
  }
  return expanded
}
function validLines(lines: Array<{ sku: string; qty: number }>): QuotationLine[] {
  return lines.filter(l => l.sku && l.qty > 0).map(l => ({ sku: l.sku, qty: l.qty, reservedQty: 0 }))
}
function audit(trail: AuditEvent[] | undefined | null, action: string, by: string, note: string): AuditEvent[] {
  return [{ action, by, at: nowIso(), note }, ...(trail || [])]
}

// Gap 1: FEFO — deduct from lots sorted by earliest expiry first
function fefoDeduct(
  lots: StockLot[], sku: string, qty: number, refDoc: string, date: string, by: string,
): { lots: StockLot[]; movements: StockMovement[] } {
  const skuLots = lots
    .filter(l => l.sku === sku && l.remainingQty > 0)
    .sort((a, b) => {
      if (!a.expiryDate && !b.expiryDate) return 0
      if (!a.expiryDate) return 1
      if (!b.expiryDate) return -1
      return a.expiryDate.localeCompare(b.expiryDate)
    })
  const movements: StockMovement[] = []
  let rem = qty
  const updated = lots.map(l => ({ ...l }))
  for (const lot of skuLots) {
    if (rem <= 0) break
    const deduct = Math.min(lot.remainingQty, rem)
    const idx = updated.findIndex(l => l.id === lot.id)
    updated[idx] = { ...updated[idx], remainingQty: updated[idx].remainingQty - deduct }
    rem -= deduct
    movements.push({
      id: `SM-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      sku, type: 'OUT', qty: deduct, refDoc, date,
      note: `FEFO: lot ${lot.lot}${lot.expiryDate ? ` exp ${lot.expiryDate}` : ''}`,
      changedBy: by,
    })
  }
  return { lots: updated, movements }
}

// Gap 2: apply/release reserve on products — bundles expand to components first
function applyReserve(
  products: Product[],
  lines: SalesOrderLine[],
  sign: 1 | -1,
  bundleComponents: BundleComponent[] = [],
): Product[] {
  const expanded = expandBundleLines(lines, products, bundleComponents)
  return products.map(p => {
    const line = expanded.find(l => l.sku === p.sku)
    if (!line) return p
    return { ...p, reservedQty: Math.max(0, p.reservedQty + sign * line.qty) }
  })
}

// ── Store factory ──────────────────────────────────────────────────────────

export function createErpWorkflowState(
  set: StoreSet, get: StoreGet, initialState = initialWorkflowState,
): ErpWorkflowStore {
  return {
    ...initialState,

    // ── Quotation ──────────────────────────────────────────────

    createQuotation(input) {
      const lines = validLines(input.lines)
      if (!input.customer || !input.validUntil || lines.length === 0)
        throw new Error('Quotation requires customer, validUntil, and at least one valid line')
      const by = get().currentUser.name
      const quotation: Quotation = {
        id: nextId('QT-2026-', get().quotations.map(q => q.id)),
        customer: input.customer, date: todayIso(), validUntil: input.validUntil,
        amount: lineAmount(lines, get().products), status: 'Draft', items: lines.length,
        soRef: null, leadSource: input.leadSource, lines, reservedStock: false,
        createdBy: by, updatedBy: by, updatedAt: nowIso(),
        auditTrail: [{ action: 'Created', by, at: nowIso(), note: 'สร้าง Draft ใบเสนอราคา' }],
      }
      set(s => ({ quotations: [quotation, ...s.quotations] }))
      return quotation
    },

    updateQuotationStatus(quotationId, status, note) {
      const q = get().quotations.find(q => q.id === quotationId)
      if (!q) return null
      const by = get().currentUser.name
      const updated: Quotation = {
        ...q, status, updatedBy: by, updatedAt: nowIso(),
        auditTrail: audit(q.auditTrail, status, by, note),
      }
      set(s => ({ quotations: s.quotations.map(q => q.id === quotationId ? updated : q) }))
      return updated
    },

    convertQuotationToSalesOrder(quotationId) {
      const state = get()
      if (state.salesOrders.find(o => o.qtRef === quotationId)) return null
      const q = state.quotations.find(q => q.id === quotationId)
      if (!q || !['Approved', 'Sent'].includes(q.status)) return null
      const by = state.currentUser.name
      const soLines: SalesOrderLine[] = q.lines.map(l => ({ sku: l.sku, qty: l.qty }))
      const so: SalesOrder = {
        id: nextId('SO-2026-', state.salesOrders.map(o => o.id)),
        customer: q.customer, date: todayIso(), amount: q.amount,
        status: 'Pending', channel: 'Manual', items: q.items,
        lines: soLines, qtRef: q.id, invRef: null, sourceRef: null,
        auditTrail: [{ action: 'Created', by, at: nowIso(), note: `แปลงจาก ${quotationId}` }],
      }
      set(s => ({
        salesOrders: [so, ...s.salesOrders],
        products: applyReserve(s.products, soLines, 1, s.bundleComponents),  // Gap 2
        quotations: s.quotations.map(q => q.id === quotationId ? {
          ...q, status: 'Converted' as QuotationStatus, soRef: so.id, reservedStock: true,
          lines: q.lines.map(l => ({ ...l, reservedQty: l.qty })),
          updatedBy: by, updatedAt: nowIso(),
          auditTrail: audit(q.auditTrail, 'Converted', by, `สร้าง ${so.id} และ Reserved Stock`),
        } : q),
      }))
      return so
    },

    // ── Sales Order ────────────────────────────────────────────

    createSalesOrder(input) {
      if (!input.customer || input.amount <= 0) throw new Error('SO requires customer and amount > 0')
      if (input.qtRef) {
        const existing = get().salesOrders.find(o => o.qtRef === input.qtRef)
        if (existing) return existing
      }
      const soLines = input.lines ?? []
      const by = get().currentUser.name
      // Gap 2: check available stock
      for (const line of soLines) {
        const p = get().products.find(p => p.sku === line.sku)
        if (!p) continue
        const available = p.stock - p.reservedQty
        if (available < line.qty)
          throw new Error(`สต็อคไม่พอ: ${p.name} มีพร้อมขาย ${available} ชิ้น`)
      }
      const so: SalesOrder = {
        id: nextId('SO-2026-', get().salesOrders.map(o => o.id)),
        customer: input.customer, date: input.date ?? todayIso(), amount: input.amount,
        status: input.status ?? 'Pending', channel: input.channel ?? 'Manual',
        items: soLines.length > 0 ? soLines.length : (input.items ?? 1),
        lines: soLines, qtRef: input.qtRef ?? null, invRef: null,
        sourceRef: input.sourceRef ?? null,
        auditTrail: [{ action: 'Created', by, at: nowIso(), note: `สร้าง SO ช่องทาง ${input.channel ?? 'Manual'}` }],
      }
      set(s => ({
        salesOrders: [so, ...s.salesOrders],
        products: soLines.length > 0 ? applyReserve(s.products, soLines, 1, s.bundleComponents) : s.products,
      }))
      return so
    },

    updateSalesOrderStatus(soId, status) {
      const state = get()
      const so = state.salesOrders.find(o => o.id === soId)
      if (!so || so.status === 'Cancelled') return null
      const by = state.currentUser.name
      const updated: SalesOrder = {
        ...so, status,
        auditTrail: audit(so.auditTrail, status, by, `เปลี่ยนสถานะเป็น ${status}`),
      }
      let updatedProducts = state.products
      // Gap 2: release reserve on cancel or complete
      if ((status === 'Cancelled' || status === 'Completed') && so.lines.length > 0)
        updatedProducts = applyReserve(state.products, so.lines, -1, state.bundleComponents)

      // Gap 1: FEFO deduction when completing an SO that has lot data
      const newMovements: StockMovement[] = []
      if (status === 'Completed' && so.lines.length > 0 && state.stockLots.length > 0) {
        let currentLots = [...state.stockLots]
        for (const line of so.lines) {
          const res = fefoDeduct(currentLots, line.sku, line.qty, soId, todayIso(), by)
          currentLots = res.lots
          newMovements.push(...res.movements)
        }
        updatedProducts = updatedProducts.map(p => {
          if (!currentLots.some(l => l.sku === p.sku)) return p
          return { ...p, stock: currentLots.filter(l => l.sku === p.sku).reduce((s, l) => s + l.remainingQty, 0) }
        })
        set(s => ({
          salesOrders: s.salesOrders.map(o => o.id === soId ? updated : o),
          products: updatedProducts, stockLots: currentLots,
          stockMovements: [...newMovements, ...s.stockMovements],
        }))
        return updated
      }

      set(s => ({ salesOrders: s.salesOrders.map(o => o.id === soId ? updated : o), products: updatedProducts }))
      return updated
    },

    // ── Invoice ────────────────────────────────────────────────

    createInvoice(input) {
      if (!input.customer || input.amount <= 0) throw new Error('Invoice requires customer and amount > 0')
      if (input.soRef) {
        const existing = get().invoices.find(inv => inv.soRef === input.soRef)
        if (existing) return existing
      }
      const by = get().currentUser.name
      const inv: Invoice = {
        id: nextId('INV-2026-', get().invoices.map(i => i.id)),
        soRef: input.soRef || `SO-MANUAL-${Date.now()}`,
        customer: input.customer, issueDate: input.issueDate ?? todayIso(),
        dueDate: input.dueDate ?? addDaysIso(14), amount: input.amount, paid: 0,
        status: input.status ?? 'Unpaid',
        auditTrail: [{ action: 'Created', by, at: nowIso(), note: 'สร้างใบแจ้งหนี้' }],
      }
      set(s => ({ invoices: [inv, ...s.invoices] }))
      return inv
    },

    createInvoiceFromSO(salesOrderId) {
      const state = get()
      const so = state.salesOrders.find(o => o.id === salesOrderId)
      if (!so || so.status !== 'Completed') return null
      const existing = state.invoices.find(inv => inv.soRef === salesOrderId)
      if (existing) return existing
      const inv = get().createInvoice({ soRef: so.id, customer: so.customer, amount: so.amount })
      set(s => ({ salesOrders: s.salesOrders.map(o => o.id === salesOrderId ? { ...o, invRef: inv.id } : o) }))
      return inv
    },

    recordPayment(invoiceId, amount) {
      const state = get()
      const inv = state.invoices.find(i => i.id === invoiceId)
      if (!inv || inv.status === 'Paid' || amount <= 0) return null
      const newPaid = Math.min(inv.paid + amount, inv.amount)
      const newStatus: InvoiceStatus = newPaid >= inv.amount ? 'Paid' : 'Partial'
      const by = state.currentUser.name
      const updated: Invoice = {
        ...inv, paid: newPaid, status: newStatus,
        auditTrail: audit(inv.auditTrail, 'Payment', by, `รับชำระ ฿${amount.toLocaleString()}`),
      }
      set(s => ({ invoices: s.invoices.map(i => i.id === invoiceId ? updated : i) }))
      return updated
    },

    // ── Purchase Request ───────────────────────────────────────

    createPurchaseRequest(input) {
      if (!input.requester || !input.neededDate || input.items.length === 0)
        throw new Error('PR requires requester, neededDate, and at least one item')
      if (input.items.some(i => i.qty <= 0)) throw new Error('All PR items must have qty > 0')
      const pr: PurchaseRequest = {
        id: nextId('PR-2026-', get().purchaseRequests.map(p => p.id)),
        requester: input.requester, reason: input.reason, neededDate: input.neededDate,
        date: todayIso(), items: input.items.map(i => ({ ...i })), status: 'Draft', poRef: null,
      }
      set(s => ({ purchaseRequests: [pr, ...s.purchaseRequests] }))
      return pr
    },

    updatePRStatus(prId, status) {
      const pr = get().purchaseRequests.find(p => p.id === prId)
      if (!pr) return null
      const updated: PurchaseRequest = { ...pr, status }
      set(s => ({ purchaseRequests: s.purchaseRequests.map(p => p.id === prId ? updated : p) }))
      return updated
    },

    convertPRtoPO(prId, supplier, etaDate, itemCosts) {
      const state = get()
      const pr = state.purchaseRequests.find(p => p.id === prId)
      if (!pr || pr.status !== 'Approved' || pr.poRef) return null
      const by = state.currentUser.name
      const poItems: PurchaseOrderItem[] = pr.items.map(i => ({ ...i, unitCost: itemCosts[i.sku] ?? 0, receivedQty: 0 }))
      const po: PurchaseOrder = {
        id: nextId('PO-2026-', state.purchaseOrders.map(p => p.id)),
        supplier, etaDate, date: todayIso(), items: poItems, status: 'Draft', prRef: prId,
        totalCost: poItems.reduce((s, i) => s + i.qty * i.unitCost, 0),
        auditTrail: [{ action: 'Created', by, at: nowIso(), note: `แปลงจาก ${prId}` }],
      }
      set(s => ({
        purchaseOrders: [po, ...s.purchaseOrders],
        purchaseRequests: s.purchaseRequests.map(p => p.id === prId ? { ...p, poRef: po.id } : p),
      }))
      return po
    },

    createPurchaseOrder(input) {
      if (!input.supplier || !input.etaDate || input.items.length === 0)
        throw new Error('PO requires supplier, etaDate, and at least one item')
      const by = get().currentUser.name
      const poItems: PurchaseOrderItem[] = input.items.map(i => ({ ...i, receivedQty: 0 }))
      const po: PurchaseOrder = {
        id: nextId('PO-2026-', get().purchaseOrders.map(p => p.id)),
        supplier: input.supplier, etaDate: input.etaDate, date: todayIso(),
        items: poItems, status: 'Draft', prRef: input.prRef ?? null,
        totalCost: poItems.reduce((s, i) => s + i.qty * i.unitCost, 0),
        auditTrail: [{ action: 'Created', by, at: nowIso(), note: 'สร้าง Purchase Order' }],
      }
      set(s => ({ purchaseOrders: [po, ...s.purchaseOrders] }))
      return po
    },

    updatePOStatus(poId, status) {
      const state = get()
      const po = state.purchaseOrders.find(p => p.id === poId)
      if (!po) return null
      const by = state.currentUser.name
      const updated: PurchaseOrder = {
        ...po, status, auditTrail: audit(po.auditTrail, status, by, `เปลี่ยนสถานะเป็น ${status}`),
      }
      set(s => ({ purchaseOrders: s.purchaseOrders.map(p => p.id === poId ? updated : p) }))
      return updated
    },

    // ── Goods Receive ──────────────────────────────────────────

    createGoodsReceive(input) {
      const state = get()
      const po = state.purchaseOrders.find(p => p.id === input.poRef)
      if (!po || !['Sent', 'Partial Received'].includes(po.status)) return null
      if (!input.receiveDate || input.items.length === 0) return null
      for (const grItem of input.items) {
        if (grItem.qtyReceived <= 0) return null
        const poItem = po.items.find(i => i.sku === grItem.sku)
        if (!poItem || grItem.qtyReceived > poItem.qty - poItem.receivedQty) return null
      }
      const by = state.currentUser.name
      const totalLanded = (input.landedCosts || [])
        .filter(lc => lc.allocatable)
        .reduce((sum, lc) => sum + lc.amount, 0)

      const totalValue = input.items.reduce((sum, item) => {
        const poItem = po.items.find(i => i.sku === item.sku)
        return sum + item.qtyReceived * (poItem?.unitCost ?? 0)
      }, 0)

      const grItems = input.items.map(item => {
        const poItem = po.items.find(i => i.sku === item.sku)
        const unitCost = poItem?.unitCost ?? 0
        const lineValue = item.qtyReceived * unitCost
        const allocatedFreight = totalValue > 0 ? totalLanded * (lineValue / totalValue) : 0
        const landedUnitCost = (lineValue + allocatedFreight) / item.qtyReceived
        return {
          sku: item.sku,
          qtyReceived: item.qtyReceived,
          lot: item.lot,
          expiryDate: item.expiryDate,
          landedUnitCost,
        }
      })

      const gr: GoodsReceive = {
        id: nextId('GR-2026-', state.goodsReceives.map(g => g.id)),
        poRef: input.poRef, receiveDate: input.receiveDate,
        items: grItems,
        landedCosts: input.landedCosts || [],
        auditTrail: [{ action: 'Created', by, at: nowIso(), note: `รับสินค้าจาก ${po.supplier}` }],
      }
      const updatedPoItems = po.items.map(poItem => {
        const g = input.items.find(g => g.sku === poItem.sku)
        return g ? { ...poItem, receivedQty: poItem.receivedQty + g.qtyReceived } : poItem
      })
      const allDone = updatedPoItems.every(i => i.receivedQty >= i.qty)
      const newPoStatus: PurchaseOrderStatus = allDone ? 'Completed' : 'Partial Received'
      // Gap 1: create StockLots with expiryDate
      const newLots: StockLot[] = input.items.map((g, idx) => ({
        id: `LOT-${Date.now()}-${idx}-${g.sku}`,
        sku: g.sku, lot: g.lot, qty: g.qtyReceived, remainingQty: g.qtyReceived,
        expiryDate: g.expiryDate, receivedDate: input.receiveDate, grRef: gr.id, poRef: input.poRef,
      }))
      // Gap 9: changedBy in movements
      const newMovements: StockMovement[] = input.items.map(g => ({
        id: `SM-${Date.now()}-${g.sku}`,
        sku: g.sku, type: 'IN' as StockMovementType, qty: g.qtyReceived, refDoc: gr.id,
        date: input.receiveDate,
        note: `รับจาก ${po.supplier} (${input.poRef}) lot ${g.lot}${g.expiryDate ? ` exp ${g.expiryDate}` : ''}`,
        changedBy: by,
      }))
      set(s => ({
        goodsReceives: [gr, ...s.goodsReceives],
        purchaseOrders: s.purchaseOrders.map(p => p.id === input.poRef ? {
          ...p, items: updatedPoItems, status: newPoStatus,
          auditTrail: audit(p.auditTrail, newPoStatus, by, `รับสินค้า ${gr.id}`),
        } : p),
        stockMovements: [...newMovements, ...s.stockMovements],
        stockLots: [...newLots, ...s.stockLots],
        products: s.products.map(p => {
          const g = grItems.find(item => item.sku === p.sku)
          if (!g) return p
          const oldStock = p.stock
          const landedUnitCost = g.landedUnitCost || 0
          const newCost = oldStock + g.qtyReceived > 0
            ? ((oldStock * p.cost) + (g.qtyReceived * landedUnitCost)) / (oldStock + g.qtyReceived)
            : p.cost
          return { ...p, stock: p.stock + g.qtyReceived, cost: newCost }
        }),
      }))
      return gr
    },

    // ── Sampling (Gap 5) ───────────────────────────────────────

    createSamplingCampaign(input) {
      const campaign: SamplingCampaign = {
        id: nextId('SAMP-', get().samplingCampaigns.map(c => c.id)),
        name: input.name, sku: input.sku, skuName: input.skuName,
        targetQty: input.targetQty, givenQty: 0, note: input.note,
        startDate: input.startDate, endDate: input.endDate, status: 'Active', recipients: [],
      }
      set(s => ({ samplingCampaigns: [campaign, ...s.samplingCampaigns] }))
      return campaign
    },

    addSamplingRecipient(input) {
      const c = get().samplingCampaigns.find(c => c.id === input.campaignId)
      if (!c || c.status !== 'Active') return null
      const recipient: SamplingRecipient = {
        id: `RCP-${Date.now()}`, name: input.name, contact: input.contact,
        qtyGiven: input.qtyGiven, date: input.date,
        feedback: input.feedback ?? '', converted: input.converted ?? false,
      }
      const updated: SamplingCampaign = {
        ...c, givenQty: c.givenQty + input.qtyGiven, recipients: [...c.recipients, recipient],
      }
      set(s => ({ samplingCampaigns: s.samplingCampaigns.map(c => c.id === input.campaignId ? updated : c) }))
      return updated
    },

    updateSamplingStatus(id, status) {
      const c = get().samplingCampaigns.find(c => c.id === id)
      if (!c) return null
      const updated: SamplingCampaign = { ...c, status }
      set(s => ({ samplingCampaigns: s.samplingCampaigns.map(c => c.id === id ? updated : c) }))
      return updated
    },

    // ── User (Gap 7) ───────────────────────────────────────────

    setCurrentUser(user) { set({ currentUser: user }) },

    // ── Goods Issue ────────────────────────────────────────────

    createGoodsIssue(input) {
      const { products, stockLots, bundleComponents } = get()
      const product = products.find(p => p.sku === input.sku)
      if (!product) return null
      const id = nextId('GI-2026-', get().goodsIssues.map(g => g.id))
      const by = get().currentUser.name
      const issue: GoodsIssue = {
        id, sku: input.sku, skuName: product.name,
        qty: input.qty, reason: input.reason as GoodsIssueReason,
        note: input.note, date: todayIso(), issuedBy: by,
      }

      if (product.isBundle) {
        // Bundle: validate and deduct each component
        const comps = bundleComponents.filter(c => c.bundleSku === input.sku)
        for (const comp of comps) {
          const cp = products.find(p => p.sku === comp.componentSku)
          const need = comp.qty * input.qty
          if (!cp || cp.stock - cp.reservedQty < need) return null
        }
        const componentMovements: StockMovement[] = comps.map(comp => ({
          id: `SM-${Date.now()}-${comp.componentSku}`, sku: comp.componentSku,
          type: 'OUT' as StockMovementType, qty: comp.qty * input.qty,
          refDoc: id, date: todayIso(),
          note: `Bundle GI: ${input.sku} × ${input.qty} → ${comp.componentSku}`,
          changedBy: by,
        }))
        set(s => ({
          goodsIssues: [issue, ...s.goodsIssues],
          stockMovements: [...componentMovements, ...s.stockMovements],
          products: s.products.map(p => {
            const comp = comps.find(c => c.componentSku === p.sku)
            if (!comp) return p
            return { ...p, stock: Math.max(0, p.stock - comp.qty * input.qty) }
          }),
        }))
        return issue
      }

      // Regular (non-bundle) product
      const available = product.stock - product.reservedQty
      if (input.qty > available) return null
      const movement: StockMovement = {
        id: `SM-${Date.now()}`, sku: input.sku, type: 'OUT' as StockMovementType,
        qty: input.qty, refDoc: id, date: todayIso(), note: input.reason, changedBy: by,
      }
      const { lots: updatedLots } = fefoDeduct(stockLots, input.sku, input.qty, id, todayIso(), by)
      set(s => ({
        goodsIssues: [issue, ...s.goodsIssues],
        stockMovements: [movement, ...s.stockMovements],
        stockLots: updatedLots,
        products: s.products.map(p => p.sku === input.sku
          ? { ...p, stock: Math.max(0, p.stock - input.qty) } : p),
      }))
      return issue
    },

    // ── Returns ────────────────────────────────────────────────

    createStockReturn(input) {
      const product = get().products.find(p => p.sku === input.sku)
      const skuName = product?.name ?? input.sku
      const by = get().currentUser.name
      const id = nextId('RET-2026-', get().stockReturns.map(r => r.id))

      let channel = input.channel || 'Manual'
      if (input.soRef) {
        const so = get().salesOrders.find(o => o.id === input.soRef)
        if (so) channel = so.channel
      }

      const ret: StockReturn = {
        id, soRef: input.soRef, sku: input.sku, skuName,
        qty: input.qty, condition: input.condition as ReturnCondition,
        reason: input.reason as ReturnReason,
        note: input.note, date: todayIso(), returnedBy: by, refunded: false,
        channel, status: 'Pending',
      }
      set(s => ({
        stockReturns: [ret, ...s.stockReturns],
      }))
      return ret
    },

    updateStockReturnStatus(id, status) {
      const by = get().currentUser.name
      const ret = get().stockReturns.find(r => r.id === id)
      if (!ret || ret.status !== 'Pending') return null

      const updated: StockReturn = { ...ret, status }
      const newMovements: StockMovement[] = []

      let updatedProducts = get().products

      if (status === 'Completed') {
        if (ret.condition === 'ดี') {
          updatedProducts = get().products.map(p =>
            p.sku === ret.sku ? { ...p, stock: p.stock + ret.qty } : p
          )
          newMovements.push({
            id: `SM-${Date.now()}-${ret.sku}`,
            sku: ret.sku,
            type: 'IN',
            qty: ret.qty,
            refDoc: id,
            date: todayIso(),
            note: `รับคืน: ${ret.reason} - สภาพดี`,
            changedBy: by,
          })
        } else if (ret.condition === 'เสียหาย') {
          // Do not add stock or create movements for damaged return
        }
      }

      set(s => ({
        stockReturns: s.stockReturns.map(r => r.id === id ? updated : r),
        stockMovements: [...newMovements, ...s.stockMovements],
        products: updatedProducts,
      }))

      return updated
    },

    // ── Stock Adjustment (physical count) ──────────────────────

    createStockAdjustment(input) {
      const { products } = get()
      const by = get().currentUser.name
      const id = nextId('ADJ-2026-', get().stockAdjustments.map(a => a.id))
      const items: StockAdjustmentItem[] = input.items.map(i => {
        const p = products.find(p => p.sku === i.sku)!
        return { sku: i.sku, skuName: p?.name ?? i.sku, systemQty: p?.stock ?? 0, actualQty: i.actualQty, variance: i.actualQty - (p?.stock ?? 0) }
      })
      const adj: StockAdjustment = { id, date: todayIso(), checkedBy: by, note: input.note, items }
      const newMovements: StockMovement[] = items
        .filter(i => i.variance !== 0)
        .map(i => ({
          id: `SM-${Date.now()}-${i.sku}`, sku: i.sku,
          type: (i.variance > 0 ? 'IN' : 'OUT') as StockMovementType,
          qty: Math.abs(i.variance), refDoc: id, date: todayIso(),
          note: `ปรับสต๊อก: นับจริง ${i.actualQty}`, changedBy: by,
        }))
      set(s => ({
        stockAdjustments: [adj, ...s.stockAdjustments],
        stockMovements: [...newMovements, ...s.stockMovements],
        products: s.products.map(p => {
          const item = items.find(i => i.sku === p.sku)
          return item ? { ...p, stock: item.actualQty } : p
        }),
      }))
      return adj
    },

    // ── Finance ────────────────────────────────────────────────

    createExpense(input) {
      const by = get().currentUser.name
      const id = nextId('EXP-2026-', get().expenses.map(e => e.id))
      const expense: Expense = {
        id, date: input.date ?? todayIso(),
        category: input.category as ExpenseCategory,
        channel: input.channel as ExpenseChannel,
        amount: input.amount, description: input.description,
        vendor: input.vendor, invoiceRef: input.invoiceRef ?? '',
        createdBy: by,
      }
      set(s => ({ expenses: [expense, ...s.expenses] }))
      return expense
    },

    upsertBudget(input) {
      const existing = get().budgets.find(b =>
        b.year === input.year && b.month === input.month &&
        b.category === input.category && b.channel === input.channel
      )
      if (existing) {
        const updated: MonthBudget = { ...existing, budgetAmount: input.budgetAmount }
        set(s => ({ budgets: s.budgets.map(b => b.id === existing.id ? updated : b) }))
        return updated
      }
      const id = nextId('BUD-', get().budgets.map(b => b.id))
      const budget: MonthBudget = { id, ...input }
      set(s => ({ budgets: [budget, ...s.budgets] }))
      return budget
    },

    // ── Stock Transfer ─────────────────────────────────────────

    createStockTransfer(input) {
      const product = get().products.find(p => p.sku === input.sku)
      if (!product || product.stock < input.qty) return null
      const by = get().currentUser.name
      const id = nextId('TRF-2026-', get().stockTransfers.map(t => t.id))
      const transfer: StockTransfer = {
        id, sku: input.sku, skuName: product.name, qty: input.qty,
        fromLocation: input.fromLocation, toLocation: input.toLocation,
        note: input.note, date: todayIso(), transferredBy: by,
      }
      const movement: StockMovement = {
        id: `SM-${Date.now()}`, sku: input.sku, type: 'OUT' as StockMovementType,
        qty: input.qty, refDoc: id, date: todayIso(),
        note: `โอนย้าย ${input.fromLocation} → ${input.toLocation}`, changedBy: by,
      }
      set(s => ({
        stockTransfers: [transfer, ...s.stockTransfers],
        stockMovements: [movement, ...s.stockMovements],
      }))
      return transfer
    },

    // ── SKU / Product Master ───────────────────────────────────

    addProduct(input) {
      const exists = get().products.find(p => p.sku === input.sku)
      if (exists) throw new Error(`SKU "${input.sku}" already exists`)
      const product: Product = {
        sku: input.sku,
        name: input.name,
        type: input.type as ProductCategory,
        barcode: input.barcode ?? '',
        weightGrams: input.weightGrams ?? 0,
        retailPrice: input.retailPrice,
        wholesalePrice: input.wholesalePrice ?? input.retailPrice,
        price: input.retailPrice,
        cost: input.cost,
        stock: 0,
        reorder: input.reorder ?? 0,
        reservedQty: 0,
        isBundle: input.isBundle ?? false,
        isActive: true,
        note: input.note ?? '',
      }
      set(s => ({ products: [...s.products, product] }))
      return product
    },

    updateProduct(input) {
      const existing = get().products.find(p => p.sku === input.sku)
      if (!existing) return null
      const updated: Product = {
        ...existing,
        ...input,
        // keep price alias in sync
        price: input.retailPrice ?? existing.retailPrice,
      }
      set(s => ({ products: s.products.map(p => p.sku === input.sku ? updated : p) }))
      return updated
    },

    deleteProduct(sku) {
      const existing = get().products.find(p => p.sku === sku)
      if (!existing) return false
      set(s => ({
        products: s.products.filter(p => p.sku !== sku),
        bundleComponents: s.bundleComponents.filter(c => c.bundleSku !== sku && c.componentSku !== sku),
      }))
      return true
    },

    setBundleComponents(input) {
      const comps: BundleComponent[] = input.components.map(c => ({
        bundleSku: input.bundleSku,
        componentSku: c.componentSku,
        qty: c.qty,
      }))
      set(s => ({
        bundleComponents: [
          ...s.bundleComponents.filter(c => c.bundleSku !== input.bundleSku),
          ...comps,
        ],
      }))
      return comps
    },

    calcBundleVirtualStock(bundleSku) {
      const { products, bundleComponents } = get()
      return calcVirtualStock(bundleSku, products, bundleComponents)
    },

    // ── TikTok Orders ──────────────────────────────────────────

    addTiktokOrder(input) {
      const order: TiktokOrder = {
        id: input.id ?? `TT-${Date.now()}`,
        date: input.date ?? todayIso(),
        product: input.product,
        sku: input.sku,
        qty: input.qty,
        amount: input.amount,
        status: input.status ?? 'AWAITING_SHIPMENT',
        stockDeducted: false,
        imported: false,
      }
      set(s => ({ tiktokOrders: [order, ...s.tiktokOrders] }))
      return order
    },

    markTiktokOrderImported(id) {
      set(s => ({
        tiktokOrders: s.tiktokOrders.map(o => o.id === id ? { ...o, imported: true } : o),
      }))
    },

    applyTiktokSettlement(input) {
      const order = get().tiktokOrders.find(o => o.id === input.orderId)
      if (!order) return null
      const updated: TiktokOrder = {
        ...order,
        netRevenue: input.netRevenue,
        platformFee: input.platformFee,
        settled: true,
        settlementRef: input.settlementRef,
      }
      set(s => ({ tiktokOrders: s.tiktokOrders.map(o => o.id === input.orderId ? updated : o) }))
      return updated
    },

    // ── Live Sessions ──────────────────────────────────────────

    addLiveSession(input) {
      const by = get().currentUser.name
      const session: LiveSession = {
        ...input,
        id: nextId('LIVE-2026-', get().liveSessions.map(s => s.id)),
        status: 'Pending',
        approved_by: null,
        createdBy: by,
        updatedBy: by,
        updatedAt: nowIso(),
        auditTrail: [{ action: 'Created', by, at: nowIso(), note: 'บันทึก Live session ใหม่' }],
      }
      set(s => ({ liveSessions: [session, ...s.liveSessions] }))
      return session
    },

    updateLiveSessionStatus(id, status) {
      const session = get().liveSessions.find(s => s.id === id)
      if (!session) return null
      const by = get().currentUser.name
      const updated: LiveSession = {
        ...session,
        status,
        approved_by: status === 'Manager_Approved' ? by : session.approved_by,
        updatedBy: by,
        updatedAt: nowIso(),
        auditTrail: audit(session.auditTrail, status, by, ''),
      }
      set(s => ({ liveSessions: s.liveSessions.map(ls => ls.id === id ? updated : ls) }))
      return updated
    },

    // ── Content Schedule ───────────────────────────────────────

    addContentSchedule(input) {
      const item: ContentScheduleItem = {
        ...input,
        id: nextId('CS-', get().contentSchedule.map(c => c.id)),
        createdAt: nowIso(),
      }
      set(s => ({ contentSchedule: [...s.contentSchedule, item] }))
      return item
    },

    updateContentScheduleStatus(id, status) {
      const item = get().contentSchedule.find(c => c.id === id)
      if (!item) return null
      const updated = { ...item, status }
      set(s => ({ contentSchedule: s.contentSchedule.map(c => c.id === id ? updated : c) }))
      return updated
    },

    // ── Manual Orders ──────────────────────────────────────────

    addManualOrder(input) {
      const order: ManualOrder = {
        id: nextId('MO-2026-', get().manualOrders.map(o => o.id)),
        customer: input.customer,
        phone: input.phone,
        channel: input.channel,
        date: todayIso(),
        amount: input.amount,
        status: 'Pending',
        items: input.items ?? 1,
        notes: input.notes ?? '',
      }
      set(s => ({ manualOrders: [order, ...s.manualOrders] }))
      return order
    },

    updateSettings(patch) {
      set(s => ({ settings: { ...s.settings, ...patch } }))
    },
  }
}

export function createErpWorkflowStore(initialState = initialWorkflowState) {
  return createStore<ErpWorkflowStore>()((set, get) => createErpWorkflowState(set, get, initialState))
}
