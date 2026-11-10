import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, renderHook, act } from "@testing-library/react";
import { SessionGuard } from "@/features/auth/components/SessionGuard";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockReplace = vi.fn();
const mockRouter = { replace: mockReplace };
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

vi.mock("@/features/auth/api/authApi", () => ({
  authApi: {
    me: vi.fn(),
    login: vi.fn(),
  },
}));

describe("SessionGuard - mustResetPassword redirection", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("redirects to /reset-password if user mustResetPassword is true", async () => {
    const { authApi } = await import("@/features/auth/api/authApi");
    vi.mocked(authApi.me).mockResolvedValue({
      id: 1,
      firstname: "Test",
      lastname: "User",
      email: "test@example.com",
      role: "sales",
      isActive: true,
      mustResetPassword: true,
    });

    localStorage.setItem("chawy_v2_token", "fake-token");

    render(
      <QueryClientProvider client={queryClient}>
        <SessionGuard>
          <div>Protected Content</div>
        </SessionGuard>
      </QueryClientProvider>,
    );

    // Wait for effect to process
    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/reset-password");
    });
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders protected content if user mustResetPassword is false", async () => {
    const { authApi } = await import("@/features/auth/api/authApi");
    vi.mocked(authApi.me).mockResolvedValue({
      id: 1,
      firstname: "Test",
      lastname: "User",
      email: "test@example.com",
      role: "sales",
      isActive: true,
      mustResetPassword: false,
    });

    localStorage.setItem("chawy_v2_token", "fake-token");

    render(
      <QueryClientProvider client={queryClient}>
        <SessionGuard>
          <div>Protected Content</div>
        </SessionGuard>
      </QueryClientProvider>,
    );

    await vi.waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
    expect(mockReplace).not.toHaveBeenCalledWith("/reset-password");
  });
});

describe("useAuth - mustResetPassword login redirection", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("redirects to /reset-password on login if user mustResetPassword is true", async () => {
    const { authApi } = await import("@/features/auth/api/authApi");
    vi.mocked(authApi.login).mockResolvedValue({
      success: true,
      message: "OK",
      data: {
        token: "jwt-token-123",
        user: {
          id: 2,
          firstname: "First",
          lastname: "Login",
          email: "first@example.com",
          role: "cashier",
          isActive: true,
          mustResetPassword: true,
        },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        email: "first@example.com",
        password: "TempPassword1!",
      });
    });

    expect(mockReplace).toHaveBeenCalledWith("/reset-password");
    expect(useAuthStore.getState().user?.mustResetPassword).toBe(true);
  });

  it("redirects to /dashboard on login if user mustResetPassword is false", async () => {
    const { authApi } = await import("@/features/auth/api/authApi");
    vi.mocked(authApi.login).mockResolvedValue({
      success: true,
      message: "OK",
      data: {
        token: "jwt-token-456",
        user: {
          id: 3,
          firstname: "Regular",
          lastname: "User",
          email: "regular@example.com",
          role: "manager",
          isActive: true,
          mustResetPassword: false,
        },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        email: "regular@example.com",
        password: "RegularPassword1!",
      });
    });

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    expect(useAuthStore.getState().user?.mustResetPassword).toBe(false);
  });
});
