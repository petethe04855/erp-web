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
type TrialRow = { AccountCode: string; AccountName: string; AccountType: string; Debit: number; Credit: number; Balance: number; BalanceSide: string };
type Trial = { rows: TrialRow[]; totalDebit: number; totalCredit: number; balanced: boolean };
type ValuationRow = { SKU: string; ProductName: string; Lot: string; ExpiryDate: string; RemainingQty: number; UnitCost: number; Value: number };
type Valuation = { rows: ValuationRow[]; totalQty: number; totalValue: number };
type LedgerRow = { Date: string; JournalCode: string; SourceType: string; SourceRef: string; AccountCode: string; AccountName: string; Description: string; Debit: number; Credit: number };

export default function ReportsPage() {
  const { tokens: t } = useTheme();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState<Summary | null>(null);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [valuation, setValuation] = useState<Valuation | null>(null);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const token = localStorage.getItem("chawy_token") || "";
    const headers = { Authorization: token ? `Bearer ${token}` : "" };
    try {
      const [summaryRes, trialRes, valuationRes, ledgerRes] = await Promise.all([
        fetch(`${api}/api/reports/financial-summary?month=${month}`, { headers }),
        fetch(`${api}/api/reports/trial-balance?month=${month}`, { headers }),
        fetch(`${api}/api/reports/inventory-valuation`, { headers }),
        fetch(`${api}/api/reports/general-ledger?month=${month}`, { headers }),
      ]);
      const [summaryData, trialData, valuationData, ledgerData] = await Promise.all([
        readApiResponse<Summary>(summaryRes), readApiResponse<Trial>(trialRes),
        readApiResponse<Valuation>(valuationRes), readApiResponse<LedgerRow[]>(ledgerRes),
      ]);
      setSummary(summaryData); setTrial(trialData); setValuation(valuationData); setLedger(ledgerData);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "โหลดรายงานไม่สำเร็จ"); }
  }, [month]);

  useEffect(() => { load(); }, [load]);
  const cards = [
    ["รายได้สุทธิ", summary?.revenue], ["ต้นทุนขาย", summary?.cogs], ["กำไรขั้นต้น", summary?.grossProfit],
    ["ค่าใช้จ่ายดำเนินงาน", summary?.operatingExpenses], ["กำไรสุทธิ", summary?.netProfit], ["มูลค่า Stock ปัจจุบัน", valuation?.totalValue],
  ] as const;

  return <div style={{ minHeight: "100vh", background: t.color.canvas }}>
    <TopBar t={t} title="Ledger Reports" subtitle="รายงานจาก Journal และ Stock Lot จริง" breadcrumb={["Chawy", "Finance", "Reports"]} right={<Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="w-40" />} />
    <div className="space-y-5 p-4 md:p-8">
      {error && <Card className="border-red-200 p-4 text-red-600">{error}</Card>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([label, value]) => <Card key={label} className="p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-2xl font-bold">{fmtBaht(value ?? 0)}</div></Card>)}</div>

      <Card className="overflow-hidden"><div className="flex items-center justify-between border-b p-4"><div className="font-semibold">Trial Balance · {month}</div><Badge variant="secondary">{trial?.balanced ? "Balanced" : "Not balanced"}</Badge></div>
        <Table><TableHeader><TableRow><TableHead>บัญชี</TableHead><TableHead>ประเภท</TableHead><TableHead className="text-right">เดบิต</TableHead><TableHead className="text-right">เครดิต</TableHead><TableHead className="text-right">ยอดคงเหลือ</TableHead></TableRow></TableHeader><TableBody>
          {trial?.rows.map((row) => <TableRow key={row.AccountCode}><TableCell><span className="font-mono">{row.AccountCode}</span> {row.AccountName}</TableCell><TableCell>{row.AccountType}</TableCell><TableCell className="text-right font-mono">{fmtBaht(row.Debit)}</TableCell><TableCell className="text-right font-mono">{fmtBaht(row.Credit)}</TableCell><TableCell className="text-right font-mono">{fmtBaht(row.Balance)} {row.BalanceSide === "Debit" ? "Dr" : "Cr"}</TableCell></TableRow>)}
          <TableRow className="font-bold"><TableCell colSpan={2}>รวม</TableCell><TableCell className="text-right">{fmtBaht(trial?.totalDebit ?? 0)}</TableCell><TableCell className="text-right">{fmtBaht(trial?.totalCredit ?? 0)}</TableCell><TableCell /></TableRow>
        </TableBody></Table></Card>

      <Card className="overflow-hidden"><div className="border-b p-4 font-semibold">Inventory Valuation · {valuation?.totalQty ?? 0} ชิ้น</div><Table><TableHeader><TableRow><TableHead>SKU / Product</TableHead><TableHead>Lot</TableHead><TableHead>หมดอายุ</TableHead><TableHead className="text-right">จำนวน</TableHead><TableHead className="text-right">ต้นทุน/ชิ้น</TableHead><TableHead className="text-right">มูลค่า</TableHead></TableRow></TableHeader><TableBody>{valuation?.rows.map((row) => <TableRow key={`${row.SKU}-${row.Lot}`}><TableCell><div className="font-mono text-xs">{row.SKU}</div>{row.ProductName}</TableCell><TableCell className="font-mono">{row.Lot}</TableCell><TableCell>{row.ExpiryDate || "–"}</TableCell><TableCell className="text-right">{row.RemainingQty}</TableCell><TableCell className="text-right">{fmtBaht(row.UnitCost)}</TableCell><TableCell className="text-right font-semibold">{fmtBaht(row.Value)}</TableCell></TableRow>)}</TableBody></Table></Card>

      <Card className="overflow-hidden"><div className="border-b p-4 font-semibold">General Ledger · {month}</div><Table><TableHeader><TableRow><TableHead>วันที่ / Journal</TableHead><TableHead>เอกสารต้นทาง</TableHead><TableHead>บัญชี</TableHead><TableHead className="text-right">เดบิต</TableHead><TableHead className="text-right">เครดิต</TableHead></TableRow></TableHeader><TableBody>{ledger.map((row, index) => <TableRow key={`${row.JournalCode}-${index}`}><TableCell>{row.Date}<div className="font-mono text-xs">{row.JournalCode}</div></TableCell><TableCell>{row.SourceRef}<div className="text-xs text-muted-foreground">{row.SourceType}</div></TableCell><TableCell><span className="font-mono text-xs">{row.AccountCode}</span> {row.AccountName}</TableCell><TableCell className="text-right font-mono">{row.Debit ? fmtBaht(row.Debit) : "–"}</TableCell><TableCell className="text-right font-mono">{row.Credit ? fmtBaht(row.Credit) : "–"}</TableCell></TableRow>)}</TableBody></Table></Card>
    </div>
  </div>;
}
