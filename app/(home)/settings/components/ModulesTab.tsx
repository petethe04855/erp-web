"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/lib/design/ThemeContext";
import type { ModuleSettings } from "@/lib/store/erpTypes";

const MODULE_SECTIONS: Array<{
  section: string;
  items: Array<{ key: keyof ModuleSettings; label: string; desc: string }>;
}> = [
  {
    section: "SALES",
    items: [
      { key: "quotation", label: "Quotation", desc: "ใบเสนอราคา" },
      { key: "salesOrders", label: "Sales Order", desc: "ออร์เดอร์ขาย" },
      { key: "invoice", label: "Invoice", desc: "ใบแจ้งหนี้" },
      { key: "returns", label: "Returns", desc: "คืนสินค้า" },
    ],
  },
  {
    section: "PURCHASING",
    items: [
      { key: "purchaseReq", label: "Purchase Requisition", desc: "ใบขอซื้อ" },
      { key: "purchaseOrder", label: "Purchase Order", desc: "ใบสั่งซื้อ" },
    ],
  },
  {
    section: "INVENTORY",
    items: [
      { key: "skuMaster", label: "SKU Master", desc: "ข้อมูลสินค้า" },
      { key: "stockBalance", label: "Stock Balance", desc: "สต็อคคงคลัง" },
      { key: "goodsReceive", label: "Goods Receive", desc: "รับสินค้าเข้า" },
      { key: "goodsIssue", label: "Goods Issue", desc: "เบิกสินค้าออก" },
      { key: "stockTransfer", label: "Stock Transfer", desc: "โอนสต็อค" },
      { key: "stockCheck", label: "Stock Checking", desc: "นับสต็อค" },
    ],
  },
  {
    section: "FINANCE",
    items: [
      { key: "expenses", label: "Expenses", desc: "ค่าใช้จ่าย" },
      { key: "plReport", label: "P&L Report", desc: "กำไร-ขาดทุน" },
      { key: "budget", label: "Budget", desc: "งบประมาณ" },
    ],
  },
  {
    section: "CHANNELS",
    items: [
      { key: "tiktokOrders", label: "TikTok Orders", desc: "ออร์เดอร์ TikTok" },
      { key: "liveContent", label: "Live & Content", desc: "ไลฟ์และคอนเทนต์" },
      { key: "manualOrder", label: "Manual Order", desc: "บันทึกออเดอร์อื่นๆ" },
      { key: "tiktokCalculator", label: "TikTok Calculator", desc: "คำนวณค่าธรรมเนียม" },
      { key: "sampling", label: "Sampling", desc: "แจกตัวอย่าง" },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      { key: "userManagement", label: "User Management", desc: "จัดการผู้ใช้" },
      { key: "tiktokSetup", label: "TikTok Setup", desc: "เชื่อม API" },
    ],
  },
];

interface ModulesTabProps {
  modules: ModuleSettings;
  onToggleModule: (key: keyof ModuleSettings) => void;
}

export function ModulesTab({ modules, onToggleModule }: ModulesTabProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  return (
    <div>
      <div className="text-sm font-bold text-foreground mb-1" style={{ color: "var(--erp-ink)" }}>
        เปิด-ปิด Modules
      </div>
      <div
        className="text-xs p-3 rounded-lg border mb-6"
        style={{
          borderColor: "var(--erp-border)",
          background: "var(--erp-subtle)",
          color: "var(--erp-ink2)",
          borderLeft: `3px solid ${c.warn}`,
        }}
      >
        ปิด module แล้วข้อมูลยังอยู่ครบ — แค่ซ่อนออกจาก sidebar. Dashboard และ Settings เปิดเสมอ
      </div>

      <div className="flex flex-col gap-6">
        {MODULE_SECTIONS.map((group) => (
          <div key={group.section}>
            <div
              className="text-[10px] font-bold tracking-wider uppercase mb-2"
              style={{ color: "var(--erp-ink3)" }}
            >
              {group.section}
            </div>
            <div
              className="border border-border rounded-lg overflow-hidden divide-y divide-border"
              style={{ borderColor: "var(--erp-border)" }}
            >
              {group.items.map((item) => {
                const itemKeyStr = String(item.key);
                return (
                  <div
                    key={itemKeyStr}
                    className="p-4 flex items-center justify-between gap-4 transition-colors"
                    style={{
                      background: modules[item.key] ? "var(--erp-subtle)" : "var(--erp-surface)",
                    }}
                  >
                    <div>
                      <Label
                        htmlFor={`module-${itemKeyStr}`}
                        className="text-sm font-semibold cursor-pointer"
                        style={{ color: modules[item.key] ? "var(--erp-ink)" : "var(--erp-ink3)" }}
                      >
                        {item.label}
                      </Label>
                      <div className="text-xs mt-1" style={{ color: "var(--erp-ink3)" }}>
                        {item.desc}
                      </div>
                    </div>
                    <Switch
                      id={`module-${itemKeyStr}`}
                      checked={modules[item.key]}
                      onCheckedChange={() => onToggleModule(item.key)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
