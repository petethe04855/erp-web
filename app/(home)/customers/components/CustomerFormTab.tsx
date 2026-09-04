"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface CustomerFormState {
  name: string;
  taxId: string;
  branch: string;
  phone: string;
  email: string;
  website: string;
  contactPerson: string;
  address: string;
  logoUrl: string;
}

interface CustomerFormTabProps {
  customer: CustomerFormState;
  onChange: (updater: (prev: CustomerFormState) => CustomerFormState) => void;
}

export function CustomerFormTab({ customer, onChange }: CustomerFormTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof CustomerFormState, value: string) => {
    onChange((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 data URL for instant live preview & persistence
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateField("logoUrl", result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Section: ข้อมูลบริษัทลูกค้า ── */}
      <div>
        <div
          className="text-sm font-bold text-foreground mb-4"
          style={{ color: "var(--erp-ink)" }}
        >
          ข้อมูลบริษัทลูกค้า
        </div>

        {/* Logo / รูปบริษัทลูกค้า */}
        <div
          className="mb-5 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{
            borderColor: "var(--erp-border)",
            background: "var(--erp-surface2, rgba(0,0,0,0.02))",
          }}
        >
          <div className="relative w-20 h-20 rounded-xl border border-dashed border-border flex items-center justify-center overflow-hidden bg-white shrink-0 shadow-sm">
            {customer.logoUrl ? (
              <img
                src={customer.logoUrl}
                alt={customer.name || "Customer Logo"}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <span className="text-2xl">🏢</span>
                <span className="text-[10px] mt-1">ไม่มีรูป</span>
              </div>
            )}
          </div>

          <div className="flex-1 w-full flex flex-col gap-2">
            <Label
              className="text-xs font-semibold text-muted-foreground block"
              style={{ color: "var(--erp-ink2)" }}
            >
              รูปภาพ / โลโก้บริษัทลูกค้า (Logo Image)
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer text-xs h-8"
              >
                เลือกไฟล์รูปภาพ
              </Button>
              {customer.logoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateField("logoUrl", "")}
                  className="cursor-pointer text-xs h-8 text-destructive hover:text-destructive"
                >
                  ลบรูป
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              ชื่อบริษัท / แบรนด์ลูกค้า *
            </Label>
            <Input
              value={customer.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="เช่น บจก. เพ็ท เอ็กซ์เพรส สโตร์"
            />
          </div>

          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              เลขประจำตัวผู้เสียภาษี (13 หลัก)
            </Label>
            <Input
              value={customer.taxId}
              onChange={(e) => updateField("taxId", e.target.value)}
              placeholder="0105562081491"
              maxLength={13}
            />
          </div>

          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              สาขา / Branch
            </Label>
            <Input
              value={customer.branch}
              onChange={(e) => updateField("branch", e.target.value)}
              placeholder="สำนักงานใหญ่ หรือ สาขาที่ 00001"
            />
          </div>

          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              ผู้ติดต่อประสานงาน (Contact Person)
            </Label>
            <Input
              value={customer.contactPerson}
              onChange={(e) => updateField("contactPerson", e.target.value)}
              placeholder="คุณสมชาย ประเสริฐสุข"
            />
          </div>

          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              เบอร์โทรศัพท์
            </Label>
            <Input
              value={customer.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="02-123-4567 หรือ 081-xxx-xxxx"
            />
          </div>

          <div>
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              อีเมล
            </Label>
            <Input
              type="email"
              value={customer.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="billing@customer.com"
            />
          </div>

          <div className="md:col-span-2">
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              เว็บไซต์
            </Label>
            <Input
              value={customer.website}
              onChange={(e) => updateField("website", e.target.value)}
              placeholder="www.customer.co.th"
            />
          </div>

          <div className="md:col-span-2">
            <Label
              className="text-xs font-semibold text-muted-foreground mb-1 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              ที่อยู่ออกบิล / ที่อยู่จดทะเบียน *
            </Label>
            <Textarea
              value={customer.address}
              onChange={(e) => updateField("address", e.target.value)}
              rows={3}
              placeholder="เลขที่ อาคาร ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
