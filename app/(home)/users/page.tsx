"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, ShieldAlert } from "lucide-react";
import { useUsers } from "@/features/users/hooks/useUsers";
import { UserSearch } from "@/features/users/components/UserSearch";
import { UserTable } from "@/features/users/components/UserTable";
import { UserFormModal } from "@/features/users/components/UserFormModal";
import { useAuthStore } from "@/stores/authStore";
import type { AppUser } from "@/features/users/types/user";

export default function UsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  // Only "owner" exists as a privileged role in the backend RBAC.
  const isAuthorized = currentUser?.role === "owner";

  const {
    users,
    stats,
    isLoading,
    isError,
    filters,
    handleSearch,
    handleRoleChange,
    handleStatusChange,
    resetFilters,
    refetch,
    createUser,
    isCreating,
    updateUser,
    isUpdating,
    toggleUserStatus,
    deleteUser,
  } = useUsers();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: AppUser) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  if (!isAuthorized) {
    return (
      <PageContainer>
        <PageHeader
          title="จัดการผู้ใช้งาน (User Management)"
          description="จัดการบัญชีผู้ใช้ กำหนดบทบาท และสิทธิ์การเข้าถึงระบบ"
        />
        <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 mb-4">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            ไม่มีสิทธิ์เข้าถึงหน้านี้ (Access Restricted)
          </h2>
          <p className="mt-1.5 max-w-md text-xs text-neutral-500 dark:text-neutral-400">
            หน้านี้สงวนสิทธิ์การเข้าถึงเฉพาะเจ้าของกิจการ (Owner)
            เท่านั้น กรุณาติดต่อผู้ดูแลระบบหากต้องการเปลี่ยนแปลงสิทธิ์การใช้งาน
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="จัดการผู้ใช้งาน (User Management)"
        description="จัดการบัญชีผู้ใช้ กำหนดบทบาท และสิทธิ์การเข้าถึงระบบ Chawy ERP"
      />

      <div className="space-y-4">
        <UserSearch
          filters={filters}
          stats={stats}
          onSearch={handleSearch}
          onRoleChange={handleRoleChange}
          onStatusChange={handleStatusChange}
          onReset={resetFilters}
          actions={
            <Button size="sm" onClick={handleOpenCreate} className="h-9 whitespace-nowrap">
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              เพิ่มผู้ใช้งานใหม่ (New User)
            </Button>
          }
        />

        <UserTable
          users={users}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          onEdit={handleOpenEdit}
          onToggleStatus={toggleUserStatus}
          onDelete={deleteUser}
        />
      </div>

      <UserFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialUser={selectedUser}
        onSubmitCreate={createUser}
        onSubmitUpdate={(id, dto) => updateUser({ id, dto })}
        isSubmitting={isCreating || isUpdating}
      />
    </PageContainer>
  );
}
