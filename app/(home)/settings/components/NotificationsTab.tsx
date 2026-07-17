"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/lib/design/ThemeContext";

interface NotificationSettings {
  nearExpiry: boolean;
  nearExpiryDays: number;
  lowStock: boolean;
  latePO: boolean;
  newSO: boolean;
  paymentDue: boolean;
}

interface NotificationsTabProps {
  notifications: NotificationSettings;
  onToggle: (key: keyof NotificationSettings) => void;
  onUpdateExpiryDays: (days: number) => void;
}

export function NotificationsTab({
  notifications,
  onToggle,
  onUpdateExpiryDays,
}: NotificationsTabProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const config = [
    {
      key: "nearExpiry" as const,
      label: "แจ้งเตือนสินค้าใกล้หมดอายุ",
      desc: "เตือนเมื่อ Lot มีวันหมดอายุน้อยกว่าที่กำหนด",
    },
    {
      key: "lowStock" as const,
      label: "แจ้งเตือนสต็อกต่ำ",
      desc: "เตือนเมื่อสต็อกต่ำกว่า Reorder Level",
    },
    {
      key: "latePO" as const,
      label: "แจ้งเตือน PO ล่าช้า",
      desc: "เตือนเมื่อ PO เกิน ETA แล้วยังไม่รับของ",
    },
    {
      key: "newSO" as const,
      label: "แจ้งเตือน SO ใหม่",
      desc: "เตือนเมื่อมีออร์เดอร์เข้าใหม่",
    },
    {
      key: "paymentDue" as const,
      label: "แจ้งเตือนใบแจ้งหนี้ครบกำหนด",
      desc: "เตือนก่อน Invoice ครบกำหนด 3 วัน",
    },
  ];

  return (
    <div>
      <div className="text-sm font-bold text-foreground mb-1" style={{ color: "var(--erp-ink)" }}>
        ตั้งค่าการแจ้งเตือน
      </div>
      <div
        className="text-xs p-3 rounded-lg border mb-6"
        style={{
          borderColor: "var(--erp-border)",
          background: "var(--erp-subtle)",
          color: "var(--erp-ink3)",
        }}
      >
        การเปลี่ยนแปลงบันทึกทันที
      </div>

      <div className="flex flex-col gap-4 divide-y divide-border" style={{ borderColor: "var(--erp-border)" }}>
        {config.map((item, i) => (
          <div
            key={item.key}
            className={`flex items-start justify-between gap-4 ${i > 0 ? "pt-4" : ""}`}
          >
            <div className="flex-1">
              <Label
                htmlFor={`notif-${item.key}`}
                className="text-sm font-semibold text-foreground cursor-pointer"
                style={{ color: "var(--erp-ink)" }}
              >
                {item.label}
              </Label>
              <div className="text-xs mt-1" style={{ color: "var(--erp-ink3)" }}>
                {item.desc}
              </div>
              {item.key === "nearExpiry" && notifications.nearExpiry && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs" style={{ color: "var(--erp-ink2)" }}>
                    แจ้งเตือนก่อน
                  </span>
                  <Input
                    type="number"
                    min={1}
                    max={90}
                    value={notifications.nearExpiryDays}
                    onChange={(e) =>
                      onUpdateExpiryDays(parseInt(e.target.value) || 30)
                    }
                    className="h-8 w-16 text-center font-mono text-xs"
                  />
                  <span className="text-xs" style={{ color: "var(--erp-ink2)" }}>
                    วัน
                  </span>
                </div>
              )}
            </div>
            <Switch
              id={`notif-${item.key}`}
              checked={Boolean(notifications[item.key])}
              onCheckedChange={() => onToggle(item.key)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
