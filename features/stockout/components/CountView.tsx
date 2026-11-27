"use client";

import { useMemo, useState } from "react";
import type { BoxSummary, Round, StockOutSummary } from "../types/stockout";
import type { QueuedBatch } from "../lib/queue";
import b from "@/features/booth/components/booth.module.css";
import s from "./stockout.module.css";

export interface DisplayBox extends BoxSummary {
  /** Out today including rounds still on this device. */
  outShown: number;
  /** On hand minus rounds still on this device. */
  onHandShown: number;
  lowShown: boolean;
}

/** Server numbers plus what this device has not sent yet. */
export function displayBoxes(summary: StockOutSummary | undefined, pending: Record<number, number>): DisplayBox[] {
  return (summary?.boxes ?? []).map((x) => {
    const p = pending[x.skuId] ?? 0;
    const onHandShown = Math.max(0, x.onHand - p);
    return { ...x, outShown: x.outToday + p, onHandShown, lowShown: x.lowStock > 0 && onHandShown <= x.lowStock };
  });
}

interface Props {
  boxes: DisplayBox[];
  onSave: (lines: { skuId: number; qty: number }[], label: string) => void | Promise<void>;
  failed: QueuedBatch[];
  onDiscard: (clientId: string) => void;
  isSaving?: boolean;
}

function Tile({ box, qty, onAdd, onSub }: { box: DisplayBox; qty: number; onAdd: () => void; onSub: () => void }) {
  const flavor = box.kind === "flavor";
  return (
    <div className={`${s.tile} ${flavor ? s.tileFlavor : s.tileItem}`} style={flavor ? { background: box.color } : undefined}>
      <button type="button" className={s.tileTap} onClick={onAdd} disabled={box.missing} aria-label={`เพิ่ม ${box.name} (รอบนี้ ${qty})`}>
        <span className={s.tileHead}>
          {/* eslint-disable-next-line @next/next/no-img-element -- uploaded box photos come from the ERP upload host */}
          {box.image && <img className={s.thumb} src={box.image} alt="" />}
          <span className={s.tileName}>{box.name}</span>
        </span>
        <span className={s.fig}>ออกวันนี้ {box.outShown}</span>
        <span className={s.fig}>
          คงเหลือ{" "}
          {box.lowShown ? <span className={s.lowPill}>{box.onHandShown} ใกล้หมด</span> : box.onHandShown}
          {box.missing && <span className={s.missingPill}>ไม่พบ SKU</span>}
        </span>
      </button>
      <div className={s.tileFoot}>
        <button type="button" className={s.minus} aria-disabled={qty ? undefined : true} aria-label={`ลด ${box.name}`} onClick={onSub}>−</button>
        <button type="button" className={s.tapPlus} onClick={onAdd} tabIndex={-1} aria-hidden="true">แตะ +1</button>
        <button type="button" className={s.qty} onClick={onAdd} aria-label={`เพิ่ม ${box.name} (รอบนี้ ${qty})`}>{qty}</button>
      </div>
    </div>
  );
}

/** The "นับออก" screen: tap what you pick, then save the round. */
export function CountView({ boxes, onSave, failed, onDiscard, isSaving }: Props) {
  const [round, setRound] = useState<Round>({});
  const adjust = (id: number, delta: number) =>
    setRound((r) => {
      const n = Math.max(0, (r[id] ?? 0) + delta);
      const out = { ...r, [id]: n };
      if (!n) delete out[id];
      return out;
    });
  const lines = useMemo(
    () => boxes.filter((x) => (round[x.skuId] ?? 0) > 0).map((x) => ({ box: x, qty: round[x.skuId] })),
    [boxes, round],
  );
  const total = lines.reduce((a, l) => a + l.qty, 0);
  const label = lines.map((l) => `${l.box.name} ${l.qty}`).join(" · ");

  if (boxes.length === 0) {
    return <div className={`${b.panel} ${b.empty}`}>ยังไม่มีกล่องสินค้า ให้ owner ไปที่แท็บ &quot;ตั้งค่า&quot; แล้วเลือก SKU ที่จะนับ</div>;
  }

  const save = async () => {
    if (!total || isSaving) return;
    await onSave(lines.map((l) => ({ skuId: l.box.skuId, qty: l.qty })), label);
    setRound({});
  };

  return (
    <div className={s.countWrap}>
      {failed.length > 0 && (
        <div className={`${b.panel} ${s.warnBox}`}>
          <h2 className={b.sectionLabel}>รอบที่ ERP ไม่รับ ({failed.length})</h2>
          {failed.map((f) => (
            <div key={f.clientId} className={s.failedRow}>
              <span>{new Date(f.createdAt).toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit" })} · {f.error}</span>
              <button type="button" className={b.smallBtn} onClick={() => onDiscard(f.clientId)}>ทิ้งรอบนี้</button>
            </div>
          ))}
        </div>
      )}
      <section className={s.countGrid}>
        <div className={s.tiles}>
          {boxes.map((x) => (
            <Tile key={x.skuId} box={x} qty={round[x.skuId] ?? 0} onAdd={() => !x.missing && adjust(x.skuId, 1)} onSub={() => adjust(x.skuId, -1)} />
          ))}
        </div>
        <aside className={s.round} aria-label="รอบนี้">
          <h2 className={s.roundTitle}>รอบนี้</h2>
          {total === 0 ? (
            <div className={s.roundEmpty}>แตะกล่องตามของที่หยิบออก</div>
          ) : (
            <div className={s.roundRows}>
              {lines.map((l) => (
                <div key={l.box.skuId} className={s.roundLine}><span>{l.box.name}</span><span>{l.qty} {l.box.unit}</span></div>
              ))}
            </div>
          )}
          <button type="button" className={s.saveBtn} disabled={total === 0 || isSaving} onClick={save}>
            {isSaving ? "กำลังบันทึก…" : `บันทึกออก${total ? ` · ${total} รายการ` : ""}`}
          </button>
        </aside>
      </section>
    </div>
  );
}
