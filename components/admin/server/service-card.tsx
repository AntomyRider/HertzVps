"use client";

import { DatabaseMetrics, NodeMetrics } from "@/store/serverStore";
import { formatBytes, formatUptime } from "./utils";
import { Database, Box, CheckCircle2, AlertCircle, Zap } from "lucide-react";

interface ServiceCardProps {
  database: DatabaseMetrics;
  node: NodeMetrics;
}

export default function ServiceCard({ database, node }: ServiceCardProps) {
  const isDbConnected = database.status === "connected";
  const latencyColor =
    database.latencyMs < 50
      ? "text-emerald-400"
      : database.latencyMs < 150
      ? "text-amber-400"
      : "text-red-400";

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {/* Database Status Card */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5">
        <div className="flex items-start justify-between border-b border-neutral-800/80 pb-4">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950/60 text-blue-400">
              <Database size={20} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm  text-white">ฐานข้อมูล</h3>
              <p className="mt-0.5 text-xs text-neutral-400 truncate">
                {database.engine} ({database.version})
              </p>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium shrink-0 ${
              isDbConnected
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isDbConnected ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
            <span>{isDbConnected ? "เชื่อมต่อแล้ว" : "เกิดข้อผิดพลาด"}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-2.5">
            <div className="flex items-center gap-1 text-2xs text-neutral-500">
              <Zap size={13} />
              <span className="truncate">ความเร็วตอบสนอง</span>
            </div>
            <p className={`mt-1 text-xs font-bold ${latencyColor}`}>
              {isDbConnected ? `${database.latencyMs} ms` : "N/A"}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-2.5">
            <span className="text-2xs text-neutral-500">เวอร์ชันระบบ</span>
            <p className="mt-1 truncate text-xs  text-white" title={database.version}>
              {database.version}
            </p>
          </div>
        </div>
      </div>

      {/* Node.js Application Process Card */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5">
        <div className="flex items-start justify-between border-b border-neutral-800/80 pb-4">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950/60 text-blue-400">
              <Box size={20} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm  text-white">แอปพลิเคชัน</h3>
              <p className="mt-0.5 text-xs text-neutral-400 truncate">
                Runtime {node.version} (PID: {node.pid})
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs  text-emerald-400">
              {formatUptime(node.uptimeSeconds)}
            </span>
            <span className="block text-2xs text-neutral-500">Uptime ระบบ</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-2.5">
            <span className="text-2xs text-neutral-500">หน่วยความจำ RSS</span>
            <p className="mt-1 text-xs  text-white">
              {formatBytes(node.memory.rss)}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800/60 bg-neutral-950/60 p-2.5">
            <span className="text-2xs text-neutral-500">Heap Used / Total</span>
            <p className="mt-1 text-xs  text-white">
              {formatBytes(node.memory.heapUsed)} / {formatBytes(node.memory.heapTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
