"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Send, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Truck, 
  FilePlus, 
  CreditCard,
  Ban,
  Check,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { 
  useUpdateQuotationStatusMutation, 
  useConvertQuotationMutation 
} from "@/features/quotation/queries/quotationQueries";
import { 
  useUpdateOrderStatusMutation, 
  useCreateInvoiceFromSOMutation 
} from "@/features/orders/queries/orderQueries";
import { usePayInvoiceMutation } from "@/features/invoices/queries/invoiceQueries";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export type DocumentType = "quotation" | "order" | "invoice";

interface DocumentActionsProps {
  type: DocumentType;
  id: string | number;
  code?: string;
  status: string;
  amount?: number;
  balance?: number;
  validUntil?: string;
  isExpired?: boolean;
  onSuccess?: () => void;
}

export function DocumentActions({
  type,
  id,
  code,
  status,
  amount = 0,
  balance,
  validUntil,
  isExpired,
  onSuccess,
}: DocumentActionsProps) {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role?.toLowerCase() || "");
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<string>("");

  // Mutations
  const updateQuotationStatus = useUpdateQuotationStatusMutation();
  const convertQuotation = useConvertQuotationMutation();
  const updateOrderStatus = useUpdateOrderStatusMutation();
  const createInvoice = useCreateInvoiceFromSOMutation();
  const payInvoice = usePayInvoiceMutation();

  const isPending =
    updateQuotationStatus.isPending ||
    convertQuotation.isPending ||
    updateOrderStatus.isPending ||
    createInvoice.isPending ||
    payInvoice.isPending;

  const showFeedback = (text: string, isError = false) => {
    setFeedbackMessage({ text, isError });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Role permissions
  const canManageSales = role === "owner" || role === "sales" || role === "admin";
  const canManageWarehouse = role === "owner" || role === "warehouse" || role === "admin";
  const canManageFinance = role === "owner" || role === "accountant" || role === "admin";

  // Normalized status
  const normStatus = (status || "").toUpperCase();

  // Quotation Actions
  if (type === "quotation") {
    const isDraft = normStatus === "DRAFT" || !normStatus;
    const isSent = normStatus === "SENT";
    const isApproved = normStatus === "APPROVED";
    const isConverted = normStatus === "CONVERTED";
    const isRejected = normStatus === "REJECTED";

    // Expired check
    let expired = !!isExpired;
    if (!expired && validUntil) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const validDate = new Date(validUntil);
      validDate.setHours(0, 0, 0, 0);
      if (validDate < today) expired = true;
    }

    const handleQuotationStatus = async (newStatus: string) => {
      if (!window.confirm(`ยืนยันการเปลี่ยนสถานะใบเสนอราคาเป็น ${newStatus}?`)) return;
      try {
        await updateQuotationStatus.mutateAsync({ id, status: newStatus });
        showFeedback(`อัปเดตสถานะเป็น ${newStatus} สำเร็จ`);
        onSuccess?.();
      } catch (err: any) {
        showFeedback(err?.response?.data?.message || err?.message || "ไม่สามารถเปลี่ยนสถานะได้", true);
      }
    };

    const handleConvert = async () => {
      if (expired) {
        showFeedback("ไม่สามารถแปลงได้เนื่องจากใบเสนอราคาหมดอายุแล้ว", true);
        return;
      }
      if (!window.confirm("ยืนยันแปลงใบเสนอราคานี้เป็น ใบสั่งขาย (Sales Order)?")) return;
      try {
        const res = await convertQuotation.mutateAsync(id);
        const newOrderId = res?.data?.orderId;
        showFeedback("แปลงเป็นใบสั่งขายเรียบร้อย กำลังนำทาง...");
        onSuccess?.();
        if (newOrderId) {
          router.push(`/orders/${newOrderId}`);
        } else {
          router.push("/orders");
        }
      } catch (err: any) {
        showFeedback(err?.response?.data?.message || err?.message || "แปลงเป็นใบสั่งขายไม่สำเร็จ", true);
      }
    };

    return (
      <div className="flex flex-wrap items-center gap-2">
        {feedbackMessage && (
          <span className={`text-xs px-2.5 py-1 rounded-md ${feedbackMessage.isError ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
            {feedbackMessage.text}
          </span>
        )}

        {isDraft && (
          <Button
            size="sm"
            disabled={isPending || !canManageSales}
            onClick={() => handleQuotationStatus("Sent")}
            className="gap-1.5"
            title={!canManageSales ? "คุณไม่มีสิทธิ์ดำเนินการ" : "ส่งใบเสนอราคาให้ลูกค้า"}
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            ส่งเอกสาร (Sent)
          </Button>
        )}

        {isSent && (
          <>
            <Button
              size="sm"
              disabled={isPending || !canManageSales || expired}
              onClick={() => handleQuotationStatus("Approved")}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              title={expired ? "ใบเสนอราคาหมดอายุแล้ว" : !canManageSales ? "คุณไม่มีสิทธิ์ดำเนินการ" : "อนุมัติใบเสนอราคา"}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              อนุมัติ (Approve)
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isPending || !canManageSales}
              onClick={() => handleQuotationStatus("Rejected")}
              className="gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              title={!canManageSales ? "คุณไม่มีสิทธิ์ดำเนินการ" : "ปฏิเสธใบเสนอราคา"}
            >
              <XCircle className="h-3.5 w-3.5" />
              ปฏิเสธ (Reject)
            </Button>
          </>
        )}

        {isApproved && (
          <Button
            size="sm"
            disabled={isPending || !canManageSales || expired}
            onClick={handleConvert}
            className="gap-1.5 bg-primary text-primary-foreground font-medium shadow-sm"
            title={expired ? "ใบเสนอราคาหมดอายุแล้ว ไม่สามารถแปลงเป็นใบสั่งขายได้" : "แปลงเป็นใบสั่งขาย (Sales Order)"}
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
            แปลงเป็นใบสั่งขาย (Convert to SO)
          </Button>
        )}
      </div>
    );
  }

  // Sales Order Actions
  if (type === "order") {
    const isPendingStatus = normStatus === "PENDING";
    const isConfirmed = normStatus === "CONFIRMED";
    const isShipped = normStatus === "SHIPPED" || normStatus === "COMPLETED";
    const isCancelled = normStatus === "CANCELLED";

    const handleOrderStatus = async (newStatus: string) => {
      const confirmText =
        newStatus === "CANCELLED"
          ? "ยืนยันยกเลิกใบสั่งขายนี้? (ระบบจะคืนการจองสต็อก)"
          : newStatus === "SHIPPED"
          ? "ยืนยันการจัดส่งสินค้าและตัดสต็อก?"
          : `ยืนยันเปลี่ยนสถานะเป็น ${newStatus}?`;

      if (!window.confirm(confirmText)) return;

      try {
        await updateOrderStatus.mutateAsync({ id, status: newStatus });
        showFeedback(`อัปเดตสถานะเป็น ${newStatus} สำเร็จ`);
        onSuccess?.();
      } catch (err: any) {
        showFeedback(err?.response?.data?.message || err?.message || "ไม่สามารถเปลี่ยนสถานะได้", true);
      }
    };

    const handleCreateInvoice = async () => {
      if (!code && !id) return;
      const ref = code || id;
      if (!window.confirm(`ยืนยันการออกใบแจ้งหนี้จากใบสั่งขาย ${ref}?`)) return;

      try {
        const res = await createInvoice.mutateAsync(ref);
        const invId = res?.data?.id;
        showFeedback("ออกใบแจ้งหนี้สำเร็จ กำลังนำทาง...");
        onSuccess?.();
        if (invId) {
          router.push(`/invoices/${invId}`);
        } else {
          router.push("/invoices");
        }
      } catch (err: any) {
        showFeedback(err?.response?.data?.message || err?.message || "ออกใบแจ้งหนี้ไม่สำเร็จ", true);
      }
    };

    return (
      <div className="flex flex-wrap items-center gap-2">
        {feedbackMessage && (
          <span className={`text-xs px-2.5 py-1 rounded-md ${feedbackMessage.isError ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
            {feedbackMessage.text}
          </span>
        )}

        {isPendingStatus && (
          <>
            <Button
              size="sm"
              disabled={isPending || !canManageSales}
              onClick={() => handleOrderStatus("CONFIRMED")}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              title={!canManageSales ? "คุณไม่มีสิทธิ์ดำเนินการ" : "ยืนยันคำสั่งซื้อ"}
            >
              <Check className="h-3.5 w-3.5" />
              ยืนยันออเดอร์ (Confirm)
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isPending || !canManageSales}
              onClick={() => handleOrderStatus("CANCELLED")}
              className="gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              title={!canManageSales ? "คุณไม่มีสิทธิ์ดำเนินการ" : "ยกเลิกคำสั่งซื้อ"}
            >
              <Ban className="h-3.5 w-3.5" />
              ยกเลิก (Cancel)
            </Button>
          </>
        )}

        {isConfirmed && (
          <>
            <Button
              size="sm"
              disabled={isPending || !canManageWarehouse}
              onClick={() => handleOrderStatus("SHIPPED")}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              title={!canManageWarehouse ? "คุณไม่มีสิทธิ์ดำเนินการคลังสินค้า" : "จัดส่งสินค้าและตัดสต็อก"}
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Truck className="h-3.5 w-3.5" />}
              จัดส่ง / ตัดสต็อก (Ship)
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isPending || !canManageSales}
              onClick={() => handleOrderStatus("CANCELLED")}
              className="gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              title={!canManageSales ? "คุณไม่มีสิทธิ์ดำเนินการ" : "ยกเลิกคำสั่งซื้อ"}
            >
              <Ban className="h-3.5 w-3.5" />
              ยกเลิก (Cancel)
            </Button>
          </>
        )}

        {isShipped && (
          <Button
            size="sm"
            disabled={isPending || !canManageFinance}
            onClick={handleCreateInvoice}
            className="gap-1.5 bg-primary text-primary-foreground font-medium shadow-sm"
            title={!canManageFinance ? "คุณไม่มีสิทธิ์ออกใบแจ้งหนี้" : "ออกใบแจ้งหนี้จากใบสั่งขายนี้"}
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FilePlus className="h-3.5 w-3.5" />}
            ออกใบแจ้งหนี้ (Create Invoice)
          </Button>
        )}
      </div>
    );
  }

  // Invoice Actions
  if (type === "invoice") {
    const isPaid = normStatus === "PAID" || (balance !== undefined && balance <= 0);

    const handlePaySubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const num = parseFloat(payAmount);
      if (isNaN(num) || num <= 0) {
        showFeedback("กรุณาระบุจำนวนเงินที่ถูกต้อง", true);
        return;
      }
      try {
        await payInvoice.mutateAsync({ id, amount: num });
        showFeedback("บันทึกการรับชำระเงินสำเร็จ");
        setIsPayOpen(false);
        setPayAmount("");
        onSuccess?.();
      } catch (err: any) {
        showFeedback(err?.response?.data?.message || err?.message || "บันทึกการรับชำระเงินไม่สำเร็จ", true);
      }
    };

    return (
      <div className="flex flex-wrap items-center gap-2">
        {feedbackMessage && (
          <span className={`text-xs px-2.5 py-1 rounded-md ${feedbackMessage.isError ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
            {feedbackMessage.text}
          </span>
        )}

        {!isPaid && (
          <Button
            size="sm"
            disabled={isPending || !canManageFinance}
            onClick={() => {
              setPayAmount(String(balance ?? amount));
              setIsPayOpen(true);
            }}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            title={!canManageFinance ? "คุณไม่มีสิทธิ์บันทึกการเงิน" : "บันทึกการรับชำระเงิน"}
          >
            <CreditCard className="h-3.5 w-3.5" />
            รับชำระเงิน (Record Payment)
          </Button>
        )}

        <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
          <DialogContent className="max-w-md">
            <DialogTitle>รับชำระเงินสำหรับ {code || `INV-${id}`}</DialogTitle>
            <form onSubmit={handlePaySubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">จำนวนเงินที่รับชำระ (บาท)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsPayOpen(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                  ยืนยันรับชำระ
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
}
