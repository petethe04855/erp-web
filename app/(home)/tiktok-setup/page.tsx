"use client";

import { useState } from "react";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, TopBar } from "@/components/ui";
import { Button } from "@/components/ui/button";

export default function TikTokSetupPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const authToken = localStorage.getItem("chawy_token");
      const res = await fetch("/api/tiktok/settlement", {
        headers: { Authorization: authToken ? `Bearer ${authToken}` : "" },
      });
      const json = (await res.json()) as { settlements?: unknown[]; error?: string };
      setTestResult(res.ok ? `Connected — found ${json.settlements?.length ?? 0} settlement records` : json.error ?? "Connection failed");
    } catch {
      setTestResult("Network error");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas pb-16" style={{ background: c.canvas }}>
      <TopBar t={t} breadcrumb={["Chawy", "Channels", "TikTok Setup"]} title="TikTok Setup" subtitle="TikTok Shop API configuration" />
      <div className="p-6 md:p-8 max-w-[640px] mx-auto flex flex-col gap-6">
        <Card t={t} className="p-6 border border-border bg-card flex flex-col gap-5" style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)" }}>
          <div>
            <h2 className="text-sm font-bold" style={{ color: "var(--erp-ink)" }}>Secure server-side configuration</h2>
            <p className="text-xs mt-2" style={{ color: "var(--erp-ink3)" }}>TikTok credentials are kept on the server and are never stored in the browser.</p>
          </div>
          <Button onClick={handleTest} disabled={testing} className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none">{testing ? "Testing..." : "Test connection"}</Button>
          {testResult && <div className="p-3 px-4 rounded-lg text-xs font-bold border" style={{ color: testResult.startsWith("Connected") ? c.pos : c.neg }}>{testResult}</div>}
        </Card>
        <Card t={t} className="p-5 border border-border bg-card" style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)" }}>
          <p className="text-xs" style={{ color: "var(--erp-ink3)" }}>Configure <code>TIKTOK_APP_KEY</code>, <code>TIKTOK_APP_SECRET</code>, and <code>TIKTOK_ACCESS_TOKEN</code> as server environment variables before starting the application.</p>
        </Card>
      </div>
    </div>
  );
}
