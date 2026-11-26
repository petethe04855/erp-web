"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useBoothAuthStore } from "@/stores/boothAuthStore";
import { useBoothFeedback } from "@/features/booth/components/BoothFeedback";
import { useStockOutSync } from "../hooks/useStockOutSync";
import { bangkokDay, pendingBySku } from "../lib/queue";
import { useStockOutStream } from "../hooks/useStockOutStream";
import {
  pollMs,
  useReviewBatchMutation,
  useStockOutBatchesQuery,
  useStockOutConfigQuery,
  useStockOutSummaryQuery,
  useVoidBatchMutation,
} from "../queries/stockoutQueries";
import type { StockOutBatch } from "../types/stockout";
import { CountView, displayBoxes } from "./CountView";
import { TodayView } from "./TodayView";
import { HistoryView } from "./HistoryView";
import { SettingsView } from "./SettingsView";
import b from "@/features/booth/components/booth.module.css";
import s from "./stockout.module.css";

type Tab = "count" | "today" | "history" | "settings";

const dayLabel = () =>
  new Date().toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok", weekday: "short", day: "numeric", month: "short" });

/** CHAWY daily stock-out count: count, today, history and (owner) settings. */
export function StockOutApp() {
  const user = useBoothAuthStore((st) => st.user);
  const logout = useBoothAuthStore((st) => st.logout);
  const client = useQueryClient();
  const role = (user?.role || "").toLowerCase();
  const isOwner = role === "owner";
  const [tab, setTab] = useState<Tab>("count");
  const today = bangkokDay(new Date());

  const streamLive = useStockOutStream(tab !== "settings");
  const poll = pollMs(streamLive);
  const configQ = useStockOutConfigQuery();
  const summaryQ = useStockOutSummaryQuery(today, tab === "count" || tab === "today" ? poll : false);
  const batchesQ = useStockOutBatchesQuery(today, tab === "today" ? poll : false);
  const sync = useStockOutSync();
  const voidM = useVoidBatchMutation();
  const reviewM = useReviewBatchMutation();
  const fb = useBoothFeedback();

  const pending = useMemo(() => pendingBySku(sync.queue, today), [sync.queue, today]);
  const boxes = useMemo(() => displayBoxes(summaryQ.data, pending), [summaryQ.data, pending]);
  const canVoidOlder = isOwner || !!configQ.data?.config.voidRoles.includes(role);

  const signOut = () => {
    client.clear();
    logout();
  };

  const onSave = (lines: { skuId: number; qty: number }[], label: string) => {
    const clientId = sync.save(lines);
    fb.show({
      tone: "ok",
      message: `บันทึกออกแล้ว ${label}`,
      action: {
        label: "ยกเลิกรอบนี้",
        run: () =>
          sync.undo(clientId).then(
            () => fb.show({ tone: "info", message: "ยกเลิกรอบนี้แล้ว คืนของเข้า LOT เดิม" }),
            (e) => fb.show({ tone: "error", message: e instanceof Error ? e.message : "ยกเลิกไม่สำเร็จ" }),
          ),
      },
    });
  };

  const onVoid = (batch: StockOutBatch) =>
    fb.ask(`ยกเลิกรอบ ${batch.batchNo} (${batch.totalQty} รายการ) ? ของจะคืนเข้า LOT เดิม`, async () => {
      try {
        await voidM.mutateAsync(batch.id);
        fb.show({ tone: "info", message: `ยกเลิก ${batch.batchNo} แล้ว` });
      } catch (e) {
        fb.show({ tone: "error", message: e instanceof Error ? e.message : "ยกเลิกไม่สำเร็จ" });
      }
    }, "ยกเลิกรอบ");

  const onReview = async (batch: StockOutBatch, note: string) => {
    try {
      await reviewM.mutateAsync({ id: batch.id, note });
      fb.show({ tone: "ok", message: `ตรวจ ${batch.batchNo} แล้ว` });
    } catch (e) {
      fb.show({ tone: "error", message: e instanceof Error ? e.message : "บันทึกไม่สำเร็จ" });
    }
  };

  const syncBadge =
    sync.status === "offline" || (summaryQ.isError && !summaryQ.data)
      ? { text: `ออฟไลน์ · เก็บในเครื่องก่อน${sync.unsent ? ` (${sync.unsent} รอบยังไม่ส่ง)` : ""}`, cls: s.syncOffline }
      : sync.unsent
        ? { text: `กำลังส่ง ${sync.unsent} รอบ…`, cls: "" }
        : { text: streamLive ? "ซิงค์แล้ว · สด" : "ซิงค์แล้ว", cls: s.syncOk };

  const tabs: { id: Tab; label: string }[] = [
    { id: "count", label: "นับออก" },
    { id: "today", label: summaryQ.data?.pendingReview ? `วันนี้ (${summaryQ.data.pendingReview})` : "วันนี้" },
    { id: "history", label: "ย้อนหลัง" },
    ...(isOwner ? [{ id: "settings" as Tab, label: "ตั้งค่า" }] : []),
  ];

  let body: React.ReactNode;
  if (configQ.isLoading || (summaryQ.isLoading && !summaryQ.data)) {
    body = <div className={`${b.panel} ${b.empty}`}>กำลังโหลด…</div>;
  } else if (!configQ.data) {
    body = (
      <div className={`${b.panel} ${b.errorBox}`}>
        โหลดตั้งค่าไม่ได้: {configQ.error instanceof Error ? configQ.error.message : "ไม่ทราบสาเหตุ"}{" "}
        <button type="button" className={b.smallBtn} onClick={() => configQ.refetch()}>ลองใหม่</button>
      </div>
    );
  } else if (tab === "today") {
    body = <TodayView boxes={boxes} batches={batchesQ.data ?? []} isOwner={isOwner} canVoid={canVoidOlder} onVoid={onVoid} onReview={onReview} />;
  } else if (tab === "history") {
    body = <HistoryView boxes={configQ.data.config.boxes} />;
  } else if (tab === "settings" && isOwner) {
    body = (
      <SettingsView
        key={configQ.data.updatedAt ?? "new"}
        view={configQ.data}
        onSaved={(m) => fb.show({ tone: "ok", message: m })}
        onError={(m) => fb.show({ tone: "error", message: m })}
      />
    );
  } else {
    body = <CountView boxes={boxes} onSave={onSave} failed={sync.failed} onDiscard={sync.discard} />;
  }

  return (
    <div className={b.pos}>
      <header className={b.topbar}>
        <h1 className={b.brand}>นับของออก · {dayLabel()}</h1>
        <nav className={b.tabs} aria-label="เมนูนับของออก">
          {tabs.map((t) => (
            <button key={t.id} type="button" className={b.tab} aria-current={tab === t.id} onClick={() => { fb.hide(); setTab(t.id); }}>
              {t.label}
            </button>
          ))}
        </nav>
        <div className={b.barUser}>
          <span className={`${b.status} ${syncBadge.cls}`} role="status">{syncBadge.text}</span>
          <span>{user?.name || user?.email}</span>
          {isOwner && <Link href="/dashboard" className={b.barBtn}>ไป ERP</Link>}
          <button type="button" className={b.barBtn} onClick={signOut}>ออกจากระบบ</button>
        </div>
      </header>
      {!sync.storageOk && <div className={b.notice}>เครื่องนี้เก็บข้อมูลในเครื่องไม่ได้ (อาจเปิดโหมดส่วนตัว) ถ้าเน็ตหลุด รอบที่บันทึกอาจหาย</div>}
      <main className={b.main}>{body}</main>
      {fb.node}
    </div>
  );
}
