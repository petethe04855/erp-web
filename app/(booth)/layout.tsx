import type { Metadata } from "next";
import { BoothSessionGuard } from "@/features/booth/components/BoothSessionGuard";

export const metadata: Metadata = {
  title: "CHAWY บูธ",
  description: "ขายหน้าบูธ ตัดสต็อกจาก Inventory",
};

/**
 * The booth screen runs on its own, like erp-expense-upload: no ERP sidebar
 * or header, full screen for a tablet at the booth. Uses an isolated booth
 * session so logging in/out here never affects the main ERP session.
 */
export default function BoothLayout({ children }: { children: React.ReactNode }) {
  return <BoothSessionGuard>{children}</BoothSessionGuard>;
}
