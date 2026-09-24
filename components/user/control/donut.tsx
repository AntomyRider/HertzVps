"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  registerables,
  type ChartConfiguration,
} from "chart.js";
import { PieChart } from "lucide-react";
import { useControlStore } from "@/store/controlStore";

ChartJS.register(...registerables);

export const ControlDonut = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  const { stats } = useControlStore();
  const total = stats.total;
  const isZero = total === 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const config: ChartConfiguration<"doughnut"> = {
      type: "doughnut",
      data: {
        labels: isZero ? ["ไม่มีข้อมูล"] : ["สำเร็จ", "ผิดพลาด", "ติดอนุมัติ"],
        datasets: [
          {
            data: isZero
              ? [1]
              : [stats.success, stats.failed, stats.pending],
            backgroundColor: isZero
              ? ["rgba(255, 255, 255, 0.06)"]
              : ["#10b981", "#ef4444", "#f59e0b"],
            borderWidth: 0,
            hoverOffset: isZero ? 0 : 4,
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
            enabled: !isZero,
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
                return ` ${item.label}: ${val} รายการ`;
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
  }, [stats.success, stats.failed, stats.pending, isZero]);

  const items = [
    { label: "สำเร็จ", color: "bg-emerald-500" },
    { label: "ผิดพลาด", color: "bg-red-500" },
    { label: "ติดอนุมัติ", color: "bg-amber-500" },
  ];

  return (
    <div className="flex flex-col justify-between rounded-md border border-neutral-800 bg-neutral-950 p-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900/60 text-blue-400">
          <PieChart size={20} strokeWidth={1.8} />
        </div>
        <div>
          <h3 className="text-base font-bold tracking-tight text-white">
            สรุปสถานะการทำงาน
          </h3>
          <p className="mt-0.5 text-xs text-neutral-400">
            สัดส่วนคำขอตามผลลัพธ์การทำงาน
          </p>
        </div>
      </div>

      {/* Doughnut Canvas */}
      <div className="relative my-6 h-[200px] w-full">
        <canvas ref={canvasRef} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tracking-tight text-white">
            {total.toLocaleString("th-TH")}
          </span>
          <span className="text-xs text-neutral-400">รายการทั้งหมด</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-1.5 text-xs text-neutral-400"
          >
            <span className={`h-2 w-2 rounded-sm ${item.color}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ControlDonut;
