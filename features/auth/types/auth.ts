export interface LoginCredentials {
  email: string;
  password: string;
}
export interface AuthUser {
  id: number | string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  isActive: boolean;
}
export interface AuthResponseData {
  token: string;
  user: AuthUser;
}
