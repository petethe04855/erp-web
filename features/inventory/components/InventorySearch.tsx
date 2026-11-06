import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FilterToolbar } from "@/components/common/FilterToolbar";

interface InventorySearchProps {
  search: string;
  status: string;
  onSearch: (val: string) => void;
  onStatusChange: (val: string) => void;
  onReset: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function InventorySearch({
  search,
  status,
  onSearch,
  onStatusChange,
  onReset,
  actions,
  children,
}: InventorySearchProps) {
  let activeCount = 0;
  if (search) activeCount++;
  if (status && status !== "all") activeCount++;

  return (
    <FilterToolbar
      onReset={onReset}
      activeFilterCount={activeCount}
      actions={actions || children}
    >
      <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
        <Input
          type="search"
          className="h-9 text-xs"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="ค้นหารหัส Inventory / ชื่อชุด..."
        />
      </div>

      <div className="w-full sm:w-44">
        <Select
          className="h-9 text-xs"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">สถานะทั้งหมด</option>
          <option value="active">เปิดใช้งาน (Active)</option>
          <option value="inactive">ปิดใช้งาน (Inactive)</option>
        </Select>
      </div>
    </FilterToolbar>
  );
}

