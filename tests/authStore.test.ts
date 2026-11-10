import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/authStore";

describe("authStore - mustResetPassword", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it("stores mustResetPassword and allows completePasswordReset", () => {
    useAuthStore.getState().setAuth({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "sales",
      mustResetPassword: true,
    });

    expect(useAuthStore.getState().user?.mustResetPassword).toBe(true);

    useAuthStore.getState().completePasswordReset();
    expect(useAuthStore.getState().user?.mustResetPassword).toBe(false);
  });
});
