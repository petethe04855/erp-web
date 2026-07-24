"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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

interface CreateUserFormState {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  role: UserRole;
  password: string;
}

const BLANK_FORM: CreateUserFormState = {
  id: "",
  email: "",
  firstname: "",
  lastname: "",
  role: "sales",
  password: "",
};

interface CreateUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateUserFormState) => void;
  showToast: (msg: string) => void;
  isSubmitting?: boolean;
}

export function CreateUserSheet({
  open,
  onOpenChange,
  onSubmit,
  showToast,
  isSubmitting = false,
}: CreateUserSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [form, setForm] = useState<CreateUserFormState>(BLANK_FORM);

  useEffect(() => {
    if (open) {
      setForm(BLANK_FORM);
    }
  }, [open]);

  const handleFormSubmit = () => {
    if (
      !form.email ||
      !form.firstname ||
      !form.lastname
    ) {
      showToast("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      showToast("อีเมลไม่ถูกต้อง");
      return;
    }

    let finalId = form.id.trim();

    onSubmit({
      ...form,
      id: finalId,
      email: form.email.trim().toLowerCase(),
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
            สร้างผู้ใช้ใหม่
          </SheetTitle>
          <div
            className="text-xs text-muted-foreground"
            style={{ color: "var(--erp-ink3)" }}
          >
            เพิ่มผู้ใช้งานระบบ ERP ใหม่
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
            {isSubmitting ? "กำลังสร้างผู้ใช้..." : "บันทึกผู้ใช้"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
