import React, { useState } from "react";
import type { ContentItem, CreateContentItemDTO, UpdateContentItemDTO } from "../types/live";
import { useCreateContentItem, useUpdateContentItem, useDeleteContentItem } from "../hooks/useLive";
import { BarChart3, Plus, Trash2, Edit2, X, TrendingUp } from "lucide-react";

interface ContentPerformanceTableProps {
  items: ContentItem[];
  isLoading?: boolean;
}

export const ContentPerformanceTable: React.FC<ContentPerformanceTableProps> = ({
  items,
  isLoading,
}) => {
  const publishedItems = items.filter((i) => i.kind === "PUBLISHED");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("TikTok");
  const [publishedAt, setPublishedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [reach, setReach] = useState<number | "">("");
  const [engagementPct, setEngagementPct] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  const createMutation = useCreateContentItem();
  const updateMutation = useUpdateContentItem();
  const deleteMutation = useDeleteContentItem();

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle("");
    setPlatform("TikTok");
    setPublishedAt(new Date().toISOString().slice(0, 10));
    setReach("");
    setEngagementPct("");
    setNotes("");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ContentItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setPlatform(item.platform);
    setPublishedAt(item.published_at ? new Date(item.published_at).toISOString().slice(0, 10) : "");
    setReach(item.reach || "");
    setEngagementPct(item.engagement_pct || "");
    setNotes(item.notes || "");
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบรายงานผลงานคอนเทนต์นี้ใช่หรือไม่?")) return;
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
      const pubDate = publishedAt ? new Date(`${publishedAt}T12:00:00`).toISOString() : null;
      if (editingItem) {
        const dto: UpdateContentItemDTO = {
          title: title.trim(),
          platform,
          published_at: pubDate,
          reach: Number(reach) || 0,
          engagement_pct: Number(engagementPct) || 0,
          notes: notes.trim(),
        };
        await updateMutation.mutateAsync({ id: editingItem.id, dto });
      } else {
        const dto: CreateContentItemDTO = {
          kind: "PUBLISHED",
          title: title.trim(),
          platform,
          published_at: pubDate,
          reach: Number(reach) || 0,
          engagement_pct: Number(engagementPct) || 0,
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
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
            <BarChart3 size={15} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              ผลงานคอนเทนต์และคลิปสั้น (Content Performance)
            </h3>
            <p className="text-xs text-neutral-500">
              บันทึกสถิติยอดเข้าถึง (Reach) และการมีส่วนร่วม (Engagement) เพื่อวิเคราะห์คอนเทนต์
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
        >
          <Plus size={14} /> บันทึกผลงาน
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-neutral-400">กำลังโหลดผลงานคอนเทนต์...</div>
      ) : publishedItems.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500">
          ยังไม่มีข้อมูลผลงานคอนเทนต์ที่บันทึก
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-600">
            <thead className="border-b border-neutral-200 bg-neutral-50/70 font-semibold text-neutral-800">
              <tr>
                <th className="px-3 py-2.5">ชื่อคลิป / คอนเทนต์</th>
                <th className="px-3 py-2.5">แพลตฟอร์ม</th>
                <th className="px-3 py-2.5">วันที่เผยแพร่</th>
                <th className="px-3 py-2.5 text-right">ยอดเข้าถึง (Reach)</th>
                <th className="px-3 py-2.5 text-right">Engagement (%)</th>
                <th className="px-3 py-2.5">โน้ต / วิเคราะห์</th>
                <th className="px-3 py-2.5 text-right">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {publishedItems.map((item) => {
                const dateStr = item.published_at
                  ? new Date(item.published_at).toLocaleDateString("th-TH")
                  : "-";

                return (
                  <tr key={item.id} className="hover:bg-neutral-50/50">
                    <td className="px-3 py-2.5 font-medium text-neutral-900">{item.title}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
                        {item.platform}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">{dateStr}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-medium text-neutral-900">
                      {item.reach ? item.reach.toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-purple-700">
                      {item.engagement_pct ? `${item.engagement_pct}%` : "-"}
                    </td>
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
                {editingItem ? "แก้ไขผลงานคอนเทนต์" : "บันทึกผลงานคอนเทนต์"}
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
                  ชื่อคลิป / คอนเทนต์ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น รีวิวไก่อกฟรีซดราย: แกะซองดูเนื้อแท้"
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
                    <option value="TikTok">TikTok</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">วันที่เผยแพร่</label>
                  <input
                    type="date"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">ยอดเข้าถึง (Reach/Views)</label>
                  <input
                    type="number"
                    min="0"
                    value={reach}
                    onChange={(e) => setReach(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="เช่น 84000"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Engagement (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={engagementPct}
                    onChange={(e) => setEngagementPct(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="เช่น 6.8"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">โน้ต / วิเคราะห์ผลตอบรับ</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="เช่น ยอดแชร์เยอะ คนถามพิกัดสั่งซื้อในคอมเมนต์..."
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
