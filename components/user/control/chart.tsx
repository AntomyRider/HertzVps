"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  Chart as ChartJS,
  registerables,
  type ChartConfiguration,
} from "chart.js";
import { TrendingUp } from "lucide-react";
import {
  useControlStore,
  type ControlChartRange,
  type ControlDailyStat,
} from "@/store/controlStore";
import ButtonUI from "@/components/ui/button";

ChartJS.register(...registerables);

const RANGES: Array<{ label: string; value: ControlChartRange }> = [
  { label: "1 วัน", value: 1 },
  { label: "7 วัน", value: 7 },
  { label: "30 วัน", value: 30 },
  { label: "90 วัน", value: 90 },
];

const formatDateLabel = (dateStr: string) => {
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const d = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
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
};

export const ControlChart = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  const { dailyStats, chartRange, setChartRange } = useControlStore();

  const chartData = useMemo<ControlDailyStat[]>(() => {
    if (chartRange === 1) {
      const twoHourSlots = [
        "00:00",
        "02:00",
        "04:00",
        "06:00",
        "08:00",
        "10:00",
        "12:00",
        "14:00",
        "16:00",
        "18:00",
        "20:00",
        "22:00",
      ];

      if (dailyStats.length > 0 && dailyStats[0]?.date?.includes(":")) {
        return dailyStats;
      }

      return twoHourSlots.map((slot) => ({
        date: slot,
        success: 0,
        failed: 0,
        pending: 0,
      }));
    }

    if (dailyStats.length > 0) {
      return dailyStats.map((item) => ({
        date: formatDateLabel(item.date),
        success: item.success,
        failed: item.failed,
        pending: item.pending,
      }));
    }

    const emptyList: ControlDailyStat[] = [];
    const now = new Date();

    for (let i = chartRange - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      emptyList.push({
        date: d.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
        }),
        success: 0,
        failed: 0,
        pending: 0,
      });
    }

    return emptyList;
  }, [dailyStats, chartRange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const successGradient = ctx.createLinearGradient(0, 0, 0, 280);
    successGradient.addColorStop(0, "rgba(16, 185, 129, 0.25)");
    successGradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");

    const failedGradient = ctx.createLinearGradient(0, 0, 0, 280);
    failedGradient.addColorStop(0, "rgba(239, 68, 68, 0.22)");
    failedGradient.addColorStop(1, "rgba(239, 68, 68, 0.0)");

    const pendingGradient = ctx.createLinearGradient(0, 0, 0, 280);
    pendingGradient.addColorStop(0, "rgba(245, 158, 11, 0.22)");
    pendingGradient.addColorStop(1, "rgba(245, 158, 11, 0.0)");

    const labels = chartData.map((d) => d.date);

    const config: ChartConfiguration<"line"> = {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "สำเร็จ",
            data: chartData.map((d) => d.success),
            borderColor: "#10b981",
            borderWidth: 2,
            backgroundColor: successGradient,
            fill: true,
            tension: 0.35,
            pointRadius: 2.5,
            pointHoverRadius: 5,
            pointBackgroundColor: "#10b981",
            pointBorderColor: "#000000",
            pointBorderWidth: 1.5,
          },
          {
            label: "ผิดพลาด",
            data: chartData.map((d) => d.failed),
            borderColor: "#ef4444",
            borderWidth: 2,
            backgroundColor: failedGradient,
            fill: true,
            tension: 0.35,
            pointRadius: 2.5,
            pointHoverRadius: 5,
            pointBackgroundColor: "#ef4444",
            pointBorderColor: "#000000",
            pointBorderWidth: 1.5,
          },
          {
            label: "ติดอนุมัติ",
            data: chartData.map((d) => d.pending),
            borderColor: "#f59e0b",
            borderWidth: 2,
            backgroundColor: pendingGradient,
            fill: true,
            tension: 0.35,
            pointRadius: 2.5,
            pointHoverRadius: 5,
            pointBackgroundColor: "#f59e0b",
            pointBorderColor: "#000000",
            pointBorderWidth: 1.5,
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
            display: true,
            position: "bottom",
            labels: {
              color: "#a3a3a3",
              usePointStyle: true,
              pointStyle: "circle",
              boxWidth: 6,
              boxHeight: 6,
              padding: 16,
              font: {
                size: 11,
              },
            },
          },
          tooltip: {
            backgroundColor: "rgba(10, 10, 10, 0.95)",
            titleColor: "#ffffff",
            bodyColor: "#e5e5e5",
            borderColor: "rgba(255, 255, 255, 0.12)",
            borderWidth: 1,
            cornerRadius: 4,
            padding: 10,
            callbacks: {
              label: (item) => {
                const val = Number(item.raw || 0).toLocaleString("th-TH");
                return ` ${item.dataset.label}: ${val} รายการ`;
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
              color: "rgba(163, 163, 163, 0.8)",
              font: {
                size: 11,
              },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: chartRange === 90 ? 10 : chartRange === 30 ? 10 : 12,
            },
          },
          y: {
            grid: {
              color: "rgba(255, 255, 255, 0.05)",
            },
            ticks: {
              color: "rgba(163, 163, 163, 0.8)",
              font: {
                size: 11,
              },
              precision: 0,
            },
            beginAtZero: true,
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
  }, [chartData, chartRange]);

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950 p-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900/60 text-blue-400">
            <TrendingUp size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-white">
              สถิติการทำงาน
            </h3>
            <p className="mt-0.5 text-xs text-neutral-400">
              ภาพรวมกิจกรรมการโพสต์ สำเร็จ ผิดพลาด และติดอนุมัติตามช่วงเวลา
            </p>
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 self-start rounded-sm border border-neutral-800 bg-neutral-900/60 p-1 sm:self-auto">
          {RANGES.map((item) => (
            <ButtonUI
              key={item.value}
              type="button"
              onClick={() => setChartRange(item.value)}
              className={`cursor-pointer rounded-sm px-2.5 py-1 text-xs font-medium ${
                chartRange === item.value
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-transparent text-neutral-400 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              {item.label}
            </ButtonUI>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative mt-6 h-[280px] w-full">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default ControlChart;
