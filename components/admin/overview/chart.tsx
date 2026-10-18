"use client";

import { useEffect, useRef } from "react";
import { useOverviewStore } from "@/store/overviewStore";
import {
  Chart as ChartJS,
  registerables,
  ChartConfiguration,
} from "chart.js";
import { TrendingUp, RefreshCw, Loader2 } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";

// Register all Chart.js components (controllers, scales, elements, plugins)
ChartJS.register(...registerables);

export default function SalesChartAdmin() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);
  const ordersListRef = useRef<number[]>([]);

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

  // Teardown chart instance on unmount
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  // Render or update Chart.js with smooth animated transitions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || salesChart.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // If canvas element was recreated in DOM, destroy old instance
    if (chartInstanceRef.current && chartInstanceRef.current.canvas !== canvas) {
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
    ordersListRef.current = ordersList;

    // Smoothly animate existing chart instance when timeRange or data updates
    if (chartInstanceRef.current) {
      const chart = chartInstanceRef.current;
      chart.data.labels = labels;
      if (chart.data.datasets.length > 0) {
        chart.data.datasets[0].data = revenues;
        chart.data.datasets[0].backgroundColor = gradient;
      }
      chart.update();
      return;
    }

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
        animation: {
          duration: 750,
          easing: "easeInOutQuart",
        },
        animations: {
          y: {
            duration: 750,
            easing: "easeInOutQuart",
          },
          x: {
            duration: 650,
            easing: "easeInOutQuart",
          },
          tension: {
            duration: 750,
            easing: "easeInOutQuart",
          },
        },
        transitions: {
          active: {
            animation: {
              duration: 200,
            },
          },
        },
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
                const ord = ordersListRef.current[index] || 0;
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
  }, [salesChart]);

  return (
    <FadeIn
      direction="up"
      delay={100}
      className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-base text-white">
              สถิติยอดขาย
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
                className={cn(
                  "rounded-sm px-2.5 py-1 text-xs font-medium transition cursor-pointer",
                  timeRange === item.value
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={isLoading || isRefreshing}
            onClick={() => fetchDashboardData(timeRange, true)}
            className="flex h-8 w-8 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900 text-neutral-400 transition hover:border-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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
        {/* Subtle syncing indicator line */}
        <div
          className={cn(
            "absolute -top-3 left-0 right-0 h-0.5 overflow-hidden rounded-full transition-opacity duration-300",
            isRefreshing ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="h-full w-full bg-gradient-to-r from-transparent via-blue-500/80 to-transparent animate-pulse" />
        </div>

        {isLoading && salesChart.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center rounded-sm bg-neutral-900/20">
            <Loader2 size={24} className="animate-spin text-blue-400" />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className={cn(
              "transition-all duration-300",
              isRefreshing ? "opacity-75 scale-[0.998]" : "opacity-100 scale-100"
            )}
          />
        )}
      </div>
    </FadeIn>
  );
}
