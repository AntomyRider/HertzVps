"use client";

import SearchUI from "@/components/ui/search";
import { RefreshCw } from "lucide-react";
import {
  useProgramOverviewStore,
  type ProgramStatusFilter,
} from "@/store/programOverviewStore";
import { cn } from "@/lib/utils";

export default function ProgramTools() {
  const {
    keys,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    isRefreshing,
    isRealtimeConnected,
    fetchOverview,
  } = useProgramOverviewStore();

  const totalCount = keys.length;
  const onlineCount = keys.filter((k) => k.isOnline).length;
  const offlineCount = keys.filter((k) => !k.isOnline).length;

  const FILTER_TABS: Array<{
    label: string;
    value: ProgramStatusFilter;
    count: number;
    showPing?: boolean;
  }> = [
    { label: "ทั้งหมด", value: "ALL", count: totalCount },
    { label: "ออนไลน์", value: "ONLINE", count: onlineCount, showPing: true },
    { label: "ออฟไลน์", value: "OFFLINE", count: offlineCount },
  ];

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {/* Search Input */}
      <SearchUI
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="ค้นหารหัสคีย์โปรแกรม..."
        className="w-full lg:max-w-md rounded-2xl border-neutral-800 bg-neutral-900/60"
      />

      {/* Filter Tabs & Refresh Action */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Status Filter Pills (rounded-2xl container, rounded-xl pills) */}
        <div className="flex items-center gap-1 rounded-2xl border border-neutral-800 bg-neutral-950 p-1">
          {FILTER_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition cursor-pointer",
                  isActive
                    ? "bg-neutral-800 text-white shadow-xs"
                    : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                )}
              >
                {tab.showPing && onlineCount > 0 && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                )}
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-2xs font-semibold",
                    isActive
                      ? "bg-neutral-900 text-blue-400 border border-neutral-700/60"
                      : "bg-neutral-900/80 text-neutral-500"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Realtime Live Sync Pill */}
        {isRealtimeConnected && (
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Realtime สด</span>
          </div>
        )}

        {/* Refresh Button */}
        <button
          type="button"
          onClick={() => fetchOverview(false)}
          disabled={isRefreshing}
          title="รีเฟรชข้อมูล"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-400 transition hover:border-neutral-700 hover:text-white disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw
            size={14}
            strokeWidth={1.8}
            className={isRefreshing ? "animate-spin text-blue-400" : ""}
          />
        </button>
      </div>
    </div>
  );
}
