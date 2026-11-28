import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/features/permissions/api/permissionApi", () => ({
  permissionApi: {
    getMatrix: vi.fn(),
    updateRole: vi.fn(),
    getMine: vi.fn(),
  },
}));

import { permissionApi } from "@/features/permissions/api/permissionApi";
import { RolePermissionsSettings } from "@/features/permissions/components/RolePermissionsSettings";
import { useMyPermissions } from "@/features/permissions/hooks/useMyPermissions";
import { useAuthStore } from "@/stores/authStore";
import type { PermissionMatrix } from "@/features/permissions/types/permission";

const none = { view: false, create: false, edit: false, delete: false };

const matrix: PermissionMatrix = {
  roles: ["sales", "warehouse", "accountant", "live"],
  pages: [
    { key: "dashboard", label: "Dashboard", group: "ภาพรวม", path: "/dashboard", actions: ["view"] },
    { key: "sku", label: "SKU Master", group: "สินค้าและคลัง", path: "/sku", actions: ["view", "create", "edit", "delete"] },
  ],
  permissions: {
    sales: {
      dashboard: { ...none, view: true },
      sku: { view: true, create: true, edit: true, delete: false },
    },
    warehouse: { dashboard: { ...none, view: true }, sku: { ...none, view: true } },
    accountant: { dashboard: { ...none, view: true }, sku: { ...none } },
    live: { dashboard: { ...none, view: true }, sku: { ...none } },
  },
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function signIn(role: string) {
  useAuthStore.setState({
    user: { id: 1, name: "u", email: "u@example.com", role },
    isAuthenticated: true,
    checked: true,
  });
}

describe("Role permissions settings page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("is closed to anyone but the owner", () => {
    signIn("sales");
    render(<RolePermissionsSettings />, { wrapper });
    expect(screen.getByText(/เฉพาะเจ้าของกิจการ/)).toBeInTheDocument();
    expect(permissionApi.getMatrix).not.toHaveBeenCalled();
  });

  it("lets the owner grant delete on a page and saves the whole role", async () => {
    signIn("owner");
    vi.mocked(permissionApi.getMatrix).mockResolvedValue(matrix);
    vi.mocked(permissionApi.updateRole).mockResolvedValue({
      success: true,
      data: {
        role: "sales",
        permissions: { ...matrix.permissions.sales, sku: { view: true, create: true, edit: true, delete: true } },
      },
      message: "ok",
    } as never);

    render(<RolePermissionsSettings />, { wrapper });

    const del = await screen.findByLabelText("ลบ / ยกเลิก: SKU Master");
    expect(del).not.toBeChecked();
    expect(screen.getByRole("button", { name: /บันทึกสิทธิ์/ })).toBeDisabled();

    fireEvent.click(del);
    expect(del).toBeChecked();
    expect(screen.getByText("แก้ไขแล้ว 1 หน้า")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /บันทึกสิทธิ์/ }));
    await waitFor(() =>
      expect(permissionApi.updateRole).toHaveBeenCalledWith("sales", {
        dashboard: { ...none, view: true },
        sku: { view: true, create: true, edit: true, delete: true },
      }),
    );
    expect(await screen.findByText(/บันทึกสิทธิ์ของ/)).toBeInTheDocument();
  });

  it("discards unsaved edits", async () => {
    signIn("owner");
    vi.mocked(permissionApi.getMatrix).mockResolvedValue(matrix);
    render(<RolePermissionsSettings />, { wrapper });

    const view = await screen.findByLabelText("เข้าหน้า: SKU Master");
    fireEvent.click(view);
    expect(view).not.toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: /ยกเลิก/ }));
    expect(view).toBeChecked();
  });
});

describe("useMyPermissions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps routes to pages and answers per action", async () => {
    signIn("warehouse");
    vi.mocked(permissionApi.getMine).mockResolvedValue({
      role: "warehouse",
      permissions: { dashboard: { ...none, view: true }, sku: { ...none, view: true }, shopee_orders: { ...none } },
      paths: { dashboard: "/dashboard", sku: "/sku", shopee_orders: "/shopee/orders" },
    });

    const { result } = renderHook(() => useMyPermissions(), { wrapper });
    await waitFor(() => expect(result.current.isReady).toBe(true));

    expect(result.current.canOpenPath("/sku")).toBe(true);
    expect(result.current.canOpenPath("/shopee/orders/123")).toBe(false);
    expect(result.current.canOpenPath("/skus-elsewhere")).toBe(true); // not a catalog page
    expect(result.current.can("sku", "edit")).toBe(false);
  });

  it("gives the owner everything without asking the API", () => {
    signIn("owner");
    const { result } = renderHook(() => useMyPermissions(), { wrapper });
    expect(result.current.can("finance_expenses", "delete")).toBe(true);
    expect(result.current.canOpenPath("/finance/expenses")).toBe(true);
  });
});
