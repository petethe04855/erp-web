"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTheme } from "@/lib/design/ThemeContext";
import { readApiResponse } from "@/lib/apiResponse";

type IntegrityRun = { id: number; code: string; completedAt: string; triggeredBy: string; status: string; checkedCount: number; issueCount: number };
type IntegrityIssue = { id: number; category: string; severity: string; entityType: string; entityRef: string; message: string; expected: string; actual: string; status: string; lastSeenAt: string; occurrences: number; resolvedBy?: string; resolution?: string };

const CATEGORY_INFO: Record<string, { label: string; impact: string; action: string }> = {
  Stock: { label: "ยอดสต๊อกไม่ตรงกับ Lot", impact: "จำนวนสินค้าที่หน้าหลักไม่ตรงกับสินค้าที่เหลือในแต่ละ Lot", action: "ตรวจประวัติรับเข้า คืนสินค้า และปรับสต๊อกของ SKU นี้" },
  StockMovement: { label: "ยอดสต๊อกไม่ตรงกับ Movement", impact: "ยอดคงเหลือไม่สามารถอธิบายได้จากรายการ IN และ OUT", action: "ตรวจ Movement ที่ขาดหรือถูกสร้างเกิน โดยยังไม่ควรแก้ยอดตรง ๆ" },
  JournalBalance: { label: "บัญชีไม่สมดุล", impact: "เดบิตและเครดิตของ Journal ใบนี้ไม่เท่ากัน", action: "หยุดใช้รายงานบัญชีของรายการนี้และตรวจ Journal ต้นทาง" },
  MissingJournal: { label: "เอกสารยังไม่ลงบัญชี", impact: "เอกสารทำงานเสร็จแล้ว แต่ไม่มี Journal รองรับ", action: "ตรวจเอกสารต้นทางและสร้างรายการกลับ/ลงบัญชีตามขั้นตอน" },
  OrphanJournal: { label: "Journal ไม่มีเอกสารต้นทาง", impact: "พบรายการบัญชีที่ย้อนกลับไปหาเอกสารธุรกิจไม่ได้", action: "ตรวจว่าเอกสารถูกลบหรือ Source Reference ผิด" },
};

function formatDate(value?: string) {
  if (!value) return "–";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
}

