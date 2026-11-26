"use client";

import { useState } from "react";
import { bangkokHour } from "../lib/queue";
import type { StockOutBatch } from "../types/stockout";
import type { DisplayBox } from "./CountView";
import b from "@/features/booth/components/booth.module.css";
import s from "./stockout.module.css";

export const ITEM_COLORS = ["#111111", "#C17A52", "#6b6258", "#1f7a3d", "#7c3aed", "#0e7490", "#b45309", "#be185d"];

export function boxColor(box: { kind: string; color: string }, index: number) {
  return box.kind === "flavor" && box.color ? box.color : ITEM_COLORS[index % ITEM_COLORS.length];
}

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit" });

function StatusChip({ batch, queued }: { batch?: StockOutBatch; queued?: boolean }) {
  if (queued) return <span className={`${s.chip} ${s.chipQueued}`}>ยังไม่ส่ง</span>;
  if (!batch) return null;
  if (batch.status === "voided") return <span className={`${s.chip} ${s.chipVoid}`}>ยกเลิก</span>;
  if (batch.status === "needs_review")
    return <span className={`${s.chip} ${batch.reviewedAt ? s.chipVoid : s.chipReview}`}>{batch.reviewedAt ? "ตรวจแล้ว" : "ค้างตรวจ"}</span>;
  return <span className={`${s.chip} ${s.chipOk}`}>ปกติ</span>;
}

interface Props {
  boxes: DisplayBox[];
  batches: StockOutBatch[];
  isOwner: boolean;
  canVoid: boolean;
  onVoid: (batch: StockOutBatch) => void;
  onReview: (batch: StockOutBatch, note: string) => void;
}

