"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  Loader2,
  PlugZap,
  RefreshCw,
  Store,
} from "lucide-react";
import { Card, TopBar } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { readApiResponse } from "@/lib/apiResponse";
import { useTheme } from "@/lib/design/ThemeContext";

type Connection = {
  connected: boolean;
  sellerName?: string;
  sellerBaseRegion?: string;
  shopCipher?: string;
  grantedScopes?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  needsReauthorization?: boolean;
};

const getApiUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function authHeaders() {
  const token =
    typeof window === "undefined" ? "" : localStorage.getItem("chawy_token");
  return { Authorization: token ? `Bearer ${token}` : "" };
}

function formatExpiry(value?: string) {
  if (!value) return "ไม่ระบุ";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "ไม่ระบุ"
    : date.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
}

export default function TikTokSetupPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const [connection, setConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConnection = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${getApiUrl()}/api/tiktok/connection`, {
        headers: authHeaders(),
        cache: "no-store",
      });
      setConnection(await readApiResponse<Connection>(response));
    } catch (err) {
      setConnection(null);
      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถตรวจสอบสถานะการเชื่อมต่อได้",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConnection();
  }, [loadConnection]);

  async function connect() {
    // Open synchronously from the click event so browsers do not block the
    // TikTok authorization page as an unsolicited popup.
    const authorizationWindow = window.open("", "_blank");
    if (authorizationWindow) authorizationWindow.opener = null;
    setConnecting(true);
    setError(null);
    try {
      const response = await fetch(`${getApiUrl()}/api/tiktok/connect`, {
        method: "POST",
        headers: authHeaders(),
      });
      const result = await readApiResponse<{ authorizationUrl: string }>(
        response,
      );
      if (authorizationWindow) {
        authorizationWindow.location.href = result.authorizationUrl;
      } else {
        // A browser with strict popup settings can still block the new tab.
        window.location.assign(result.authorizationUrl);
      }
    } catch (err) {
      authorizationWindow?.close();
      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถเริ่มเชื่อมต่อ TikTok Shop ได้",
      );
      setConnecting(false);
    }
  }

  const connected = connection?.connected === true;

  return (
    <div className="min-h-screen pb-16" style={{ background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Channels", "TikTok Setup"]}
        title="เชื่อมต่อ TikTok Shop"
        subtitle="จัดการการเชื่อมต่อ TikTok Shop API"
      />

      <div className="mx-auto flex max-w-[720px] flex-col gap-6 p-6 md:p-8">
        <Card
          t={t}
          className="border p-6"
          style={{
            borderColor: "var(--erp-border)",
            background: "var(--erp-surface)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: connected
                    ? `${c.pos}18`
                    : "var(--erp-accent-soft)",
                  color: connected ? c.pos : "var(--erp-accent)",
                }}
              >
                {connected ? <CheckCircle2 size={21} /> : <PlugZap size={21} />}
              </div>
              <div>
                <h2
                  className="text-base font-bold"
                  style={{ color: "var(--erp-ink)" }}
                >
                  สถานะการเชื่อมต่อ
                </h2>
                <p
                  className="mt-1 text-xs"
                  style={{ color: "var(--erp-ink3)" }}
                >
                  {loading
                    ? "กำลังตรวจสอบ..."
                    : connected
                      ? "เชื่อมต่อ TikTok Shop แล้ว"
                      : "ยังไม่ได้เชื่อมต่อร้านค้า"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadConnection()}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />{" "}
              รีเฟรช
            </Button>
          </div>

          {connected && (
            <div
              className="mt-6 grid gap-3 border-t pt-5 text-sm sm:grid-cols-2"
              style={{ borderColor: "var(--erp-border)" }}
            >
              <Info
                label="ชื่อร้านค้า"
                value={connection?.sellerName || "TikTok Shop"}
              />
              <Info
                label="ภูมิภาค"
                value={connection?.sellerBaseRegion || "ไม่ระบุ"}
              />
              {/* <Info
                label="สิทธิ์ที่อนุญาต"
                value={connection?.grantedScopes || "ไม่ระบุ"}
              /> */}
              <Info
                label="Token หมดอายุ"
                value={formatExpiry(connection?.accessTokenExpiresAt)}
              />
              <Info
                label="Refresh token expires"
                value={formatExpiry(connection?.refreshTokenExpiresAt)}
              />
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => void connect()}
              disabled={connecting || loading}
              className="gap-2 border-none bg-[var(--erp-accent)] text-white shadow-none hover:opacity-90"
            >
              {connecting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ExternalLink size={16} />
              )}
              {connecting
                ? "กำลังเปิด TikTok..."
                : connected
                  ? "เชื่อมต่อใหม่"
                  : "เชื่อมต่อ TikTok Shop"}
            </Button>
          </div>
        </Card>

        {error && (
          <div
            className="flex gap-3 rounded-xl border p-4 text-sm"
            style={{
              borderColor: `${c.neg}55`,
              color: c.neg,
              background: `${c.neg}0d`,
            }}
          >
            <CircleAlert size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* <Card
          t={t}
          className="border p-5"
          style={{
            borderColor: "var(--erp-border)",
            background: "var(--erp-surface)",
          }}
        >
          <div className="flex gap-3">
            <Store
              size={18}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--erp-accent)" }}
            />
            <div
              className="text-xs leading-6"
              style={{ color: "var(--erp-ink3)" }}
            >
              <p className="font-bold" style={{ color: "var(--erp-ink)" }}>
                ก่อนเริ่มเชื่อมต่อ
              </p>
              <p>
                ผู้ดูแลระบบต้องตั้งค่า <code>TIKTOK_APP_KEY</code>,{" "}
                <code>TIKTOK_APP_SECRET</code>, <code>TIKTOK_SERVICE_ID</code>{" "}
                และ <code>TIKTOK_TOKEN_ENCRYPTION_KEY</code> บน API server
                รวมถึงตั้ง Redirect URL ใน TikTok Partner Center ให้ตรงกับ
                callback ของระบบ
              </p>
            </div>
          </div>
        </Card> */}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px]" style={{ color: "var(--erp-ink3)" }}>
        {label}
      </p>
      <p
        className="mt-1 break-words text-xs font-semibold"
        style={{ color: "var(--erp-ink)" }}
      >
        {value}
      </p>
    </div>
  );
}
