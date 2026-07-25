"use client";

import { useState, useEffect } from "react";
import { useErpStore } from "@/lib/store/useErpStore";
import { readApiResponse } from "@/lib/apiResponse";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setCurrentUser = useErpStore((s) => s.setCurrentUser);

  useEffect(() => {
    const token = localStorage.getItem("chawy_token");
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(window.atob(base64));
          if (
            payload.userId &&
            (!payload.exp || Date.now() < payload.exp * 1000)
          ) {
            window.location.href = "/dashboard";
          }
        }
      } catch (e) {
        // Ignore invalid tokens
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await readApiResponse<{
        token: string;
        user: Parameters<typeof setCurrentUser>[0];
      }>(res);

      // Store JWT Token in LocalStorage and Cookies
      localStorage.setItem("chawy_token", data.token);
      document.cookie = `chawy_token=${encodeURIComponent(data.token)}; path=/; max-age=604800; SameSite=Lax`;

      // Update Zustand Store
      setCurrentUser(data.user);

      // Redirect to Dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-1 items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[420px] shadow-sm">
        <CardHeader className="items-center px-9 pt-9 text-center">
          <span className="mb-2 inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary">
            Chawy Pet Food
          </span>
          <CardTitle className="text-2xl">Sign in to ERP System</CardTitle>
          <CardDescription>
            Enter admin details to manage your store
          </CardDescription>
        </CardHeader>
        <CardContent className="px-9 pb-9">
          {error && (
            <div
              style={{
                backgroundColor: "#FEF2F2",
                border: "1px solid #FCA5A5",
                color: "#DC2626",
                borderRadius: 6,
                padding: "12px 14px",
                fontSize: 13,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label
                htmlFor="email"
                className="text-xs uppercase tracking-wide"
              >
                Email
              </Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="e.g. admin"
              />
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="password"
                className="text-xs uppercase tracking-wide"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-1 h-10 w-full"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
