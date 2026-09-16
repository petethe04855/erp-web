import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/userApi";
import type {
  AppUser,
  CreateUserDTO,
  UpdateUserDTO,
  UserFilterState,
} from "../types/user";

export function useUsers() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<UserFilterState>({
    search: "",
    role: "all",
    status: "all",
  });

  const query = useQuery({
    queryKey: ["users"],
    queryFn: userApi.getUsers,
  });

  const users = useMemo(() => query.data || [], [query.data]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter (name, email, firstname, lastname)
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const fullName = `${user.firstname || ""} ${user.lastname || ""} ${user.name || ""}`.toLowerCase();
        const matchName = fullName.includes(term);
        const matchEmail = (user.email || "").toLowerCase().includes(term);
        if (!matchName && !matchEmail) return false;
      }

      // Role filter
      if (filters.role !== "all" && user.role !== filters.role) {
        return false;
      }

      // Status filter
      if (filters.status === "active" && !user.isActive) return false;
      if (filters.status === "inactive" && user.isActive) return false;

      return true;
    });
  }, [users, filters]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [users]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["users"] });

  const createMutation = useMutation({
    mutationFn: (dto: CreateUserDTO) => userApi.createUser(dto),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string | number; dto: UpdateUserDTO }) =>
      userApi.updateUser(id, dto),
    onSuccess: invalidate,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string | number; isActive: boolean }) =>
      userApi.updateUserStatus(id, isActive),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => userApi.deleteUser(id),
    onSuccess: invalidate,
  });

  return {
    users: filteredUsers,
    allUsers: users,
    stats,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    filters,
    setFilters,
    handleSearch: (search: string) =>
      setFilters((prev) => ({ ...prev, search })),
    handleRoleChange: (role: string) =>
      setFilters((prev) => ({ ...prev, role })),
    handleStatusChange: (status: string) =>
      setFilters((prev) => ({ ...prev, status })),
    resetFilters: () =>
      setFilters({ search: "", role: "all", status: "all" }),
    createUser: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateUser: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    toggleUserStatus: (id: string | number, currentActive: boolean) =>
      statusMutation.mutateAsync({ id, isActive: !currentActive }),
    isTogglingStatus: statusMutation.isPending,
    deleteUser: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
