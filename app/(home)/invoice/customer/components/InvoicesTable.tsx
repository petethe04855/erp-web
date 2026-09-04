import React from "react";
import type { Invoice } from "@/lib/store/erpWorkflow";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { balance, money, today, type DisplayLine } from "./types";

interface InvoicesTableProps {
  invoices: Invoice[];
  productLines: (invoice: Invoice) => DisplayLine[];
  orderFor: (invoice: Invoice) => any;
  onExport: (invoice: Invoice) => void;
}

export function InvoicesTable({
  invoices,
  productLines,
  orderFor,
  onExport,
}: InvoicesTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b p-4">
        <div className="font-semibold">รายการ Invoice ค้างชำระ</div>
        <div className="text-xs text-muted-foreground">
          เลือก Export เพื่อสร้างเอกสาร Invoice มาตรฐานหนึ่งฉบับต่อเลขที่เอกสาร
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice / SO</TableHead>
              <TableHead>สินค้า</TableHead>
              <TableHead>ออกเอกสาร</TableHead>
              <TableHead>ครบกำหนด</TableHead>
              <TableHead className="text-right">ยอดค้างชำระ</TableHead>
              <TableHead>Export</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const lines = productLines(invoice);
              const overdue = invoice.dueDate < today();
              const soRef = orderFor(invoice)?.code || invoice.soRef;
              return (
                <TableRow
                  key={invoice.id}
                  className={overdue ? "bg-red-50/30 dark:bg-red-950/10" : ""}
                >
                  <TableCell>
                    <div className="font-mono font-semibold">
                      {invoice.code || invoice.id}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">
                      SO {soRef}
                    </div>
                    <Badge variant={overdue ? "destructive" : "outline"}>
                      {overdue ? "เกินกำหนด" : "ค้างชำระ"}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-72">
                    {lines.map((line) => (
                      <div
                        key={line.key}
                        className="border-b py-1.5 last:border-0"
                      >
                        <div className="font-medium">{line.name}</div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-mono">{line.sku}</span> · Lot{" "}
                          {line.lot} · {line.qty} {line.unit || "ชิ้น"} ·{" "}
                          {money(line.total)}
                        </div>
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>{invoice.issueDate}</TableCell>
                  <TableCell
                    className={overdue ? "font-semibold text-red-600" : ""}
                  >
                    {invoice.dueDate}
                  </TableCell>
                  <TableCell className="text-right text-base font-bold">
                    {money(balance(invoice))}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onExport(invoice)}
                    >
                      Export Invoice
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {invoices.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  ไม่พบ Invoice ค้างชำระของลูกค้ารายนี้
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
