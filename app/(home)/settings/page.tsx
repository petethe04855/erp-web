"use client";

import { useState } from "react";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, TopBar } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { useErpStore } from "@/lib/store/useErpStore";
import type { ModuleSettings } from "@/lib/store/erpTypes";

import { CompanyTab } from "./components/CompanyTab";
import { NotificationsTab } from "./components/NotificationsTab";
import { ProductsTab } from "./components/ProductsTab";
import { ReorderTab } from "./components/ReorderTab";
import { ModulesTab } from "./components/ModulesTab";
import { LivePayrollTab } from "./components/LivePayrollTab";
import { AboutTab } from "./components/AboutTab";

type Tab =
  | "company"
  | "notifications"
  | "products"
  | "reorder"
  | "modules"
  | "livePayroll"
  | "about";

const TABS: Array<{ id: Tab; label: string; sub: string }> = [
  { id: "company", label: "Company", sub: "ข้อมูลบริษัท" },
  { id: "notifications", label: "Notifications", sub: "การแจ้งเตือน" },
  { id: "products", label: "Products", sub: "หมวดหมู่สินค้า" },
  { id: "reorder", label: "Reorder", sub: "Reorder Level" },
  { id: "modules", label: "Modules", sub: "เปิด-ปิด Module" },
  { id: "livePayroll", label: "Live Payroll", sub: "อัตราค่าแรง" },
  { id: "about", label: "About", sub: "เกี่ยวกับระบบ" },
];

export default function SettingsPage() {
  const { tokens: t } = useTheme();
  const c = t.color;

  const settings = useErpStore((s) => s.settings);
  const updateSettings = useErpStore((s) => s.updateSettings);
  const products = useErpStore((s) => s.products);
  const updateProduct = useErpStore((s) => s.updateProduct);

  const [activeTab, setActiveTab] = useState<Tab>("company");
  const [saved, setSaved] = useState(false);

  const [company, setCompany] = useState(() => ({
    ...settings.company,
    vatRate: String(settings.company.vatRate),
  }));

  const [payrollDraft, setPayrollDraft] = useState(() => ({
    hourlyRate: String(settings.livePayroll.hourlyRate),
    clipBonus: String(settings.livePayroll.clipBonus),
  }));

  const [reorderDraft, setReorderDraft] = useState<Record<string, number>>(
    () => {
      const map: Record<string, number> = {};
      for (const p of products) {
        if (!p.isBundle) map[p.sku] = p.reorder;
      }
      return map;
    },
  );

  const [categories, setCategories] = useState([
    "อาหารแห้ง",
    "อาหารเปียก",
    "ขนม",
    "อาหารเสริม",
    "อื่นๆ",
  ]);

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function saveCompany() {
    updateSettings({
      company: { ...company, vatRate: parseFloat(company.vatRate) || 0 },
    });
    flash();
  }

  function saveLivePayroll() {
    updateSettings({
      livePayroll: {
        hourlyRate: Math.max(0, parseFloat(payrollDraft.hourlyRate) || 0),
        clipBonus: Math.max(0, parseFloat(payrollDraft.clipBonus) || 0),
      },
    });
    flash();
  }

  function saveReorder() {
    for (const p of products) {
      if (p.isBundle) continue;
      const newVal = reorderDraft[p.sku] ?? p.reorder;
      if (newVal !== p.reorder) {
        updateProduct({ sku: p.sku, reorder: newVal });
      }
    }
    flash();
  }

  function toggleNotif(key: keyof typeof settings.notifications) {
    if (key === "nearExpiryDays") return;
    const n = settings.notifications;
    updateSettings({
      notifications: { ...n, [key]: !n[key] },
    });
  }

  function toggleModule(key: keyof ModuleSettings) {
    updateSettings({
      modules: { ...settings.modules, [key]: !settings.modules[key] },
    });
  }

  const showSave =
    activeTab === "company" ||
    activeTab === "reorder" ||
    activeTab === "livePayroll";

  return (
    <div
      className="min-h-screen bg-canvas pb-16"
      style={{ background: c.canvas }}
    >
      <TopBar
        t={t}
        breadcrumb={["Chawy", "System", "Settings"]}
        title="Master Settings"
        subtitle="ตั้งค่าหลัก · ข้อมูลบริษัทและการกำหนดค่าระบบ"
        right={
          showSave ? (
            <Button
              onClick={() => {
                if (activeTab === "company") saveCompany();
                else if (activeTab === "reorder") saveReorder();
                else saveLivePayroll();
              }}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
            >
              {saved ? "Saved ✓" : "Save Changes"}
            </Button>
          ) : undefined
        }
      />

      <div className="p-6 md:p-8 max-w-[1040px] mx-auto grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
        {/* Tab Navigation */}
        <Card
          t={t}
          className="p-2 border border-border bg-card"
          style={{
            borderColor: "var(--erp-border)",
            background: "var(--erp-surface)",
          }}
        >
          <div className="flex flex-col gap-0.5">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSaved(false);
                  }}
                  className={`w-full p-2.5 px-3.5 rounded-lg border-none text-left cursor-pointer transition-colors ${
                    isActive
                      ? "bg-[var(--erp-accent-subtle)]"
                      : "bg-transparent hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`text-[13px] ${isActive ? "font-bold text-[var(--erp-accent)]" : "font-normal"}`}
                    style={{
                      color: isActive ? "var(--erp-accent)" : "var(--erp-ink2)",
                    }}
                  >
                    {tab.label}
                  </div>
                  <div
                    className="text-[10px] mt-0.5"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    {tab.sub}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Tab Content Panel */}
        <Card
          t={t}
          className="p-6 md:p-8 border border-border bg-card"
          style={{
            borderColor: "var(--erp-border)",
            background: "var(--erp-surface)",
          }}
        >
          {activeTab === "company" && (
            <CompanyTab company={company} onChange={setCompany} />
          )}

          {activeTab === "notifications" && (
            <NotificationsTab
              notifications={settings.notifications}
              onToggle={toggleNotif}
              onUpdateExpiryDays={(days) =>
                updateSettings({
                  notifications: {
                    ...settings.notifications,
                    nearExpiryDays: days,
                  },
                })
              }
            />
          )}

          {activeTab === "products" && (
            <ProductsTab
              categories={categories}
              onAddCategory={(cat) => setCategories((prev) => [...prev, cat])}
              onRemoveCategory={(idx) =>
                setCategories((prev) => prev.filter((_, i) => i !== idx))
              }
            />
          )}

          {activeTab === "reorder" && (
            <ReorderTab
              products={products}
              reorderDraft={reorderDraft}
              onChangeReorder={(sku, val) =>
                setReorderDraft((prev) => ({ ...prev, [sku]: val }))
              }
            />
          )}

          {activeTab === "modules" && (
            <ModulesTab
              modules={settings.modules}
              onToggleModule={toggleModule}
            />
          )}

          {activeTab === "livePayroll" && (
            <LivePayrollTab
              draftPayroll={payrollDraft}
              onChangeDraftPayroll={setPayrollDraft}
            />
          )}

          {activeTab === "about" && <AboutTab />}
        </Card>
      </div>
    </div>
  );
}
