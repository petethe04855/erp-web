"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { readApiResponse } from "@/lib/apiResponse";
import { useErpStore } from "@/lib/store/useErpStore";

type Product = {
  sku: string;
  name: string;
  type: string;
  cost?: number;
  baseUnit?: string;
};

type ExistingBom = {
  code: string;
  fgSku?: string;
};

export type CreateBomPayload = {
  code: string;
  name: string;
  version: number;
  fgSku: string;
  kind: "finished" | "subcomponent";
  outputQty: number;
  outputUnit: string;
  status: string;
  effectiveDate: string;
  waste: number;
  cost: number;
  components: Array<{
    componentSku: string;
    qty: number;
    unit: string;
    scrapRate: number;
    componentType: "material" | "packaging";
    yieldFactor: number;
  }>;
};

interface CreateBomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingBoms: ExistingBom[];
  onCreate: (bom: CreateBomPayload) => Promise<void>;
  showToast: (msg: string) => void;
}

type RowState = {
  componentSku: string;
  qty: number | "";
  unit: string;
  scrapRate: number | "";
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

const emptyRows: RowState[] = [
  { componentSku: "", qty: "", unit: "", scrapRate: 0 },
];

export function CreateBomDialog({
  open,
  onOpenChange,
  existingBoms,
  onCreate,
  showToast,
}: CreateBomDialogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [outputSku, setOutputSku] = useState("");
  const [outputQty, setOutputQty] = useState<number | "">(100);
  const [rows, setRows] = useState<RowState[]>(emptyRows);
  const [saving, setSaving] = useState(false);

  const storeProducts = useErpStore((s) => s.products);

  useEffect(() => {
    if (!open) return;
    fetch(`${getApiUrl()}/api/products`, { headers: getHeaders() })
      .then((response) => readApiResponse<Product[]>(response))
      .then((items) => {
        const apiItems = items || [];
        // Merge apiItems with storeProducts, preferring storeProducts if sku matches
        const map = new Map<string, Product>();
        for (const p of apiItems) map.set(p.sku, p);
        for (const p of storeProducts) map.set(p.sku, p);
        setProducts(Array.from(map.values()));
      })
      .catch(() => {
        setProducts(storeProducts);
      });
  }, [open, storeProducts]);

  const outputs = useMemo(
    () =>
      products.filter(
        (item) =>
          item.type === "Finished Product" ||
          item.type === "Sub-component" ||
          item.type === "Cat" ||
          item.type === "Dog" ||
          item.type === "Bundle",
      ),
    [products],
  );

  const parts = useMemo(
    () => products.filter((item) => item.sku !== outputSku),
    [products, outputSku],
  );

  const outputItem = outputs.find((item) => item.sku === outputSku);

  useEffect(() => {
    if (open && !outputSku && outputs.length > 0) setOutputSku(outputs[0].sku);
  }, [open, outputSku, outputs]);

  function updateRow(index: number, patch: Partial<RowState>) {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  }

  function selectComponent(index: number, sku: string) {
    const item = parts.find((part) => part.sku === sku);
    updateRow(index, { componentSku: sku, unit: item?.baseUnit || "" });
  }

  function nextVersion(sku: string) {
    return (
      existingBoms.reduce((max, bom) => {
        if (!bom.code.startsWith(`BOM-${sku}-V`)) return max;
        const version = Number(bom.code.split("-V").at(-1));
        return Number.isFinite(version) ? Math.max(max, version) : max;
      }, 0) + 1
    );
  }

  async function handleSubmit() {
    if (!outputItem) {
      showToast("กรุณาสร้าง Finished Product หรือ Sub-component ก่อน");
      return;
    }
    if (!parts.length) {
      showToast("กรุณาสร้างวัตถุดิบหรือบรรจุภัณฑ์ก่อน");
      return;
    }
    if (outputQty === "" || Number(outputQty) <= 0) {
      showToast("กรุณากรอกจำนวนผลผลิตมาตรฐานมากกว่า 0");
      return;
    }

    const components = rows
      .filter(
        (row) => row.componentSku && row.qty !== "" && Number(row.qty) > 0,
      )
      .map((row) => {
        const item = parts.find((part) => part.sku === row.componentSku);
        return {
          componentSku: row.componentSku,
          qty: Number(row.qty),
          unit: item?.baseUnit || row.unit || "ชิ้น",
          scrapRate: row.scrapRate === "" ? 0 : Number(row.scrapRate),
          componentType:
            item?.type === "Packaging"
              ? ("packaging" as const)
              : ("material" as const),
          yieldFactor: 1,
        };
      });

    if (!components.length) {
      showToast("กรุณาเลือกส่วนประกอบอย่างน้อย 1 รายการ");
      return;
    }
    if (
      components.some(
        (component) => component.scrapRate < 0 || component.scrapRate >= 100,
      )
    ) {
      showToast("Scrap ต้องอยู่ระหว่าง 0 ถึงน้อยกว่า 100%");
      return;
    }

    const version = nextVersion(outputItem.sku);
    const code = `BOM-${outputItem.sku}-V${version}`;

    setSaving(true);
    try {
      await onCreate({
        code,
        name: outputItem.name,
        version,
        fgSku: outputItem.sku,
        kind: outputItem.type === "Sub-component" ? "subcomponent" : "finished",
        outputQty: Number(outputQty),
        outputUnit: outputItem.baseUnit || "ชิ้น",
        status: "Active",
        effectiveDate: new Date().toISOString().slice(0, 10),
        waste: 0,
        cost: estimatedTotalCost,
        components,
      });
      setOutputSku("");
      setOutputQty(100);
      setRows(emptyRows);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  const previewVersion = outputItem ? nextVersion(outputItem.sku) : 1;
  const previewCode = outputItem
    ? `BOM-${outputItem.sku}-V${previewVersion}`
    : "BOM-{SKU}-V1";

  const estimatedTotalCost = useMemo(() => {
    return rows.reduce((sum, row) => {
      if (!row.componentSku || row.qty === "" || Number(row.qty) <= 0) return sum;
      const part = parts.find((p) => p.sku === row.componentSku);
      if (!part) return sum;
      const netQty = Number(row.qty);
      const scrap = row.scrapRate === "" ? 0 : Number(row.scrapRate);
      const grossQty = scrap > 0 && scrap < 100 ? netQty / (1 - scrap / 100) : netQty;
      return sum + grossQty * (part.cost || 0);
    }, 0);
  }, [rows, parts]);

  const costPerUnit = useMemo(() => {
    const qty = Number(outputQty) || 0;
    return qty > 0 ? estimatedTotalCost / qty : 0;
  }, [estimatedTotalCost, outputQty]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="border-b border-border p-5">
          <DialogTitle
            className="text-base font-bold text-foreground"
            style={{ color: "var(--erp-ink)" }}
          >
            สร้างสูตร BOM
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            ใส่ Net Qty ตามสูตร และ Scrap (%) เพื่อให้ระบบคำนวณ Gross Qty = Net
            Qty / (1 - Scrap%)
          </p>
        </DialogHeader>

        <div className="grid grid-cols-[1fr_120px_100px] gap-3 p-5">
          <div className="col-span-3">
            <Label className="mb-1 block text-xs font-semibold text-muted-foreground">
              ผลิตภัณฑ์ที่ได้
            </Label>
            <NativeSelect
              value={outputSku}
              onChange={(event) => setOutputSku(event.target.value)}
              className="w-full"
            >
              {outputs.map((item) => (
                <option key={item.sku} value={item.sku}>
                  {item.name} ({item.sku})
                </option>
              ))}
            </NativeSelect>
          </div>

          <div>
            <Label className="mb-1 block text-xs font-semibold text-muted-foreground">
              จำนวนผลผลิตมาตรฐาน
            </Label>
            <Input
              type="number"
              min={0}
              step="any"
              value={outputQty}
              onChange={(event) =>
                setOutputQty(
                  event.target.value === "" ? "" : Number(event.target.value),
                )
              }
            />
          </div>

          <div className="col-span-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-xs">
            <div className="flex items-center justify-between">
              <b>{previewCode}</b>
              <span className="font-semibold text-emerald-800">
                ประมาณการต้นทุน: ฿{estimatedTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-muted-foreground">
              <span>
                Version {previewVersion} · ได้ {outputQty || 0}{" "}
                {outputItem?.baseUnit || "หน่วย"}
              </span>
              <span>
                (฿{costPerUnit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {outputItem?.baseUnit || "หน่วย"})
              </span>
            </div>
          </div>

          {rows.map((row, index) => {
            const selectedPart = parts.find((p) => p.sku === row.componentSku);
            return (
              <div key={index} className="contents">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      ส่วนประกอบ {index + 1}
                      {selectedPart?.type && (
                        <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-normal text-slate-600">
                          {selectedPart.type}
                        </span>
                      )}
                    </Label>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setRows((current) =>
                            current.filter((_, rIdx) => rIdx !== index),
                          )
                        }
                        className="text-[10px] font-semibold text-rose-500 hover:underline cursor-pointer"
                      >
                        ลบแถว
                      </button>
                    )}
                  </div>
                  <NativeSelect
                    value={row.componentSku}
                    onChange={(event) =>
                      selectComponent(index, event.target.value)
                    }
                    className="w-full"
                  >
                    <option value="">-- ไม่ใช้ --</option>
                    {parts.map((part) => (
                      <option key={part.sku} value={part.sku}>
                        {part.name} ({part.sku})
                      </option>
                    ))}
                  </NativeSelect>
                </div>
                <div>
                  <Label className="mb-1 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Net Qty</span>
                    <span className="text-[10px] font-normal text-emerald-700">
                      {selectedPart?.baseUnit || row.unit || ""}
                    </span>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={row.qty}
                    onChange={(event) =>
                      updateRow(index, {
                        qty:
                          event.target.value === ""
                            ? ""
                            : Number(event.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Scrap (%)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.1"
                    value={row.scrapRate}
                    onChange={(event) =>
                      updateRow(index, {
                        scrapRate:
                          event.target.value === ""
                            ? ""
                            : Number(event.target.value),
                      })
                    }
                  />
                </div>
              </div>
            );
          })}

          <div className="col-span-2 mt-1">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() =>
                setRows((current) => [
                  ...current,
                  { componentSku: "", qty: "", unit: "", scrapRate: 0 },
                ])
              }
              className="cursor-pointer border-dashed border-border text-xs font-semibold hover:border-emerald-500 hover:text-emerald-600"
            >
              + เพิ่มส่วนประกอบ
            </Button>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 border-t border-border p-5">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="cursor-pointer border-none bg-[var(--erp-accent)] text-white shadow-none hover:opacity-90"
          >
            สร้างสูตร BOM
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
