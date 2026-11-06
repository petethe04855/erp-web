import type { ReactNode } from "react";
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-b border-neutral-200 pb-6 mb-6">
      <div>
        <p className="text-[10px] tracking-[0.24em] uppercase text-neutral-500 mb-3">
          Chawy · ERP workspace
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-neutral-500 mt-2 max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions}
    </header>
  );
}
