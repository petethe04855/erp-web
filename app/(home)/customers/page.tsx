"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, TopBar } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useErpStore } from "@/lib/store/useErpStore";
import {
  CustomerFormTab,
  type CustomerFormState,
} from "./components/CustomerFormTab";

const BLANK_CUSTOMER: CustomerFormState = {
  name: "",
  taxId: "",
  branch: "สำนักงานใหญ่",
  phone: "",
  email: "",
  website: "",
  contactPerson: "",
  address: "",
  logoUrl: "",
};

export default function CustomersPage() {
  const { tokens: t } = useTheme();
  const c = t.color;

  const customers = useErpStore((s) => s.customers);
  const loadResources = useErpStore((s) => s.loadResources);
  const addCustomer = useErpStore((s) => s.addCustomer);
  const updateCustomer = useErpStore((s) => s.updateCustomer);
  const deleteCustomer = useErpStore((s) => s.deleteCustomer);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | "new">(
    "",
  );
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [formDraft, setFormDraft] = useState<CustomerFormState>(BLANK_CUSTOMER);

  // Load customers on mount
  useEffect(() => {
    loadResources(["customers"]);
  }, [loadResources]);

  // Sync selection when customers change or initial load
  useEffect(() => {
    if (selectedCustomerId === "new") return;

    if (customers.length > 0) {
      const target = selectedCustomerId
        ? customers.find((c) => c.id === selectedCustomerId) || customers[0]
        : customers[0];

      if (target) {
        setSelectedCustomerId(target.id);
        setFormDraft({
          name: target.name || "",
          taxId: target.taxId || "",
          branch: target.branch || "สำนักงานใหญ่",
          phone: target.phone || "",
          email: target.email || "",
          website: target.website || "",
          contactPerson: target.contactPerson || "",
          address: target.address || "",
          logoUrl: target.logoUrl || "",
        });
      }
    } else {
      setSelectedCustomerId("new");
      setFormDraft(BLANK_CUSTOMER);
    }
  }, [customers, selectedCustomerId]);

  function handleSelectCustomer(id: string | "new") {
    setValidationError("");
    setSelectedCustomerId(id);
    if (id === "new") {
      setFormDraft(BLANK_CUSTOMER);
    } else {
      const cust = customers.find((c) => c.id === id);
      if (cust) {
        setFormDraft({
          name: cust.name || "",
          taxId: cust.taxId || "",
          branch: cust.branch || "สำนักงานใหญ่",
          phone: cust.phone || "",
          email: cust.email || "",
          website: cust.website || "",
          contactPerson: cust.contactPerson || "",
          address: cust.address || "",
          logoUrl: cust.logoUrl || "",
        });
      }
    }
  }

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleSave() {
    if (!formDraft.name.trim()) {
      setValidationError("กรุณาระบุชื่อบริษัท / แบรนด์ลูกค้า");
      return;
    }
    if (!formDraft.address.trim()) {
      setValidationError("กรุณาระบุที่อยู่ออกบิล / ที่อยู่จดทะเบียน");
      return;
    }
    if (formDraft.taxId && !/^\d{13}$/.test(formDraft.taxId.trim())) {
      setValidationError("เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก");
      return;
    }

    setValidationError("");

    const payload = {
      name: formDraft.name.trim(),
      taxId: formDraft.taxId.trim() || undefined,
      branch: formDraft.branch.trim() || undefined,
      phone: formDraft.phone.trim() || undefined,
      email: formDraft.email.trim() || undefined,
      website: formDraft.website.trim() || undefined,
      contactPerson: formDraft.contactPerson.trim() || undefined,
      address: formDraft.address.trim(),
      logoUrl: formDraft.logoUrl.trim() || undefined,
    };

    if (selectedCustomerId !== "new" && selectedCustomerId) {
      updateCustomer(selectedCustomerId, payload);
    } else {
      const created = addCustomer(payload);
      if (created?.id) {
        setSelectedCustomerId(created.id);
      }
    }

    flash();
  }

  function handleDelete(id: string) {
    const target = customers.find((c) => c.id === id);
    if (!target) return;
    if (confirm(`คุณต้องการลบข้อมูลลูกค้า "${target.name}" ใช่หรือไม่?`)) {
      deleteCustomer(id);
      if (selectedCustomerId === id) {
        setSelectedCustomerId("new");
        setFormDraft(BLANK_CUSTOMER);
      }
    }
  }

  return (
    <div
      className="min-h-screen bg-canvas pb-16"
      style={{ background: c.canvas }}
    >
      <TopBar
        t={t}
        breadcrumb={["Chawy", "System", "Customer Settings"]}
        title="Customer Master"
        subtitle="จัดการฐานข้อมูลบริษัทลูกค้า · ข้อมูลผู้ติดต่อ ที่อยู่ออกบิล และโลโก้สำหรับออกเอกสาร Invoice & Quotation"
        right={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectCustomer("new")}
              className="cursor-pointer text-xs"
            >
              + เพิ่มลูกค้าใหม่
            </Button>
            <Button
              onClick={handleSave}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none text-xs"
            >
              {saved
                ? "Saved ✓"
                : selectedCustomerId === "new"
                  ? "Create Customer"
                  : "Save Changes"}
            </Button>
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Customer Selector Sidebar */}
        <div className="md:col-span-4">
          <Card
            t={t}
            className="p-4 border border-border bg-card shadow-sm flex flex-col gap-2"
            style={{
              borderColor: "var(--erp-border)",
              background: "var(--erp-surface)",
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span
                className="text-xs font-bold text-foreground"
                style={{ color: "var(--erp-ink)" }}
              >
                รายชื่อลูกค้า ({customers.length})
              </span>
              <Badge variant="outline" className="text-[10px]">
                API Synced
              </Badge>
            </div>

            <div className="flex flex-col gap-1.5 max-h-[600px] overflow-y-auto pt-1">
              <button
                type="button"
                onClick={() => handleSelectCustomer("new")}
                className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium transition flex items-center gap-2.5 cursor-pointer ${
                  selectedCustomerId === "new"
                    ? "border-[var(--erp-accent)] bg-[var(--erp-accent)]/10 text-[var(--erp-accent)] font-semibold shadow-xs"
                    : "border-dashed border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <span className="text-base">➕</span>
                <span>เพิ่มลูกค้าใหม่ (Create New)</span>
              </button>

              {customers.map((cust) => {
                const isSelected = cust.id === selectedCustomerId;
                return (
                  <div
                    key={cust.id}
                    onClick={() => handleSelectCustomer(cust.id)}
                    className={`group relative w-full text-left p-3 rounded-lg border text-xs transition flex items-start justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? "border-[var(--erp-accent)] bg-[var(--erp-accent)]/5 shadow-xs"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-md border border-border bg-white shrink-0 flex items-center justify-center overflow-hidden">
                        {cust.logoUrl ? (
                          <img
                            src={cust.logoUrl}
                            alt=""
                            className="w-full h-full object-contain p-0.5"
                          />
                        ) : (
                          <span className="text-xs">🏢</span>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <div
                          className="font-semibold truncate text-foreground"
                          style={{
                            color: isSelected
                              ? "var(--erp-accent)"
                              : "var(--erp-ink)",
                          }}
                        >
                          {cust.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {cust.id} {cust.branch ? `· ${cust.branch}` : ""}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      title="ลบลูกค้านี้"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(cust.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition rounded"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Customer Form Area */}
        <div className="md:col-span-8">
          <Card
            t={t}
            className="p-6 md:p-8 border border-border bg-card shadow-sm"
            style={{
              borderColor: "var(--erp-border)",
              background: "var(--erp-surface)",
            }}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <div
                className="text-sm font-semibold text-foreground"
                style={{ color: "var(--erp-ink)" }}
              >
                {selectedCustomerId === "new"
                  ? "สร้างข้อมูลลูกค้าใหม่"
                  : `แก้ไขข้อมูลลูกค้า: ${formDraft.name || selectedCustomerId}`}
              </div>
              {selectedCustomerId !== "new" && (
                <Badge variant="secondary" className="font-mono text-[11px]">
                  {selectedCustomerId}
                </Badge>
              )}
            </div>

            {validationError && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                ⚠️ {validationError}
              </div>
            )}

            <CustomerFormTab customer={formDraft} onChange={setFormDraft} />

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              {selectedCustomerId !== "new" ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedCustomerId)}
                  className="cursor-pointer text-xs"
                >
                  ลบลูกค้า
                </Button>
              ) : (
                <div />
              )}

              <Button
                onClick={handleSave}
                className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none text-xs"
              >
                {saved
                  ? "Saved ✓"
                  : selectedCustomerId === "new"
                    ? "Create Customer"
                    : "Save Changes"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
