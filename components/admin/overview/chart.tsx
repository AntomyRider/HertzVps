"use client";

import { useEffect, useRef } from "react";
import { useOverviewStore } from "@/store/overviewStore";
import {
  Chart as ChartJS,
  registerables,
  ChartConfiguration,
} from "chart.js";
import { TrendingUp, RefreshCw, Loader2 } from "lucide-react";

// Register all Chart.js components (controllers, scales, elements, plugins)
ChartJS.register(...registerables);

export default function SalesChartAdmin() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  const {
    salesChart,
    timeRange,
    isLoading,
    isRefreshing,
    fetchDashboardData,
    setTimeRange,
  } = useOverviewStore();

  const timeRanges: Array<{ label: string; value: "7d" | "30d" | "1y" }> = [
    { label: "7 วัน", value: "7d" },
    { label: "30 วัน", value: "30d" },
    { label: "1 ปี", value: "1y" },
  ];

  // Render or update Chart.js
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Destroy existing chart instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    // Gradient fill under the line
    const gradient = ctx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.28)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");

    const labels = salesChart.map((item) => item.label);
    const revenues = salesChart.map((item) => item.revenue);
    const ordersList = salesChart.map((item) => item.orders);

    const config: ChartConfiguration<"line"> = {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "ยอดขาย (บาท)",
            data: revenues,
            borderColor: "#3b82f6",
            borderWidth: 2,
            backgroundColor: gradient,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: "#3b82f6",
            pointBorderColor: "#000000",
            pointBorderWidth: 1.5,
            pointRadius: 3.5,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: "#60a5fa",
            pointHoverBorderColor: "#ffffff",
            pointHoverBorderWidth: 2,
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
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(10, 10, 10, 0.95)",
            titleColor: "#ffffff",
            bodyColor: "#e5e5e5",
            borderColor: "rgba(255, 255, 255, 0.12)",
            borderWidth: 1,
            cornerRadius: 4,
            padding: 10,
            displayColors: false,
            callbacks: {
              title: (items) => {
                if (!items.length) return "";
                return items[0].label;
              },
              label: (item) => {
                const index = item.dataIndex;
                const rev = Number(item.raw || 0).toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
                const ord = ordersList[index] || 0;
                return [
                  `ยอดขาย: ฿ ${rev}`,
                  `คำสั่งซื้อ: ${ord} รายการ`,
                ];
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
              callback: (value) => `฿ ${Number(value).toLocaleString()}`,
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
  }, [salesChart]);

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950 p-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900/60 text-blue-400">
            <TrendingUp size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              สถิติยอดขาย (Sales Overview)
            </h3>
            <p className="mt-0.5 text-xs text-neutral-400">
              กราฟแสดงรายได้จากการสั่งซื้อสินค้าและคีย์ในระบบ
            </p>
          </div>
        </div>

        {/* Controls: Timeframe Pills & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-sm border border-neutral-800 bg-neutral-900/60 p-1">
            {timeRanges.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTimeRange(item.value)}
                className={`rounded-sm px-2.5 py-1 text-xs font-medium transition ${
                  timeRange === item.value
                    ? "bg-blue-600 text-white"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={isLoading || isRefreshing}
            onClick={() => fetchDashboardData(timeRange, true)}
            className="flex h-8 w-8 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900 text-neutral-400 transition hover:border-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            title="รีเฟรชข้อมูล"
          >
            {isRefreshing || isLoading ? (
              <Loader2 size={14} className="animate-spin text-blue-400" />
            ) : (
              <RefreshCw size={14} />
            )}
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="mt-6 relative h-[320px] w-full">
        {isLoading && salesChart.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center rounded-sm bg-neutral-900/20">
            <Loader2 size={24} className="animate-spin text-blue-400" />
          </div>
        ) : (
          <canvas ref={canvasRef} />
        )}
      </div>
    </div>
  );
}
