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

import { financeApi } from "@/features/finance/api/financeApi";

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
  });
});
