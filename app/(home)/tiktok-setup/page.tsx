"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Calculator } from "lucide-react";
import { useTikTokConnection } from "@/features/tiktok/hooks/useTikTok";
import { TikTokConnectionCard } from "@/features/tiktok/components/TikTokConnectionCard";
import { tiktokApi } from "@/features/tiktok/api/tiktokApi";

export default function TikTokSetupPage() {
  const {
    connection,
    isLoading,
    refetch,
  } = useTikTokConnection();

  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    // Open synchronously to avoid browser popup blockers
    const authWindow = window.open("", "_blank");
    if (authWindow) authWindow.opener = null;

    setIsConnecting(true);
    try {
      const res = await tiktokApi.startConnect();
      if (authWindow) {
        authWindow.location.href = res.authorizationUrl;
      } else {
        window.location.assign(res.authorizationUrl);
      }
    } catch (err) {
      authWindow?.close();
      console.error("Failed to initiate TikTok connection:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="TikTok Shop Setup"
        description="การตั้งค่าการเชื่อมต่อ API กับร้านค้า TikTok Shop Open Platform"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/tiktok-orders">
              <Button variant="outline" size="sm" className="h-9 gap-1.5 font-normal">
                <ShoppingBag className="h-4 w-4 text-neutral-600" />
                ดูคำสั่งซื้อ TikTok
              </Button>
            </Link>
            <Link href="/tiktok-calculator">
              <Button variant="outline" size="sm" className="h-9 gap-1.5 font-normal">
                <Calculator className="h-4 w-4 text-neutral-600" />
                คำนวณค่าธรรมเนียม
              </Button>
            </Link>
          </div>
        }
      />

      <div className="w-full">
        <TikTokConnectionCard
          connection={connection}
          isLoading={isLoading}
          onConnect={handleConnect}
          onRefresh={refetch}
          isConnecting={isConnecting}
        />
      </div>
    </PageContainer>
  );
}
