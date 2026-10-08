"use client";

import React, { useState, useMemo } from "react";
import { RefreshCw, MapPin, X } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ProvinceSearch } from "@/features/crm/components/ProvinceSearch";
import { ProvinceSummaryCards } from "@/features/crm/components/ProvinceSummaryCards";
import { ProvinceBarChart } from "@/features/crm/components/ProvinceBarChart";
import { ProvinceTable } from "@/features/crm/components/ProvinceTable";
import { useTiktokProvinceSearch } from "@/features/crm/hooks/useTiktokProvinces";
import type { ProvinceQueryParams } from "@/features/crm/types/crm";

export default function TiktokProvincesPage() {
  const [filters, setFilters] = useState<ProvinceQueryParams>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return {
      dateFrom: start.toISOString().split("T")[0],
      dateTo: end.toISOString().split("T")[0],
      status: "fulfilled",
      province: "",
      channel: "all",
    };
  });

  // Always query by channel, status, and dates so that the Top 10 bar chart,
  // ranking list, and search dropdown accurately reflect the selected platform.
  const searchParams = useMemo(
    () => ({
      channel: filters.channel || "all",
      status: filters.status || "fulfilled",
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }),
    [filters.channel, filters.status, filters.dateFrom, filters.dateTo],
  );

  const { summary, provinces, isLoading, isFetching, refetch } =
    useTiktokProvinceSearch(searchParams);

  // Table filters to selected province if one is chosen in the search or chart
  const displayedTableProvinces = useMemo(() => {
    if (!filters.province) return provinces;
    return provinces.filter((p) => p.province === filters.province);
  }, [provinces, filters.province]);

  return (
    <PageContainer>
      <PageHeader
        title="ลูกค้าตามจังหวัด"
        description="รายงานสรุปภูมิศาสตร์ยอดขายและคำสั่งซื้อ รวม TikTok และ Shopee แยกตามรายจังหวัด — เลือกช่องทางเพื่อดูแยกเฉพาะ"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 text-xs"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${
                isFetching ? "animate-spin text-primary" : ""
              }`}
            />
            รีเฟรชข้อมูล
          </Button>
        }
      />

      <div className="space-y-6">
        <ProvinceSearch
          filters={filters}
          onChange={setFilters}
          provinces={provinces}
          availableProvinces={provinces}
          isFetching={isFetching}
          onRefresh={() => refetch()}
        />

        {/* Selected Province Filter Banner */}
        {filters.province && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 text-xs text-neutral-800 dark:text-neutral-200">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>
                กำลังกรองรายงานเฉพาะ:{" "}
                <strong className="font-semibold text-primary">
                  {filters.province}
                </strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, province: "" }))}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-medium transition-colors"
            >
              <X className="w-3 h-3" />
              ดูทุกจังหวัด
            </button>
          </div>
        )}

        <ProvinceSummaryCards summary={summary} isLoading={isLoading} />

        <ProvinceBarChart
          provinces={provinces}
          isLoading={isLoading}
          selectedProvince={filters.province}
          onSelectProvince={(prov) =>
            setFilters((prev) => ({ ...prev, province: prov }))
          }
        />

        <ProvinceTable
          provinces={displayedTableProvinces}
          isLoading={isLoading}
          selectedProvince={filters.province}
          onSelectProvince={(prov) =>
            setFilters((prev) => ({ ...prev, province: prov }))
          }
        />
      </div>
    </PageContainer>
  );
}
