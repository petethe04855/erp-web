"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Btn,
  Card,
  Mono,
  PageBody,
  PremiumTable,
  PremiumTd,
  PremiumTh,
  StatStrip,
  TopBar,
} from "@/components/ui";
import { readApiResponse } from "@/lib/apiResponse";
import { useTheme } from "@/lib/design/ThemeContext";
import { useErpStore } from "@/lib/store/useErpStore";
import type { PurchaseRequest } from "@/lib/store/erpWorkflow";

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
  const [newBom, setNewBom] = useState({
    code: "",
    name: "",
    outputQty: 1,
    outputUnit: "ชิ้น",
    status: "Draft",
    effectiveDate: "",
    cost: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const filteredBoms = useMemo(() => {
    if (!searchQuery) return boms;
    const q = searchQuery.toLowerCase();
    return boms.filter(
      (bom) =>
        bom.code.toLowerCase().includes(q) ||
        bom.name.toLowerCase().includes(q)
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

  async function handleCreateBOM() {
    if (!newBom.code || !newBom.name) {
      showToast("กรุณากรอกรหัสสูตร (Code) และชื่อสูตรให้ครบถ้วน");
      return;
    }
    try {
      await createBOM(newBom);
      await loadBoms();
      setShowAddRmModal(false);
      showToast(`สร้างสูตรการผลิต ${newBom.code} สำเร็จ!`);
      setNewBom({
        code: "",
        name: "",
        outputQty: 1,
        outputUnit: "ชิ้น",
        status: "Draft",
        effectiveDate: "",
        cost: 0,
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "สร้างสูตรไม่สำเร็จ");
    }
  }

  return (
    <div
      style={{ minHeight: "100vh", background: c.canvas, paddingBottom: 60 }}
    >
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Inventory", "Materials"]}
        title="จัดการวัตถุดิบและบรรจุภัณฑ์"
        subtitle="แสดงรายการและราคาต้นทุนของวัตถุดิบและบรรจุภัณฑ์ทั้งหมดในระบบ"
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {toast && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: c.pos,
                  paddingRight: 10,
                }}
              >
                {toast}
              </span>
            )}
          </div>
        }
      />

      <PageBody t={t} maxWidth="none">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            gap: 16,
          }}
        >
          <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
            <input
              type="text"
              placeholder="ค้นหาสูตรการผลิตด้วย SKU, รหัส หรือชื่อสูตร..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: `1px solid ${c.border}`,
                borderRadius: 6,
                background: c.surface,
                color: c.ink,
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>
          <Btn t={t} variant="accent" onClick={() => setShowAddRmModal(true)}>
            + สร้างข้อมูลวัตถุดิบ
          </Btn>
        </div>

        <Card
          t={t}
          pad={false}
          style={{ overflow: "hidden", marginBottom: 16 }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${c.border}`,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: c.ink }}>
              รายการสูตรการผลิตทั้งหมด (Bill of Materials Master)
            </div>
            <div style={{ fontSize: 12, color: c.ink3, marginTop: 3 }}>
              แสดงสูตรการผลิตและต้นทุนการผลิตต่อหน่วยตามโครงสร้างสูตรทั้งหมดที่มีในระบบ
            </div>
          </div>
          <PremiumTable
            t={t}
            minWidth={980}
            style={{ border: "none", borderRadius: 0 }}
          >
            <thead>
              <tr>
                <PremiumTh t={t}>รหัสสูตร (BOM Code)</PremiumTh>
                <PremiumTh t={t}>ชื่อสูตรการผลิต (BOM Name)</PremiumTh>
                <PremiumTh t={t} right>ปริมาณผลผลิต</PremiumTh>
                <PremiumTh t={t} right>ต้นทุนอ้างอิง</PremiumTh>
                <PremiumTh t={t}>สถานะ</PremiumTh>
              </tr>
            </thead>
            <tbody>
              {filteredBoms.length === 0 ? (
                <tr>
                  <PremiumTd
                    t={t}
                    colSpan={5}
                    last
                    style={{
                      textAlign: "center",
                      color: c.ink3,
                      fontSize: 13,
                      paddingTop: 18,
                      paddingBottom: 18,
                    }}
                  >
                    ไม่พบข้อมูลสูตรการผลิตในระบบ
                  </PremiumTd>
                </tr>
              ) : (
                filteredBoms.map((row, i) => {
                  const last = i === filteredBoms.length - 1;
                  const statusColor =
                    row.status === "Active"
                      ? c.pos
                      : row.status === "Inactive"
                        ? c.neg
                        : c.ink3;
                  return (
                    <tr key={row.id}>
                      <PremiumTd t={t} last={last}>
                        <Mono t={t} size={12} weight={600}>
                          {row.code}
                        </Mono>
                      </PremiumTd>
                      <PremiumTd t={t} last={last}>
                        <span
                          style={{ fontSize: 13, fontWeight: 600, color: c.ink }}
                        >
                          {row.name}
                        </span>
                      </PremiumTd>
                      <PremiumTd t={t} last={last} right>
                        <span style={{ fontSize: 12, color: c.ink }}>
                          {row.outputQty || 0} {row.outputUnit || "ชิ้น"}
                        </span>
                      </PremiumTd>
                      <PremiumTd t={t} last={last} right>
                        <Mono t={t} size={12} weight={600} color={c.pos}>
                          {formatBaht(row.cost || 0)}
                        </Mono>
                      </PremiumTd>
                      <PremiumTd t={t} last={last}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: statusColor,
                            background: `${statusColor}18`,
                            borderRadius: 4,
                            padding: "2px 8px",
                          }}
                        >
                          {row.status || "Draft"}
                        </span>
                      </PremiumTd>
                    </tr>
                  );
                })
              )}
            </tbody>
          </PremiumTable>
        </Card>
      </PageBody>

      {/* Modal Dialog: Add Raw Material */}
      {showAddRmModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "grid",
            placeItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: c.surface,
              border: `1px solid ${c.border}`,
              padding: 24,
              borderRadius: 8,
              width: 440,
              display: "grid",
              gap: 16,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: c.ink }}>
              สร้างสูตรการผลิตใหม่ (New BOM)
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 12, color: c.ink2 }}>
                  รหัสสูตร (BOM Code) *
                </span>
                <input
                  type="text"
                  placeholder="เช่น BOM-001"
                  value={newBom.code}
                  onChange={(e) => setNewBom({ ...newBom, code: e.target.value })}
                  style={{
                    padding: "8px 10px",
                    border: `1px solid ${c.border}`,
                    background: c.canvas,
                    color: c.ink,
                    borderRadius: 4,
                  }}
                />
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 12, color: c.ink2 }}>
                  ชื่อสูตรการผลิต (BOM Name) *
                </span>
                <input
                  type="text"
                  placeholder="เช่น สูตรอาหารแมวไก่ 1 กก."
                  value={newBom.name}
                  onChange={(e) => setNewBom({ ...newBom, name: e.target.value })}
                  style={{
                    padding: "8px 10px",
                    border: `1px solid ${c.border}`,
                    background: c.canvas,
                    color: c.ink,
                    borderRadius: 4,
                  }}
                />
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <label style={{ display: "grid", gap: 4 }}>
                  <span style={{ fontSize: 12, color: c.ink2 }}>
                    ปริมาณผลผลิต (Output Qty)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={newBom.outputQty}
                    onChange={(e) =>
                      setNewBom({ ...newBom, outputQty: Number(e.target.value) || 0 })
                    }
                    style={{
                      padding: "8px 10px",
                      border: `1px solid ${c.border}`,
                      background: c.canvas,
                      color: c.ink,
                      borderRadius: 4,
                    }}
                  />
                </label>
                <label style={{ display: "grid", gap: 4 }}>
                  <span style={{ fontSize: 12, color: c.ink2 }}>
                    หน่วยผลผลิต (Unit)
                  </span>
                  <input
                    type="text"
                    placeholder="ชิ้น, กล่อง, กก."
                    value={newBom.outputUnit}
                    onChange={(e) =>
                      setNewBom({ ...newBom, outputUnit: e.target.value })
                    }
                    style={{
                      padding: "8px 10px",
                      border: `1px solid ${c.border}`,
                      background: c.canvas,
                      color: c.ink,
                      borderRadius: 4,
                    }}
                  />
                </label>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <label style={{ display: "grid", gap: 4 }}>
                  <span style={{ fontSize: 12, color: c.ink2 }}>
                    ต้นทุนอ้างอิง (บาท)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={newBom.cost}
                    onChange={(e) =>
                      setNewBom({ ...newBom, cost: Number(e.target.value) || 0 })
                    }
                    style={{
                      padding: "8px 10px",
                      border: `1px solid ${c.border}`,
                      background: c.canvas,
                      color: c.ink,
                      borderRadius: 4,
                    }}
                  />
                </label>
                <label style={{ display: "grid", gap: 4 }}>
                  <span style={{ fontSize: 12, color: c.ink2 }}>
                    สถานะ (Status)
                  </span>
                  <select
                    value={newBom.status}
                    onChange={(e) =>
                      setNewBom({ ...newBom, status: e.target.value })
                    }
                    style={{
                      padding: "8px 10px",
                      border: `1px solid ${c.border}`,
                      background: c.canvas,
                      color: c.ink,
                      borderRadius: 4,
                    }}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 10,
              }}
            >
              <Btn
                t={t}
                variant="subtle"
                onClick={() => setShowAddRmModal(false)}
              >
                ยกเลิก
              </Btn>
              <Btn t={t} variant="primary" onClick={handleCreateBOM}>
                สร้างสูตร BOM
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
