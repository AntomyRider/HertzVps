"use client";

import { useEffect, useRef } from "react";
import {
  Terminal,
  Search,
  Trash2,
  ArrowDownCircle,
  Clock,
} from "lucide-react";
import {
  useControlStore,
  type ControlLogLevel,
} from "@/store/controlStore";

const LEVEL_BADGES: Record<
  ControlLogLevel,
  { label: string; badgeClass: string }
> = {
  info: {
    label: "INFO",
    badgeClass: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  },
  success: {
    label: "SUCCESS",
    badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },
  warn: {
    label: "WARN",
    badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
  error: {
    label: "ERROR",
    badgeClass: "border-red-500/20 bg-red-500/10 text-red-400",
  },
  debug: {
    label: "DEBUG",
    badgeClass: "border-neutral-700 bg-neutral-900 text-neutral-400",
  },
};

export const ControlLoggerSection = () => {
  const {
    logs,
    logLevelFilter,
    logSearchQuery,
    logAutoScroll,
    setLogLevelFilter,
    setLogSearchQuery,
    setLogAutoScroll,
    clearLogs,
  } = useControlStore();

  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

  const filteredLogs = logs.filter((item) => {
    const matchLevel =
      logLevelFilter === "all" || item.level === logLevelFilter;
    const query = logSearchQuery.toLowerCase().trim();
    const matchSearch =
      !query ||
      item.message.toLowerCase().includes(query) ||
      item.source.toLowerCase().includes(query) ||
      item.level.toLowerCase().includes(query);
    return matchLevel && matchSearch;
  });

  useEffect(() => {
    if (logAutoScroll && bottomAnchorRef.current) {
      bottomAnchorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [logs, logAutoScroll]);

  const levels: Array<{ label: string; value: "all" | ControlLogLevel }> = [
    { label: "ทั้งหมด", value: "all" },
    { label: "INFO", value: "info" },
    { label: "SUCCESS", value: "success" },
    { label: "WARN", value: "warn" },
    { label: "ERROR", value: "error" },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col justify-between gap-3 rounded-md border border-neutral-800 bg-neutral-950 p-4 lg:flex-row lg:items-center">
        {/* Left: Level Filters */}
        <div className="flex flex-wrap items-center gap-1 rounded-sm border border-neutral-800 bg-neutral-900/60 p-1">
          {levels.map((lvl) => (
            <button
              key={lvl.value}
              type="button"
              onClick={() => setLogLevelFilter(lvl.value)}
              className={`cursor-pointer rounded-sm px-2.5 py-1 text-xs font-medium transition ${
                logLevelFilter === lvl.value
                  ? "bg-blue-600 text-white"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>

        {/* Right: Search + Auto-scroll + Clear */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <input
              type="text"
              value={logSearchQuery}
              onChange={(e) => setLogSearchQuery(e.target.value)}
              placeholder="ค้นหาข้อความ Log..."
              className="w-full rounded-sm border border-neutral-800 bg-neutral-950 py-1.5 pl-8 pr-3 text-xs text-white placeholder-neutral-500 outline-none transition focus:border-blue-500/50"
            />
          </div>

          <button
            type="button"
            onClick={() => setLogAutoScroll(!logAutoScroll)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-medium transition ${
              logAutoScroll
                ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                : "border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            <ArrowDownCircle size={14} />
            <span>เลื่อนอัตโนมัติ</span>
          </button>

          <button
            type="button"
            onClick={clearLogs}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 size={14} />
            <span>ล้าง Log</span>
          </button>
        </div>
      </div>

      {/* Console Window */}
      <div className="flex h-[520px] flex-col overflow-hidden rounded-md border border-neutral-800 bg-neutral-950">
        {/* Console Header */}
        <div className="flex items-center justify-between border-b border-neutral-900 bg-neutral-900/40 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Terminal size={15} className="text-blue-400" />
            <span>Terminal Console</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <span className="h-2 w-2 rounded-sm bg-emerald-500" />
              <span>Live Stream</span>
            </span>
            <span className="rounded-sm border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[11px] font-semibold text-neutral-300">
              {filteredLogs.length} / {logs.length}
            </span>
          </div>
        </div>

        {/* Log Stream Body */}
        <div className="flex-1 space-y-1.5 overflow-y-auto p-4">
          {filteredLogs.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-neutral-500">
              <Clock size={24} strokeWidth={1.6} />
              <p className="mt-2 text-xs font-medium text-neutral-400">
                ยังไม่มีรายการบันทึกการทำงานที่ตรงกับเงื่อนไข
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const badge = LEVEL_BADGES[log.level] || LEVEL_BADGES.info;
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-2.5 rounded-sm border border-transparent px-2.5 py-1.5 text-xs transition hover:border-neutral-900 hover:bg-neutral-900/40"
                >
                  <span className="shrink-0 text-neutral-500">
                    [{log.timestamp}]
                  </span>
                  <span
                    className={`shrink-0 rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold ${badge.badgeClass}`}
                  >
                    {badge.label}
                  </span>
                  <span className="shrink-0 font-semibold text-neutral-400">
                    [{log.source}]
                  </span>
                  <span
                    className={`flex-1 break-words ${
                      log.level === "success"
                        ? "text-emerald-400"
                        : log.level === "error"
                          ? "text-red-400"
                          : log.level === "warn"
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
          <div ref={bottomAnchorRef} className="h-px w-full" />
        </div>
      </div>
    </div>
  );
};

export default ControlLoggerSection;
