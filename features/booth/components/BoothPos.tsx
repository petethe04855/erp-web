"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useBoothAuthStore } from "@/stores/boothAuthStore";
import { useBoothCatalogQuery, useBoothSalesQuery, useVoidBoothSaleMutation } from "../queries/boothQueries";
import { useBoothSell } from "../hooks/useBoothSell";
import { baht } from "../lib/pricing";
import type { BoothSale } from "../types/booth";
import { BoothSell } from "./BoothSell";
import { BoothSummary } from "./BoothSummary";
import { BoothSettings } from "./BoothSettings";
import { useBoothFeedback } from "./BoothFeedback";
import s from "./booth.module.css";

type Tab = "sell" | "summary" | "settings";

const bangkokToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

/** The booth sell screen: sell, today's summary and (owner) settings. */
export function BoothPos() {
  const user = useBoothAuthStore((st) => st.user);
  const logout = useBoothAuthStore((st) => st.logout);
  const client = useQueryClient();
  const role = (user?.role || "").toLowerCase();
  const isOwner = role === "owner";
  const signOut = () => {
    client.clear();
    logout();
  };
  const [tab, setTab] = useState<Tab>("sell");
  const [date, setDate] = useState(bangkokToday);
  const today = bangkokToday();

  const catalogQ = useBoothCatalogQuery();
  const salesQ = useBoothSalesQuery(tab === "sell" ? today : date);
  const todaySales = useBoothSalesQuery(today);
  const voidM = useVoidBoothSaleMutation();
  const sell = useBoothSell(catalogQ.data);
  const fb = useBoothFeedback();

  const voidSale = async (sale: BoothSale) => {
    try {
      await voidM.mutateAsync({ id: sale.id });
      fb.show({ tone: "info", message: `ยกเลิกบิล ${sale.saleNo} แล้ว คืนสต็อกเข้า Inventory` });
    } catch (e) {
      fb.show({ tone: "error", message: e instanceof Error ? e.message : "ยกเลิกบิลไม่สำเร็จ" });
    }
  };
  const askVoid = (sale: BoothSale) =>
    fb.ask(`ยกเลิกบิล ${sale.saleNo} ยอด ${baht(sale.total)} ? ของจะคืนเข้าสต็อก`, () => voidSale(sale), "ยกเลิกบิล");

  const onSell = async () => {
    try {
      const sale = await sell.sell();
      if (!sale) return;
      const change = sale.paymentMethod === "cash" && sale.change > 0 ? ` · ทอน ${baht(sale.change)}` : "";
      fb.show({
        tone: "ok",
        message: `บันทึกบิลแล้ว ${baht(sale.total)}${change}`,
        action: { label: "ยกเลิกบิลนี้", run: () => voidSale(sale) },
      });
    } catch (e) {
      catalogQ.refetch();
      fb.show({ tone: "error", message: e instanceof Error ? e.message : "บันทึกบิลไม่สำเร็จ" });
    }
  };

  const liveToday = (todaySales.data ?? []).filter((b) => b.status !== "voided");
  const lastSale = liveToday[liveToday.length - 1];

  const status = catalogQ.isError
    ? { text: "เชื่อมต่อ ERP ไม่ได้", cls: s.statusWarn }
    : catalogQ.isFetching
      ? { text: "กำลังโหลดสต็อก…", cls: "" }
      : { text: "ตัดสต็อกจาก Inventory", cls: s.statusOk };

  const tabs: { id: Tab; label: string }[] = [
    { id: "sell", label: "ขาย" },
    { id: "summary", label: "สรุป" },
    ...(isOwner ? [{ id: "settings" as Tab, label: "ตั้งค่า" }] : []),
  ];

  let body: React.ReactNode;
  if (catalogQ.isLoading) {
    body = <div className={`${s.panel} ${s.empty}`}>กำลังโหลดสินค้า…</div>;
  } else if (!catalogQ.data) {
    body = (
      <div className={`${s.panel} ${s.errorBox}`}>
        โหลดสินค้าบูธไม่ได้: {catalogQ.error instanceof Error ? catalogQ.error.message : "ไม่ทราบสาเหตุ"}{" "}
        <button type="button" className={s.smallBtn} onClick={() => catalogQ.refetch()}>ลองใหม่</button>
      </div>
    );
  } else if (tab === "summary") {
    body = (
      <BoothSummary
        catalog={catalogQ.data}
        date={date}
        onDateChange={setDate}
        onToday={() => setDate(today)}
        sales={salesQ.data ?? []}
        isLoading={salesQ.isLoading}
        error={salesQ.error instanceof Error ? salesQ.error.message : undefined}
        onVoid={askVoid}
      />
    );
  } else if (tab === "settings" && isOwner) {
    body = (
      <BoothSettings
        key={catalogQ.data.updatedAt ?? "new"}
        catalog={catalogQ.data}
        onSaved={(m) => fb.show({ tone: "ok", message: m })}
        onError={(m) => fb.show({ tone: "error", message: m })}
      />
    );
  } else {
    body = (
      <BoothSell
        catalog={catalogQ.data}
        sell={sell}
        onSell={onSell}
        canUndoLast={!!lastSale && !voidM.isPending}
        onUndoLast={() => lastSale && fb.ask(`ยกเลิกบิลล่าสุด ${lastSale.saleNo} ยอด ${baht(lastSale.total)} ?`, () => voidSale(lastSale), "ยกเลิกบิล")}
      />
    );
  }

  return (
    <div className={s.pos}>
      <header className={s.topbar}>
        <h1 className={s.brand}>CHAWY <span>บูธ</span></h1>
        <span className={`${s.status} ${status.cls}`} role="status">{status.text}</span>
        <nav className={s.tabs} aria-label="เมนูบูธ">
          {tabs.map((t) => (
            <button key={t.id} type="button" className={s.tab} aria-current={tab === t.id} onClick={() => { fb.hide(); setTab(t.id); }}>
              {t.label}
            </button>
          ))}
        </nav>
        <div className={s.barUser}>
          <span>{user?.name || user?.email}</span>
          {isOwner && <Link href="/dashboard" className={s.barBtn}>ไป ERP</Link>}
          <button type="button" className={s.barBtn} onClick={signOut}>ออกจากระบบ</button>
        </div>
      </header>
      <main className={s.main}>{body}</main>
      {fb.node}
    </div>
  );
}
