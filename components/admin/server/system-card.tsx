"use client";

import { SystemMetrics } from "@/store/serverStore";
import { formatUptime } from "./utils";
import { Server, Clock, Cpu, HardDrive, Terminal } from "lucide-react";

interface SystemCardProps {
  system: SystemMetrics;
}

export default function SystemCard({ system }: SystemCardProps) {
  const isUbuntu = system.osName.toLowerCase().includes("ubuntu") || system.distro.toLowerCase().includes("ubuntu");

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950 p-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900/60 text-blue-400">
            <Server size={20} strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                ระบบปฏิบัติการและเครื่องเซิร์ฟเวอร์
              </h3>
              {isUbuntu && (
                <span className="rounded-sm border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[11px] font-medium text-orange-400">
                  Ubuntu Linux
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-neutral-400">
              {system.osName} {system.codename ? `(${system.codename})` : ""}
            </p>
          </div>
        </div>

        {/* Uptime Badge */}
        <div className="hidden sm:flex sm:flex-col sm:items-end">
          <span className="text-[11px] text-neutral-500">ระยะเวลาเปิดใช้งาน (Uptime)</span>
          <span className="text-xs font-semibold text-emerald-400">
            {formatUptime(system.uptimeSeconds)}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-sm border border-neutral-800/60 bg-neutral-900/40 p-3">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Terminal size={14} />
            <span className="text-[11px]">ชื่อโฮสต์ (Hostname)</span>
          </div>
          <p className="mt-1.5 truncate text-xs font-semibold text-white" title={system.hostname}>
            {system.hostname}
          </p>
        </div>

        <div className="rounded-sm border border-neutral-800/60 bg-neutral-900/40 p-3">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Cpu size={14} />
            <span className="text-[11px]">สถาปัตยกรรม (Arch)</span>
          </div>
          <p className="mt-1.5 text-xs font-semibold text-white">
            {system.arch} ({system.platform})
          </p>
        </div>

        <div className="rounded-sm border border-neutral-800/60 bg-neutral-900/40 p-3">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <HardDrive size={14} />
            <span className="text-[11px]">เคอร์เนล (Kernel)</span>
          </div>
          <p className="mt-1.5 truncate text-xs font-semibold text-white" title={system.kernel}>
            {system.kernel}
          </p>
        </div>

        <div className="rounded-sm border border-neutral-800/60 bg-neutral-900/40 p-3 sm:hidden">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Clock size={14} />
            <span className="text-[11px]">ระยะเวลา Uptime</span>
          </div>
          <p className="mt-1.5 text-xs font-semibold text-emerald-400">
            {formatUptime(system.uptimeSeconds)}
          </p>
        </div>

        <div className="hidden rounded-sm border border-neutral-800/60 bg-neutral-900/40 p-3 sm:block">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Clock size={14} />
            <span className="text-[11px]">สถานะเครื่อง</span>
          </div>
          <p className="mt-1.5 text-xs font-semibold text-emerald-400">
            ออนไลน์ (Online)
          </p>
        </div>
      </div>
    </div>
  );
}
