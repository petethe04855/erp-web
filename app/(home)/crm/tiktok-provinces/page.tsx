"use client";

import React, { useMemo, useState } from "react";
import { CalendarRange, X } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProvinceSearch } from "@/features/crm/components/ProvinceSearch";
import { ProvinceSummaryCards } from "@/features/crm/components/ProvinceSummaryCards";
import { ProvinceBarChart } from "@/features/crm/components/ProvinceBarChart";
import { ProvinceTable } from "@/features/crm/components/ProvinceTable";
import {
  MonthlyTrendChart,
  WeeklySalesChart,
} from "@/features/crm/components/SalesTrendCharts";
import { useTiktokProvinceSearch } from "@/features/crm/hooks/useTiktokProvinces";
import { datePresetRange } from "@/features/crm/utils/dateRange";
import type {
  ProvinceQueryParams,
  SalesTrendPoint,
} from "@/features/crm/types/crm";

function defaultFilters(): ProvinceQueryParams {
  return {
    ...datePresetRange("30d"),
    status: "fulfilled",
    channel: "all",
  };
}

interface WeekDrilldown {
  week: SalesTrendPoint;
  previous: ProvinceQueryParams;
}

export default function TiktokProvincesPage() {
  const [filters, setFilters] = useState<ProvinceQueryParams>(defaultFilters);
  const [drilldown, setDrilldown] = useState<WeekDrilldown | null>(null);

  const searchParams = useMemo(
    () => ({
      channel: filters.channel || "all",
      status: filters.status || "fulfilled",
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }),
    [filters.channel, filters.status, filters.dateFrom, filters.dateTo],
  );

  const { summary, provinces, regions, trend, isLoading, isFetching, refetch } =
    useTiktokProvinceSearch(searchParams);

  const drillIntoWeek = (week: SalesTrendPoint) => {
    setDrilldown((current) => ({
      week,
      previous: current?.previous ?? filters,
    }));
    setFilters((prev) => ({
      ...prev,
      dateFrom: week.startDate,
      dateTo: week.endDate,
    }));
  };

  const exitDrilldown = () => {
    if (drilldown) setFilters(drilldown.previous);
    setDrilldown(null);
  };

  const handleFiltersChange = (next: ProvinceQueryParams) => {
    // Manually changing filters ends the week drill-down.
    setDrilldown(null);
    setFilters(next);
  };

  return (
    <PageContainer>
      <PageHeader
        title="🗺️ สัดส่วนและการกระจายตัวของลูกค้าตามจังหวัด"
        description="วิเคราะห์สัดส่วนที่ตั้งลูกค้าจากคำสั่งซื้อทั้งหมด (TikTok + Shopee) เพื่อวางแผนโลจิสติกส์ การตลาดเจาะกลุ่มพื้นที่ และการตั้งศูนย์กระจายสินค้า"
      />

      <div className="space-y-6">
        <ProvinceSearch
          filters={filters}
          onChange={handleFiltersChange}
          isFetching={isFetching}
          onRefresh={() => refetch()}
        />

        {drilldown && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-500/30 bg-cyan-50 px-4 py-2.5 text-xs text-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-200">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4" />
              <span>
                กำลังเจาะลึกสัปดาห์ <strong>{drilldown.week.period}</strong> (
                {drilldown.week.startDate} – {drilldown.week.endDate})
              </span>
            </div>
            <button
              type="button"
              onClick={exitDrilldown}
              className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-white px-2 py-1 font-medium hover:bg-cyan-100 dark:bg-transparent dark:hover:bg-cyan-900/40"
            >
              <X className="h-3 w-3" />
              ยกเลิกเจาะลึก (กลับสู่สัปดาห์ทั้งหมด)
            </button>
          </div>
        )}

        <WeeklySalesChart
          weeks={trend?.weekly ?? []}
          isLoading={isLoading}
          onSelectWeek={drillIntoWeek}
        />

        <MonthlyTrendChart
          months={trend?.monthly ?? []}
          isLoading={isLoading}
        />

        {/* <ProvinceSummaryCards
          summary={summary}
          provinces={provinces}
          isLoading={isLoading}
        />

        <ProvinceBarChart
          provinces={provinces}
          regions={regions}
          isLoading={isLoading}
        /> */}

        <ProvinceTable provinces={provinces} isLoading={isLoading} />
      </div>
    </PageContainer>
  );
}
