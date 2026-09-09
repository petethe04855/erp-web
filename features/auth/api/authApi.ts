import { read, writeRecord } from "@/lib/api";
import type {
  LoginCredentials,
  AuthResponseData,
  AuthUser,
} from "../types/auth";
export const authApi = {
  login: (credentials: LoginCredentials) =>
    writeRecord<AuthResponseData>("/auth/login", credentials),
  me: () => read<AuthUser>("/auth/me"),
};
