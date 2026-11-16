"use client";

import React from "react";
import { shopeeApi } from "../api/shopee.api";
import type { OrderPreviewResult, OrderImportResult } from "../types/shopee.types";
import { ShopeeMultiFileUpload } from "./ShopeeMultiFileUpload";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ShopeeOrderUploadModal({ isOpen, onClose, onSuccess }: Props) {
  return (
    <ShopeeMultiFileUpload<OrderPreviewResult, OrderImportResult>
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      title="นำเข้าไฟล์คำสั่งซื้อ Shopee (Orders Export)"
      subtitle="ลากวางหรือเลือกได้หลายไฟล์ (.xlsx, .xls, .csv) ไฟล์ที่มีข้อมูลซ้ำจะไม่ถูกนำเข้า"
      dropHint="ไฟล์ Shopee Orders (.xlsx, .xls, .csv) — เลือกได้หลายไฟล์"
      accent="orange"
      preview={shopeeApi.previewOrders}
      importFile={shopeeApi.importOrders}
      renderSummary={(p) => (
        <>
          <span>{p.total_rows.toLocaleString()} แถว</span>
          <span className="text-orange-600">{p.total_orders.toLocaleString()} ออเดอร์</span>
          {p.blank_sku_count > 0 && <span className="text-amber-600">ไม่มี SKU {p.blank_sku_count}</span>}
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
                  <th className="p-2">SKU</th>
                  <th className="p-2">ชื่อสินค้า</th>
                  <th className="p-2 text-center">จำนวน</th>
                  <th className="p-2 text-right">ยอดรวม (฿)</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-zinc-800">
                {p.sample_rows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-mono">{row.order_id}</td>
                    <td className="p-2 font-mono font-medium text-orange-600">
                      {row.sku || <span className="italic text-zinc-400">ว่าง</span>}
                    </td>
                    <td className="max-w-[200px] truncate p-2" title={row.product_name}>{row.product_name}</td>
                    <td className="p-2 text-center">{row.qty}</td>
                    <td className="p-2 text-right font-medium">{row.sale_price.toFixed(2)}</td>
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
