"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShoppingCart,
  Receipt,
  FileText,
  Users,
  UserCog,
  ShoppingBag,
  Calculator,
  Settings,
  BarChart3,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Store,
  Truck,
  BookOpen,
  PieChart,
  Video,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "ภาพรวม",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "สินค้าและคลัง",
    items: [
      { label: "สินค้า (Products)", href: "/products", icon: Package },
      { label: "SKU Master", href: "/sku", icon: Layers },
      { label: "สต็อกคงคลัง (Inventory)", href: "/inventory", icon: Boxes },
      {
        label: "รับสินค้า (Goods Receive)",
        href: "/goods-receive",
        icon: ArrowDownToLine,
        roles: ["owner", "warehouse"],
      },
      {
        label: "เบิกสินค้า (Goods Issue)",
        href: "/goods-issue",
        icon: ArrowUpFromLine,
        roles: ["owner", "warehouse"],
      },
    ],
  },
  {
    title: "การขายและลูกค้า",
    items: [
      { label: "คำสั่งซื้อ (Orders)", href: "/orders", icon: ShoppingCart, roles: ["owner", "sales", "accountant"] },
      { label: "ใบแจ้งหนี้ (Invoices)", href: "/invoices", icon: Receipt, roles: ["owner", "accountant", "sales"] },
      { label: "ใบเสนอราคา (Quotation)", href: "/quotation", icon: FileText, roles: ["owner", "sales"] },
      { label: "ลูกค้า (Customers)", href: "/customers", icon: Users, roles: ["owner", "sales"] },
    ],
  },
  {
    title: "การจัดซื้อ",
    items: [
      {
        label: "สั่งซื้อ (Purchase Order)",
        href: "/purchase-order",
        icon: Truck,
        roles: ["owner", "warehouse", "accountant"],
      },
    ],
  },
  {
    title: "TikTok Shop",
    items: [
      { label: "TikTok Orders", href: "/tiktok-orders", icon: Store, roles: ["owner", "sales", "warehouse"] },
      { label: "Live & Content", href: "/tiktok-live", icon: Video, roles: ["owner", "sales", "warehouse"] },
      { label: "Fee Calculator", href: "/tiktok-calculator", icon: Calculator, roles: ["owner", "sales", "accountant"] },
      { label: "TikTok Setup", href: "/tiktok-setup", icon: Settings, roles: ["owner"] },
    ],
  },
  {
    title: "การเงินและบัญชี",
    items: [
      { label: "สมุดรายวัน (Journal)", href: "/finance/journal", icon: BookOpen, roles: ["owner", "accountant"] },
      { label: "ค่าใช้จ่าย (Expenses)", href: "/finance/expenses", icon: Receipt, roles: ["owner", "accountant"] },
      { label: "รายงานการเงิน (Reports)", href: "/finance/reports", icon: PieChart, roles: ["owner", "accountant"] },
    ],
  },
  {
    title: "รายงานและระบบ",
    items: [
      { label: "รายงานเดิม (Legacy Reports)", href: "/reports", icon: BarChart3, roles: ["owner", "accountant"] },
      { label: "จัดการผู้ใช้งาน (Users)", href: "/users", icon: UserCog, roles: ["owner"] },
      { label: "ตั้งค่าระบบ (Settings)", href: "/settings", icon: Settings, roles: ["owner"] },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, setOpen, isCollapsed, toggleCollapse } = useSidebarStore();
  const { user, logout } = useAuthStore();

  const isCurrent = (href: string) => {
    if (href === "/dashboard")
      return pathname === "/dashboard" || pathname === "/";
    return pathname.startsWith(href);
  };

  const content = (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      {/* Brand Header */}
      <div>
        <div
          className={cn(
            "flex h-16 items-center border-b border-neutral-200 bg-white transition-all",
            isCollapsed ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          {isCollapsed ? (
            /* Collapsed: Centered Brand Icon that toggles expansion on click */
            <button
              onClick={toggleCollapse}
              className="group flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white font-bold text-sm tracking-wider hover:bg-neutral-800 transition-colors shadow-sm"
              title="ขยายเมนู (คลิกเพื่อขยาย)"
            >
              <span className="group-hover:hidden">C</span>
              <ChevronRight size={18} className="hidden group-hover:block" />
            </button>
          ) : (
            /* Expanded: Brand Logo + Titles on left, Collapse button on right */
            <>
              <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white font-bold text-sm tracking-wider">
                  C
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-bold tracking-tight text-neutral-900 block leading-none truncate">
                    CHAWY ERP
                  </span>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-widest mt-0.5 block truncate">
                    Workspace v2
                  </span>
                </div>
              </Link>

              {/* Desktop collapse toggle */}
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                title="ย่อเมนู"
              >
                <ChevronLeft size={16} />
              </button>
            </>
          )}

          {/* Mobile close button */}
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden h-8 w-8 shrink-0 flex items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav list */}
        <nav className="space-y-4 px-3 py-3 overflow-y-auto max-h-[calc(100vh-8.5rem)]">
          {NAV_SECTIONS.map((section) => {
            const userRole = (user?.role || "sales").toLowerCase();
            const visibleItems = section.items.filter((item) => {
              if (!item.roles || item.roles.length === 0) return true;
              return item.roles.includes(userRole);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-0.5">
                {!isCollapsed && (
                  <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {section.title}
                  </div>
                )}
                {visibleItems.map((item) => {
                  const active = isCurrent(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                        active
                          ? "bg-neutral-900 text-white shadow-sm"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                        isCollapsed && "justify-center px-2",
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        size={16}
                        className={cn(
                          "shrink-0",
                          active ? "text-white" : "text-neutral-500",
                        )}
                      />
                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="border-t border-neutral-200 p-3 bg-white">
        <div
          className={cn(
            "flex items-center justify-between rounded-lg p-2 hover:bg-neutral-50",
            isCollapsed && "flex-col gap-2",
          )}
        >
          {!isCollapsed && (
            <div className="flex-1 min-w-0 pr-2 overflow-hidden">
              <div className="truncate text-xs font-semibold text-neutral-900 leading-tight">
                {user?.name || "ผู้ใช้งานระบบ"}
              </div>
              <div className="truncate text-[10px] text-neutral-400 leading-tight mt-0.5">
                {user?.email || ""}
              </div>
            </div>
          )}
          <button
            onClick={() => logout()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="ออกจากระบบ"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 border-r border-neutral-200 bg-white transition-all duration-300 shrink-0",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-neutral-200 transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {content}
      </aside>
    </>
  );
}
