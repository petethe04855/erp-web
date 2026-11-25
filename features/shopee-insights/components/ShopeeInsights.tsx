"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  CalendarRange,
  Info,
  LineChart,
  Package,
  Receipt,
  Repeat,
  Route,
  Search,
  Shapes,
  ShoppingBag,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/common/ErrorState";
import { KpiCard } from "@/features/dashboard/components/KpiCard";
import { SectionCard } from "@/features/dashboard/components/SectionCard";
import { cn } from "@/lib/utils";
import {
  useInsightCustomers,
  useInsightJourney,
  useInsightProducts,
  useInsightSets,
  useInsightSummary,
} from "../api";
import { setColor } from "../lib/colors";
import {
  baht,
  monthLabel,
  num,
  pct1,
  presetRange,
  RANGE_PRESETS,
  rangeFromSearch,
  rangeLabel,
  summarySentence,
} from "../lib/format";
import type { InsightRange } from "../types";
import { BarLineChart, CategoryChart, ChartTable, MonthlySalesChart, SetSizeChart } from "./InsightCharts";
import { JourneySankey } from "./JourneySankey";

function monthsOf(r: InsightRange): string[] {
  const out: string[] = [];
  let [y, m] = r.from.split("-").map(Number);
  const [ty, tm] = r.to.split("-").map(Number);
  while (y < ty || (y === ty && m <= tm)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}

/** Loading / error wrapper for one section, so sections load independently. */
function Section<T>({
  q,
  children,
  height = "h-72",
}: {
  q: { data?: T; isPending: boolean; isError: boolean; error: Error | null; refetch: () => unknown };
  children: (data: T) => React.ReactNode;
  height?: string;
}) {
  if (q.isPending) return <div className={cn(height, "animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800")} />;
  if (q.isError || !q.data) return <ErrorState message={q.error?.message ?? "โหลดข้อมูลไม่สำเร็จ"} onRetry={() => q.refetch()} />;
  return <>{children(q.data)}</>;
}

function RangeFilter({ value, onChange }: { value: InsightRange; onChange: (r: InsightRange) => void }) {
  const activePreset = RANGE_PRESETS.find((p) => {
    const r = presetRange(p.id);
    return r.from === value.from && r.to === value.to;
  })?.id;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900">
      <CalendarRange className="ml-1 h-4 w-4 text-neutral-400" aria-hidden />
      <Input
        type="month"
        aria-label="เดือนเริ่มต้น"
        value={value.from}
        max={value.to}
        onChange={(e) => e.target.value && e.target.value <= value.to && onChange({ ...value, from: e.target.value })}
        className="h-8 w-36 text-xs"
      />
      <span className="text-xs text-neutral-500">ถึง</span>
      <Input
        type="month"
        aria-label="เดือนสิ้นสุด"
        value={value.to}
        min={value.from}
        onChange={(e) => e.target.value && e.target.value >= value.from && onChange({ ...value, to: e.target.value })}
        className="h-8 w-36 text-xs"
      />
      <div role="group" aria-label="ช่วงเวลาสำเร็จรูป" className="flex flex-wrap gap-1">
        {RANGE_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={activePreset === p.id}
            onClick={() => onChange(presetRange(p.id))}
            className={cn(
              "cursor-pointer rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
              activePreset === p.id
                ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                : "border-neutral-200 text-neutral-600 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductTable({ products }: { products: { category: string; product: string; sku: string; orders: number; qty: number; sales: number }[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const rows = q ? products.filter((p) => `${p.product} ${p.sku} ${p.category}`.toLowerCase().includes(q)) : products;
  return (
    <SectionCard
      flush
      icon={Package}
      title="สินค้าเรียงตามยอดขาย"
      description={`${num(products.length)} รายการ · ไม่รวมของแถมราคา 0 บาท`}
      actions={
        <div className="relative w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <Input aria-label="ค้นหาสินค้า" placeholder="ค้นหาชื่อสินค้า / SKU…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-8 pl-8 text-xs" />
        </div>
      }
    >
      <div className="max-h-[480px] overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-neutral-50 text-neutral-500 dark:bg-neutral-800">
            <tr>
              <th className="px-5 py-2.5 text-left font-medium">หมวด</th>
              <th className="px-3 py-2.5 text-left font-medium">สินค้า</th>
              <th className="px-3 py-2.5 text-right font-medium">ออเดอร์</th>
              <th className="px-3 py-2.5 text-right font-medium">จำนวนที่ขาย</th>
              <th className="px-5 py-2.5 text-right font-medium">ยอดขาย (บาท)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {rows.map((p) => (
              <tr key={p.product} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                <td className="whitespace-nowrap px-5 py-2.5 text-neutral-500">{p.category}</td>
                <td className="max-w-[420px] px-3 py-2.5">
                  <div className="truncate font-medium text-neutral-800 dark:text-neutral-200" title={p.product}>
                    {p.product}
                  </div>
                  {p.sku && <div className="font-mono text-[10px] text-neutral-400">{p.sku}</div>}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{num(p.orders)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{num(p.qty)}</td>
                <td className="px-5 py-2.5 text-right font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">{baht(p.sales)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-8 text-center text-sm text-neutral-500">ไม่พบสินค้า</p>}
      </div>
    </SectionCard>
  );
}

/**
 * Shopee sales insights for the Chawy shop (spec "Chawy Sales Overview"):
 * by order date, from orders imported into the ERP, sister-shop orders excluded.
 */
export function ShopeeInsights() {
  const [range, setRange] = useState<InsightRange>(() => presetRange("ytd"));
  const [visibleSets, setVisibleSets] = useState<number[] | null>(null);

  useEffect(() => {
    setRange(rangeFromSearch(window.location.search));
  }, []);
  const changeRange = (r: InsightRange) => {
    setRange(r);
    const url = new URL(window.location.href);
    url.searchParams.set("from", r.from);
    url.searchParams.set("to", r.to);
    window.history.replaceState(null, "", url);
  };

  const months = useMemo(() => monthsOf(range), [range]);
  const summary = useInsightSummary(range);
  const products = useInsightProducts(range);
  const sets = useInsightSets(range);
  const customers = useInsightCustomers(range);
  const journey = useInsightJourney(range);

  const kpi = summary.data?.kpi;
  const sentence = kpi ? summarySentence(kpi) : null;
  const meta = summary.data?.meta;
  const label = rangeLabel(range);

  return (
    <PageContainer>
      <PageHeader
        title="Chawy ยอดขายภาพรวม"
        description={`Shopee ร้าน Chawy · ${label} · นับตามวันที่สั่งซื้อ จากไฟล์ Order ที่นำเข้า ERP (ไม่รวมร้านแม่เพิ่ม)`}
        actions={
          <Link
            href="/shopee/orders"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> นำเข้าไฟล์ Order
          </Link>
        }
      />

      <RangeFilter value={range} onChange={changeRange} />

      {/* 1. Summary sentence */}
      {sentence && (
        <p className="mb-6 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {sentence.lead}{" "}
          {sentence.change && (
            <span
              className={cn(
                "font-semibold",
                sentence.trend === "up" && "text-emerald-700 dark:text-emerald-400",
                sentence.trend === "down" && "text-rose-700 dark:text-rose-400",
              )}
            >
              {sentence.change}
            </span>
          )}{" "}
          {sentence.tail}
        </p>
      )}

      <div className="space-y-6">
        {/* 2. KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <KpiCard label="ยอดขายรวม" icon={Wallet} loading={summary.isPending} value={kpi ? `฿${baht(kpi.total_sales)}` : "–"} sub={`ราคาขายสุทธิ ก่อนหักค่าธรรมเนียม · ${label}`} />
          <KpiCard label="ออเดอร์" icon={Receipt} loading={summary.isPending} value={kpi ? num(kpi.orders) : "–"} sub="หมายเลขคำสั่งซื้อไม่ซ้ำ" />
          <KpiCard
            label="ลูกค้า"
            icon={Users}
            loading={summary.isPending}
            value={kpi ? `${num(kpi.customers)} คน` : "–"}
            sub={kpi ? `ซื้อซ้ำ ${num(kpi.repeat_customers)} คน (${pct1(kpi.repeat_pct)}) ทำยอด ${pct1(kpi.repeat_sales_pct)}` : undefined}
          />
          <KpiCard label="ยอดเฉลี่ยต่อออเดอร์" icon={Target} loading={summary.isPending} value={kpi ? `฿${baht(kpi.aov)}` : "–"} sub="ยอดขายรวม ÷ ออเดอร์" />
          <KpiCard
            label="วันที่กลับมาซื้อครั้งที่ 2"
            icon={CalendarClock}
            loading={summary.isPending}
            value={kpi?.median_gap_days != null ? `${num(Math.round(kpi.median_gap_days))} วัน` : "–"}
            sub="ค่ากลาง ของลูกค้าที่ซื้อซ้ำ"
          />
        </div>
        {summary.isError && <ErrorState message={summary.error.message} onRetry={() => summary.refetch()} />}

        {/* 3. Monthly sales & orders */}
        <SectionCard icon={LineChart} title="ยอดขายและออเดอร์รายเดือน" description="เส้นทึบ = ออเดอร์ (แกนซ้าย) · เส้นประ = บาท (แกนขวา)">
          <Section q={summary}>
            {(s) => (
              <>
                <MonthlySalesChart monthly={s.monthly} />
                <ChartTable
                  head={["เดือน", "ออเดอร์", "ยอดขาย (บาท)", "ลูกค้าใหม่", "ออเดอร์ซื้อซ้ำ"]}
                  rows={s.monthly.map((m) => [monthLabel(m.month), m.orders, baht(m.sales), m.new_customers, m.repeat_orders])}
                />
              </>
            )}
          </Section>
        </SectionCard>

        {/* 4. Sales by category */}
        <SectionCard icon={Shapes} title="ยอดขายรายเดือนตามหมวดสินค้า" description="บาท · โปรผสม = ลิสต์ “โปร N ถุง”">
          <Section q={products}>
            {(p) => (
              <>
                <CategoryChart months={months} rows={p.monthly_category} />
                <ChartTable
                  head={["เดือน", ...p.categories]}
                  rows={months.map((m) => [
                    monthLabel(m),
                    ...p.categories.map((c) => baht(p.monthly_category.find((r) => r.month === m && r.category === c)?.sales ?? 0)),
                  ])}
                />
              </>
            )}
          </Section>
        </SectionCard>

        {/* 5. Freeze-dried by set size */}
        <SectionCard
          icon={Package}
          title="ฟรีซดรายตามขนาดเซต"
          description="เส้นทึบ = จำนวนเซต (แกนซ้าย) · เส้นประ = บาท (แกนขวา) · สีบอกขนาดเซต"
          actions={
            sets.data?.set_sizes?.length ? (
              <div role="group" aria-label="แสดงขนาดเซต" className="flex flex-wrap gap-1">
                {sets.data.set_sizes.map((s) => {
                  const on = (visibleSets ?? sets.data!.set_sizes!).includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        const all = sets.data!.set_sizes!;
                        const cur = visibleSets ?? all;
                        const next = on ? cur.filter((x) => x !== s) : [...cur, s];
                        if (next.length) setVisibleSets(next);
                      }}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium",
                        on ? "border-neutral-300 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100" : "border-transparent text-neutral-400 line-through",
                      )}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: setColor(s) }} />
                      {s} ถุง
                    </button>
                  );
                })}
              </div>
            ) : null
          }
        >
          <Section q={sets} height="h-80">
            {(s) =>
              s.set_sizes?.length ? (
                <>
                  <SetSizeChart months={months} sizes={s.set_sizes} rows={s.monthly_sets ?? []} visible={visibleSets ?? s.set_sizes} />
                  <ChartTable
                    head={["ขนาดเซต", "เซตที่ขาย", "ยอดขาย (บาท)"]}
                    rows={s.set_sizes.map((size) => {
                      const r = (s.monthly_sets ?? []).filter((x) => x.set === size);
                      return [`${size} ถุง`, r.reduce((a, b) => a + b.sets_sold, 0), baht(r.reduce((a, b) => a + b.sales, 0))];
                    })}
                  />
                  {s.unresolved_lines > 0 && (
                    <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-400">
                      {num(s.unresolved_lines)} บรรทัดอ่านขนาดเซตไม่ได้ จึงนับเป็น 1 ถุง (ไม่มี “โปร N ถุง” ตัวเลือก หรือ SKU บอกขนาด)
                    </p>
                  )}
                </>
              ) : (
                <p className="py-10 text-center text-sm text-neutral-500">ยังไม่มีการขายฟรีซดรายในช่วงนี้</p>
              )
            }
          </Section>
        </SectionCard>

        {/* 6. Products */}
        <Section q={products}>{(p) => <ProductTable products={p.products ?? []} />}</Section>

        <div className="grid gap-6 xl:grid-cols-2">
          {/* 7. Bags per order */}
          <SectionCard icon={ShoppingBag} title="ถุงฟรีซดรายต่อออเดอร์" description="เฉพาะออเดอร์ที่มีฟรีซดราย · แท่ง = ออเดอร์ · เส้นประ = ยอดขายรวม">
            <Section q={sets}>
              {(s) => (
                <>
                  <BarLineChart
                    ariaLabel="กราฟจำนวนออเดอร์ตามจำนวนถุงฟรีซดรายต่อออเดอร์"
                    labels={s.bags_per_order.map((b) => `${b.bags} ถุง`)}
                    bars={{ label: "ออเดอร์", data: s.bags_per_order.map((b) => b.orders) }}
                    line={{ label: "ยอดขายรวม (บาท)", data: s.bags_per_order.map((b) => b.sales) }}
                    leftTitle="ออเดอร์"
                    rightTitle="บาท"
                  />
                  <ChartTable head={["ถุงต่อออเดอร์", "ออเดอร์", "ยอดขาย (บาท)"]} rows={s.bags_per_order.map((b) => [b.bags, b.orders, baht(b.sales)])} />
                </>
              )}
            </Section>
          </SectionCard>

          {/* 8. Customers by number of purchases */}
          <SectionCard icon={Users} title="ลูกค้าตามจำนวนครั้งที่ซื้อ" description="แท่ง = ลูกค้า · เส้นประ = ยอดขายรวม">
            <Section q={customers}>
              {(c) => (
                <>
                  <BarLineChart
                    ariaLabel="กราฟจำนวนลูกค้าตามจำนวนครั้งที่ซื้อ"
                    labels={(c.frequency ?? []).map((f) => `${f.purchases} ครั้ง`)}
                    bars={{ label: "ลูกค้า", data: (c.frequency ?? []).map((f) => f.customers) }}
                    line={{ label: "ยอดขายรวม (บาท)", data: (c.frequency ?? []).map((f) => f.sales) }}
                    leftTitle="ลูกค้า"
                    rightTitle="บาท"
                  />
                  <ChartTable head={["จำนวนครั้ง", "ลูกค้า", "ยอดขาย (บาท)"]} rows={(c.frequency ?? []).map((f) => [f.purchases, f.customers, baht(f.sales)])} />
                </>
              )}
            </Section>
          </SectionCard>
        </div>

        {/* 9. Days until the second purchase */}
        <SectionCard
          icon={Repeat}
          title="ระยะเวลาก่อนกลับมาซื้อครั้งที่ 2"
          description={`แท่ง = ลูกค้า ต่อสัปดาห์ (สัปดาห์ 1 = 0–6 วัน) · เส้นประ = % สะสม${
            customers.data?.repeat_gap.median_days != null ? ` · ค่ากลาง ${num(Math.round(customers.data.repeat_gap.median_days))} วัน` : ""
          }`}
        >
          <Section q={customers}>
            {(c) => (
              <>
                <BarLineChart
                  ariaLabel="ฮิสโตแกรมจำนวนสัปดาห์ก่อนกลับมาซื้อครั้งที่ 2"
                  labels={c.repeat_gap.weeks.map((w) => `สัปดาห์ ${w.week}`)}
                  bars={{ label: "ลูกค้า", data: c.repeat_gap.weeks.map((w) => w.customers) }}
                  line={{ label: "% สะสม", data: c.repeat_gap.weeks.map((w) => w.cum_pct), percent: true }}
                  leftTitle="ลูกค้า"
                  rightTitle="% สะสม"
                />
                <ChartTable head={["สัปดาห์", "ลูกค้า", "% สะสม"]} rows={c.repeat_gap.weeks.map((w) => [w.week, w.customers, pct1(w.cum_pct)])} />
              </>
            )}
          </Section>
        </SectionCard>

        {/* 10. Journey */}
        <SectionCard icon={Route} title="เส้นทางการซื้อครั้งที่ 1 ถึง 4" description="สีตามสินค้าหลักของออเดอร์ (หมวดที่ยอดเงินสูงสุด) · เทา = ยังไม่ซื้อต่อ">
          <Section q={journey} height="h-96">
            {(j) => <JourneySankey links={j.links ?? []} steps={j.steps} />}
          </Section>
        </SectionCard>

        {/* Notes on what was left out */}
        {meta && (meta.excluded_orders > 0 || meta.unnamed_orders > 0) && (
          <p className="flex items-start gap-2 text-xs text-neutral-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              {meta.excluded_orders > 0 && `ไม่นับออเดอร์ร้านแม่เพิ่ม ${num(meta.excluded_orders)} ออเดอร์ในช่วงนี้ `}
              {meta.unnamed_orders > 0 && `· ${num(meta.unnamed_orders)} ออเดอร์ไม่มีชื่อผู้ซื้อ นับในยอดขายและออเดอร์ แต่ไม่นับเป็นลูกค้า`}
            </span>
          </p>
        )}

        {/* 11. How the numbers are counted */}
        <details className="rounded-xl border border-neutral-200 bg-white p-5 text-xs leading-relaxed text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          <summary className="cursor-pointer text-sm font-semibold text-neutral-900 dark:text-neutral-100">วิธีนับตัวเลข</summary>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>ยอดขาย = “ราคาขายสุทธิ” ของแต่ละบรรทัด ก่อนหักค่าคอมมิชชั่น ค่าบริการ ค่าธุรกรรม และค่าส่ง ยังไม่ใช่เงินที่โอนเข้าจริง</li>
            <li>นับตามวันที่สั่งซื้อ ยอดจึงต่างจากหน้า Dashboard ที่นับ Shopee ตามวันที่โอนเงิน</li>
            <li>ของแถมราคา 0 บาท (กล่อง, สก๊อตเทป, sample ฯลฯ) ไม่นับเป็นยอดขายหรือจำนวนชิ้น แต่ออเดอร์ยังถูกนับ</li>
            <li>ออเดอร์ = หมายเลขคำสั่งซื้อไม่ซ้ำ · ลูกค้า = ชื่อผู้ใช้ผู้ซื้อ 1 ชื่อ = 1 คน (ลูกค้าหลายบัญชีจึงถูกนับเป็นหลายคน)</li>
            <li>ลูกค้าซื้อซ้ำ = มีตั้งแต่ 2 ออเดอร์ในช่วงที่เลือก · ลูกค้าใหม่ของเดือน = ออเดอร์แรกในประวัติทั้งหมดของ ERP อยู่ในเดือนนั้น</li>
            <li>ฟรีซดราย = ชื่อสินค้ามี “ฟรีซดราย” หรือ “Freeze Dried”</li>
            <li>ขนาดเซตอ่านตามลำดับ: ชื่อลิสต์ “โปร N ถุง” → ตัวเลือก “N ถุง” → ผลรวมตัวเลขในตัวเลือก (เช่น “อกไก่ 2 ทูน่า 1” = 3) → ท้าย SKU (เช่น -03, -10P-) → ถ้าไม่เจอ = 1</li>
            <li>ถุงต่อออเดอร์ = ผลรวมของ จำนวน × ขนาดเซต ของบรรทัดฟรีซดรายในออเดอร์</li>
            <li>สินค้าหลักของออเดอร์ (ใน Sankey) = หมวดที่ยอดเงินสูงสุดในออเดอร์นั้น</li>
            <li>ระยะกลับมาซื้อ = วันจากออเดอร์แรกถึงออเดอร์ที่ 2 ในช่วงที่เลือก · ลูกค้าที่เริ่มซื้อช่วงท้ายของช่วงยังมีเวลาน้อย สัดส่วนซื้อซ้ำจึงต่ำกว่าความจริง</li>
            <li>ไม่นับออเดอร์ของร้านแม่เพิ่ม (ขิงดอง, มะนาวดอง, กาน่าฉ่าย) · ไม่มีชื่อผู้ซื้อหรือข้อมูลส่วนบุคคลออกจากเซิร์ฟเวอร์ มีเฉพาะยอดรวม</li>
            <li>ออเดอร์ที่นำเข้าก่อนแก้ parser อาจยังไม่มีตัวเลือกสินค้า ให้ใช้ “แก้ข้อมูลออเดอร์เดิม” ในหน้า Shopee Orders</li>
          </ul>
        </details>
      </div>
    </PageContainer>
  );
}
