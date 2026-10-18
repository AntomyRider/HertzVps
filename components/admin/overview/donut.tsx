
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useOverviewStore } from "@/store/overviewStore";
import {
  Chart as ChartJS,
  registerables,
  ChartConfiguration,
} from "chart.js";
import { Loader2 } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";

ChartJS.register(...registerables);

const PALETTE = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#6366f1",
  "#14b8a6",
  "#64748b",
];

export default function DonutAdmin() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS<"doughnut"> | null>(null);
  const [metric, setMetric] = useState<"revenue" | "sold">("revenue");

  const { categoryDistribution, isLoading } = useOverviewStore();

  const activeData = useMemo(
    () =>
      categoryDistribution.map((item, index) => ({
        ...item,
        value: metric === "revenue" ? item.revenue : item.soldCount,
        color: PALETTE[index % PALETTE.length],
      })),
    [categoryDistribution, metric],
  );

  const totalValue = activeData.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  const hasData = activeData.length > 0 && totalValue > 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    chartInstanceRef.current?.destroy();
    chartInstanceRef.current = null;

    const labels = hasData
      ? activeData.map((item) => item.name)
      : ["ยังไม่มีข้อมูล"];

    const values = hasData
      ? activeData.map((item) => item.value)
      : [1];

    const bgColors = hasData
      ? activeData.map((item) => item.color)
      : ["rgba(255, 255, 255, 0.08)"];

    const config: ChartConfiguration<"doughnut"> = {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: bgColors,
            borderColor: "#171717",
            borderWidth: 3,
            hoverOffset: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "76%",
        animation: {
          duration: 450,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: hasData,
            backgroundColor: "rgba(10, 10, 10, 0.96)",
            titleColor: "#ffffff",
            bodyColor: "#d4d4d4",
            borderColor: "#404040",
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: (context) => {
                const val = Number(context.raw || 0);
                const percent =
                  totalValue > 0
                    ? ((val / totalValue) * 100).toFixed(1)
                    : "0.0";

                if (metric === "revenue") {
                  return ` ยอดขาย: ฿${val.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} (${percent}%)`;
                }

                return ` จำนวนขาย: ${val.toLocaleString("th-TH")} ชิ้น (${percent}%)`;
              },
            },
          },
        },
      },
    };

    chartInstanceRef.current = new ChartJS(ctx, config);

    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, [activeData, metric, totalValue, hasData]);

  const formatRevenue = (value: number) =>
    value.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <FadeIn
      direction="up"
      delay={150}
      className="flex h-full min-h-[440px] flex-col rounded-3xl border border-neutral-800 bg-neutral-900 p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm text-white">
            สัดส่วนหมวดหมู่
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            สัดส่วนตามสินค้าในแต่ละหมวดหมู่
          </p>
        </div>

        {/* Metric Toggle */}
        <div className="flex shrink-0 items-center rounded-lg border border-neutral-800 bg-neutral-950 p-1">
          <button
            type="button"
            onClick={() => setMetric("revenue")}
            aria-pressed={metric === "revenue"}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              metric === "revenue"
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            ยอดขาย
          </button>

          <button
            type="button"
            onClick={() => setMetric("sold")}
            aria-pressed={metric === "sold"}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              metric === "sold"
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            จำนวนขาย
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative my-5 flex h-[220px] w-full shrink-0 items-center justify-center">
        {isLoading && activeData.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2
              size={24}
              className="animate-spin text-neutral-400"
            />
          </div>
        ) : (
          <>
            <canvas ref={canvasRef} />

            {/* Center Summary */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <span className="text-xs font-medium text-neutral-500">
                {metric === "revenue" ? "ยอดรวมทั้งหมด" : "จำนวนขายรวม"}
              </span>

              <span className="mt-1 max-w-full truncate text-lg font-bold tracking-tight text-white sm:text-xl">
                {metric === "revenue"
                  ? `฿${totalValue.toLocaleString("th-TH", {
                      maximumFractionDigits: 0,
                    })}`
                  : totalValue.toLocaleString("th-TH")}
              </span>

              {metric === "sold" && (
                <span className="mt-0.5 text-xs text-neutral-500">
                  ชิ้น
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Category List */}
      <div className="mt-auto min-h-0 border-t border-neutral-800 pt-3">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-xs font-medium text-neutral-400">
            รายการหมวดหมู่
          </span>
          <span className="text-2xs text-neutral-600">
            {activeData.length} หมวดหมู่
          </span>
        </div>

        <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
          {activeData.length === 0 ? (
            <p className="py-4 text-center text-xs text-neutral-500">
              {isLoading
                ? "กำลังโหลดข้อมูล..."
                : "ยังไม่มีหมวดหมู่สินค้าในระบบ"}
            </p>
          ) : (
            activeData.map((cat) => {
              const pct =
                totalValue > 0
                  ? ((cat.value / totalValue) * 100).toFixed(1)
                  : "0.0";

              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-neutral-800/60"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />

                    <span className="truncate text-xs font-medium text-neutral-300">
                      {cat.name}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs tabular-nums text-neutral-400">
                      {metric === "revenue"
                        ? `฿${formatRevenue(cat.value)}`
                        : `${cat.value.toLocaleString("th-TH")} ชิ้น`}
                    </span>

                    <span className="w-10 text-right text-xs font-medium tabular-nums text-neutral-500">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </FadeIn>
  );
}
