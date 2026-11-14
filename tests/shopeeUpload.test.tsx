import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/features/shopee/api/shopee.api", () => ({
  shopeeApi: {
    previewOrders: vi.fn(),
    importOrders: vi.fn(),
    previewIncome: vi.fn(),
    importIncome: vi.fn(),
  },
}));

import { shopeeApi } from "@/features/shopee/api/shopee.api";
import { ShopeeOrderUploadModal } from "@/features/shopee/components/ShopeeOrderUploadModal";

const preview = (dup = 0) => ({
  total_rows: 3,
  total_orders: 2,
  blank_sku_count: 0,
  duplicate_count: dup,
  duplicate_details: dup
    ? [{ identifier: "ORD-1", row_index: 2, duplicate_type: "DB_EXISTING" as const, message: "มีในระบบแล้ว" }]
    : [],
  sample_rows: [],
  sample_orders: [],
});

const file = (name: string, size = 10) => new File(["x".repeat(size)], name);

function drop(files: File[]) {
  fireEvent.drop(screen.getByTestId("file-drop-zone"), { dataTransfer: { files, types: ["Files"] } });
}

function renderModal(onSuccess = vi.fn()) {
  render(<ShopeeOrderUploadModal isOpen onClose={vi.fn()} onSuccess={onSuccess} />);
  return onSuccess;
}

describe("Shopee multi-file upload", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts several dropped files and previews each", async () => {
    vi.mocked(shopeeApi.previewOrders).mockResolvedValue(preview());
    renderModal();
    drop([file("a.xlsx"), file("b.csv")]);

    expect(await screen.findByText("a.xlsx")).toBeInTheDocument();
    expect(screen.getByText("b.csv")).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText("พร้อมนำเข้า")).toHaveLength(2));
    expect(shopeeApi.previewOrders).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: /นำเข้า 2 ไฟล์/ })).toBeEnabled();
  });

  it("rejects files with an unsupported extension", async () => {
    renderModal();
    drop([file("photo.png")]);
    expect(await screen.findByText(/photo\.png/)).toBeInTheDocument();
    expect(shopeeApi.previewOrders).not.toHaveBeenCalled();
  });

  it("warns about duplicate data and does not upload that file", async () => {
    vi.mocked(shopeeApi.previewOrders).mockImplementation(async (f: File) => preview(f.name === "dup.xlsx" ? 1 : 0));
    vi.mocked(shopeeApi.importOrders).mockResolvedValue({ inserted_count: 2, skipped_count: 0, total_rows: 3 });
    renderModal();
    drop([file("dup.xlsx"), file("ok.xlsx")]);

    expect(await screen.findByRole("alert")).toHaveTextContent("พบข้อมูลซ้ำ 1 ไฟล์");
    expect(screen.getByText("ข้อมูลซ้ำ - นำเข้าไม่ได้")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /นำเข้า 1 ไฟล์/ }));
    await waitFor(() => expect(shopeeApi.importOrders).toHaveBeenCalledTimes(1));
    expect(vi.mocked(shopeeApi.importOrders).mock.calls[0][0].name).toBe("ok.xlsx");
  });

  it("blocks all import when every file has duplicates", async () => {
    vi.mocked(shopeeApi.previewOrders).mockResolvedValue(preview(3));
    renderModal();
    drop([file("dup.xlsx")]);
    await screen.findByText("ข้อมูลซ้ำ - นำเข้าไม่ได้");
    expect(screen.getByRole("button", { name: /นำเข้า 0 ไฟล์/ })).toBeDisabled();
  });

  it("blocks a file that overlaps with one imported earlier in the batch", async () => {
    let imported = false;
    vi.mocked(shopeeApi.previewOrders).mockImplementation(async (f: File) =>
      preview(f.name === "b.xlsx" && imported ? 2 : 0),
    );
    vi.mocked(shopeeApi.importOrders).mockImplementation(async () => {
      imported = true;
      return { inserted_count: 2, skipped_count: 0, total_rows: 3 };
    });
    const onSuccess = renderModal();
    drop([file("a.xlsx"), file("b.xlsx")]);
    await waitFor(() => expect(screen.getAllByText("พร้อมนำเข้า")).toHaveLength(2));

    fireEvent.click(screen.getByRole("button", { name: /นำเข้า 2 ไฟล์/ }));
    expect(await screen.findByText(/ไม่นำเข้าเพราะพบข้อมูลซ้ำกับไฟล์ก่อนหน้า: b\.xlsx/)).toBeInTheDocument();
    expect(shopeeApi.importOrders).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalled();
  });

  it("keeps importing other files when one fails", async () => {
    vi.mocked(shopeeApi.previewOrders).mockResolvedValue(preview());
    vi.mocked(shopeeApi.importOrders).mockImplementation(async (f: File) => {
      if (f.name === "bad.xlsx") throw new Error("server error");
      return { inserted_count: 5, skipped_count: 0, total_rows: 5 };
    });
    renderModal();
    drop([file("bad.xlsx"), file("good.xlsx")]);
    await waitFor(() => expect(screen.getAllByText("พร้อมนำเข้า")).toHaveLength(2));

    fireEvent.click(screen.getByRole("button", { name: /นำเข้า 2 ไฟล์/ }));
    expect(await screen.findByText(/นำเข้าไม่สำเร็จ: bad\.xlsx/)).toBeInTheDocument();
    expect(screen.getByText(/นำเข้าสำเร็จ 1 ไฟล์ \(5 รายการ\)/)).toBeInTheDocument();
  });

  it("skips the same file added twice and can remove a file", async () => {
    vi.mocked(shopeeApi.previewOrders).mockResolvedValue(preview());
    renderModal();
    drop([file("a.xlsx")]);
    await screen.findByText("พร้อมนำเข้า");
    drop([file("a.xlsx")]);
    expect(await screen.findByText(/เลือกไฟล์นี้ไว้แล้ว/)).toBeInTheDocument();
    expect(shopeeApi.previewOrders).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle("เอาไฟล์ออก"));
    expect(screen.queryByText("a.xlsx")).not.toBeInTheDocument();
  });
});
