"use client";

import { useCallback, useEffect, useState } from "react";
import { TopBar, fmtBaht } from "@/components/ui";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTheme } from "@/lib/design/ThemeContext";
import { readApiResponse } from "@/lib/apiResponse";

type Summary = { revenue: number; salesRevenue: number; salesReturns: number; cogs: number; grossProfit: number; damageLoss: number; operatingExpenses: number; netProfit: number };
type TrialRow = { AccountCode: string; AccountName: string; AccountType: string; OpeningDebit: number; OpeningCredit: number; Debit: number; Credit: number; EndingBalance: number; BalanceSide: string };
type Trial = { rows: TrialRow[]; totalDebit: number; totalCredit: number; openingDebit: number; openingCredit: number; endingDebit: number; endingCredit: number; balanced: boolean };
type ValuationRow = { SKU: string; ProductName: string; Lot: string; ExpiryDate: string; RemainingQty: number; UnitCost: number; Value: number };
type Valuation = { rows: ValuationRow[]; totalQty: number; totalValue: number };
type LedgerRow = { Date: string; JournalCode: string; SourceType: string; SourceRef: string; AccountCode: string; AccountName: string; Description: string; SKU?: string; Lot?: string; Channel?: string; Debit: number; Credit: number; RunningBalance: number };

