"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/authApi";
import type { AuthUser, LoginCredentials } from "@/features/auth/types/auth";
import { BOOTH_TOKEN_KEY, useBoothAuthStore } from "@/stores/boothAuthStore";
import s from "./booth.module.css";

function toUser(u: AuthUser) {
  return {
    id: u.id,
    name: [u.firstname, u.lastname].filter(Boolean).join(" ") || u.email,
    email: u.email,
    role: u.role,
    mustResetPassword: u.mustResetPassword,
  };
}

function BoothLoginScreen() {
  const client = useQueryClient();
  const setAuth = useBoothAuthStore((st) => st.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useMutation({
    mutationFn: (creds: LoginCredentials) => authApi.login(creds),
    onSuccess: (res) => {
      client.clear();
      setAuth(toUser(res.data.user), res.data.token);
    },
  });

  return (
    <div className={s.pos} style={{ justifyContent: "center", alignItems: "center", padding: 20 }}>
      <section
        aria-label="เข้าสู่ระบบบูธ"
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 20,
          padding: 28,
          display: "grid",
          gap: 18,
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.2em", color: "var(--muted)" }}>
            CHAWY · BOOTH &amp; STOCK-OUT
          </p>
          <h1 style={{ margin: "8px 0 4px", font: "800 26px/1.2 var(--font-head)" }}>
            เข้าสู่ระบบหน้าบูธ
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>
            แยกเซสชันจาก ERP หลัก (ใช้บัญชีและสิทธิ์เดียวกับ ERP)
          </p>
        </div>

        <form
          style={{ display: "grid", gap: 14 }}
          onSubmit={(e) => {
            e.preventDefault();
            login.mutate({ email, password });
          }}
        >
          <label style={{ display: "grid", gap: 6, fontSize: 14, fontWeight: 600 }}>
            อีเมล
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                minHeight: 46,
                padding: "0 14px",
                borderRadius: 12,
                border: "1.5px solid var(--line)",
                background: "var(--bg)",
                color: "var(--ink)",
              }}
            />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 14, fontWeight: 600 }}>
            รหัสผ่าน
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                minHeight: 46,
                padding: "0 14px",
                borderRadius: 12,
                border: "1.5px solid var(--line)",
                background: "var(--bg)",
                color: "var(--ink)",
              }}
            />
          </label>

          {login.error && (
            <p
              role="alert"
              style={{
                margin: 0,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--danger)",
                color: "var(--danger)",
                fontSize: 14,
              }}
            >
              {login.error instanceof Error ? login.error.message : "เข้าสู่ระบบไม่สำเร็จ"}
            </p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            style={{
              marginTop: 4,
              minHeight: 50,
              borderRadius: 14,
              background: "var(--ink)",
              color: "var(--bg)",
              font: "700 16px var(--font-head)",
              opacity: login.isPending ? 0.6 : 1,
            }}
          >
            {login.isPending ? "กำลังตรวจสอบ…" : "เข้าสู่ระบบหน้าบูธ"}
          </button>
        </form>
      </section>
    </div>
  );
}

/**
 * Isolated session guard for /booth and /stock-out.
 * Uses chawy_booth_token instead of chawy_v2_token and shows an inline
 * booth login screen instead of redirecting to the ERP /login page.
 */
export function BoothSessionGuard({ children }: { children: React.ReactNode }) {
  const client = useQueryClient();
  const { checked, isAuthenticated, setAuth, logout } = useBoothAuthStore();
  const hasToken =
    typeof window !== "undefined" && !!localStorage.getItem(BOOTH_TOKEN_KEY);

  const session = useQuery({
    queryKey: ["booth-session"],
    queryFn: authApi.me,
    retry: false,
    enabled: hasToken,
  });

  useEffect(() => {
    if (!localStorage.getItem(BOOTH_TOKEN_KEY)) {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    if (session.data) {
      setAuth(toUser(session.data));
    }
  }, [session.data, setAuth]);

  // Only show the error screen when a token is still present (e.g. network/5xx).
  // If a 401 already cleared BOOTH_TOKEN_KEY, fall through to BoothLoginScreen.
  if (hasToken && session.isError && !isAuthenticated) {
    return (
      <div className={s.pos} style={{ justifyContent: "center", alignItems: "center", padding: 20 }}>
        <div className={`${s.panel} ${s.errorBox}`} style={{ maxWidth: 420, width: "100%", display: "grid", gap: 12 }}>
          <span>{session.error instanceof Error ? session.error.message : "ตรวจสอบบัญชีไม่สำเร็จ"}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className={s.smallBtn} onClick={() => session.refetch()}>
              ลองใหม่
            </button>
            <button
              type="button"
              className={s.smallBtn}
              onClick={() => {
                client.clear();
                logout();
              }}
            >
              เข้าสู่ระบบใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!checked || (hasToken && session.isPending)) {
    return (
      <div className={s.pos} style={{ justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "var(--muted)", fontSize: 15 }}>กำลังตรวจสอบบัญชีหน้าบูธ…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <BoothLoginScreen />;
  }

  return <>{children}</>;
}
