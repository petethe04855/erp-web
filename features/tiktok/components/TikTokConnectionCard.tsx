"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Store,
  ShieldCheck,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { TikTokConnection } from "../types/tiktok";

interface TikTokConnectionCardProps {
  connection?: TikTokConnection | null;
  isLoading: boolean;
  onConnect: () => void;
  onRefresh: () => void;
  isConnecting: boolean;
}

export function TikTokConnectionCard({
  connection,
  isLoading,
  onConnect,
  onRefresh,
  isConnecting,
}: TikTokConnectionCardProps) {
  const isConnected = connection?.connected === true;

  const formatExpiry = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime()) || d.getFullYear() < 2000) {
      return "—";
    }
    return d.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-neutral-900 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              TikTok Shop Integration
            </h2>
            <p className="text-xs text-neutral-500">
              เชื่อมต่อบัญชีร้านค้า TikTok Shop Open Platform เพื่อดึงคำสั่งซื้อและตัดสต็อก
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            title="ตรวจสอบสถานะใหม่"
            className="h-9 px-3"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            onClick={onConnect}
            disabled={isConnecting}
            className="bg-[#008a5b] hover:bg-[#007049] text-white h-9 px-4 text-sm font-medium shadow-none transition-colors"
          >
            {isConnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            {isConnecting
              ? "กำลังเชื่อมต่อ..."
              : isConnected
                ? "เชื่อมต่อใหม่อีกครั้ง"
                : "เชื่อมต่อ TikTok Shop"}
          </Button>
        </div>
      </div>

      {/* Connection Status Grid (3 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Status */}
        <div className="rounded-xl bg-[#f9fafb] p-4 border border-neutral-100">
          <span className="text-xs text-neutral-500 block mb-1.5">
            สถานะการเชื่อมต่อ
          </span>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-emerald-800 text-sm">
                  เชื่อมต่อแล้ว
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-neutral-400 shrink-0" />
                <span className="font-semibold text-neutral-700 text-sm">
                  ยังไม่ได้เชื่อมต่อ
                </span>
              </>
            )}
          </div>
        </div>

        {/* Seller / Shop Name */}
        <div className="rounded-xl bg-[#f9fafb] p-4 border border-neutral-100">
          <span className="text-xs text-neutral-500 block mb-1.5">
            ชื่อร้านค้า / Seller Name
          </span>
          <div className="font-medium text-neutral-800 text-sm">
            {isConnected
              ? connection?.sellerName || connection?.shopName || "TikTok Shop"
              : "—"}
          </div>
          {isConnected && connection?.sellerBaseRegion && (
            <span className="text-[11px] text-neutral-400 block mt-0.5">
              ภูมิภาค: {connection.sellerBaseRegion}
            </span>
          )}
        </div>

        {/* Token Expiry */}
        <div className="rounded-xl bg-[#f9fafb] p-4 border border-neutral-100">
          <span className="text-xs text-neutral-500 block mb-1.5">
            วันหมดอายุ Access Token
          </span>
          <div className="font-medium text-neutral-800 text-sm">
            {isConnected ? formatExpiry(connection?.accessTokenExpiresAt) : "—"}
          </div>
          {isConnected && connection?.needsReauthorization && (
            <span className="text-[11px] text-amber-600 font-medium block mt-0.5">
              ต้องทำการต่ออายุการเชื่อมต่อ
            </span>
          )}
        </div>
      </div>

      {/* Security & Scopes Notice */}
      <div className="rounded-xl bg-neutral-50/70 border border-neutral-200/70 p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-neutral-600 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-600 space-y-1">
          <div className="font-semibold text-neutral-900">
            ระบบความปลอดภัยและการจัดการสิทธิ์
          </div>
          <p className="text-neutral-500 leading-relaxed">
            การเชื่อมต่อใช้มาตรฐาน OAuth 2.0 ร่วมกับ Token Encryption ในฝั่ง Backend API
            โดยสต็อกในคลังสินค้า ERP จะถูกคำนวณและตัดตามกฎเกณฑ์ของระบบส่วนกลาง
          </p>
        </div>
      </div>
    </div>
  );
}
