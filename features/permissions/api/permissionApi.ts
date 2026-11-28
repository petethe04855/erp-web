import { read, writeRecord } from "@/lib/api";
import type {
  PageAccess,
  PermissionMatrix,
  RolePermissions,
} from "../types/permission";

export const permissionApi = {
  /** Owner only: every configurable page and each role's access. */
  getMatrix: () => read<PermissionMatrix>("/role-permissions"),
  /** Owner only: replace one role's access on the given pages. */
  updateRole: (role: string, permissions: Record<string, PageAccess>) =>
    writeRecord<RolePermissions>(
      `/role-permissions/${encodeURIComponent(role)}`,
      { permissions },
      "put",
    ),
  /** Signed-in user's own access, for the menu and page guards. */
  getMine: () => read<RolePermissions>("/auth/permissions"),
};
