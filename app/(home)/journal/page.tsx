"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar, fmtBaht } from "@/components/ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTheme } from "@/lib/design/ThemeContext";
import { readApiResponse } from "@/lib/apiResponse";

type JournalLine = { id: number; accountCode: string; accountName: string; debit: number; credit: number; sku?: string; lot?: string };
type JournalEntry = { id: number; code: string; date: string; sourceType: string; sourceRef: string; status: string; lines: JournalLine[] };

const sourceLabels: Record<string, string> = {
  goods_receipt: "รับสินค้าเข้าสต๊อก",
  sales_delivery: "ตัดต้นทุนขาย",
  customer_invoice: "ออกใบแจ้งหนี้",
  customer_payment: "รับชำระเงิน",
};

export default function JournalPage() {
  const { tokens: t } = useTheme();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("chawy_token") || "";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    fetch(`${apiUrl}/api/journal-entries`, { headers: { Authorization: token ? `Bearer ${token}` : "" } })
      .then((response) => readApiResponse<JournalEntry[]>(response))
      .then((data) => setEntries([...data].sort((a, b) => b.id - a.id)))
      .catch((reason) => setError(reason instanceof Error ? reason.message : "โหลดข้อมูลไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => entries.reduce((sum, entry) => {
    entry.lines.forEach((line) => { sum.debit += line.debit; sum.credit += line.credit; });
    return sum;
  }, { debit: 0, credit: 0 }), [entries]);

  return (
    <div style={{ minHeight: "100vh", background: t.color.canvas }}>
      <TopBar t={t} title="Accounting Journal" subtitle="สมุดรายวันจากการรับสินค้า ขาย ออกใบแจ้งหนี้ และรับชำระ" breadcrumb={["Chawy", "Finance", "Journal"]} />
      <div className="space-y-4 p-4 md:p-8">
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="p-4"><div className="text-xs text-muted-foreground">รายการที่ลงบัญชี</div><div className="mt-1 text-2xl font-bold">{entries.length}</div></Card>
          <Card className="p-4"><div className="text-xs text-muted-foreground">เดบิตรวม</div><div className="mt-1 text-2xl font-bold">{fmtBaht(totals.debit)}</div></Card>
          <Card className="p-4"><div className="text-xs text-muted-foreground">เครดิตรวม</div><div className="mt-1 text-2xl font-bold">{fmtBaht(totals.credit)}</div></Card>
        </div>
        <Card className="overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>เลขที่ / วันที่</TableHead><TableHead>ที่มา</TableHead><TableHead>รายการบัญชี</TableHead><TableHead className="text-right">เดบิต</TableHead><TableHead className="text-right">เครดิต</TableHead><TableHead>สถานะ</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={6} className="py-8 text-center">กำลังโหลด...</TableCell></TableRow>}
              {!loading && error && <TableRow><TableCell colSpan={6} className="py-8 text-center text-red-600">{error}</TableCell></TableRow>}
              {!loading && !error && entries.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">ยังไม่มีรายการบัญชี</TableCell></TableRow>}
              {entries.flatMap((entry) => entry.lines.map((line, index) => (
                <TableRow key={`${entry.id}-${line.id}`}>
                  <TableCell>{index === 0 && <><div className="font-mono font-semibold">{entry.code}</div><div className="text-xs text-muted-foreground">{entry.date}</div></>}</TableCell>
                  <TableCell>{index === 0 && <><div>{sourceLabels[entry.sourceType] || entry.sourceType}</div><div className="text-xs text-muted-foreground">{entry.sourceRef}</div></>}</TableCell>
                  <TableCell><div><span className="font-mono text-xs">{line.accountCode}</span> {line.accountName}</div>{line.sku && <div className="text-xs text-muted-foreground">SKU {line.sku}{line.lot ? ` · Lot ${line.lot}` : ""}</div>}</TableCell>
                  <TableCell className="text-right font-mono">{line.debit ? fmtBaht(line.debit) : "–"}</TableCell>
                  <TableCell className="text-right font-mono">{line.credit ? fmtBaht(line.credit) : "–"}</TableCell>
                  <TableCell>{index === 0 && <Badge variant="secondary">{entry.status}</Badge>}</TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
