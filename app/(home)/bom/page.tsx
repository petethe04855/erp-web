"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Mono, PageBody, TopBar } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { readApiResponse } from "@/lib/apiResponse";
import { useTheme } from "@/lib/design/ThemeContext";
import { useErpStore } from "@/lib/store/useErpStore";
import type { PurchaseRequest } from "@/lib/store/erpWorkflow";
import { CreateBomDialog } from "./components/CreateBomDialog";

type BOMSummary = {
  id: number;
  code: string;
  name: string;
  outputQty: number;
  outputUnit: string;
  status: string;
  effectiveDate: string;
  cost: number;
  componentCount: number;
};

type BOMLine = {
  sku: string;
  name: string;
  category: string;
  unit: string;
  qtyPerUnit: number;
  requiredQty: number;
  stockQty: number;
  shortage: number;
  unitCost: number;
  costPerFinishedUnit: number;
  prValue: number;
  canCreatePr: boolean;
};

type BOMDetail = {
  sku: string;
  name: string;
  productionQty: number;
  componentCount: number;
  prRequired: number;
  readyItems: number;
  totalPrValue: number;
  totalCostPerUnit: number;
  bomCode?: string;
  bomName?: string;
  bomOutputQty?: number;
  bomUnit?: string;
  bomStatus?: string;
  bomEffectiveDate?: string;
  lines: BOMLine[];
};

const getApiUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const getHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("chawy_token") : "";
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

function formatQty(n: number, unit: string) {
  return `${n.toLocaleString("th-TH", { maximumFractionDigits: 2 })} ${unit || "หน่วย"}`;
}

function formatBaht(n: number, digits = 2) {
  return `฿${n.toLocaleString("th-TH", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

function todayPlus(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function categoryLabel(category: string) {
  if (category === "expense") return "ค่าใช้จ่าย";
  if (category === "packaging") return "บรรจุภัณฑ์";
  return "วัตถุดิบ";
}

async function fetchBOMs() {
  const response = await fetch(`${getApiUrl()}/api/boms`, {
    headers: getHeaders(),
  });
  return readApiResponse<BOMSummary[]>(response);
}

async function fetchBOMDetail(sku: string, productionQty: number) {
  const response = await fetch(
    `${getApiUrl()}/api/boms/${encodeURIComponent(sku)}?productionQty=${productionQty}`,
    { headers: getHeaders() },
  );
  return readApiResponse<BOMDetail>(response);
}

async function createPRFromBOM(
  sku: string,
  input: {
    requester: string;
    reason: string;
    neededDate: string;
    productionQty: number;
  },
) {
  const response = await fetch(
    `${getApiUrl()}/api/boms/${encodeURIComponent(sku)}/purchase-request`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(input),
    },
  );
  return readApiResponse<PurchaseRequest>(response);
}

async function saveBOM(sku: string, input: any) {
  const response = await fetch(
    `${getApiUrl()}/api/boms/${encodeURIComponent(sku)}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(input),
    },
  );
  return readApiResponse<BOMDetail>(response);
}

async function recalculateCost(sku: string) {
  const response = await fetch(
    `${getApiUrl()}/api/boms/${encodeURIComponent(sku)}/recalculate`,
    {
      method: "POST",
      headers: getHeaders(),
    },
  );
  return readApiResponse<BOMDetail>(response);
}

async function duplicateBOM(sku: string, targetSku: string) {
  const response = await fetch(
    `${getApiUrl()}/api/boms/${encodeURIComponent(sku)}/duplicate`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ targetSku }),
    },
  );
  return readApiResponse<BOMDetail>(response);
}

async function createBOM(input: {
  code: string;
  name: string;
  outputQty: number;
  outputUnit: string;
  status: string;
  effectiveDate: string;
  cost: number;
}) {
  const response = await fetch(`${getApiUrl()}/api/boms`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(input),
  });
  return readApiResponse<BOMSummary>(response);
}

