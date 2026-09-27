"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useProgramOverviewStore } from "@/store/programOverviewStore";
import ProgramTools from "./tools";
import ProgramKpiCards from "./kpi-cards";
import ProgramChart from "./chart";
import ProgramFunctionBreakdown from "./function-breakdown";
import ProgramKeyTable from "./table";
import ProgramDetailDialog from "./detail-dialog";
import ProgramRecentErrorsCard from "./recent-errors-card";

export default function ProgramDashboard() {
  const {
    summary,
    keys,
    isLoading,
    error,
    autoRefreshInterval,
    fetchOverview,
  } = useProgramOverviewStore();

  // Initial fetch
  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Polling interval
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;

    const timer = setInterval(() => {
      fetchOverview(true);
    }, autoRefreshInterval);

    return () => clearInterval(timer);
  }, [autoRefreshInterval, fetchOverview]);

  // Initial Skeleton Loading State
  if (isLoading && !summary) {
    return (
      <div className="space-y-6">
        {/* Tools skeleton */}
        <div className="h-10 w-full animate-pulse rounded-md bg-neutral-900/60" />

        {/* KPI Cards skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 w-full animate-pulse rounded-md bg-neutral-900/60"
            />
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="h-80 w-full animate-pulse rounded-md bg-neutral-900/60" />

        {/* Function breakdown skeleton */}
        <div className="h-44 w-full animate-pulse rounded-md bg-neutral-900/60" />

        {/* Table skeleton */}
        <div className="h-96 w-full animate-pulse rounded-md bg-neutral-900/60" />
      </div>
    );
  }

  // Error State
  if (error && !summary) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-rose-500/20 bg-neutral-950 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-rose-500/20 bg-rose-500/10 text-rose-400">
          <AlertCircle size={24} />
        </div>
        <h3 className="mt-4 text-base font-semibold text-white">
          เกิดข้อผิดพลาดในการโหลดข้อมูลภาพรวม
        </h3>
        <p className="mt-1 max-w-md text-xs text-neutral-400">{error}</p>
        <button
          onClick={() => fetchOverview(false)}
          className="mt-6 flex items-center gap-2 rounded-sm bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-500 cursor-pointer"
        >
          <RefreshCw size={14} />
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Tools (Search, Status Filter, Refresh, Auto-refresh) */}
      <ProgramTools />

      {/* 2. KPI Cards (Total Keys, Online Now, Success Rate %, Weakest Action) */}
      <ProgramKpiCards />

      {/* 3. Fleet Activity Chart (วางไว้ก่อน ประสิทธิภาพแยกตามฟังก์ชัน) */}
      <ProgramChart />

      {/* 4. Function Breakdown (POST vs COMMENT vs REACTION) */}
      <ProgramFunctionBreakdown />

      {/* 5. Fleet Live Errors (Stream) */}
      <ProgramRecentErrorsCard />

      {/* 6. Key Health Table */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            สถานะสุขภาพและประสิทธิภาพรายคีย์
          </h3>
          <span className="text-xs text-neutral-500">
            ทั้งหมด {keys.length} คีย์ (เปิดใช้งานแล้ว)
          </span>
        </div>
        <ProgramKeyTable />
      </div>

      {/* 7. Detail Inspector Dialog */}
      <ProgramDetailDialog />
    </div>
  );
}
