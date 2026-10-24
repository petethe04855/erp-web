"use client";

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormulaFormModal } from "@/features/inventory/components/FormulaFormModal";

vi.mock("@/features/sku/api/skuApi", () => ({
  skuApi: {
    getSKUs: vi.fn().mockResolvedValue({
      data: [
        { id: 1, sku: "SKU-001", name: "สินค้า A", stockQuantity: 10, availableStock: 10 },
        { id: 2, sku: "SKU-002", name: "สินค้า B", stockQuantity: 5, availableStock: 5 },
      ],
    }),
    uploadImage: vi.fn().mockResolvedValue("https://example.com/img.jpg"),
  },
}));

vi.mock("@/features/inventory/api/formulaApi", () => ({
  formulaApi: {
    createFormula: vi.fn().mockResolvedValue({}),
    updateFormula: vi.fn().mockResolvedValue({}),
  },
}));

describe("FormulaFormModal SKU validation", () => {
  it("warns and alerts when attempting to submit without selecting SKU", async () => {
    const user = userEvent.setup();
    const handleSaved = vi.fn();
    const handleOpenChange = vi.fn();

    render(
      <FormulaFormModal
        open={true}
        onOpenChange={handleOpenChange}
        onSaved={handleSaved}
      />
    );

    // Enter Code and Name
    const codeInput = screen.getByPlaceholderText(/เช่น SET-A หรือ INV-01/);
    const nameInput = screen.getByPlaceholderText(/เช่น ชุดทำความสะอาดพร้อมใช้งาน/);

    await user.type(codeInput, "SET-TEST");
    await user.type(nameInput, "ชุดทดสอบ");

    // Click submit without selecting SKU
    const submitButton = screen.getByRole("button", { name: "บันทึก" });
    await user.click(submitButton);

    // Should display warning and error message
    const alerts = await screen.findAllByText(/กรุณาเลือกข้อมูล SKU วัตถุดิบ/);
    expect(alerts.length).toBeGreaterThan(0);

    // Modal should NOT close and onSaved should NOT be called
    expect(handleOpenChange).not.toHaveBeenCalledWith(false);
    expect(handleSaved).not.toHaveBeenCalled();
  });
});
