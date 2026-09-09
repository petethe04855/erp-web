"use client";
import { useState } from "react";
import { useSettings } from "../hooks/useSettings";
import type { Company } from "../api/settingsApi";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { useAuthStore } from "@/stores/authStore";
export function Settings() {
  const { query, mutation } = useSettings();
  const [draft, setDraft] = useState<Company | null>(null);
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role === "owner" || role === "admin";
  const company = draft || query.data?.company;
  return (
    <PageContainer>
      <PageHeader
        title="ตั้งค่าบริษัท"
        description="ข้อมูลบริษัทชุดเดียวกับระบบ ERP เดิม · แก้ไขได้เฉพาะ Owner และ Admin"
      />
      {query.isPending ? (
        <Loading />
      ) : query.isError ? (
        <ErrorState
          message={query.error.message}
          onRetry={() => query.refetch()}
        />
      ) : (
        company && (
          <form
            className="max-w-3xl border rounded-xl bg-white p-6 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate(company, { onSuccess: () => setDraft(null) });
            }}
          >
            <fieldset
              disabled={!canEdit || mutation.isPending}
              className="grid sm:grid-cols-2 gap-5"
            >
              {(
                [
                  ["name", "ชื่อบริษัท"],
                  ["taxId", "เลขประจำตัวผู้เสียภาษี"],
                  ["address", "ที่อยู่"],
                  ["phone", "โทรศัพท์"],
                  ["email", "อีเมล"],
                  ["website", "เว็บไซต์"],
                  ["currency", "สกุลเงิน"],
                  ["vatRate", "VAT (%)"],
                  ["invoicePrefix", "คำนำหน้า Invoice"],
                  ["soPrefix", "คำนำหน้า SO"],
                  ["defaultReorderPoint", "จุดสั่งซื้อซ้ำเริ่มต้น (Reorder Point)"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="text-xs">
                  {label}
                  <Input
                    className="mt-2"
                    type={key === "vatRate" ? "number" : "text"}
                    value={company[key]}
                    onChange={(e) => {
                      mutation.reset();
                      setDraft({
                        ...company,
                        [key]:
                          key === "vatRate"
                            ? Number(e.target.value)
                            : e.target.value,
                      });
                    }}
                    required={key === "name"}
                  />
                </label>
              ))}
            </fieldset>
            {mutation.error && (
              <p role="alert" className="text-sm">
                {mutation.error.message}
              </p>
            )}
            {mutation.isSuccess && (
              <p role="status" className="text-sm">
                บันทึกข้อมูลบริษัทสำเร็จ
              </p>
            )}
            <Button disabled={!canEdit || mutation.isPending}>
              {mutation.isPending ? "กำลังบันทึก…" : "บันทึกการตั้งค่า"}
            </Button>
          </form>
        )
      )}
    </PageContainer>
  );
}
