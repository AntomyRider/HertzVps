"use client";

import { useEffect } from "react";
import { useServerStore } from "@/store/serverStore";
import HeaderTools from "./header-tools";
import SystemCard from "./system-card";
import CpuCard from "./cpu-card";
import MemoryCard from "./memory-card";
import DiskCard from "./disk-card";
import ServiceCard from "./service-card";
import NetworkCard from "./network-card";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";

export default function ServerDashboard() {
  const { metrics, isLoading, error, refreshInterval, fetchMetrics } = useServerStore();

  // Initial fetch on mount
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Polling interval
  useEffect(() => {
    if (refreshInterval <= 0) return;
    const timer = setInterval(() => {
      fetchMetrics(true);
    }, refreshInterval);

    return () => clearInterval(timer);
  }, [refreshInterval, fetchMetrics]);

  // Initial Loading Skeleton State
  if (isLoading && !metrics) {
    return (
      <div className="space-y-5">
        {/* Header tools skeleton */}
        <div className="h-16 w-full animate-pulse rounded-md bg-neutral-900/60" />

        {/* System info skeleton */}
        <div className="h-44 w-full animate-pulse rounded-md bg-neutral-900/60" />

        {/* CPU & Memory skeletons */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="h-72 w-full animate-pulse rounded-md bg-neutral-900/60" />
          <div className="h-72 w-full animate-pulse rounded-md bg-neutral-900/60" />
        </div>

        {/* Disk & Services skeleton */}
        <div className="h-48 w-full animate-pulse rounded-md bg-neutral-900/60" />
        <div className="h-44 w-full animate-pulse rounded-md bg-neutral-900/60" />
      </div>
    );
  }

  // Error State
  if (error && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-red-500/20 bg-neutral-950 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-red-500/20 bg-red-500/10 text-red-400">
          <AlertCircle size={24} />
        </div>
        <h3 className="mt-4 text-base font-semibold text-white">
          เกิดข้อผิดพลาดในการโหลดข้อมูลสถานะ
        </h3>
        <p className="mt-1 max-w-md text-xs text-neutral-400">{error}</p>
        <button
          type="button"
          onClick={() => fetchMetrics()}
          className="mt-5 flex items-center gap-2 rounded-sm bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-500"
        >
          <RefreshCw size={14} />
          <span>ลองใหม่อีกครั้ง</span>
        </button>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-5">
      {/* Top Controls & Status Bar */}
      <HeaderTools />

      {/* System & OS Info */}
      <SystemCard system={metrics.system} />

      {/* CPU & Memory Row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <CpuCard cpu={metrics.cpu} />
        <MemoryCard memory={metrics.memory} />
      </div>

      {/* Storage Disk */}
      <DiskCard disk={metrics.disk} />

      {/* Services (Database & Node.js) */}
      <ServiceCard database={metrics.database} node={metrics.node} />

      {/* Network Interfaces */}
      <NetworkCard interfaces={metrics.network.interfaces} />
    </div>
  );
}
