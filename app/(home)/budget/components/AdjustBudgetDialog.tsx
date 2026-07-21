"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { ExpenseCategory, ExpenseChannel } from "@/lib/store/erpWorkflow";

interface AdjustBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (category: ExpenseCategory, channel: ExpenseChannel, amount: number) => void;
}

const CATEGORIES: ExpenseCategory[] = ['ค่าโฆษณา', 'ค่าธรรมเนียมแพลตฟอร์ม', 'COGS/วัตถุดิบ', 'SG&A', 'ค่าขนส่ง', 'ค่าแรง', 'อื่นๆ'];
const CHANNELS: ExpenseChannel[] = ['TikTok', 'Shopee', 'LINE', 'Manual', 'ทั่วไป'];

export function AdjustBudgetDialog({
  open,
  onOpenChange,
  onSave,
}: AdjustBudgetDialogProps) {
  const [newBudget, setNewBudget] = useState({
    category: 'ค่าโฆษณา' as ExpenseCategory,
    channel: 'TikTok' as ExpenseChannel,
    amount: '',
  });

  function handleSave() {
    const amount = parseFloat(newBudget.amount);
    if (!amount || amount <= 0) return;
    onSave(newBudget.category, newBudget.channel, amount);
    setNewBudget({ category: 'ค่าโฆษณา', channel: 'TikTok', amount: '' });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[380px] p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-base font-bold text-foreground" style={{ color: 'var(--erp-ink)' }}>Adjust Budget</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: 'var(--erp-ink2)' }}>Category</Label>
            <NativeSelect value={newBudget.category} onChange={e => setNewBudget(b => ({ ...b, category: e.target.value as ExpenseCategory }))} className="w-full cursor-pointer">
              {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
            </NativeSelect>
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: 'var(--erp-ink2)' }}>Channel</Label>
            <NativeSelect value={newBudget.channel} onChange={e => setNewBudget(b => ({ ...b, channel: e.target.value as ExpenseChannel }))} className="w-full cursor-pointer">
              {CHANNELS.map(ch => <option key={ch}>{ch}</option>)}
            </NativeSelect>
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: 'var(--erp-ink2)' }}>Amount</Label>
            <Input value={newBudget.amount} onChange={e => setNewBudget(b => ({ ...b, amount: e.target.value }))} type="number" />
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-2 mt-5">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer border-border" style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)', color: '#374151' }}>Close</Button>
          <Button onClick={handleSave} className="bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none cursor-pointer">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
