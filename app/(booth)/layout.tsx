import type { Metadata } from "next";
import { SessionGuard } from "@/features/auth/components/SessionGuard";

export const metadata: Metadata = {
  title: "CHAWY บูธ",
  description: "ขายหน้าบูธ ตัดสต็อกจาก Inventory",
};

/**
 * The booth screen runs on its own, like erp-expense-upload: no ERP sidebar
 * or header, full screen for a tablet at the booth. It stays in this app and
 * on this port, and still needs an ERP login (owner or sales).
 */
export default function BoothLayout({ children }: { children: React.ReactNode }) {
  return <SessionGuard>{children}</SessionGuard>;
}
