"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useErpStore } from "@/lib/store/useErpStore";
import { readApiResponse } from "@/lib/apiResponse";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, TopBar } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { ValidationAlert } from "@/components/ValidationAlert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type BOMComponent = {
  componentSku: string;
  componentName: string;
  qty: number;
  unit: string;
  scrapRate?: number;
  yieldFactor?: number;
  componentType?: string;
};

type BOMOption = {
  id: number;
  code: string;
  fgSku: string;
  status: string;
  outputQty: number;
  outputUnit?: string;
  cost: number;
  maxProducibleQty?: number;
  components?: BOMComponent[];
};

type ProductionRun = {
  id: number;
  code: string;
  sku: string;
  skuName: string;
  bomCode: string;
  qty: number;
  lot: string;
  expiryDate?: string;
  date: string;
  producedBy: string;
};

const getApiUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getHeaders(json = false) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("chawy_token") : "";
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    Authorization: token ? `Bearer ${token}` : "",
  };
}

function grossQty(component: BOMComponent, productionQty: number, outputQty: number) {
  const net =
    (component.qty / Math.max(outputQty, 1) / (component.yieldFactor || 1)) *
    productionQty;
  return component.scrapRate
    ? net / (1 - component.scrapRate / 100)
    : net;
}

function convertQty(qty: number, fromUnit: string, toUnit: string) {
  if (fromUnit === toUnit) return qty;
  if (fromUnit === "g" && toUnit === "kg") return qty / 1000;
  if (fromUnit === "kg" && toUnit === "g") return qty * 1000;
  return qty;
}

function availableFromBom(
  bom: BOMOption,
  products: ReturnType<typeof useErpStore.getState>["products"],
) {
  const capacities = (bom.components || [])
    .filter(
      (component) =>
        component.componentType !== "expense" && component.componentSku,
    )
    .map((component) => {
      const product = products.find(
        (item) => item.sku === component.componentSku,
      );
      if (!product) return 0;
      const requiredPerUnit = convertQty(
        grossQty(component, 1, bom.outputQty),
        component.unit,
        product.baseUnit || component.unit,
      );
      return requiredPerUnit > 0
        ? Math.floor(
            Math.max(0, product.stock - product.reservedQty) /
              requiredPerUnit,
          )
        : 0;
    });
  return capacities.length ? Math.min(...capacities) : 0;
}

