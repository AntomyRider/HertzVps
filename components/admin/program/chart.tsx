"use client";

import { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  registerables,
  ChartConfiguration,
} from "chart.js";
import { TrendingUp, Layers, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useProgramOverviewStore } from "@/store/programOverviewStore";

// Register Chart.js components
ChartJS.register(...registerables);

const TIME_RANGES: Array<{ label: string; value: "1d" | "7d" | "30d" | "1y" }> = [
  { label: "1 วัน (ทุก 2 ชม.)", value: "1d" },
  { label: "7 วัน", value: "7d" },
  { label: "30 วัน", value: "30d" },
  { label: "1 ปี", value: "1y" },
];

export default function ProgramChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  const {
    summary,
    chartDataByRange,
    chartTimeRange,
    setChartTimeRange,
  } = useProgramOverviewStore();

  const [visibleDatasets, setVisibleDatasets] = useState({
    total: true,
    success: true,
    failed: true,
    pending: true,
  });

  const toggleDataset = (key: keyof typeof visibleDatasets) => {
    setVisibleDatasets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const points = chartDataByRange[chartTimeRange] || [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Destroy previous chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const labels = points.map((p) => p.label);
    const totals = points.map((p) => p.total);
    const successes = points.map((p) => p.success);
    const failures = points.map((p) => p.failed);
    const pendings = points.map((p) => p.pending);

    // Gradient for Total line
    const totalGradient = ctx.createLinearGradient(0, 0, 0, 280);
    totalGradient.addColorStop(0, "rgba(59, 130, 246, 0.18)");
    totalGradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");

    // Gradient for Success line
    const successGradient = ctx.createLinearGradient(0, 0, 0, 280);
    successGradient.addColorStop(0, "rgba(16, 185, 129, 0.15)");
    successGradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");

    const config: ChartConfiguration<"line"> = {
      type: "line",
      data: {
        labels,
        datasets: [
          // 1. Total (งานทั้งหมด)
          {
            label: "งานทั้งหมด (Total)",
            data: totals,
            hidden: !visibleDatasets.total,
            borderColor: "#3b82f6",
            borderWidth: 2,
            backgroundColor: totalGradient,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: "#3b82f6",
            pointBorderColor: "#000000",
            pointBorderWidth: 1.5,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "#60a5fa",
            pointHoverBorderColor: "#ffffff",
          },
          // 2. Success (สำเร็จ)
          {
            label: "สำเร็จ (Success)",
            data: successes,
            hidden: !visibleDatasets.success,
            borderColor: "#10b981",
            borderWidth: 2,
            backgroundColor: successGradient,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: "#10b981",
            pointBorderColor: "#000000",
            pointBorderWidth: 1.5,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "#34d399",
            pointHoverBorderColor: "#ffffff",
          },
          // 3. Failed (ล้มเหลว)
          {
            label: "ล้มเหลว (Failed)",
            data: failures,
            hidden: !visibleDatasets.failed,
            borderColor: "#f43f5e",
            borderWidth: 2,
            backgroundColor: "transparent",
            fill: false,
            tension: 0.35,
            pointBackgroundColor: "#f43f5e",
            pointBorderColor: "#000000",
            pointBorderWidth: 1.5,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "#fb7185",
            pointHoverBorderColor: "#ffffff",
          },
          // 4. Pending (รอดำเนินการ)
          {
            label: "รอดำเนินการ (Pending)",
            data: pendings,
            hidden: !visibleDatasets.pending,
            borderColor: "#f59e0b",
            borderWidth: 1.5,
            borderDash: [4, 4],
            backgroundColor: "transparent",
            fill: false,
            tension: 0.35,
            pointBackgroundColor: "#f59e0b",
            pointBorderColor: "#000000",
            pointBorderWidth: 1.5,
            pointRadius: 2.5,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "#fbbf24",
            pointHoverBorderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            display: false, // We render our own custom interactive pills
          },
          tooltip: {
            backgroundColor: "rgba(10, 10, 10, 0.95)",
            titleColor: "#ffffff",
            bodyColor: "#d4d4d4",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 1,
            cornerRadius: 4,
            padding: 10,
            boxPadding: 4,
            usePointStyle: true,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || "";
                const val = context.parsed.y || 0;
                return ` ${label}: ${val.toLocaleString()} ครั้ง`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.04)",
            },
            ticks: {
              color: "#737373",
              font: {
                size: 11,
              },
              maxRotation: 0,
            },
            border: {
              color: "rgba(255, 255, 255, 0.08)",
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(255, 255, 255, 0.04)",
            },
            ticks: {
              color: "#737373",
              font: {
                size: 11,
              },
              precision: 0,
              callback: (val) => Number(val).toLocaleString(),
            },
            border: {
              color: "rgba(255, 255, 255, 0.08)",
            },
          },
        },
      },
    };

    chartInstanceRef.current = new ChartJS(ctx, config);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [points, visibleDatasets]);

  const fleetTotal = summary?.fleetTotal ?? 0;
  const fleetSuccess = summary?.fleetSuccess ?? 0;
  const fleetFailed = summary?.fleetFailed ?? 0;
  const fleetPending = summary?.fleetPending ?? 0;

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950 p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-white">
              แนวโน้มและปริมาณงานทั้งระบบ (Fleet Workload Trends)
            </h3>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            แสดงสถิติเส้นแนวโน้มของ งานทั้งหมด (Total), สำเร็จ (Success), ล้มเหลว (Failed) และรอดำเนินการ (Pending)
          </p>
        </div>

        {/* Time range switcher */}
        <div className="flex items-center rounded-sm border border-neutral-800 bg-neutral-900/60 p-0.5 self-start sm:self-auto">
          {TIME_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setChartTimeRange(r.value)}
              className={`rounded-sm px-2.5 py-1 text-xs font-medium transition ${
                chartTimeRange === r.value
                  ? "bg-blue-600 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Legend & Metric Badges */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* Total */}
        <button
          onClick={() => toggleDataset("total")}
          className={`flex items-center gap-2 rounded-sm border px-2.5 py-1.5 text-xs transition cursor-pointer ${
            visibleDatasets.total
              ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
              : "border-neutral-800 bg-neutral-900/40 text-neutral-500 opacity-60"
          }`}
          title="คลิกเพื่อแสดง/ซ่อนเส้นงานทั้งหมด"
        >
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="font-medium">งานทั้งหมด</span>
          <span className="font-semibold text-white">
            {fleetTotal.toLocaleString()}
          </span>
        </button>

        {/* Success */}
        <button
          onClick={() => toggleDataset("success")}
          className={`flex items-center gap-2 rounded-sm border px-2.5 py-1.5 text-xs transition cursor-pointer ${
            visibleDatasets.success
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-neutral-800 bg-neutral-900/40 text-neutral-500 opacity-60"
          }`}
          title="คลิกเพื่อแสดง/ซ่อนเส้นสำเร็จ"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-medium">สำเร็จ</span>
          <span className="font-semibold text-white">
            {fleetSuccess.toLocaleString()}
          </span>
        </button>

        {/* Failed */}
        <button
          onClick={() => toggleDataset("failed")}
          className={`flex items-center gap-2 rounded-sm border px-2.5 py-1.5 text-xs transition cursor-pointer ${
            visibleDatasets.failed
              ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
              : "border-neutral-800 bg-neutral-900/40 text-neutral-500 opacity-60"
          }`}
          title="คลิกเพื่อแสดง/ซ่อนเส้นล้มเหลว"
        >
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span className="font-medium">ล้มเหลว</span>
          <span className="font-semibold text-white">
            {fleetFailed.toLocaleString()}
          </span>
        </button>

        {/* Pending */}
        <button
          onClick={() => toggleDataset("pending")}
          className={`flex items-center gap-2 rounded-sm border px-2.5 py-1.5 text-xs transition cursor-pointer ${
            visibleDatasets.pending
              ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
              : "border-neutral-800 bg-neutral-900/40 text-neutral-500 opacity-60"
          }`}
          title="คลิกเพื่อแสดง/ซ่อนเส้นรอดำเนินการ"
        >
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="font-medium">รอดำเนินการ</span>
          <span className="font-semibold text-white">
            {fleetPending.toLocaleString()}
          </span>
        </button>
      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-72 w-full">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
