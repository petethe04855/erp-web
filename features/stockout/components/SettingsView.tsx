"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { SKUSelect } from "@/features/sku/components/SKUSelect";
import { stockoutApi } from "../api/stockoutApi";
import { useSaveStockOutConfigMutation } from "../queries/stockoutQueries";
import type { BoxKind, StockOutBox, StockOutConfigView } from "../types/stockout";
import b from "@/features/booth/components/booth.module.css";
import s from "./stockout.module.css";

interface Row extends StockOutBox {
  skuCode: string;
}

const ROLES = [
  { id: "warehouse", label: "คลัง (warehouse)" },
  { id: "sales", label: "ขาย (sales)" },
  { id: "accountant", label: "บัญชี (accountant)" },
];
const FLAVOR_COLORS = ["#D71920", "#0047B8", "#D6005B", "#1f7a3d", "#C17A52", "#6b21a8"];
const num = (v: string) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

interface Props {
  view: StockOutConfigView;
  onSaved: (m: string) => void;
  onError: (m: string) => void;
}

/** Owner-only: boxes mapped to ERP SKUs, order, photos, warehouse, low-stock levels and who may count/void. */
export function SettingsView({ view, onSaved, onError }: Props) {
  const [rows, setRows] = useState<Row[]>(() =>
    view.config.boxes.map((x) => ({ ...x, skuCode: view.skuCodes[String(x.skuId)] ?? "" })),
  );
  const [warehouseId, setWarehouseId] = useState(view.config.warehouseId || 1);
  const [countRoles, setCountRoles] = useState<string[]>(view.config.countRoles);
  const [voidRoles, setVoidRoles] = useState<string[]>(view.config.voidRoles);
  const [uploading, setUploading] = useState<number | null>(null);
  const save = useSaveStockOutConfigMutation();

  const patch = (i: number, p: Partial<Row>) => setRows(rows.map((r, k) => (k === i ? { ...r, ...p } : r)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
  };
  const add = (kind: BoxKind) =>
    setRows([
      ...rows,
      {
        skuId: 0, skuCode: "", name: "", kind,
        group: kind === "item" ? "" : "", unit: kind === "flavor" ? "ถุง" : "ชิ้น",
        color: kind === "flavor" ? FLAVOR_COLORS[rows.filter((r) => r.kind === "flavor").length % FLAVOR_COLORS.length] : "",
        image: "", lowStock: 0,
      },
    ]);
  const toggle = (list: string[], set: (v: string[]) => void, role: string, on: boolean) =>
    set(on ? [...new Set([...list, role])] : list.filter((r) => r !== role));

  const upload = async (i: number, file: File | undefined) => {
    if (!file) return;
    setUploading(i);
    try {
      patch(i, { image: await stockoutApi.uploadImage(file) });
    } catch (e) {
      onError(e instanceof Error ? e.message : "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setUploading(null);
    }
  };

  const submit = async () => {
    if (rows.some((r) => !r.skuId)) {
      onError("ทุกกล่องต้องเลือก SKU ก่อนบันทึก");
      return;
    }
    try {
      await save.mutateAsync({
        warehouseId,
        boxes: rows.map((r) => ({
          skuId: r.skuId, name: r.name.trim(), kind: r.kind, group: r.group,
          unit: r.unit, color: r.color, image: r.image, lowStock: r.lowStock,
        })),
        countRoles,
        voidRoles,
      });
      onSaved("บันทึกตั้งค่าแล้ว");
    } catch (e) {
      onError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    }
  };

  return (
    <div className={b.stack}>
      <div className={b.panel}>
        <h2 className={b.sectionLabel}>กล่องบนหน้านับออก (เรียงตามลำดับที่แสดง)</h2>
        {rows.length === 0 && <p className={b.muted}>ยังไม่มีกล่อง เพิ่มรสขนม ทรายแมว และหัวไม้ตกแมวแต่ละแบบด้านล่าง</p>}
        {rows.map((r, i) => (
          <div key={i} className={s.boxRow}>
            <div className={s.orderBtns}>
              <button type="button" className={b.smallBtn} aria-label="เลื่อนขึ้น" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
              <button type="button" className={b.smallBtn} aria-label="เลื่อนลง" onClick={() => move(i, 1)} disabled={i === rows.length - 1}>↓</button>
            </div>
            <div className={b.field}>
              SKU ใน Inventory
              <SKUSelect
                value={r.skuCode}
                excludeBundle
                showDetails={false}
                onChange={(code, data) => patch(i, { skuCode: code, skuId: data ? Number(data.id) : 0, name: r.name || data?.name || "", image: r.image || data?.image || "" })}
              />
            </div>
            <label className={b.field}>ชื่อบนกล่อง<input id={`so-name-${i}`} type="text" value={r.name} onChange={(e) => patch(i, { name: e.target.value })} /></label>
            <label className={b.field}>
              แบบกล่อง
              <select id={`so-kind-${i}`} value={r.kind} onChange={(e) => patch(i, { kind: e.target.value === "flavor" ? "flavor" : "item", color: e.target.value === "flavor" && !r.color ? FLAVOR_COLORS[0] : r.color })}>
                <option value="flavor">รสขนม (สีเต็ม)</option>
                <option value="item">สินค้าอื่น</option>
              </select>
            </label>
            {r.kind === "flavor" ? (
              <label className={b.field}>สี<input id={`so-color-${i}`} className={b.colorInput} type="color" value={r.color || "#D71920"} onChange={(e) => patch(i, { color: e.target.value.toUpperCase() })} /></label>
            ) : (
              <label className={b.field}>กลุ่ม (รวมยอด)<input id={`so-group-${i}`} type="text" placeholder="เช่น หัวไม้ตกแมว" value={r.group} onChange={(e) => patch(i, { group: e.target.value })} /></label>
            )}
            <label className={b.field}>หน่วย<input id={`so-unit-${i}`} type="text" value={r.unit} onChange={(e) => patch(i, { unit: e.target.value })} /></label>
            <label className={b.field}>เตือนเมื่อเหลือ ≤<input id={`so-low-${i}`} type="number" inputMode="numeric" min={0} value={r.lowStock} onChange={(e) => patch(i, { lowStock: num(e.target.value) })} /></label>
            <div className={s.imgCell}>
              {/* eslint-disable-next-line @next/next/no-img-element -- uploaded box photos come from the ERP upload host */}
              {r.image && <img className={s.thumb} src={r.image} alt="" />}
              <label className={b.smallBtn} style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                {uploading === i ? "กำลังอัป…" : r.image ? "เปลี่ยนรูป" : "ใส่รูป"}
                <input type="file" accept="image/png,image/jpeg" hidden onChange={(e) => upload(i, e.target.files?.[0])} />
              </label>
              <button type="button" className={b.iconBtn} aria-label={`ลบกล่อง ${r.name || "นี้"}`} title="ลบกล่องนี้" onClick={() => setRows(rows.filter((_, k) => k !== i))}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        <div className={b.toolbar} style={{ marginTop: 14 }}>
          <button type="button" className={`${b.btn} ${b.btnAlt}`} onClick={() => add("flavor")}>+ รสขนม</button>
          <button type="button" className={`${b.btn} ${b.btnAlt}`} onClick={() => add("item")}>+ สินค้าอื่น / หัวไม้ตกแมว</button>
        </div>
        <p className={b.note}>หัวไม้ตกแมวแต่ละแบบเป็นกล่องแยกที่มี SKU และรูปของตัวเอง ใส่กลุ่มเดียวกัน (เช่น &quot;หัวไม้ตกแมว&quot;) เพื่อดูยอดรวมทุกแบบได้</p>
      </div>

      <div className={b.panel}>
        <h2 className={b.sectionLabel}>คลังและสิทธิ์</h2>
        <div className={b.formGrid}>
          <label className={b.field}>คลังที่ตัดออก (warehouse id)<input id="so-wh" type="number" min={1} value={warehouseId} onChange={(e) => setWarehouseId(Math.max(1, num(e.target.value)))} /></label>
        </div>
        <p className={b.field} style={{ marginTop: 14 }}>ใครนับได้ (owner ได้เสมอ)</p>
        <div className={s.roles}>
          {ROLES.map((r) => (
            <label key={r.id} className={b.switch} htmlFor={`so-count-${r.id}`}>
              <input id={`so-count-${r.id}`} type="checkbox" checked={countRoles.includes(r.id)} onChange={(e) => toggle(countRoles, setCountRoles, r.id, e.target.checked)} /> {r.label}
            </label>
          ))}
        </div>
        <p className={b.field} style={{ marginTop: 14 }}>ใครยกเลิกรอบย้อนหลังได้ (คนนับยกเลิกรอบของตัวเองได้ทันทีหลังบันทึก)</p>
        <div className={s.roles}>
          {ROLES.map((r) => (
            <label key={r.id} className={b.switch} htmlFor={`so-void-${r.id}`}>
              <input id={`so-void-${r.id}`} type="checkbox" checked={voidRoles.includes(r.id)} onChange={(e) => toggle(voidRoles, setVoidRoles, r.id, e.target.checked)} /> {r.label}
            </label>
          ))}
        </div>
        <p className={b.note}>สิทธิ์ตรวจที่เซิร์ฟเวอร์ตาม role ของ ERP</p>
      </div>

      <div className={b.toolbar}>
        <span className={b.muted}>{view.updatedAt ? `แก้ล่าสุด ${new Date(view.updatedAt).toLocaleString("th-TH")} โดย ${view.updatedBy}` : "ยังไม่เคยบันทึก"}</span>
        <span className={b.grow} />
        <button type="button" className={b.btn} disabled={save.isPending} onClick={submit}>{save.isPending ? "กำลังบันทึก…" : "บันทึกตั้งค่า"}</button>
      </div>
    </div>
  );
}
