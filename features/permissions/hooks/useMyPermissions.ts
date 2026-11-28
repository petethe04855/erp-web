import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { permissionApi } from "../api/permissionApi";
import type { PermissionAction } from "../types/permission";

export const MY_PERMISSIONS_KEY = ["my-permissions"] as const;

/**
 * The signed-in user's page access. The API enforces every right; this hook
 * only decides what the menu shows and which pages render.
 */
export function useMyPermissions() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isOwner = user?.role?.toLowerCase() === "owner";

  const query = useQuery({
    queryKey: [...MY_PERMISSIONS_KEY, user?.id, user?.role],
    queryFn: permissionApi.getMine,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const permissions = query.data?.permissions;
  const paths = query.data?.paths;

  /** Page key whose route is the longest prefix of pathname, if any. */
  const pageKeyForPath = useCallback(
    (pathname: string): string | undefined => {
      if (!paths) return undefined;
      let best: string | undefined;
      let bestLen = -1;
      for (const [key, path] of Object.entries(paths)) {
        const matches = pathname === path || pathname.startsWith(path + "/");
        if (matches && path.length > bestLen) {
          best = key;
          bestLen = path.length;
        }
      }
      return best;
    },
    [paths],
  );

  const can = useCallback(
    (pageKey: string, action: PermissionAction = "view") => {
      if (isOwner) return true;
      return permissions?.[pageKey]?.[action] ?? false;
    },
    [isOwner, permissions],
  );

  /**
   * Whether the user may open pathname. Routes outside the permission
   * catalog are not governed here (owner-only pages guard themselves).
   */
  const canOpenPath = useCallback(
    (pathname: string) => {
      if (isOwner) return true;
      const key = pageKeyForPath(pathname);
      return key ? can(key, "view") : true;
    },
    [isOwner, pageKeyForPath, can],
  );

  return useMemo(
    () => ({
      isOwner,
      isLoading: !isOwner && query.isPending,
      isError: query.isError,
      isReady: isOwner || query.isSuccess,
      can,
      canOpenPath,
      pageKeyForPath,
      refetch: query.refetch,
    }),
    [isOwner, query.isPending, query.isError, query.isSuccess, can, canOpenPath, pageKeyForPath, query.refetch],
  );
}

/** Shorthand for a single right, e.g. `useCan("sku", "delete")`. */
export function useCan(pageKey: string, action: PermissionAction) {
  return useMyPermissions().can(pageKey, action);
}
