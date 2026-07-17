"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { useTheme } from "@/lib/design/ThemeContext";

interface CompanyState {
  name: string;
  taxId: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  currency: string;
  vatRate: string;
  invoicePrefix: string;
  soPrefix: string;
}

interface CompanyTabProps {
  company: CompanyState;
  onChange: (updater: (prev: CompanyState) => CompanyState) => void;
}

export function CompanyTab({ company, onChange }: CompanyTabProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const updateField = (field: keyof CompanyState, value: string) => {
    onChange((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-sm font-bold text-foreground mb-4" style={{ color: "var(--erp-ink)" }}>
          ข้อมูลบริษัท
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              ชื่อบริษัท / แบรนด์ *
            </Label>
            <Input
              value={company.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              เลขประจำตัวผู้เสียภาษี
            </Label>
            <Input
              value={company.taxId}
              onChange={(e) => updateField("taxId", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              โทรศัพท์
            </Label>
            <Input
              value={company.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              อีเมล
            </Label>
            <Input
              value={company.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              เว็บไซต์
            </Label>
            <Input
              value={company.website}
              onChange={(e) => updateField("website", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              ที่อยู่
            </Label>
            <Textarea
              value={company.address}
              onChange={(e) => updateField("address", e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-border" style={{ borderColor: "var(--erp-border)" }}>
        <div className="text-sm font-bold text-foreground mb-4" style={{ color: "var(--erp-ink)" }}>
          ค่าระบบ
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              สกุลเงิน
            </Label>
            <NativeSelect
              value={company.currency}
              onChange={(e) => updateField("currency", e.target.value)}
            >
              {["THB", "USD", "SGD"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              VAT (%)
            </Label>
            <Input
              value={company.vatRate}
              onChange={(e) => updateField("vatRate", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              Invoice Prefix
            </Label>
            <Input
              value={company.invoicePrefix}
              onChange={(e) => updateField("invoicePrefix", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
