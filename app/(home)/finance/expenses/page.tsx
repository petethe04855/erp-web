"use client";

import React, { useState } from "react";
import { useExpenses, useExpenseMutations } from "@/features/finance/queries/useFinanceQueries";
import { financeApi } from "@/features/finance/api/financeApi";
import { ExpenseTable } from "@/features/finance/components/ExpenseTable";
import { ExpenseModal } from "@/features/finance/components/ExpenseModal";
import type { Expense, CreateExpenseDTO } from "@/features/finance/types/finance";
import { Plus, Download, Search, RefreshCw, DollarSign, Tag } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";

export default function ExpensesPage() {
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [category, setCategory] = useState("all");
  const [channel, setChannel] = useState("all");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, refetch } = useExpenses({
    page,
    limit: 20,
    from: from || undefined,
    to: to || undefined,
    category: category !== "all" ? category : undefined,
    channel: channel !== "all" ? channel : undefined,
    search: search || undefined,
  });

  const { createExpense, updateExpense, deleteExpense, isCreating, isUpdating } = useExpenseMutations();

  const handleCreateOrUpdate = async (dto: CreateExpenseDTO) => {
    if (editingExpense) {
      await updateExpense({ id: editingExpense.id, data: dto });
    } else {
      await createExpense(dto);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await financeApi.downloadExport(
        "/finance/export/expenses",
        `expenses-export-${new Date().toISOString().split("T")[0]}.xlsx`,
        {
          from: from || undefined,
          to: to || undefined,
          category: category !== "all" ? category : undefined,
          channel: channel !== "all" ? channel : undefined,
        }
      );
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการดาวน์โหลด Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const totalAmount = data?.data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            บันทึกค่าใช้จ่าย (Expenses)
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            จัดการค่าใช้จ่ายรายหมวดหมู่/ช่องทาง พร้อมบันทึกลงสมุดรายวันอัตโนมัติ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} />
            รีเฟรช
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <Download size={14} />
            {isExporting ? "กำลังส่งออก..." : "ส่งออก Excel"}
          </button>
          <button
            onClick={() => {
              setEditingExpense(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Plus size={16} />
            บันทึกค่าใช้จ่าย
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm flex items-center gap-4">
          <div className="rounded-lg bg-red-50 p-3 text-red-600">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-xs text-neutral-500 font-medium">ยอดค่าใช้จ่ายรวม (ในหน้านี้)</span>
            <div className="font-mono text-xl font-bold text-neutral-900 mt-0.5">
              ฿{totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm flex items-center gap-4">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <Tag size={20} />
          </div>
          <div>
            <span className="text-xs text-neutral-500 font-medium">จำนวนรายการทั้งหมด</span>
            <div className="font-mono text-xl font-bold text-neutral-900 mt-0.5">
              {data?.meta?.total || data?.data?.length || 0} รายการ
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-neutral-400" size={16} />
            <input
              type="text"
              placeholder="ค้นหารหัส, ผู้รับเงิน, เลขที่บิล..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 pl-9 pr-3 py-1.5 text-xs focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">หมวดหมู่:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs focus:border-neutral-900 focus:outline-none"
          >
            <option value="all">ทุกหมวดหมู่</option>
            <option value="ค่าโฆษณา">ค่าโฆษณา</option>
            <option value="ค่าธรรมเนียมแพลตฟอร์ม">ค่าธรรมเนียมแพลตฟอร์ม</option>
            <option value="ต้นทุนขาย/วัตถุดิบ">ต้นทุนขาย/วัตถุดิบ</option>
            <option value="ค่าใช้จ่ายในการบริหาร">ค่าใช้จ่ายในการบริหาร</option>
            <option value="ค่าขนส่ง">ค่าขนส่ง</option>
            <option value="ค่าแรง/เงินเดือน">ค่าแรง/เงินเดือน</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">ช่องทาง:</span>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs focus:border-neutral-900 focus:outline-none"
          >
            <option value="all">ทุกช่องทาง</option>
            <option value="ทั่วไป">ทั่วไป</option>
            <option value="TikTok">TikTok</option>
            <option value="Shopee">Shopee</option>
            <option value="LINE">LINE</option>
            <option value="Manual">Manual</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">จาก:</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs focus:border-neutral-900 focus:outline-none"
          />
          <span className="text-xs text-neutral-500">ถึง:</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs focus:border-neutral-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <ExpenseTable
        expenses={data?.data || []}
        isLoading={isLoading}
        onEdit={(exp) => {
          setEditingExpense(exp);
          setIsModalOpen(true);
        }}
        onDelete={async (id) => {
          await deleteExpense(id);
        }}
      />

      {/* Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingExpense}
        isLoading={isCreating || isUpdating}
      />
      </div>
    </PageContainer>
  );
}
