import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/axios", () => ({
  default: { get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import { SKUTable } from "@/features/sku/components/SKUTable";
import type { SKU, BulkDeleteSKUResult } from "@/features/sku/types/sku";

const sku = (id: number, code: string, name: string): SKU =>
  ({ id, sku: code, name, category: "Finished Product", status: "active", createdAt: "2026-01-01T00:00:00Z" }) as SKU;

const rows = [sku(1, "SKU-A", "Alpha"), sku(2, "SKU-B", "Beta"), sku(3, "SKU-C", "Gamma")];

function renderTable(onBulkDelete: (ids: number[]) => Promise<BulkDeleteSKUResult>, page = 1) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const ui = (p: number) => (
    <QueryClientProvider client={qc}>
      <SKUTable
        skus={rows}
        meta={{ page: p, limit: 10, total: 3, totalPages: 2 }}
        isLoading={false}
        isError={false}
        onPageChange={vi.fn()}
        onRetry={vi.fn()}
        onChangeStatus={vi.fn()}
        onBulkDelete={onBulkDelete}
      />
    </QueryClientProvider>
  );
  const utils = render(ui(page));
  return { ...utils, rerenderPage: (p: number) => utils.rerender(ui(p)) };
}

describe("SKU bulk delete", () => {
  it("hides the bulk action until rows are selected", () => {
    renderTable(vi.fn());
    expect(screen.queryByRole("button", { name: /ลบที่เลือก/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("เลือก SKU SKU-A"));
    expect(screen.getByRole("button", { name: "ลบที่เลือก (1)" })).toBeInTheDocument();
  });

  it("lists the selected SKUs and deletes only after confirming", async () => {
    const onBulkDelete = vi.fn().mockResolvedValue({
      requested: 2,
      deleted: 1,
      failed: 1,
      results: [
        { id: 1, sku: "SKU-A", name: "Alpha", deleted: true },
        { id: 3, sku: "SKU-C", name: "Gamma", deleted: false, code: "PRODUCT_IN_USE", error: "ไม่สามารถลบสินค้านี้ได้: มีสต็อกคงเหลือ (2 รายการ)" },
      ],
    });
    renderTable(onBulkDelete);

    fireEvent.click(screen.getByLabelText("เลือก SKU SKU-A"));
    fireEvent.click(screen.getByLabelText("เลือก SKU SKU-C"));
    fireEvent.click(screen.getByRole("button", { name: "ลบที่เลือก (2)" }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("ยืนยันการลบ SKU 2 รายการ")).toBeInTheDocument();
    expect(within(dialog).getByText("SKU-A")).toBeInTheDocument();
    expect(within(dialog).getByText("Gamma")).toBeInTheDocument();
    expect(within(dialog).queryByText("SKU-B")).not.toBeInTheDocument();
    expect(onBulkDelete).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole("button", { name: "ยืนยันลบ 2 รายการ" }));
    expect(await screen.findByText(/ลบสำเร็จ 1 รายการ/)).toBeInTheDocument();
    expect(onBulkDelete).toHaveBeenCalledWith([1, 3]);
    expect(screen.getByText(/ลบไม่ได้ 1 รายการ/)).toBeInTheDocument();
    expect(screen.getByText(/มีสต็อกคงเหลือ \(2 รายการ\)/)).toBeInTheDocument();
  });

  it("cancel keeps the data and the selection", () => {
    const onBulkDelete = vi.fn();
    renderTable(onBulkDelete);
    fireEvent.click(screen.getByLabelText("เลือกทั้งหมดในหน้านี้"));
    fireEvent.click(screen.getByRole("button", { name: "ลบที่เลือก (3)" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "ยกเลิก" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onBulkDelete).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "ลบที่เลือก (3)" })).toBeInTheDocument();
  });

  it("clears the selection when the page changes", () => {
    const { rerenderPage } = renderTable(vi.fn());
    fireEvent.click(screen.getByLabelText("เลือก SKU SKU-B"));
    expect(screen.getByRole("button", { name: "ลบที่เลือก (1)" })).toBeInTheDocument();
    rerenderPage(2);
    expect(screen.queryByRole("button", { name: /ลบที่เลือก/ })).not.toBeInTheDocument();
  });
});
