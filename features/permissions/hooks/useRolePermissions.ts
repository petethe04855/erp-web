import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { permissionApi } from "../api/permissionApi";
import { MY_PERMISSIONS_KEY } from "./useMyPermissions";
import {
  NO_ACCESS,
  type ConfigurableRole,
  type PageAccess,
  type PermissionAction,
  type PermissionMatrix,
  type PermissionPage,
} from "../types/permission";

const MATRIX_KEY = ["role-permissions"] as const;

type Draft = Record<string, PageAccess>;

function sameAccess(a: PageAccess, b: PageAccess) {
  return (
    a.view === b.view &&
    a.create === b.create &&
    a.edit === b.edit &&
    a.delete === b.delete
  );
}

/**
 * Owner settings page state: the saved matrix from the API plus an unsaved
 * draft for the selected role.
 */
export function useRolePermissions() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: MATRIX_KEY, queryFn: permissionApi.getMatrix });

  const roles = useMemo(() => query.data?.roles ?? [], [query.data]);
  const pages = useMemo(() => query.data?.pages ?? [], [query.data]);

  const [selectedRole, setSelectedRole] = useState<ConfigurableRole | null>(null);
  // Unsaved edits per role; a role without an entry shows its saved access.
  const [drafts, setDrafts] = useState<Record<string, Draft | undefined>>({});

  const role = selectedRole ?? roles[0] ?? null;
  const saved = useMemo<Draft>(
    () => (role ? query.data?.permissions[role] ?? {} : {}),
    [query.data, role],
  );

  const draft = (role && drafts[role]) || saved;

  /** Apply an edit to the selected role's draft. */
  const setDraft = useCallback(
    (update: (d: Draft) => Draft) => {
      if (!role) return;
      setDrafts((all) => ({ ...all, [role]: update(all[role] ?? saved) }));
    },
    [role, saved],
  );
  const clearDraft = useCallback(() => {
    if (!role) return;
    setDrafts((all) => ({ ...all, [role]: undefined }));
  }, [role]);

  const accessOf = useCallback(
    (pageKey: string): PageAccess => draft[pageKey] ?? NO_ACCESS,
    [draft],
  );

  const toggle = useCallback(
    (page: PermissionPage, action: PermissionAction, value: boolean) => {
      setDraft((d) => {
        const next: PageAccess = { ...(d[page.key] ?? NO_ACCESS), [action]: value };
        return { ...d, [page.key]: next };
      });
    },
    [setDraft],
  );

  /** Set one action for every page that supports it (column toggle). */
  const setColumn = useCallback(
    (action: PermissionAction, value: boolean, onlyPages?: PermissionPage[]) => {
      setDraft((d) => {
        const next = { ...d };
        for (const page of onlyPages ?? pages) {
          if (!page.actions.includes(action)) continue;
          next[page.key] = { ...(next[page.key] ?? NO_ACCESS), [action]: value };
        }
        return next;
      });
    },
    [pages, setDraft],
  );

  /** Grant or clear every supported action on one page (row toggle). */
  const setRow = useCallback((page: PermissionPage, value: boolean) => {
    setDraft((d) => ({
      ...d,
      [page.key]: {
        view: value && page.actions.includes("view"),
        create: value && page.actions.includes("create"),
        edit: value && page.actions.includes("edit"),
        delete: value && page.actions.includes("delete"),
      },
    }));
  }, [setDraft]);

  const changedKeys = useMemo(
    () =>
      pages
        .map((p) => p.key)
        .filter((k) => !sameAccess(draft[k] ?? NO_ACCESS, saved[k] ?? NO_ACCESS)),
    [pages, draft, saved],
  );

  const mutation = useMutation({
    mutationFn: () => {
      if (!role) throw new Error("ยังไม่ได้เลือก role");
      const payload: Draft = {};
      for (const page of pages) payload[page.key] = draft[page.key] ?? NO_ACCESS;
      return permissionApi.updateRole(role, payload);
    },
    onSuccess: (res) => {
      if (role) {
        queryClient.setQueryData<PermissionMatrix>(MATRIX_KEY, (old) =>
          old
            ? { ...old, permissions: { ...old.permissions, [role]: res.data.permissions } }
            : old,
        );
      }
      clearDraft();
      queryClient.invalidateQueries({ queryKey: MATRIX_KEY });
      queryClient.invalidateQueries({ queryKey: MY_PERMISSIONS_KEY });
    },
  });

  return {
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    roles,
    pages,
    role,
    selectRole: setSelectedRole,
    permissionsByRole: query.data?.permissions ?? {},
    accessOf,
    toggle,
    setColumn,
    setRow,
    changedCount: changedKeys.length,
    isDirty: changedKeys.length > 0,
    discard: clearDraft,
    save: mutation.mutateAsync,
    isSaving: mutation.isPending,
    saveError: mutation.error,
    savedAt: mutation.isSuccess ? mutation.submittedAt : null,
  };
}
