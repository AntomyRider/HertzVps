"use client";

import { useEffect, useRef, useState } from "react";
import { useOverviewStore } from "@/store/overviewStore";
import {
  Chart as ChartJS,
  registerables,
  ChartConfiguration,
} from "chart.js";
import { PieChart, Loader2 } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";

ChartJS.register(...registerables);

const PALETTE = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#64748b", // Slate
];

export default function DonutAdmin() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);
  const [metric, setMetric] = useState<"revenue" | "sold">("revenue");

  const { categoryDistribution, isLoading } = useOverviewStore();

  const activeData = categoryDistribution.map((item, index) => {
    const value = metric === "revenue" ? item.revenue : item.soldCount;
    return {
      ...item,
      value,
      color: PALETTE[index % PALETTE.length],
    };
  });

  const totalValue = activeData.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const hasData = activeData.length > 0 && totalValue > 0;
    const labels = hasData
      ? activeData.map((d) => d.name)
      : ["ยังไม่มีข้อมูล"];
    const values = hasData
      ? activeData.map((d) => d.value)
      : [1];
    const bgColors = hasData
      ? activeData.map((d) => d.color)
      : ["rgba(255, 255, 255, 0.08)"];

    const config: ChartConfiguration<"doughnut"> = {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: bgColors,
            borderColor: "#0a0a0a",
            borderWidth: 2,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: hasData,
            backgroundColor: "rgba(10, 10, 10, 0.95)",
            titleColor: "#ffffff",
            bodyColor: "#e5e5e5",
            borderColor: "rgba(255, 255, 255, 0.12)",
            borderWidth: 1,
            cornerRadius: 4,
            padding: 10,
            callbacks: {
              label: (context) => {
                const val = Number(context.raw || 0);
                const percent = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : "0.0";
                if (metric === "revenue") {
                  return ` ยอดขาย: ฿${val.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} (${percent}%)`;
                }
                return ` จำนวนขาย: ${val.toLocaleString()} ชิ้น (${percent}%)`;
              },
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
  }, [activeData, metric, totalValue]);

  return (
    <FadeIn
      direction="up"
      delay={150}
      className="flex h-full flex-col justify-between rounded-md border border-neutral-800 bg-neutral-950 p-5"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900/60 text-purple-400">
              <PieChart size={20} strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                สัดส่วนหมวดหมู่
              </h3>
              <p className="text-xs text-neutral-400">
                สัดส่วนตามสินค้าในแต่ละหมวดหมู่
              </p>
            </div>
          </div>

          {/* Toggle metric */}
          <div className="flex items-center rounded-sm border border-neutral-800 bg-neutral-900/60 p-0.5">
            <button
              type="button"
              onClick={() => setMetric("revenue")}
              className={`rounded-sm px-2 py-1 text-xs font-medium transition ${
                metric === "revenue"
                  ? "bg-purple-600 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              ยอดขาย
            </button>
            <button
              type="button"
              onClick={() => setMetric("sold")}
              className={`rounded-sm px-2 py-1 text-xs font-medium transition ${
                metric === "sold"
                  ? "bg-purple-600 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              จำนวนขาย
            </button>
          </div>
        </div>

        {/* Doughnut Chart Canvas with Center Text */}
        <div className="relative my-4 flex h-[200px] w-full items-center justify-center">
          {isLoading && activeData.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 size={24} className="animate-spin text-purple-400" />
            </div>
          ) : (
            <>
              <canvas ref={canvasRef} />
              {/* Center text */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-medium text-neutral-500">
                  {metric === "revenue" ? "ยอดรวมทั้งหมด" : "จำนวนขายรวม"}
                </span>
                <span className="mt-0.5 text-sm font-bold text-white sm:text-base">
                  {metric === "revenue"
                    ? `฿${totalValue.toLocaleString("th-TH", {
                        maximumFractionDigits: 0,
                      })}`
                    : `${totalValue.toLocaleString()} ชิ้น`}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Custom Legend / Category List */}
      <div className="mt-2 max-h-40 space-y-1.5 overflow-y-auto pr-1">
        {activeData.length === 0 ? (
          <p className="py-2 text-center text-xs text-neutral-500">
            ยังไม่มีหมวดหมู่สินค้าในระบบ
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
                className="flex items-center justify-between rounded-sm px-2 py-1 text-xs transition hover:bg-neutral-900/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate font-medium text-neutral-300">
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-neutral-400">
                    {metric === "revenue"
                      ? `฿${cat.value.toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : `${cat.value.toLocaleString()} ชิ้น`}
                  </span>
                  <span className="w-12 text-right font-medium text-neutral-500">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </FadeIn>
  );
}
