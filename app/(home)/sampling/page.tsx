"use client";

import { useTheme } from "@/lib/design/ThemeContext";
import { TopBar } from "@/components/ui";
import { useState } from "react";
import { useErpStore } from "@/lib/store/useErpStore";
import type { SamplingCampaign } from "@/lib/store/erpWorkflow";
import { Card, Mono } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { CreateCampaignSheet } from "./components/CreateCampaignSheet";
import { AddRecipientSheet } from "./components/AddRecipientSheet";
import { CampaignCard } from "./components/CampaignCard";

export default function SamplingPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const campaigns = useErpStore((s) => s.samplingCampaigns);
  const products = useErpStore((s) => s.products);
  const createSamplingCampaign = useErpStore((s) => s.createSamplingCampaign);
  const addSamplingRecipient = useErpStore((s) => s.addSamplingRecipient);
  const updateSamplingStatus = useErpStore((s) => s.updateSamplingStatus);

  const [open, setOpen] = useState(false);
  const [recipientOpen, setRecipientOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] =
    useState<SamplingCampaign | null>(null);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function handleCreateCampaign(data: {
    name: string;
    sku: string;
    skuName: string;
    targetQty: number;
    note: string;
    startDate: string;
    endDate: string;
  }) {
    createSamplingCampaign(data);
    showToast("สร้างแคมเปญ Sampling แล้ว");
  }

  function handleAddRecipient(data: {
    campaignId: string;
    name: string;
    contact: string;
    qtyGiven: number;
    date: string;
    feedback: string;
    converted: boolean;
  }) {
    const result = addSamplingRecipient(data);
    if (result) {
      setSelectedCampaign(result);
      showToast("บันทึกผู้รับ Sample แล้ว");
    }
  }

  function openAddRecipient(cCampaign: SamplingCampaign) {
    setSelectedCampaign(cCampaign);
    setRecipientOpen(true);
  }

  const totalGiven = campaigns.reduce(
    (s, cCampaign) => s + cCampaign.givenQty,
    0,
  );
  const converted = campaigns
    .flatMap((cCampaign) => cCampaign.recipients)
    .filter((r) => r.converted).length;
  const activeCampaigns = campaigns.filter(
    (cCampaign) => cCampaign.status === "Active",
  ).length;

  return (
    <div
      className="min-h-screen bg-canvas pb-16"
      style={{ background: c.canvas }}
    >
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Marketing", "Sampling"]}
        title="Sampling"
        subtitle="ติดตามแจกตัวอย่าง"
        right={
          <div className="flex items-center gap-2">
            {toast && (
              <span
                className="text-xs font-semibold pr-2"
                style={{ color: "var(--erp-pos)" }}
              >
                {toast}
              </span>
            )}
            <Button
              onClick={() => setOpen(true)}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
            >
              + สร้างแคมเปญ
            </Button>
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-full mx-auto grid gap-6">
        {/* Summary KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "แคมเปญ Active",
              value: `${activeCampaigns}`,
              sub: `${campaigns.length} ทั้งหมด`,
              tone: "#059669",
            },
            {
              label: "แจก Sample แล้ว",
              value: `${totalGiven} ชิ้น`,
              sub: "รวมทุกแคมเปญ",
              tone: "var(--erp-accent)",
            },
            {
              label: "Converted",
              value: `${converted}`,
              sub: "ผู้รับที่กลายเป็นลูกค้า",
              tone: "#7C3AED",
            },
            {
              label: "Conversion Rate",
              value:
                totalGiven > 0
                  ? `${((converted / totalGiven) * 100).toFixed(1)}%`
                  : "—",
              sub: "converted / given",
              tone: "#D97706",
            },
          ].map((tile) => (
            <Card
              t={t}
              key={tile.label}
              className="border border-border bg-card p-5"
              style={{
                borderColor: "var(--erp-border)",
                background: "var(--erp-surface)",
              }}
            >
              <div
                className="text-[10px] font-bold tracking-[0.10em] uppercase text-muted-foreground"
                style={{ color: "var(--erp-ink3)" }}
              >
                {tile.label}
              </div>
              <span className="block mt-2">
                <Mono t={t} size={22} weight={600} color={tile.tone}>
                  {tile.value}
                </Mono>
              </span>
              <div
                className="text-xs text-muted-foreground mt-1"
                style={{ color: "var(--erp-ink3)" }}
              >
                {tile.sub}
              </div>
            </Card>
          ))}
        </div>

        {/* Campaigns Listing */}
        {campaigns.length === 0 ? (
          <Card
            t={t}
            className="flex flex-col items-center justify-center p-12 text-center border border-border bg-card"
            style={{
              borderColor: "var(--erp-border)",
              background: "var(--erp-surface)",
            }}
          >
            <div
              className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2"
              style={{ color: "var(--erp-ink3)" }}
            >
              SAMPLE
            </div>
            <span
              className="text-sm font-semibold mb-1"
              style={{ color: "var(--erp-ink)" }}
            >
              ยังไม่มีแคมเปญ Sampling
            </span>
            <span className="text-xs" style={{ color: "var(--erp-ink3)" }}>
              คลิก + สร้างแคมเปญ เพื่อเริ่มต้น
            </span>
          </Card>
        ) : (
          <div className="grid gap-6">
            {campaigns.map((cCampaign) => (
              <CampaignCard
                key={cCampaign.id}
                campaign={cCampaign}
                onAddRecipient={openAddRecipient}
                onCompleteCampaign={(id) => {
                  updateSamplingStatus(id, "Completed");
                  showToast(`${id} → Completed`);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <CreateCampaignSheet
        open={open}
        onOpenChange={setOpen}
        products={products}
        onSubmit={handleCreateCampaign}
        showToast={showToast}
      />

      {selectedCampaign && (
        <AddRecipientSheet
          open={recipientOpen}
          onOpenChange={setRecipientOpen}
          campaignId={selectedCampaign.id}
          campaignName={selectedCampaign.name}
          onSubmit={handleAddRecipient}
          showToast={showToast}
        />
      )}
    </div>
  );
}
