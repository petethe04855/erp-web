"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ROLE_CONFIG,
  type AppUser,
  type CreateUserDTO,
  type UpdateUserDTO,
  type UserRole,
} from "../types/user";

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitCreate?: (data: CreateUserDTO) => Promise<unknown>;
  onSubmitUpdate?: (id: string | number, data: UpdateUserDTO) => Promise<unknown>;
  initialUser?: AppUser | null;
  isSubmitting?: boolean;
}

export function UserFormModal({
  open,
  onOpenChange,
  onSubmitCreate,
  onSubmitUpdate,
  initialUser,
  isSubmitting = false,
}: UserFormModalProps) {
  const isEdit = !!initialUser;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [role, setRole] = useState<UserRole>("sales");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  // Sync form state with `initialUser`/`open`: adjust state during render
  // (React docs pattern) instead of setState-in-effect. A key on the modal
  // would also work but this keeps form identity stable.
  const [formKey, setFormKey] = useState<string>(
    `${open}-${initialUser?.id ?? "new"}`,
  );
  const nextKey = `${open}-${initialUser?.id ?? "new"}`;
  if (formKey !== nextKey) {
    setFormKey(nextKey);
    if (initialUser) {
      setEmail(initialUser.email || "");
      setPassword("");
      setFirstname(initialUser.firstname || "");
      setLastname(initialUser.lastname || "");
      setRole(initialUser.role || "sales");
      setIsActive(initialUser.isActive ?? true);
    } else {
      setEmail("");
      setPassword("");
      setFirstname("");
      setLastname("");
      setRole("sales");
      setIsActive(true);
    }
    setError("");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("กรุณากรอกอีเมล");
      return;
    }

    if (!isEdit && !password) {
      setError("กรุณากำหนดรหัสผ่านสำหรับผู้ใช้ใหม่");
      return;
    }

    if (password && password.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    try {
      if (isEdit && initialUser) {
        if (!onSubmitUpdate) return;
        const updateData: UpdateUserDTO = {
          email: email.trim(),
          firstname: firstname.trim(),
          lastname: lastname.trim(),
          role,
          isActive,
        };
        if (password) {
          updateData.password = password;
        }
        await onSubmitUpdate(initialUser.id, updateData);
      } else {
        if (!onSubmitCreate) return;
        await onSubmitCreate({
          email: email.trim(),
          password,
          firstname: firstname.trim(),
          lastname: lastname.trim(),
          role,
        });
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึก";
      setError(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "แก้ไขข้อมูลผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่ (New User)"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? `แก้ไขบัญชีผู้ใช้ ${initialUser?.email || ""}`
                : "กำหนดข้อมูลบัญชีผู้ใช้ รหัสผ่าน และบทบาทในการเข้าถึงระบบ ERP"}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-xs font-semibold">
                อีเมล (Email) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                className="mt-1.5 text-xs"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-semibold">
                  รหัสผ่าน (Password){" "}
                  {!isEdit ? (
                    <span className="text-red-500">*</span>
                  ) : (
                    <span className="text-neutral-400 font-normal">
                      (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)
                    </span>
                  )}
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                minLength={isEdit && !password ? undefined : 6}
                required={!isEdit}
                className="mt-1.5 text-xs"
                placeholder={isEdit ? "•••••••• (ไม่เปลี่ยนรหัสผ่าน)" : "ขั้นต่ำ 6 ตัวอักษร"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstname" className="text-xs font-semibold">
                  ชื่อจริง (First Name)
                </Label>
                <Input
                  id="firstname"
                  type="text"
                  className="mt-1.5 text-xs"
                  placeholder="สมชาย"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lastname" className="text-xs font-semibold">
                  นามสกุล (Last Name)
                </Label>
                <Input
                  id="lastname"
                  type="text"
                  className="mt-1.5 text-xs"
                  placeholder="ใจดี"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <Label className="text-xs font-semibold">
                บทบาทและสิทธิ์การเข้าถึง (Role) <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG[UserRole]][]).map(
                  ([key, item]) => {
                    const selected = role === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setRole(key)}
                        className={`cursor-pointer rounded-lg border p-3 text-left transition-all ${
                          selected
                            ? "border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary"
                            : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                            {item.label}
                          </span>
                          <input
                            type="radio"
                            name="userRole"
                            value={key}
                            checked={selected}
                            onChange={() => setRole(key)}
                            className="h-3.5 w-3.5 text-primary"
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                          {item.desc}
                        </p>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* Status toggle (Edit mode or toggle) */}
            {isEdit && (
              <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
                <div>
                  <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    สถานะบัญชี (Account Status)
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {isActive ? "บัญชีนี้เปิดใช้งาน สามารถเข้าสู่ระบบได้" : "บัญชีนี้ถูกปิดใช้งานชั่วคราว"}
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-5 w-9 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-focus:outline-none dark:bg-neutral-700" />
                </label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting
                ? "กำลังบันทึก…"
                : isEdit
                  ? "บันทึกการแก้ไข"
                  : "สร้างผู้ใช้งาน"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
