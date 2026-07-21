"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Mono } from "@/components/ui";
import { useTheme } from "@/lib/design/ThemeContext";

interface AdjustmentItem {
  sku: string;
  skuName: string;
  systemQty: number;
  actualQty: number;
  variance: number;
}

interface StockAdjustment {
  id: string;
  date: string;
  checkedBy: string;
  note: string;
  items: AdjustmentItem[];
}

interface AdjustmentHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adjustments: StockAdjustment[];
}

export function AdjustmentHistorySheet({
  open,
  onOpenChange,
  adjustments,
}: AdjustmentHistorySheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [expandedAdj, setExpandedAdj] = useState<string | null>(null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[min(640px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base font-bold text-foreground" style={{ color: "var(--erp-ink)" }}>
            ประวัติการตรวจนับ
          </SheetTitle>
          <div className="text-xs text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>
            ทั้งหมด {adjustments.length} รอบ
          </div>
        </SheetHeader>
        <SheetBody className="grid gap-4 overflow-y-auto">
          {adjustments.length === 0 ? (
            <p className="text-center text-sm p-12" style={{ color: "var(--erp-ink3)" }}>
              ยังไม่มีประวัติการตรวจนับ
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {adjustments.map((adj) => {
                const varItems = adj.items.filter((i) => i.variance !== 0);
                const isExpanded = expandedAdj === adj.id;
                return (
                  <div
                    key={adj.id}
                    className="border border-border rounded-lg overflow-hidden"
                    style={{ borderColor: "var(--erp-border)" }}
                  >
                    <div
                      onClick={() => setExpandedAdj(isExpanded ? null : adj.id)}
                      className="p-4 cursor-pointer flex items-center justify-between gap-3 transition-colors bg-muted/30 hover:bg-muted/50"
                      style={{ background: "var(--erp-subtle)" }}
                    >
                      <div className="flex-1">
                        <div
                          className="text-xs font-bold font-mono"
                          style={{ color: "var(--erp-accent)" }}
                        >
                          {adj.id}
                        </div>
                        <div
                          className="text-[11px] mt-1"
                          style={{ color: "var(--erp-ink3)" }}
                        >
                          {adj.date} · {adj.checkedBy} · {adj.note || "ไม่มีหมายเหตุ"}
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          varItems.length > 0
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                        }`}
                      >
                        {varItems.length > 0 ? `มี Variance ${varItems.length} รายการ` : "ไม่มี Variance"}
                      </span>
                      <span className="text-xs" style={{ color: "var(--erp-ink3)" }}>
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>
                    {isExpanded && (
                      <div className="overflow-x-auto border-t border-border" style={{ borderColor: "var(--erp-border)" }}>
                        <Table className="w-full border-collapse">
                          <TableHeader className="bg-muted/50 border-b border-border" style={{ background: "var(--erp-subtle)", borderColor: "var(--erp-border)" }}>
                            <TableRow>
                              <TableHead className="p-2 px-3 text-[10px] font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink4)" }}>สินค้า</TableHead>
                              <TableHead className="p-2 px-3 text-[10px] font-bold text-muted-foreground uppercase text-center w-16" style={{ color: "var(--erp-ink4)" }}>ระบบ</TableHead>
                              <TableHead className="p-2 px-3 text-[10px] font-bold text-muted-foreground uppercase text-center w-16" style={{ color: "var(--erp-ink4)" }}>จริง</TableHead>
                              <TableHead className="p-2 px-3 text-[10px] font-bold text-muted-foreground uppercase text-right w-20" style={{ color: "var(--erp-ink4)" }}>Variance</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {adj.items.map((item) => {
                              const hasVariance = item.variance !== 0;
                              const rowBg = hasVariance
                                ? item.variance > 0
                                  ? "bg-emerald-50/40 dark:bg-emerald-950/10"
                                  : "bg-red-50/40 dark:bg-red-950/10"
                                : "transparent";

                              return (
                                <TableRow
                                  key={item.sku}
                                  className={`border-b border-border hover:bg-muted/30 ${rowBg}`}
                                  style={{ borderColor: "var(--erp-border)" }}
                                >
                                  <TableCell className="p-2 px-3 align-middle text-xs font-medium" style={{ color: "var(--erp-ink)" }}>
                                    {item.skuName}
                                  </TableCell>
                                  <TableCell className="p-2 px-3 align-middle text-center font-mono text-xs">
                                    {item.systemQty}
                                  </TableCell>
                                  <TableCell className="p-2 px-3 align-middle text-center font-mono text-xs font-bold">
                                    {item.actualQty}
                                  </TableCell>
                                  <TableCell className="p-2 px-3 align-middle text-right font-mono text-xs font-bold">
                                    <span
                                      style={{
                                        color:
                                          item.variance > 0
                                            ? c.pos
                                            : item.variance < 0
                                            ? c.neg
                                            : "var(--erp-ink3)",
                                      }}
                                    >
                                      {item.variance > 0
                                        ? `+${item.variance}`
                                        : item.variance === 0
                                        ? "—"
                                        : item.variance}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SheetBody>
        <SheetFooter className="flex justify-end p-4 px-6 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer border-border"
            style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)", color: "#374151" }}
          >
            ปิด
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
