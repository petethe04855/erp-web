"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableRow, TableCell, TableHeader, TableHead } from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { useTheme } from "@/lib/design/ThemeContext";
import { Mono } from "@/components/ui";

interface Product {
  sku: string;
  name: string;
  cost: number;
}

interface BOM {
  code: string;
  name: string;
  cost: number;
}

interface PurchaseRequest {
  id: string;
  status: string;
  items: { sku: string; name: string; qty: number; note: string }[];
}

interface ConvertToPOSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prId: string;
  purchaseRequests: PurchaseRequest[];
  products: Product[];
  bomsList: BOM[];
  onSubmit: (prId: string, supplier: string, etaDate: string, costs: Record<string, number>) => void;
  showToast: (msg: string) => void;
}

export function ConvertToPOSheet({
  open,
  onOpenChange,
  prId,
  purchaseRequests,
  products,
  bomsList,
  onSubmit,
  showToast,
}: ConvertToPOSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const [supplier, setSupplier] = useState("");
  const [etaDate, setEtaDate] = useState("");
  const [costs, setCosts] = useState<Record<string, number | "">>({});

  const pr = purchaseRequests.find((p) => p.id === prId);

  useEffect(() => {
    if (open && pr) {
      setSupplier("");
      setEtaDate("");
      const initialCosts: Record<string, number | ""> = {};
      pr.items.forEach((item) => {
        const prod = products.find((p) => p.sku === item.sku);
        const bom = bomsList.find((b) => b.code === item.sku);
        initialCosts[item.sku] = prod ? prod.cost : (bom ? bom.cost : 0);
      });
      setCosts(initialCosts);
    }
  }, [open, prId, pr, products, bomsList]);

  function handleConvert() {
    if (!supplier || !etaDate) {
      showToast("กรุณากรอกซัพพลายเออร์และ ETA");
      return;
    }
    const hasEmptyCost = Object.values(costs).some((cost) => cost === "");
    if (hasEmptyCost) {
      showToast("กรุณากรอกราคาทุกรายการให้ถูกต้อง");
      return;
    }
    const finalCosts: Record<string, number> = {};
    Object.keys(costs).forEach((k) => {
      finalCosts[k] = Number(costs[k]);
    });
    onSubmit(prId, supplier, etaDate, finalCosts);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[min(540px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base font-bold text-foreground" style={{ color: "var(--erp-ink)" }}>
            Create PO from PR
          </SheetTitle>
          <div className="text-xs text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>
            {prId}
          </div>
        </SheetHeader>
        <SheetBody className="grid gap-4 overflow-y-auto">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              Supplier
            </Label>
            <Input
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Supplier name"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block" style={{ color: "var(--erp-ink2)" }}>
              ETA
            </Label>
            <Input
              type="date"
              value={etaDate}
              onChange={(e) => setEtaDate(e.target.value)}
            />
          </div>

          {pr && (
            <div>
              <div className="text-xs font-bold text-foreground mb-2" style={{ color: "var(--erp-ink2)" }}>
                Items
              </div>
              <div className="border border-border rounded-lg overflow-hidden" style={{ borderColor: "var(--erp-border)" }}>
                <Table className="w-full border-collapse">
                  <TableHeader className="bg-muted/50 border-b border-border" style={{ background: "var(--erp-subtle)", borderColor: "var(--erp-border)" }}>
                    <TableRow>
                      <TableHead className="p-2 text-xs font-bold text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>Item</TableHead>
                      <TableHead className="p-2 text-xs font-bold text-muted-foreground text-center w-16" style={{ color: "var(--erp-ink3)" }}>Qty</TableHead>
                      <TableHead className="p-2 text-xs font-bold text-muted-foreground text-right w-28" style={{ color: "var(--erp-ink3)" }}>Unit cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pr.items.map((item, i) => (
                      <TableRow key={`${item.sku}-${i}`} className="border-b border-border" style={{ borderColor: "var(--erp-border)" }}>
                        <TableCell className="p-2 align-middle">
                          <span className="text-xs font-medium" style={{ color: "var(--erp-ink)" }}>
                            {item.name || item.sku}
                          </span>
                        </TableCell>
                        <TableCell className="p-2 align-middle text-center font-mono text-xs">
                          {item.qty}
                        </TableCell>
                        <TableCell className="p-2 align-middle text-right">
                          <Input
                            type="number"
                            min={0}
                            value={costs[item.sku] ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCosts((c) => ({
                                ...c,
                                [item.sku]: val === "" ? "" : parseFloat(val) || 0,
                              }));
                            }}
                            className="h-8 text-xs p-1 text-right font-mono w-24 ml-auto"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </SheetBody>
        <SheetFooter className="flex justify-end gap-2 border-t p-4 px-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer border-border"
            style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)", color: "#374151" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConvert}
            className="bg-[var(--erp-accent)] text-white hover:opacity-90 border-none shadow-none cursor-pointer"
          >
            Create Purchase Order
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
