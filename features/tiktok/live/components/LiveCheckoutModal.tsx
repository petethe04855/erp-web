import React, { useState, useEffect } from "react";
import type { LivePlatform, LiveSession, CreateLiveSessionDTO, UpdateLiveSessionDTO } from "../types/live";
import { useCreateLiveSession, useUpdateLiveSession } from "../hooks/useLive";
import { userApi } from "@/features/users/api/userApi";
import type { AppUser } from "@/features/users/types/user";
import { X, AlertCircle } from "lucide-react";

interface LiveCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToEdit?: LiveSession | null;
}

export const LiveCheckoutModal: React.FC<LiveCheckoutModalProps> = ({
  isOpen,
  onClose,
  sessionToEdit,
}) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [staffId, setStaffId] = useState<number | "">("");
  const [platform, setPlatform] = useState<LivePlatform>("TIKTOK");
  const [tiktokAccount, setTiktokAccount] = useState("@chawy_official");
  const [liveDate, setLiveDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("20:00");
  const [endTime, setEndTime] = useState("23:00");
  const [breakMinutes, setBreakMinutes] = useState<number>(0);
  const [revenue, setRevenue] = useState<number | "">("");
  const [hasClip, setHasClip] = useState<boolean>(false);
  const [clipLink, setClipLink] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const createMutation = useCreateLiveSession();
  const updateMutation = useUpdateLiveSession();

  useEffect(() => {
    userApi.getUsers().then((res) => {
      // Filter sales or active staff
      setUsers(res || []);
      if (!sessionToEdit && res && res.length > 0 && staffId === "") {
        setStaffId(Number(res[0].id));
      }
    }).catch(() => {});
  }, [sessionToEdit]);

  useEffect(() => {
    if (sessionToEdit) {
      setStaffId(sessionToEdit.staff_id);
      setPlatform(sessionToEdit.platform || "TIKTOK");
      setTiktokAccount(sessionToEdit.tiktok_account || "@chawy_official");
      setLiveDate(sessionToEdit.live_date || new Date().toISOString().slice(0, 10));

      const start = new Date(sessionToEdit.start_datetime);
      const end = new Date(sessionToEdit.end_datetime);
      setStartTime(start.toTimeString().slice(0, 5));
      setEndTime(end.toTimeString().slice(0, 5));
      setBreakMinutes(sessionToEdit.break_minutes || 0);
      setRevenue(sessionToEdit.revenue_generated || 0);
      setHasClip(sessionToEdit.has_clip || false);
      setClipLink(sessionToEdit.clip_link || "");
      setErrorMsg("");
    } else {
      setPlatform("TIKTOK");
      setTiktokAccount("@chawy_official");
      setLiveDate(new Date().toISOString().slice(0, 10));
      setStartTime("20:00");
      setEndTime("23:00");
      setBreakMinutes(0);
      setRevenue("");
      setHasClip(false);
      setClipLink("");
      setErrorMsg("");
    }
  }, [sessionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!staffId) {
      setErrorMsg("กรุณาเลือก คนไลฟ์");
      return;
    }

    const startDatetime = `${liveDate}T${startTime}:00`;
    const endDatetime = `${liveDate}T${endTime}:00`;

    try {
      if (sessionToEdit) {
        const dto: UpdateLiveSessionDTO = {
          platform,
          tiktok_account: tiktokAccount,
          start_datetime: new Date(startDatetime).toISOString(),
          end_datetime: new Date(endDatetime).toISOString(),
          break_minutes: Number(breakMinutes) || 0,
          revenue_generated: Number(revenue) || 0,
          has_clip: hasClip,
          clip_link: clipLink.trim(),
        };
        await updateMutation.mutateAsync({ id: sessionToEdit.id, dto });
      } else {
        const dto: CreateLiveSessionDTO = {
          staff_id: Number(staffId),
          live_date: liveDate,
          platform,
          tiktok_account: tiktokAccount,
          start_datetime: new Date(startDatetime).toISOString(),
          end_datetime: new Date(endDatetime).toISOString(),
          break_minutes: Number(breakMinutes) || 0,
          revenue_generated: Number(revenue) || 0,
          has_clip: hasClip,
          clip_link: clipLink.trim(),
        };
        await createMutation.mutateAsync(dto);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || "เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h3 className="text-base font-bold text-neutral-900">
            {sessionToEdit ? `แก้ไขผลการไลฟ์ (${sessionToEdit.session_no})` : "บันทึกผลการไลฟ์ (Checkout)"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-700">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                คนไลฟ์ <span className="text-rose-500">*</span>
              </label>
              <select
                value={staffId}
                onChange={(e) => setStaffId(Number(e.target.value))}
                disabled={!!sessionToEdit}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-hidden disabled:bg-neutral-100"
                required
              >
                <option value="">-- เลือกคนไลฟ์ --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">แพลตฟอร์ม</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as LivePlatform)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-hidden"
              >
                <option value="TIKTOK">TikTok Shop</option>
                <option value="SHOPEE">Shopee Live</option>
                <option value="LAZADA">Lazada Live</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                วันที่ไลฟ์ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={liveDate}
                onChange={(e) => setLiveDate(e.target.value)}
                disabled={!!sessionToEdit}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-hidden disabled:bg-neutral-100"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">ช่อง / แอคเคานต์</label>
              <input
                type="text"
                value={tiktokAccount}
                onChange={(e) => setTiktokAccount(e.target.value)}
                placeholder="@chawy_official"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                เริ่มไลฟ์ <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                จบไลฟ์ <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-hidden"
                required
              />
            </div>
          </div>
          <p className="text-[11px] text-neutral-400">
            * รองรับไลฟ์ข้ามเที่ยงคืน เช่น 23:00 - 02:00 ระบบจะคำนวณชั่วโมงสุทธิให้อัตโนมัติ
          </p>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">ยอดขายที่เกิดจากไลฟ์ (บาท)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-hidden"
            />
          </div>

          <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasClip"
                checked={hasClip}
                onChange={(e) => setHasClip(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <label htmlFor="hasClip" className="font-semibold text-neutral-800 select-none cursor-pointer">
                มีคลิปสรุป / วิดีโอสั้นจากไลฟ์ (รับโบนัสคลิป)
              </label>
            </div>

            {hasClip && (
              <div>
                <label className="block text-neutral-600 mb-1">ลิงก์คลิปสรุป</label>
                <input
                  type="url"
                  value={clipLink}
                  onChange={(e) => setClipLink(e.target.value)}
                  placeholder="https://tiktok.com/@chawy/video/..."
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs focus:border-neutral-900 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {isPending ? "กำลังบันทึก..." : sessionToEdit ? "บันทึกการแก้ไข" : "บันทึกผลไลฟ์"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
