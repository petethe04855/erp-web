import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { useAuthStore } from "@/stores/authStore";

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock("@/features/auth/api/authApi", () => ({
  authApi: {
    changePassword: vi.fn(),
  },
}));

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().setAuth({
      id: 1,
      name: "Test",
      email: "test@example.com",
      role: "sales",
      mustResetPassword: true,
    });
  });

  it("validates password length and matching confirmation", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    const newPass = screen.getByLabelText(/^รหัสผ่านใหม่/i);
    const confirmPass = screen.getByLabelText(/ยืนยันรหัสผ่านใหม่/i);
    const submitBtn = screen.getByRole("button", { name: /บันทึกรหัสผ่านใหม่/i });

    // Too short
    await user.type(newPass, "123");
    await user.type(confirmPass, "123");
    await user.click(submitBtn);
    expect(screen.getByText(/รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร/i)).toBeInTheDocument();

    // Missing uppercase or lowercase letter
    await user.clear(newPass);
    await user.clear(confirmPass);
    await user.type(newPass, "abc123");
    await user.type(confirmPass, "abc123");
    await user.click(submitBtn);
    expect(
      screen.getByText(/รหัสผ่านต้องมีตัวพิมพ์ใหญ่และตัวพิมพ์เล็กอย่างน้อยอย่างละ 1 ตัว/i),
    ).toBeInTheDocument();

    // Mismatched
    await user.clear(newPass);
    await user.clear(confirmPass);
    await user.type(newPass, "Password123");
    await user.type(confirmPass, "Password321");
    await user.click(submitBtn);
    expect(screen.getByText(/รหัสผ่านทั้งสองช่องไม่ตรงกัน/i)).toBeInTheDocument();
  });

  it("calls API, logs out and redirects to /login on success", async () => {
    const { authApi } = await import("@/features/auth/api/authApi");
    vi.mocked(authApi.changePassword).mockResolvedValueOnce({ message: "Success" } as any);

    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    const newPass = screen.getByLabelText(/^รหัสผ่านใหม่/i);
    const confirmPass = screen.getByLabelText(/ยืนยันรหัสผ่านใหม่/i);
    const submitBtn = screen.getByRole("button", { name: /บันทึกรหัสผ่านใหม่/i });

    await user.type(newPass, "NewPassword123");
    await user.type(confirmPass, "NewPassword123");
    await user.click(submitBtn);

    expect(authApi.changePassword).toHaveBeenCalledWith({ newPassword: "NewPassword123" });
    await vi.waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(mockReplace).toHaveBeenCalledWith("/login?reset=success");
    });
  });
});
