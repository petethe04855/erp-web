import { Input } from "@/components/ui/input";
import { FilterToolbar } from "@/components/common/FilterToolbar";
import { ROLE_CONFIG, type UserFilterState } from "../types/user";

interface UserSearchProps {
  filters: UserFilterState;
  stats?: { total: number; active: number; inactive: number };
  onSearch: (val: string) => void;
  onRoleChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onReset: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function UserSearch({
  filters,
  stats,
  onSearch,
  onRoleChange,
  onStatusChange,
  onReset,
  actions,
  children,
}: UserSearchProps) {
  let activeCount = 0;
  if (filters.search) activeCount++;
  if (filters.role !== "all") activeCount++;
  if (filters.status !== "all") activeCount++;

  return (
    <div className="space-y-3">
      {/* Stats Summary Badges if stats provided */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <span className="text-xs text-neutral-500">ผู้ใช้ทั้งหมด</span>
            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{stats.total}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-4 py-3 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <span className="text-xs text-emerald-700 dark:text-emerald-400">ใช้งานอยู่</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <span className="text-xs text-neutral-500">ปิดใช้งาน</span>
            <span className="text-lg font-bold text-neutral-500">{stats.inactive}</span>
          </div>
        </div>
      )}

      {/* Horizontal Toolbar */}
      <FilterToolbar
        onReset={onReset}
        activeFilterCount={activeCount}
        actions={actions || children}
      >
        <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
          <Input
            type="search"
            className="h-9 text-xs"
            value={filters.search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="ค้นหาชื่อ, นามสกุล หรืออีเมล..."
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 py-1 text-xs shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            value={filters.role}
            onChange={(e) => onRoleChange(e.target.value)}
          >
            <option value="all">ทุกบทบาท (All Roles)</option>
            {Object.entries(ROLE_CONFIG).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-40">
          <select
            className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 py-1 text-xs shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            value={filters.status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">ทุกสถานะ (All Status)</option>
            <option value="active">ใช้งานอยู่ (Active)</option>
            <option value="inactive">ปิดใช้งาน (Inactive)</option>
          </select>
        </div>
      </FilterToolbar>
    </div>
  );
}
