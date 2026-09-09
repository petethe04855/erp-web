import { create } from "zustand";
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
    set({ user, isAuthenticated: true, checked: true });
  },
  logout: () => {
    if (typeof window !== "undefined")
      localStorage.removeItem("chawy_v2_token");
    set({ user: null, isAuthenticated: false, checked: true });
  },
}));
