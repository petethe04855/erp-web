"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { useTheme } from "@/lib/design/ThemeContext";

interface Product {
  sku: string;
  name: string;
}

interface CampaignFormState {
  name: string;
  sku: string;
  skuName: string;
  targetQty: number | "";
  note: string;
  startDate: string;
  endDate: string;
}

const getTodayString = () => new Date().toISOString().split("T")[0];

const BLANK_CAMPAIGN = (): CampaignFormState => ({
  name: "",
  sku: "",
  skuName: "",
  targetQty: 0,
  note: "",
  startDate: getTodayString(),
  endDate: getTodayString(),
});

interface CreateCampaignSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onSubmit: (data: {
    name: string;
    sku: string;
    skuName: string;
    targetQty: number;
    note: string;
    startDate: string;
    endDate: string;
  }) => void;
  showToast: (msg: string) => void;
}

export function CreateCampaignSheet({
  open,
  onOpenChange,
  products,
  onSubmit,
  showToast,
}: CreateCampaignSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [form, setForm] = useState<CampaignFormState>(BLANK_CAMPAIGN());

  useEffect(() => {
    if (open) {
      setForm(BLANK_CAMPAIGN());
    }
  }, [open]);

  const onSkuChange = (sku: string) => {
    const p = products.find((prod) => prod.sku === sku);
    setForm((f) => ({ ...f, sku, skuName: p?.name ?? "" }));
  };

  function handleSubmit() {
    if (
      !form.name ||
      !form.sku ||
      form.targetQty === "" ||
      Number(form.targetQty) <= 0
    ) {
      showToast("กรุณากรอกชื่อแคมเปญ สินค้า และจำนวนเป้าหมายที่มากกว่า 0");
      return;
    }
    onSubmit({
      name: form.name,
      sku: form.sku,
      skuName: form.skuName,
      targetQty: Number(form.targetQty),
      note: form.note,
      startDate: form.startDate,
      endDate: form.endDate,
    });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[min(540px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base font-bold text-foreground" style={{ color: "var(--erp-ink)" }}>
            สร้างแคมเปญ Sampling
          </SheetTitle>
          <div className="text-xs text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>
            ติดตามการแจกตัวอย่างสินค้า
          </div>
        </SheetHeader>
        <SheetBody className="grid gap-4 overflow-y-auto">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              ชื่อแคมเปญ *
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="เช่น ชาวี Snack Trial Q2"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              สินค้าที่แจก *
            </Label>
            <NativeSelect
              value={form.sku}
              onChange={(e) => onSkuChange(e.target.value)}
            >
              <option value="">-- เลือกสินค้า --</option>
              {products.map((p) => (
                <option key={p.sku} value={p.sku}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </NativeSelect>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              จำนวนเป้าหมาย (ชิ้น) *
            </Label>
            <Input
              type="number"
              min={1}
              value={form.targetQty}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  targetQty: e.target.value === "" ? "" : parseInt(e.target.value) || 0,
                }))
              }
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                วันเริ่ม
              </Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
                วันสิ้นสุด
              </Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              หมายเหตุ
            </Label>
            <Input
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="วัตถุประสงค์ หรือรายละเอียดเพิ่มเติม"
            />
          </div>
        </SheetBody>
        <SheetFooter className="flex justify-end gap-2 border-t p-4 px-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer border-border"
            style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)", color: "#374151" }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none cursor-pointer"
          >
            สร้างแคมเปญ
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
