import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/features/shopee/api/shopee.api", () => ({
  shopeeApi: {
    previewOrderRepair: vi.fn(),
    applyOrderRepair: vi.fn(),
  },
}));

import { shopeeApi } from "@/features/shopee/api/shopee.api";
import { ShopeeOrderRepairModal } from "@/features/shopee/components/ShopeeOrderRepairModal";
import type { OrderRepairPreview } from "@/features/shopee/types/shopee.types";

const preview: OrderRepairPreview = {
  total_rows: 4,
  orders_in_file: 4,
  orders_in_db: 3,
  orders_not_in_db: 1,
  orders_to_repair: 1,
  orders_unchanged: 1,
  date_changes: 1,
  month_changes: 1,
  qty_changes: 1,
  variation_changes: 1,
  repairs: [
    {
      order_id: "2606300ABC",
      old_order_date: "2026-07-02T10:15:00Z",
      new_order_date: "2026-06-30T14:09:00Z",
      date_changed: true,
      items: [
        { item_id: 10, sku: "FD-03", product_name: "ฟรีซดราย", old_qty: 1, new_qty: 2, old_variation: "", new_variation: "3 ถุง" },
      ],
    },
  ],
  skipped: [{ order_id: "C", reason: "จำนวนบรรทัดไม่ตรงกัน (ในระบบ 1, ในไฟล์ 2)" }],
};

function drop(files: File[]) {
  fireEvent.drop(screen.getByTestId("file-drop-zone"), { dataTransfer: { files, types: ["Files"] } });
}

describe("Shopee order repair dialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("previews what will change, then applies it", async () => {
    vi.mocked(shopeeApi.previewOrderRepair).mockResolvedValue(preview);
    vi.mocked(shopeeApi.applyOrderRepair).mockResolvedValue({
      batch_id: "repair-1",
      orders_repaired: 1,
      items_repaired: 1,
      skipped: preview.skipped,
      inserted_count: 1,
      skipped_count: 1,
    });
    const onSuccess = vi.fn();
    render(<ShopeeOrderRepairModal isOpen onClose={vi.fn()} onSuccess={onSuccess} />);

    drop([new File(["x"], "Order.completed.20260601_20260630.xlsx")]);
    expect(await screen.findByText("พร้อมแก้ไข")).toBeInTheDocument();
    expect(screen.getByText("ต้องแก้ 1")).toBeInTheDocument();
    expect(screen.getByText("ย้ายเดือน 1")).toBeInTheDocument();
    expect(screen.getByText("ข้าม 1")).toBeInTheDocument();
    expect(shopeeApi.applyOrderRepair).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /แก้ไข 1 ไฟล์/ }));
    await waitFor(() => expect(shopeeApi.applyOrderRepair).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/แก้ไขสำเร็จ 1 ไฟล์/)).toBeInTheDocument();
    expect(onSuccess).toHaveBeenCalled();
  });
});
