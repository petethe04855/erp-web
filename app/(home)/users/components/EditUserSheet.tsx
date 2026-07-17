"use client";

import { useEffect, useState } from "react";
import { ROLE_LABELS, type UserRole } from "@/lib/store/erpTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { useTheme } from "@/lib/design/ThemeContext";

interface EditUserFormState {
  id: string;
  email?: string;
  name: string;
  role: UserRole;
  password?: string;
}

interface EditUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: EditUserFormState | null;
  onSubmit: (data: {
    id: string;
    email?: string;
    name: string;
    role: UserRole;
    password?: string;
  }) => void;
  showToast: (msg: string) => void;
}

export function EditUserSheet({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  showToast,
}: EditUserSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [form, setForm] = useState<EditUserFormState>({
    id: "",
    email: "",
    name: "",
    role: "sales",
    password: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id,
        email: initialData.email,
        name: initialData.name,
        role: initialData.role,
        password: "",
      });
    }
  }, [initialData]);

  const handleFormSubmit = () => {
    if (!form.name) {
      showToast("กรุณากรอกชื่อผู้ใช้");
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      showToast("อีเมลไม่ถูกต้อง");
      return;
    }

    onSubmit({
      id: form.id,
      email: form.email || undefined,
      name: form.name,
      role: form.role,
      password: form.password || undefined,
    });

    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[min(540px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base font-bold text-foreground" style={{ color: "var(--erp-ink)" }}>
            แก้ไขข้อมูลผู้ใช้
          </SheetTitle>
          <div className="text-xs text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>
            อัปเดตรายละเอียดของผู้ใช้งานในระบบ
          </div>
        </SheetHeader>

        <SheetBody className="grid gap-5 overflow-y-auto">
          <div className="flex flex-col gap-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink3)" }}>
                รหัสผู้ใช้ (ไม่สามารถแก้ไขได้)
              </Label>
              <Input value={form.id} disabled className="opacity-60 cursor-not-allowed font-mono" />
            </div>

            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                ชื่อผู้ใช้ (Display Name) *
              </Label>
              <Input
                placeholder="เช่น สมชาย"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                Email
              </Label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                Role *
              </Label>
              <NativeSelect
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value as UserRole }))
                }
              >
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v} ({k})
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                รหัสผ่านใหม่ (ระบุเมื่อต้องการเปลี่ยนเท่านั้น)
              </Label>
              <Input
                type="password"
                placeholder="ระบุรหัสผ่านใหม่หากต้องการเปลี่ยน"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
          </div>
        </SheetBody>

        <SheetFooter className="flex justify-end gap-2 p-4 px-6 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer border-border"
            style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)", color: "#374151" }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleFormSubmit}
            className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
          >
            บันทึกการเปลี่ยนแปลง
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
