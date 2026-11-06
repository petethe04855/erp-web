"use client";

import React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Settings } from "lucide-react";
import { TikTokCalculator } from "@/features/tiktok/components/TikTokCalculator";

export default function TikTokCalculatorPage() {
  return (
    <PageContainer>
      <PageHeader
        title="TikTok Fee Calculator"
        description="เครื่องมือจำลองการคำนวณส่วนลด ค่าธรรมเนียม และกำไรสุทธิต่อชิ้นบน TikTok Shop"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/tiktok-orders">
              <Button variant="outline" size="sm">
                <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                ดูคำสั่งซื้อ TikTok
              </Button>
            </Link>
            <Link href="/tiktok-setup">
              <Button variant="outline" size="sm">
                <Settings className="mr-1.5 h-3.5 w-3.5" />
                ตั้งค่า TikTok Shop
              </Button>
            </Link>
          </div>
        }
      />

      <div className="max-w-5xl">
        <TikTokCalculator />
      </div>
    </PageContainer>
  );
}
