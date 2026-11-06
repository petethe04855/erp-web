"use client";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useAuth();
  return (
    <section className="w-full max-w-md border border-border rounded-2xl bg-white p-8 sm:p-10">
      <p className="text-xs tracking-[0.25em] text-neutral-500 mb-8">
        CHAWY / WORKSPACE
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">เข้าสู่ระบบ</h1>
      <p className="text-sm text-neutral-500 mt-3 mb-8">
        ใช้บัญชีเดียวกับระบบ ERP เดิม
      </p>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          login.mutate({ email, password });
        }}
      >
        <label className="block text-sm">
          อีเมล
          <Input
            className="mt-2"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          รหัสผ่าน
          <Input
            className="mt-2"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {login.error && (
          <p
            role="alert"
            className="border border-neutral-300 bg-neutral-100 p-3 text-sm"
          >
            {login.error.message}
          </p>
        )}
        <Button className="w-full" disabled={login.isPending}>
          {login.isPending ? "กำลังตรวจสอบ…" : "เข้าสู่ Workspace →"}
        </Button>
      </form>
    </section>
  );
}
