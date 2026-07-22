"use client";

import { useMemo, useState, useEffect } from "react";
import { formatBaht } from "@/lib/mockData";
import { useErpStore } from "@/lib/store/useErpStore";
import type { PurchaseRequestStatus } from "@/lib/store/erpWorkflow";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, StatusPill, TopBar } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { readApiResponse } from "@/lib/apiResponse";
import { NewRequestSheet } from "./components/NewRequestSheet";
import { ConvertToPOSheet } from "./components/ConvertToPOSheet";

const statusMap: Record<PurchaseRequestStatus, string> = {
  Draft: "draft",
  "Pending Approval": "pending",
  Approved: "completed",
  Rejected: "cancelled",
};

export default function PurchaseReqPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const list = useErpStore((s) => s.purchaseRequests);
  const products = useErpStore((s) => s.products);
  const createPR = useErpStore((s) => s.createPurchaseRequest);
  const updatePRStatus = useErpStore((s) => s.updatePRStatus);
  const convertPRtoPO = useErpStore((s) => s.convertPRtoPO);

  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertPrId, setConvertPrId] = useState("");
  const [bomsList, setBomsList] = useState<any[]>([]);

  async function loadBOMs() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/boms`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              typeof window !== "undefined"
                ? `Bearer ${localStorage.getItem("chawy_token")}`
                : "",
          },
        },
      );
      const result = await readApiResponse<any[]>(response);
      setBomsList(result || []);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadBOMs();
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const rows = useMemo(() => {
    return list.map((pr) => {
      const est = pr.items.reduce((sum, item) => {
        const product = products.find((p) => p.sku === item.sku);
        const bom = bomsList.find((b) => b.code === item.sku);
        const cost = product ? product.cost : bom ? bom.cost : 0;
        return sum + item.qty * cost;
      }, 0);
      return {
        ...pr,
        est,
        itemSummary: pr.items
          .map((i) => `${i.name || i.sku} x${i.qty}`)
          .join(", "),
      };
    });
  }, [list, products, bomsList]);

  const pending = rows.filter((p) => p.status === "Pending Approval");
  const totalEst = rows.reduce((s, p) => s + p.est, 0);

  function handleCreatePR(data: {
    requester: string;
    reason: string;
    neededDate: string;
    items: { sku: string; name: string; qty: number; note: string }[];
  }) {
    const pr = createPR(data);
    showToast(`สร้าง ${pr.id} แล้ว`);
  }

  function handleStatusChange(prId: string, status: PurchaseRequestStatus) {
    const updated = updatePRStatus(prId, status);
    if (updated) showToast(`${prId} → ${status}`);
  }

  function openConvertToPO(prId: string) {
    setConvertPrId(prId);
    setConvertOpen(true);
  }

  function handleConvert(
    prId: string,
    supplier: string,
    etaDate: string,
    costs: Record<string, number>,
  ) {
    const po = convertPRtoPO(prId, supplier, etaDate, costs);
    if (po) showToast(`${prId} → ${po.id} แล้ว`);
  }

  return (
    <div
      className="min-h-screen bg-canvas pb-16"
      style={{ background: c.canvas }}
    >
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Purchasing", "Purchase Req."]}
        title="Purchase Requisitions"
        subtitle={`ใบขอซื้อ · ${pending.length} รออนุมัติ · ${formatBaht(totalEst)} มูลค่าประมาณ`}
        right={
          <div className="flex items-center gap-2">
            {toast && (
              <span
                className="text-xs font-semibold pr-2"
                style={{
                  color: toast.includes("กรุณา") ? c.neg : c.pos,
                }}
              >
                {toast}
              </span>
            )}
            <Button
              onClick={() => setOpen(true)}
              className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
            >
              + New Request
            </Button>
          </div>
        }
      />

      <div className="p-6 md:p-8 max-w-full mx-auto grid gap-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Pending approval",
              value: String(pending.length),
              sub: "awaiting review",
              tone: pending.length ? c.warn : undefined,
            },
            {
              label: "Est. value",
              value: formatBaht(pending.reduce((s, p) => s + p.est, 0)),
              sub: "pending requests",
            },
            {
              label: "Approved · MTD",
              value: String(rows.filter((p) => p.status === "Approved").length),
              sub: "this month",
            },
            {
              label: "Avg. lead time",
              value: "4.2 วัน",
              sub: "request → PO",
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
                <Mono
                  t={t}
                  size={22}
                  weight={600}
                  color={tile.tone ? tile.tone : c.ink}
                >
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

        {/* PR Table */}
        <Card
          t={t}
          pad={false}
          className="overflow-hidden border border-border bg-card"
          style={{
            borderColor: "var(--erp-border)",
            background: "var(--erp-surface)",
          }}
        >
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader
                className="bg-muted/50 border-b border-border"
                style={{
                  background: "var(--erp-subtle)",
                  borderColor: "var(--erp-border)",
                }}
              >
                <TableRow>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    PR
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Requester
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Date
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Item
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Quantity
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-right"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Est. value
                  </TableHead>
                  <TableHead
                    className="p-3 px-5 text-xs font-bold text-muted-foreground uppercase text-left"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((pr) => (
                  <TableRow
                    key={pr.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                    style={{ borderColor: "var(--erp-border)" }}
                  >
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} weight={500}>
                        {pr.id}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--erp-ink2)" }}
                      >
                        {pr.requester}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} color={c.ink2}>
                        {pr.date}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--erp-ink)" }}
                      >
                        {pr.items[0]?.name || pr.items[0]?.sku || "—"}
                      </span>
                      {pr.items.length > 1 && (
                        <span
                          className="text-xs ml-1.5"
                          style={{ color: "var(--erp-ink3)" }}
                        >
                          +{pr.items.length - 1}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      <Mono t={t} size={12} color={c.ink2}>
                        {pr.items.reduce((s, item) => s + item.qty, 0)}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle text-right">
                      <Mono t={t} size={13} weight={600}>
                        {formatBaht(pr.est)}
                      </Mono>
                    </TableCell>
                    <TableCell className="p-4 px-5 align-middle">
                      {pr.status === "Pending Approval" ? (
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              handleStatusChange(pr.id, "Approved")
                            }
                            className="h-7 text-xs px-2.5 cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleStatusChange(pr.id, "Rejected")
                            }
                            className="h-7 text-xs px-2.5 cursor-pointer"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : pr.status === "Draft" ? (
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleStatusChange(pr.id, "Pending Approval")
                          }
                          className="h-7 text-xs px-2.5 cursor-pointer"
                        >
                          Submit
                        </Button>
                      ) : pr.status === "Approved" && !pr.poRef ? (
                        <Button
                          onClick={() => openConvertToPO(pr.id)}
                          className="h-7 text-xs px-2.5 cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
                        >
                          Create PO
                        </Button>
                      ) : (
                        <StatusPill t={t} status={statusMap[pr.status]} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <NewRequestSheet
        open={open}
        onOpenChange={setOpen}
        products={products}
        onSubmit={handleCreatePR}
        showToast={showToast}
      />

      <ConvertToPOSheet
        open={convertOpen}
        onOpenChange={setConvertOpen}
        prId={convertPrId}
        purchaseRequests={list}
        products={products}
        bomsList={bomsList}
        onSubmit={handleConvert}
        showToast={showToast}
      />
    </div>
  );
}
