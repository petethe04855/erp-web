import type { Metadata } from "next";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";
export const metadata: Metadata = {
  title: "Chawy ERP · Workspace",
  description: "Chawy ERP operations workspace",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
