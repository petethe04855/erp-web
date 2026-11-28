"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { useMyPermissions } from "../hooks/useMyPermissions";
import { AccessDenied } from "./AccessDenied";

/**
 * Renders the page only when the user's role may view it, per the owner's
 * permission matrix. The API enforces the same rules; this keeps people from
 * landing on a page that would only show 403 errors.
 */
export function PageAccessGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const perms = useMyPermissions();

  if (perms.isOwner) return <>{children}</>;
  if (perms.isLoading) return <Loading message="กำลังตรวจสอบสิทธิ์..." />;
  if (perms.isError)
    return (
      <PageContainer>
        <ErrorState
          title="ตรวจสอบสิทธิ์ไม่สำเร็จ"
          message="โหลดสิทธิ์การใช้งานไม่ได้ กรุณาลองใหม่"
          onRetry={() => perms.refetch()}
        />
      </PageContainer>
    );
  if (!perms.canOpenPath(pathname))
    return (
      <PageContainer>
        <AccessDenied />
      </PageContainer>
    );
  return <>{children}</>;
}
