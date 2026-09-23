import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FilterToolbar } from "@/components/common/FilterToolbar";
import type { PurchaseQueryParams } from "../types/purchase";

interface PurchaseOrderSearchProps {
  filters: PurchaseQueryParams;
  onSearch: (val: string) => void;
  onStatusChange: (val: string) => void;
  onReset: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function PurchaseOrderSearch(props: PurchaseOrderSearchProps) {
  let activeCount = 0;
  if (props.filters.search) activeCount++;
  if (props.filters.status && props.filters.status !== "all") activeCount++;

  return (
    <FilterToolbar
      onReset={props.onReset}
      activeFilterCount={activeCount}
      actions={props.actions || props.children}
    >
      <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
        <Input
          type="search"
          className="h-9 text-xs"
          value={props.filters.search || ""}
          onChange={(e) => props.onSearch(e.target.value)}
          placeholder="ค้นหารหัส / ชื่อ / เลขเอกสาร..."
        />
      </div>

      <div className="w-full sm:w-48">
        <Select
          className="h-9 text-xs"
          value={props.filters.status || "all"}
          onChange={(e) => props.onStatusChange(e.target.value)}
        >
          <option value="all">สถานะทั้งหมด</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Partial Received">Partial Received</option>
          <option value="Received">Received</option>
          <option value="Cancelled">Cancelled</option>
        </Select>
      </div>
    </FilterToolbar>
  );
}
