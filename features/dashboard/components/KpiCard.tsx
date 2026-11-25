import React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: LucideIcon;
  /** Tailwind classes for the icon badge; neutral by default. */
  iconClassName?: string;
  loading?: boolean;
  /** Makes the whole card a link. */
  href?: string;
}

/** One headline figure: label and icon, the value, and a short note. */
export function KpiCard({ label, value, sub, icon: Icon, iconClassName, loading, href }: KpiCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-neutral-500">{label}</p>
        {Icon && (
          <span
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
              iconClassName,
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>
      <div className="mt-2 truncate text-2xl font-semibold tracking-tight tabular-nums text-neutral-900 dark:text-neutral-100">
        {loading ? <span className="inline-block h-7 w-28 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" /> : value}
      </div>
      {sub && <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-500">{sub}</p>}
    </>
  );

  const card = "block rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900";
  return href ? (
    <Link href={href} className={cn(card, "transition-shadow hover:shadow-md")}>
      {body}
    </Link>
  ) : (
    <div className={card}>{body}</div>
  );
}
