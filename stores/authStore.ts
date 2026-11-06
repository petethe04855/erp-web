import { create } from "zustand";

/**
 * Session-presence cookie read by middleware.ts (Edge runtime cannot access
 * localStorage). It carries no secret — only the fact that a session exists;
 * the JWT itself stays in localStorage and every API call is still validated
 * by the backend.
 */
const AUTH_COOKIE = "chawy_v2_auth";

function setAuthCookie() {
  if (typeof document === "undefined") return;
  // Same-site session mirror with 7 days expiry and secure flag when on HTTPS.
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isSecure ? "; secure" : "";
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${maxAge}; samesite=lax${secureFlag}`;
}

/** Re-write the session-presence cookie after a verified /auth/me round trip. */
export function ensureAuthCookie() {
  setAuthCookie();
}

function clearAuthCookie() {
  if (typeof document === "undefined") return;
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isSecure ? "; secure" : "";
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax${secureFlag}`;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
}
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  checked: boolean;
  setAuth: (user: User, token?: string) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  checked: false,
  setAuth: (user, token) => {
    if (token) localStorage.setItem("chawy_v2_token", token);
    setAuthCookie();
    set({ user, isAuthenticated: true, checked: true });
  },
  logout: () => {
    if (typeof window !== "undefined")
      localStorage.removeItem("chawy_v2_token");
    clearAuthCookie();
    set({ user: null, isAuthenticated: false, checked: true });
  },
}));
