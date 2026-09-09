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
        q.data && (
          <>
            <div className="border rounded-xl bg-white p-6 grid sm:grid-cols-2 gap-5 mb-6">
              {Object.entries(q.data.financial).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between gap-3 border-b pb-3 text-sm"
                >
                  <span className="text-neutral-500">{key}</span>
                  <span className="tabular-nums">
                    {value.toLocaleString("th-TH", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
            <div className="border rounded-xl bg-white overflow-auto">
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
                      <th className="p-4 text-left border-b" key={h}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {q.data.inventory.rows.map((r) => (
                    <tr key={r.SKU + "/" + r.Lot} className="border-t">
                      <td className="p-4">{r.SKU}</td>
                      <td>{r.ProductName}</td>
                      <td>{r.Lot}</td>
                      <td>{r.ExpiryDate}</td>
                      <td>{r.RemainingQty}</td>
                      <td>{r.Value.toLocaleString("th-TH")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      )}
    </PageContainer>
  );
}
