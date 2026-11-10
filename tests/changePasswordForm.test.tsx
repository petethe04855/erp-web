import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";
import { useAuthStore } from "@/stores/authStore";

const mockReplace = vi.fn();
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, back: mockBack }),
}));

vi.mock("@/features/auth/api/authApi", () => ({
  authApi: {
    changePassword: vi.fn(),
  },
}));

describe("ChangePasswordForm (/change-password)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().setAuth({
      id: 1,
      name: "Test",
      email: "test@example.com",
      role: "owner",
      mustResetPassword: false,
    });
  });

  it("rejects mismatched confirmation without calling the API", async () => {
    const { authApi } = await import("@/features/auth/api/authApi");
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    await user.type(screen.getByLabelText(/^รหัสผ่านใหม่/), "Password123");
    await user.type(screen.getByLabelText(/ยืนยันรหัสผ่านใหม่/), "Password321");
    await user.click(screen.getByRole("button", { name: /บันทึกรหัสผ่านใหม่/ }));

    expect(screen.getByText(/รหัสผ่านทั้งสองช่องไม่ตรงกัน/i)).toBeInTheDocument();
    expect(authApi.changePassword).not.toHaveBeenCalled();
  });

  it("changes password, logs out and redirects to /login on success", async () => {
    const { authApi } = await import("@/features/auth/api/authApi");
    vi.mocked(authApi.changePassword).mockResolvedValueOnce({ message: "Success" } as any);

    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    await user.type(screen.getByLabelText(/^รหัสผ่านใหม่/), "NewPassword123");
    await user.type(screen.getByLabelText(/ยืนยันรหัสผ่านใหม่/), "NewPassword123");
    await user.click(screen.getByRole("button", { name: /บันทึกรหัสผ่านใหม่/ }));

    expect(authApi.changePassword).toHaveBeenCalledWith({ newPassword: "NewPassword123" });
    await vi.waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(mockReplace).toHaveBeenCalledWith("/login?reset=success");
    });
  });

  it("goes back to the previous page when the back button is clicked", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    await user.click(screen.getByRole("button", { name: /ย้อนกลับ/ }));
    expect(mockBack).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
