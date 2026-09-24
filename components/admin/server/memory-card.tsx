"use client";

import { MemoryMetrics } from "@/store/serverStore";
import { formatBytes, getStatusColor } from "./utils";
import { MemoryStick, Layers } from "lucide-react";

interface MemoryCardProps {
  memory: MemoryMetrics;
}

export default function MemoryCard({ memory }: MemoryCardProps) {
  const ramColor = getStatusColor(memory.usagePercent);
  const swapColor = getStatusColor(memory.swap.usagePercent);

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900/60 text-blue-400">
            <MemoryStick size={20} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white">หน่วยความจำหลัก (RAM)</h3>
            <p className="mt-0.5 text-xs text-neutral-400">
              ความจุรวม {formatBytes(memory.totalBytes)}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className={`text-xl font-bold ${ramColor.text}`}>
            {memory.usagePercent}%
          </span>
          <span className="block text-[11px] text-neutral-500">
            ใช้งาน {formatBytes(memory.usedBytes)}
          </span>
        </div>
      </div>

      {/* Main RAM Progress Bar */}
      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-sm bg-neutral-900">
          <div
            className={`h-full transition-all duration-500 ${ramColor.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, memory.usagePercent))}%` }}
          />
        </div>
      </div>

      {/* RAM Details */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-sm border border-neutral-800/60 bg-neutral-900/40 p-2.5">
          <span className="text-[11px] text-neutral-500">ใช้งานแล้ว (Used)</span>
          <p className="mt-1 text-xs font-semibold text-white">
            {formatBytes(memory.usedBytes)}
          </p>
        </div>

        <div className="rounded-sm border border-neutral-800/60 bg-neutral-900/40 p-2.5">
          <span className="text-[11px] text-neutral-500">พร้อมใช้งาน (Available)</span>
          <p className="mt-1 text-xs font-semibold text-emerald-400">
            {formatBytes(memory.availableBytes)}
          </p>
        </div>

        <div className="rounded-sm border border-neutral-800/60 bg-neutral-900/40 p-2.5">
          <span className="text-[11px] text-neutral-500">ว่าง (Free)</span>
          <p className="mt-1 text-xs font-semibold text-white">
            {formatBytes(memory.freeBytes)}
          </p>
        </div>

        <div className="rounded-sm border border-neutral-800/60 bg-neutral-900/40 p-2.5">
          <span className="text-[11px] text-neutral-500">แคชระบบ (Buffers/Cached)</span>
          <p className="mt-1 text-xs font-semibold text-neutral-300">
            {formatBytes(memory.buffersCacheBytes)}
          </p>
        </div>
      </div>

      {/* Linux Swap Section */}
      <div className="mt-4 border-t border-neutral-800/60 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Layers size={14} />
            <span>พื้นที่ Swap เสมือน (Linux Swap)</span>
          </div>
          <div className="text-left sm:text-right">
            <span className={`text-xs font-semibold ${swapColor.text}`}>
              {memory.swap.totalBytes > 0
                ? `${memory.swap.usagePercent}% (${formatBytes(memory.swap.usedBytes)} / ${formatBytes(memory.swap.totalBytes)})`
                : "ไม่ได้เปิดใช้งาน (None)"}
            </span>
          </div>
        </div>

        {memory.swap.totalBytes > 0 && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-sm bg-neutral-900">
            <div
              className={`h-full transition-all duration-500 ${swapColor.bar}`}
              style={{ width: `${Math.min(100, Math.max(0, memory.swap.usagePercent))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
