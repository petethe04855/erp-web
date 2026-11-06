# WEB-28: Search, Pagination & Quick Lookup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement user-configurable rows per page, direct page navigation/jump, reusable SearchPanel, and form QuickLookup for `erp-web-v2` (WEB-28).

**Architecture:** Shared React UI components (`components/common/`) following Next.js App Router, Tailwind CSS, and Lucide icons, integrated with feature hooks (`useFilters`).

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Lucide React, React Hook Form.

## Global Constraints

- Follow ERP Web Two-Column Architecture (`TwoColumnLayout`).
- Keep components responsive and accessible.
- Maintain existing props compatibility so other pages do not break.
- Never read or modify `.env` files.

---

### Task 1: Upgrade `components/common/Pagination.tsx`

**Files:**
- Modify: `components/common/Pagination.tsx`

**Interfaces:**
- Produces: Enhanced `Pagination` component with limit dropdown, smart windowed page numbers, First/Last page buttons, and Quick Jump input.

- [ ] **Step 1: Implement Rows Per Page dropdown (`10`, `20`, `50`, `100`)**
- [ ] **Step 2: Implement page navigation buttons (First `<<`, Prev `<`, Page numbers, Next `>`, Last `>>`)**
- [ ] **Step 3: Implement Quick Jump input with validation**
- [ ] **Step 4: Verify component renders correctly without errors**

---

### Task 2: Upgrade `components/common/DataTable.tsx`

**Files:**
- Modify: `components/common/DataTable.tsx`

**Interfaces:**
- Produces: `DataTable` accepting `onLimitChange?: (limit: number) => void` and forwarding it to `Pagination`.

- [ ] **Step 1: Add `onLimitChange?: (limit: number) => void` to `DataTable` props**
- [ ] **Step 2: Pass `limit` and `onLimitChange` to `<Pagination ... />`**
- [ ] **Step 3: Update item summary header**

---

### Task 3: Create Reusable `components/common/SearchPanel.tsx`

**Files:**
- Create: `components/common/SearchPanel.tsx`

**Interfaces:**
- Produces: Standardized container with title, clear/reset button, active filter counter badge, and slot for filter controls.

- [ ] **Step 1: Implement `SearchPanel` layout and styling**
- [ ] **Step 2: Add reset button and active filter count badge**

---

### Task 4: Create `components/common/QuickLookup.tsx`

**Files:**
- Create: `components/common/QuickLookup.tsx`

**Interfaces:**
- Produces: Debounced typeahead combobox for fast lookups in creation forms (SKU, Customer, Supplier, Lots).

- [ ] **Step 1: Implement debounced input and dropdown list**
- [ ] **Step 2: Add option selection and keyboard navigation**

---

### Task 5: Integrate into Feature Hooks & Tables

**Files:**
- Modify: `features/orders/hooks/useOrders.ts`
- Modify: `features/orders/components/OrderTable.tsx`
- Modify: `features/sku/hooks/useSKU.ts`
- Modify: `features/sku/components/SKUTable.tsx`
- Modify: `features/customers/hooks/useCustomers.ts`
- Modify: `features/customers/components/CustomerTable.tsx`

**Interfaces:**
- Produces: Working row limit and page switching across Orders, SKU, and Customer screens.

- [ ] **Step 1: Add `handleLimitChange` to hooks**
- [ ] **Step 2: Wire `onLimitChange` to table components**

---

### Task 6: Build & Verification

- [ ] **Step 1: Run `npm run build` in `erp-web-v2`**
- [ ] **Step 2: Verify zero TypeScript errors and all static pages build**
