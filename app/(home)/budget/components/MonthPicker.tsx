"use client";

import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface MonthPickerProps {
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  nowKey: string;
  fmtMonth: (key: string) => string;
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function MonthPicker({
  selectedMonth,
  onSelectMonth,
  nowKey,
  fmtMonth,
}: MonthPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => parseInt(selectedMonth.split('-')[0]));

  return (
    <Popover open={showPicker} onOpenChange={setShowPicker}>
      <PopoverTrigger className="px-4 py-2 hover:bg-muted/50 rounded-md border border-border flex items-center gap-1.5 cursor-pointer text-xs font-semibold bg-card text-foreground" style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-surface)' }} onClick={() => setPickerYear(parseInt(selectedMonth.split('-')[0]))}>
        {fmtMonth(selectedMonth)} ▾
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[240px] p-4 bg-white dark:bg-zinc-950 border border-border rounded-lg shadow-lg">
        {/* Year navigation */}
        <div className="flex items-center justify-between mb-3.5">
          <button onClick={() => setPickerYear(y => y - 1)} className="w-7 h-7 border border-border rounded-md bg-canvas text-muted-foreground hover:bg-muted/50 flex items-center justify-center cursor-pointer text-sm" style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-subtle)' }}>‹</button>
          <span className="text-sm font-bold text-foreground" style={{ color: 'var(--erp-ink)' }}>{pickerYear}</span>
          <button onClick={() => setPickerYear(y => y + 1)} disabled={pickerYear >= parseInt(nowKey.split('-')[0])} className="w-7 h-7 border border-border rounded-md bg-canvas text-muted-foreground hover:bg-muted/50 flex items-center justify-center cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderColor: 'var(--erp-border)', background: 'var(--erp-subtle)' }}>›</button>
        </div>
        {/* Month grid 4×3 */}
        <div className="grid grid-cols-4 gap-1.5">
          {MONTH_NAMES.map((name, i) => {
            const key = `${pickerYear}-${String(i + 1).padStart(2, '0')}`;
            const isCurrent = key === selectedMonth;
            const isFuture = key > nowKey;
            return (
              <button key={key} disabled={isFuture} onClick={() => { onSelectMonth(key); setShowPicker(false); }} className={`
                py-1.5 border-none rounded-md text-xs cursor-pointer font-medium transition-all
                ${isCurrent ? 'bg-[var(--erp-accent)] text-white font-bold' : isFuture ? 'bg-transparent text-muted-foreground/30 cursor-not-allowed' : 'bg-canvas hover:bg-muted text-muted-foreground'}
              `} style={{ background: isCurrent ? 'var(--erp-accent)' : isFuture ? 'transparent' : 'var(--erp-subtle)' }}>{name}</button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
