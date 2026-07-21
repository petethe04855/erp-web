"use client";

import { useTheme } from "@/lib/design/ThemeContext";
import { Mono } from "@/components/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface Product {
  sku: string;
  name: string;
  stock: number;
  reorder: number;
  isBundle?: boolean;
}

interface ReorderTabProps {
  products: Product[];
  reorderDraft: Record<string, number>;
  onChangeReorder: (sku: string, val: number) => void;
}

export function ReorderTab({
  products,
  reorderDraft,
  onChangeReorder,
}: ReorderTabProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const activeProducts = products.filter((p) => !p.isBundle);

  return (
    <div>
      <div className="text-sm font-bold text-foreground mb-1" style={{ color: "var(--erp-ink)" }}>
        Reorder Level
      </div>
      <div className="text-xs text-muted-foreground mb-4" style={{ color: "var(--erp-ink3)" }}>
        กำหนดจำนวนขั้นต่ำที่จะแจ้งเตือนให้สั่งซื้อเพิ่ม
      </div>

      <div className="border border-border rounded-lg overflow-hidden" style={{ borderColor: "var(--erp-border)" }}>
        <Table className="w-full border-collapse">
          <TableHeader className="bg-muted/50 border-b border-border" style={{ background: "var(--erp-subtle)", borderColor: "var(--erp-border)" }}>
            <TableRow>
              <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>สินค้า</TableHead>
              <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>SKU</TableHead>
              <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>สต็อก</TableHead>
              <TableHead className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left w-32" style={{ color: "var(--erp-ink3)" }}>Reorder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeProducts.map((p) => {
              const currentReorder = reorderDraft[p.sku] ?? p.reorder;
              const isLowStock = p.stock <= currentReorder;

              return (
                <TableRow
                  key={p.sku}
                  className="border-b border-border hover:bg-muted/40 transition-colors"
                  style={{ borderColor: "var(--erp-border)" }}
                >
                  <TableCell className="p-3 px-5 align-middle">
                    <span className="text-sm font-semibold" style={{ color: "var(--erp-ink)" }}>
                      {p.name}
                    </span>
                  </TableCell>
                  <TableCell className="p-3 px-5 align-middle">
                    <Mono t={t} size={11} color={c.ink3}>
                      {p.sku}
                    </Mono>
                  </TableCell>
                  <TableCell className="p-3 px-5 align-middle">
                    <span
                      className="text-sm font-bold"
                      style={{ color: isLowStock ? c.neg : c.pos }}
                    >
                      {p.stock}
                    </span>
                  </TableCell>
                  <TableCell className="p-3 px-5 align-middle">
                    <Input
                      type="number"
                      min={0}
                      value={currentReorder}
                      onChange={(e) =>
                        onChangeReorder(p.sku, parseInt(e.target.value) || 0)
                      }
                      className="h-8 w-24 text-center font-mono text-xs"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
