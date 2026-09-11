export interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
  is_active: boolean;
  opening_balance: number;
}

export interface JournalLine {
  id: number;
  journal_entry_id: number;
  account_id: number;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  sku?: string;
  lot?: string;
  channel?: string;
}

export interface JournalEntry {
  id: number;
  code: string;
  date: string;
  source_type: string;
  source_id: number;
  source_ref: string;
  description: string;
  status: string;
  created_by: string;
  posted_at: string;
  lines: JournalLine[];
}

export type ExpenseCategory =
  | "ค่าโฆษณา"
  | "ค่าธรรมเนียมแพลตฟอร์ม"
  | "ต้นทุนขาย/วัตถุดิบ"
  | "ค่าใช้จ่ายในการบริหาร"
  | "ค่าขนส่ง"
  | "ค่าแรง/เงินเดือน"
  | "อื่นๆ";

export type ExpenseChannel =
  | "TikTok"
  | "Shopee"
  | "LINE"
  | "Manual"
  | "ทั่วไป";

export interface Expense {
  id: number;
  code: string;
  date: string;
  category: ExpenseCategory;
  channel: ExpenseChannel;
  amount: number;
  vendor: string;
  invoice_ref: string;
  description: string;
  created_by: string;
  created_at?: string;
}

export interface CreateExpenseDTO {
  date: string;
  category: ExpenseCategory;
  channel: ExpenseChannel;
  amount: number;
  vendor: string;
  invoice_ref?: string;
  description?: string;
}

export interface UpdateExpenseDTO extends CreateExpenseDTO {}

export interface JournalQueryParams {
  from?: string;
  to?: string;
  source_type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ExpenseQueryParams {
  from?: string;
  to?: string;
  category?: string;
  channel?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GeneralLedgerRow {
  date: string;
  journal_code: string;
  source_type: string;
  source_ref: string;
  account_code: string;
  account_name: string;
  description: string;
  sku?: string;
  lot?: string;
  channel?: string;
  debit: number;
  credit: number;
  opening_balance: number;
  running_balance: number;
}

export interface TrialBalanceRow {
  account_code: string;
  account_name: string;
  account_type: string;
  opening_debit: number;
  opening_credit: number;
  debit: number;
  credit: number;
  ending_debit: number;
  ending_credit: number;
}

export interface ProfitAndLossReport {
  from: string;
  to: string;
  revenue: number;
  cogs: number;
  gross_profit: number;
  operating_expense: number;
  net_profit: number;
  revenue_by_channel: Record<string, number>;
  expense_by_category: Record<string, number>;
}

export interface RevenueByChannelItem {
  channel: string;
  amount: number;
  percentage: number;
}

export interface RevenueByChannelReport {
  from: string;
  to: string;
  total: number;
  by_channel: RevenueByChannelItem[];
}
