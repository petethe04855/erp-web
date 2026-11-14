"use client";

import React from "react";
import { shopeeApi } from "../api/shopee.api";
import type { IncomePreviewResult, IncomeImportResult } from "../types/shopee.types";
import { ShopeeMultiFileUpload } from "./ShopeeMultiFileUpload";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const baht = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2 });

export function ShopeeIncomeUploadModal({ isOpen, onClose, onSuccess }: Props) {
  return (
    <ShopeeMultiFileUpload<IncomePreviewResult, IncomeImportResult>
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      title="นำเข้าไฟล์รายงานการโอนเงิน Shopee (Income / Settlement Export)"
      subtitle='ลากวางหรือเลือกได้หลายไฟล์ (Excel ที่มีชีต "Income" หรือ .csv) ไฟล์ที่มีข้อมูลซ้ำจะไม่ถูกนำเข้า'
      dropHint='ไฟล์ Shopee Income (.xlsx, .xls, .csv ที่มีชีต "Income") — เลือกได้หลายไฟล์'
      accent="emerald"
      preview={shopeeApi.previewIncome}
      importFile={shopeeApi.importIncome}
      renderSummary={(p) => (
        <>
          <span>{p.total_rows.toLocaleString()} แถว</span>
          <span className="text-emerald-600">฿{baht(p.total_net_amount)}</span>
        </>
      )}
      renderSample={(p) => (
        <div className="overflow-hidden rounded-lg border dark:border-zinc-800">
          <div className="bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            ตัวอย่างข้อมูล (สูงสุด 50 รายการแรก)
          </div>
          <div className="max-h-56 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                <tr className="border-b dark:border-zinc-800">
                  <th className="p-2">Order ID</th>
                  <th className="p-2">วันที่สั่งซื้อ</th>
                  <th className="p-2">วันที่โอนเงินสำเร็จ</th>
                  <th className="p-2 text-right">ยอดเงินโอน (฿)</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-zinc-800">
                {p.sample_rows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-mono font-medium">{row.order_id}</td>
                    <td className="p-2 text-zinc-500">
                      {row.order_date ? new Date(row.order_date).toLocaleDateString("th-TH") : "-"}
                    </td>
                    <td className="p-2 font-medium text-emerald-600">
                      {row.transfer_date ? new Date(row.transfer_date).toLocaleDateString("th-TH") : "-"}
                    </td>
                    <td className="p-2 text-right font-mono font-bold">{baht(row.net_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    />
  );
}