export default function ProductionRunPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const products = useErpStore((state) => state.products);
  const loadResources = useErpStore((state) => state.loadResources);
  const [boms, setBoms] = useState<BOMOption[]>([]);
  const [runs, setRuns] = useState<ProductionRun[]>([]);
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState(200);
  const [lot, setLot] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadPageData = useCallback(async () => {
    try {
      const [bomResponse, runResponse] = await Promise.all([
        fetch(`${getApiUrl()}/api/boms`, { headers: getHeaders() }),
        fetch(`${getApiUrl()}/api/production-runs`, { headers: getHeaders() }),
      ]);
      const [bomData, runData] = await Promise.all([
        readApiResponse<BOMOption[]>(bomResponse),
        readApiResponse<ProductionRun[]>(runResponse),
      ]);
      const active = (bomData || []).filter(
        (bom) => bom.status === "Active" && bom.fgSku,
      );
      setBoms(active);
      setRuns(runData || []);
      setSku((current) =>
        current && active.some((bom) => bom.fgSku === current)
          ? current
          : active[0]?.fgSku || "",
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "ไม่สามารถโหลดข้อมูลการผลิตได้",
      );
    }
  }, []);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  const selectedBom = boms.find((bom) => bom.fgSku === sku);
  const selectedProduct = products.find((product) => product.sku === sku);
  const maxQty = selectedBom
    ? (selectedBom.maxProducibleQty ?? availableFromBom(selectedBom, products))
    : 0;
  const exceedsCapacity = Boolean(selectedBom && qty > maxQty);
  const materialLines = useMemo(
    () =>
      (selectedBom?.components || [])
        .filter(
          (component) =>
            component.componentType !== "expense" && component.componentSku,
        )
        .map((component) => {
          const componentProduct = products.find(
            (product) => product.sku === component.componentSku,
          );
          return {
            ...component,
            requiredQty: grossQty(
              component,
              Number(qty) || 0,
              selectedBom?.outputQty || 1,
            ),
            stock: componentProduct
              ? convertQty(
                  componentProduct.stock - componentProduct.reservedQty,
                  componentProduct.baseUnit || component.unit,
                  component.unit,
                )
              : 0,
          };
        }),
    [products, qty, selectedBom],
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!selectedBom) return setError("กรุณาเลือกสินค้าที่มี Active BOM");
    if (!Number.isFinite(qty) || qty <= 0)
      return setError("จำนวนผลิตต้องมากกว่า 0");
    if (exceedsCapacity)
      return setError(`วัตถุดิบผลิตได้สูงสุด ${maxQty.toLocaleString()} ถุง`);

    setSaving(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/production-runs`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({ sku, qty: Number(qty), lot, expiryDate, note }),
      });
      const run = await readApiResponse<ProductionRun>(response);
      setMessage(
        `บันทึก ${run.code} แล้ว: รับสินค้าสำเร็จรูป ${run.qty.toLocaleString()} ถุงเข้าสต็อก`,
      );
      setLot("");
      setExpiryDate("");
      setNote("");
      await loadResources(["products", "stockLots", "stockMovements"], true);
      await loadPageData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "ไม่สามารถบันทึกการผลิตได้",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen pb-16" style={{ background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Inventory", "Production Run"]}
        title="Production Run"
        subtitle="ตัดวัตถุดิบตาม Active BOM และรับสินค้าสำเร็จรูปเข้าสต็อกจริง"
      />

      <div className="grid gap-6 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <Card t={t} className="p-6" style={{ background: c.surface }}>
            <form onSubmit={submit} className="grid gap-5">
              <div>
                <h2 className="text-base font-semibold">บันทึกการผลิต</h2>
                <p className="mt-1 text-xs" style={{ color: c.ink3 }}>
                  จำนวนที่ระบุคือจำนวนสินค้าสำเร็จรูปที่ผลิตจริง
                </p>
              </div>
              <ValidationAlert message={error} />
              {message && (
                <div className="rounded-md border p-3 text-sm" style={{ color: c.pos, borderColor: c.pos }}>
                  {message}
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-1.5 md:col-span-2">
                  <Label>สินค้าสำเร็จรูปที่มี Active BOM</Label>
                  <NativeSelect value={sku} onChange={(event) => setSku(event.target.value)} required>
                    <option value="">-- เลือกสินค้า --</option>
                    {boms.map((bom) => {
                      const product = products.find((item) => item.sku === bom.fgSku);
                      return (
                        <option key={bom.id} value={bom.fgSku}>
                          {product?.name || bom.fgSku} ({bom.fgSku}) · ผลิตได้สูงสุด {(bom.maxProducibleQty ?? availableFromBom(bom, products)).toLocaleString()} {product?.baseUnit || "ถุง"}
                        </option>
                      );
                    })}
                  </NativeSelect>
                </div>
                <div className="grid gap-1.5">
                  <Label>จำนวนที่ผลิต ({selectedProduct?.baseUnit || "ถุง"})</Label>
                  <Input
                    required
                    min={1}
                    max={maxQty || undefined}
                    type="number"
                    value={qty}
                    onChange={(event) => setQty(Number(event.target.value))}
                    style={{ borderColor: exceedsCapacity ? c.neg : undefined }}
                  />
                  <span className="text-[11px]" style={{ color: exceedsCapacity ? c.neg : c.ink3 }}>
                    ผลิตได้สูงสุด {maxQty.toLocaleString()} {selectedProduct?.baseUnit || "ถุง"}
                  </span>
                </div>
                <div className="grid gap-1.5">
                  <Label>Lot สินค้าสำเร็จรูป</Label>
                  <Input value={lot} onChange={(event) => setLot(event.target.value)} placeholder="เว้นว่างเพื่อสร้างอัตโนมัติ" />
                </div>
                <div className="grid gap-1.5">
                  <Label>วันหมดอายุ</Label>
                  <Input type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>หมายเหตุ</Label>
                  <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} />
                </div>
              </div>
              <Button type="submit" disabled={saving || !selectedBom || exceedsCapacity} className="bg-[var(--erp-accent)] text-white">
                {saving ? "กำลังบันทึก..." : "ยืนยันและรับสินค้าเข้าสต็อก"}
              </Button>
            </form>
          </Card>

          <Card t={t} pad={false} className="overflow-hidden">
            <div className="border-b p-4 px-5" style={{ borderColor: c.border }}>
              <h2 className="text-sm font-semibold">วัตถุดิบที่จะตัดตาม BOM</h2>
              <p className="mt-1 text-xs" style={{ color: c.ink3 }}>
                รวม Scrap และแปลงตามสัดส่วนจำนวนผลิตแล้ว
              </p>
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>วัตถุดิบ</TableHead><TableHead className="text-right">ต้องใช้</TableHead><TableHead className="text-right">มีในสต็อก</TableHead></TableRow></TableHeader>
              <TableBody>
                {materialLines.map((line) => (
                  <TableRow key={line.componentSku}>
                    <TableCell><div className="font-medium">{line.componentName}</div><Mono t={t} size={10} color={c.ink3}>{line.componentSku}</Mono></TableCell>
                    <TableCell className="text-right"><Mono t={t} size={12}>{line.requiredQty.toLocaleString(undefined, { maximumFractionDigits: 3 })} {line.unit}</Mono></TableCell>
                    <TableCell className="text-right"><Mono t={t} size={12} color={c.ink2}>{line.stock.toLocaleString()} {line.unit}</Mono></TableCell>
                  </TableRow>
                ))}
                {materialLines.length === 0 && <TableRow><TableCell colSpan={3} className="p-8 text-center text-sm" style={{ color: c.ink3 }}>กรุณาเลือกสินค้าที่มี BOM</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </div>

        <div className="grid content-start gap-4">
          <Card t={t} className="p-5">
            <div className="text-xs font-semibold uppercase" style={{ color: c.ink3 }}>Active BOM</div>
            <Mono t={t} size={13} weight={600}>{selectedBom?.code || "—"}</Mono>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs" style={{ color: c.ink3 }}>Batch มาตรฐาน</div><b>{selectedBom?.outputQty || 0} {selectedBom?.outputUnit || selectedProduct?.baseUnit || "ถุง"}</b></div>
              <div><div className="text-xs" style={{ color: c.ink3 }}>สต็อกจริงปัจจุบัน</div><b>{selectedProduct?.stock.toLocaleString() || 0} {selectedProduct?.baseUnit || "ถุง"}</b></div>
              <div><div className="text-xs" style={{ color: c.ink3 }}>ผลิตได้สูงสุด</div><b style={{ color: c.info }}>{maxQty.toLocaleString()} {selectedProduct?.baseUnit || "ถุง"}</b></div>
              <div><div className="text-xs" style={{ color: c.ink3 }}>ต้นทุน/หน่วย</div><b>฿{selectedBom ? (selectedBom.cost / Math.max(selectedBom.outputQty, 1)).toFixed(2) : "0.00"}</b></div>
            </div>
          </Card>

          <Card t={t} pad={false} className="overflow-hidden">
            <div className="border-b p-4 px-5 text-sm font-semibold" style={{ borderColor: c.border }}>ประวัติการผลิตล่าสุด</div>
            <div className="divide-y" style={{ borderColor: c.border }}>
              {runs.slice(0, 8).map((run) => (
                <div key={run.id} className="p-4">
                  <div className="flex justify-between gap-3"><Mono t={t} size={11} weight={600}>{run.code}</Mono><span className="text-xs" style={{ color: c.ink3 }}>{run.date}</span></div>
                  <div className="mt-1 text-sm font-medium">{run.skuName}</div>
                  <div className="mt-1 text-xs" style={{ color: c.ink2 }}>{run.qty.toLocaleString()} ถุง · Lot {run.lot}</div>
                </div>
              ))}
              {runs.length === 0 && <div className="p-8 text-center text-sm" style={{ color: c.ink3 }}>ยังไม่มีประวัติการผลิต</div>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
