"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "../api/authApi";
import { useAuthStore } from "@/stores/authStore";

export function ResetPasswordForm() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("chawy_v2_token")) {
      router.replace("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword)) {
      setError("รหัสผ่านต้องมีตัวพิมพ์ใหญ่และตัวพิมพ์เล็กอย่างน้อยอย่างละ 1 ตัว");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }

    try {
      setLoading(true);
      await authApi.changePassword({ newPassword });
      // Force re-login with the new password: drop the current session and
      // land on /login, which shows a success notice via ?reset=success.
      useAuthStore.getState().logout();
      router.replace("/login?reset=success");
      if (typeof window !== "undefined" && process.env.NODE_ENV !== "test") {
        window.location.href = "/login?reset=success";
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-md border border-border rounded-2xl bg-white p-8 sm:p-10 shadow-sm">
      <p className="text-xs tracking-[0.25em] text-neutral-500 mb-8">
        CHAWY / SECURITY
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">ตั้งรหัสผ่านใหม่</h1>
      <p className="text-sm text-neutral-500 mt-2 mb-6">
        เนื่องจากเป็นการเข้าสู่ระบบครั้งแรก กรุณากำหนดรหัสผ่านใหม่เพื่อความปลอดภัย
        เมื่อบันทึกสำเร็จระบบจะนำคุณกลับไปหน้าเข้าสู่ระบบด้วยรหัสผ่านใหม่
      </p>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium">
          รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร มีตัวพิมพ์ใหญ่และตัวพิมพ์เล็กอย่างน้อยอย่างละ 1 ตัว)
          <Input
            className="mt-2"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
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
  );
}
