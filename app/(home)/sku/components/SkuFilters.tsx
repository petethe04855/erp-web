"use client";
import type { ProductCategory } from "@/lib/store/erpWorkflow";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";

interface SkuFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  filterType: ProductCategory | "All";
  setFilterType: (t: ProductCategory | "All") => void;
  filterActive: "all" | "active" | "inactive";
  setFilterActive: (a: "all" | "active" | "inactive") => void;
}

const TYPES: Array<ProductCategory | "All"> = [
  "All",
  "Raw Material",
  "Packaging",
  "Sub-component",
  "Finished Product",
];

const LABELS: Partial<Record<ProductCategory, string>> = {
  Cat: "Cat",
  Dog: "Dog",
  Bundle: "Bundle",
  Other: "Other",
};

export default function SkuFilters({
  search,
  setSearch,
  filterType,
  setFilterType,
  filterActive,
  setFilterActive,
}: SkuFiltersProps) {
  return (
    <div className="flex gap-2.5 mb-4 flex-wrap items-center">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search SKU, name, barcode..."
        className="flex-1 min-w-[200px]"
      />
      <div className="flex gap-1.5 flex-wrap">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`
              px-3.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors
              ${
                filterType === t
                  ? "border-[var(--erp-accent)] bg-[var(--erp-accent-bg)] text-[var(--erp-accent)]"
                  : "border-border bg-background text-muted-foreground hover:bg-muted/50"
              }
            `}
            style={
              filterType !== t
                ? { borderColor: "var(--erp-border)", color: "var(--erp-ink3)" }
                : undefined
            }
          >
            {t === "All" ? "All" : (LABELS[t] ?? t)}
          </button>
        ))}
      </div>
      <NativeSelect
        value={filterActive}
        onChange={(e) =>
          setFilterActive(e.target.value as "all" | "active" | "inactive")
        }
        className="w-auto h-9 text-xs font-semibold cursor-pointer border-border"
        style={{ borderColor: "var(--erp-border)" }}
      >
        <option value="active">Active only</option>
        <option value="inactive">Inactive only</option>
        <option value="all">All</option>
      </NativeSelect>
    </div>
  );
}
