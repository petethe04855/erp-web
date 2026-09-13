"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit2, Trash2, Boxes } from "lucide-react";
import type { InventoryFormula } from "../types/formula";

interface InventoryDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formula: InventoryFormula | null;
  onEdit: (formula: InventoryFormula) => void;
  onToggleStatus: (formula: InventoryFormula) => void;
  onDelete: (formula: InventoryFormula) => void;
  isToggling?: boolean;
}

export function InventoryDetailModal({
  open,
  onOpenChange,
  formula,
  onEdit,
  onToggleStatus,
  onDelete,
  isToggling,
}: InventoryDetailModalProps) {
  if (!formula) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[85vh] overflow-y-auto max-w-2xl"
        onClose={() => onOpenChange(false)}
      >
        <DialogHeader>
          <div className="flex items-start justify-between border-b pb-3 dark:border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="font-mono text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {formula.code}
                </DialogTitle>
                <Badge
                  variant={formula.isActive ? "default" : "secondary"}
                  className={`text-[10px] px-2 py-0.5 ${
                    formula.isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                  }`}
                >
                  {formula.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                </Badge>
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium mt-1">
                {formula.name}
              </p>
              {formula.description && (
                <DialogDescription className="text-xs text-neutral-400 mt-0.5">
                  {formula.description}
                </DialogDescription>
              )}
            </div>

            <div className="flex items-center gap-1.5 mr-6">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(formula);
                }}
              >
                <Edit2 className="h-3.5 w-3.5" />
                แก้ไข
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                onClick={() => {
                  onOpenChange(false);
                  onDelete(formula);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Available Sets & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                  พร้อมจัดส่ง (Available Sets)
                </span>
                <p className="text-[10px] text-indigo-700/70 dark:text-indigo-300/70">
                  คำนวณจากสต็อกต่ำสุดของวัตถุดิบ
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {formula.availableSets ?? 0}
                </span>
                <span className="text-xs text-indigo-600 ml-1">ชุด</span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-3.5 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  สถานะเปิด/ปิด
                </span>
                <p className="text-[10px] text-neutral-400">
                  {formula.isActive ? "ใช้งานตัดสต็อกตามปกติ" : "ปิดการใช้งานชั่วคราว"}
                </p>
              </div>
              <Switch
                checked={formula.isActive}
                disabled={isToggling}
                onCheckedChange={() => onToggleStatus(formula)}
              />
            </div>
          </div>

          {/* Components Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Boxes className="h-4 w-4 text-indigo-600" />
                วัตถุดิบที่เป็นส่วนประกอบ ({formula.items?.length || 0} รายการ)
              </span>
            </div>

            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
              {formula.items && formula.items.length > 0 ? (
                formula.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 flex items-center justify-between text-xs hover:bg-neutral-50/50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                        {item.componentSku}
                      </span>
                      {item.componentName && (
                        <p className="text-[11px] text-neutral-500">{item.componentName}</p>
                      )}
                      {item.availableQty !== undefined && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          สต็อกปัจจุบันในคลัง: {item.availableQty.toLocaleString("th-TH")}{" "}
                          {item.unit || "ชิ้น"}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="font-mono text-xs px-2.5 py-0.5">
                        ตัด {item.qty} {item.unit || "ชิ้น"} / ชุด
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-neutral-400">
                  ไม่มีรายการวัตถุดิบในสูตรนี้
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              ปิด
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
