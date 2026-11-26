"use client";

import { baht, PAY_METHODS, stockLeft, suggestCash, type BillPreview } from "../lib/pricing";
import type { useBoothSell } from "../hooks/useBoothSell";
import type { BoothButton, BoothCatalog } from "../types/booth";
import s from "./booth.module.css";

type Sell = ReturnType<typeof useBoothSell>;

interface Props {
  catalog: BoothCatalog;
  sell: Sell;
  onSell: () => void;
  onUndoLast?: () => void;
  canUndoLast: boolean;
}

function Tile({ button, sell }: { button: BoothButton; sell: Sell }) {
  const qty = sell.cart[button.skuId] ?? 0;
  const left = stockLeft(button, sell.cart);
  const isFlavor = button.kind === "flavor";
  const out = left <= 0;
  const tag = button.missing
    ? <span className={`${s.stockTag} ${s.stockTagOut}`}>ไม่พบ SKU</span>
    : out
      ? <span className={`${s.stockTag} ${s.stockTagOut}`}>หมด</span>
      : left <= 5
        ? <span className={s.stockTag}>ใกล้หมด</span>
        : null;
  const add = () => { if (!out && !button.missing) sell.adjust(button.skuId, 1); };
  return (
    <div
      className={`${s.card} ${isFlavor ? s.flavor : s.item} ${out && qty === 0 ? s.soldOut : ""}`}
      style={isFlavor ? { background: button.color } : undefined}
    >
      <button type="button" className={s.addArea} onClick={add} aria-label={`เพิ่ม ${button.name} (ตอนนี้ ${qty})`}>
        <span className={s.name}>{button.name}</span>
        {!isFlavor && <span className={s.price}>{baht(button.price ?? 0)} / ชิ้น</span>}
        <span className={s.stock}>เหลือ <b>{Math.max(left, 0)}</b>{tag}</span>
      </button>
      <div className={s.cardFoot}>
        <button
          type="button"
          className={s.minus}
          aria-disabled={qty ? undefined : true}
          aria-label={`ลด ${button.name}`}
          onClick={() => qty && sell.adjust(button.skuId, -1)}
        >−</button>
        <button type="button" className={s.addFill} tabIndex={-1} aria-hidden="true" onClick={add} />
        <button type="button" className={`${s.count} ${qty ? "" : s.zero}`} onClick={add} aria-label={`เพิ่ม ${button.name} (ตอนนี้ ${qty})`}>
          {qty}
        </button>
      </div>
    </div>
  );
}

function miniSummary(bill: BillPreview) {
  const parts: string[] = [];
  if (bill.bags > 0) parts.push(`ขนม ${bill.bags} ถุง · ${bill.treatLabel}`);
  bill.itemLines.forEach((l) => parts.push(`${l.name} ×${l.qty}`));
  return parts.join(" · ");
}

