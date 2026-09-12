export interface ProductRecord {
  id: number;
  sku: string;
  name: string;
  type: string;
  barcode: string;
  baseUnit: string;
  retailPrice: number;
  wholesalePrice: number;
  cost: number;
  stock: number;
  reservedQty: number;
  reorder: number;
  isBundle: boolean;
  isActive: boolean;
  available: number;
  bundleAvailable?: number;
  accessories?: Array<{
    id: number;
    sku: string;
    accessorySku: string;
    quantity: number;
    note?: string;
    name?: string;
  }>;
  image?: string;
}

export interface OrderRecord {
  id: number;
  code: string;
  customer: string;
  date: string;
  amount: number;
  status: string;
  channel: string;
  items: number;
  invRef: string;
}

export interface InvoiceRecord {
  id: number;
  code: string;
  soRef: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  vatAmount: number;
  amount: number;
  paid: number;
  balance?: number;
  isOverdue?: boolean;
  status: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  taxId: string;
  address: string;
  logo?: string;
}

export interface QuotationRecord {
  id: number;
  code: string;
  customer: string;
  date: string;
  validUntil: string;
  leadSource?: string;
  amount: number;
  isExpired?: boolean;
  status: string;
}

export interface PurchaseRecord {
  id: number;
  code: string;
  supplier: string;
  date: string;
  etaDate: string;
  totalCost: number;
  status: string;
}

export interface ReceiptRecord {
  id: number;
  code: string;
  poRef: string;
  receiveDate: string;
  note: string;
}

export interface IssueRecord {
  id: number;
  code: string;
  sku: string;
  skuName: string;
  qty: number;
  reason: string;
  date: string;
  channel: string;
  orderRef: string;
}
