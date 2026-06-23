"use client";
import { useState } from "react";
import { useTheme } from "@/lib/design/ThemeContext";
import { TopBar, fmtBaht } from "@/components/ui";

export default function TikTokCalculatorPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const [salePrice, setSalePrice] = useState(89);
  const [cost, setCost] = useState(38);
  const [platformFee, setPlatformFee] = useState(5);
  const [affiliateFee, setAffiliateFee] = useState(10);
  const [shippingSubsidy, setShippingSubsidy] = useState(15);

  const platformCut = salePrice * (platformFee / 100);
  const affiliateCut = salePrice * (affiliateFee / 100);
  const totalFees = platformCut + affiliateCut + shippingSubsidy;
  const netRevenue = salePrice - totalFees;
  const grossProfit = netRevenue - cost;
  const marginPct = salePrice > 0 ? (grossProfit / salePrice) * 100 : 0;

  const rowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid " + c.border,
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    color: c.ink2,
    fontFamily: t.font.sans,
  };
  const valueStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: c.ink,
    fontFamily: t.font.mono,
  };
  const fieldInp: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid " + c.border,
    borderRadius: t.radius,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    background: c.surface,
    color: c.ink,
    fontFamily: t.font.mono,
  };

  return (
    <div style={{ minHeight: "100vh", background: c.canvas }}>
      <TopBar
        t={t}
        title="TikTok Calculator"
        subtitle="คำนวณค่าธรรมเนียม TikTok Shop"
      />
      <div style={{ padding: "24px 32px" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
        >
          {/* Inputs */}
          <div className="card" style={{ padding: 24 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: c.ink,
                marginBottom: 20,
                fontFamily: t.font.sans,
              }}
            >
              ข้อมูลสินค้า
            </div>
            {[
              { label: "ราคาขาย (บาท)", value: salePrice, set: setSalePrice },
              { label: "ต้นทุน (บาท)", value: cost, set: setCost },
            ].map(({ label, value, set }) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: c.ink2,
                    marginBottom: 6,
                    fontFamily: t.font.sans,
                  }}
                >
                  {label}
                </div>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => set(Number(e.target.value))}
                  style={fieldInp}
                />
              </div>
            ))}
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: c.ink,
                margin: "20px 0 16px",
                fontFamily: t.font.sans,
              }}
            >
              ค่าธรรมเนียม (%)
            </div>
            {[
              {
                label: `Platform Fee (${platformFee}%)`,
                value: platformFee,
                set: setPlatformFee,
                max: 30,
              },
              {
                label: `Affiliate Fee (${affiliateFee}%)`,
                value: affiliateFee,
                set: setAffiliateFee,
                max: 50,
              },
            ].map(({ label, value, set, max }) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: c.ink2,
                    marginBottom: 6,
                    fontFamily: t.font.sans,
                  }}
                >
                  {label}
                </div>
                <input
                  type="range"
                  min={0}
                  max={max}
                  value={value}
                  onChange={(e) => set(Number(e.target.value))}
                  style={{ width: "100%", accentColor: c.accent }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: c.ink2,
                  marginBottom: 6,
                  fontFamily: t.font.sans,
                }}
              >
                Shipping Subsidy (บาท)
              </div>
              <input
                type="number"
                value={shippingSubsidy}
                onChange={(e) => setShippingSubsidy(Number(e.target.value))}
                style={fieldInp}
              />
            </div>
          </div>

          {/* Results */}
          <div className="card" style={{ padding: 24 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: c.ink,
                marginBottom: 20,
                fontFamily: t.font.sans,
              }}
            >
              ผลการคำนวณ
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>ราคาขาย</span>
              <span style={valueStyle}>{fmtBaht(salePrice)}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Platform Fee ({platformFee}%)</span>
              <span style={{ ...valueStyle, color: c.neg }}>
                -{fmtBaht(platformCut)}
              </span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Affiliate Fee ({affiliateFee}%)</span>
              <span style={{ ...valueStyle, color: c.neg }}>
                -{fmtBaht(affiliateCut)}
              </span>
            </div>
            <div style={{ ...rowStyle, marginBottom: 0 }}>
              <span style={labelStyle}>Shipping Subsidy</span>
              <span style={{ ...valueStyle, color: c.neg }}>
                -{fmtBaht(shippingSubsidy)}
              </span>
            </div>
            <div
              style={{
                margin: "16px 0",
                borderTop: "2px solid " + c.border,
                paddingTop: 16,
              }}
            >
              <div style={rowStyle}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: c.ink,
                    fontFamily: t.font.sans,
                  }}
                >
                  รายได้สุทธิ
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: c.accent,
                    fontFamily: t.font.mono,
                  }}
                >
                  {fmtBaht(netRevenue)}
                </span>
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>ต้นทุน</span>
                <span style={{ ...valueStyle, color: c.neg }}>
                  -{fmtBaht(cost)}
                </span>
              </div>
            </div>
            <div
              style={{
                padding: 16,
                borderRadius: t.radius,
                background: grossProfit >= 0 ? c.posBg : c.negBg,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: grossProfit >= 0 ? c.pos : c.neg,
                  fontWeight: 500,
                  fontFamily: t.font.sans,
                }}
              >
                กำไรขั้นต้น
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: grossProfit >= 0 ? c.pos : c.neg,
                  marginTop: 4,
                  fontFamily: t.font.mono,
                }}
              >
                {fmtBaht(grossProfit)}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: grossProfit >= 0 ? c.pos : c.neg,
                  marginTop: 4,
                  fontFamily: t.font.sans,
                }}
              >
                Margin {marginPct.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