function Pay({ sell }: { sell: Sell }) {
  const bill = sell.bill!;
  const methods = (
    <div className={s.payMethods}>
      {PAY_METHODS.map((m) => (
        <button key={m.id} type="button" className={s.payBtn} aria-pressed={sell.payMethod === m.id} onClick={() => sell.choosePay(m.id)}>
          {m.label}
        </button>
      ))}
    </div>
  );
  if (sell.payMethod !== "cash") return <div className={s.pay}>{methods}</div>;
  const amounts = suggestCash(bill.total);
  const r = sell.cash!;
  const manual = sell.cashReceived !== null && !amounts.includes(sell.cashReceived) ? sell.cashReceived : "";
  return (
    <div className={s.pay}>
      {methods}
      <div className={s.cash}>
        <div className={s.cashQuick}>
          {amounts.map((amt, i) => (
            <button
              key={amt}
              type="button"
              className={s.cashBtn}
              aria-pressed={sell.cashReceived === null ? i === 0 : sell.cashReceived === amt}
              onClick={() => sell.setCashReceived(amt)}
            >
              {i === 0 ? "พอดี" : baht(amt)}
            </button>
          ))}
        </div>
        <input
          id="boothCashInput"
          className={s.cashInput}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          placeholder="รับมาเอง (฿)"
          aria-label="จำนวนเงินที่รับมา"
          value={manual}
          onChange={(e) => {
            const v = e.target.value;
            const n = Math.floor(Number(v));
            sell.setCashReceived(v === "" || !Number.isFinite(n) || n < 0 ? null : n);
          }}
        />
        <div className={s.cashStatus}>
          {r.short > 0 ? (
            <span className={s.short}>ยังขาด <strong>{baht(r.short)}</strong></span>
          ) : (
            <>
              <span>รับมา {baht(r.received)}</span>
              <span className={s.change}>ทอน <strong>{baht(r.change)}</strong></span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function BoothSell({ catalog, sell, onSell, onUndoLast, canUndoLast }: Props) {
  const bill = sell.bill;
  const d = catalog.config.discount;
  const byId = new Map(catalog.buttons.map((b) => [b.skuId, b]));
  const flavors = catalog.buttons.filter((b) => b.kind === "flavor");
  const items = catalog.buttons.filter((b) => b.kind === "item");
  const isEmpty = !bill || bill.isEmpty;

  if (catalog.buttons.length === 0) {
    return (
      <div className={`${s.panel} ${s.empty}`}>
        ยังไม่ได้ตั้งปุ่มสินค้า ให้ owner ไปที่แท็บ &quot;ตั้งค่า&quot; แล้วเลือก SKU ที่จะขายหน้าบูธ
      </div>
    );
  }

  return (
    <section className={s.sell}>
      <div className={s.tiles}>
        {flavors.map((b) => <Tile key={b.skuId} button={b} sell={sell} />)}
        {items.map((b) => <Tile key={b.skuId} button={b} sell={sell} />)}
      </div>
      <aside className={s.cart} aria-label="บิลนี้">
        <div className={s.total}><span>ยอดรวม</span><strong>{baht(bill?.total ?? 0)}</strong></div>
        {!isEmpty && <div className={s.mini}>{miniSummary(bill!)}</div>}
        {isEmpty ? (
          <div className={s.empty}>แตะสินค้าเพื่อเริ่มบิล</div>
        ) : (
          <>
            <div className={s.rows}>
              {bill!.bags > 0 && (
                <div className={`${s.row} ${s.rowStrong}`}>
                  <div>
                    ขนม {bill!.bags} ถุง · {bill!.treatLabel}
                    <span className={s.sub}>{bill!.flavorLines.map((l) => `${l.name} ${l.qty}`).join(" · ")}</span>
                  </div>
                  <div>{baht(bill!.treatTotal)}</div>
                </div>
              )}
              {bill!.itemLines.map((l) => (
                <div key={l.skuId} className={`${s.row} ${s.rowStrong}`}>
                  <div>{l.name} × {l.qty}<span className={s.sub}>{baht(l.unitPrice)} / ชิ้น</span></div>
                  <div>{baht(l.amount)}</div>
                </div>
              ))}
              {bill!.discount > 0 && (
                <>
                  <hr className={s.divider} />
                  <div className={s.row}><div className={s.rowLabel}>ยอดก่อนลด</div><div>{baht(bill!.subtotal)}</div></div>
                  <div className={`${s.row} ${s.rowDiscount}`}><div>ส่วนลด (ครบ {baht(d.min)})</div><div>−{baht(bill!.discount)}</div></div>
                </>
              )}
            </div>
            {bill!.toDiscount > 0 && (
              <div className={s.nudge}>
                อีก <b>{baht(bill!.toDiscount)}</b> ได้ส่วนลด {d.type === "percent" ? `${d.value}%` : baht(d.value)}
              </div>
            )}
            <div className={s.deduct}>
              <span className={s.deductTitle}>ตัดสต็อก Inventory</span>
              {[...bill!.flavorLines, ...bill!.itemLines].map((l) => {
                const b = byId.get(l.skuId);
                const left = b ? b.available - l.qty : 0;
                return (
                  <span key={l.skuId} className={left < 0 ? s.neg : undefined}>
                    {l.name} −{l.qty} → เหลือ {left}{left < 0 ? " (ไม่พอ)" : ""}
                  </span>
                );
              })}
            </div>
            <Pay sell={sell} />
          </>
        )}
        <button
          type="button"
          className={s.sellBtn}
          disabled={isEmpty || sell.cashShort || sell.isSelling}
          onClick={onSell}
        >
          {sell.isSelling ? "กำลังบันทึก…" : `ขายแล้ว${isEmpty ? "" : ` · ${baht(bill!.total)}`}`}
        </button>
        <div className={s.ghostRow}>
          <button type="button" className={s.ghost} disabled={isEmpty} onClick={sell.clear}>ล้างตะกร้า</button>
          {onUndoLast && (
            <button type="button" className={s.ghost} disabled={!canUndoLast} onClick={onUndoLast}>ยกเลิกบิลล่าสุด</button>
          )}
        </div>
      </aside>
    </section>
  );
}
