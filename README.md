# ERP Web V2

Next.js frontend with a monochrome UI, feature API services, TanStack Query and Chart.js dashboards.

## Backend compatibility

This frontend targets the original `../erp-api` backend and its existing database, **not** `erp-api-v2`. Restart the updated original API to register `/api/v1` routes. Existing `/api` routes remain available to the original `erp-web`.

The default API URL is `http://localhost:8080/api/v1`. Deployments can supply `NEXT_PUBLIC_API_URL` at build time. Login uses the original email/password and permissions. No demo login or mock fallback is provided.

Paginated reads use `/api/v1/workspace/*`. Writes and reports use aliases of the original backend handlers. Business rules, document totals, stock movements and transactions remain on the backend. New paginated reads use delivery, usecase, domain and repository layers; existing command handlers have not been migrated to Clean Architecture in this change.

## Run

```sh
npm ci
npm run dev
```

The frontend uses port 8082, included in the original API's default local CORS configuration. Production deployments must configure their own allowed frontend origin.

## Scope

Connected modules: products/SKU, inventory, orders, quotations, purchase orders, invoices, customers, goods receipts/issues, reports and company settings. Dashboard charts read revenue, financial summary and inventory valuation reports. Revenue and accounting charts follow the selected month; inventory valuation is the current balance.

This is not a complete migration of every legacy screen. Bundle component details are available, but virtual bundle availability is not displayed. Additional legacy platform and specialized workflows remain in the original frontend.

## Validation

```sh
npm run typecheck
node scripts/qa-stage.cjs build
node node_modules/next/dist/bin/next build .qa/build
```

The staging helper copies only allowlisted source paths and excludes environment files. Backend tests run with `go test ./...` in `erp-api`.

Browser checks were performed with intercepted test fixtures for authentication, charts, pagination, responsive layouts, write failures and zero-count stock adjustments. Screenshots from these checks contain test data. Live database parity still requires checking both applications against the same configured API and database.
