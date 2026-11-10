"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PasswordHints } from "@/components/form/PasswordHints";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "../api/authApi";

/**
 * Self-service password reset page for a signed-in user (/change-password).
 * Reuses POST /auth/change-password (JWT identifies the user; no old password
 * needed). On success it mirrors the first-login flow: end the session and
 * send the user back to /login to sign in with the new password.
 */
export function ChangePasswordForm() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword)) {
      setError(
        "รหัสผ่านต้องมีตัวพิมพ์ใหญ่และตัวพิมพ์เล็กอย่างน้อยอย่างละ 1 ตัว",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }

    try {
      setLoading(true);
      await authApi.changePassword({ newPassword });
      useAuthStore.getState().logout();
      router.replace("/login?reset=success");
      if (typeof window !== "undefined" && process.env.NODE_ENV !== "test") {
        window.location.href = "/login?reset=success";
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer className="max-w-2xl">
      {/* <PageHeader
        title="รีเซ็ตรหัสผ่าน"
        description="กำหนดรหัสผ่านใหม่สำหรับบัญชีนี้ เมื่อบันทึกสำเร็จระบบจะนำคุณออกจากระบบเพื่อเข้าสู่ระบบด้วยรหัสผ่านใหม่"
      /> */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          รีเซ็ตรหัสผ่าน
        </h1>
      </div>
      <section className="w-full max-w-md border border-border rounded-2xl bg-white p-8 shadow-sm">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium">
            รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร
            มีตัวพิมพ์ใหญ่และตัวพิมพ์เล็กอย่างน้อยอย่างละ 1 ตัว)
            <Input
              className="mt-2"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <PasswordHints password={newPassword} />
          </label>

          <label className="block text-sm font-medium">
            ยืนยันรหัสผ่านใหม่
            <Input
              className="mt-2"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
            >
              {error}
            </p>
          )}

          <Button className="w-full" disabled={loading}>
            {loading ? "กำลังบันทึก…" : "บันทึกรหัสผ่านใหม่"}
          </Button>
        </form>
      </section>
    </PageContainer>
  );
}
