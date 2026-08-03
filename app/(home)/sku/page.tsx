"use client";
import { useTheme } from "@/lib/design/ThemeContext";
import { TopBar, StockBadge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useState } from "react";
import { useErpStore } from "@/lib/store/useErpStore";
import type { Product, CreateProductInput } from "@/lib/store/erpWorkflow";

// Import Sub-Components
import SkuStats from "./components/SkuStats";
import SkuFilters from "./components/SkuFilters";
import SkuFormModal from "./components/SkuFormModal";
import SkuViewModal from "./components/SkuViewModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

const EMPTY_FORM: CreateProductInput = {
  sku: "",
  name: "",
  type: "Finished Product",
  barcode: "",
  weightGrams: 0,
  retailPrice: 0,
  wholesalePrice: 0,
  cost: 0,
  stock: 0,
  reorder: 0,
  isBundle: false,
  note: "",
  baseUnit: "piece",
};

function formatBaht(n: number | undefined | null) {
  const val = Number(n) || 0;
  return "฿" + val.toLocaleString("th-TH");
}

type ModalMode = "add" | "edit" | "view" | null;

export default function SkuPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const products = useErpStore((s) => s.products);
  const addProduct = useErpStore((s) => s.addProduct);
  const updateProduct = useErpStore((s) => s.updateProduct);
  const deleteProduct = useErpStore((s) => s.deleteProduct);

  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("active");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [form, setForm] = useState<CreateProductInput>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filtered list
  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.sku.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.barcode.includes(q);
    const matchActive =
      filterActive === "all" ||
      (filterActive === "active" ? p.isActive : !p.isActive);
    return matchSearch && matchActive;
  });

  // Stats
  const active = products.filter((p) => p.isActive);
  const outStock = active.filter((p) => !p.isBundle && p.stock === 0);

  // Handlers
  function openAdd() {
    setForm({ ...EMPTY_FORM });
    setError("");
    setModalMode("add");
  }

  function openEdit(p: Product) {
    setSelected(p);
    setForm({
      sku: p.sku,
      name: p.name,
      type: p.type,
      barcode: p.barcode,
      weightGrams: p.weightGrams,
      retailPrice: p.retailPrice,
      wholesalePrice: p.wholesalePrice,
      cost: p.cost,
      stock: p.stock,
      reorder: p.reorder,
      isBundle: p.isBundle,
      note: p.note,
      baseUnit: p.baseUnit ?? "piece",
    });
    setError("");
    setModalMode("edit");
  }

  function openView(p: Product) {
    setSelected(p);
    setModalMode("view");
  }

  function closeModal() {
    setModalMode(null);
    setSelected(null);
    setError("");
  }

  function handleSave() {
    if (!form.sku.trim()) {
      setError("กรุณากรอก SKU");
      return;
    }
    if (!form.name.trim()) {
      setError("กรุณากรอกชื่อสินค้า");
      return;
    }
    if (form.retailPrice <= 0) {
      setError("ราคาขายต้องมากกว่า 0");
      return;
    }
    try {
      if (modalMode === "add") {
        addProduct({
          ...form,
          type: "Finished Product",
          cost: 0,
          stock: Math.max(0, Math.floor(Number(form.stock) || 0)),
          isBundle: false,
          baseUnit: "piece",
        });
      } else if (modalMode === "edit" && selected) {
        updateProduct({
          sku: selected.sku,
          newSku: form.sku.trim().toUpperCase(),
          name: form.name,
          barcode: form.barcode,
          retailPrice: form.retailPrice,
          wholesalePrice: form.retailPrice,
          price: form.retailPrice,
          stock: Math.max(0, Math.floor(Number(form.stock) || 0)),
          isBundle: false,
          note: form.note,
        });
      }
      closeModal();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    }
  }

  function handleToggleActive(p: Product) {
    updateProduct({ sku: p.sku, isActive: !p.isActive });
  }

  function handleDelete(sku: string) {
    deleteProduct(sku);
    setDeleteConfirm(null);
  }

  return (
    <div className="min-h-screen bg-canvas" style={{ background: c.canvas }}>
      <TopBar
        t={t}
        title="SKU Master"
        subtitle="จัดการข้อมูลสินค้า (Master Data)"
      />
      <div className="px-8 py-6">
        <div className="flex justify-end mb-6">
          <Button
            onClick={openAdd}
            className="bg-[var(--erp-accent)] text-white gap-1.5 h-9 px-4 text-xs font-semibold rounded-lg shadow-none cursor-pointer"
          >
            + เพิ่มสินค้า
          </Button>
        </div>

        {/* Stats */}
        <SkuStats activeCount={active.length} outStockCount={outStock.length} />

        {/* Filters */}
        <SkuFilters
          search={search}
          setSearch={setSearch}
          filterActive={filterActive}
          setFilterActive={setFilterActive}
        />

        {/* Table */}
        <div
          className="bg-card rounded-lg border border-border overflow-hidden"
          style={{
            background: "var(--erp-surface)",
            borderColor: "var(--erp-border)",
          }}
        >
          <Table className="w-full border-collapse">
            <TableHeader
              className="bg-muted/50 border-b border-border"
              style={{
                background: "var(--erp-subtle)",
                borderColor: "var(--erp-border)",
              }}
            >
              <TableRow>
                {[
                  "SKU",
                  "ชื่อสินค้า",
                  "ราคาขาย",
                  "คงเหลือ (Stock)",
                  "สถานะ",
                  "",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className="p-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="p-10 text-center text-muted-foreground text-sm"
                  >
                    ไม่พบสินค้า
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((p) => (
                <TableRow
                  key={p.sku}
                  className="hover:bg-muted/30 border-b border-border"
                  style={{
                    borderColor: "var(--erp-subtle)",
                    opacity: p.isActive ? 1 : 0.5,
                  }}
                >
                  <TableCell className="p-3">
                    <span
                      className="font-mono text-xs font-bold text-[var(--erp-accent)] cursor-pointer"
                      onClick={() => openView(p)}
                    >
                      {p.sku}
                    </span>
                  </TableCell>
                  <TableCell className="p-3">
                    <div
                      className="text-sm font-semibold text-foreground"
                      style={{ color: "var(--erp-ink)" }}
                    >
                      {p.name}
                    </div>
                    {p.barcode && (
                      <div
                        className="text-xs text-muted-foreground"
                        style={{ color: "var(--erp-ink3)" }}
                      >
                        {p.barcode}
                      </div>
                    )}
                  </TableCell>
                  <TableCell
                    className="p-3 text-sm font-medium text-foreground"
                    style={{ color: "var(--erp-ink)" }}
                  >
                    {formatBaht(p.retailPrice)}
                  </TableCell>
                  <TableCell className="p-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-sm font-semibold text-foreground"
                        style={{ color: "var(--erp-ink)" }}
                      >
                        {p.stock.toLocaleString()}
                      </span>
                      <StockBadge
                        stock={p.stock}
                        reorder={0}
                        isBundle={p.isBundle}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="p-3">
                    <button
                      onClick={() => handleToggleActive(p)}
                      className={`
                      px-2.5 py-1 rounded-full border text-[11px] font-semibold cursor-pointer transition-colors
                      ${
                        p.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : "border-border bg-muted text-muted-foreground"
                      }
                    `}
                      style={
                        !p.isActive
                          ? {
                              borderColor: "var(--erp-border)",
                              background: "var(--erp-subtle)",
                              color: "#9CA3AF",
                            }
                          : undefined
                      }
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </button>
                  </TableCell>
                  <TableCell className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      <Button
                        onClick={() => openEdit(p)}
                        variant="outline"
                        size="xs"
                        className="cursor-pointer border-border"
                        style={{
                          borderColor: "var(--erp-border)",
                          background: "var(--erp-surface)",
                          color: "#374151",
                        }}
                      >
                        แก้ไข
                      </Button>
                      <Button
                        onClick={() => setDeleteConfirm(p.sku)}
                        variant="destructive"
                        size="xs"
                        className="cursor-pointer bg-[#FFF5F5] border-[#FEE2E2] hover:bg-destructive/10 text-destructive border"
                        style={{ borderColor: "#FEE2E2" }}
                      >
                        ลบ
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div
          className="mt-2 text-xs text-muted-foreground"
          style={{ color: "var(--erp-ink3)" }}
        >
          แสดง {filtered.length} จาก {products.length} รายการ
        </div>

        {/* Modals */}
        {(modalMode === "add" || modalMode === "edit") && (
          <SkuFormModal
            modalMode={modalMode}
            selectedSku={selected?.sku}
            form={form}
            setForm={setForm}
            error={error}
            onClose={closeModal}
            onSave={handleSave}
          />
        )}

        {modalMode === "view" && selected && (
          <SkuViewModal
            selected={selected}
            onClose={closeModal}
            onEdit={() => {
              closeModal();
              openEdit(selected);
            }}
          />
        )}

        {deleteConfirm && (
          <DeleteConfirmModal
            sku={deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            onConfirm={() => handleDelete(deleteConfirm)}
          />
        )}
      </div>
    </div>
  );
}
