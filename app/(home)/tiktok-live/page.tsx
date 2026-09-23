"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthStore } from "@/stores/authStore";
import {
  useLiveSessions,
  useContentItems,
} from "@/features/tiktok/live/hooks/useLive";
import type { LiveSession } from "@/features/tiktok/live/types/live";
import { LiveStats } from "@/features/tiktok/live/components/LiveStats";
import { LiveReviewQueue } from "@/features/tiktok/live/components/LiveReviewQueue";
import { LiveSessionTable } from "@/features/tiktok/live/components/LiveSessionTable";
import { LiveCheckoutModal } from "@/features/tiktok/live/components/LiveCheckoutModal";
import { LivePayrollTable } from "@/features/tiktok/live/components/LivePayrollTable";
import { ContentScheduleTable } from "@/features/tiktok/live/components/ContentScheduleTable";
import { Plus, Settings, Filter } from "lucide-react";

export default function TikTokLivePage() {
  const { user } = useAuthStore();
  const userRole = (user?.role || "sales").toLowerCase();
  const isOwner = userRole === "owner";
  const canReview = isOwner;
  const canViewPayroll = isOwner || userRole === "accountant";

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");

  // Modal states
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);

  // Queries
  const { data: sessions = [], isLoading: isSessionsLoading } = useLiveSessions({
    month: selectedMonth,
    status: statusFilter !== "all" ? statusFilter : undefined,
    platform: platformFilter !== "all" ? platformFilter : undefined,
  });

  const { data: contentItems = [], isLoading: isContentLoading } = useContentItems();

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
        title="Live & Content Management"
        description="จัดการตารางไลฟ์ บันทึกผลยอดขาย ชั่วโมงการทำงานทีมไลฟ์ และคำนวณ Payroll ประจำเดือน"
        actions={
          <div className="flex items-center gap-2">
            {isOwner && (
              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 transition-colors"
              >
                <Settings size={14} /> อัตราค่าจ้าง
              </Link>
            )}
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
        {/* KPI Stats */}
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

        {/* Review Queue (Pending Sessions) */}
        <LiveReviewQueue sessions={sessions} canReview={canReview} />

        {/* Main Live Sessions Ledger */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900">
              ตารางบันทึกการไลฟ์ (Live Sessions)
            </h2>
          </div>
          <LiveSessionTable
            sessions={sessions}
            isLoading={isSessionsLoading}
            onEdit={handleEditSession}
            canEdit={isOwner || userRole === "sales" || userRole === "live"}
          />
        </div>

        {/* Role-gated Payroll Summary Table */}
        {canViewPayroll && (
          <LivePayrollTable
            canViewPayroll={canViewPayroll}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            isOwner={isOwner}
          />
        )}

        {/* Content Schedules */}
        <div className="pt-2">
          <ContentScheduleTable items={contentItems} isLoading={isContentLoading} />
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
