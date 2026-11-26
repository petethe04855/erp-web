"use client";

import { useState } from "react";
import { Lock, Plus, Trash2 } from "lucide-react";
import { SKUSelect } from "@/features/sku/components/SKUSelect";
import { useSaveBoothConfigMutation } from "../queries/boothQueries";
import type { BoothCatalog, BoothConfig, BoothDiscount, BoothSet } from "../types/booth";
import s from "./booth.module.css";

interface Row {
  skuId: number;
  skuCode: string;
  name: string;
  color: string;
  price: number;
}

const FLAVOR_COLORS = ["#D71920", "#0047B8", "#D6005B", "#1f7a3d", "#C17A52", "#6b21a8"];

function toRows(catalog: BoothCatalog, kind: "flavor" | "item"): Row[] {
  return catalog.buttons
    .filter((b) => b.kind === kind)
    .map((b) => ({ skuId: b.skuId, skuCode: b.skuCode, name: b.name, color: b.color ?? "#D71920", price: b.price ?? 0 }));
}

const num = (v: string) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

interface Props {
  catalog: BoothCatalog;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}

/** Owner-only: which SKUs are booth buttons, set prices and the discount. */
export function BoothSettings({ catalog, onSaved, onError }: Props) {
  const [flavors, setFlavors] = useState<Row[]>(() => toRows(catalog, "flavor"));
  const [items, setItems] = useState<Row[]>(() => toRows(catalog, "item"));
  const [sets, setSets] = useState<BoothSet[]>(() => catalog.config.sets.map((x) => ({ ...x })));
  const [discount, setDiscount] = useState<BoothDiscount>(() => ({ ...catalog.config.discount }));
  const [newSize, setNewSize] = useState("");
  const save = useSaveBoothConfigMutation();

  const update = (list: Row[], set: (r: Row[]) => void, i: number, patch: Partial<Row>) =>
    set(list.map((r, k) => (k === i ? { ...r, ...patch } : r)));

  const submit = async () => {
    const config: BoothConfig = {
      warehouseId: catalog.config.warehouseId,
      flavors: flavors.map((r) => ({ skuId: r.skuId, name: r.name.trim(), color: r.color })),
      items: items.map((r) => ({ skuId: r.skuId, name: r.name.trim(), price: r.price })),
      sets,
      discount,
    };
    if ([...config.flavors, ...config.items].some((r) => !r.skuId)) {
      onError("ทุกปุ่มต้องเลือก SKU ก่อนบันทึก");
      return;
    }
    try {
      await save.mutateAsync(config);
      onSaved("บันทึกตั้งค่าบูธแล้ว");
    } catch (e) {
      onError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    }
  };

  const rowEditor = (kind: "flavor" | "item", list: Row[], set: (r: Row[]) => void) =>
    list.map((r, i) => (
      <div key={`${kind}-${i}`} className={s.buttonRow}>
        <div className={`${s.field} ${s.buttonRowSelect}`}>
          SKU ใน Inventory
          <SKUSelect
            value={r.skuCode}
            excludeBundle
            showDetails={false}
            onChange={(code, data) =>
              update(list, set, i, {
                skuCode: code,
                skuId: data ? Number(data.id) : 0,
                name: r.name || data?.name || "",
                price: kind === "item" && !r.price ? Number(data?.price ?? 0) : r.price,
              })
            }
          />
        </div>
        <label className={s.field}>
          ชื่อบนปุ่ม
          <input id={`booth-${kind}-name-${i}`} type="text" value={r.name} onChange={(e) => update(list, set, i, { name: e.target.value })} />
        </label>
        {kind === "flavor" ? (
          <label className={s.field}>
            สี
            <input id={`booth-flavor-color-${i}`} className={s.colorInput} type="color" value={r.color} onChange={(e) => update(list, set, i, { color: e.target.value.toUpperCase() })} />
          </label>
        ) : (
          <label className={s.field}>
            ราคา (฿)
            <input id={`booth-item-price-${i}`} type="number" inputMode="numeric" min={0} step={1} value={r.price} onChange={(e) => update(list, set, i, { price: num(e.target.value) })} />
          </label>
        )}
        <button type="button" className={s.iconBtn} aria-label={`ลบปุ่ม ${r.name || "นี้"}`} title="ลบปุ่มนี้" onClick={() => set(list.filter((_, k) => k !== i))}>
          <Trash2 size={18} />
        </button>
      </div>
    ));

  return (
    <div className={s.stack}>
      <div className={s.panel}>
        <h2 className={s.sectionLabel}>ขนม (ขายเป็นถุง คิดราคาตามเซต ผสมรสได้)</h2>
        {rowEditor("flavor", flavors, setFlavors)}
        <button
          type="button"
          className={`${s.btn} ${s.btnAlt}`}
          onClick={() => setFlavors([...flavors, { skuId: 0, skuCode: "", name: "", color: FLAVOR_COLORS[flavors.length % FLAVOR_COLORS.length], price: 0 }])}
        >
          + เพิ่มรส
        </button>
        <p className={s.note}>ทุกถุงที่ขายจะตัดสต็อก SKU ของรสนั้นใน Inventory คลังหลัก ไม่ได้ผูกเป็นสูตรสินค้า</p>
      </div>

      <div className={s.panel}>
        <h2 className={s.sectionLabel}>ราคาเซตขนม (ราคารวมทั้งเซต)</h2>
        <div className={s.setGrid}>
          {sets.map((x, i) => (
            <div key={x.size} className={s.field}>
              <label htmlFor={`booth-set-${x.size}`}>เซต {x.size} ถุง (฿)</label>
              <div className={s.inputRow}>
                <input id={`booth-set-${x.size}`} type="number" inputMode="numeric" min={0} step={1} value={x.price}
                  onChange={(e) => setSets(sets.map((y, k) => (k === i ? { ...y, price: num(e.target.value) } : y)))} />
                {x.size === 1 ? (
                  <span className={s.lockTag} title="ต้องมีเซต 1 ถุงเสมอ" aria-label="ลบไม่ได้"><Lock size={18} /></span>
                ) : (
                  <button type="button" className={s.iconBtn} aria-label={`ลบเซต ${x.size} ถุง`} title="ลบเซตนี้"
                    onClick={() => setSets(sets.filter((_, k) => k !== i))}><Trash2 size={18} /></button>
                )}
              </div>
            </div>
          ))}
          <div className={s.field}>
            <label htmlFor="booth-set-new">เพิ่มเซตขนาด (ถุง)</label>
            <div className={s.inputRow}>
              <input id="booth-set-new" type="number" inputMode="numeric" min={2} max={100} placeholder="เช่น 20" value={newSize} onChange={(e) => setNewSize(e.target.value)} />
              <button
                type="button"
                className={`${s.iconBtn} ${s.iconAdd}`}
                aria-label="เพิ่มเซต"
                title="เพิ่มเซต"
                disabled={!(num(newSize) > 1) || sets.some((x) => x.size === num(newSize))}
                onClick={() => { setSets([...sets, { size: num(newSize), price: 0 }].sort((a, b) => a.size - b.size)); setNewSize(""); }}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>
        <p className={s.note}>ต้องมีเซต 1 ถุงเสมอ ระบบเลือกชุดเซตที่ถูกที่สุดให้ลูกค้าเอง</p>
      </div>

      <div className={s.panel}>
        <h2 className={s.sectionLabel}>สินค้าอื่น (ราคาต่อชิ้น ไม่นับเข้าเซต)</h2>
        {rowEditor("item", items, setItems)}
        <button type="button" className={`${s.btn} ${s.btnAlt}`} onClick={() => setItems([...items, { skuId: 0, skuCode: "", name: "", color: "", price: 0 }])}>
          + เพิ่มสินค้า
        </button>
      </div>

      <div className={s.panel}>
        <h2 className={s.sectionLabel}>ส่วนลดเมื่อยอดถึงขั้นต่ำ</h2>
        <label className={s.switch} htmlFor="booth-disc-enabled">
          <input id="booth-disc-enabled" type="checkbox" checked={discount.enabled} onChange={(e) => setDiscount({ ...discount, enabled: e.target.checked })} />
          เปิดใช้ส่วนลด
        </label>
        <div className={s.formGrid}>
          <label className={s.field}>
            ยอดขั้นต่ำ (฿)
            <input id="booth-disc-min" type="number" inputMode="numeric" min={0} step={1} value={discount.min} onChange={(e) => setDiscount({ ...discount, min: num(e.target.value) })} />
          </label>
          <label className={s.field}>
            ชนิดส่วนลด
            <select id="booth-disc-type" value={discount.type} onChange={(e) => setDiscount({ ...discount, type: e.target.value === "percent" ? "percent" : "baht" })}>
              <option value="baht">ลดเป็นบาท</option>
              <option value="percent">ลดเป็น %</option>
            </select>
          </label>
          <label className={s.field}>
            ค่าส่วนลด
            <input id="booth-disc-value" type="number" inputMode="numeric" min={0} step={1} value={discount.value} onChange={(e) => setDiscount({ ...discount, value: num(e.target.value) })} />
          </label>
        </div>
        <p className={s.note}>คิดจากยอดรวมทั้งบิลหลังคิดเซตแล้ว</p>
      </div>

      <div className={s.toolbar}>
        <span className={s.muted}>
          {catalog.updatedAt ? `แก้ล่าสุด ${new Date(catalog.updatedAt).toLocaleString("th-TH")} โดย ${catalog.updatedBy}` : "ยังไม่เคยบันทึก (ใช้ราคาเซตตั้งต้น)"}
        </span>
        <span className={s.grow} />
        <button type="button" className={s.btn} disabled={save.isPending} onClick={submit}>
          {save.isPending ? "กำลังบันทึก…" : "บันทึกตั้งค่า"}
        </button>
      </div>
    </div>
  );
}
