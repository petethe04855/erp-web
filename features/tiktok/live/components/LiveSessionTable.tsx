import React from "react";
import type { LiveSession } from "../types/live";
import { ExternalLink, CheckCircle2, XCircle, Clock } from "lucide-react";

interface LiveSessionTableProps {
  sessions: LiveSession[];
  isLoading?: boolean;
  onEdit?: (session: LiveSession) => void;
  canEdit?: boolean;
}

export const LiveSessionTable: React.FC<LiveSessionTableProps> = ({
  sessions,
  isLoading,
  onEdit,
  canEdit,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-400">
        กำลังโหลดรายการไลฟ์...
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
        <p className="text-sm font-medium text-neutral-600">ยังไม่มีรายการไลฟ์ในเดือนนี้</p>
        <p className="text-xs text-neutral-400 mt-1">กดปุ่ม &quot;บันทึกผลไลฟ์&quot; ด้านบนเพื่อเริ่มต้นเพิ่มข้อมูล</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> อนุมัติแล้ว
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
            <XCircle size={12} /> ปฏิเสธ
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
            <Clock size={12} /> รอตรวจ
          </span>
        );
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-neutral-600">
          <thead className="border-b border-neutral-200 bg-neutral-50/70 font-semibold text-neutral-800">
            <tr>
              <th className="px-4 py-3">รหัสเซสชัน</th>
              <th className="px-4 py-3">วันที่ / แพลตฟอร์ม</th>
              <th className="px-4 py-3">Staff (ผู้ไลฟ์)</th>
              <th className="px-4 py-3">ช่วงเวลาไลฟ์</th>
              <th className="px-4 py-3 text-right">สุทธิ (หักพัก)</th>
              <th className="px-4 py-3 text-right">ยอดขาย (฿)</th>
              <th className="px-4 py-3 text-center">คลิป</th>
              <th className="px-4 py-3 text-center">สถานะ</th>
              {canEdit && <th className="px-4 py-3 text-right">การกระทำ</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sessions.map((s) => {
              const start = new Date(s.start_datetime);
              let end = new Date(s.end_datetime);
              if (end.getTime() < start.getTime()) {
                end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
              }
              const netMinutes = Math.max(
                0,
                Math.round((end.getTime() - start.getTime()) / 60000) - (s.break_minutes || 0)
              );
              const netHours = (netMinutes / 60).toFixed(1);

              const timeStr = `${start.toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })} – ${end.toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })}`;

              return (
                <tr key={s.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-neutral-900">
                    {s.session_no}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-900">{s.live_date}</div>
                    <div className="text-[11px] text-neutral-400">{s.platform}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-900">
                      {s.staff?.name || `Staff #${s.staff_id}`}
                    </div>
                    {s.tiktok_account && (
                      <div className="text-[11px] text-neutral-400">{s.tiktok_account}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div>{timeStr}</div>
                    {s.break_minutes > 0 && (
                      <div className="text-[11px] text-neutral-400">พัก {s.break_minutes} นาที</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-900">
                    {netHours} ชม.
                    <span className="text-[11px] text-neutral-400 block">({netMinutes} น.)</span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                    ฿{(s.revenue_generated || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.has_clip ? (
                      s.clip_link ? (
                        <a
                          href={s.clip_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-0.5 text-blue-600 hover:underline"
                          title={s.clip_link}
                        >
                          มี <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span className="text-emerald-600 font-medium">มี</span>
                      )
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(s.status)}</td>
                  {canEdit && (
                    <td className="px-4 py-3 text-right">
                      {s.status === "PENDING" ? (
                        <button
                          onClick={() => onEdit?.(s)}
                          className="text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:underline"
                        >
                          แก้ไข
                        </button>
                      ) : (
                        <span className="text-neutral-300 text-xs">-</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
