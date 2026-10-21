"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useControllerStore } from "@/store/controllerStore";
import OdometerNumber from "@/components/ui/odometer";

export default function DonutOverviewController() {
  const { stats: sourceStats, statsMode } = useControllerStore();

  const isShareMode = statsMode === "share";
  const isBoostMode = statsMode === "boost";

  const data = isBoostMode
    ? [
        {
          key: "boost",
          label: "สำเร็จ",
          value: sourceStats.boost ?? 0,
          color: "#22c55e",
        },
        {
          key: "boostFailed",
          label: "ผิดพลาด",
          value: sourceStats.boostFailed ?? 0,
          color: "#ef4444",
        },
      ]
    : [
        {
          key: isShareMode ? "share" : "success",
          label: "สำเร็จ",
          value: isShareMode ? sourceStats.share ?? 0 : sourceStats.success,
          color: "#22c55e",
        },
        {
          key: isShareMode ? "shareFailed" : "failed",
          label: "ผิดพลาด",
          value: isShareMode ? sourceStats.shareFailed ?? 0 : sourceStats.failed,
          color: "#ef4444",
        },
        {
          key: isShareMode ? "sharePending" : "pending",
          label: "ติดอนุมัติ",
          value: isShareMode ? sourceStats.sharePending ?? 0 : sourceStats.pending,
          color: "#eab308",
        },
      ];

  const total = isBoostMode
    ? sourceStats.boostTotal ?? 0
    : isShareMode
      ? sourceStats.shareTotal ?? 0
      : sourceStats.total;

  const isZero = total === 0;

  const chartSlices = isZero
    ? [
        {
          key: "empty",
          label: "ไม่มีข้อมูล",
          value: 1,
          color: "rgba(255,255,255,0.06)",
        },
      ]
    : data;

  return (
    <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition-all duration-200">
      {/* Top highlight specular edge */}
      <div className="pointer-events-none absolute inset-x-3 top-0 z-20 h-px bg-white/10" />

      {/* Soft ambient light */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-24 w-24 rounded-full bg-white/[0.03] blur-2xl transition-all duration-300 group-hover:bg-white/[0.06]" />

      {/* Header */}
      <div className="relative z-10 px-5 py-4">
        <h2 className="text-sm  text-white">สรุปสถานะการทำงาน</h2>
        <p className="mt-0.5 text-xs text-neutral-400">
          สัดส่วนคำขอตามผลลัพธ์การทำงาน
        </p>
      </div>

      {/* Donut Chart */}
      <div className="relative h-[200px] w-full px-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length || isZero) return null;
                const entry = payload[0];

                return (
                  <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 shadow-xl">
                    <div className="flex items-center gap-2 text-xs  text-white">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: entry.payload.color,
                        }}
                      />
                      <span className="font-normal text-neutral-300">
                        {entry.payload.label}:
                      </span>
                      <span className="font-mono">
                        {Number(entry.value ?? 0).toLocaleString("th-TH")}
                      </span>
                    </div>
                  </div>
                );
              }}
            />

            <Pie
              data={chartSlices}
              dataKey="value"
              nameKey="label"
              innerRadius="65%"
              outerRadius="90%"
              paddingAngle={isZero ? 0 : 3}
              cornerRadius={4}
              stroke="none"
              isAnimationActive={false}
            >
              {chartSlices.map((slice) => (
                <Cell key={slice.key} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label with OdometerNumber */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xl font-bold text-white">
            <OdometerNumber value={total} />
          </span>

          <span className="text-[10px] text-neutral-400">
            {isBoostMode
              ? "ดันทั้งหมด"
              : isShareMode
                ? "แชร์ทั้งหมด"
                : "โพสต์ทั้งหมด"}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="relative z-10 flex items-center justify-center gap-4 pb-4">
        {data.map((slice) => (
          <div
            key={slice.key}
            className="flex items-center gap-1.5 text-xs text-neutral-400"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: slice.color,
              }}
            />
            <span>{slice.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
