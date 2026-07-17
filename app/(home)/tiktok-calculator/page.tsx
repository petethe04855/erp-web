"use client";

import { useState } from "react";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, TopBar, fmtBaht } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TikTokCalculatorPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const [salePrice, setSalePrice] = useState<number | "">(89);
  const [cost, setCost] = useState<number | "">(38);
  const [platformFee, setPlatformFee] = useState(5);
  const [affiliateFee, setAffiliateFee] = useState(10);
  const [shippingSubsidy, setShippingSubsidy] = useState<number | "">(15);

  const priceNum = Number(salePrice);
  const costNum = Number(cost);
  const shippingNum = Number(shippingSubsidy);

  const platformCut = priceNum * (platformFee / 100);
  const affiliateCut = priceNum * (affiliateFee / 100);
  const totalFees = platformCut + affiliateCut + shippingNum;
  const netRevenue = priceNum - totalFees;
  const grossProfit = netRevenue - costNum;
  const marginPct = priceNum > 0 ? (grossProfit / priceNum) * 100 : 0;

  return (
    <div className="min-h-screen bg-canvas pb-16" style={{ background: c.canvas }}>
      <TopBar t={t} title="TikTok Calculator" subtitle="คำนวณค่าธรรมเนียม TikTok Shop" />
      <div className="p-6 md:p-8 max-w-[1040px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <Card
            t={t}
            className="p-6 border border-border bg-card flex flex-col gap-5"
            style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)" }}
          >
            <div className="text-sm font-bold text-foreground" style={{ color: "var(--erp-ink)" }}>
              ข้อมูลสินค้า
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                  ราคาขาย (บาท)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={salePrice}
                  onChange={(e) =>
                    setSalePrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                  ต้นทุน (บาท)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={cost}
                  onChange={(e) =>
                    setCost(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="text-sm font-bold text-foreground pt-4 border-t border-border" style={{ color: "var(--erp-ink)", borderColor: "var(--erp-border)" }}>
              ค่าธรรมเนียม (%)
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs font-semibold text-muted-foreground" style={{ color: "var(--erp-ink2)" }}>
                    Platform Fee
                  </Label>
                  <span className="text-xs font-bold font-mono" style={{ color: "var(--erp-accent)" }}>
                    {platformFee}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={platformFee}
                  onChange={(e) => setPlatformFee(Number(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ accentColor: "var(--erp-accent)" }}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs font-semibold text-muted-foreground" style={{ color: "var(--erp-ink2)" }}>
                    Affiliate Fee
                  </Label>
                  <span className="text-xs font-bold font-mono" style={{ color: "var(--erp-accent)" }}>
                    {affiliateFee}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={affiliateFee}
                  onChange={(e) => setAffiliateFee(Number(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ accentColor: "var(--erp-accent)" }}
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                  Shipping Subsidy (บาท)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={shippingSubsidy}
                  onChange={(e) =>
                    setShippingSubsidy(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </Card>

          {/* Results */}
          <Card
            t={t}
            className="p-6 border border-border bg-card flex flex-col justify-between gap-5"
            style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)" }}
          >
            <div>
              <div className="text-sm font-bold text-foreground mb-4" style={{ color: "var(--erp-ink)" }}>
                ผลการคำนวณ
              </div>
              <div className="flex flex-col divide-y divide-border" style={{ borderColor: "var(--erp-border)" }}>
                <div className="flex justify-between items-center py-3">
                  <span className="text-xs text-muted-foreground" style={{ color: "var(--erp-ink2)" }}>
                    ราคาขาย
                  </span>
                  <span className="text-xs font-bold font-mono" style={{ color: "var(--erp-ink)" }}>
                    {fmtBaht(priceNum)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-xs text-muted-foreground" style={{ color: "var(--erp-ink2)" }}>
                    Platform Fee ({platformFee}%)
                  </span>
                  <span className="text-xs font-bold font-mono" style={{ color: c.neg }}>
                    -{fmtBaht(platformCut)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-xs text-muted-foreground" style={{ color: "var(--erp-ink2)" }}>
                    Affiliate Fee ({affiliateFee}%)
                  </span>
                  <span className="text-xs font-bold font-mono" style={{ color: c.neg }}>
                    -{fmtBaht(affiliateCut)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-xs text-muted-foreground" style={{ color: "var(--erp-ink2)" }}>
                    Shipping Subsidy
                  </span>
                  <span className="text-xs font-bold font-mono" style={{ color: c.neg }}>
                    -{fmtBaht(shippingNum)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t-2 border-border" style={{ borderColor: "var(--erp-border)" }}>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm font-bold text-foreground" style={{ color: "var(--erp-ink)" }}>
                    รายได้สุทธิ
                  </span>
                  <span
                    className="text-base font-extrabold font-mono"
                    style={{ color: "var(--erp-accent)" }}
                  >
                    {fmtBaht(netRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-muted-foreground" style={{ color: "var(--erp-ink2)" }}>
                    ต้นทุน
                  </span>
                  <span className="text-xs font-bold font-mono" style={{ color: c.neg }}>
                    -{fmtBaht(costNum)}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="p-5 rounded-xl text-center flex flex-col items-center justify-center gap-1 mt-4"
              style={{
                background: grossProfit >= 0 ? c.posBg : c.negBg,
              }}
            >
              <div
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: grossProfit >= 0 ? c.pos : c.neg }}
              >
                กำไรขั้นต้น
              </div>
              <span className="block mt-1">
                <Mono
                  t={t}
                  size={28}
                  weight={700}
                  color={grossProfit >= 0 ? c.pos : c.neg}
                >
                  {fmtBaht(grossProfit)}
                </Mono>
              </span>
              <div
                className="text-xs font-semibold mt-1"
                style={{ color: grossProfit >= 0 ? c.pos : c.neg }}
              >
                Margin {marginPct.toFixed(1)}%
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
