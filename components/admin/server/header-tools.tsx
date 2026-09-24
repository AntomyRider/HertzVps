"use client";

import { useServerStore } from "@/store/serverStore";
import { RefreshCw, Loader2, CheckCircle2, AlertTriangle, AlertCircle, Clock } from "lucide-react";

export default function HeaderTools() {
  const {
    metrics,
    isLoading,
    isRefreshing,
    refreshInterval,
    lastUpdated,
    fetchMetrics,
    setRefreshInterval,
  } = useServerStore();

  const intervals = [
    { label: "ปิด", value: 0 },
    { label: "3s", value: 3000 },
    { label: "5s", value: 5000 },
    { label: "10s", value: 10000 },
  ];

  // Evaluate overall health
  const getOverallStatus = () => {
    if (!metrics) return null;
    const isDbDown = metrics.database.status !== "connected";
    const isDiskFull = metrics.disk.usagePercent >= 90;
    const isCpuHigh = metrics.cpu.usagePercent >= 90;
    const isRamHigh = metrics.memory.usagePercent >= 90;

    if (isDbDown || isDiskFull || isCpuHigh || isRamHigh) {
      return {
        label: "วิกฤต (Critical)",
        icon: AlertCircle,
        className: "border-red-500/30 bg-red-500/10 text-red-400",
        dotColor: "bg-red-400",
      };
    }

    if (
      metrics.cpu.usagePercent >= 75 ||
      metrics.memory.usagePercent >= 80 ||
      metrics.disk.usagePercent >= 80
    ) {
      return {
        label: "เฝ้าระวัง (Warning)",
        icon: AlertTriangle,
        className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        dotColor: "bg-amber-400",
      };
    }

    return {
      label: "ระบบทำงานปกติ (Healthy)",
      icon: CheckCircle2,
      className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
      dotColor: "bg-emerald-400",
    };
  };

  const status = getOverallStatus();
  const StatusIcon = status?.icon;

  return (
    <div className="flex flex-col gap-4 rounded-md border border-neutral-800 bg-neutral-950 p-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Overall Health & Timestamp */}
      <div className="flex flex-wrap items-center gap-3">
        {status && (
          <div
            className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs font-medium ${status.className}`}
          >
            <span className={`h-2 w-2 rounded-full ${status.dotColor} animate-pulse`} />
            {StatusIcon && <StatusIcon size={14} />}
            <span>{status.label}</span>
          </div>
        )}

        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Clock size={13} />
            <span>อัปเดตล่าสุด:</span>
            <span className="font-medium text-neutral-400">
              {lastUpdated.toLocaleTimeString("th-TH")}
            </span>
          </div>
        )}
      </div>

      {/* Right: Auto-refresh Toggle & Refresh Button */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Auto Refresh Pills */}
        <div className="flex items-center gap-1 rounded-sm border border-neutral-800 bg-neutral-900/60 p-1">
          <span className="px-2 text-[11px] font-medium text-neutral-400">
            รีเฟรชอัตโนมัติ:
          </span>
          {intervals.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setRefreshInterval(item.value)}
              className={`rounded-sm px-2.5 py-1 text-xs font-medium transition ${
                refreshInterval === item.value
                  ? "bg-blue-600 text-white"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Manual Refresh Button */}
        <button
          type="button"
          disabled={isLoading || isRefreshing}
          onClick={() => fetchMetrics(true)}
          className="flex items-center gap-1.5 rounded-sm border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:border-neutral-700 hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRefreshing || isLoading ? (
            <Loader2 size={14} className="animate-spin text-blue-400" />
          ) : (
            <RefreshCw size={14} className="text-neutral-400" />
          )}
          <span>รีเฟรช</span>
        </button>
      </div>
    </div>
  );
}
