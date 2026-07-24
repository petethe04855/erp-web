"use client";

import { useState } from "react";
import { useErpStore } from "@/lib/store/useErpStore";
import { ROLE_LABELS, type AppUser, type UserRole } from "@/lib/store/erpTypes";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Dot, Mono, TopBar } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { CreateUserSheet } from "./components/CreateUserSheet";
import { EditUserSheet } from "./components/EditUserSheet";

export default function UsersPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const currentUser = useErpStore((s) => s.currentUser);
  const storeUsers = useErpStore((s) => s.users);
  const createUser = useErpStore((s) => s.createUser);
  const updateUser = useErpStore((s) => s.updateUser);
  const updateUserStatus = useErpStore((s) => s.updateUserStatus);
  const deleteUser = useErpStore((s) => s.deleteUser);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [toast, setToast] = useState("");
  const [busyUserId, setBusyUserId] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function userEmail(user: AppUser) {
    return user.email || `${String(user.id).toLowerCase()}@chawy.local`;
  }

  const displayUsers = storeUsers;
  const active = displayUsers.filter((user) => user.isActive !== false).length;
  const canManageUsers = currentUser.role === "owner";

  const [isCreatingUser, setIsCreatingUser] = useState(false);

  async function handleCreateSubmit(data: {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    role: UserRole;
  }) {
    setIsCreatingUser(true);
    try {
      const newUser = await createUser(data);
      showToast(
        newUser.emailWarning
          ? `สร้างผู้ใช้ ${data.email} สำเร็จ แต่ส่งอีเมลแจ้งเตือนไม่สำเร็จ`
          : `สร้างผู้ใช้ ${data.email} สำเร็จ`,
      );
      setCreateOpen(false);
    } catch (err: any) {
      showToast(err.message || "สร้างผู้ใช้ไม่สำเร็จ");
    } finally {
      setIsCreatingUser(false);
    }
  }

  function handleEditClick(user: AppUser) {
    setSelectedUser(user);
    setEditOpen(true);
  }

  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  async function handleEditSubmit(data: {
    id: string;
    email?: string;
    firstname: string;
    lastname: string;
    role: UserRole;
  }) {
    setIsUpdatingUser(true);
    try {
      await updateUser(data.id, data);
      showToast(`แก้ไขผู้ใช้ ${data.email || data.id} สำเร็จ`);
      setEditOpen(false);
    } catch (err: any) {
      showToast(err.message || "แก้ไขผู้ใช้ไม่สำเร็จ");
    } finally {
      setIsUpdatingUser(false);
    }
  }

  async function handleStatusChange(user: AppUser) {
    const nextActive = user.isActive === false;
    setBusyUserId(String(user.id));
    try {
      await updateUserStatus(String(user.id), nextActive);
      showToast(
        `${nextActive ? "เปิด" : "ปิด"}การใช้งาน ${userEmail(user)} สำเร็จ`,
      );
    } catch (err: any) {
      showToast(err.message || "เปลี่ยนสถานะผู้ใช้ไม่สำเร็จ");
    } finally {
      setBusyUserId("");
    }
  }

  function formatLastActive(user: AppUser) {
    if (user.id === currentUser.id) return "ขณะนี้";
    if (!user.lastLoginAt) return "ยังไม่เคยเข้าสู่ระบบ";
    return new Intl.DateTimeFormat("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(user.lastLoginAt));
  }

  async function handleDelete(user: AppUser) {
    if (!window.confirm(`ลบผู้ใช้ ${userEmail(user)} ใช่ไหม?`)) return;
    setBusyUserId(String(user.id));
    try {
      await deleteUser(String(user.id));
      showToast(`ลบผู้ใช้ ${userEmail(user)} สำเร็จ`);
    } catch (err: any) {
      showToast(err.message || "ลบผู้ใช้ไม่สำเร็จ");
    } finally {
      setBusyUserId("");
    }
  }

  if (!canManageUsers) {
    return (
      <div
        className="min-h-screen bg-canvas pb-16"
        style={{ background: c.canvas }}
      >
        <TopBar
          t={t}
          breadcrumb={["Chawy", "System", "Users"]}
          title="ไม่มีสิทธิ์เข้าถึง"
          subtitle="เฉพาะเจ้าของระบบเท่านั้นที่จัดการผู้ใช้ได้"
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-canvas pb-16"
      style={{ background: c.canvas }}
    >
      <TopBar
        t={t}
        breadcrumb={["Chawy", "System", "Users"]}
        title="User Management"
        subtitle={`จัดการผู้ใช้ · ${displayUsers.length} บัญชี · ${active} ใช้งานอยู่`}
        right={
          <div className="flex items-center gap-2">
            {toast && (
              <span
                className="text-xs font-semibold pr-2"
                style={{ color: c.pos }}
              >
                {toast}
              </span>
            )}
            <Button
              onClick={() => setCreateOpen(true)}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
            >
              + Create User
            </Button>
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-full mx-auto">
        <Card
          t={t}
          pad={false}
          className="overflow-hidden border border-border bg-card"
          style={{
            borderColor: "var(--erp-border)",
            background: "var(--erp-surface)",
          }}
        >
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader
                className="bg-muted/50 border-b border-border"
                style={{
                  background: "var(--erp-subtle)",
                  borderColor: "var(--erp-border)",
                }}
              >
                <TableRow>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    User
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Role
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Access
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Last active
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Status
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayUsers.map((user) => {
                  const isCurrentUser = user.id === currentUser.id;
                  const isEnabled = user.isActive !== false;
                  return (
                    <TableRow
                      key={user.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                      style={{
                        borderColor: "var(--erp-border)",
                        background: isCurrentUser ? c.subtle : "transparent",
                        opacity: isEnabled ? 1 : 0.62,
                      }}
                    >
                      <TableCell className="p-4 px-5 align-middle">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0"
                            style={{
                              background: isCurrentUser
                                ? "var(--erp-ink)"
                                : "var(--erp-subtle)",
                              borderColor: "var(--erp-border)",
                              color: isCurrentUser
                                ? "var(--erp-surface)"
                                : "var(--erp-ink)",
                            }}
                          >
                            {userEmail(user).trim().charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div
                              className="text-sm font-semibold"
                              style={{ color: "var(--erp-ink)" }}
                            >
                              {userEmail(user)}
                            </div>
                            <span className="mt-0.5 block">
                              <Mono t={t} size={11} color={c.ink3}>
                                {user.id}
                              </Mono>
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell
                        className="p-4 px-5 align-middle text-sm"
                        style={{ color: "var(--erp-ink)" }}
                      >
                        {ROLE_LABELS[user.role]}
                        <span
                          className="text-[11px] font-normal font-mono ml-1.5"
                          style={{ color: "var(--erp-ink3)" }}
                        >
                          ({user.role})
                        </span>
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle">
                        <span
                          className="px-2.5 py-0.5 rounded text-[11px] font-medium border"
                          style={{
                            background: "var(--erp-subtle)",
                            borderColor: "var(--erp-border)",
                            color: "var(--erp-ink2)",
                          }}
                        >
                          {user.role === "owner"
                            ? "All modules"
                            : `${ROLE_LABELS[user.role]} access`}
                        </span>
                      </TableCell>
                      <TableCell
                        className="p-4 px-5 align-middle text-xs"
                        style={{ color: "var(--erp-ink2)" }}
                      >
                        {formatLastActive(user)}
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-medium"
                          style={{ color: isEnabled ? c.pos : c.neg }}
                        >
                          <Dot color={isEnabled ? c.pos : c.neg} />{" "}
                          {isEnabled ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="p-4 px-5 align-middle text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            onClick={() => handleEditClick(user)}
                            className="cursor-pointer text-xs h-8 px-2"
                          >
                            แก้ไข
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleStatusChange(user)}
                            disabled={isCurrentUser || busyUserId === user.id}
                            className="cursor-pointer text-xs h-8 px-2"
                          >
                            {busyUserId === user.id
                              ? "กำลังบันทึก..."
                              : isEnabled
                                ? "ปิดใช้งาน"
                                : "เปิดใช้งาน"}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleDelete(user)}
                            disabled={isCurrentUser || busyUserId === user.id}
                            className="cursor-pointer text-xs h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50/20"
                          >
                            ลบ
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <CreateUserSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateSubmit}
        showToast={showToast}
        isSubmitting={isCreatingUser}
      />

      <EditUserSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        initialData={selectedUser}
        onSubmit={handleEditSubmit}
        showToast={showToast}
        isSubmitting={isUpdatingUser}
      />
    </div>
  );
}
