"use client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "../api/authApi";
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
      router.replace("/dashboard");
    },
  });
}
