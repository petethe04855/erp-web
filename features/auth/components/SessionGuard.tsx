"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "../api/authApi";
import { ErrorState } from "@/components/common/ErrorState";
export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const client = useQueryClient();
  const { checked, isAuthenticated, setAuth, logout } = useAuthStore();
  const session = useQuery({
    queryKey: ["session"],
    queryFn: authApi.me,
    retry: false,
  });
  useEffect(() => {
    if (!localStorage.getItem("chawy_v2_token")) logout();
  }, [logout]);
  useEffect(() => {
    if (session.data)
      setAuth({
        ...session.data,
        name:
          [session.data.firstname, session.data.lastname]
            .filter(Boolean)
            .join(" ") || session.data.email,
      });
  }, [session.data, setAuth]);
  useEffect(() => {
    if (checked && !isAuthenticated) {
      client.clear();
      router.replace("/login");
    }
  }, [checked, isAuthenticated, client, router]);
  if (session.isError)
    return (
      <ErrorState
        message={session.error.message}
        onRetry={() => session.refetch()}
      />
    );
  if (!checked || !isAuthenticated || session.isPending)
    return (
      <div className="p-12 text-sm text-neutral-500">กำลังตรวจสอบบัญชี…</div>
    );
  return <>{children}</>;
}
