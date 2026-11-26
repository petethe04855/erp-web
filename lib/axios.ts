import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { BOOTH_TOKEN_KEY, useBoothAuthStore } from "@/stores/boothAuthStore";

function isBoothRoute() {
  if (typeof window === "undefined") return false;
  const p = window.location.pathname;
  return p === "/booth" || p.startsWith("/booth/") || p === "/stock-out" || p.startsWith("/stock-out/");
}

// The original ERP API exposes the same commands under /api/v1 for this client.
const configured = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
export const API_BASE_URL =
  configured.replace(/\/api(?:\/v1)?\/?$/, "").replace(/\/$/, "") + "/api/v1";
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});
apiClient.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(isBoothRoute() ? BOOTH_TOKEN_KEY : "chawy_v2_token")
      : null;
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login")
    ) {
      if (isBoothRoute()) useBoothAuthStore.getState().logout();
      else useAuthStore.getState().logout();
    }
    const detail = error.response?.data?.error;
    // Timeout (request aborted, no response) is not the same as "API down".
    if (!error.response && error.code === "ECONNABORTED") {
      return Promise.reject(
        new Error("การเชื่อมต่อใช้เวลานานเกินไป (timeout) กรุณาลองใหม่อีกครั้ง"),
      );
    }
    return Promise.reject(
      new Error(
        typeof detail === "string"
          ? detail
          : detail?.message ||
              (error.response
                ? "ทำรายการไม่สำเร็จ (HTTP " + error.response.status + ")"
                : "เชื่อมต่อ ERP API ไม่ได้ กรุณาลองใหม่"),
      ),
    );
  },
);
export default apiClient;
