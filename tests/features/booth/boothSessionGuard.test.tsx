import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BoothSessionGuard } from "@/features/booth/components/BoothSessionGuard";
import { BOOTH_TOKEN_KEY, useBoothAuthStore } from "@/stores/boothAuthStore";

vi.mock("@/features/auth/api/authApi", () => ({
  authApi: {
    me: vi.fn(),
    login: vi.fn(),
  },
}));

describe("BoothSessionGuard", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useBoothAuthStore.getState().logout();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("shows BoothLoginScreen when no booth token exists (even if ERP token exists)", () => {
    localStorage.setItem("chawy_v2_token", "erp-token");

    render(
      <QueryClientProvider client={queryClient}>
        <BoothSessionGuard>
          <div>Booth POS</div>
        </BoothSessionGuard>
      </QueryClientProvider>,
    );

    expect(screen.getByRole("heading", { name: "เข้าสู่ระบบหน้าบูธ" })).toBeInTheDocument();
    expect(screen.queryByText("Booth POS")).not.toBeInTheDocument();
  });

  it("falls through to BoothLoginScreen when booth token is cleared on 401", async () => {
    const { authApi } = await import("@/features/auth/api/authApi");
    vi.mocked(authApi.me).mockImplementation(async () => {
      useBoothAuthStore.getState().logout();
      throw new Error("Invalid or expired token");
    });

    localStorage.setItem(BOOTH_TOKEN_KEY, "expired-booth-token");

    render(
      <QueryClientProvider client={queryClient}>
        <BoothSessionGuard>
          <div>Booth POS</div>
        </BoothSessionGuard>
      </QueryClientProvider>,
    );

    await vi.waitFor(() => {
      expect(screen.getByRole("heading", { name: "เข้าสู่ระบบหน้าบูธ" })).toBeInTheDocument();
    });
    expect(screen.queryByText("Invalid or expired token")).not.toBeInTheDocument();
    expect(screen.queryByText("เข้าสู่ระบบใหม่")).not.toBeInTheDocument();
  });

  it("shows retry/relogin error box on non-401 error while token still exists", async () => {
    const { authApi } = await import("@/features/auth/api/authApi");
    vi.mocked(authApi.me).mockRejectedValue(new Error("เชื่อมต่อ ERP API ไม่ได้ กรุณาลองใหม่"));

    localStorage.setItem(BOOTH_TOKEN_KEY, "valid-booth-token");

    render(
      <QueryClientProvider client={queryClient}>
        <BoothSessionGuard>
          <div>Booth POS</div>
        </BoothSessionGuard>
      </QueryClientProvider>,
    );

    await vi.waitFor(() => {
      expect(screen.getByText("เชื่อมต่อ ERP API ไม่ได้ กรุณาลองใหม่")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "ลองใหม่" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "เข้าสู่ระบบใหม่" })).toBeInTheDocument();
  });

  it("renders children when booth token is valid", async () => {
    const { authApi } = await import("@/features/auth/api/authApi");
    vi.mocked(authApi.me).mockResolvedValue({
      id: 1,
      firstname: "Booth",
      lastname: "Staff",
      email: "booth@example.com",
      role: "sales",
      isActive: true,
      mustResetPassword: false,
    });

    localStorage.setItem(BOOTH_TOKEN_KEY, "valid-booth-token");

    render(
      <QueryClientProvider client={queryClient}>
        <BoothSessionGuard>
          <div>Booth POS</div>
        </BoothSessionGuard>
      </QueryClientProvider>,
    );

    await vi.waitFor(() => {
      expect(screen.getByText("Booth POS")).toBeInTheDocument();
    });
  });
});
