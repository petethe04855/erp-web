"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, PageBody, TopBar } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readApiResponse } from "@/lib/apiResponse";
import { useTheme } from "@/lib/design/ThemeContext";
import { CreateBomDialog, type CreateBomPayload } from "./components/CreateBomDialog";

type BOMComponent = {
  componentSku: string;
  componentName: string;
  qty: number;
  unit: string;
  unitCost?: number;
  unitCostOverride?: number;
  isSubComponent?: boolean;
};

type BOMSummary = {
  id: number;
  code: string;
  name: string;
  version?: number;
  status: string;
  kind?: string;
  waste?: number;
  fgSku?: string;
  outputQty: number;
  outputUnit: string;
  effectiveDate: string;
  cost: number;
  componentCount: number;
  components?: BOMComponent[];
};

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("chawy_token") : "";
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

function formatBaht(n: number, digits = 2) {
  return `฿${n.toLocaleString("th-TH", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

async function fetchBOMs() {
  const response = await fetch(`${getApiUrl()}/api/boms`, { headers: getHeaders() });
  return readApiResponse<BOMSummary[]>(response);
}

async function createBOM(input: CreateBomPayload) {
  const response = await fetch(`${getApiUrl()}/api/boms`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(input),
  });
  return readApiResponse<BOMSummary>(response);
}

export default function BomPage() {
  const { tokens: t } = useTheme();
  const [toast, setToast] = useState("");
  const [boms, setBoms] = useState<BOMSummary[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBoms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return boms;
    return boms.filter((bom) =>
      [bom.code, bom.name, bom.fgSku || ""].some((value) => value.toLowerCase().includes(q)),
    );
  }, [boms, searchQuery]);

  async function loadBoms() {
    try {
      setBoms((await fetchBOMs()) || []);
    } catch {
      showToast("โหลดสูตร BOM ไม่สำเร็จ");
    }
  }

  useEffect(() => {
    loadBoms();
  }, []);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }

  async function handleCreateBOM(newBom: CreateBomPayload) {
    try {
      await createBOM(newBom);
      await loadBoms();
      showToast(`สร้างสูตร BOM แล้ว: ${newBom.code}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "สร้างสูตร BOM ไม่สำเร็จ");
      throw err;
    }
  }

  return (
    <div className="min-h-screen bg-canvas pb-16">
      <TopBar
        t={t}
        breadcrumb={["Chawy ERP", "Production", "BOM"]}
        title="สูตร BOM"
        subtitle="จัดการสูตรหลายชั้น วัตถุดิบย่อย Waste ต้นทุน และเวอร์ชัน"
        right={toast ? <span className="pr-2 text-xs font-semibold text-emerald-600">{toast}</span> : null}
      />

      <PageBody t={t}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="ค้นหา BOM, SKU หรือชื่อสูตร..."
            className="max-w-[360px]"
          />
          <Button
            onClick={() => setShowCreate(true)}
            className="cursor-pointer border-none bg-[var(--erp-accent)] text-white shadow-none hover:opacity-90"
          >
            + สร้างสูตร BOM
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {filteredBoms.length === 0 ? (
            <Card t={t} className="text-center md:col-span-2">
              <h3 className="mb-1 text-sm font-bold" style={{ color: "var(--erp-ink)" }}>
                ยังไม่มีสูตร BOM
              </h3>
              <div className="text-xs" style={{ color: "var(--erp-ink3)" }}>
                สร้างข้อมูลสินค้า วัตถุดิบ และสูตรก่อนเริ่มการผลิต
              </div>
            </Card>
          ) : (
            filteredBoms.map((bom) => (
              <Card key={bom.id} t={t} className="border border-border bg-card">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-700">
                    {bom.status || "Active"}
                  </span>
                  <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-extrabold text-amber-700">
                    Waste {bom.waste || 0}%
                  </span>
                </div>

                <h3 className="mb-1 text-sm font-bold" style={{ color: "var(--erp-ink)" }}>
                  {bom.name}
                </h3>
                <div className="mb-3 text-[10px]" style={{ color: "var(--erp-ink3)" }}>
                  {bom.code} · Version {bom.version || 1} · ได้ {bom.outputQty} {bom.outputUnit}
                </div>

                <div className="divide-y divide-stone-100">
                  {(bom.components || []).map((part) => (
                    <div
                      key={`${bom.id}-${part.componentSku}`}
                      className={`grid grid-cols-[1fr_auto] gap-2 py-2 text-[11px] ${
                        part.isSubComponent ? "rounded-md bg-stone-50 px-2" : ""
                      }`}
                    >
                      <span style={{ color: "var(--erp-ink)" }}>
                        {part.isSubComponent ? "▾ Sub-component: " : ""}
                        {part.componentName || part.componentSku}
                      </span>
                      <b>
                        {part.qty} {part.unit}
                      </b>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 text-[11px] font-extrabold">
                  <span>ต้นทุนจากสต็อกปัจจุบัน</span>
                  <span>
                    {formatBaht(bom.cost || 0)} · {formatBaht((bom.cost || 0) / Math.max(bom.outputQty || 1, 1))}
                    /{bom.outputUnit}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </PageBody>

      <CreateBomDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        existingBoms={boms}
        onCreate={handleCreateBOM}
        showToast={showToast}
      />
    </div>
  );
}
