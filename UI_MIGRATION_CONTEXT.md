# UI Migration Context

Last updated: 2026-07-16

## Goal

Migrate the full ERP frontend from inline-style custom controls to a shadcn/Base UI primitive layer with Tailwind styling, while preserving existing business logic and Zustand workflows.

## Current status

Status: **in progress**. The foundation and shared compatibility layer are complete. Individual screens still contain substantial inline styling.

Baseline inventory before migration:

- 45 TSX files / about 11,293 lines
- about 1,522 inline `style` occurrences
- 106 native buttons, 104 native inputs, 33 native selects, and 25 native tables
- 32 files imported the legacy `components/ui.tsx` facade

## Completed

### Theme foundation

- `components/BodyStyle.tsx` maps the existing runtime ERP theme onto shadcn variables.
- Light/dark mode now toggles the `.dark` class.
- Accent, surface, border, foreground, destructive, ring, and radius values share one source of truth.
- Existing `--erp-*` variables remain during the incremental migration.

### New primitives

- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/input.tsx`
- `components/ui/label.tsx`
- `components/ui/native-select.tsx`
- `components/ui/sheet.tsx`
- `components/ui/switch.tsx`
- `components/ui/textarea.tsx`

The native select is intentionally retained as a styled primitive because replacing it with the compound Base UI Select changes the controlled value/event API. Convert those usages only when each form receives focused regression testing.

### Shared compatibility layer

- Legacy `Btn` now renders the shadcn `Button` primitive.
- Legacy `Card` now renders the shadcn `Card` primitive.
- Legacy `Field`, `SelectField`, and `TextAreaField` now render the new form primitives.
- Existing props are preserved so dependent screens migrate safely without a big-bang rewrite.

### Shared interaction migration

- `components/SlidePanel.tsx` now uses the Base UI-backed `Sheet`.
- This automatically upgrades all existing SlidePanel consumers across expenses, goods issue/receive, invoice, manual orders, purchasing, quotation, returns, sales orders, sampling, stock, and users.
- The new Sheet provides modal semantics, focus trapping/restoration, Escape handling, outside dismissal, and scroll locking.

### Pilot screen

- `app/(home)/settings/page.tsx`
- Company inputs and textarea use the new primitives.
- Settings toggles use the accessible Base UI Switch.

## Verification

- `npm.cmd test`: 26/26 passing
- `npx.cmd tsc --noEmit`: passing
- `git diff --check`: passing at the last checkpoint
- `npm.cmd run build`: blocked by network access while `next/font` tries to fetch Geist from Google. No migration-related compile error was reported before that external fetch failure.

## Remaining work

### Phase 1: Complete primitives

- Checkbox
- Badge
- Table and ERP DataTable wrapper
- Tabs
- DropdownMenu
- Popover
- Tooltip
- Dialog and AlertDialog
- Skeleton, empty state, and toast treatment

### Phase 2: Shared shell

- Convert `TopBar`, `PageBody`, `Sidebar`, `AuthGuard` presentation, and responsive navigation to Tailwind.
- Convert status/category/stock badges to the Badge primitive.
- Convert `StatStrip`, `MetricTile`, and table wrappers to Tailwind/domain components.
- Split formatting helpers and product types out of `components/ui.tsx`.

### Phase 3: Screen migration order

1. SKU and its modal/filter components
2. Sales Orders
3. Quotation, Invoice, Returns
4. Purchase Request, Purchase Order
5. Stock, Goods Receive, Goods Issue, Transfer, Check
6. Expenses, Budget, P&L
7. TikTok and live commerce screens
8. Users and remaining Settings sections
9. Dashboard last, because it has the densest custom visualization/layout code

For each screen: replace native controls, remove inline layout styles, verify light/dark and responsive behavior, then run TypeScript and relevant workflow tests.

### Phase 4: Cleanup

- Remove unused exports and `controlBase` from `components/ui.tsx` as consumers reach zero.
- Remove `.erp-*` legacy classes and duplicate variables from `app/globals.css` only after searches show no consumers.
- Remove `components/ui.tsx` after domain components and formatting utilities have dedicated modules.
- Run full visual, keyboard, responsive, test, and production-build verification.

## Important constraints

- Do not change Zustand store behavior during UI migration.
- Do not replace native selects mechanically; Base UI Select has a different API.
- Preserve invoice print styles and html2canvas-compatible non-OKLCH colors.
- Preserve user changes in the worktree; all current uncommitted UI files belong to this migration.

## Recommended next action

Build `Badge`, `Checkbox`, and `Table` primitives, refactor the corresponding legacy exports in `components/ui.tsx`, then migrate the SKU screen and its four modal/filter components as the first complete reference module.