/** The "วันนี้" screen: stock per box, hourly chart, live log, per-person totals, batches to review. */
export function TodayView({ boxes, batches, isOwner, canVoid, onVoid, onReview }: Props) {
  const [notes, setNotes] = useState<Record<number, string>>({});
  const live = batches.filter((x) => x.status !== "voided");
  const colorOf = new Map(boxes.map((x, i) => [x.skuId, boxColor(x, i)]));

  // hourly chart, stacked by box
  const hours = new Map<number, Map<number, number>>();
  live.forEach((x) => {
    const h = bangkokHour(new Date(x.countedAt));
    const row = hours.get(h) ?? new Map<number, number>();
    x.lines.forEach((l) => row.set(l.skuId, (row.get(l.skuId) ?? 0) + l.qty));
    hours.set(h, row);
  });
  const hourKeys = [...hours.keys()].sort((a, c) => a - c);
  const span = hourKeys.length ? Array.from({ length: hourKeys[hourKeys.length - 1] - hourKeys[0] + 1 }, (_, i) => hourKeys[0] + i) : [];
  const hourTotal = (h: number) => [...(hours.get(h)?.values() ?? [])].reduce((a, c) => a + c, 0);
  const maxHour = Math.max(1, ...span.map(hourTotal));

  // per person
  const people = new Map<string, { batches: number; qty: number }>();
  live.forEach((x) => {
    const k = x.userName || "ไม่ระบุ";
    const r = people.get(k) ?? { batches: 0, qty: 0 };
    people.set(k, { batches: r.batches + 1, qty: r.qty + x.totalQty });
  });

  const review = batches.filter((x) => x.status === "needs_review" && !x.reviewedAt);

  return (
    <div className={b.stack}>
      {review.length > 0 && (
        <div className={`${b.panel} ${s.warnBox}`}>
          <h2 className={b.sectionLabel}>ค้างตรวจ {review.length} รอบ (สต็อกในระบบไม่พอตอนนับ)</h2>
          {review.map((x) => (
            <div key={x.id} className={s.reviewRow}>
              <div>
                <b>{x.batchNo}</b> · {timeOf(x.countedAt)} · {x.userName}
                <br />
                {x.lines.filter((l) => l.short > 0).map((l) => `${l.name} นับ ${l.qty} ตัดได้ ${l.deducted} ขาด ${l.short}`).join(" · ")}
              </div>
              {isOwner ? (
                <>
                  <input
                    id={`review-note-${x.id}`}
                    className={s.noteInput}
                    placeholder="หมายเหตุ (เช่น ปรับยอดแล้ว)"
                    value={notes[x.id] ?? ""}
                    onChange={(e) => setNotes({ ...notes, [x.id]: e.target.value })}
                  />
                  <button type="button" className={b.btn} onClick={() => onReview(x, notes[x.id] ?? "")}>ตรวจแล้ว</button>
                </>
              ) : (
                <span className={b.muted}>รอเจ้าของตรวจ</span>
              )}
            </div>
          ))}
          <p className={b.note}>ของที่นับออกจริงมากกว่าที่ระบบมี ระบบตัดเท่าที่มีและไม่ปล่อยให้ติดลบ ให้นับสต็อกจริงแล้วปรับยอดในหน้า Inventory</p>
        </div>
      )}

      <div className={b.panel}>
        <h2 className={b.sectionLabel}>สต็อกวันนี้</h2>
        <div className={b.tableWrap}>
          <table className={b.table}>
            <thead><tr><th>สินค้า</th><th className={b.num}>ออกวันนี้</th><th className={b.num}>คงเหลือ</th><th>LOT ที่กำลังตัด</th></tr></thead>
            <tbody>
              {boxes.map((x, i) => (
                <tr key={x.skuId}>
                  <td><span className={b.dot} style={{ background: boxColor(x, i) }} />{x.name}<br /><span className={b.sku}>{x.skuCode}</span></td>
                  <td className={b.num}><b>{x.outShown}</b> {x.unit}</td>
                  <td className={b.num}>{x.onHandShown}{x.lowShown && <><br /><span className={`${s.chip} ${s.chipReview}`}>ใกล้หมด</span></>}</td>
                  <td>{x.lot ? <>{x.lot.lotNumber}<br /><span className={b.muted}>หมดอายุ {x.lot.expiry || "–"} · เหลือ {x.lot.left}</span></> : <span className={b.muted}>ไม่มี LOT ที่มีของ</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={b.cols}>
        <div className={b.panel}>
          <h2 className={b.sectionLabel}>ออกต่อชั่วโมง</h2>
          {span.length === 0 ? (
            <p className={b.muted}>ยังไม่มีการนับวันนี้</p>
          ) : (
            <>
              <div className={s.chart}>
                {span.map((h) => (
                  <div key={h} className={s.chartRow}>
                    <span>{String(h).padStart(2, "0")}:00</span>
                    <div className={s.bar} style={{ width: `${(hourTotal(h) / maxHour) * 100}%` }}>
                      {[...(hours.get(h)?.entries() ?? [])].map(([sku, q]) => (
                        <span key={sku} className={s.seg} style={{ flex: q, background: colorOf.get(sku) }} title={`${boxes.find((x) => x.skuId === sku)?.name ?? sku} ${q}`} />
                      ))}
                    </div>
                    <span className={b.num}>{hourTotal(h)}</span>
                  </div>
                ))}
              </div>
              <div className={s.legend}>
                {boxes.map((x, i) => <span key={x.skuId}><i className={s.swatch} style={{ background: boxColor(x, i) }} />{x.name}</span>)}
              </div>
            </>
          )}
        </div>
        <div className={b.panel}>
          <h2 className={b.sectionLabel}>ยอดแยกตามคนบันทึก</h2>
          {people.size === 0 ? <p className={b.muted}>ยังไม่มี</p> : (
            <div className={b.tableWrap}>
              <table className={b.table}>
                <thead><tr><th>ผู้ใช้ ERP</th><th className={b.num}>รอบ</th><th className={b.num}>จำนวนออก</th></tr></thead>
                <tbody>{[...people.entries()].map(([k, r]) => <tr key={k}><td>{k}</td><td className={b.num}>{r.batches}</td><td className={b.num}><b>{r.qty}</b></td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className={b.panel}>
        <h2 className={b.sectionLabel}>รายการเคลื่อนไหวล่าสุด</h2>
        {batches.length === 0 ? <p className={b.muted}>ยังไม่มีการนับวันนี้</p> : (
          <div className={b.tableWrap}>
            <table className={b.table}>
              <thead><tr><th>เวลา</th><th>ใครบันทึก</th><th>สินค้า</th><th className={b.num}>จำนวน</th><th>LOT ที่ถูกตัด</th><th>สถานะ</th><th /></tr></thead>
              <tbody>
                {[...batches].reverse().flatMap((x) =>
                  x.lines.map((l, i) => (
                    <tr key={`${x.id}-${l.skuId}`} className={x.status === "voided" ? b.voided : undefined}>
                      <td>{i === 0 ? <>{timeOf(x.countedAt)}<br /><span className={b.muted}>{x.batchNo}</span></> : ""}</td>
                      <td>{i === 0 ? x.userName : ""}</td>
                      <td>{l.name}</td>
                      <td className={b.num}>{l.qty}{l.short > 0 && <><br /><span className={b.muted}>ขาด {l.short}</span></>}</td>
                      <td>{l.lots.length ? l.lots.map((t) => `${t.lotNumber} ×${t.qty}`).join(", ") : <span className={b.muted}>–</span>}</td>
                      <td>{i === 0 ? <StatusChip batch={x} /> : ""}</td>
                      <td className={b.num}>
                        {i === 0 && x.status !== "voided" && canVoid && (
                          <button type="button" className={b.smallBtn} onClick={() => onVoid(x)}>ยกเลิก</button>
                        )}
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        )}
        <p className={b.note}>ยกเลิกรอบแล้วรายการยังอยู่ และระบบคืนของเข้า LOT เดิมตามที่ตัดไป</p>
      </div>
    </div>
  );
}
