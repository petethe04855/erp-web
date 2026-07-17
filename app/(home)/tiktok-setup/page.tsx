"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, TopBar } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STORAGE_KEY = "tiktok_access_token";

export default function TikTokSetupPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const [token, setToken] = useState("");
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setToken(stored);
  }, []);

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, token.trim());
    setSaved(true);
    setTestResult(null);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleTest() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setTestResult("กรุณาบันทึก Access Token ก่อน");
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const authToken = localStorage.getItem("chawy_token");
      const res = await fetch(
        `/api/tiktok/settlement?access_token=${encodeURIComponent(stored)}`,
        {
          headers: { Authorization: authToken ? `Bearer ${authToken}` : "" },
        }
      );
      const json = (await res.json()) as { settlements?: unknown[]; error?: string };
      if (res.ok) {
        setTestResult(
          `เชื่อมต่อสำเร็จ — พบ ${json.settlements?.length ?? 0} รายการ settlement`
        );
      } else {
        setTestResult(json.error ?? "เชื่อมต่อไม่ได้");
      }
    } catch {
      setTestResult("Network error");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas pb-16" style={{ background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Channels", "TikTok Setup"]}
        title="TikTok Setup"
        subtitle="เชื่อมต่อ TikTok Shop API เพื่อดึงข้อมูล Settlement"
      />
      <div className="p-6 md:p-8 max-w-[640px] mx-auto flex flex-col gap-6">
        <Card
          t={t}
          className="p-6 border border-border bg-card flex flex-col gap-5"
          style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)" }}
        >
          <div>
            <Label
              className="text-xs font-bold tracking-wider uppercase mb-1.5 block"
              style={{ color: "var(--erp-ink2)" }}
            >
              Access Token
            </Label>
            <Input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="วาง TikTok Shop Access Token ที่นี่"
              className="font-mono text-sm"
            />
            <p className="text-[11px] mt-1.5" style={{ color: "var(--erp-ink3)" }}>
              Token เก็บเฉพาะใน localStorage ของเบราว์เซอร์นี้เท่านั้น
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!token.trim()}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none disabled:opacity-50"
            >
              {saved ? "บันทึกแล้ว ✓" : "บันทึก Token"}
            </Button>
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testing}
              className="cursor-pointer border-border"
              style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)", color: "#374151" }}
            >
              {testing ? "กำลังทดสอบ..." : "ทดสอบการเชื่อมต่อ"}
            </Button>
          </div>

          {testResult && (
            <div
              className={`p-3 px-4 rounded-lg text-xs font-bold border ${
                testResult.startsWith("เชื่อมต่อสำเร็จ")
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                  : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50"
              }`}
            >
              {testResult}
            </div>
          )}
        </Card>

        <Card
          t={t}
          className="p-5 border border-border bg-card"
          style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)" }}
        >
          <div className="text-sm font-bold text-foreground mb-4" style={{ color: "var(--erp-ink)" }}>
            ข้อมูลการตั้งค่า
          </div>
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>App Key</span>
              <span className="font-mono" style={{ color: "var(--erp-ink)" }}>ตั้งใน .env.local</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>App Secret</span>
              <span className="font-mono" style={{ color: "var(--erp-ink)" }}>ตั้งใน .env.local</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>Access Token</span>
              <span
                className="font-bold text-xs"
                style={{ color: token ? c.pos : "var(--erp-ink4)" }}
              >
                {token ? "ตั้งค่าแล้ว" : "ยังไม่ได้ตั้งค่า"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
