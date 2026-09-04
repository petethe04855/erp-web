"use client";

import { Mono, fmtBaht } from "@/components/ui";
import { useTheme } from "@/lib/design/ThemeContext";

type ChannelDatum = { name: string; rev: number; color: string };

export function ChannelDonut({
  t,
  data,
}: {
  t: ReturnType<typeof useTheme>["tokens"];
  data: ChannelDatum[];
}) {
  const c = t.color;
  const total = data.reduce((sum, item) => sum + item.rev, 0);
  let offset = 0;
  const segments = data.map((item) => {
    const length = total > 0 ? (item.rev / total) * 100 : 0;
    const segment = { ...item, length, offset };
    offset += length;
    return segment;
  });

  return (
    <div className="grid items-center gap-6 py-3 sm:grid-cols-[minmax(220px,0.9fr)_minmax(260px,1.1fr)]">
      <div className="relative mx-auto h-52 w-52">
        <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90" role="img" aria-label="สัดส่วนยอดขายแยกตามแพลตฟอร์ม">
          <circle cx="21" cy="21" r="15.9155" fill="none" stroke={c.subtle} strokeWidth="7" />
          {segments.map((item) => item.length > 0 && (
            <circle
              key={item.name}
              cx="21"
              cy="21"
              r="15.9155"
              fill="none"
              stroke={item.color}
              strokeWidth="7"
              strokeDasharray={`${item.length} ${100 - item.length}`}
              strokeDashoffset={-item.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] text-muted-foreground" style={{ color: c.ink3 }}>ยอดขายรวม</span>
          <Mono t={t} size={18} weight={700}>{fmtBaht(total)}</Mono>
        </div>
      </div>

      <div className="space-y-1">
        {segments.map((item) => (
          <div key={item.name} className="grid grid-cols-[12px_1fr_auto] items-center gap-3 border-b py-3 last:border-b-0" style={{ borderColor: c.border }}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
            <div>
              <div className="text-sm font-medium" style={{ color: c.ink }}>{item.name}</div>
              <div className="text-xs text-muted-foreground" style={{ color: c.ink3 }}>{item.length.toFixed(1)}%</div>
            </div>
            <Mono t={t} size={13} weight={600}>{fmtBaht(item.rev)}</Mono>
          </div>
        ))}
      </div>
    </div>
  );
}