export default function IntegrityPage() {
  const { tokens: t } = useTheme();
  const [runs, setRuns] = useState<IntegrityRun[]>([]);
  const [issues, setIssues] = useState<IntegrityIssue[]>([]);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("Open");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selected, setSelected] = useState<IntegrityIssue | null>(null);
  const [resolution, setResolution] = useState("");
  const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("chawy_token") || ""}` });

  const load = useCallback(async () => {
    try {
      const [runsRes, issuesRes] = await Promise.all([fetch(`${api}/api/integrity-runs`, { headers: headers() }), fetch(`${api}/api/integrity-issues`, { headers: headers() })]);
      const [runsData, issuesData] = await Promise.all([readApiResponse<IntegrityRun[]>(runsRes), readApiResponse<IntegrityIssue[]>(issuesRes)]);
      setRuns([...runsData].sort((a, b) => b.id - a.id));
      setIssues([...issuesData].sort((a, b) => (a.status === b.status ? (a.severity === "Critical" ? -1 : 1) : a.status === "Open" ? -1 : 1)));
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "โหลดข้อมูลไม่สำเร็จ"); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  async function runNow() {
    setRunning(true); setMessage("");
    try {
      const response = await fetch(`${api}/api/integrity-runs`, { method: "POST", headers: headers() });
      const run = await readApiResponse<IntegrityRun>(response);
      setMessage(run.issueCount ? `ตรวจแล้ว ${run.checkedCount} รายการ พบปัญหา ${run.issueCount} จุด — ระบบยังไม่ได้ปรับยอดอัตโนมัติ` : `ตรวจแล้ว ${run.checkedCount} รายการ ไม่พบปัญหา`);
      await load();
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "ตรวจสอบไม่สำเร็จ"); }
    finally { setRunning(false); }
  }

  async function resolveIssue() {
    if (!selected || !resolution.trim()) return;
    try {
      const response = await fetch(`${api}/api/integrity-issues/${selected.id}/resolve`, { method: "PUT", headers: headers(), body: JSON.stringify({ resolution }) });
      await readApiResponse(response); setSelected(null); setResolution(""); setMessage(`ปิดปัญหา ${selected.entityRef} แล้ว`); await load();
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "ปิดปัญหาไม่สำเร็จ"); }
  }

  const openIssues = useMemo(() => issues.filter((issue) => issue.status === "Open"), [issues]);
  const categories = useMemo(() => [...new Set(issues.map((issue) => issue.category))], [issues]);
  const visibleIssues = useMemo(() => issues.filter((issue) => (statusFilter === "All" || issue.status === statusFilter) && (categoryFilter === "All" || issue.category === categoryFilter)), [issues, statusFilter, categoryFilter]);
  const latest = runs[0];
  const healthy = latest && latest.issueCount === 0;

  return <div style={{ minHeight: "100vh", background: t.color.canvas }}>
    <TopBar t={t} title="ตรวจความถูกต้องของระบบ" subtitle="ตรวจสต๊อกและบัญชี พร้อมชี้จุดผิดปกติ โดยไม่แก้ยอดให้อัตโนมัติ" breadcrumb={["Chawy", "System", "Integrity Check"]} right={<Button onClick={runNow} disabled={running}>{running ? "กำลังตรวจสอบ..." : "ตรวจสอบตอนนี้"}</Button>} />
    <div className="space-y-5 p-4 md:p-8">
      <Card className={`border-l-4 p-5 ${healthy ? "border-l-emerald-500" : openIssues.length ? "border-l-red-500" : "border-l-amber-500"}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><div className="text-lg font-bold">{!latest ? "ยังไม่เคยตรวจสอบระบบ" : healthy ? "ข้อมูลรอบล่าสุดปกติ" : `พบ ${openIssues.length} ปัญหาที่ยังต้องตรวจสอบ`}</div><div className="mt-1 text-sm text-muted-foreground">{latest ? `ตรวจล่าสุด ${formatDate(latest.completedAt)} โดย ${latest.triggeredBy} · ตรวจทั้งหมด ${latest.checkedCount} รายการ` : "กด “ตรวจสอบตอนนี้” เพื่อเริ่มตรวจ Stock, Lot, Movement และ Journal"}</div></div>
          <Badge variant={healthy ? "secondary" : "destructive"}>{healthy ? "ปกติ" : latest ? "ต้องตรวจสอบ" : "ยังไม่มีผลตรวจ"}</Badge>
        </div>
      </Card>
      {message && <Card className="p-3 text-sm">{message}</Card>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4"><div className="text-xs text-muted-foreground">ปัญหาที่ยังเปิด</div><div className="mt-1 text-3xl font-bold">{openIssues.length}</div><div className="mt-1 text-xs text-muted-foreground">ต้องตรวจและปิดด้วยเหตุผล</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">เร่งด่วน</div><div className="mt-1 text-3xl font-bold text-red-600">{openIssues.filter((item) => item.severity === "Critical").length}</div><div className="mt-1 text-xs text-muted-foreground">อาจกระทบยอด Stock หรือบัญชี</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">พบจาก Stock</div><div className="mt-1 text-3xl font-bold">{openIssues.filter((item) => item.category === "Stock" || item.category === "StockMovement").length}</div><div className="mt-1 text-xs text-muted-foreground">Product, Lot หรือ Movement ไม่ตรงกัน</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">ตรวจอัตโนมัติรอบถัดไป</div><div className="mt-2 text-lg font-bold">02:00 น.</div><div className="mt-1 text-xs text-muted-foreground">ทำงานทุกวันตามเวลา Server</div></Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="font-semibold">รายการที่ต้องตรวจสอบ</div><div className="text-xs text-muted-foreground">เรียงปัญหาเร่งด่วนก่อน และแสดงแนวทางตรวจเบื้องต้น</div></div><div className="flex gap-2"><NativeSelect value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-36"><option value="Open">ยังไม่แก้</option><option value="Resolved">แก้แล้ว</option><option value="All">ทั้งหมด</option></NativeSelect><NativeSelect value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="w-48"><option value="All">ทุกหมวด</option>{categories.map((category) => <option key={category} value={category}>{CATEGORY_INFO[category]?.label || category}</option>)}</NativeSelect></div></div>
        <div className="mt-4 space-y-3">
          {visibleIssues.length === 0 && <div className="rounded-lg border border-dashed p-10 text-center"><div className="font-semibold">ไม่พบรายการในตัวกรองนี้</div><div className="mt-1 text-sm text-muted-foreground">หากยังไม่เคยตรวจ ให้กด “ตรวจสอบตอนนี้”</div></div>}
          {visibleIssues.map((issue) => { const info = CATEGORY_INFO[issue.category] || { label: issue.category, impact: issue.message, action: "ตรวจเอกสารและประวัติรายการที่เกี่ยวข้อง" }; return <div key={issue.id} className={`rounded-lg border p-4 ${issue.status === "Resolved" ? "opacity-70" : issue.severity === "Critical" ? "border-red-200 bg-red-50/40 dark:bg-red-950/10" : "border-amber-200 bg-amber-50/40 dark:bg-amber-950/10"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex gap-3"><Badge variant={issue.severity === "Critical" ? "destructive" : "secondary"}>{issue.severity === "Critical" ? "เร่งด่วน" : "ควรตรวจ"}</Badge><div><div className="font-semibold">{info.label}</div><div className="mt-0.5 text-sm"><span className="font-mono font-semibold">{issue.entityRef}</span> · {issue.message}</div></div></div><Badge variant="outline">{issue.status === "Open" ? "ยังไม่แก้" : "แก้แล้ว"}</Badge></div>
            <div className="mt-4 grid gap-3 md:grid-cols-3"><div className="rounded-md bg-background/80 p-3"><div className="text-xs font-semibold text-muted-foreground">ค่าที่ระบบควรเป็น</div><div className="mt-1 font-mono text-base font-bold">{issue.expected}</div></div><div className="rounded-md bg-background/80 p-3"><div className="text-xs font-semibold text-muted-foreground">ค่าที่พบจริง</div><div className="mt-1 font-mono text-base font-bold text-red-600">{issue.actual}</div></div><div className="rounded-md bg-background/80 p-3"><div className="text-xs font-semibold text-muted-foreground">ควรทำอะไรต่อ</div><div className="mt-1 text-sm">{info.action}</div></div></div>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3 text-xs text-muted-foreground"><div><div>ผลกระทบ: {info.impact}</div><div>พบล่าสุด {formatDate(issue.lastSeenAt)} · พบซ้ำ {issue.occurrences} ครั้ง</div>{issue.resolution && <div className="mt-1 text-foreground">วิธีแก้: {issue.resolution} {issue.resolvedBy ? `· โดย ${issue.resolvedBy}` : ""}</div>}</div>{issue.status === "Open" && <Button size="sm" variant="outline" onClick={() => { setSelected(issue); setResolution(""); }}>บันทึกว่าแก้แล้ว</Button>}</div>
          </div>; })}
        </div>
      </Card>

      <Card className="overflow-hidden"><div className="border-b p-4"><div className="font-semibold">ประวัติการตรวจ</div><div className="text-xs text-muted-foreground">แสดง 10 รอบล่าสุด</div></div><Table><TableHeader><TableRow><TableHead>วันที่ตรวจ</TableHead><TableHead>ผู้สั่งตรวจ</TableHead><TableHead className="text-right">รายการที่ตรวจ</TableHead><TableHead className="text-right">ปัญหาที่พบ</TableHead><TableHead>ผลตรวจ</TableHead></TableRow></TableHeader><TableBody>{runs.slice(0, 10).map((run) => <TableRow key={run.id}><TableCell>{formatDate(run.completedAt)}<div className="font-mono text-xs text-muted-foreground">{run.code}</div></TableCell><TableCell>{run.triggeredBy}</TableCell><TableCell className="text-right">{run.checkedCount}</TableCell><TableCell className="text-right font-semibold">{run.issueCount}</TableCell><TableCell><Badge variant={run.issueCount ? "destructive" : "secondary"}>{run.issueCount ? "พบปัญหา" : "ปกติ"}</Badge></TableCell></TableRow>)}</TableBody></Table></Card>
    </div>

    <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>ยืนยันการแก้ไขปัญหา</DialogTitle></DialogHeader><div className="space-y-3"><div className="rounded-md bg-muted p-3 text-sm"><div className="font-semibold">{selected && (CATEGORY_INFO[selected.category]?.label || selected.category)}</div><div className="mt-1 font-mono text-xs">{selected?.entityRef}</div></div><div><div className="mb-1 text-sm font-semibold">อธิบายสิ่งที่ตรวจและแก้ไขแล้ว</div><Textarea value={resolution} onChange={(event) => setResolution(event.target.value)} rows={4} placeholder="เช่น ตรวจ Stock Movement แล้วพบรายการรับเข้าตกหล่น และสร้างรายการปรับปรุงโดยผู้อนุมัติแล้ว" /></div><div className="text-xs text-muted-foreground">การกดปิด Issue จะบันทึกชื่อผู้ใช้ เวลา และเหตุผลไว้ใน Audit Trail</div></div><DialogFooter><Button variant="outline" onClick={() => setSelected(null)}>ยกเลิก</Button><Button onClick={resolveIssue} disabled={!resolution.trim()}>ยืนยันว่าแก้แล้ว</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
