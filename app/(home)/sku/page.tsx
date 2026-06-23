"use client";
import { useTheme } from "@/lib/design/ThemeContext";
import { TopBar, CategoryBadge, StockBadge } from "@/components/ui";
import { useState } from "react";
import { useErpStore } from "@/lib/store/useErpStore";
import type {
  Product,
  ProductCategory,
  CreateProductInput,
  UpdateProductInput,
} from "@/lib/store/erpWorkflow";

// Import Sub-Components
import SkuStats from "./components/SkuStats";
import SkuFilters from "./components/SkuFilters";
import SkuFormModal from "./components/SkuFormModal";
import SkuViewModal from "./components/SkuViewModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

const EMPTY_FORM: CreateProductInput = {
  sku: "",
  name: "",
  type: "Cat",
  barcode: "",
  weightGrams: 0,
  retailPrice: 0,
  wholesalePrice: 0,
  cost: 0,
  reorder: 0,
  isBundle: false,
  note: "",
  baseUnit: "piece",
};

function formatBaht(n: number) {
  return "฿" + n.toLocaleString("th-TH");
}

type ModalMode = "add" | "edit" | "view" | null;

export default function SkuPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const products = useErpStore((s) => s.products);
  const bundleComponents = useErpStore((s) => s.bundleComponents);
  const addProduct = useErpStore((s) => s.addProduct);
  const updateProduct = useErpStore((s) => s.updateProduct);
  const deleteProduct = useErpStore((s) => s.deleteProduct);
  const calcBundleVirtualStock = useErpStore((s) => s.calcBundleVirtualStock);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<ProductCategory | "All">("All");
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
    const matchType = filterType === "All" || p.type === filterType;
    const matchActive =
      filterActive === "all" ||
      (filterActive === "active" ? p.isActive : !p.isActive);
    return matchSearch && matchType && matchActive;
  });

  // Stats
  const active = products.filter((p) => p.isActive);
  const lowStock = active.filter(
    (p) => !p.isBundle && p.stock > 0 && p.stock < p.reorder,
  );
  const outStock = active.filter((p) => !p.isBundle && p.stock === 0);
  const bundles = active.filter((p) => p.isBundle);

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
    if (form.cost <= 0) {
      setError("ต้นทุนต้องมากกว่า 0");
      return;
    }
    if (!form.weightGrams || form.weightGrams <= 0) {
      setError("น้ำหนักสินค้าต้องมากกว่า 0");
      return;
    }
    try {
      if (modalMode === "add") {
        addProduct({ ...form, isBundle: form.type === "Bundle" });
      } else if (modalMode === "edit" && selected) {
        const input: UpdateProductInput = {
          sku: selected.sku,
          name: form.name,
          type: form.type,
          barcode: form.barcode,
          weightGrams: form.weightGrams,
          retailPrice: form.retailPrice,
          wholesalePrice: form.wholesalePrice,
          price: form.retailPrice,
          cost: form.cost,
          reorder: form.reorder,
          isBundle: form.type === "Bundle",
          note: form.note,
          baseUnit: form.baseUnit,
        };
        updateProduct(input);
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
    <div style={{ minHeight: "100vh", background: c.canvas }}>
      <TopBar t={t} title="SKU Master" subtitle="ข้อมูลสินค้า" />
      <div style={{ padding: "24px 32px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--erp-ink)",
                margin: 0,
              }}
            >
              SKU Master
            </h1>
            <p style={{ fontSize: 13, color: "var(--erp-ink3)", marginTop: 4 }}>
              จัดการข้อมูลสินค้า (Master Data)
            </p>
          </div>
          <button
            onClick={openAdd}
            style={{
              background: "var(--erp-accent)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            + เพิ่มสินค้า
          </button>
        </div>

        {/* Stats */}
        <SkuStats
          activeCount={active.length}
          lowStockCount={lowStock.length}
          outStockCount={outStock.length}
          bundleCount={bundles.length}
        />

        {/* Filters */}
        <SkuFilters
          search={search}
          setSearch={setSearch}
          filterType={filterType}
          setFilterType={setFilterType}
          filterActive={filterActive}
          setFilterActive={setFilterActive}
        />

        {/* Table */}
        <div
          style={{
            background: "var(--erp-surface)",
            borderRadius: 10,
            border: "1px solid var(--erp-border)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "var(--erp-subtle)",
                  borderBottom: "1px solid var(--erp-border)",
                }}
              >
                {[
                  "SKU",
                  "ชื่อสินค้า",
                  "ประเภท",
                  "ต้นทุน",
                  "ราคาขาย B2C",
                  "ราคา B2B",
                  "น้ำหนัก",
                  "สต็อก",
                  "Reorder",
                  "สถานะ",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--erp-ink3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
                    style={{
                      padding: 40,
                      textAlign: "center",
                      color: "#9CA3AF",
                      fontSize: 14,
                    }}
                  >
                    ไม่พบสินค้า
                  </td>
                </tr>
              )}
              {filtered.map((p, i) => (
                <tr
                  key={p.sku}
                  style={{
                    borderBottom:
                      i < filtered.length - 1
                        ? "1px solid var(--erp-subtle)"
                        : "none",
                    opacity: p.isActive ? 1 : 0.5,
                  }}
                >
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--erp-accent)",
                        cursor: "pointer",
                      }}
                      onClick={() => openView(p)}
                    >
                      {p.sku}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--erp-ink)",
                      }}
                    >
                      {p.name}
                    </div>
                    {p.barcode && (
                      <div style={{ fontSize: 11, color: "var(--erp-ink3)" }}>
                        {p.barcode}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <CategoryBadge type={p.type} />
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "var(--erp-ink)",
                    }}
                  >
                    {formatBaht(p.cost)}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#059669",
                    }}
                  >
                    {formatBaht(p.retailPrice)}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "var(--erp-ink3)",
                    }}
                  >
                    {formatBaht(p.wholesalePrice)}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 12,
                      color: "var(--erp-ink3)",
                    }}
                  >
                    {p.weightGrams > 0 ? `${p.weightGrams}g` : "-"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--erp-ink)",
                        }}
                      >
                        {p.isBundle
                          ? calcBundleVirtualStock(p.sku)
                          : p.stock.toLocaleString()}
                      </span>
                      <StockBadge
                        stock={
                          p.isBundle ? calcBundleVirtualStock(p.sku) : p.stock
                        }
                        reorder={p.reorder}
                        isBundle={p.isBundle}
                      />
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontSize: 13,
                      color: "var(--erp-ink3)",
                    }}
                  >
                    {p.reorder || "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <button
                      onClick={() => handleToggleActive(p)}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 20,
                        border: "1px solid",
                        borderColor: p.isActive
                          ? "#D1FAE5"
                          : "var(--erp-border)",
                        background: p.isActive
                          ? "#D1FAE5"
                          : "var(--erp-subtle)",
                        color: p.isActive ? "#059669" : "#9CA3AF",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      <button
                        onClick={() => openEdit(p)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 6,
                          border: "1px solid var(--erp-border)",
                          background: "var(--erp-surface)",
                          color: "#374151",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p.sku)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 6,
                          border: "1px solid #FEE2E2",
                          background: "#FFF5F5",
                          color: "#EF4444",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--erp-ink3)" }}>
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
            bundleComponents={bundleComponents}
            products={products}
            calcBundleVirtualStock={calcBundleVirtualStock}
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
