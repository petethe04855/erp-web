import type { Metadata } from "next";
import { SessionGuard } from "@/features/auth/components/SessionGuard";

export const metadata: Metadata = {
  title: "CHAWY บูธ",
  description: "ขายหน้าบูธ ตัดสต็อกจาก Inventory",
};

/**
 * The booth screen runs on its own, like erp-expense-upload: no ERP sidebar
 * or header, full screen for a tablet at the booth. Shares the main ERP
 * session via SessionGuard so users don't have to log in twice.
 */
export default function BoothLayout({ children }: { children: React.ReactNode }) {
  return <SessionGuard>{children}</SessionGuard>;
}
