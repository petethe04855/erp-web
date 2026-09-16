"use client";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
export function Reports() {
  const q = useDashboard();
  return (
    <PageContainer>
      <PageHeader
        title="รายงานการเงินและสินค้าคงคลัง"
        description="ตัวเลขบัญชีจาก Backend และยอดล็อตคงเหลือปัจจุบัน"
        actions={
          <Input
            aria-label="เดือนรายงาน"
            type="month"
            value={q.month}
            onChange={(e) => {
              if (e.target.value) q.setMonth(e.target.value);
            }}
          />
        }
      />
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <ErrorState message={q.error.message} onRetry={() => q.refetch()} />
      ) : (
        q.data && (() => {
          const hasFinancialActivity =
            (q.data.financial.revenue || 0) > 0 ||
            (q.data.financial.cogs || 0) > 0 ||
            (q.data.financial.operatingExpenses || 0) > 0;
          const hasInventoryData = (q.data.inventory.rows || []).length > 0;
          const isEmptyPeriod = !hasFinancialActivity && (q.data.revenue.rows || []).length === 0;

          // Format month string into Thai readable text
          const [yearStr, monthStr] = q.month.split("-");
          const thaiMonthNames = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
          ];
          const mIndex = parseInt(monthStr, 10) - 1;
          const thaiMonthLabel =
            mIndex >= 0 && mIndex < 12
              ? `${thaiMonthNames[mIndex]} ${parseInt(yearStr, 10) + 543}`
              : q.month;

          return (
            <>
              {isEmptyPeriod && (
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">
                      ไม่พบข้อมูลธุรกรรมการขายในรอบเดือน {thaiMonthLabel}
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      ยอดตัวเลขทางการเงินสำหรับเดือนนี้เป็นศูนย์ หากต้องการดูข้อมูลย้อนหลัง โปรดเลือกเดือนก่อนหน้าที่มีการออกเอกสารขายจริง (เช่น สิงหาคม 2569) จากตัวเลือกเดือนด้านบน
                    </p>
                  </div>
                </div>
              )}

              <div className="border rounded-xl bg-white dark:bg-neutral-900 p-6 grid sm:grid-cols-2 gap-5 mb-6">
                {Object.entries(q.data.financial).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3 text-sm"
                  >
                    <span className="text-neutral-500 dark:text-neutral-400">{key}</span>
                    <span className="tabular-nums font-medium">
                      {value.toLocaleString("th-TH", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border rounded-xl bg-white dark:bg-neutral-900 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {[
                        "SKU",
                        "สินค้า",
                        "ล็อต",
                        "หมดอายุ",
                        "คงเหลือ",
                        "มูลค่า",
                      ].map((h) => (
                        <th className="p-4 text-left border-b border-neutral-100 dark:border-neutral-800 font-semibold" key={h}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {!hasInventoryData ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-sm text-neutral-400 italic">
                          ไม่พบข้อมูลล็อตสินค้าคงคลังในเดือนนี้
                        </td>
                      </tr>
                    ) : (
                      q.data.inventory.rows.map((r) => (
                        <tr key={r.SKU + "/" + r.Lot} className="border-t border-neutral-100 dark:border-neutral-800">
                          <td className="p-4 font-mono font-medium">{r.SKU}</td>
                          <td>{r.ProductName}</td>
                          <td>{r.Lot || "—"}</td>
                          <td>{r.ExpiryDate || "—"}</td>
                          <td className="tabular-nums">{r.RemainingQty.toLocaleString("th-TH")}</td>
                          <td className="tabular-nums font-medium">{r.Value.toLocaleString("th-TH")}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()
      )}
    </PageContainer>
  );
}
