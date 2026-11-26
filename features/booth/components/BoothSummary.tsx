"use client";

import { baht, payLabel } from "../lib/pricing";
import type { BoothCatalog, BoothSale } from "../types/booth";
import s from "./booth.module.css";

interface Props {
  catalog: BoothCatalog;
  date: string;
  onDateChange: (date: string) => void;
  onToday: () => void;
  sales: BoothSale[];
  isLoading: boolean;
  error?: string;
  onVoid: (sale: BoothSale) => void;
}

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" });

export function BoothSummary({ catalog, date, onDateChange, onToday, sales, isLoading, error, onVoid }: Props) {
  const live = sales.filter((b) => b.status !== "voided");
  const revenue = live.reduce((a, b) => a + b.total, 0);
  const bags = live.reduce((a, b) => a + b.bags, 0);
  const discounts = live.reduce((a, b) => a + b.discount, 0);
  const treatRevenue = live.reduce((a, b) => a + b.treatTotal, 0);

  const color = new Map(catalog.config.flavors.map((f) => [f.skuId, f.color]));
  const order = catalog.buttons.map((b) => b.skuId);
  const products = new Map<number, { name: string; kind: string; skuCode: string; qty: number; amount: number }>();
  live.forEach((b) => b.lines.forEach((l) => {
    const p = products.get(l.skuId) ?? { name: l.name, kind: l.kind, skuCode: l.skuCode, qty: 0, amount: 0 };
    products.set(l.skuId, { ...p, qty: p.qty + l.qty, amount: p.amount + l.amount });
  }));
  const productRows = [...products.entries()].sort(
    ([a], [b]) => (order.indexOf(a) < 0 ? 999 : order.indexOf(a)) - (order.indexOf(b) < 0 ? 999 : order.indexOf(b)),
  );

  const sets = new Map<number, number>();
  live.forEach((b) => b.treatParts.forEach((p) => sets.set(p.size, (sets.get(p.size) ?? 0) + p.count)));
  const setRows = [...sets.entries()].sort((a, b) => a[0] - b[0]);

  const sellers = new Map<string, { bills: number; bags: number; revenue: number }>();
  live.forEach((b) => {
    const key = b.sellerName || "ไม่ระบุผู้ขาย";
    const r = sellers.get(key) ?? { bills: 0, bags: 0, revenue: 0 };
    sellers.set(key, { bills: r.bills + 1, bags: r.bags + b.bags, revenue: r.revenue + b.total });
  });

  const pays = new Map<string, { bills: number; revenue: number }>();
  live.forEach((b) => {
    const r = pays.get(b.paymentMethod) ?? { bills: 0, revenue: 0 };
    pays.set(b.paymentMethod, { bills: r.bills + 1, revenue: r.revenue + b.total });
  });
  const cashRevenue = pays.get("cash")?.revenue ?? 0;

  return (
    <div className={s.stack}>
      <div className={s.toolbar}>
        <input
          id="boothSummaryDate"
          type="date"
          className={s.dateInput}
          value={date}
          aria-label="เลือกวัน"
          onChange={(e) => e.target.value && onDateChange(e.target.value)}
        />
        <button type="button" className={`${s.btn} ${s.btnAlt}`} onClick={onToday}>วันนี้</button>
        <span className={s.grow} />
      </div>

      {error && <div className={`${s.panel} ${s.errorBox}`}>{error}</div>}

      <div className={s.kpis}>
        <div className={s.kpi}><small>ยอดขายสุทธิ</small><strong>{baht(revenue)}</strong></div>
        <div className={s.kpi}><small>จำนวนบิล</small><strong>{live.length}</strong></div>
        <div className={s.kpi}><small>ขนมที่ขายได้ (ถุง)</small><strong>{bags}</strong></div>
        <div className={s.kpi}><small>ส่วนลดที่ให้ไป</small><strong>{baht(discounts)}</strong></div>
      </div>

      {isLoading ? (
        <div className={`${s.panel} ${s.empty}`}>กำลังโหลดบิล…</div>
      ) : sales.length === 0 ? (
        <div className={`${s.panel} ${s.empty}`}>ยังไม่มีบิลในวันนี้</div>
      ) : (
        <>
          {live.length > 0 && (
            <>
              <div className={s.cols}>
                <div className={s.panel}>
                  <h2 className={s.sectionLabel}>ขายอะไรไปเท่าไหร่ (ตัดจาก Inventory)</h2>
                  <div className={s.tableWrap}>
                    <table className={s.table}>
                      <thead><tr><th>สินค้า</th><th className={s.num}>จำนวน</th><th className={s.num}>ยอดขาย</th></tr></thead>
                      <tbody>
                        {productRows.map(([id, r]) => (
                          <tr key={id}>
                            <td>
                              <span className={s.dot} style={{ background: r.kind === "flavor" ? color.get(id) ?? "#C17A52" : "var(--ink)" }} />
                              {r.name}<br /><span className={s.sku}>{r.skuCode}</span>
                            </td>
                            <td className={s.num}>{r.qty}</td>
                            <td className={s.num}>{r.kind === "item" ? baht(r.amount) : `≈ ${baht(r.amount)}`}</td>
                          </tr>
                        ))}
                        <tr>
                          <td><b>ขนมทุกรสรวม (ตามเซต)</b></td>
                          <td className={s.num}><b>{bags}</b></td>
                          <td className={s.num}><b>{baht(treatRevenue)}</b></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className={s.note}>
                    ยอดก่อนหักส่วนลด ขนมคิดราคาเป็นเซตรวมทุกรส ยอดรายรส (≈) จึงแบ่งตามสัดส่วนจำนวนถุงในแต่ละบิล
                  </p>
                </div>
                <div className={s.panel}>
                  <h2 className={s.sectionLabel}>จำนวนเซตที่ขายได้</h2>
                  {setRows.length ? (
                    <div className={s.tableWrap}>
                      <table className={s.table}>
                        <thead><tr><th>เซต</th><th className={s.num}>จำนวนครั้ง</th></tr></thead>
                        <tbody>{setRows.map(([size, count]) => <tr key={size}><td>เซต {size}</td><td className={s.num}>{count}</td></tr>)}</tbody>
                      </table>
                    </div>
                  ) : <p className={s.muted}>ยังไม่มีขนม</p>}
                </div>
              </div>

              <div className={s.panel}>
                <h2 className={s.sectionLabel}>ยอดแยกตามผู้ขาย (ตามบัญชีที่ล็อกอิน)</h2>
                <div className={s.tableWrap}>
                  <table className={s.table}>
                    <thead><tr><th>ผู้ขาย</th><th className={s.num}>บิล</th><th className={s.num}>ขนม (ถุง)</th><th className={s.num}>ยอดสุทธิ</th></tr></thead>
                    <tbody>
                      {[...sellers.entries()].map(([name, r]) => (
                        <tr key={name}><td>{name}</td><td className={s.num}>{r.bills}</td><td className={s.num}>{r.bags}</td><td className={s.num}><b>{baht(r.revenue)}</b></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={s.panel}>
                <h2 className={s.sectionLabel}>ยอดแยกตามช่องทางชำระเงิน</h2>
                <div className={s.tableWrap}>
                  <table className={s.table}>
                    <thead><tr><th>ช่องทาง</th><th className={s.num}>บิล</th><th className={s.num}>ยอดสุทธิ</th></tr></thead>
                    <tbody>
                      {[...pays.entries()].map(([m, r]) => (
                        <tr key={m}><td>{payLabel(m)}</td><td className={s.num}>{r.bills}</td><td className={s.num}><b>{baht(r.revenue)}</b></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {cashRevenue > 0 && (
                  <p className={s.note}>เงินสดที่ควรมีเพิ่มในลิ้นชัก (ไม่รวมเงินทอนตั้งต้น): <b>{baht(cashRevenue)}</b></p>
                )}
              </div>
            </>
          )}

          <div className={s.panel}>
            <h2 className={s.sectionLabel}>รายการบิล</h2>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>เวลา</th><th>รายการ</th><th className={s.num}>ยอด</th><th /></tr></thead>
                <tbody>
                  {[...sales].reverse().map((b) => (
                    <tr key={b.id} className={b.status === "voided" ? s.voided : undefined}>
                      <td>{timeOf(b.createdAt)}<br /><span className={s.muted}>{b.saleNo} · {b.sellerName || "ไม่ระบุผู้ขาย"}</span></td>
                      <td>
                        {b.lines.map((l) => `${l.name} ${l.qty}`).join(" · ")}
                        {b.bags > 0 && <><br /><span className={s.muted}>{b.treatLabel}</span></>}
                      </td>
                      <td className={s.num}>
                        <b>{baht(b.total)}</b>
                        {b.discount > 0 && <><br /><span className={s.muted}>ลด {baht(b.discount)}</span></>}
                        <br /><span className={s.muted}>{payLabel(b.paymentMethod)}{b.change > 0 ? ` · ทอน ${baht(b.change)}` : ""}</span>
                      </td>
                      <td className={s.num}>
                        {b.status === "voided"
                          ? <span className={s.tagVoid} title={b.voidReason || undefined}>ยกเลิกแล้ว</span>
                          : <button type="button" className={s.smallBtn} onClick={() => onVoid(b)}>ยกเลิก</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={s.note}>ยกเลิกบิลแล้วบิลยังอยู่ในรายการ และ ERP คืนสต็อกเข้า Inventory ล็อตเดิม อ้างเลขบิลเดิม</p>
          </div>
        </>
      )}
    </div>
  );
}
