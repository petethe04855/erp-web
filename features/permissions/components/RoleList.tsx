import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_CONFIG } from "@/features/users/types/user";
import type { ConfigurableRole, PageAccess } from "../types/permission";

interface RoleListProps {
  roles: ConfigurableRole[];
  selected: ConfigurableRole | null;
  totalPages: number;
  permissionsByRole: Record<string, Record<string, PageAccess>>;
  onSelect: (role: ConfigurableRole) => void;
}

export function RoleList({
  roles,
  selected,
  totalPages,
  permissionsByRole,
  onSelect,
}: RoleListProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="px-2 pb-2 text-[11px] font-semibold text-neutral-500">
        เลือกบทบาท (Role)
      </div>
      <ul className="space-y-1">
        {roles.map((role) => {
          const cfg = ROLE_CONFIG[role];
          const viewable = Object.values(permissionsByRole[role] ?? {}).filter(
            (a) => a.view,
          ).length;
          const active = role === selected;
          return (
            <li key={role}>
              <button
                type="button"
                onClick={() => onSelect(role)}
                aria-pressed={active}
                className={cn(
                  "w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                  active
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-700 hover:bg-neutral-100",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">
                    {cfg?.label ?? role}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-[11px] tabular-nums",
                      active ? "text-neutral-300" : "text-neutral-400",
                    )}
                  >
                    {viewable}/{totalPages} หน้า
                  </span>
                </div>
                {cfg?.desc && (
                  <p
                    className={cn(
                      "mt-0.5 line-clamp-2 text-[11px]",
                      active ? "text-neutral-300" : "text-neutral-500",
                    )}
                  >
                    {cfg.desc}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-[11px] text-amber-800">
        <Crown className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Owner มีสิทธิ์ทุกหน้าเสมอและแก้ไขไม่ได้ หน้าจัดการผู้ใช้ ตั้งค่าระบบ
          TikTok Setup และหน้านี้ เข้าได้เฉพาะ Owner
        </span>
      </div>
    </div>
  );
}
