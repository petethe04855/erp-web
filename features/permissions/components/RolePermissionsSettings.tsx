"use client";

import { useState } from "react";
import { Save, Undo2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { TwoColumnLayout } from "@/components/layout/TwoColumnLayout";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { ROLE_CONFIG } from "@/features/users/types/user";
import { useRolePermissions } from "../hooks/useRolePermissions";
import type { ConfigurableRole } from "../types/permission";
import { AccessDenied } from "./AccessDenied";
import { RoleList } from "./RoleList";
import { PermissionMatrixTable } from "./PermissionMatrixTable";

const TITLE = "สิทธิ์การเข้าถึง (Role Permissions)";
const DESCRIPTION =
  "กำหนดว่าแต่ละบทบาทเข้าหน้าใดได้บ้าง และสร้าง แก้ไข หรือลบข้อมูลในหน้านั้นได้หรือไม่";

export function RolePermissionsSettings() {
  const isOwner = useAuthStore((s) => s.user?.role?.toLowerCase() === "owner");

  if (!isOwner) {
    return (
      <PageContainer>
        <PageHeader title={TITLE} description={DESCRIPTION} />
        <AccessDenied message="หน้านี้สงวนสิทธิ์เฉพาะเจ้าของกิจการ (Owner) เท่านั้น" />
      </PageContainer>
    );
  }
  return <RolePermissionsEditor />;
}

function RolePermissionsEditor() {
  const rp = useRolePermissions();
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const handleSelectRole = (role: ConfigurableRole) => {
    if (role === rp.role) return;
    if (
      rp.isDirty &&
      !window.confirm("มีการเปลี่ยนแปลงที่ยังไม่บันทึก ต้องการทิ้งการเปลี่ยนแปลงหรือไม่?")
    )
      return;
    rp.discard();
    setNotice(null);
    rp.selectRole(role);
  };

  const handleSave = async () => {
    setNotice(null);
    try {
      await rp.save();
      const label = rp.role ? ROLE_CONFIG[rp.role]?.label ?? rp.role : "";
      setNotice({ tone: "ok", text: `บันทึกสิทธิ์ของ ${label} แล้ว มีผลกับผู้ใช้ภายใน 30 วินาที` });
    } catch (e) {
      setNotice({ tone: "error", text: e instanceof Error ? e.message : "บันทึกไม่สำเร็จ" });
    }
  };

  const actions = (
    <div className="flex items-center gap-2">
      {rp.isDirty && (
        <span className="text-xs text-neutral-500">
          แก้ไขแล้ว {rp.changedCount} หน้า
        </span>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          rp.discard();
          setNotice(null);
        }}
        disabled={!rp.isDirty || rp.isSaving}
      >
        <Undo2 className="mr-1.5 h-3.5 w-3.5" />
        ยกเลิก
      </Button>
      <Button size="sm" onClick={handleSave} disabled={!rp.isDirty || rp.isSaving}>
        <Save className="mr-1.5 h-3.5 w-3.5" />
        {rp.isSaving ? "กำลังบันทึก..." : "บันทึกสิทธิ์"}
      </Button>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader title={TITLE} description={DESCRIPTION} actions={actions} />

      {rp.isLoading ? (
        <Loading message="กำลังโหลดสิทธิ์..." />
      ) : rp.isError ? (
        <ErrorState
          title="โหลดสิทธิ์ไม่สำเร็จ"
          message={rp.error?.message}
          onRetry={() => rp.refetch()}
        />
      ) : (
        <TwoColumnLayout
          className="mt-0"
          sidebar={
            <RoleList
              roles={rp.roles}
              selected={rp.role}
              totalPages={rp.pages.length}
              permissionsByRole={rp.permissionsByRole}
              onSelect={handleSelectRole}
            />
          }
          content={
            <div className="space-y-3">
              {notice && (
                <div
                  role="status"
                  className={
                    notice.tone === "ok"
                      ? "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800"
                      : "rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700"
                  }
                >
                  {notice.text}
                </div>
              )}
              <p className="text-xs text-neutral-500">
                ไม่ติ๊ก “เข้าหน้า” จะซ่อนเมนูและปิดหน้านั้น ส่วนสิทธิ์สร้าง / แก้ไข /
                ลบ ระบบหลังบ้านตรวจทุกครั้งที่บันทึกข้อมูล การอนุมัติเอกสาร
                (ใบคืนสินค้า, PO, ไลฟ์) ยังเป็นสิทธิ์ตายตัวตามเดิม
              </p>
              <PermissionMatrixTable
                pages={rp.pages}
                accessOf={rp.accessOf}
                onToggle={rp.toggle}
                onSetColumn={rp.setColumn}
                onSetRow={rp.setRow}
                disabled={rp.isSaving}
              />
            </div>
          }
        />
      )}
    </PageContainer>
  );
}
