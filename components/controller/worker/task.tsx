"use client";

import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import TaskCharacter from "./task-character";
import type { ControllerAccountTimer } from "@/store/controllerStore";

interface TaskWorkerControllerProps {
  currentTask: string;
  groupName: string;
  groupCurrent: number;
  groupTotal: number;
  isRunning: boolean;
  taskTimer?: ControllerAccountTimer | null;
  className?: string;
}

/**
 * คอมโพเนนต์แสดงสถานะงานปัจจุบัน (TASK) และกลุ่มเป้าหมาย (GROUPS)
 * ออกแบบ UI ตามสไตล์โปรแกรม Hertz Auto Post
 */
export default function TaskWorkerController({
  currentTask,
  groupName,
  groupCurrent = 0,
  groupTotal = 0,
  isRunning,
  taskTimer,
  className = "",
}: TaskWorkerControllerProps) {
  const [seconds, setSeconds] = useState(0);
  const [countdown, setCountdown] = useState<number>(0);

  const endTime = taskTimer?.endTime || 0;

  // นับเวลาการทำงาน (Elapsed Time) เมื่อบัญชีกำลังรัน
  useEffect(() => {
    if (!isRunning) {
      setSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      setSeconds(0);
    };
  }, [isRunning]);

  // คำนวณเวลานับถอยหลัง (Countdown) ถ้ามี endTime ส่งมาจากโปรแกรม
  useEffect(() => {
    if (!endTime || !isRunning) {
      setCountdown(0);
      return;
    }

    const calculateTime = () => {
      const now = Date.now();
      const diff = Math.max(0, (endTime - now) / 1000);
      setCountdown(diff);
      return diff > 0;
    };

    const timer = setTimeout(calculateTime, 0);

    const interval = setInterval(() => {
      const stillActive = calculateTime();
      if (!stillActive) {
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      setCountdown(0);
    };
  }, [endTime, isRunning]);

  // จัดรูปแบบเวลานับถอยหลัง
  const formatCountdown = (sec: number) => {
    if (sec <= 0) return "";
    const totalSec = Math.max(0, sec);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const s = Math.floor(totalSec % 60);
    if (hours > 0) {
      return `${hours} ชม. ${minutes} นาที`;
    }
    if (minutes > 0) {
      return `${minutes} นาที ${s} วินาที`;
    }
    return `${totalSec.toFixed(1)} วินาที`;
  };

  // จัดรูปแบบเวลาที่รันมาแล้ว (Elapsed)
  const formatElapsed = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (hours > 0) {
      return `${hours} ชม. ${minutes} นาที`;
    }
    if (minutes > 0) {
      return `${minutes} นาที ${s} วิ`;
    }
    return `${s} วิ`;
  };

  const displayTask =
    currentTask && currentTask.trim()
      ? currentTask
      : isRunning
        ? "กำลังเริ่มงาน..."
        : "-";

  const formattedCountdown = formatCountdown(countdown);
  const hasEmbeddedTimer = /\b\d+(\.\d+)?s$/i.test(displayTask.trim());
  const shouldShowCountdown =
    isRunning && Boolean(formattedCountdown) && !hasEmbeddedTimer;

  const displayGroup =
    groupName && groupName.trim()
      ? groupName
      : isRunning
        ? "-"
        : "ยังไม่ได้เลือกกลุ่ม";

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 p-2.5 select-none transition-all duration-200 ${className}`}
    >
      {/* Top highlight specular edge */}
      <div className="pointer-events-none absolute inset-x-2 top-0 z-10 h-px bg-white/10" />

      {/* Ambient soft glow */}
      <div
        className={`pointer-events-none absolute -left-5 -top-5 h-12 w-12 rounded-full blur-lg transition-all duration-300 ${
          isRunning
            ? "bg-blue-500/[0.08] group-hover:bg-blue-500/[0.12]"
            : "bg-white/[0.02]"
        }`}
      />

      {/* เนื้อหาหลักแบบ 2 ส่วน: TASK และ GROUPS */}
      <div className="relative z-10 flex flex-col gap-2">
        {/* ส่วนที่ 1: TASK */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 ${
                  isRunning
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                    : "border-neutral-800 bg-neutral-950 text-neutral-500"
                }`}
              >
                <TaskCharacter isRunning={isRunning} size={20} />
              </div>

              <div className="flex min-w-0 flex-col">
                <span
                  className={`text-[10px] uppercase tracking-wider transition-colors duration-200 ${
                    isRunning ? "text-neutral-400" : "text-neutral-500"
                  }`}
                >
                  TASK
                </span>

                <div
                  className={`flex items-baseline gap-1.5 overflow-hidden text-xs leading-snug transition-colors duration-200 ${
                    isRunning ? "text-neutral-200" : "text-neutral-500"
                  }`}
                >
                  <span className="truncate">{displayTask}</span>
                  {shouldShowCountdown && (
                    <span className="shrink-0 font-mono text-[11px] text-emerald-400">
                      {formattedCountdown}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <span
              className={`shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[10px] transition-colors duration-200 ${
                isRunning
                  ? "border-blue-500/25 bg-blue-500/15 text-blue-400"
                  : "border-neutral-800 bg-neutral-950 text-neutral-500"
              }`}
            >
              {formatElapsed(seconds)}
            </span>
          </div>
        </div>

        {/* เส้นคั่นบาง */}
        <div className="h-px w-full bg-neutral-800/80" />

        {/* ส่วนที่ 2: GROUPS */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 ${
                  isRunning
                    ? "border-sky-400/30 bg-sky-400/15 text-sky-400"
                    : "border-neutral-800 bg-neutral-950 text-neutral-500"
                }`}
              >
                <Users
                  size={18}
                  strokeWidth={1.8}
                  className={`shrink-0 transition-colors duration-200 ${
                    isRunning ? "text-sky-400" : "text-neutral-500"
                  }`}
                />
              </div>

              <div className="flex min-w-0 flex-col">
                <span
                  className={`text-[10px] uppercase tracking-wider transition-colors duration-200 ${
                    isRunning ? "text-neutral-400" : "text-neutral-500"
                  }`}
                >
                  GROUPS{" "}
                  {isRunning && groupTotal > 1
                    ? `(${groupCurrent}/${groupTotal})`
                    : ""}
                </span>

                <p
                  className={`truncate text-xs leading-snug transition-colors duration-200 ${
                    isRunning ? "text-neutral-200" : "text-neutral-500"
                  }`}
                >
                  {displayGroup}
                </p>
              </div>
            </div>

            <span
              className={`shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[10px] transition-colors duration-200 ${
                isRunning
                  ? "border-sky-500/25 bg-sky-500/15 text-sky-400"
                  : "border-neutral-800 bg-neutral-950 text-neutral-500"
              }`}
            >
              {groupCurrent} / {groupTotal}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
