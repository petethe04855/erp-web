"use client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "../api/authApi";
import { sanitizeRedirectPath } from "@/lib/utils";

export function useAuth() {
  const client = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data }) => {
      client.clear();
      useAuthStore
        .getState()
        .setAuth(
          {
            ...data.user,
            name:
              [data.user.firstname, data.user.lastname]
                .filter(Boolean)
                .join(" ") || data.user.email,
          },
          data.token,
        );
      // Honor the ?next= target middleware preserved when it redirected an
      // unauthenticated request to /login; default to the dashboard.
      // WEB-TS-01: Sanitize path to prevent open redirect attacks via protocol-relative URLs (e.g. //evil.com).
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");
      router.replace(sanitizeRedirectPath(next, "/dashboard"));
    },
  });
}
