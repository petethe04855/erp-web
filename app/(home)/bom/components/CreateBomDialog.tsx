"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface CreateBomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (bom: {
    code: string;
    name: string;
    outputQty: number;
    outputUnit: string;
    status: string;
    effectiveDate: string;
    cost: number;
  }) => Promise<void>;
  showToast: (msg: string) => void;
}

export function CreateBomDialog({
  open,
  onOpenChange,
  onCreate,
  showToast,
}: CreateBomDialogProps) {
  const [newBom, setNewBom] = useState<{
    code: string;
    name: string;
    outputQty: number | "";
    outputUnit: string;
    status: string;
    effectiveDate: string;
    cost: number;
  }>({
    code: "",
    name: "",
    outputQty: 1,
    outputUnit: "ชิ้น",
    status: "Draft",
    effectiveDate: "",
    cost: 0,
  });

  const [saving, setSaving] = useState(false);

  async function handleCreateBOM() {
    if (!newBom.code || !newBom.name) {
      showToast("กรุณากรอกรหัสสูตร (Code) และชื่อสูตรให้ครบถ้วน");
      return;
    }
    if (newBom.outputQty === "" || Number(newBom.outputQty) <= 0) {
      showToast("กรุณากรอกปริมาณผลผลิต (Output Qty) ให้มากกว่า 0");
      return;
    }
    setSaving(true);
    try {
      await onCreate({
        ...newBom,
        outputQty: Number(newBom.outputQty),
      });
      onOpenChange(false);
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
      // Error handled by parent or custom toast
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[440px] p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-base font-bold text-foreground" style={{ color: 'var(--erp-ink)' }}>สร้างสูตรการผลิตใหม่ (New BOM)</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: 'var(--erp-ink2)' }}>
              รหัสสูตร (BOM Code) *
            </Label>
            <Input
              type="text"
              placeholder="เช่น BOM-001"
              value={newBom.code}
              onChange={(e) =>
                setNewBom({ ...newBom, code: e.target.value })
              }
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: 'var(--erp-ink2)' }}>
              ชื่อสูตรการผลิต (BOM Name) *
            </Label>
            <Input
              type="text"
              placeholder="เช่น สูตรอาหารแมวไก่ 1 กก."
              value={newBom.name}
              onChange={(e) =>
                setNewBom({ ...newBom, name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: 'var(--erp-ink2)' }}>
                ปริมาณผลผลิต (Output Qty)
              </Label>
              <Input
                type="number"
                min={0}
                value={newBom.outputQty}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewBom({
                    ...newBom,
                    outputQty: val === "" ? "" : Number(val),
                  });
                }}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: 'var(--erp-ink2)' }}>
                หน่วยผลผลิต (Unit)
              </Label>
              <Input
                type="text"
                placeholder="ชิ้น, กล่อง, กก."
                value={newBom.outputUnit}
                onChange={(e) =>
                  setNewBom({ ...newBom, outputUnit: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: 'var(--erp-ink2)' }}>
                ต้นทุนอ้างอิง (บาท)
              </Label>
              <Input
                type="number"
                min={0}
                disabled
                value={newBom.cost}
                onChange={(e) =>
                  setNewBom({
                    ...newBom,
                    cost: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: 'var(--erp-ink2)' }}>
                สถานะ (Status)
              </Label>
              <NativeSelect
                value={newBom.status}
                disabled
                className="w-full"
              >
                <option value="Draft">Draft</option>
              </NativeSelect>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-2 mt-5">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer border-border"
            style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)', color: '#374151' }}
          >
            ยกเลิก
          </Button>
          <Button onClick={handleCreateBOM} disabled={saving} className="bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none cursor-pointer">
            สร้างสูตร BOM
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
