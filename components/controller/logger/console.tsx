"use client";

import React, { useEffect, useRef } from "react";
import { Terminal, Clock, ShieldAlert } from "lucide-react";
import { useControllerStore } from "@/store/controllerStore";
import type { LogLevel } from "./types";

const levelBadges: Record<
  LogLevel,
  { label: string; badgeClass: string }
> = {
  info: {
    label: "INFO",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-400/20",
  },
  success: {
    label: "SUCCESS",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-400/20",
  },
  warn: {
    label: "WARN",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-400/20",
  },
  error: {
    label: "ERROR",
    badgeClass: "bg-red-500/10 text-red-400 border-red-400/20",
  },
  debug: {
    label: "DEBUG",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-400/20",
  },
};

const Console = () => {
  const { logs = [], logFilter } = useControllerStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);

  const autoScroll = logFilter?.autoScroll ?? true;
  const levelFilter = logFilter?.level ?? "all";
  const searchQuery = logFilter?.search ?? "";

  // คำนวณ Level ของแต่ละ Log
  const getNormalizedLevel = (item: {
    level?: string;
    status?: string;
    message?: string;
  }): LogLevel => {
    if (item.level) {
      const lv = item.level.toLowerCase();
      if (["info", "success", "warn", "error", "debug"].includes(lv)) {
        return lv as LogLevel;
      }
    }
    if (item.status === "SUCCESS") return "success";
    if (item.status === "FAILED") return "error";
    const msg = (item.message || "").toLowerCase();
    if (msg.includes("เตือน") || msg.includes("warn")) return "warn";
    if (msg.includes("ล้มเหลว") || msg.includes("error")) return "error";
    if (msg.includes("สำเร็จ") || msg.includes("success")) return "success";
    return "info";
  };

  // กรองรายการ Logs ตามตัวกรองและคำค้นหา
  const filteredLogs = logs.filter((item) => {
    const itemLevel = getNormalizedLevel(item);
    const matchLevel = levelFilter === "all" || itemLevel === levelFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchSearch =
      !query ||
      item.message.toLowerCase().includes(query) ||
      (item.source && item.source.toLowerCase().includes(query)) ||
      (item.accountName && item.accountName.toLowerCase().includes(query)) ||
      itemLevel.toLowerCase().includes(query);
    return matchLevel && matchSearch;
  });

  // Auto Scroll เมื่อมี Log ใหม่เข้ามา
  useEffect(() => {
    if (autoScroll && bottomAnchorRef.current) {
      bottomAnchorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [logs, autoScroll]);

  return (
    <div
      className="
        group relative
        flex min-h-0 flex-1 flex-col
        overflow-hidden
        rounded-2xl
        bg-neutral-950
        border border-white/[0.12]
        shadow-[0_6px_0_rgba(0,0,0,0.45),0_12px_24px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.12),inset_0_-1px_2px_rgba(0,0,0,0.5)]
        transition-all duration-200 ease-out
      "
    >
      {/* Top highlight */}
      <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white/20 z-20" />

      {/* Soft light glow */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/[0.04] blur-2xl z-0" />

      {/* Watermark Large Terminal Icon (Desktop only) */}
      <Terminal
        size={220}
        strokeWidth={0.8}
        className="
          pointer-events-none
          absolute
          -right-6
          -bottom-10
          text-white/[0.02]
          drop-shadow-[0_3px_4px_rgba(0,0,0,0.4)]
          hidden
          sm:block
          z-0
          select-none
        "
      />

      {/* Console Window Header */}
      <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/[0.08] bg-neutral-900/40 px-3 py-2.5 sm:px-4 sm:py-3 select-none backdrop-blur-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Terminal status dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-yellow-500/80 shadow-[0_0_6px_rgba(234,179,8,0.5)]" />
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-green-500/80 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
          </div>

          <div className="h-3.5 w-px bg-white/10 mx-0.5 sm:mx-1 shrink-0" />

          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-neutral-200 truncate">
            <Terminal
              size={14}
              className="text-blue-400 shrink-0"
            />
            <span className="tracking-tight truncate">
              แสดงผลการทำงาน
            </span>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 sm:gap-2.5 text-xs shrink-0">
          <span className="flex items-center gap-1.5 text-neutral-400">
            <span className="inline-block h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
            <span className="hidden xs:inline sm:inline">Live Stream</span>
          </span>
          <span className="rounded-md sm:rounded-lg border border-white/[0.08] bg-neutral-900/80 px-2 py-0.5 sm:px-2.5 sm:py-1 text-neutral-300 text-[11px] sm:text-xs shadow-sm">
            {filteredLogs.length} / {logs.length}
          </span>
        </div>
      </div>

      {/* Log Stream Body */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 min-h-0 flex-1 overflow-y-auto p-2 sm:p-4 space-y-1 sm:space-y-1.5 scroll-smooth [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent]"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[220px] sm:min-h-[300px] text-center p-4 sm:p-8 select-none">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-white/[0.12] bg-neutral-900/80 shadow-inner mb-3">
              {searchQuery || levelFilter !== "all" ? (
                <ShieldAlert
                  size={24}
                  className="text-amber-400"
                />
              ) : (
                <Clock
                  size={24}
                  className="text-blue-400"
                />
              )}
            </div>
            <h4 className="text-sm text-neutral-200">
              {searchQuery || levelFilter !== "all"
                ? "ไม่พบข้อความ Log ที่ตรงกับเงื่อนไขการค้นหา"
                : "ยังไม่มีรายการ Log ในขณะนี้"}
            </h4>
            <p className="mt-1 text-xs text-neutral-500 max-w-sm">
              {searchQuery || levelFilter !== "all"
                ? "ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองเป็น 'ทั้งหมด'"
                : "เมื่อระบบหรือบอทเริ่มทำงาน ข้อมูล Log จะแสดงขึ้นที่นี่อัตโนมัติ"}
            </p>
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const itemLevel = getNormalizedLevel(log);
            const badge = levelBadges[itemLevel] || levelBadges.info;

            return (
              <div
                key={log.id || index}
                className="
                  group/item
                  flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3
                  rounded-lg sm:rounded-xl
                  border border-transparent
                  px-2 py-1.5 sm:px-3 sm:py-2
                  text-xs
                  transition-colors duration-150
                  hover:border-white/[0.08]
                  hover:bg-white/[0.03]
                "
              >
                {/* Meta Row (Timestamp + Level Badge + optional Account tag) */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 select-none sm:pt-0.5">
                  {/* Timestamp */}
                  <span className="shrink-0 text-neutral-500 font-mono text-[11px] sm:text-xs">
                    [{log.timestamp}]
                  </span>

                  {/* Level Badge */}
                  <span
                    className={`
                      shrink-0
                      rounded
                      border
                      px-1.5 py-0.2 sm:px-2 sm:py-0.5
                      text-[10px] sm:text-[11px]
                      tracking-wide
                      ${badge.badgeClass}
                    `}
                  >
                    {badge.label}
                  </span>

                  {log.accountName && (
                    <span className="text-neutral-400 text-[10px] sm:text-[11px] truncate max-w-[100px] sm:max-w-[130px]">
                      @{log.accountName}
                    </span>
                  )}
                </div>

                {/* Message Content */}
                <span
                  className={`min-w-0 flex-1 break-words leading-relaxed selection:bg-blue-500/30 ${
                    itemLevel === "success"
                      ? "text-emerald-400"
                      : itemLevel === "error"
                      ? "text-red-400"
                      : itemLevel === "warn"
                      ? "text-amber-300"
                      : "text-neutral-200"
                  }`}
                >
                  {log.message}
                </span>
              </div>
            );
          })
        )}

        {/* Scroll anchor */}
        <div ref={bottomAnchorRef} className="h-px w-full" />
      </div>

      {/* Bottom bevel */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/30 to-transparent z-20" />
    </div>
  );
};

export default Console;
