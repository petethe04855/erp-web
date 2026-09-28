"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthStore } from "@/stores/authStore";
import { useLiveSessions } from "@/features/tiktok/live/hooks/useLive";
import type { LiveSession } from "@/features/tiktok/live/types/live";
import { LiveStats } from "@/features/tiktok/live/components/LiveStats";
import { LiveSessionTable } from "@/features/tiktok/live/components/LiveSessionTable";
import { LiveCheckoutModal } from "@/features/tiktok/live/components/LiveCheckoutModal";
import { LivePayrollTable } from "@/features/tiktok/live/components/LivePayrollTable";
import { Plus, Filter } from "lucide-react";

export default function MyLivePage() {
  const { user } = useAuthStore();
  const userRole = (user?.role || "sales").toLowerCase();

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");

  // Modal states
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);

  // Queries (filter sessions for current staff)
  const currentStaffID = user?.id ? Number(user.id) : undefined;
  const { data: sessions = [], isLoading: isSessionsLoading } = useLiveSessions({
    month: selectedMonth,
    status: statusFilter !== "all" ? statusFilter : undefined,
    platform: platformFilter !== "all" ? platformFilter : undefined,
    staff_id: currentStaffID,
  });

  const handleOpenCheckout = () => {
    setEditingSession(null);
    setCheckoutModalOpen(true);
  };

  const handleEditSession = (session: LiveSession) => {
    setEditingSession(session);
    setCheckoutModalOpen(true);
  };

  return (
    <PageContainer>
      <PageHeader
        title="บันทึกและรายได้ของฉัน (My Live & Earnings)"
        description="บันทึกผลการขึ้นไลฟ์ ตรวจสอบประวัติรอบไลฟ์ และดูสรุปค่าจ้างรวมประจำเดือนของคุณ"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCheckout}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-neutral-800 transition-colors"
            >
              <Plus size={15} /> บันทึกผลไลฟ์ (Checkout)
            </button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* KPI Stats for current streamer */}
        <LiveStats sessions={sessions} isLoading={isSessionsLoading} />

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200/80 bg-white p-3.5 shadow-2xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
              <Filter size={14} /> ตัวกรอง:
            </div>

            <div>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-lg border border-neutral-300 bg-neutral-50/50 px-2.5 py-1.5 text-xs text-neutral-800 focus:border-neutral-900 focus:outline-hidden"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-neutral-300 bg-neutral-50/50 px-2.5 py-1.5 text-xs text-neutral-800 focus:border-neutral-900 focus:outline-hidden"
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="PENDING">รอตรวจ (Pending)</option>
                <option value="APPROVED">อนุมัติแล้ว (Approved)</option>
                <option value="REJECTED">ปฏิเสธ (Rejected)</option>
              </select>
            </div>

            <div>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="rounded-lg border border-neutral-300 bg-neutral-50/50 px-2.5 py-1.5 text-xs text-neutral-800 focus:border-neutral-900 focus:outline-hidden"
              >
                <option value="all">ทุกแพลตฟอร์ม</option>
                <option value="TIKTOK">TikTok Shop</option>
                <option value="SHOPEE">Shopee Live</option>
                <option value="LAZADA">Lazada Live</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-neutral-400">
            พบ {sessions.length} รายการ
          </div>
        </div>

        {/* Live Payroll Summary (Personal Earnings Card & Breakdown) */}
        <LivePayrollTable
          canViewPayroll={true}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          isOwner={false}
        />

        {/* Personal Live Sessions Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900">
              ประวัติรอบไลฟ์ของฉัน (My Live Sessions)
            </h2>
          </div>
          <LiveSessionTable
            sessions={sessions}
            isLoading={isSessionsLoading}
            onEdit={handleEditSession}
            canEdit={true}
          />
        </div>
      </div>

      {/* Checkout / Edit Modal */}
      <LiveCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        sessionToEdit={editingSession}
      />
    </PageContainer>
  );
}
