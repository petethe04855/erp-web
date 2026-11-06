import { Input } from "@/components/ui/input";
import { FilterToolbar } from "@/components/common/FilterToolbar";
import type { GoodsReceiveQueryParams } from "../types/warehouse";

interface GoodsReceiveSearchProps {
  filters: GoodsReceiveQueryParams;
  onSearch: (val: string) => void;
  onStatusChange?: (val: string) => void;
  onReset: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function GoodsReceiveSearch(props: GoodsReceiveSearchProps) {
  let activeCount = 0;
  if (props.filters.search) activeCount++;

  return (
    <FilterToolbar
      onReset={props.onReset}
      activeFilterCount={activeCount}
      actions={props.actions || props.children}
    >
      <div className="relative min-w-[240px] flex-1 sm:max-w-md">
        <Input
          type="search"
          className="h-9 text-xs"
          value={props.filters.search || ""}
          onChange={(e) => props.onSearch(e.target.value)}
          placeholder="ค้นหารหัส / ชื่อ / เลขที่ใบรับสินค้า (GRN)..."
        />
      </div>
    </FilterToolbar>
  );
}
