"use client";

import {
  KeySquare,
  Radio,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  Activity,
} from "lucide-react";
import { useProgramOverviewStore } from "@/store/programOverviewStore";

export default function ProgramKpiCards() {
  const { summary } = useProgramOverviewStore();

  if (!summary) return null;

  const {
    totalKeys,
    onlineCount,
    offlineCount,
    errorCount,
    fleetSuccess,
    fleetFailed,
    fleetSuccessRate,
    weakestAction,
  } = summary;

  const onlineRate =
    totalKeys > 0 ? Math.round((onlineCount / totalKeys) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. คีย์ที่เปิดใช้งานแล้ว */}
        <div className="rounded-md border border-neutral-800 bg-neutral-950 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">
              คีย์ที่เปิดใช้งานแล้ว
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900/50 text-neutral-400">
              <KeySquare size={16} strokeWidth={1.8} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-white">
              {totalKeys.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              ออฟไลน์ {offlineCount.toLocaleString()} เครื่อง
            </p>
          </div>
        </div>

        {/* 2. เครื่องออนไลน์ตอนนี้ */}
        <div className="rounded-md border border-neutral-800 bg-neutral-950 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">
              กำลังออนไลน์ (Live)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <Radio size={16} strokeWidth={1.8} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-2xl font-bold tracking-tight text-white">
                {onlineCount.toLocaleString()}
              </span>
              <span className="text-xs text-neutral-500">/ {totalKeys} เครื่อง</span>
            </div>
            <p className="mt-1 text-xs text-emerald-400/90 font-medium">
              คิดเป็น {onlineRate}% ของคีย์ที่เปิดใช้งาน
            </p>
          </div>
        </div>

      {/* 3. อัตราความสำเร็จเฉลี่ยทั้งระบบ */}
      <div className="rounded-md border border-neutral-800 bg-neutral-950 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-400">
            อัตราความสำเร็จ (Success Rate)
          </span>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-sm border ${
              fleetSuccessRate >= 90
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : fleetSuccessRate >= 75
                ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                : "border-rose-500/20 bg-rose-500/10 text-rose-400"
            }`}
          >
            <Activity size={16} strokeWidth={1.8} />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold tracking-tight ${
                fleetSuccessRate >= 90
                  ? "text-emerald-400"
                  : fleetSuccessRate >= 75
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {fleetSuccessRate}%
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            สำเร็จ {fleetSuccess.toLocaleString()} • ล้มเหลว {fleetFailed.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 4. ฟังก์ชันที่มีปัญหา / อัตราสำเร็จต่ำสุด */}
      <div className="rounded-md border border-neutral-800 bg-neutral-950 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-400">
            ฟังก์ชันที่ติดขัดสูงสุด
          </span>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-sm border ${
              weakestAction
                ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                : "border-neutral-800 bg-neutral-900/50 text-neutral-500"
            }`}
          >
            {weakestAction ? (
              <AlertTriangle size={16} strokeWidth={1.8} />
            ) : (
              <CheckCircle2 size={16} strokeWidth={1.8} />
            )}
          </div>
        </div>
        <div className="mt-3">
          {weakestAction ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">
                  {weakestAction.label} ({weakestAction.action})
                </span>
                <span className="rounded-sm border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-xs font-semibold text-rose-400">
                  {weakestAction.successRate}%
                </span>
              </div>
              <p className="mt-1 text-xs text-rose-400/90">
                ล้มเหลวสะสม {weakestAction.failed.toLocaleString()} ครั้ง
              </p>
            </div>
          ) : (
            <div>
              <div className="text-lg font-bold text-emerald-400">ปกติทุกฟังก์ชัน</div>
              <p className="mt-1 text-xs text-neutral-500">
                ไม่พบฟังก์ชันที่ติดข้อผิดพลาดร้ายแรง
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
