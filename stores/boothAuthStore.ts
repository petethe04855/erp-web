import { create } from "zustand";
import type { User } from "./authStore";

export const BOOTH_TOKEN_KEY = "chawy_booth_token";

interface BoothAuthState {
  user: User | null;
  isAuthenticated: boolean;
  checked: boolean;
  setAuth: (user: User, token?: string) => void;
  logout: () => void;
}

/**
 * Isolated auth state for /booth and /stock-out so tablet/booth sessions
 * never share or overwrite the main ERP workspace session.
 */
export const useBoothAuthStore = create<BoothAuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  checked: false,
  setAuth: (user, token) => {
    if (token && typeof window !== "undefined") {
      localStorage.setItem(BOOTH_TOKEN_KEY, token);
    }
    set({ user, isAuthenticated: true, checked: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(BOOTH_TOKEN_KEY);
    }
    set({ user: null, isAuthenticated: false, checked: true });
  },
}));
