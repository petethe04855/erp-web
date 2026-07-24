"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ROLE_LABELS, type AppUser, type UserRole } from "@/lib/store/erpTypes";
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
  email: string;
  firstname: string;
  lastname: string;
  role: UserRole;
  password: string;
}

interface EditUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: AppUser | null;
  onSubmit: (data: {
    id: string;
    email?: string;
    firstname: string;
    lastname: string;
    role: UserRole;
    password?: string;
  }) => void;
  showToast: (msg: string) => void;
  isSubmitting?: boolean;
}

export function EditUserSheet({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  showToast,
  isSubmitting = false,
}: EditUserSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [form, setForm] = useState<EditUserFormState>({
    id: "",
    email: "",
    firstname: "",
    lastname: "",
    role: "sales",
    password: "",
  });

  useEffect(() => {
    if (initialData) {
      const nameParts = (initialData.name || "").trim().split(/\s+/);
      const firstname = nameParts[0] || "";
      const lastname = nameParts.slice(1).join(" ") || "";
      setForm({
        id: String(initialData.id),
        email: initialData.email || "",
        firstname: firstname,
        lastname: lastname,
        role: initialData.role,
        password: "",
      });
    }
  }, [initialData]);

  const handleFormSubmit = () => {
    if (!form.firstname || !form.lastname) {
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
      firstname: form.firstname,
      lastname: form.lastname,
      role: form.role,
      password: form.password || undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[min(540px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle
            className="text-base font-bold text-foreground"
            style={{ color: "var(--erp-ink)" }}
          >
            แก้ไขข้อมูลผู้ใช้
          </SheetTitle>
          <div
            className="text-xs text-muted-foreground"
            style={{ color: "var(--erp-ink3)" }}
          >
            อัปเดตรายละเอียดของผู้ใช้งานในระบบ
          </div>
        </SheetHeader>

        <SheetBody className="grid gap-5 overflow-y-auto">
          <div className="flex flex-col gap-4">
            <div>
              <Label
                className="text-xs font-semibold text-muted-foreground mb-1 block"
                style={{ color: "var(--erp-ink2)" }}
              >
                ชื่อ *
              </Label>
              <Input
                placeholder=""
                value={form.firstname}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstname: e.target.value }))
                }
              />
            </div>
            <div>
              <Label
                className="text-xs font-semibold text-muted-foreground mb-1 block"
                style={{ color: "var(--erp-ink2)" }}
              >
                นามสกุล *
              </Label>
              <Input
                placeholder=""
                value={form.lastname}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastname: e.target.value }))
                }
              />
            </div>
            <div>
              <Label
                className="text-xs font-semibold text-muted-foreground mb-1 block"
                style={{ color: "var(--erp-ink2)" }}
              >
                Email *
              </Label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>

            <div>
              <Label
                className="text-xs font-semibold text-muted-foreground mb-1 block"
                style={{ color: "var(--erp-ink2)" }}
              >
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
          </div>
        </SheetBody>

        <SheetFooter className="flex justify-end gap-2 p-4 px-6 border-t">
          <Button
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            className="cursor-pointer border-border"
            style={{
              borderColor: "var(--erp-border)",
              background: "var(--erp-surface)",
              color: "#374151",
            }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleFormSubmit}
            disabled={isSubmitting}
            className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
