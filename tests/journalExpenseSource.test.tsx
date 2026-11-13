import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JournalDetailModal } from "@/features/finance/components/JournalDetailModal";
import { JournalTable } from "@/features/finance/components/JournalTable";
import type { JournalEntry } from "@/features/finance/types/finance";

vi.mock("@/features/finance/api/financeApi", () => ({
  financeApi: {
    getExpenseByCode: vi.fn(),
    getSlipObjectUrl: vi.fn().mockResolvedValue("blob:http://localhost/slip"),
  },
}));

vi.mock("@/features/orders/api/orderApi", () => ({
  orderApi: { getOrders: vi.fn() },
}));

vi.mock("@/features/returns/api/returnApi", () => ({
  returnApi: { getReturns: vi.fn() },
}));

import { financeApi } from "@/features/finance/api/financeApi";
import { orderApi } from "@/features/orders/api/orderApi";
import { returnApi } from "@/features/returns/api/returnApi";

const entry: JournalEntry = {
  id: 1,
  code: "JE-2026/11/14-0001",
  date: "2026-11-14",
  source_type: "expense",
  source_id: 7,
  source_ref: "EXP-2026-0001",
  description: "[ค่าขนส่ง] Kerry - ส่งของ",
  status: "Posted",
  created_by: "staff@chawy.test",
  posted_at: "2026-11-14T03:00:00Z",
  lines: [],
};

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("General Journal ↔ expense link", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // jsdom does not implement object URLs; the slip hook revokes on unmount.
    URL.revokeObjectURL = vi.fn();
    vi.mocked(orderApi.getOrders).mockResolvedValue({
      success: true,
      data: [],
      meta: { page: 1, limit: 5, total: 0, totalPages: 1 },
    });
    vi.mocked(returnApi.getReturns).mockResolvedValue({
      success: true,
      data: [],
      meta: { page: 1, limit: 5, total: 0, totalPages: 1 },
    });
  });

  it("shows the recorder in the journal table", () => {
    wrap(<JournalTable entries={[entry]} isLoading={false} onSelectEntry={vi.fn()} />);
    expect(screen.getByText("ผู้บันทึก")).toBeInTheDocument();
    expect(screen.getByText("staff@chawy.test")).toBeInTheDocument();
    expect(screen.getByText("ค่าใช้จ่าย")).toBeInTheDocument();
  });

  it("shows the source expense with uploader, slip and a link in the detail", async () => {
    vi.mocked(financeApi.getExpenseByCode).mockResolvedValueOnce({
      id: 7,
      code: "EXP-2026-0001",
      date: "2026-11-14",
      category: "ค่าขนส่ง",
      channel: "ทั่วไป",
      amount: 250,
      vendor: "Kerry",
      invoice_ref: "INV-9",
      description: "ส่งของ",
      created_by: "สมชาย ใจดี",
      slip_url: "/uploads/expenses/expense-1.jpg",
      status: "Active",
    });

    wrap(<JournalDetailModal entry={entry} isOpen={true} onClose={vi.fn()} />);

    expect(await screen.findByText("สมชาย ใจดี")).toBeInTheDocument();
    expect(financeApi.getExpenseByCode).toHaveBeenCalledWith("EXP-2026-0001");
    expect(screen.getByText("เปิดใบค่าใช้จ่าย").closest("a")).toHaveAttribute(
      "href",
      "/finance/expenses?search=EXP-2026-0001",
    );
    expect(await screen.findByAltText("Slip")).toHaveAttribute("src", "blob:http://localhost/slip");
    expect(financeApi.getSlipObjectUrl).toHaveBeenCalledWith("/finance/slips/expenses/expense-1.jpg");
  });

  it("does not look up an expense for non-expense entries", () => {
    wrap(<JournalDetailModal entry={{ ...entry, source_type: "sales_delivery", source_ref: "SO-1" }} isOpen={true} onClose={vi.fn()} />);
    expect(financeApi.getExpenseByCode).not.toHaveBeenCalled();
    expect(orderApi.getOrders).toHaveBeenCalledWith({ search: "SO-1", limit: 5 });
  });

  it("shows the source sales order with a deep link", async () => {
    vi.mocked(orderApi.getOrders).mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 9,
          orderNumber: "SO-1",
          customerName: "บริษัท ตัวอย่าง จำกัด",
          orderDate: "2026-11-10",
          totalAmount: 1250,
          fulfillmentStatus: "SHIPPED",
          paymentStatus: "—",
          channel: "Manual",
          itemsCount: 2,
        },
      ],
      meta: { page: 1, limit: 5, total: 1, totalPages: 1 },
    });

    wrap(
      <JournalDetailModal
        entry={{ ...entry, source_type: "sales_delivery", source_ref: "SO-1" }}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );

    expect(await screen.findByText("บริษัท ตัวอย่าง จำกัด")).toBeInTheDocument();
    expect(screen.getByText("เปิดใบสั่งขาย").closest("a")).toHaveAttribute("href", "/orders?search=SO-1");
  });

  it("shows the source sales return with evidence images", async () => {
    vi.mocked(returnApi.getReturns).mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 3,
          return_no: "RT-1",
          return_type: "CUSTOMER",
          order_no: "SO-1",
          customer_name: "คุณสมหญิง",
          warehouse_id: 1,
          return_date: "2026-11-12",
          status: "COMPLETED",
          total_qty: 1,
          subtotal: 500,
          vat_adjust: 0,
          net_amount: 500,
          lines: [
            {
              id: 1,
              sku: "SKU-1",
              name: "สินค้าตัวอย่าง",
              ordered_qty: 1,
              quantity: 1,
              unit_price: 500,
              line_amount: 500,
              condition: "DAMAGED",
              restock: false,
              reason_code: "DEFECT",
              evidence_images: ["/uploads/returns/damage.jpg"],
            },
          ],
        },
      ],
      meta: { page: 1, limit: 5, total: 1, totalPages: 1 },
    });

    wrap(
      <JournalDetailModal
        entry={{ ...entry, source_type: "sales_return", source_ref: "RT-1" }}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );

    expect(await screen.findByText("คุณสมหญิง")).toBeInTheDocument();
    expect(screen.getByText("เปิดใบรับคืน").closest("a")).toHaveAttribute("href", "/returns?search=RT-1");
    expect(screen.getByAltText("หลักฐานสภาพสินค้า")).toBeInTheDocument();
  });
});
