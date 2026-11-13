"use client";

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpenseTable } from "@/features/finance/components/ExpenseTable";
import { ExpenseModal } from "@/features/finance/components/ExpenseModal";
import { useAuthStore } from "@/stores/authStore";
import type { Expense } from "@/features/finance/types/finance";
import { toSlipApiPath } from "@/features/finance/hooks/useSlipImage";

describe("Expense Recorder (Created By) Feature", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: "1",
        name: "สมชาย ใจดี",
        email: "somchai@example.com",
        role: "accountant",
      },
      isAuthenticated: true,
      checked: true,
    });
  });

  it("renders ผู้บันทึก column header and recorder value in ExpenseTable", () => {
    const mockExpenses: Expense[] = [
      {
        id: 1,
        code: "EXP-2026-00001",
        date: "2026-10-26",
        category: "ค่าใช้จ่ายในการบริหาร",
        channel: "ทั่วไป",
        amount: 500,
        product_name: "กล่องพัสดุ",
        vendor: "ร้านพัสดุ",
        invoice_ref: "INV-001",
        description: "สั่งกล่องพัสดุ",
        created_by: "สมชาย ใจดี",
      },
    ];

    render(
      <ExpenseTable
        expenses={mockExpenses}
        isLoading={false}
        onEdit={vi.fn()}
        onVoid={vi.fn()}
      />
    );

    // Verify column header
    expect(screen.getByText("ผู้บันทึก")).toBeInTheDocument();

    // Verify row data
    expect(screen.getByText("สมชาย ใจดี")).toBeInTheDocument();
  });

  it("marks voided expenses and hides their edit/void actions", () => {
    const voided: Expense = {
      id: 2,
      code: "EXP-2026-00002",
      date: "2026-10-27",
      category: "ค่าขนส่ง",
      channel: "ทั่วไป",
      amount: 120,
      vendor: "",
      invoice_ref: "",
      description: "",
      created_by: "สมชาย ใจดี",
      status: "Voided",
      voided_by: "owner@example.com",
      void_reason: "บันทึกซ้ำ",
    };

    render(<ExpenseTable expenses={[voided]} isLoading={false} onEdit={vi.fn()} onVoid={vi.fn()} />);

    expect(screen.getByText("ยกเลิกแล้ว")).toBeInTheDocument();
    expect(screen.queryByTitle("ยกเลิกรายการ")).not.toBeInTheDocument();
  });

  it("maps stored slip URLs to the authenticated slip API", () => {
    expect(toSlipApiPath("/uploads/expenses/expense-1-abc.jpg")).toBe("/finance/slips/expenses/expense-1-abc.jpg");
    expect(toSlipApiPath("http://localhost:8084/uploads/incomes/i.png")).toBe("/finance/slips/incomes/i.png");
    expect(toSlipApiPath("/uploads/images/product.jpg")).toBeNull();
    expect(toSlipApiPath("blob:http://localhost/123")).toBeNull();
  });

  it("auto-fills current user name in ExpenseModal and allows editing", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <ExpenseModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
      />
    );

    // Verify recorder field exists and auto-filled with logged in user's name
    const recorderInput = screen.getByPlaceholderText("ระบุชื่อผู้ลงบันทึกค่าใช้จ่าย") as HTMLInputElement;
    expect(recorderInput).toBeInTheDocument();
    expect(recorderInput.value).toBe("สมชาย ใจดี");

    // Can change the recorder name
    await user.clear(recorderInput);
    await user.type(recorderInput, "น้องแนน ฝ่ายบัญชี");
    expect(recorderInput.value).toBe("น้องแนน ฝ่ายบัญชี");
  });
});
