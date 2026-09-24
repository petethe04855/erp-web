"use client";
import { useState } from "react";
import { FormDialog } from "@/components/form/FormDialog";
import { Input } from "@/components/ui/input";
import { POSelect } from "@/features/purchase/components/POSelect";
import type { PurchaseOrder } from "@/features/purchase/types/purchase";
import { SKUSelect } from "@/features/sku/components/SKUSelect";
import type { CreateGoodsReceiveDTO } from "../types/warehouse";
import { Info } from "lucide-react";
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateGoodsReceiveDTO) => Promise<unknown>;
  isSubmitting?: boolean;
}

const calculateDefaultExpiry = (receiveDateStr: string) => {
  const d = new Date(receiveDateStr);
  if (isNaN(d.getTime())) return "";
  d.setMonth(d.getMonth() + 18); // 1 ปี 6 เดือน = 18 เดือน
  return d.toISOString().split("T")[0];
};

export function GoodsReceiveForm(props: Props) {
  const todayStr = new Date().toLocaleDateString("en-CA");
  const [po, setPo] = useState("");
  const [selectedPoData, setSelectedPoData] = useState<PurchaseOrder | null>(null);
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState("1");
  const [unitCost, setUnitCost] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [supplierLot, setSupplierLot] = useState("");
  const [date, setDate] = useState(todayStr);
  const [expiry, setExpiry] = useState(calculateDefaultExpiry(todayStr));

  const resetForm = () => {
    const today = new Date().toLocaleDateString("en-CA");
    setPo("");
    setSelectedPoData(null);
    setSku("");
    setQty("1");
    setUnitCost("");
    setRetailPrice("");
    setSupplierLot("");
    setDate(today);
    setExpiry(calculateDefaultExpiry(today));
  };

  // Reset when the dialog closes: adjust state during render (React docs
  // pattern) instead of setState-in-effect.
  const [prevOpen, setPrevOpen] = useState(props.open);
  if (prevOpen && !props.open) {
    setPrevOpen(false);
    resetForm();
  } else if (!prevOpen && props.open) {
    setPrevOpen(true);
  }

  const handlePOChange = (poNumber: string, poData?: PurchaseOrder, poDetail?: any) => {
    setPo(poNumber);
    setSelectedPoData(poData || null);

    // Auto-fill SKU and quantity from PO items if available and current sku is empty
    if (poDetail?.lines && Array.isArray(poDetail.lines) && poDetail.lines.length > 0) {
      // Find first item with pending balance
      const pendingItem = poDetail.lines.find((line: any) => {
        const remaining = (line.qty || 0) - (line.receivedQty || 0);
        return remaining > 0;
      }) || poDetail.lines[0];

      if (pendingItem?.sku) {
        setSku(pendingItem.sku);
        const rem = (pendingItem.qty || 0) - (pendingItem.receivedQty || 0);
        if (rem > 0) {
          setQty(String(rem));
        } else if (pendingItem.qty) {
          setQty(String(pendingItem.qty));
        }
        if (pendingItem.unitCost || pendingItem.cost) {
          setUnitCost(String(pendingItem.unitCost || pendingItem.cost || ""));
        }
      }
    }
  };

  const handleSKUChange = (val: string, skuItem?: any) => {
    setSku(val);
    if (skuItem) {
      if (!unitCost && skuItem.cost && skuItem.cost > 0) {
        setUnitCost(String(skuItem.cost));
      }
      if (!retailPrice && skuItem.price && skuItem.price > 0) {
        setRetailPrice(String(skuItem.price));
      }
    }
  };

  return (
    <FormDialog
      {...props}
      title="รับสินค้าเข้าสต็อก"
      description="บันทึกราคาต้นทุนและราคาขายต่อล็อตเข้าสู่ระบบ สินค้าแต่ละล็อตจะถูกคำนวณและอัปเดตราคาล่าสุดให้อัตโนมัติ"
      onSubmit={async () => {
        if (!sku) {
          throw new Error("กรุณาเลือก SKU สินค้า");
        }
        await props.onSubmit({
          poNumber: po,
          sku,
          quantity: Number(qty),
          unitCost: unitCost ? Number(unitCost) : undefined,
          retailPrice: retailPrice ? Number(retailPrice) : undefined,
          warehouse: "",
          lotNumber: supplierLot,
          receiveDate: date,
          expiryDate: expiry,
        });
        resetForm();
      }}
    >
      <div>
        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
          อ้างอิง PO <span className="text-[11px] font-normal text-neutral-500">(พิมพ์ค้นหา หรือเลือกจาก Dropdown / เว้นว่างสำหรับรับโดยตรง)</span>
        </label>
        <POSelect
          value={po}
          onChange={handlePOChange}
        />
        {selectedPoData && (
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-neutral-600 bg-neutral-50 dark:bg-neutral-800/60 p-2 rounded border border-neutral-200 dark:border-neutral-700">
            <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span>
              ผู้จัดจำหน่าย: <strong>{selectedPoData.supplierName || "-"}</strong> · กำหนดรับ: {selectedPoData.expectedDeliveryDate || "-"} · สถานะ: {selectedPoData.status}
            </span>
          </div>
        )}
      </div>

      <SKUSelect
        value={sku}
        onChange={handleSKUChange}
        showDetails={true}
        excludeBundle={true}
      />
      <label className="block text-xs font-medium">
        จำนวนรับ
        <Input
          className="mt-2"
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          min="1"
          step="1"
          required
        />
      </label>

      {/* ราคาต้นทุน และ ราคาขาย ของสินค้ารอบที่นำเข้า */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <label className="block text-xs font-medium text-neutral-800 dark:text-neutral-200">
          ราคาต้นทุนต่อหน่วย (บาท)
          <Input
            className="mt-1.5 bg-white dark:bg-neutral-900"
            type="number"
            placeholder="เช่น 150.00"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            min="0"
            step="0.01"
          />
          <span className="text-[11px] text-neutral-400 mt-1 block">
            ต้นทุนเฉพาะล็อตนี้ (ดึงจาก PO อัตโนมัติถ้ามี)
          </span>
        </label>

        <label className="block text-xs font-medium text-neutral-800 dark:text-neutral-200">
          ราคาขายปลีกรอบนี้ (บาท)
          <Input
            className="mt-1.5 bg-white dark:bg-neutral-900"
            type="number"
            placeholder="เช่น 290.00"
            value={retailPrice}
            onChange={(e) => setRetailPrice(e.target.value)}
            min="0"
            step="0.01"
          />
          <span className="text-[11px] text-neutral-400 mt-1 block">
            ราคาขายที่ต้องการอัปเดตให้ SKU สำหรับล็อตนี้
          </span>
        </label>
      </div>

      <label className="block text-xs font-medium">
        วันที่รับสินค้า
        <Input
          className="mt-2"
          type="date"
          value={date}
          onChange={(e) => {
            const newDate = e.target.value;
            setDate(newDate);
            if (newDate) {
              setExpiry(calculateDefaultExpiry(newDate));
            }
          }}
          required
        />
      </label>
      <label className="block text-xs font-medium">
        วันที่หมดอายุ (คำนวณอัตโนมัติ 1 ปี 6 เดือน)
        <Input
          className="mt-2 bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed opacity-90"
          type="date"
          value={expiry}
          readOnly
          required
        />
      </label>
      <label className="block text-xs font-medium">
        ล็อตผู้จัดจำหน่าย
        <Input
          className="mt-2"
          type="text"
          value={supplierLot}
          onChange={(e) => setSupplierLot(e.target.value)}
        />
      </label>
      <p className="text-xs text-neutral-500">
        ระบบบันทึกราคาต้นทุนและราคาขายไปยังล็อตสินค้า และอัปเดตราคาล่าสุดให้ SKU อัตโนมัติ
      </p>
    </FormDialog>
  );
}
