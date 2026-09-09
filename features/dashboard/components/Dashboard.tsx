"use client";
import { RefreshCw, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { useDashboard } from "../hooks/useDashboard";
import { DashboardCharts } from "./DashboardCharts";

function normalizeChannelName(raw: string): string {
  const upper = (raw || "").toUpperCase().trim();
  if (upper.includes("TIKTOK") || upper.includes("TIK TOK")) return "TikTok";
  if (upper.includes("SHOPEE")) return "Shopee";
  if (upper.includes("MANUAL") || upper === "DIRECT" || !upper) return "Manual";
  return raw.trim();
}

const money = (v: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(v);
export function Dashboard() {
  const q = useDashboard();
  const data = q.data;
  return (
    <PageContainer>
      <PageHeader
        title="ภาพรวมธุรกิจ"
        description="ยอดขาย การเงิน และมูลค่าสินค้าคงคลัง จากข้อมูล ERP ชุดเดียวกับระบบเดิม"
        actions={
          <div className="flex gap-2">
            <Input
              aria-label="เดือนรายงาน"
              type="month"
              value={q.month}
              onChange={(e) => {
                if (e.target.value) q.setMonth(e.target.value);
              }}
            />
            <Button
              aria-label="รีเฟรชข้อมูล"
              variant="outline"
              disabled={q.isFetching}
              onClick={() => q.refetch()}
            >
              <RefreshCw size={16} />
            </Button>
          </div>
        }
      />
      {q.isPending ? (
        <Loading message="กำลังโหลดรายงาน ERP…" />
      ) : q.isError ? (
        <ErrorState message={q.error.message} onRetry={() => q.refetch()} />
      ) : (
        data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
              {[
                {
                  label: "ยอดขาย Completed",
                  value: money(data.revenue.total),
                  note: "เดือนที่เลือก",
                  href: "/orders",
                },
                {
                  label: "กำไรขั้นต้น",
                  value: money(data.financial.grossProfit),
                  note: "จากบัญชีในเดือนที่เลือก",
                  href: "/reports",
                },
                {
                  label: "กำไรสุทธิ",
                  value: money(data.financial.netProfit),
                  note: "จากบัญชีในเดือนที่เลือก",
                  href: "/reports",
                },
                {
                  label: "มูลค่าสินค้าคงคลัง",
                  value: money(data.inventory.totalValue),
                  note:
                    "ยอดปัจจุบัน · " +
                    data.inventory.totalQty.toLocaleString("th-TH") +
                    " หน่วย",
                  href: "/inventory",
                },
              ].map((item, i) => (
                <Link
                  href={item.href}
                  key={item.label}
                  className={
                    "rounded-xl border p-6 " +
                    (i === 0
                      ? "bg-neutral-950 text-white border-neutral-950"
                      : "bg-white border-neutral-200")
                  }
                >
                  <div className="flex items-center justify-between">
                    <p
                      className={
                        "text-xs " +
                        (i === 0 ? "text-neutral-400" : "text-neutral-500")
                      }
                    >
                      {item.label}
                    </p>
                    <ArrowUpRight size={15} />
                  </div>
                  <p className="text-3xl font-semibold tracking-tight tabular-nums mt-5">
                    {item.value}
                  </p>
                  <p className="text-[11px] mt-3 text-neutral-500">
                    {item.note}
                  </p>
                </Link>
              ))}
            </div>
            <DashboardCharts data={data} />
            <section className="mt-6 border rounded-xl bg-white overflow-hidden">
              <div className="p-5 border-b flex justify-between">
                <h2 className="font-semibold">รายการขายล่าสุดในเดือนนี้</h2>
                <Link href="/orders" className="text-xs underline">
                  ดูรายการขาย
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 text-xs text-neutral-500">
                    <tr>
                      {["วันที่", "เอกสาร", "ลูกค้า", "ช่องทาง", "ยอดขาย"].map(
                        (h) => (
                          <th className="text-left px-5 py-3" key={h}>
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data.revenue.rows.slice(0, 8).map((r) => (
                      <tr key={r.reference} className="border-t">
                        <td className="px-5 py-4">{r.date}</td>
                        <td className="px-5 py-4 font-mono text-xs">
                          {r.reference}
                        </td>
                        <td className="px-5 py-4">{r.customer}</td>
                        <td className="px-5 py-4">{normalizeChannelName(r.channel)}</td>
                        <td className="px-5 py-4 tabular-nums">
                          {money(r.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.revenue.rows.length === 0 && (
                  <p className="p-8 text-sm text-neutral-500">
                    ไม่มีรายการในช่วงเวลานี้
                  </p>
                )}
              </div>
            </section>
            <p className="text-xs text-neutral-500 mt-5">
              อัปเดต {new Date(q.dataUpdatedAt).toLocaleTimeString("th-TH")} ·
              รีเฟรชอัตโนมัติทุก 60 วินาที
            </p>
          </>
        )
      )}
    </PageContainer>
  );
}
