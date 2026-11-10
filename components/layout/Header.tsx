"use client";
import Link from "next/link";
import { Menu, KeyRound } from "lucide-react";
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
      <div className="flex items-center gap-4">
        <Link
          href="/change-password"
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800"
        >
          <KeyRound size={14} />
          รีเซ็ตรหัสผ่าน
        </Link>
        <span className="text-xs text-neutral-500">
          {user?.name} · {user?.role}
        </span>
      </div>
    </header>
  );
}
