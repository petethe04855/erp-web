"use client";
import { Menu } from "lucide-react";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useAuthStore } from "@/stores/authStore";
export function Header() {
  const { toggleOpen } = useSidebarStore();
  const { user } = useAuthStore();
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-3">
        <button
          aria-label="เปิดเมนู"
          onClick={toggleOpen}
          className="lg:hidden"
        >
          <Menu size={18} />
        </button>
        <span className="text-xs tracking-widest text-neutral-500">
          OPERATIONS / CHAWY
        </span>
      </div>
      <span className="text-xs text-neutral-500">
        {user?.name} · {user?.role}
      </span>
    </header>
  );
}
