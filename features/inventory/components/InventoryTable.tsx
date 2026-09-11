"use client";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import type { InventoryStock } from "../types/inventory";
import type { ApiPaginationMeta } from "@/types/api";
interface InventoryTableProps {
  stocks: InventoryStock[];
  meta: ApiPaginationMeta;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRetry: () => void;
  onAdjust: (stock: InventoryStock) => void;
}
export function InventoryTable(props: InventoryTableProps) {
  return (
    <DataTable
      {...props}
      onLimitChange={props.onLimitChange}
      rows={props.stocks}
      columns={[
        { key: "sku", label: "SKU" },
        { key: "productName", label: "สินค้า" },
        { key: "onHand", label: "คงเหลือ" },
        { key: "reserved", label: "จอง" },
        { key: "available", label: "พร้อมใช้" },
        { key: "safetyStockPercent", label: "จุดสั่งซื้อ (%)" },
      ]}
      actions={(row) =>
        row.isBundle ? (
          <span className="text-[11px] text-muted-foreground font-medium px-2 py-1 bg-muted/40 rounded border border-border">
            สินค้าชุด Bundle
          </span>
        ) : (
          <Button size="sm" variant="outline" onClick={() => props.onAdjust(row)}>
            ตรวจนับ
          </Button>
        )
      }
    />
  );
}
