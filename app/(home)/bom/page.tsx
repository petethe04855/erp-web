"use client";

import { useState } from "react";
import Link from "next/link";
import { useErpStore } from "@/lib/store/useErpStore";
import { useTheme } from "@/lib/design/ThemeContext";
import { Card, Mono, TopBar } from "@/components/ui";
import BomEditorModal from "@/app/(home)/sku/components/BomEditorModal";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type BomRow = {
  componentSku: string;
  qty: number;
  unit: "piece" | "g" | "kg" | "baht";
  componentType: "material" | "packaging" | "expense";
  unitCostOverride: number;
};

export default function BomPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const products = useErpStore((s) => s.products);
  const components = useErpStore((s) => s.bundleComponents);
  const setBundleComponents = useErpStore((s) => s.setBundleComponents);
  const calcVirtualStock = useErpStore((s) => s.calcBundleVirtualStock);
  const bundles = products.filter((product) => product.isBundle);
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [rows, setRows] = useState<BomRow[]>([]);
  const [message, setMessage] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedParentSku, setSelectedParentSku] = useState("");

  const editingProduct = products.find((product) => product.sku === editingSku);
  const availableParents = bundles.filter(
    (bundle) => !components.some((item) => item.bundleSku === bundle.sku),
  );

  function openEditor(sku: string) {
    const existing = components.filter(
      (component) => component.bundleSku === sku,
    );
    setRows(
      existing.length
        ? existing.map((component) => ({
            componentSku: component.componentSku,
            qty: component.qty,
            unit: component.unit ?? "piece",
            componentType: component.componentType ?? "material",
            unitCostOverride: component.unitCostOverride ?? 0,
          }))
        : [
            {
              componentSku: "",
              qty: 1,
              unit: "piece",
              componentType: "material",
              unitCostOverride: 0,
            },
          ],
    );
    setEditingSku(sku);
  }

  function save() {
    if (!editingSku) return;
    const validRows = rows.filter(
      (row) =>
        (row.componentType === "expense" || row.componentSku) && row.qty > 0,
    );
    if (validRows.length === 0) {
      setMessage("กรุณาเพิ่มส่วนประกอบอย่างน้อย 1 รายการ");
      return;
    }
    setBundleComponents({
      bundleSku: editingSku,
      components: validRows,
    });
    setMessage(`บันทึก BOM ${editingSku} แล้ว`);
    setEditingSku(null);
  }

  return (
    <div style={{ minHeight: "100vh", background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Inventory", "BOM"]}
        title="Bill of Materials"
        subtitle="จัดการสูตร ส่วนประกอบ และต้นทุนสินค้าสำเร็จรูป"
        right={
          <Button
            onClick={() => {
              setMessage("");
              setSelectedParentSku(availableParents[0]?.sku ?? "");
              setCreateOpen(true);
            }}
          >
            + เพิ่ม BOM
          </Button>
        }
      />
      <div style={{ padding: "24px 32px 48px" }}>
        {message && (
          <div
            style={{
              marginBottom: 14,
              padding: "10px 14px",
              borderRadius: 8,
              background: c.accentBg,
              color: c.accent,
              fontSize: 13,
            }}
          >
            {message}
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <Card t={t}>
            <div style={{ fontSize: 11, color: c.ink3 }}>สินค้าตัวแม่</div>
            <Mono t={t} size={24} weight={600}>
              {bundles.length}
            </Mono>
          </Card>
          <Card t={t}>
            <div style={{ fontSize: 11, color: c.ink3 }}>มีสูตร BOM แล้ว</div>
            <Mono t={t} size={24} weight={600}>
              {new Set(components.map((item) => item.bundleSku)).size}
            </Mono>
          </Card>
          <Card t={t}>
            <div style={{ fontSize: 11, color: c.ink3 }}>รายการส่วนประกอบ</div>
            <Mono t={t} size={24} weight={600}>
              {components.length}
            </Mono>
          </Card>
        </div>

        <Card t={t} pad={false} style={{ overflow: "auto" }}>
          <Table className="min-w-[850px]">
            <TableHeader>
              <TableRow>
                {[
                  "SKU ตัวแม่",
                  "ชื่อสินค้า",
                  "จำนวนส่วนประกอบ",
                  "ต้นทุน BOM",
                  "Virtual stock",
                  "สถานะสูตร",
                  "",
                ].map((label) => (
                  <TableHead
                    key={label}
                    className="py-3 px-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {bundles.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                  >
                    ยังไม่มี SKU ตัวแม่สำหรับสร้าง BOM ·{" "}
                    <Link href="/sku" style={{ color: c.accent }}>
                      ไปสร้าง SKU ประเภท Bundle
                    </Link>
                  </TableCell>
                </TableRow>
              )}
              {bundles.map((bundle) => {
                const bomItems = components.filter(
                  (item) => item.bundleSku === bundle.sku,
                );
                return (
                  <TableRow key={bundle.sku}>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={12} weight={600}>
                        {bundle.sku}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">{bundle.name}</TableCell>
                    <TableCell className="py-3.5 px-6">
                      {bomItems.length}
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <Mono t={t} size={13}>
                        ฿
                        {bundle.cost.toLocaleString("th-TH", {
                          maximumFractionDigits: 2,
                        })}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      {calcVirtualStock(bundle.sku).toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span style={{ color: bomItems.length ? c.pos : c.warn }}>
                        {bomItems.length ? "พร้อมใช้งาน" : "ยังไม่มีสูตร"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <Button
                        variant="ghost"
                        onClick={() => openEditor(bundle.sku)}
                      >
                        {bomItems.length ? "แก้ไขสูตร" : "สร้างสูตร"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      {editingSku && editingProduct && (
        <BomEditorModal
          bomSku={editingSku}
          bomProduct={editingProduct}
          products={products}
          bomRows={rows}
          setBomRows={setRows}
          onClose={() => setEditingSku(null)}
          onSave={save}
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[460px] bg-background">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              เพิ่ม BOM ใหม่
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              เลือก SKU ตัวแม่ที่ต้องการสร้างสูตร
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {availableParents.length > 0 ? (
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  SKU ตัวแม่
                </label>
                <select
                  value={selectedParentSku}
                  onChange={(event) => setSelectedParentSku(event.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {availableParents.map((product) => (
                    <option key={product.sku} value={product.sku}>
                      {product.sku} — {product.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-muted text-muted-foreground text-xs">
                {bundles.length === 0
                  ? "ยังไม่มี SKU ประเภท Bundle กรุณาสร้าง SKU ตัวแม่ก่อน"
                  : "SKU ตัวแม่ทุกตัวมี BOM แล้ว กรุณาใช้ปุ่ม “แก้ไขสูตร” ในตาราง"}
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              ยกเลิก
            </Button>
            {bundles.length === 0 && (
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/sku")}
              >
                ไปหน้า SKU
              </Button>
            )}
            <Button
              disabled={!selectedParentSku}
              onClick={() => {
                if (!selectedParentSku) return;
                setCreateOpen(false);
                openEditor(selectedParentSku);
              }}
              className="bg-[#0F6E58] text-white hover:bg-[#0F6E58]/90"
            >
              เพิ่มส่วนประกอบ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
