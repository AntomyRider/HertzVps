"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useProgramOverviewStore } from "@/store/programOverviewStore";
import ProgramTools from "./tools";
import ProgramKeyTable from "./table";

export default function ProgramDashboard() {
  const {
    summary,
    isLoading,
    error,
    autoRefreshInterval,
    fetchOverview,
    setIsRealtimeConnected,
  } = useProgramOverviewStore();

  // Initial fetch
  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Real-time SSE listener: Auto-refreshes immediately when data comes in
  useEffect(() => {
    let es: EventSource | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    try {
      es = new EventSource("/api/v1/private/program/overview/stream");

      es.addEventListener("open", () => {
        setIsRealtimeConnected(true);
      });

      es.addEventListener("connected", () => {
        setIsRealtimeConnected(true);
      });

      es.addEventListener("fleet_update", () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          fetchOverview(true);
        }, 500);
      });

      es.addEventListener("error", () => {
        setIsRealtimeConnected(false);
      });
    } catch (e) {
      console.error("Failed to connect to fleet SSE stream:", e);
      setIsRealtimeConnected(false);
    }

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (es) {
        es.close();
        setIsRealtimeConnected(false);
      }
    };
  }, [fetchOverview, setIsRealtimeConnected]);

  // Fallback polling interval
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
        <div className="h-11 w-full animate-pulse rounded-2xl bg-neutral-900/60" />

        {/* Table skeleton */}
        <div className="h-96 w-full animate-pulse rounded-3xl bg-neutral-900/60" />
      </div>
    );
  }

  // Error State
  if (error && !summary) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-rose-500/20 bg-neutral-950 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
          <AlertCircle size={24} />
        </div>
        <h3 className="mt-4 text-base font-semibold text-white">
          เกิดข้อผิดพลาดในการโหลดข้อมูลภาพรวม
        </h3>
        <p className="mt-1 max-w-md text-xs text-neutral-400">{error}</p>
        <button
          type="button"
          onClick={() => fetchOverview(false)}
          className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-500 cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>ลองใหม่อีกครั้ง</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Tools (Search, Status Filter, Refresh) */}
      <ProgramTools />

      {/* 2. Key Program Table (Status with dot ping, Duration, Key, Version, Account count) */}
      <ProgramKeyTable />
    </div>
  );
}
