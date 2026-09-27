"use client";

import { Search, RefreshCw, Filter, Clock } from "lucide-react";
import {
  useProgramOverviewStore,
  type ProgramStatusFilter,
} from "@/store/programOverviewStore";

const INTERVAL_OPTIONS = [
  { label: "ปิด Auto Refresh", value: 0 },
  { label: "5 วินาที", value: 5_000 },
  { label: "10 วินาที", value: 10_000 },
  { label: "30 วินาที", value: 30_000 },
];

const FILTER_OPTIONS: { label: string; value: ProgramStatusFilter }[] = [
  { label: "ทั้งหมด", value: "ALL" },
  { label: "ออนไลน์", value: "ONLINE" },
  { label: "ออฟไลน์", value: "OFFLINE" },
  { label: "พบข้อผิดพลาด", value: "HAS_ERRORS" },
];

export default function ProgramTools() {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    autoRefreshInterval,
    setAutoRefreshInterval,
    isRefreshing,
    isRealtimeConnected,
    fetchOverview,
  } = useProgramOverviewStore();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search
          size={16}
          strokeWidth={1.8}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาตามรหัสคีย์ หรือ HWID..."
          className="w-full rounded-sm border border-neutral-800 bg-neutral-950 py-2 pl-9 pr-3 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-blue-500/50"
        />
      </div>

      {/* Actions and Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter Buttons */}
        <div className="flex items-center rounded-sm border border-neutral-800 bg-neutral-950 p-0.5">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`rounded-sm px-2.5 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Auto Refresh Select */}
        <div className="relative flex items-center">
          <Clock
            size={14}
            strokeWidth={1.8}
            className="pointer-events-none absolute left-2.5 text-neutral-400"
          />
          <select
            value={autoRefreshInterval}
            onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
            className="rounded-sm border border-neutral-800 bg-neutral-950 py-2 pl-8 pr-3 text-xs text-neutral-300 outline-none transition hover:border-neutral-700 focus:border-blue-500/50"
          >
            {INTERVAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-neutral-950">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Real-time Live Sync Badge */}
        {isRealtimeConnected && (
          <div className="flex items-center gap-1.5 rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="hidden sm:inline">Auto-Sync สด</span>
          </div>
        )}

        {/* Manual Refresh Button */}
        <button
          onClick={() => fetchOverview(false)}
          disabled={isRefreshing}
          title="รีเฟรชข้อมูล"
          className="flex h-9 w-9 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-950 text-neutral-400 transition hover:border-neutral-700 hover:text-white disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            strokeWidth={1.8}
            className={isRefreshing ? "animate-spin text-blue-400" : ""}
          />
        </button>
      </div>
    </div>
  );
}
