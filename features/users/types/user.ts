// Must mirror backend isValidRole() (erp-api-v2 internal/usecase/auth):
// there is no "admin" role in this system.
export type UserRole = "owner" | "sales" | "warehouse" | "accountant" | "live";

export interface AppUser {
  id: number | string;
  email: string;
  firstname?: string;
  lastname?: string;
  name?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string | null;
  created_at?: string;
}

export interface UserFilterState {
  search: string;
  role: string;
  status: string;
}

export interface CreateUserDTO {
  email: string;
  password?: string;
  firstname?: string;
  lastname?: string;
  name?: string;
  role: UserRole;
}


export interface UpdateUserDTO {
  email?: string;
  password?: string;
  firstname?: string;
  lastname?: string;
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

export const ROLE_CONFIG: Record<
  UserRole,
  { label: string; desc: string; color: string; badgeClass: string }
> = {
  owner: {
    label: "เจ้าของกิจการ (Owner)",
    desc: "เข้าถึงได้ทุกโมดูลและจัดการระบบทั้งหมด",
    color: "amber",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  },
  accountant: {
    label: "ฝ่ายบัญชี (Accountant)",
    desc: "จัดการใบแจ้งหนี้ ชำระเงิน และรายงานการเงิน",
    color: "emerald",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  },
  sales: {
    label: "ฝ่ายขาย (Sales)",
    desc: "จัดการคำสั่งซื้อ ใบเสนอราคา และข้อมูลลูกค้า",
    color: "blue",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  },
  warehouse: {
    label: "ฝ่ายคลังสินค้า (Warehouse)",
    desc: "จัดการสต็อกสินค้า รับเข้า-เบิกออก และจัดส่ง",
    color: "teal",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
  },
  live: {
    label: "พนักงานไลฟ์ (Live Streamer)",
    desc: "บันทึกผลการไลฟ์ จัดการตารางคอนเทนต์ และดูรายการไลฟ์",
    color: "purple",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
  },
};