export default function ReportsPage() {
  const { tokens: t } = useTheme();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [valuation, setValuation] = useState<Valuation | null>(null);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [accountFilter, setAccountFilter] = useState("");
  const [skuFilter, setSkuFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [error, setError] = useState("");
  const [exportingPdf, setExportingPdf] = useState<"trial" | "valuation" | "ledger" | null>(null);

  const load = useCallback(async () => {
    setError("");
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const token = localStorage.getItem("chawy_token") || "";
    const headers = { Authorization: token ? `Bearer ${token}` : "" };
    try {
      const range = from || to ? `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}` : `month=${month}`;
      const [summaryRes, trialRes, valuationRes, ledgerRes] = await Promise.all([
        fetch(`${api}/api/reports/financial-summary?${range}`, { headers }),
        fetch(`${api}/api/reports/trial-balance?${range}`, { headers }),
        fetch(`${api}/api/reports/inventory-valuation`, { headers }),
        fetch(`${api}/api/reports/general-ledger?${range}`, { headers }),
      ]);
      const [summaryData, trialData, valuationData, ledgerData] = await Promise.all([
        readApiResponse<Summary>(summaryRes), readApiResponse<Trial>(trialRes),
        readApiResponse<Valuation>(valuationRes), readApiResponse<LedgerRow[]>(ledgerRes),
      ]);
      setSummary(summaryData); setTrial(trialData); setValuation(valuationData); setLedger(ledgerData);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "โหลดรายงานไม่สำเร็จ"); }
  }, [month, from, to]);

  useEffect(() => { load(); }, [load]);
  const cards = [
    ["รายได้สุทธิ", summary?.revenue], ["ต้นทุนขาย", summary?.cogs], ["กำไรขั้นต้น", summary?.grossProfit],
    ["ค่าใช้จ่ายดำเนินงาน", summary?.operatingExpenses], ["กำไรสุทธิ", summary?.netProfit], ["มูลค่า Stock ปัจจุบัน", valuation?.totalValue],
  ] as const;
  const filteredLedger = ledger.filter((row) => (!accountFilter || row.AccountCode.toLowerCase().includes(accountFilter.toLowerCase())) && (!skuFilter || row.SKU?.toLowerCase().includes(skuFilter.toLowerCase())) && (!channelFilter || row.Channel?.toLowerCase().includes(channelFilter.toLowerCase())));
  const reportPeriod = from || to ? `${from || "เริ่มต้น"} ถึง ${to || "ปัจจุบัน"}` : month;
  const pdfMoney = (value: number) => value
    ? value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "-";

  const download = (name: string, rows: unknown[]) => {
    const csv = rows.length ? Object.keys(rows[0] as object).join(",") + "\n" + rows.map((row) => Object.values(row as object).map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n") : "";
    const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url);
  };

  const exportTablePdf = async ({
    kind, title, filename, columns, rows, totalRow, rowsPerPage = 18,
  }: {
    kind: "trial" | "valuation" | "ledger";
    title: string;
    filename: string;
    columns: { label: string; width: string; align?: "left" | "right" }[];
    rows: string[][];
    totalRow?: string[];
    rowsPerPage?: number;
  }) => {
    if (rows.length === 0) {
      setError(`ไม่มีข้อมูล ${title} สำหรับ Export PDF`);
      return;
    }
    setExportingPdf(kind);
    setError("");
    const totalPages = Math.ceil(rows.length / rowsPerPage);
    const report = document.createElement("div");
    report.setAttribute("aria-hidden", "true");
    report.style.cssText = "position:fixed;left:0;top:0;z-index:2147483647;width:1120px;background:#fff;color:#111827;pointer-events:none;font-family:Arial,'Noto Sans Thai',sans-serif;";
    const pages: HTMLDivElement[] = [];
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
      const page = document.createElement("div");
      page.style.cssText = "box-sizing:border-box;width:1120px;min-height:760px;background:#fff;padding:20px;";
      const table = document.createElement("table");
      table.style.cssText = "width:100%;border-collapse:collapse;font-size:11px;table-layout:fixed;";
      const caption = document.createElement("caption");
      caption.textContent = `${title}  |  หน้า ${pageIndex + 1}/${totalPages}`;
      caption.style.cssText = "caption-side:top;text-align:left;font-size:18px;font-weight:700;padding:0 0 12px;";
      table.appendChild(caption);

      const head = document.createElement("thead");
      const headRow = document.createElement("tr");
      for (const column of columns) {
        const cell = document.createElement("th");
        cell.textContent = column.label;
        cell.style.cssText = `width:${column.width};border:1px solid #9ca3af;background:#e5e7eb;padding:7px;text-align:${column.align || "left"};font-weight:700;`;
        headRow.appendChild(cell);
      }
      head.appendChild(headRow);
      table.appendChild(head);

      const body = document.createElement("tbody");
      const pageRows = rows.slice(pageIndex * rowsPerPage, (pageIndex + 1) * rowsPerPage);
      for (const row of pageRows) {
        const tr = document.createElement("tr");
        row.forEach((value, index) => {
          const cell = document.createElement("td");
          cell.textContent = value;
          cell.style.cssText = `border:1px solid #d1d5db;padding:6px;white-space:pre-line;vertical-align:top;text-align:${columns[index]?.align || "left"};word-break:break-word;`;
          tr.appendChild(cell);
        });
        body.appendChild(tr);
      }
      if (pageIndex === totalPages - 1 && totalRow) {
        const tr = document.createElement("tr");
        totalRow.forEach((value, index) => {
          const cell = document.createElement("td");
          cell.textContent = value;
          cell.style.cssText = `border:1px solid #9ca3af;background:#f3f4f6;padding:7px;font-weight:700;text-align:${columns[index]?.align || "left"};`;
          tr.appendChild(cell);
        });
        body.appendChild(tr);
      }
      table.appendChild(body);
      page.appendChild(table);
      report.appendChild(page);
      pages.push(page);
    }
    document.body.appendChild(report);

    try {
      await document.fonts.ready;
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
        const canvas = await html2canvas(pages[pageIndex], {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });
        if (pageIndex > 0) pdf.addPage();
        const maxWidth = 281;
        const maxHeight = 194;
        const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
        const width = canvas.width * scale;
        const height = canvas.height * scale;
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.96), "JPEG", 8, 8, width, height);
      }
      pdf.save(filename);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Export PDF ไม่สำเร็จ");
    } finally {
      report.remove();
      setExportingPdf(null);
    }
  };

  const exportTrialPdf = () => exportTablePdf({
    kind: "trial",
    title: `Trial Balance - ${reportPeriod}`,
    filename: `trial-balance-${reportPeriod.replaceAll(" ", "-")}.pdf`,
    columns: [
      { label: "บัญชี", width: "34%" },
      { label: "ประเภท", width: "16%" },
      { label: "เดบิต", width: "16%", align: "right" },
      { label: "เครดิต", width: "16%", align: "right" },
      { label: "ยอดคงเหลือ", width: "18%", align: "right" },
    ],
    rows: (trial?.rows || []).map((row) => [
      `${row.AccountCode} ${row.AccountName}`,
      row.AccountType,
      pdfMoney(row.Debit),
      pdfMoney(row.Credit),
      `${pdfMoney(row.EndingBalance)} ${row.BalanceSide === "Debit" ? "Dr" : "Cr"}`,
    ]),
    totalRow: ["รวม", "", pdfMoney(trial?.totalDebit || 0), pdfMoney(trial?.totalCredit || 0), ""],
  });

  const exportValuationPdf = () => exportTablePdf({
    kind: "valuation",
    title: "Inventory Valuation",
    filename: "inventory-valuation.pdf",
    columns: [
      { label: "SKU / Product", width: "30%" },
      { label: "Lot", width: "22%" },
      { label: "หมดอายุ", width: "14%" },
      { label: "จำนวน", width: "10%", align: "right" },
      { label: "ต้นทุน/ชิ้น", width: "12%", align: "right" },
      { label: "มูลค่า", width: "12%", align: "right" },
    ],
    rows: (valuation?.rows || []).map((row) => [
      `${row.SKU}\n${row.ProductName}`,
      row.Lot,
      row.ExpiryDate || "-",
      row.RemainingQty.toLocaleString("th-TH"),
      pdfMoney(row.UnitCost),
      pdfMoney(row.Value),
    ]),
    totalRow: ["รวม", "", "", (valuation?.totalQty || 0).toLocaleString("th-TH"), "", pdfMoney(valuation?.totalValue || 0)],
  });

  const exportLedgerPdf = () => exportTablePdf({
    kind: "ledger",
    title: `General Ledger - ${reportPeriod}`,
    filename: `general-ledger-${reportPeriod.replaceAll(" ", "-")}.pdf`,
    columns: [
      { label: "วันที่ / Journal", width: "17%" },
      { label: "เอกสารต้นทาง", width: "18%" },
      { label: "บัญชี", width: "39%" },
      { label: "เดบิต", width: "13%", align: "right" },
      { label: "เครดิต", width: "13%", align: "right" },
    ],
    rows: filteredLedger.map((row) => [
      `${row.Date}\n${row.JournalCode}`,
      `${row.SourceRef}\n${row.SourceType}`,
      `${row.AccountCode} ${row.AccountName}${row.Description ? `\n${row.Description}` : ""}`,
      pdfMoney(row.Debit),
      pdfMoney(row.Credit),
    ]),
    totalRow: [
      "รวม", "", "",
      pdfMoney(filteredLedger.reduce((sum, row) => sum + row.Debit, 0)),
      pdfMoney(filteredLedger.reduce((sum, row) => sum + row.Credit, 0)),
    ],
  });
  return <div style={{ minHeight: "100vh", background: t.color.canvas }}>
    <TopBar t={t} title="Ledger Reports" subtitle="รายงานจาก Journal และ Stock Lot จริง" breadcrumb={["Chawy", "Finance", "Reports"]} right={<div className="flex items-center gap-2"><Input type="month" value={month} onChange={(event) => { setMonth(event.target.value); setFrom(""); setTo(""); }} className="w-40" /><Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="w-36" /><Input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="w-36" /></div>} />
    <div className="space-y-5 p-4 md:p-8">
      {error && <Card className="border-red-200 p-4 text-red-600">{error}</Card>}
      <Card className="flex flex-wrap items-end gap-3 p-4"><label className="text-xs">Account<input className="mt-1 block h-9 rounded border px-2 text-sm" value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)} placeholder="เช่น 1100" /></label><label className="text-xs">SKU<input className="mt-1 block h-9 rounded border px-2 text-sm" value={skuFilter} onChange={(e) => setSkuFilter(e.target.value)} placeholder="ค้นหา SKU" /></label><label className="text-xs">Channel<input className="mt-1 block h-9 rounded border px-2 text-sm" value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} placeholder="เช่น TikTok" /></label><button className="h-9 rounded border px-3 text-sm" onClick={() => { setAccountFilter(""); setSkuFilter(""); setChannelFilter(""); }}>ล้างตัวกรอง</button><button className="h-9 rounded bg-emerald-700 px-3 text-sm text-white" onClick={() => download("general-ledger.csv", filteredLedger)}>Export CSV</button></Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([label, value]) => <Card key={label} className="p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-2xl font-bold">{fmtBaht(value ?? 0)}</div></Card>)}</div>

      <Card className="overflow-hidden"><div className="flex items-center justify-between border-b p-4"><div className="font-semibold">Trial Balance · {month}</div><div className="flex items-center gap-2"><Badge variant="secondary">{trial?.balanced ? "Balanced" : "Not balanced"}</Badge><button className="h-8 rounded border px-3 text-xs disabled:opacity-50" disabled={exportingPdf !== null} onClick={exportTrialPdf}>{exportingPdf === "trial" ? "กำลังสร้าง PDF..." : "Export PDF"}</button></div></div>
        <Table><TableHeader><TableRow><TableHead>บัญชี</TableHead><TableHead>ประเภท</TableHead><TableHead className="text-right">เดบิต</TableHead><TableHead className="text-right">เครดิต</TableHead><TableHead className="text-right">ยอดคงเหลือ</TableHead></TableRow></TableHeader><TableBody>
          {trial?.rows.map((row) => <TableRow key={row.AccountCode}><TableCell><span className="font-mono">{row.AccountCode}</span> {row.AccountName}</TableCell><TableCell>{row.AccountType || "ไม่พบใน Account Master"}</TableCell><TableCell className="text-right font-mono">{fmtBaht(Math.abs(row.OpeningDebit - row.OpeningCredit))}</TableCell><TableCell className="text-right font-mono">{fmtBaht(row.Debit)}</TableCell><TableCell className="text-right font-mono">{fmtBaht(row.Credit)}</TableCell><TableCell className="text-right font-mono">{fmtBaht(row.EndingBalance)} {row.BalanceSide === "Debit" ? "Dr" : "Cr"}</TableCell></TableRow>)}
          <TableRow className="font-bold"><TableCell colSpan={2}>รวม</TableCell><TableCell className="text-right">{fmtBaht(trial?.totalDebit ?? 0)}</TableCell><TableCell className="text-right">{fmtBaht(trial?.totalCredit ?? 0)}</TableCell><TableCell /></TableRow>
        </TableBody></Table></Card>

      <Card className="overflow-hidden"><div className="flex items-center justify-between border-b p-4"><div className="font-semibold">Inventory Valuation · {valuation?.totalQty ?? 0} ชิ้น</div><button className="h-8 rounded border px-3 text-xs disabled:opacity-50" disabled={exportingPdf !== null} onClick={exportValuationPdf}>{exportingPdf === "valuation" ? "กำลังสร้าง PDF..." : "Export PDF"}</button></div><Table><TableHeader><TableRow><TableHead>SKU / Product</TableHead><TableHead>Lot</TableHead><TableHead>หมดอายุ</TableHead><TableHead className="text-right">จำนวน</TableHead><TableHead className="text-right">ต้นทุน/ชิ้น</TableHead><TableHead className="text-right">มูลค่า</TableHead></TableRow></TableHeader><TableBody>{valuation?.rows.map((row) => <TableRow key={`${row.SKU}-${row.Lot}`}><TableCell><div className="font-mono text-xs">{row.SKU}</div>{row.ProductName}</TableCell><TableCell className="font-mono">{row.Lot}</TableCell><TableCell>{row.ExpiryDate || "–"}</TableCell><TableCell className="text-right">{row.RemainingQty}</TableCell><TableCell className="text-right">{fmtBaht(row.UnitCost)}</TableCell><TableCell className="text-right font-semibold">{fmtBaht(row.Value)}</TableCell></TableRow>)}</TableBody></Table></Card>

      <Card className="overflow-hidden"><div className="flex items-center justify-between border-b p-4"><div className="font-semibold">General Ledger · {month}</div><button className="h-8 rounded border px-3 text-xs disabled:opacity-50" disabled={exportingPdf !== null} onClick={exportLedgerPdf}>{exportingPdf === "ledger" ? "กำลังสร้าง PDF..." : "Export PDF"}</button></div><Table><TableHeader><TableRow><TableHead>วันที่ / Journal</TableHead><TableHead>เอกสารต้นทาง</TableHead><TableHead>บัญชี</TableHead><TableHead className="text-right">เดบิต</TableHead><TableHead className="text-right">เครดิต</TableHead></TableRow></TableHeader><TableBody>{ledger.map((row, index) => <TableRow key={`${row.JournalCode}-${index}`}><TableCell>{row.Date}<div className="font-mono text-xs">{row.JournalCode}</div></TableCell><TableCell>{row.SourceRef}<div className="text-xs text-muted-foreground">{row.SourceType}</div></TableCell><TableCell><span className="font-mono text-xs">{row.AccountCode}</span> {row.AccountName}</TableCell><TableCell className="text-right font-mono">{row.Debit ? fmtBaht(row.Debit) : "–"}</TableCell><TableCell className="text-right font-mono">{row.Credit ? fmtBaht(row.Credit) : "–"}</TableCell></TableRow>)}</TableBody></Table></Card>
    </div>
  </div>;
}
