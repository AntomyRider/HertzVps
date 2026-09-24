"use client";

import { DiskMetrics } from "@/store/serverStore";
import { formatBytes, getStatusColor } from "./utils";
import { HardDrive, AlertTriangle } from "lucide-react";

interface DiskCardProps {
  disk: DiskMetrics;
}

export default function DiskCard({ disk }: DiskCardProps) {
  const diskColor = getStatusColor(disk.usagePercent);

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900/60 text-blue-400">
            <HardDrive size={20} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-white">พื้นที่จัดเก็บข้อมูล (Disk)</h3>
              <span className="rounded-sm border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-[10px] text-neutral-400">
                Mount: {disk.mount}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-neutral-400">
              ความจุรวม {formatBytes(disk.totalBytes)}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className={`text-xl font-bold ${diskColor.text}`}>
            {disk.usagePercent}%
          </span>
          <span className="block text-[11px] text-neutral-500">
            ใช้งาน {formatBytes(disk.usedBytes)}
          </span>
        </div>
      </div>

      {/* Main Disk Progress Bar */}
      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-sm bg-neutral-900">
          <div
            className={`h-full transition-all duration-500 ${diskColor.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, disk.usagePercent))}%` }}
          />
        </div>
      </div>

      {/* Disk Details */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="rounded-sm border border-neutral-800/60 bg-neutral-900/40 p-2.5">
          <span className="text-[11px] text-neutral-500">ใช้ไป (Used)</span>
          <p className="mt-1 text-xs font-semibold text-white">
            {formatBytes(disk.usedBytes)}
          </p>
        </div>

        <div className="rounded-sm border border-neutral-800/60 bg-neutral-900/40 p-2.5">
          <span className="text-[11px] text-neutral-500">พื้นที่เหลือ (Free)</span>
          <p className="mt-1 text-xs font-semibold text-emerald-400">
            {formatBytes(disk.freeBytes)}
          </p>
        </div>

        <div className="rounded-sm border border-neutral-800/60 bg-neutral-900/40 p-2.5">
          <span className="text-[11px] text-neutral-500">ความจุรวม (Total)</span>
          <p className="mt-1 text-xs font-semibold text-white">
            {formatBytes(disk.totalBytes)}
          </p>
        </div>
      </div>

      {/* Low space warning */}
      {disk.usagePercent >= 85 && (
        <div className="mt-3 flex items-center gap-2 rounded-sm border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-400">
          <AlertTriangle size={15} className="shrink-0" />
          <span>คำเตือน: พื้นที่จัดเก็บข้อมูลใกล้เต็มแล้ว แนะนำให้ตรวจสอบหรือเคลียร์ log ขยะ</span>
        </div>
      )}
    </div>
  );
}
