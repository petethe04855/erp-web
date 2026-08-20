"use client";

import { Button } from "@/components/ui/button";
import { Mono } from "@/components/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { useTheme } from "@/lib/design/ThemeContext";

interface ReceiveItem {
  sku: string;
  qtyReceived: number;
  lot?: string;
  expiryDate?: string;
}

interface GoodsReceiveRecord {
  id: string;
  code?: string;
  poRef: string;
  receiveDate: string;
  items: ReceiveItem[];
}

interface POItem {
  sku: string;
  name: string;
  qty: number;
  receivedQty: number;
  unitCost: number;
}

interface PurchaseOrder {
  id: number | string;
  code?: string;
  supplier: string;
  items: POItem[];
}

interface ViewGoodsReceiveSheetProps {
  selectedGR: GoodsReceiveRecord | null;
  onClose: () => void;
  poList: PurchaseOrder[];
}

export function ViewGoodsReceiveSheet({
  selectedGR,
  onClose,
  poList,
}: ViewGoodsReceiveSheetProps) {
  const { tokens: t } = useTheme();
  const c = t.color;

  const po = selectedGR ? poList.find((p) => p.id === selectedGR.poRef || p.code === selectedGR.poRef) : null;

  return (
    <Sheet open={!!selectedGR} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex h-full w-[min(640px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base font-bold text-foreground" style={{ color: "var(--erp-ink)" }}>
            Receipt {selectedGR?.code || selectedGR?.id}
          </SheetTitle>
          <div className="text-xs text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>
            รับเข้าจาก PO: {selectedGR?.poRef || "รับตรง"} เมื่อ {selectedGR?.receiveDate}
          </div>
        </SheetHeader>
        <SheetBody className="grid gap-6 overflow-y-auto">
          {selectedGR && (
            <div className="grid gap-6">
              <div>
                <h4
                  className="text-xs font-bold uppercase tracking-wider mb-2 text-foreground"
                  style={{ color: "var(--erp-ink)" }}
                >
                  รายการสินค้าที่รับเข้า (Received Items)
                </h4>
                <div
                  className="border border-border rounded-lg overflow-hidden"
                  style={{ borderColor: "var(--erp-border)" }}
                >
                  <Table className="w-full border-collapse">
                    <TableHeader
                      className="bg-muted/50 border-b border-border"
                      style={{ background: "var(--erp-subtle)", borderColor: "var(--erp-border)" }}
                    >
                      <TableRow>
                        <TableHead className="p-3 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>
                          SKU / Name
                        </TableHead>
                        <TableHead className="p-3 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>
                          Lot / Expiry
                        </TableHead>
                        <TableHead className="p-3 text-xs font-bold text-muted-foreground uppercase text-left" style={{ color: "var(--erp-ink3)" }}>
                          Qty Received
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedGR.items.map((item, idx) => {
                        const poItem = po?.items.find((i) => i.sku === item.sku);
                        return (
                          <TableRow key={idx} className="border-b border-border" style={{ borderColor: "var(--erp-border)" }}>
                            <TableCell className="p-3 align-middle">
                              <span className="text-xs font-semibold text-foreground" style={{ color: "var(--erp-ink)" }}>
                                {item.sku}
                              </span>
                              <div className="text-[10px] text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>
                                {poItem?.name || "Unknown item"}
                              </div>
                            </TableCell>
                            <TableCell className="p-3 align-middle">
                              <Mono t={t} size={11} color={c.ink2}>
                                Lot: {item.lot || "-"}
                              </Mono>
                              <div className="text-[10px] text-muted-foreground" style={{ color: "var(--erp-ink3)" }}>
                                Exp: {item.expiryDate || "-"}
                              </div>
                            </TableCell>
                            <TableCell className="p-3 align-middle">
                              <Mono t={t} size={12}>
                                {item.qtyReceived}
                              </Mono>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

            </div>
          )}
        </SheetBody>
        <SheetFooter className="flex justify-end border-t p-4 px-6">
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
