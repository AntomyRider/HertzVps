"use client";

import { useMemo } from "react";
import {
  ListChecks,
  CheckCircle2,
  XCircle,
  Clock3,
  Share2,
  Rocket,
} from "lucide-react";
import { useControllerStore } from "@/store/controllerStore";
import OdometerNumber from "@/components/ui/odometer";
import AverageStats, { ProportionStats } from "./average";

type ProportionTone = "emerald" | "red" | "amber";

interface StatItem {
  label: string;
  value: number;
  icon: typeof ListChecks;
  color: string;
  iconColor: string;
  trend?: number | null;
  proportion?: {
    percent: number | null;
    tone: ProportionTone;
    title: string;
  };
}

export default function StatsOverviewController() {
  const { stats: sourceStats, statsMode, chartData } = useControllerStore();

  const isShareMode = statsMode === "share";
  const isBoostMode = statsMode === "boost";

  const totalValue = isBoostMode
    ? sourceStats.boostTotal ?? 0
    : isShareMode
      ? sourceStats.shareTotal ?? 0
      : sourceStats.total ?? 0;
  const successValue = isBoostMode
    ? sourceStats.boost ?? 0
    : isShareMode
      ? sourceStats.share ?? 0
      : sourceStats.success ?? 0;
  const failedValue = isBoostMode
    ? sourceStats.boostFailed ?? 0
    : isShareMode
      ? sourceStats.shareFailed ?? 0
      : sourceStats.failed ?? 0;
  const pendingValue = isBoostMode
    ? 0
    : isShareMode
      ? sourceStats.sharePending ?? 0
      : sourceStats.pending ?? 0;

  // สัดส่วน %
  const resolvedCount = successValue + failedValue;
  const successPercent =
    resolvedCount > 0 ? (successValue / resolvedCount) * 100 : null;
  const failedPercent =
    resolvedCount > 0 ? (failedValue / resolvedCount) * 100 : null;
  const pendingPercent =
    totalValue > 0 ? (pendingValue / totalValue) * 100 : null;

  // คำนวณ Trend จาก chartData หากมีข้อมูลย้อนหลัง
  const allTrend = useMemo(() => {
    if (!chartData || chartData.length < 2) return null;
    const activeKey =
      isBoostMode ? "boostTotal" : isShareMode ? "shareTotal" : "total";
    const lastItem = chartData[chartData.length - 1];
    const prevItem = chartData[chartData.length - 2];
    const lastVal = Number(lastItem?.[activeKey] || (Number(lastItem?.success || 0) + Number(lastItem?.failed || 0)));
    const prevVal = Number(prevItem?.[activeKey] || (Number(prevItem?.success || 0) + Number(prevItem?.failed || 0)));
    if (prevVal <= 0 && lastVal <= 0) return null;
    if (prevVal <= 0) return 100;
    const diff = Math.round(((lastVal - prevVal) / prevVal) * 100);
    return diff;
  }, [chartData, isBoostMode, isShareMode]);

  const allIcon = isBoostMode ? Rocket : isShareMode ? Share2 : ListChecks;

  const statItems: StatItem[] = [
    {
      label: "ทั้งหมด",
      value: totalValue,
      trend: allTrend,
      icon: allIcon,
      color: isBoostMode
        ? "text-amber-400"
        : isShareMode
          ? "text-violet-400"
          : "text-blue-400",
      iconColor: isBoostMode
        ? "text-amber-400/15"
        : isShareMode
          ? "text-violet-400/15"
          : "text-blue-400/15",
    },
    {
      label: "สำเร็จ",
      value: successValue,
      proportion: {
        percent: successPercent,
        tone: "emerald",
        title: "สัดส่วนของงานที่รู้ผลแล้ว (สำเร็จ + ผิดพลาด)",
      },
      icon: CheckCircle2,
      color: "text-emerald-400",
      iconColor: "text-emerald-400/15",
    },
    {
      label: "ผิดพลาด",
      value: failedValue,
      proportion: {
        percent: failedPercent,
        tone: "red",
        title: "สัดส่วนของงานที่รู้ผลแล้ว (สำเร็จ + ผิดพลาด)",
      },
      icon: XCircle,
      color: "text-red-400",
      iconColor: "text-red-400/15",
    },
    ...(!isBoostMode
      ? [
          {
            label: "ติดอนุมัติ",
            value: pendingValue,
            proportion: {
              percent: pendingPercent,
              tone: "amber" as const,
              title: "สัดส่วนต่องานทั้งหมด",
            },
            icon: Clock3,
            color: "text-amber-400",
            iconColor: "text-amber-400/15",
          },
        ]
      : []),
  ];

  return (
    <div className={`grid gap-4 ${isBoostMode ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"}`}>
      {statItems.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="group relative h-[94px] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 select-none transition-all duration-200 hover:border-neutral-700"
          >
            {/* Top highlight specular edge */}
            <div className="pointer-events-none absolute inset-x-3 top-0 z-10 h-px bg-white/10" />

            {/* Soft ambient light */}
            <div className="pointer-events-none absolute -left-10 -top-10 h-24 w-24 rounded-full bg-white/[0.03] blur-2xl transition-all duration-300 group-hover:bg-white/[0.06]" />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-neutral-400">
                  {stat.label}
                </p>

                {stat.proportion ? (
                  <ProportionStats
                    percent={stat.proportion.percent}
                    tone={stat.proportion.tone}
                    title={stat.proportion.title}
                  />
                ) : (
                  <AverageStats trend={stat.trend ?? null} />
                )}
              </div>

              <div
                className={`mt-1 font-mono text-3xl font-bold tracking-tight ${stat.color}`}
              >
                <OdometerNumber value={stat.value} />
              </div>
            </div>

            {/* Large Watermark Icon */}
            <Icon
              size={68}
              strokeWidth={1.2}
              className={`pointer-events-none absolute -bottom-3 -right-1 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3 ${stat.iconColor}`}
            />
          </div>
        );
      })}
    </div>
  );
}
