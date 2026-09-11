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
  // Same-site session mirror; the value is irrelevant, only presence matters.
  document.cookie = `${AUTH_COOKIE}=1; path=/; samesite=lax`;
}

/** Re-write the session-presence cookie after a verified /auth/me round trip. */
export function ensureAuthCookie() {
  setAuthCookie();
}

function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
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
