"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { ensureAuthCookie } from "@/stores/authStore";
import { authApi } from "../api/authApi";
import { ErrorState } from "@/components/common/ErrorState";
export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const client = useQueryClient();
  const { checked, isAuthenticated, setAuth, logout } = useAuthStore();
  const hasToken =
    typeof window !== "undefined" && !!localStorage.getItem("chawy_v2_token");
  const session = useQuery({
    queryKey: ["session"],
    queryFn: authApi.me,
    retry: false,
    enabled: hasToken,
  });
  useEffect(() => {
    if (!localStorage.getItem("chawy_v2_token")) logout();
  }, [logout]);
  useEffect(() => {
    if (session.data) {
      // Session verified against the backend: restore the middleware cookie
      // if the browser lost it while the token is still valid.
      ensureAuthCookie();
      setAuth({
        ...session.data,
        name:
          [session.data.firstname, session.data.lastname]
            .filter(Boolean)
            .join(" ") || session.data.email,
        mustResetPassword: session.data.mustResetPassword,
      });

      if (session.data.mustResetPassword) {
        router.replace("/reset-password");
      }
    }
  }, [session.data, setAuth, router]);
  useEffect(() => {
    const tokenExists =
      typeof window !== "undefined" && !!localStorage.getItem("chawy_v2_token");
    if (!tokenExists && checked && !isAuthenticated) {
      client.clear();
      router.replace("/login");
    } else if (
      tokenExists &&
      !session.isPending &&
      checked &&
      !isAuthenticated
    ) {
      client.clear();
      router.replace("/login");
    }
  }, [session.isPending, checked, isAuthenticated, client, router]);
  if (session.isError)
    return (
      <ErrorState
        message={session.error.message}
        onRetry={() => session.refetch()}
      />
    );
  if (
    !checked ||
    !isAuthenticated ||
    session.isPending ||
    session.data?.mustResetPassword
  )
    return (
      <div className="p-12 text-sm text-neutral-500">กำลังตรวจสอบบัญชี…</div>
    );
  return <>{children}</>;
}
