"use client";

import type { SamplingCampaign } from "@/lib/store/erpWorkflow";
import { Card, Mono } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useTheme } from "@/lib/design/ThemeContext";

const STATUS_STYLE: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
  Completed: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
  Cancelled: "bg-muted text-muted-foreground border-border",
};

interface CampaignCardProps {
  campaign: SamplingCampaign;
  onAddRecipient: (campaign: SamplingCampaign) => void;
  onCompleteCampaign: (id: string) => void;
}

export function CampaignCard({
  campaign,
  onAddRecipient,
  onCompleteCampaign,
}: CampaignCardProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const sClass = STATUS_STYLE[campaign.status] || "bg-muted text-muted-foreground";
  const pct =
    campaign.targetQty > 0
      ? Math.min(100, Math.round((campaign.givenQty / campaign.targetQty) * 100))
      : 0;
  const convCount = campaign.recipients.filter((r) => r.converted).length;

  return (
    <Card
      t={t}
      pad={false}
      className="overflow-hidden border border-border bg-card flex flex-col"
      style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)" }}
    >
      {/* Campaign Header */}
      <div
        className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ borderColor: "var(--erp-border)" }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="text-sm font-bold text-foreground"
              style={{ color: "var(--erp-ink)" }}
            >
              {campaign.name}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sClass}`}>
              {campaign.status}
            </span>
            <span
              className="text-[11px] font-mono"
              style={{ color: "var(--erp-ink3)" }}
            >
              {campaign.id}
            </span>
          </div>
          <div className="text-xs" style={{ color: "var(--erp-ink3)" }}>
            SKU:{" "}
            <span style={{ color: "var(--erp-accent)", fontWeight: 600 }}>
              {campaign.sku}
            </span>{" "}
            · {campaign.skuName} · วันที่ {campaign.startDate} ถึง {campaign.endDate}
          </div>
          {campaign.note && (
            <div
              className="text-xs mt-1.5 italic"
              style={{ color: "var(--erp-ink3)" }}
            >
              {campaign.note}
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          <div className="text-center min-w-[70px]">
            <div
              className="text-lg font-extrabold"
              style={{ color: "var(--erp-accent)" }}
            >
              {campaign.givenQty}
              <span
                className="text-xs font-normal"
                style={{ color: "var(--erp-ink3)" }}
              >
                /{campaign.targetQty}
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold" style={{ color: "var(--erp-ink3)" }}>
              แจกแล้ว
            </div>
          </div>

          <div className="text-center min-w-[70px]">
            <div className="text-lg font-extrabold text-violet-600 dark:text-violet-400">
              {convCount}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold" style={{ color: "var(--erp-ink3)" }}>
              Converted
            </div>
          </div>

          <div className="text-center min-w-[70px]">
            <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              {campaign.recipients.length > 0
                ? `${Math.round((convCount / campaign.recipients.length) * 100)}%`
                : "—"}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold" style={{ color: "var(--erp-ink3)" }}>
              Conv. Rate
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {campaign.status === "Active" && (
            <>
              <Button
                onClick={() => onAddRecipient(campaign)}
                size="sm"
                className="h-8 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
              >
                + เพิ่มผู้รับ
              </Button>
              <Button
                onClick={() => onCompleteCampaign(campaign.id)}
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold"
              >
                จบแคมเปญ
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="p-5 pb-3 border-b border-border flex flex-col gap-1.5"
        style={{
          borderColor: campaign.recipients.length > 0 ? "var(--erp-border)" : "transparent",
        }}
      >
        <div className="flex justify-between items-center text-xs">
          <span style={{ color: "var(--erp-ink3)" }}>ความคืบหน้า</span>
          <span
            className="font-bold font-mono"
            style={{ color: pct >= 100 ? "#059669" : "var(--erp-ink)" }}
          >
            {pct}%
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden w-full bg-muted"
          style={{ background: "var(--erp-subtle)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${pct}%`,
              background: pct >= 100 ? "#059669" : "var(--erp-accent)",
            }}
          />
        </div>
      </div>

      {/* Recipients List Table */}
      {campaign.recipients.length > 0 && (
        <div className="overflow-x-auto">
          <Table className="w-full border-collapse">
            <TableHeader
              className="bg-muted/50 border-b border-border"
              style={{ background: "var(--erp-subtle)", borderColor: "var(--erp-border)" }}
            >
              <TableRow>
                <TableHead className="p-3 px-5 text-[11px] font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink4)" }}>ชื่อผู้รับ</TableHead>
                <TableHead className="p-3 px-5 text-[11px] font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink4)" }}>ช่องทางติดต่อ</TableHead>
                <TableHead className="p-3 px-5 text-[11px] font-bold text-muted-foreground uppercase text-right" style={{ color: "var(--erp-ink4)" }}>จำนวน</TableHead>
                <TableHead className="p-3 px-5 text-[11px] font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink4)" }}>วันที่</TableHead>
                <TableHead className="p-3 px-5 text-[11px] font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink4)" }}>Feedback</TableHead>
                <TableHead className="p-3 px-5 text-[11px] font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink4)" }}>Converted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaign.recipients.map((r) => (
                <TableRow
                  key={r.id}
                  className="border-b border-border hover:bg-muted/40 transition-colors"
                  style={{ borderColor: "var(--erp-border)" }}
                >
                  <TableCell className="p-3 px-5 align-middle">
                    <span className="text-sm font-semibold" style={{ color: "var(--erp-ink)" }}>
                      {r.name}
                    </span>
                  </TableCell>
                  <TableCell className="p-3 px-5 align-middle">
                    <span className="text-xs" style={{ color: "var(--erp-ink3)" }}>
                      {r.contact || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="p-3 px-5 align-middle text-right">
                    <span className="text-sm font-bold" style={{ color: "var(--erp-accent)" }}>
                      {r.qtyGiven} ชิ้น
                    </span>
                  </TableCell>
                  <TableCell className="p-3 px-5 align-middle">
                    <Mono t={t} size={12} color={c.ink2}>
                      {r.date}
                    </Mono>
                  </TableCell>
                  <TableCell className="p-3 px-5 align-middle max-w-[200px] truncate">
                    <span className="text-xs" style={{ color: "var(--erp-ink3)" }}>
                      {r.feedback || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="p-3 px-5 align-middle">
                    {r.converted ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">
                        ซื้อแล้ว
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                        รอติดตาม
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
