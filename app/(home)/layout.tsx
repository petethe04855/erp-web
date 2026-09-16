import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SessionGuard } from "@/features/auth/components/SessionGuard";
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </SessionGuard>
  );
}
