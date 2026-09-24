"use client";

import { CpuMetrics } from "@/store/serverStore";
import { getStatusColor } from "./utils";
import { Cpu, Activity } from "lucide-react";

interface CpuCardProps {
  cpu: CpuMetrics;
}

export default function CpuCard({ cpu }: CpuCardProps) {
  const statusColor = getStatusColor(cpu.usagePercent);

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900/60 text-blue-400">
            <Cpu size={20} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white">หน่วยประมวลผล (CPU)</h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-neutral-400" title={cpu.model}>
              {cpu.model}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className={`text-xl font-bold ${statusColor.text}`}>
            {cpu.usagePercent}%
          </span>
          <span className="block text-[11px] text-neutral-500">การใช้งานรวม</span>
        </div>
      </div>

      {/* Main CPU Progress Bar */}
      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-sm bg-neutral-900">
          <div
            className={`h-full transition-all duration-500 ${statusColor.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, cpu.usagePercent))}%` }}
          />
        </div>
      </div>

      {/* Info Stats Grid */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-sm border border-neutral-800/60 bg-neutral-900/40 p-2.5">
          <span className="text-[11px] text-neutral-500">จำนวนคอร์ (Cores)</span>
          <p className="mt-1 text-xs font-semibold text-white">
            {cpu.cores} Cores / Threads
          </p>
        </div>

        <div className="rounded-sm border border-neutral-800/60 bg-neutral-900/40 p-2.5">
          <span className="text-[11px] text-neutral-500">Load Avg (1m)</span>
          <p className="mt-1 text-xs font-semibold text-white">
            {cpu.loadAvg[0]}
          </p>
        </div>

        <div className="rounded-sm border border-neutral-800/60 bg-neutral-900/40 p-2.5">
          <span className="text-[11px] text-neutral-500">Load Avg (5m)</span>
          <p className="mt-1 text-xs font-semibold text-white">
            {cpu.loadAvg[1]}
          </p>
        </div>

        <div className="rounded-sm border border-neutral-800/60 bg-neutral-900/40 p-2.5">
          <span className="text-[11px] text-neutral-500">Load Avg (15m)</span>
          <p className="mt-1 text-xs font-semibold text-white">
            {cpu.loadAvg[2]}
          </p>
        </div>
      </div>

      {/* Per-Core Usage Mini Visualizer */}
      {cpu.perCoreUsage && cpu.perCoreUsage.length > 0 && (
        <div className="mt-4 border-t border-neutral-800/60 pt-3">
          <div className="mb-2 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1">
              <Activity size={12} />
              <span>การทำงานแยกรายคอร์ ({cpu.perCoreUsage.length} Cores)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-8">
            {cpu.perCoreUsage.map((coreUsage, index) => {
              const coreColor = getStatusColor(coreUsage);
              return (
                <div
                  key={index}
                  className="rounded-sm border border-neutral-800/60 bg-neutral-900/40 p-1.5"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-neutral-500">C{index}</span>
                    <span className={`font-medium ${coreColor.text}`}>
                      {coreUsage}%
                    </span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-sm bg-neutral-800">
                    <div
                      className={`h-full transition-all duration-300 ${coreColor.bar}`}
                      style={{ width: `${coreUsage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
