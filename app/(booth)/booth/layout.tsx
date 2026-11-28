import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CHAWY นับของออก",
  description: "นับของที่หยิบออกจากสต็อกรายวัน ตัดตาม LOT แบบ FEFO",
};

export default function StockOutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
