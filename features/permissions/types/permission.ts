import type { UserRole } from "@/features/users/types/user";

export type PermissionAction = "view" | "create" | "edit" | "delete";

export const PERMISSION_ACTIONS: { key: PermissionAction; label: string }[] = [
  { key: "view", label: "เข้าหน้า" },
  { key: "create", label: "สร้าง" },
  { key: "edit", label: "แก้ไข" },
  { key: "delete", label: "ลบ / ยกเลิก" },
];

export interface PageAccess {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface PermissionPage {
  key: string;
  label: string;
  group: string;
  path: string;
  actions: PermissionAction[];
}

/** Roles the owner can configure (owner itself always has full access). */
export type ConfigurableRole = Exclude<UserRole, "owner">;

/** GET /role-permissions */
export interface PermissionMatrix {
  roles: ConfigurableRole[];
  pages: PermissionPage[];
  permissions: Record<string, Record<string, PageAccess>>;
}

/** PUT /role-permissions/:role and GET /auth/permissions */
export interface RolePermissions {
  role: string;
  permissions: Record<string, PageAccess>;
  /** page key -> web route (only on GET /auth/permissions) */
  paths?: Record<string, string>;
}

export const NO_ACCESS: PageAccess = {
  view: false,
  create: false,
  edit: false,
  delete: false,
};
