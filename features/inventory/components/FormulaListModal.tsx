"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  X,
  Search,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Boxes,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { formulaApi } from "../api/formulaApi";
import type { InventoryFormula } from "../types/formula";
import { FormulaFormModal } from "./FormulaFormModal";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormulaListModal({ open, onOpenChange }: Props) {
  const [formulas, setFormulas] = useState<InventoryFormula[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<InventoryFormula | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<InventoryFormula | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchFormulas = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await formulaApi.getFormulas(search);
      setFormulas(data || []);
      // If one was selected, refresh its details
      if (selectedFormula) {
        const found = data.find((f) => f.id === selectedFormula.id);
        setSelectedFormula(found || null);
      }
    } catch (err) {
      console.error("Failed to load formulas:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedFormula]);

  useEffect(() => {
    if (open) {
      fetchFormulas();
    }
  }, [open, fetchFormulas]);

  const handleToggle = async (formula: InventoryFormula) => {
    try {
      setTogglingId(formula.id);
      const updated = await formulaApi.toggleStatus(formula.code, !formula.isActive);
      setFormulas((prev) =>
        prev.map((f) => (f.id === formula.id ? { ...f, isActive: updated.isActive } : f)),
      );
      if (selectedFormula?.id === formula.id) {
        setSelectedFormula((prev) => (prev ? { ...prev, isActive: updated.isActive } : null));
      }
    } catch (err: unknown) {
      alert("เปลี่ยนสถานะไม่สำเร็จ: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (formula: InventoryFormula) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสูตรตัดสต็อก ${formula.code}?`)) return;
    try {
      setDeletingId(formula.id);
      await formulaApi.deleteFormula(formula.code);
      setFormulas((prev) => prev.filter((f) => f.id !== formula.id));
      if (selectedFormula?.id === formula.id) {
        setSelectedFormula(null);
      }
    } catch (err: unknown) {
      alert("ลบสูตรไม่สำเร็จ: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setDeletingId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative flex flex-col h-[85vh] w-full max-w-5xl rounded-2xl bg-white shadow-2xl dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                สูตรตัดสต็อก (Inventory Formula)
                <Badge variant="outline" className="text-xs font-normal">
                  {formulas.length} รายการ
                </Badge>
              </h2>
              <p className="text-xs text-neutral-500">
                จัดการสูตรระเบิด SKU สำหรับชุดสินค้า / เซ็ตสินค้า เมื่อมีออเดอร์จัดส่ง
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => {
                setEditingFormula(null);
                setIsFormOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              สร้างสูตรใหม่
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-neutral-400 hover:text-neutral-600"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="ค้นหารหัสสูตร หรือชื่อสูตร..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1.5"
            onClick={fetchFormulas}
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>
        </div>

        {/* Two-Pane Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Formula List */}
          <div className="w-1/2 border-r border-neutral-100 dark:border-neutral-800 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
            {isLoading && formulas.length === 0 ? (
              <div className="flex items-center justify-center p-12 text-xs text-neutral-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                กำลังโหลดสูตรตัดสต็อก...
              </div>
            ) : formulas.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Boxes className="h-10 w-10 text-neutral-300 mb-2" />
                <p className="text-xs text-neutral-500 font-medium">ยังไม่มีสูตรตัดสต็อก</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  คลิก &quot;สร้างสูตรใหม่&quot; เพื่อผูกชุดสินค้ากับ SKU ส่วนประกอบ
                </p>
              </div>
            ) : (
              formulas.map((f) => {
                const isSelected = selectedFormula?.id === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFormula(f)}
                    className={`p-4 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-indigo-50/60 dark:bg-indigo-950/30 border-l-4 border-indigo-600"
                        : "hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50"
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-neutral-900 dark:text-neutral-100">
                          {f.code}
                        </span>
                        <Badge
                          variant={f.isActive ? "default" : "secondary"}
                          className={`text-[10px] px-1.5 py-0 ${
                            f.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {f.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium truncate">
                        {f.name}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-neutral-400 pt-0.5">
                        <span>{f.items?.length || 0} ส่วนประกอบ</span>
                        <span>•</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                          พร้อมจัด: {f.availableSets ?? 0} ชุด
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-neutral-300 flex-shrink-0" />
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Selected Formula Detail */}
          <div className="w-1/2 overflow-y-auto p-6 bg-neutral-50/30 dark:bg-neutral-900/30">
            {selectedFormula ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between border-b pb-4 dark:border-neutral-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold font-mono text-neutral-900 dark:text-neutral-100">
                        {selectedFormula.code}
                      </h3>
                      <Badge
                        variant={selectedFormula.isActive ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {selectedFormula.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                      {selectedFormula.name}
                    </p>
                    {selectedFormula.description && (
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {selectedFormula.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={() => {
                        setEditingFormula(selectedFormula);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      แก้ไข
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deletingId === selectedFormula.id}
                      className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => handleDelete(selectedFormula)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Available Sets Card */}
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                      จำนวนชุดพร้อมจัดส่ง (Available Sets)
                    </span>
                    <p className="text-[11px] text-indigo-700/70 dark:text-indigo-300/70">
                      คำนวณจากสต็อกต่ำสุดของชิ้นส่วนประกอบ
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {selectedFormula.availableSets ?? 0}
                    </span>
                    <span className="text-xs text-indigo-600 ml-1">ชุด</span>
                  </div>
                </div>

                {/* Status Toggle Card */}
                <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-3.5 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                      สถานะการทำงานของสูตร
                    </span>
                    <p className="text-[11px] text-neutral-400">
                      หากปิดใช้งาน ระบบจะไม่ตัดสต็อกตามสูตรนี้เมื่อมีออเดอร์
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {togglingId === selectedFormula.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                    ) : (
                      <Switch
                        checked={selectedFormula.isActive}
                        onCheckedChange={() => handleToggle(selectedFormula)}
                      />
                    )}
                  </div>
                </div>

                {/* Components Detail List */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                    ส่วนประกอบ ({selectedFormula.items?.length || 0} รายการ)
                  </span>

                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                    {selectedFormula.items?.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-3 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                            {item.componentSku}
                          </span>
                          {item.componentName && (
                            <p className="text-[11px] text-neutral-500">
                              {item.componentName}
                            </p>
                          )}
                          {item.availableQty !== undefined && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              สต็อกปัจจุบัน: {item.availableQty} {item.unit || "piece"}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {item.qty} {item.unit || "ชิ้น"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <AlertCircle className="h-10 w-10 text-neutral-300 mb-2" />
                <p className="text-xs font-medium text-neutral-500">
                  เลือกสูตรตัดสต็อกทางซ้ายเพื่อดูรายละเอียด
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  หรือคลิก &quot;สร้างสูตรใหม่&quot; เพื่อเพิ่มสูตร
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit Form Modal */}
      <FormulaFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingFormula}
        onSaved={fetchFormulas}
      />
    </div>
  );
}
