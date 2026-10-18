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
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950/60 text-blue-400">
            <Server size={20} strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm  text-white">
                ระบบปฏิบัติการและเครื่องเซิร์ฟเวอร์
              </h3>
              {isUbuntu && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-2xs font-medium text-orange-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
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
          <span className="text-2xs text-neutral-500">ระยะเวลาเปิดใช้งาน (Uptime)</span>
          <span className="text-xs  text-emerald-400">
            {formatUptime(system.uptimeSeconds)}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-3">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Terminal size={14} />
            <span className="text-2xs">ชื่อโฮสต์ (Hostname)</span>
          </div>
          <p className="mt-1.5 truncate text-xs  text-white" title={system.hostname}>
            {system.hostname}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-3">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Cpu size={14} />
            <span className="text-2xs">สถาปัตยกรรม (Arch)</span>
          </div>
          <p className="mt-1.5 text-xs  text-white">
            {system.arch} ({system.platform})
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-3">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <HardDrive size={14} />
            <span className="text-2xs">เคอร์เนล (Kernel)</span>
          </div>
          <p className="mt-1.5 truncate text-xs  text-white" title={system.kernel}>
            {system.kernel}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-3 sm:hidden">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Clock size={14} />
            <span className="text-2xs">ระยะเวลา Uptime</span>
          </div>
          <p className="mt-1.5 text-xs  text-emerald-400">
            {formatUptime(system.uptimeSeconds)}
          </p>
        </div>

        <div className="hidden rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-3 sm:block">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Clock size={14} />
            <span className="text-2xs">สถานะเครื่อง</span>
          </div>
          <p className="mt-1.5 text-xs  text-emerald-400">
            ออนไลน์ (Online)
          </p>
        </div>
      </div>
    </div>
  );
}
