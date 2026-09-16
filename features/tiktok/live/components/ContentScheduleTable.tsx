import React, { useState } from "react";
import type { ContentItem, CreateContentItemDTO, UpdateContentItemDTO } from "../types/live";
import { useCreateContentItem, useUpdateContentItem, useDeleteContentItem } from "../hooks/useLive";
import { Calendar, Plus, Trash2, Edit2, X } from "lucide-react";

interface ContentScheduleTableProps {
  items: ContentItem[];
  isLoading?: boolean;
}

export const ContentScheduleTable: React.FC<ContentScheduleTableProps> = ({
  items,
  isLoading,
}) => {
  const scheduledItems = items.filter((i) => i.kind === "SCHEDULED");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("TikTok Live");
  const [scheduledFor, setScheduledFor] = useState("");
  const [hostName, setHostName] = useState("");
  const [notes, setNotes] = useState("");

  const createMutation = useCreateContentItem();
  const updateMutation = useUpdateContentItem();
  const deleteMutation = useDeleteContentItem();

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle("");
    setPlatform("TikTok Live");
    setScheduledFor("");
    setHostName("");
    setNotes("");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ContentItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setPlatform(item.platform);
    setScheduledFor(item.scheduled_for ? new Date(item.scheduled_for).toISOString().slice(0, 16) : "");
    setHostName(item.host_name || "");
    setNotes(item.notes || "");
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบกำหนดการคอนเทนต์นี้ใช่หรือไม่?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการลบ");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const scheduledDate = scheduledFor ? new Date(scheduledFor).toISOString() : null;
      if (editingItem) {
        const dto: UpdateContentItemDTO = {
          title: title.trim(),
          platform,
          scheduled_for: scheduledDate,
          host_name: hostName.trim(),
          notes: notes.trim(),
        };
        await updateMutation.mutateAsync({ id: editingItem.id, dto });
      } else {
        const dto: CreateContentItemDTO = {
          kind: "SCHEDULED",
          title: title.trim(),
          platform,
          scheduled_for: scheduledDate,
          host_name: hostName.trim(),
          notes: notes.trim(),
        };
        await createMutation.mutateAsync(dto);
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <Calendar size={15} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              ตารางไลฟ์ &amp; แผนคอนเทนต์ล่วงหน้า (Content Schedule)
            </h3>
            <p className="text-xs text-neutral-500">
              วางแผนหัวข้อไลฟ์และโปรโมชั่นล่วงหน้าสำหรับทีม
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
        >
          <Plus size={14} /> เพิ่มแผน
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-neutral-400">กำลังโหลดตารางงาน...</div>
      ) : scheduledItems.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500">
          ยังไม่มีแผนคอนเทนต์หรือตารางไลฟ์ล่วงหน้า
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-600">
            <thead className="border-b border-neutral-200 bg-neutral-50/70 font-semibold text-neutral-800">
              <tr>
                <th className="px-3 py-2.5">หัวข้อ / กิจกรรม</th>
                <th className="px-3 py-2.5">แพลตฟอร์ม</th>
                <th className="px-3 py-2.5">วัน-เวลานัดหมาย</th>
                <th className="px-3 py-2.5">ผู้รับผิดชอบ (Host)</th>
                <th className="px-3 py-2.5">หมายเหตุ</th>
                <th className="px-3 py-2.5 text-right">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {scheduledItems.map((item) => {
                const dateStr = item.scheduled_for
                  ? new Date(item.scheduled_for).toLocaleString("th-TH", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "-";

                return (
                  <tr key={item.id} className="hover:bg-neutral-50/50">
                    <td className="px-3 py-2.5 font-medium text-neutral-900">{item.title}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
                        {item.platform}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono">{dateStr}</td>
                    <td className="px-3 py-2.5">{item.host_name || "-"}</td>
                    <td className="px-3 py-2.5 text-neutral-500 truncate max-w-xs">{item.notes || "-"}</td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded p-1 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-3">
              <h4 className="text-sm font-bold text-neutral-900">
                {editingItem ? "แก้ไขกำหนดการคอนเทนต์" : "เพิ่มกำหนดการคอนเทนต์/ไลฟ์"}
              </h4>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  หัวข้อ / แคมเปญ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น รีวิวสินค้าใหม่ แซลมอนฟรีซดราย"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">แพลตฟอร์ม</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-hidden"
                  >
                    <option value="TikTok Live">TikTok Live</option>
                    <option value="TikTok Clip">TikTok Clip</option>
                    <option value="Facebook Live">Facebook Live</option>
                    <option value="Shopee Live">Shopee Live</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">ผู้รับผิดชอบ (Host)</label>
                  <input
                    type="text"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="เช่น มายด์, แพรว"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">วันและเวลาที่กำหนด</label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">หมายเหตุ / สคริปต์</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="รายละเอียดโปรโมชั่นหรือคำอธิบายเพิ่มเติม..."
                  className="w-full h-16 rounded-lg border border-neutral-300 p-2.5 text-xs focus:border-neutral-900 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
