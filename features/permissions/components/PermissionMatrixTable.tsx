import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  PERMISSION_ACTIONS,
  type PageAccess,
  type PermissionAction,
  type PermissionPage,
} from "../types/permission";

interface PermissionMatrixTableProps {
  pages: PermissionPage[];
  accessOf: (pageKey: string) => PageAccess;
  onToggle: (page: PermissionPage, action: PermissionAction, value: boolean) => void;
  onSetColumn: (action: PermissionAction, value: boolean) => void;
  onSetRow: (page: PermissionPage, value: boolean) => void;
  disabled?: boolean;
}

function Check({
  checked,
  indeterminate,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      title={label}
      checked={checked}
      disabled={disabled}
      ref={(el) => {
        if (el) el.indeterminate = !!indeterminate && !checked;
      }}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-neutral-900 disabled:cursor-not-allowed"
    />
  );
}

export function PermissionMatrixTable({
  pages,
  accessOf,
  onToggle,
  onSetColumn,
  onSetRow,
  disabled,
}: PermissionMatrixTableProps) {
  const groups = useMemo(() => {
    const out: { name: string; pages: PermissionPage[] }[] = [];
    for (const page of pages) {
      const last = out[out.length - 1];
      if (last && last.name === page.group) last.pages.push(page);
      else out.push({ name: page.group, pages: [page] });
    }
    return out;
  }, [pages]);

  const columnState = (action: PermissionAction) => {
    const supported = pages.filter((p) => p.actions.includes(action));
    const on = supported.filter((p) => accessOf(p.key)[action]).length;
    return {
      all: supported.length > 0 && on === supported.length,
      some: on > 0,
    };
  };

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-600">
              <th className="px-4 py-3 text-left font-semibold">หน้า</th>
              {PERMISSION_ACTIONS.map(({ key, label }) => {
                const s = columnState(key);
                return (
                  <th key={key} className="w-24 px-2 py-3 text-center font-semibold">
                    <div className="flex flex-col items-center gap-1.5">
                      <span>{label}</span>
                      <Check
                        checked={s.all}
                        indeterminate={s.some}
                        disabled={disabled}
                        label={`${label} ทุกหน้า`}
                        onChange={(v) => onSetColumn(key, v)}
                      />
                    </div>
                  </th>
                );
              })}
              <th className="w-20 px-2 py-3 text-center font-semibold">ทั้งหมด</th>
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody key={group.name}>
              <tr>
                <td
                  colSpan={PERMISSION_ACTIONS.length + 2}
                  className="bg-neutral-50/60 px-4 pb-1.5 pt-4 text-[11px] font-semibold text-neutral-500"
                >
                  {group.name}
                </td>
              </tr>
              {group.pages.map((page) => {
                const access = accessOf(page.key);
                const supported = PERMISSION_ACTIONS.filter((a) =>
                  page.actions.includes(a.key),
                );
                const onCount = supported.filter((a) => access[a.key]).length;
                return (
                  <tr
                    key={page.key}
                    className={cn(
                      "border-t border-neutral-100",
                      !access.view && "bg-neutral-50/40",
                    )}
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-neutral-900">{page.label}</div>
                      <div className="text-[11px] text-neutral-400">{page.path}</div>
                    </td>
                    {PERMISSION_ACTIONS.map(({ key, label }) => (
                      <td key={key} className="px-2 py-2.5 text-center">
                        {page.actions.includes(key) ? (
                          <Check
                            checked={access[key]}
                            disabled={disabled}
                            label={`${label}: ${page.label}`}
                            onChange={(v) => onToggle(page, key, v)}
                          />
                        ) : (
                          <span className="text-neutral-300" aria-label="ไม่มีในหน้านี้">
                            —
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-2 py-2.5 text-center">
                      <Check
                        checked={onCount === supported.length}
                        indeterminate={onCount > 0}
                        disabled={disabled}
                        label={`ทุกสิทธิ์: ${page.label}`}
                        onChange={(v) => onSetRow(page, v)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}
