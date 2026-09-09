"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { UserStatusBadge } from "./UserStatusBadge";
import { ROLE_CONFIG, type AppUser } from "../types/user";
import { useAuthStore } from "@/stores/authStore";
import { Pencil, Power, Trash2, Shield, Clock } from "lucide-react";

interface UserTableProps {
  users: AppUser[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onEdit: (user: AppUser) => void;
  onToggleStatus: (id: string | number, currentActive: boolean) => Promise<unknown>;
  onDelete: (id: string | number) => Promise<unknown>;
}

export function UserTable({
  users,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onToggleStatus,
  onDelete,
}: UserTableProps) {
  const currentUser = useAuthStore((s) => s.user);
  const [busyId, setBusyId] = useState<string | number | null>(null);

  if (isLoading) {
    return <Loading message="กำลังโหลดรายชื่อผู้ใช้งาน…" />;
  }

  if (isError) {
    return (
      <ErrorState
        message="โหลดข้อมูลผู้ใช้งานไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ API"
        onRetry={onRetry}
      />
    );
  }

  const handleToggle = async (user: AppUser) => {
    const nextState = !user.isActive;
    const confirmMsg = nextState
      ? `ต้องการเปิดใช้งานบัญชี "${user.email}" ใช่หรือไม่?`
      : `ต้องการปิดใช้งานบัญชี "${user.email}" ใช่หรือไม่? ผู้ใช้นี้จะไม่สามารถเข้าสู่ระบบได้`;
    if (!window.confirm(confirmMsg)) return;

    setBusyId(user.id);
    try {
      await onToggleStatus(user.id, user.isActive);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (user: AppUser) => {
    if (!window.confirm(`ยืนยันการลบบัญชี "${user.email}" อย่างถาวร?`)) return;

    setBusyId(user.id);
    try {
      await onDelete(user.id);
    } finally {
      setBusyId(null);
    }
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "ยังไม่เคยเข้าสู่ระบบ";
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5 dark:border-neutral-800">
        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          รายชื่อผู้ใช้งานทั้งหมด
        </span>
        <span className="text-xs text-neutral-500">
          {users.length.toLocaleString("th-TH")} บัญชี
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200/80 bg-neutral-50/80 text-xs font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400">
            <tr>
              <th className="px-5 py-3 text-left whitespace-nowrap">ผู้ใช้งาน</th>
              <th className="px-5 py-3 text-left whitespace-nowrap">บทบาท (Role)</th>
              <th className="px-5 py-3 text-left whitespace-nowrap">สถานะ</th>
              <th className="px-5 py-3 text-left whitespace-nowrap">เข้าสู่ระบบล่าสุด</th>
              <th className="px-5 py-3 text-right whitespace-nowrap">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {users.map((user) => {
              const isMe =
                String(user.id) === String(currentUser?.id) ||
                user.email.toLowerCase() === currentUser?.email?.toLowerCase();
              const roleCfg = ROLE_CONFIG[user.role] || {
                label: user.role,
                desc: "",
                badgeClass: "bg-neutral-100 text-neutral-800",
              };
              const isBusy = busyId === user.id;

              const displayName =
                user.firstname || user.lastname
                  ? `${user.firstname || ""} ${user.lastname || ""}`.trim()
                  : user.name || user.email.split("@")[0];

              const avatarLetter = (displayName || user.email || "U")
                .charAt(0)
                .toUpperCase();

              return (
                <tr
                  key={user.id}
                  className={`transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/50 ${
                    !user.isActive ? "opacity-60 bg-neutral-50/30" : ""
                  }`}
                >
                  {/* User info */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold border shadow-xs ${
                          isMe
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700"
                        }`}
                      >
                        {avatarLetter}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm">
                          {displayName}
                          {isMe && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              คุณ (You)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${roleCfg.badgeClass}`}
                    >
                      <Shield className="h-3 w-3" />
                      {roleCfg.label}
                    </span>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      {roleCfg.desc}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <UserStatusBadge isActive={user.isActive} />
                  </td>

                  {/* Last active */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-neutral-400" />
                      {formatDateTime(user.lastLoginAt)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2.5 text-xs text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
                        onClick={() => onEdit(user)}
                        title="แก้ไขข้อมูลผู้ใช้"
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        แก้ไข
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isMe || isBusy}
                        className={`h-8 px-2.5 text-xs ${
                          user.isActive
                            ? "text-neutral-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                            : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                        }`}
                        onClick={() => handleToggle(user)}
                        title={
                          isMe
                            ? "ไม่สามารถปิดใช้งานบัญชีของตนเองได้"
                            : user.isActive
                              ? "ปิดใช้งานบัญชีนี้"
                              : "เปิดใช้งานบัญชีนี้"
                        }
                      >
                        <Power className="h-3.5 w-3.5 mr-1" />
                        {user.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isMe || isBusy}
                        className="h-8 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => handleDelete(user)}
                        title={
                          isMe
                            ? "ไม่สามารถลบบัญชีของตนเองได้"
                            : "ลบบัญชีผู้ใช้นี้"
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="py-12 text-center text-sm text-neutral-500">
            <p className="font-medium text-neutral-700 dark:text-neutral-300">
              ไม่พบผู้ใช้งานตามเงื่อนไขที่ค้นหา
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              ลองเปลี่ยนคำค้นหาหรือตัวกรอง
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
