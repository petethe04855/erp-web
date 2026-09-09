"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TikTokCalculator() {
  const [salePrice, setSalePrice] = useState<number | "">(89);
  const [cost, setCost] = useState<number | "">(38);
  const [platformFee, setPlatformFee] = useState(5);
  const [affiliateFee, setAffiliateFee] = useState(10);
  const [shippingSubsidy, setShippingSubsidy] = useState<number | "">(15);

  const priceNum = Number(salePrice) || 0;
  const costNum = Number(cost) || 0;
  const shippingNum = Number(shippingSubsidy) || 0;

  const platformCut = priceNum * (platformFee / 100);
  const affiliateCut = priceNum * (affiliateFee / 100);
  const totalFees = platformCut + affiliateCut + shippingNum;
  const netRevenue = priceNum - totalFees;
  const grossProfit = netRevenue - costNum;
  const marginPct = priceNum > 0 ? (grossProfit / priceNum) * 100 : 0;

  const formatBaht = (val: number) =>
    new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Input Parameters */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-5">
        <h3 className="text-sm font-semibold text-neutral-800 border-b border-neutral-100 pb-3">
          ข้อมูลราคาและต้นทุนสินค้า
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium text-neutral-600 mb-1.5 block">
              ราคาขายปลีก (บาท)
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
            <Label className="text-xs font-medium text-neutral-600 mb-1.5 block">
              ต้นทุนสินค้า (บาท)
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

        <h3 className="text-sm font-semibold text-neutral-800 pt-3 border-t border-neutral-100">
          อัตราค่าธรรมเนียม TikTok Shop (%)
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs font-medium text-neutral-600">
                Platform Commission Fee
              </Label>
              <span className="text-xs font-bold font-mono text-neutral-900">
                {platformFee}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              value={platformFee}
              onChange={(e) => setPlatformFee(Number(e.target.value))}
              className="w-full cursor-pointer accent-neutral-900"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs font-medium text-neutral-600">
                Affiliate Commission (ค่านายหน้า)
              </Label>
              <span className="text-xs font-bold font-mono text-neutral-900">
                {affiliateFee}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={affiliateFee}
              onChange={(e) => setAffiliateFee(Number(e.target.value))}
              className="w-full cursor-pointer accent-neutral-900"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-neutral-600 mb-1.5 block">
              ส่วนสนับสนุนค่าจัดส่ง / คูปอง (บาท)
            </Label>
            <Input
              type="number"
              min={0}
              value={shippingSubsidy}
              onChange={(e) =>
                setShippingSubsidy(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Calculated Breakdown */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 border-b border-neutral-100 pb-3">
            สรุปผลการคำนวณกำไรต่อชิ้น
          </h3>

          <div className="space-y-3 pt-4 text-xs">
            <div className="flex justify-between py-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">ราคาขายตั้งต้น</span>
              <span className="font-mono font-medium text-neutral-900">
                {formatBaht(priceNum)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-neutral-100 text-rose-600">
              <span>หัก Platform Fee ({platformFee}%)</span>
              <span className="font-mono font-medium">-{formatBaht(platformCut)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-neutral-100 text-rose-600">
              <span>หัก Affiliate Fee ({affiliateFee}%)</span>
              <span className="font-mono font-medium">-{formatBaht(affiliateCut)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-neutral-100 text-rose-600">
              <span>หัก ค่าส่ง / คูปองช่วย</span>
              <span className="font-mono font-medium">-{formatBaht(shippingNum)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-neutral-200 font-semibold text-neutral-800">
              <span>ยอดเข้ากระเป๋า (Net Settlement)</span>
              <span className="font-mono">{formatBaht(netRevenue)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-neutral-100 text-neutral-500">
              <span>หัก ต้นทุนสินค้า</span>
              <span className="font-mono font-medium">-{formatBaht(costNum)}</span>
            </div>
          </div>
        </div>

        {/* Profit Highlight Cards */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-200">
          <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-100 text-center">
            <span className="text-xs text-neutral-500 block mb-1">
              กำไรขั้นต้น (Gross Profit)
            </span>
            <span
              className={`font-mono text-lg font-bold ${
                grossProfit >= 0 ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {formatBaht(grossProfit)}
            </span>
          </div>

          <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-100 text-center">
            <span className="text-xs text-neutral-500 block mb-1">
              อัตรากำไร (Margin)
            </span>
            <span
              className={`font-mono text-lg font-bold ${
                marginPct >= 0 ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {marginPct.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