export default function BomPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const [toast, setToast] = useState("");
  const [boms, setBoms] = useState<BOMSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddRmModal, setShowAddRmModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredBoms = useMemo(() => {
    if (!searchQuery) return boms;
    const q = searchQuery.toLowerCase();
    return boms.filter(
      (bom) =>
        bom.code.toLowerCase().includes(q) ||
        bom.name.toLowerCase().includes(q),
    );
  }, [boms, searchQuery]);

  async function loadBoms() {
    setLoading(true);
    try {
      const data = await fetchBOMs();
      setBoms(data || []);
    } catch (err) {
      showToast("ไม่สามารถดึงข้อมูลสูตรการผลิตได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBoms();
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3600);
  }

  async function handleCreateBOM(newBom: {
    code: string;
    name: string;
    outputQty: number;
    outputUnit: string;
    status: string;
    effectiveDate: string;
    cost: number;
  }) {
    try {
      await createBOM(newBom);
      await loadBoms();
      showToast(`สร้างสูตรการผลิต ${newBom.code} สำเร็จ!`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "สร้างสูตรไม่สำเร็จ");
      throw err;
    }
  }

  return (
    <div
      className="min-h-screen bg-canvas pb-16"
      style={{ background: c.canvas }}
    >
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Inventory", "Materials"]}
        title="จัดการวัตถุดิบและบรรจุภัณฑ์"
        subtitle="แสดงรายการและราคาต้นทุนของวัตถุดิบและบรรจุภัณฑ์ทั้งหมดในระบบ"
        right={
          <div className="flex items-center gap-2">
            {toast && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 pr-2">
                {toast}
              </span>
            )}
          </div>
        }
      />

      <PageBody t={t}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="relative flex-1 max-w-[360px]">
            <Input
              type="text"
              placeholder="ค้นหาสูตรการผลิตด้วย SKU, รหัส หรือชื่อสูตร..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            onClick={() => setShowAddRmModal(true)}
            className="cursor-pointer bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none"
          >
            + สร้างข้อมูลวัตถุดิบ
          </Button>
        </div>

        <Card
          t={t}
          pad={false}
          className="overflow-hidden mb-4 border border-border bg-card"
          style={{
            borderColor: "var(--erp-border)",
            background: "var(--erp-surface)",
          }}
        >
          <div
            className="p-5 border-b border-border"
            style={{ borderColor: "var(--erp-border)" }}
          >
            <div
              className="text-sm font-semibold text-foreground"
              style={{ color: "var(--erp-ink)" }}
            >
              รายการสูตรการผลิตทั้งหมด (Bill of Materials Master)
            </div>
            <div
              className="text-xs text-muted-foreground mt-1"
              style={{ color: "var(--erp-ink3)" }}
            >
              แสดงสูตรการผลิตและต้นทุนการผลิตต่อหน่วยตามโครงสร้างสูตรทั้งหมดที่มีในระบบ
            </div>
          </div>
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
                  className="p-3 text-xs font-bold text-muted-foreground uppercase text-left"
                  style={{ color: "var(--erp-ink3)" }}
                >
                  รหัสสูตร (BOM Code)
                </TableHead>
                <TableHead
                  className="p-3 text-xs font-bold text-muted-foreground uppercase text-left"
                  style={{ color: "var(--erp-ink3)" }}
                >
                  ชื่อสูตรการผลิต (BOM Name)
                </TableHead>
                <TableHead
                  className="p-3 text-xs font-bold text-muted-foreground uppercase text-right"
                  style={{ color: "var(--erp-ink3)" }}
                >
                  ปริมาณผลผลิต
                </TableHead>
                <TableHead
                  className="p-3 text-xs font-bold text-muted-foreground uppercase text-right"
                  style={{ color: "var(--erp-ink3)" }}
                >
                  ต้นทุนอ้างอิง
                </TableHead>
                <TableHead
                  className="p-3 text-xs font-bold text-muted-foreground uppercase text-left"
                  style={{ color: "var(--erp-ink3)" }}
                >
                  สถานะ
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBoms.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="p-5 text-center text-muted-foreground text-sm"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    ไม่พบข้อมูลสูตรการผลิตในระบบ
                  </TableCell>
                </TableRow>
              ) : (
                filteredBoms.map((row, i) => {
                  const statusColor =
                    row.status === "Active"
                      ? c.pos
                      : row.status === "Inactive"
                        ? c.neg
                        : c.ink3;
                  return (
                    <TableRow
                      key={row.id}
                      className="hover:bg-muted/30 border-b border-border"
                      style={{ borderColor: "var(--erp-subtle)" }}
                    >
                      <TableCell className="p-3">
                        <Mono t={t} size={12} weight={600}>
                          {row.code}
                        </Mono>
                      </TableCell>
                      <TableCell className="p-3">
                        <span
                          className="text-sm font-semibold text-foreground"
                          style={{ color: "var(--erp-ink)" }}
                        >
                          {row.name}
                        </span>
                      </TableCell>
                      <TableCell className="p-3 text-right">
                        <span
                          className="text-xs text-foreground"
                          style={{ color: "var(--erp-ink)" }}
                        >
                          {row.outputQty || 0} {row.outputUnit || "ชิ้น"}
                        </span>
                      </TableCell>
                      <TableCell className="p-3 text-right">
                        <Mono
                          t={t}
                          size={12}
                          weight={600}
                          style={{ color: "var(--erp-pos)" }}
                        >
                          {formatBaht(row.cost || 0)}
                        </Mono>
                      </TableCell>
                      <TableCell className="p-3">
                        <span
                          className="text-[11px] font-semibold rounded px-2 py-0.5"
                          style={{
                            color: statusColor,
                            background: `${statusColor}18`,
                          }}
                        >
                          {row.status || "Draft"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </PageBody>

      <CreateBomDialog
        open={showAddRmModal}
        onOpenChange={setShowAddRmModal}
        onCreate={handleCreateBOM}
        showToast={showToast}
      />
    </div>
  );
}
