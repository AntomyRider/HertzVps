"use client";

import { useEffect, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useControllerStore } from "@/store/controllerStore";

const MODE_SERIES = {
  post: [
    { key: "success", label: "สำเร็จ", color: "#22c55e" },
    { key: "failed", label: "ผิดพลาด", color: "#ef4444" },
    { key: "pending", label: "ติดอนุมัติ", color: "#eab308" },
  ],
  share: [
    { key: "share", label: "สำเร็จ", color: "#22c55e" },
    { key: "shareFailed", label: "ผิดพลาด", color: "#ef4444" },
    { key: "sharePending", label: "ติดอนุมัติ", color: "#eab308" },
  ],
  boost: [
    { key: "boost", label: "สำเร็จ", color: "#22c55e" },
    { key: "boostFailed", label: "ผิดพลาด", color: "#ef4444" },
  ],
} as const;

const MODE_TOTAL_KEY = {
  post: "total",
  share: "shareTotal",
  boost: "boostTotal",
} as const;

const MODES: Array<{ label: string; value: "post" | "share" | "boost" }> = [
  { label: "โพสต์", value: "post" },
  { label: "แชร์ลิ้งค์", value: "share" },
  { label: "ดันโพสต์", value: "boost" },
];

const RANGES: Array<{
  label: string;
  value: "1d" | "7d" | "30d" | "90d";
}> = [
  { label: "1 วัน", value: "1d" },
  { label: "7 วัน", value: "7d" },
  { label: "30 วัน", value: "30d" },
  { label: "90 วัน", value: "90d" },
];

function formatDateLabel(dateStr: string) {
  try {
    if (dateStr.includes(":")) return dateStr;
    const parts = dateStr.slice(0, 10).split("-");
    if (parts.length === 3) {
      const d = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2]),
      );
      return d.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export default function ChartOverviewController() {
  const {
    chartData: rawData,
    timeRange,
    statsMode,
    setTimeRange,
    setStatsMode,
    fetchOverviewData,
    initRealtimeIfNeeded,
  } = useControllerStore();

  useEffect(() => {
    void initRealtimeIfNeeded();
    void fetchOverviewData(timeRange, true);
  }, [initRealtimeIfNeeded, fetchOverviewData, timeRange]);

  const activeTotalKey = MODE_TOTAL_KEY[statsMode];
  const activeSeries = MODE_SERIES[statsMode];

  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    return rawData.map((item) => {
      const success = Number(item.success) || 0;
      const failed = Number(item.failed) || 0;
      const pending = Number(item.pending) || 0;
      const total = Number(item.total) || success + failed + pending;

      return {
        date: formatDateLabel(item.label || item.date),
        total,
        success,
        failed,
        pending,
        share: Number(item.share) || 0,
        shareTotal: Number(item.shareTotal) || 0,
        shareFailed: Number(item.shareFailed) || 0,
        sharePending: Number(item.sharePending) || 0,
        boost: Number(item.boost) || 0,
        boostTotal: Number(item.boostTotal) || 0,
        boostFailed: Number(item.boostFailed) || 0,
      };
    });
  }, [rawData]);

  const maxTotal = useMemo(() => {
    let max = 0;
    for (const item of chartData) {
      const t = Number(item[activeTotalKey] ?? 0);
      if (Number.isFinite(t) && t > max) max = t;
    }
    return max;
  }, [chartData, activeTotalKey]);

  const yDomain = useMemo<[number, number]>(() => {
    const safeMax = Number.isFinite(maxTotal) ? maxTotal : 0;
    return [0, Math.max(safeMax, 4)];
  }, [maxTotal]);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition-all duration-200">
      {/* Top highlight specular edge */}
      <div className="pointer-events-none absolute inset-x-3 top-0 z-20 h-px bg-white/10" />

      {/* Soft ambient light */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-24 w-24 rounded-full bg-white/[0.03] blur-2xl transition-all duration-300 group-hover:bg-white/[0.06]" />

      {/* Header */}
      <div className="relative z-10 flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm text-white">สถิติการทำงาน</h2>
          <p className="mt-0.5 text-xs text-neutral-400">
            ภาพรวมกิจกรรมในช่วงเวลาที่เลือก
          </p>
        </div>

        {/* Mode toggle + Range toggle */}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {/* Toggle โหมดข้อมูล */}
          <div className="grid w-full grid-cols-3 gap-1 rounded-lg border border-neutral-800 bg-neutral-950 p-1 sm:w-auto sm:flex sm:shrink-0">
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setStatsMode(m.value)}
                className={`min-w-0 truncate rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:px-2.5 ${
                  statsMode === m.value
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Toggle ช่วงเวลา */}
          <div className="grid w-full grid-cols-4 gap-1 rounded-lg border border-neutral-800 bg-neutral-950 p-1 sm:w-auto sm:flex sm:shrink-0">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setTimeRange(r.value)}
                className={`min-w-0 truncate rounded-md px-1.5 py-1.5 text-xs font-medium transition-colors sm:px-2.5 ${
                  timeRange === r.value
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                }`}
                title={r.label}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Area Chart Container */}
      <div className="relative h-[250px] w-full px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 12,
              left: -12,
              bottom: 0,
            }}
          >
            <defs>
              {activeSeries.map((s) => (
                <linearGradient
                  key={s.key}
                  id={`${s.key}Gradient`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={{
                fill: "#737373",
                fontSize: 11,
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              width={34}
              allowDecimals={false}
              domain={yDomain}
              tick={{
                fill: "#737373",
                fontSize: 11,
              }}
              tickFormatter={(val: number) => {
                if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
                return String(val);
              }}
            />

            <Tooltip
              cursor={{
                stroke: "rgba(255,255,255,0.12)",
              }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;

                const currentItem = chartData.find((d) => d.date === label);
                const itemTotal =
                  currentItem?.[activeTotalKey] ??
                  payload.reduce((acc, p) => acc + Number(p.value || 0), 0);

                return (
                  <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 shadow-xl">
                    <div className="mb-1.5 flex items-center justify-between gap-4 border-b border-neutral-800 pb-1.5">
                      <p className="text-[11px] font-medium text-neutral-400">
                        {label}
                      </p>
                      <span className="font-mono text-[11px] text-sky-400">
                        รวม {itemTotal.toLocaleString("th-TH")}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      {payload
                        .filter((entry) => entry.dataKey !== activeTotalKey)
                        .map((entry) => {
                          const key = String(entry.dataKey);
                          const series = activeSeries.find(
                            (s) => s.key === key,
                          );

                          return (
                            <div
                              key={String(entry.dataKey)}
                              className="flex items-center justify-between gap-3 text-xs text-white"
                            >
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{
                                    backgroundColor: entry.color,
                                  }}
                                />
                                <span className="font-normal text-neutral-300">
                                  {series?.label ?? String(entry.dataKey)}
                                </span>
                              </div>

                              <span className="font-mono">
                                {Number(entry.value ?? 0).toLocaleString(
                                  "th-TH",
                                )}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              }}
            />

            {activeSeries.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                fill={`url(#${s.key}Gradient)`}
                dot={false}
                activeDot={{
                  r: 4,
                  strokeWidth: 2,
                  stroke: s.color,
                  fill: "#171717",
                }}
              />
            ))}

            <Line
              type="monotone"
              dataKey={activeTotalKey}
              name="ทั้งหมด"
              stroke="#38bdf8"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                stroke: "#38bdf8",
                fill: "#0f172a",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
