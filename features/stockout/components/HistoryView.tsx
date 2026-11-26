"use client";

import { useMemo, useState } from "react";
import { useStockOutHistoryQuery } from "../queries/stockoutQueries";
import { bangkokDay } from "../lib/queue";
import type { StockOutBox } from "../types/stockout";
import { boxColor } from "./TodayView";
import b from "@/features/booth/components/booth.module.css";
import s from "./stockout.module.css";

interface Column {
  key: string;
  name: string;
  color: string;
  skus: number[];
}

/** Columns per box, or one column per group when groups are combined. */
export function historyColumns(boxes: StockOutBox[], combine: boolean): Column[] {
  const cols: Column[] = [];
  const groups = new Map<string, Column>();
  boxes.forEach((x, i) => {
    if (combine && x.group) {
      const g = groups.get(x.group);
      if (g) {
        g.skus.push(x.skuId);
        return;
      }
      const col = { key: `g:${x.group}`, name: `${x.group} (รวม)`, color: boxColor(x, i), skus: [x.skuId] };
      groups.set(x.group, col);
      cols.push(col);
      return;
    }
    cols.push({ key: `s:${x.skuId}`, name: x.name, color: boxColor(x, i), skus: [x.skuId] });
  });
  return cols;
}

export function toCsv(rows: (string | number)[][]) {
  const cell = (v: string | number) => {
    const t = String(v ?? "");
    return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  // BOM so Excel reads Thai correctly
  return "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n");
}

function daysBetween(from: string, to: string) {
  const out: string[] = [];
  const d = new Date(`${from}T12:00:00+07:00`);
  const end = new Date(`${to}T12:00:00+07:00`);
  while (d <= end && out.length < 93) {
    out.push(bangkokDay(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** The "ย้อนหลัง" screen: out per product per day, table + bars, CSV export. */
export function HistoryView({ boxes }: { boxes: StockOutBox[] }) {
  const [today] = useState(() => bangkokDay(new Date()));
  const [from, setFrom] = useState(() => bangkokDay(new Date(Date.now() - 6 * 86400000)));
  const [to, setTo] = useState(today);
  const [combine, setCombine] = useState(false);
  const q = useStockOutHistoryQuery(from <= to ? from : to, from <= to ? to : from);

  const cols = useMemo(() => historyColumns(boxes, combine), [boxes, combine]);
  const days = useMemo(() => daysBetween(from <= to ? from : to, from <= to ? to : from), [from, to]);
  const byDay = useMemo(() => {
    const m = new Map<string, Map<number, number>>();
    (q.data ?? []).forEach((r) => {
      const row = m.get(r.date) ?? new Map<number, number>();
      row.set(r.skuId, (row.get(r.skuId) ?? 0) + r.qty);
      m.set(r.date, row);
    });
    return m;
  }, [q.data]);
  const cellOf = (day: string, col: Column) => col.skus.reduce((a, id) => a + (byDay.get(day)?.get(id) ?? 0), 0);
  const dayTotal = (day: string) => cols.reduce((a, c) => a + cellOf(day, c), 0);
  const maxDay = Math.max(1, ...days.map(dayTotal));

  const exportCsv = () => {
    const rows: (string | number)[][] = [["วันที่", ...cols.map((c) => c.name), "รวม"]];
    days.forEach((d) => rows.push([d, ...cols.map((c) => cellOf(d, c)), dayTotal(d)]));
    rows.push(["รวม", ...cols.map((c) => days.reduce((a, d) => a + cellOf(d, c), 0)), days.reduce((a, d) => a + dayTotal(d), 0)]);
    const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `chawy-stock-out-${from}-${to}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className={b.stack}>
      <div className={b.toolbar}>
        <label className={b.field}>ตั้งแต่<input id="so-from" type="date" className={b.dateInput} value={from} max={today} onChange={(e) => e.target.value && setFrom(e.target.value)} /></label>
        <label className={b.field}>ถึง<input id="so-to" type="date" className={b.dateInput} value={to} max={today} onChange={(e) => e.target.value && setTo(e.target.value)} /></label>
        <label className={b.switch} htmlFor="so-combine"><input id="so-combine" type="checkbox" checked={combine} onChange={(e) => setCombine(e.target.checked)} /> รวมหัวไม้ตกแมวทุกแบบ</label>
        <span className={b.grow} />
        <button type="button" className={b.btn} disabled={!q.data?.length} onClick={exportCsv}>ส่งออก CSV</button>
      </div>
      {q.isError && <div className={`${b.panel} ${b.errorBox}`}>{q.error instanceof Error ? q.error.message : "โหลดไม่สำเร็จ"}</div>}
      <div className={b.panel}>
        <h2 className={b.sectionLabel}>จำนวนที่ออกต่อวัน</h2>
        <div className={s.chart}>
          {days.map((d) => (
            <div key={d} className={s.chartRow}>
              <span>{d.slice(5)}</span>
              <div className={s.bar} style={{ width: `${(dayTotal(d) / maxDay) * 100}%` }}>
                {cols.map((c) => {
                  const v = cellOf(d, c);
                  return v ? <span key={c.key} className={s.seg} style={{ flex: v, background: c.color }} title={`${c.name} ${v}`} /> : null;
                })}
              </div>
              <span className={b.num}>{dayTotal(d)}</span>
            </div>
          ))}
        </div>
        <div className={s.legend}>{cols.map((c) => <span key={c.key}><i className={s.swatch} style={{ background: c.color }} />{c.name}</span>)}</div>
      </div>
      <div className={b.panel}>
        <div className={b.tableWrap}>
          <table className={b.table}>
            <thead><tr><th>วันที่</th>{cols.map((c) => <th key={c.key} className={b.num}>{c.name}</th>)}<th className={b.num}>รวม</th></tr></thead>
            <tbody>
              {days.map((d) => (
                <tr key={d}><td>{d}</td>{cols.map((c) => <td key={c.key} className={b.num}>{cellOf(d, c) || ""}</td>)}<td className={b.num}><b>{dayTotal(d)}</b></td></tr>
              ))}
              <tr>
                <td><b>รวม</b></td>
                {cols.map((c) => <td key={c.key} className={b.num}><b>{days.reduce((a, d) => a + cellOf(d, c), 0)}</b></td>)}
                <td className={b.num}><b>{days.reduce((a, d) => a + dayTotal(d), 0)}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
        {q.isLoading && <p className={b.note}>กำลังโหลด…</p>}
      </div>
    </div>
  );
}
