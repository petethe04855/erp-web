"use client";

import React from "react";
import { shopeeApi } from "../api/shopee.api";
import type { OrderRepairPreview, OrderRepairResult, OrderItemRepair } from "../types/shopee.types";
import { ShopeeMultiFileUpload } from "./ShopeeMultiFileUpload";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_LIMIT = 100;

const bangkok = (iso: string) =>
  new Date(iso).toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

function ItemChange({ it }: { it: OrderItemRepair }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2">
      <span className="font-mono text-zinc-500">{it.sku || "–"}</span>
      {it.old_qty !== it.new_qty && (
        <span>
          จำนวน <s className="text-zinc-400">{it.old_qty}</s> → <strong>{it.new_qty}</strong>
        </span>
      )}
      {it.old_variation !== it.new_variation && (
        <span>
          ตัวเลือก <strong>{it.new_variation}</strong>
        </span>
      )}
    </div>
  );
}

/**
 * Corrects orders imported before the Order parser fix: re-reads the original
 * export and rewrites only the order date, item quantity and variation of
 * orders already stored. SKUs, SKU confirmations and item IDs are kept, nothing
 * is inserted or deleted, and every change is logged on the server.
 */
export function ShopeeOrderRepairModal({ isOpen, onClose, onSuccess }: Props) {
  return (
    <ShopeeMultiFileUpload<OrderRepairPreview, OrderRepairResult>
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      verb="แก้ไข"
      title="แก้ข้อมูลออเดอร์ Shopee ที่นำเข้าไปแล้ว"
      subtitle="เลือกไฟล์ Order ชุดเดิมที่เคยนำเข้า ระบบจะแก้เฉพาะวันที่สั่งซื้อ จำนวน และตัวเลือกสินค้า ของออเดอร์ที่มีอยู่แล้ว ไม่ลบหรือเพิ่มออเดอร์ และไม่แตะ SKU ที่แก้หรือยืนยันไว้ ทุกการแก้ไขถูกบันทึกประวัติ"
      dropHint="ไฟล์ Shopee Order.completed (.xlsx, .xls, .csv) ที่เคยนำเข้า — เลือกได้หลายไฟล์"
      accent="orange"
      preview={shopeeApi.previewOrderRepair}
      importFile={shopeeApi.applyOrderRepair}
      renderSummary={(p) => (
        <>
          <span>{p.orders_in_file.toLocaleString()} ออเดอร์ในไฟล์</span>
          <span className="font-semibold text-orange-600">ต้องแก้ {p.orders_to_repair.toLocaleString()}</span>
          {p.month_changes > 0 && <span className="text-amber-600">ย้ายเดือน {p.month_changes}</span>}
          {p.qty_changes > 0 && <span>จำนวนผิด {p.qty_changes} บรรทัด</span>}
          {p.variation_changes > 0 && <span>เติมตัวเลือก {p.variation_changes} บรรทัด</span>}
          {(p.skipped?.length ?? 0) > 0 && <span className="text-rose-600">ข้าม {p.skipped!.length}</span>}
          {p.orders_not_in_db > 0 && <span className="text-zinc-400">ยังไม่ได้นำเข้า {p.orders_not_in_db}</span>}
        </>
      )}
      renderSample={(p) => {
        const repairs = p.repairs ?? [];
        const skipped = p.skipped ?? [];
        return (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500">
              ถูกต้องอยู่แล้ว {p.orders_unchanged.toLocaleString()} ออเดอร์
              {p.orders_not_in_db > 0 &&
                ` · ${p.orders_not_in_db.toLocaleString()} ออเดอร์ยังไม่อยู่ในระบบ (ใช้ "นำเข้าไฟล์ Order" ตามปกติ)`}
            </p>

            {repairs.length > 0 && (
              <div className="overflow-hidden rounded-lg border dark:border-zinc-800">
                <div className="bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  สิ่งที่จะแก้ {repairs.length > SAMPLE_LIMIT ? `(${SAMPLE_LIMIT} จาก ${repairs.length} ออเดอร์แรก)` : ""}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                      <tr className="border-b dark:border-zinc-800">
                        <th className="p-2">Order ID</th>
                        <th className="p-2">วันที่สั่งซื้อ</th>
                        <th className="p-2">บรรทัดสินค้า</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-zinc-800">
                      {repairs.slice(0, SAMPLE_LIMIT).map((r) => (
                        <tr key={r.order_id} className="align-top">
                          <td className="p-2 font-mono">{r.order_id}</td>
                          <td className="whitespace-nowrap p-2">
                            {r.date_changed ? (
                              <>
                                <s className="text-zinc-400">{bangkok(r.old_order_date)}</s>
                                <br />
                                <strong>{bangkok(r.new_order_date)}</strong>
                              </>
                            ) : (
                              <span className="text-zinc-400">ไม่เปลี่ยน</span>
                            )}
                          </td>
                          <td className="space-y-0.5 p-2">
                            {(r.items ?? []).length === 0 ? (
                              <span className="text-zinc-400">ไม่เปลี่ยน</span>
                            ) : (
                              (r.items ?? []).map((it) => <ItemChange key={it.item_id} it={it} />)
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {skipped.length > 0 && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-2 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
                <div className="mb-1 font-semibold">ข้าม {skipped.length} ออเดอร์ (บรรทัดในระบบกับในไฟล์จับคู่กันไม่ได้ — ไม่แก้เพื่อไม่ให้ข้อมูลผิด)</div>
                <ul className="max-h-32 space-y-0.5 overflow-y-auto">
                  {skipped.map((s) => (
                    <li key={s.order_id}>
                      <span className="font-mono">{s.order_id}</span> — {s.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
