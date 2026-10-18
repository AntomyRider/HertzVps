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
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950/60 text-blue-400">
            <HardDrive size={20} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm  text-white">พื้นที่จัดเก็บข้อมูล</h3>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-0.5 text-2xs text-neutral-400">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
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
          <span className="block text-2xs text-neutral-500">
            ใช้งาน {formatBytes(disk.usedBytes)}
          </span>
        </div>
      </div>

      {/* Main Disk Progress Bar */}
      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-950/80">
          <div
            className={`h-full rounded-full transition-all duration-500 ${diskColor.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, disk.usagePercent))}%` }}
          />
        </div>
      </div>

      {/* Disk Details */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-2.5">
          <span className="text-2xs text-neutral-500">ใช้ไป</span>
          <p className="mt-1 text-xs  text-white">
            {formatBytes(disk.usedBytes)}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-2.5">
          <span className="text-2xs text-neutral-500">พื้นที่เหลือ</span>
          <p className="mt-1 text-xs  text-emerald-400">
            {formatBytes(disk.freeBytes)}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-2.5">
          <span className="text-2xs text-neutral-500">ความจุรวม</span>
          <p className="mt-1 text-xs  text-white">
            {formatBytes(disk.totalBytes)}
          </p>
        </div>
      </div>

      {/* Low space warning */}
      {disk.usagePercent >= 85 && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-400">
          <AlertTriangle size={15} className="shrink-0" />
          <span>คำเตือน: พื้นที่จัดเก็บข้อมูลใกล้เต็มแล้ว แนะนำให้ตรวจสอบหรือเคลียร์ log ขยะ</span>
        </div>
      )}
    </div>
  );
}
