import React from "react";
import type { LiveSession } from "../types/live";
import { Video, Clock, DollarSign, Film, AlertCircle } from "lucide-react";

interface LiveStatsProps {
  sessions: LiveSession[];
  isLoading?: boolean;
}

export const LiveStats: React.FC<LiveStatsProps> = ({ sessions, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-neutral-100 animate-pulse border border-neutral-200/60" />
        ))}
      </div>
    );
  }

  const sessionCount = sessions.length;

  let totalMinutes = 0;
  let totalRevenue = 0;
  let withClipCount = 0;
  let pendingCount = 0;

  for (const s of sessions) {
    totalRevenue += s.revenue_generated || 0;
    if (s.has_clip) withClipCount++;
    if (s.status === "PENDING") pendingCount++;

    const start = new Date(s.start_datetime).getTime();
    let end = new Date(s.end_datetime).getTime();
    if (end < start) {
      end += 24 * 60 * 60 * 1000;
    }
    const diff = Math.max(0, Math.round((end - start) / 60000) - (s.break_minutes || 0));
    totalMinutes += diff;
  }

  const totalHours = (totalMinutes / 60).toFixed(1);
  const clipPercentage = sessionCount > 0 ? Math.round((withClipCount / sessionCount) * 100) : 0;

  const statCards = [
    {
      label: "เซสชันทั้งหมด",
      value: `${sessionCount} รอบ`,
      icon: Video,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "ชั่วโมงรวม",
      value: `${totalHours} ชม.`,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "ยอดขายจากไลฟ์",
      value: `฿${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "% มีคลิปสรุป",
      value: `${clipPercentage}%`,
      icon: Film,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "รออนุมัติ",
      value: `${pendingCount} รายการ`,
      icon: AlertCircle,
      color: pendingCount > 0 ? "text-rose-600" : "text-neutral-500",
      bg: pendingCount > 0 ? "bg-rose-50" : "bg-neutral-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-xl border border-neutral-200/80 bg-white p-3.5 shadow-sm transition-all hover:border-neutral-300"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-neutral-500 truncate">{card.label}</span>
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${card.bg} ${card.color}`}>
                <Icon size={15} />
              </div>
            </div>
            <div className="mt-1.5">
              <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 truncate block">
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
