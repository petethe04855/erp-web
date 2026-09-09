# WEB-28: Search, Pagination & Quick Lookup Design Specification

**Date:** 2026-09-07  
**Status:** Approved  
**Target:** `erp-web-v2`  
**Issues Addressed:** WEB-28 (SearchPanel, Direct Page Jump, Rows Per Page, Form Quick Lookup)

---

## 1. Objectives & Requirements

1. **User-Configurable Pagination (Rows Per Page)**:
   - Provide dropdown for users to choose page size: `10`, `20`, `50`, `100` items per page.
   - On limit change: reset page to 1, re-fetch data with the new page size, and update total pages calculation.
2. **Direct Page Navigation & Jump**:
   - Provide direct clickable buttons for page numbers with smart windowing (e.g. `1, 2, 3 ... 10` or `... 4, 5, 6 ...`).
   - Provide First Page (`<<`) and Last Page (`>>`) buttons.
   - Provide an optional Quick Jump text input for jumping to any valid page number.
3. **DataTable Integration**:
   - Update `DataTable.tsx` to support `onLimitChange?: (limit: number) => void` and pass it down to `Pagination`.
   - Ensure clean responsive layout across desktop and tablet screens.
4. **Reusable SearchPanel Component**:
   - Create `components/common/SearchPanel.tsx` providing a unified layout for the left column in `TwoColumnLayout`:
     - Header with title and "ล้างค่า (Reset)" button.
     - Search input with debounce.
     - Active filters count indicator.
5. **Quick Lookup Component**:
   - Create `components/common/QuickLookup.tsx` providing debounced autocompletion for SKU, Customer, Supplier, and Lot selectors in creation forms.

---

## 2. Component Interfaces

### 2.1 `Pagination.tsx`
```typescript
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  limit?: number;
  limitOptions?: number[];
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  showQuickJump?: boolean;
}
```

### 2.2 `DataTable.tsx`
```typescript
export interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  meta: ApiPaginationMeta;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  actions?: (row: T) => React.ReactNode;
}
```

### 2.3 `SearchPanel.tsx`
```typescript
export interface SearchPanelProps {
  title?: string;
  onReset?: () => void;
  activeFilterCount?: number;
  children: React.ReactNode;
}
```

### 2.4 `QuickLookup.tsx`
```typescript
export interface QuickLookupOption {
  id: string | number;
  title: string;
  subtitle?: string;
  badge?: string;
  extra?: string;
  data?: any;
}

export interface QuickLookupProps {
  label?: string;
  placeholder?: string;
  value?: string | number;
  onChange: (value: string | number, selectedOption?: QuickLookupOption) => void;
  onSearch: (query: string) => Promise<QuickLookupOption[]>;
  disabled?: boolean;
}
```
