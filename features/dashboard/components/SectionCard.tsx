import React, { useId } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  /** Controls shown on the right of the header (toggles, links). */
  actions?: React.ReactNode;
  /** Drops the body padding, for tables that run edge to edge. */
  flush?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** A titled card that holds one chart or table. */
export function SectionCard({ title, description, icon: Icon, actions, flush, className, children }: SectionCardProps) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "min-w-0 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
        <div className="min-w-0">
          <h3 id={id} className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {Icon && <Icon className="h-4 w-4 text-neutral-500" aria-hidden />}
            {title}
          </h3>
          {description && <p className="mt-0.5 text-xs text-neutral-500">{description}</p>}
        </div>
        {actions}
      </header>
      <div className={flush ? undefined : "p-5"}>{children}</div>
    </section>
  );
}

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
}

/** A small single-choice button group (e.g. daily / weekly). */
export function SegmentedControl<T extends string>({ label, value, options, onChange }: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center gap-0.5 rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 dark:border-neutral-800 dark:bg-neutral-800/50"
    >
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.id)}
            className={cn(
              "cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
              on
                ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-neutral-100"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
