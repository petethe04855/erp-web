"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useErpStore } from "@/lib/store/useErpStore";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, TopBar, fmtBaht, fmtBahtK, fmtNum } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

function earliestLot(
  lots: ReturnType<typeof useErpStore.getState>["stockLots"],
  sku: string
) {
  return lots
    .filter((l) => l.sku === sku && l.remainingQty > 0)
    .sort((a, b) => {
      if (!a.expiryDate && !b.expiryDate) return 0;
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return a.expiryDate.localeCompare(b.expiryDate);
    })[0];
}

export default function StockPage() {
  const router = useRouter();
  const { tokens: t } = useTheme();
  const c = t.color;
  const products = useErpStore((s) => s.products);
  const stockLots = useErpStore((s) => s.stockLots);

  const rows = useMemo(() => {
    return products.map((product) => {
      const lot = earliestLot(stockLots, product.sku);
      const onHand = product.stock;
      const value = onHand * product.cost;
      const status = onHand === 0 ? "out" : onHand <= product.reorder ? "low" : "ok";
      const ratio = Math.min(onHand / Math.max(product.reorder * 2, 1), 1);
      return { ...product, lot, onHand, value, status, ratio };
    });
  }, [products, stockLots]);

  const totalValue = rows.reduce((s, p) => s + p.value, 0);
  const totalUnits = rows.reduce((s, p) => s + p.onHand, 0);
  const lowStock = rows.filter((p) => p.onHand > 0 && p.onHand <= p.reorder).length;
  const outOfStock = rows.filter((p) => p.onHand === 0).length;

  return (
    <div className="min-h-screen bg-canvas pb-16" style={{ background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Inventory", "Stock Balance"]}
        title="Stock Balance"
        subtitle={`${rows.length} SKUs tracked · ${fmtBahtK(totalValue)} on-hand value`}
        right={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/stock-check")}
              className="cursor-pointer"
            >
              Stock Check
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/stock-check")}
              className="cursor-pointer"
            >
              Adjust
            </Button>
            <Button
              onClick={() => router.push("/goods-receive")}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
            >
              + Receive Goods
            </Button>
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-[1320px] mx-auto grid gap-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "On-hand value",
              value: fmtBaht(totalValue),
              sub: "across all SKUs",
            },
            {
              label: "Total units",
              value: fmtNum(totalUnits),
              sub: "physical inventory",
            },
            {
              label: "Low stock",
              value: String(lowStock),
              sub: "below reorder point",
              tone: c.warn,
            },
            {
              label: "Out of stock",
              value: String(outOfStock),
              sub: "reorder required",
              tone: c.neg,
            },
          ].map((tile) => (
            <Card
              t={t}
              key={tile.label}
              className="border border-border bg-card p-5"
              style={{
                borderColor: "var(--erp-border)",
                background: "var(--erp-surface)",
              }}
            >
              <div
                className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground"
                style={{ color: "var(--erp-ink3)" }}
              >
                {tile.label}
              </div>
              <span className="block mt-2">
                <Mono
                  t={t}
                  size={22}
                  weight={600}
                  color={tile.tone ? tile.tone : c.ink}
                >
                  {tile.value}
                </Mono>
              </span>
              <div
                className="text-xs text-muted-foreground mt-1"
                style={{ color: "var(--erp-ink3)" }}
              >
                {tile.sub}
              </div>
            </Card>
          ))}
        </div>

        {/* Stock Table */}
        <Card
          t={t}
          pad={false}
          className="overflow-hidden border border-border bg-card"
          style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)" }}
        >
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader
                className="bg-muted/50 border-b border-border"
                style={{ background: "var(--erp-subtle)", borderColor: "var(--erp-border)" }}
              >
                <TableRow>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>SKU</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>Product</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>Lot</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right" style={{ color: "var(--erp-ink3)" }}>On hand</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right" style={{ color: "var(--erp-ink3)" }}>Reorder</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>Stock level</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right" style={{ color: "var(--erp-ink3)" }}>Value</TableHead>
                  <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right" style={{ color: "var(--erp-ink3)" }}>30D trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => {
                  const barColor = p.status === "out" ? c.neg : p.status === "low" ? c.warn : c.pos;
                  return (
                    <TableRow
                      key={p.sku}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                      style={{ borderColor: "var(--erp-border)" }}
                    >
                      <TableCell className="p-4 px-5 align-middle">
                        <Mono t={t} size={12} weight={500}>
                          {p.sku}
                        </Mono>
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "var(--erp-ink)" }}
                        >
                          {p.name}
                        </span>
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle">
                        <Mono t={t} size={11} color={p.lot ? c.ink2 : c.ink4}>
                          {p.lot
                            ? `${p.lot.lot}${p.lot.expiryDate ? ` · exp ${p.lot.expiryDate}` : ""}`
                            : "No active lot"}
                        </Mono>
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle text-right">
                        <Mono
                          t={t}
                          size={13}
                          weight={600}
                          color={p.status === "out" ? c.neg : c.ink}
                        >
                          {fmtNum(p.onHand)}
                        </Mono>
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle text-right">
                        <Mono t={t} size={12} color={c.ink3}>
                          {p.reorder}
                        </Mono>
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle">
                        <div className="flex items-center gap-3 min-w-[160px]">
                          <div
                            className="flex-1 h-1.5 rounded-full overflow-hidden"
                            style={{ background: "var(--erp-subtle)" }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.max(p.ratio * 100, p.onHand > 0 ? 6 : 0)}%`,
                                background: barColor,
                              }}
                            />
                          </div>
                          <span
                            className="text-[11px] font-semibold min-w-[50px]"
                            style={{ color: barColor }}
                          >
                            {p.status === "out" ? "Out" : p.status === "low" ? "Low" : "Healthy"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle text-right">
                        <Mono t={t} size={12}>
                          {fmtBaht(p.value)}
                        </Mono>
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle text-right">
                        <Mono t={t} size={11} color={c.ink3}>
                          +0.0%
                        </Mono>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
