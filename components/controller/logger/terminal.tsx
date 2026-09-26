"use client";

import { useEffect, useRef } from "react";
import {
  ScrollText,
  CheckCircle2,
  XCircle,
  Info,
  Send,
  MessageSquare,
  Heart,
  Cpu,
} from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import Empty from "@/components/ui/empty";
import {
  useControllerStore,
  type ControllerLogActionType,
  type ControllerLogStatusType,
} from "@/store/controllerStore";

const ACTION_CONFIG: Record<
  ControllerLogActionType,
  { label: string; icon: typeof Send }
> = {
  POST: { label: "โพสต์", icon: Send },
  COMMENT: { label: "คอมเมนต์", icon: MessageSquare },
  REACTION: { label: "ความรู้สึก", icon: Heart },
  SYSTEM: { label: "ระบบ", icon: Cpu },
};

const STATUS_CONFIG: Record<
  ControllerLogStatusType,
  {
    label: string;
    icon: typeof CheckCircle2;
    badgeClass: string;
  }
> = {
  SUCCESS: {
    label: "สำเร็จ",
    icon: CheckCircle2,
    badgeClass:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  FAILED: {
    label: "ล้มเหลว",
    icon: XCircle,
    badgeClass: "border-red-500/30 bg-red-500/10 text-red-400",
  },
  INFO: {
    label: "ระบบ",
    icon: Info,
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  },
};

const DEFAULT_LOG_FILTER = {
  search: "",
  accountId: "",
  status: "ALL" as const,
  autoScroll: true,
};

export default function TerminalLoggerController() {
  const {
    logs = [],
    accounts = [],
    logFilter = DEFAULT_LOG_FILTER,
    initRealtimeIfNeeded,
  } = useControllerStore();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    initRealtimeIfNeeded();
  }, [initRealtimeIfNeeded]);

  const runningCount = accounts.filter((a) => a.isRunning).length;

  const filteredLogs = logs.filter((item) => {
    if (logFilter.accountId && item.accountId !== logFilter.accountId) {
      return false;
    }
    if (logFilter.status !== "ALL" && item.status !== logFilter.status) {
      return false;
    }
    const q = logFilter.search.trim().toLowerCase();
    if (q) {
      const matchMsg = item.message.toLowerCase().includes(q);
      const matchAcc = item.accountName.toLowerCase().includes(q);
      const matchGrp = (item.groupName || "").toLowerCase().includes(q);
      return matchMsg || matchAcc || matchGrp;
    }
    return true;
  });

  useEffect(() => {
    if (logFilter.autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [filteredLogs.length, logFilter.autoScroll]);

  return (
    <FadeIn direction="up" delay={80} className="relative z-10">
      <div className="overflow-hidden rounded-md border border-neutral-800 bg-neutral-950">
        {/* Terminal Header */}
        <div className="flex flex-col gap-2 border-b border-neutral-900 bg-neutral-900/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`h-2 w-2 rounded-sm ${
                runningCount > 0
                  ? "animate-pulse bg-emerald-400"
                  : "bg-blue-500"
              }`}
            />
            <span className="text-xs font-semibold text-white">
              {runningCount > 0
                ? `กำลังบันทึกการทำงาน (${runningCount} บัญชีที่ทำงานอยู่)`
                : "พร้อมรับข้อมูลการทำงานแบบเรียลไทม์"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span>
              แสดงผล{" "}
              <strong className="font-semibold text-white">
                {filteredLogs.length}
              </strong>{" "}
              จาก {logs.length} รายการ
            </span>
          </div>
        </div>

        {/* Log Stream Container */}
        <div
          ref={scrollContainerRef}
          className="max-h-[520px] min-h-[380px] overflow-y-auto p-3"
        >
          {filteredLogs.length === 0 ? (
            <div className="flex h-[340px] items-center justify-center">
              <Empty
                icon={ScrollText}
                title="ไม่พบรายการบันทึกการทำงาน"
                description="เมื่อระบบเริ่มทำงาน รายการบันทึกจะแสดงขึ้นที่นี่แบบเรียลไทม์"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredLogs.map((log) => {
                const statusInfo = STATUS_CONFIG[log.status];
                const actionInfo = ACTION_CONFIG[log.action];
                const StatusIcon = statusInfo.icon;
                const ActionIcon = actionInfo.icon;

                return (
                  <div
                    key={log.id}
                    className="flex flex-col gap-2 rounded-sm border border-neutral-800/80 bg-neutral-900/30 px-3 py-2.5 transition hover:border-neutral-700 sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* Left: Time, Status, Account, Action & Message */}
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                      {/* Timestamp */}
                      <span className="shrink-0 rounded-sm border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-[11px] font-medium text-neutral-400">
                        {log.timestamp}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] font-semibold ${statusInfo.badgeClass}`}
                      >
                        <StatusIcon size={12} strokeWidth={1.8} />
                        <span>{statusInfo.label}</span>
                      </span>

                      {/* Account Badge */}
                      <span className="shrink-0 rounded-sm border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                        {log.accountName}
                      </span>

                      {/* Action Type Badge */}
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-[11px] text-blue-400">
                        <ActionIcon size={12} strokeWidth={1.8} />
                        <span>{actionInfo.label}</span>
                      </span>

                      {/* Group Name (if present) */}
                      {log.groupName && (
                        <span className="shrink-0 rounded-sm bg-neutral-800/70 px-2 py-0.5 text-[11px] text-neutral-300">
                          {log.groupName}
                        </span>
                      )}

                      {/* Log Message */}
                      <p className="min-w-0 flex-1 text-xs text-neutral-300">
                        {log.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}
