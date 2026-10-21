"use client";

import { useEffect } from "react";
import { Eye, EyeOff, Unplug, Play, Square, User, Loader2 } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import { isValidImageUrl } from "@/lib/utils";
import { useControllerStore } from "@/store/controllerStore";

export default function ContainerController() {
  const {
    keyCode,
    isConnected,
    isProgramOnline,
    isReconnecting,
    isConnecting,
    isAuthChecking,
    showKey,
    stats,
    accounts,
    actionLoading,
    isAllActionLoading,
    isLoading,
    setShowKey,
    disconnectKey,
    initRealtimeIfNeeded,
    fetchOverviewData,
    startAccount,
    stopAccount,
    toggleAccountRunning,
    startAllAccounts,
    stopAllAccounts,
  } = useControllerStore();

  useEffect(() => {
    void initRealtimeIfNeeded();
    void fetchOverviewData();
  }, [initRealtimeIfNeeded, fetchOverviewData]);

  const isConnectingState = isConnecting || isAuthChecking || isReconnecting;
  const isConnectedState = isConnected && isProgramOnline;

  const connectionStatus = isConnectingState
    ? "connecting"
    : isConnectedState
      ? "connected"
      : "disconnected";

  const statusLabel =
    connectionStatus === "connected"
      ? "เชื่อมต่อสำเร็จ"
      : connectionStatus === "connecting"
        ? "กำลังเชื่อมต่อ..."
        : "ไม่สามารถเชื่อมต่อได้";

  const dotClass =
    connectionStatus === "connected"
      ? "bg-emerald-400"
      : connectionStatus === "connecting"
        ? "bg-amber-400 animate-pulse"
        : "bg-red-500";

  const statusClass =
    connectionStatus === "connected"
      ? "border-emerald-500/30 bg-emerald-500/10"
      : connectionStatus === "connecting"
        ? "border-amber-500/30 bg-amber-500/10"
        : "border-red-500/30 bg-red-500/10";

  const maskKey = (code: string) => {
    if (!code) return "ยังไม่ได้ระบุคีย์";
    if (showKey) return code;
    if (code.length <= 8) return "••••••••";
    return `${code.slice(0, 4)}••••••••${code.slice(-4)}`;
  };

  const runningCount = accounts.filter((acc) => acc.isRunning).length;
  const isAnyRunning = runningCount > 0;

  const statItems = [
    {
      id: "total",
      label: "ทั้งหมด",
      value: (stats.total || 0).toLocaleString("th-TH"),
      valueColor: "text-white",
    },
    {
      id: "success",
      label: "สำเร็จ",
      value: (stats.success || 0).toLocaleString("th-TH"),
      valueColor: "text-emerald-400",
    },
    {
      id: "failed",
      label: "ผิดพลาด",
      value: (stats.failed || 0).toLocaleString("th-TH"),
      valueColor: "text-red-400",
    },
    {
      id: "pending",
      label: "ติดอนุมัติ",
      value: (stats.pending || 0).toLocaleString("th-TH"),
      valueColor: "text-amber-400",
    },
  ];

  return (
    <FadeIn
      direction="up"
      delay={65}
      className="flex w-full shrink-0 flex-col divide-y divide-white/10 rounded-3xl border border-neutral-800 bg-neutral-900 xl:w-[380px] 2xl:w-[420px]"
    >
      {/* 1. Connection Status & Key Section */}
      <div className="space-y-3 p-4 sm:p-5">
        <h1 className="text-lg tracking-tight text-white border-b pb-3 text-center">
          ควบคุมการทำงาน
        </h1>
        <div className="flex items-center justify-between gap-3">
          <div className="group min-w-0">
            {keyCode && (
              <div className="mb-1.5 flex items-center gap-1.5 text-xs text-neutral-400 bg-neutral-950 rounded-full px-4 py-2">
                <span className="truncate font-mono text-neutral-300 blur-sm transition-all duration-200 group-hover:blur-none">
                  {keyCode}
                </span>
              </div>
            )}
          </div>

          <div
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-1.5 ${statusClass}`}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
            <span className="text-xs tracking-tight text-white">
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Full-width Disconnect Action */}
        {(keyCode || isConnected) && (
          <button
            type="button"
            onClick={disconnectKey}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs  text-red-400 transition hover:border-red-500/40 hover:bg-red-500/20 "
            title="ออกจากระบบ / ตัดการเชื่อมต่อคีย์"
          >
            <Unplug size={13} strokeWidth={1.8} />
            <span>ออกจากระบบ</span>
          </button>
        )}
      </div>

      {/* 2. Quick Control Section */}
      <div className="p-4 sm:p-5">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-2 pb-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm text-white">จัดการบัญชี</h4>
            <span className="rounded-full border border-neutral-800 bg-neutral-900 px-4 py-0.5 text-xs text-blue-400">
              {runningCount}/{accounts.length}
            </span>
          </div>

          {accounts.length > 1 && (
            <button
              type="button"
              disabled={isAllActionLoading}
              onClick={() =>
                isAnyRunning ? void stopAllAccounts() : void startAllAccounts()
              }
              className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2 py-1 text-2xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                isAnyRunning
                  ? " bg-red-700 text-white hover:bg-red-800"
                  : " bg-cyan-700 text-white hover:bg-cyan-800"
              }`}
            >
              {isAllActionLoading ? (
                <>
                  <Loader2 size={10} className="animate-spin" strokeWidth={1.8} />
                  <span>{isAnyRunning ? "กำลังหยุด..." : "กำลังเริ่ม..."}</span>
                </>
              ) : isAnyRunning ? (
                <>
                  <Square size={10} strokeWidth={1.8} />
                  <span>หยุดทั้งหมด</span>
                </>
              ) : (
                <>
                  <Play size={10} strokeWidth={1.8} />
                  <span>เริ่มทั้งหมด</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Account List */}
        {accounts.length > 0 ? (
          <div className="flex max-h-52 flex-col gap-2 overflow-y-auto pr-0.5">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between gap-2.5 rounded-2xl border border-neutral-800/90 bg-neutral-950 p-2.5 transition hover:border-neutral-700"
              >
                {/* Left: Avatar + Name & Status */}
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400">
                    {isValidImageUrl(acc.avatar) ? (
                      <img
                        src={acc.avatar!}
                        alt={acc.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={15} strokeWidth={1.8} />
                    )}
                    <span
                      className={`absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-sm border border-neutral-950 ${
                        acc.isRunning
                          ? "animate-pulse bg-emerald-400"
                          : "bg-neutral-600"
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-white">{acc.name}</p>
                    <p className="truncate text-2xs text-neutral-400">
                      {acc.isRunning
                        ? acc.currentTask || "กำลังรันงาน..."
                        : "พร้อมทำงาน"}
                    </p>
                  </div>
                </div>

                {/* Right: Toggle Start/Stop Button */}
                <button
                  type="button"
                  disabled={actionLoading[acc.id] || isAllActionLoading}
                  onClick={() =>
                    acc.isRunning
                      ? void stopAccount(acc.id)
                      : void startAccount(acc.id)
                  }
                  className={`inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-2xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    acc.isRunning
                      ? "border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      : "bg-cyan-700 text-white hover:bg-cyan-800"
                  }`}
                >
                  {actionLoading[acc.id] ? (
                    <>
                      <Loader2 size={11} className="animate-spin" strokeWidth={1.8} />
                      <span>{acc.isRunning ? "กำลังหยุด..." : "กำลังเริ่ม..."}</span>
                    </>
                  ) : acc.isRunning ? (
                    <>
                      <Square size={11} strokeWidth={1.8} />
                      <span>หยุดทำงาน</span>
                    </>
                  ) : (
                    <>
                      <Play size={11} strokeWidth={1.8} />
                      <span>เริ่มทำงาน</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-sm border border-dashed border-neutral-800/80 bg-neutral-900/20 px-3 py-4 text-center">
            <p className="text-xs text-neutral-500">
              {isConnected && isProgramOnline
                ? "ยังไม่มีบัญชีในระบบของตัวโปรแกรม"
                : "เชื่อมต่อคีย์เพื่อเริ่มควบคุมบัญชี"}
            </p>
          </div>
        )}
      </div>

      {/* 3. Stats Section (No Icons, Small Headings & Clean Numbers) */}
      
    </FadeIn>
  );
}
