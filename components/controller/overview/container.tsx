"use client";

import { useEffect } from "react";
import {
  Eye,
  EyeOff,
  Unplug,
  Play,
  Square,
  User,
} from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import { useControllerStore } from "@/store/controllerStore";

export default function ContainerController() {
  const {
    keyCode,
    isConnected,
    isProgramOnline,
    isReconnecting,
    showKey,
    stats,
    accounts,
    isLoading,
    setShowKey,
    disconnectKey,
    initRealtimeIfNeeded,
    fetchOverviewData,
    toggleAccountRunning,
    startAllAccounts,
    stopAllAccounts,
  } = useControllerStore();

  useEffect(() => {
    void initRealtimeIfNeeded();
    void fetchOverviewData();
  }, [initRealtimeIfNeeded, fetchOverviewData]);

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
      className="flex w-full shrink-0 flex-col divide-y divide-white/10 rounded-md border border-neutral-800 bg-neutral-950 xl:w-[380px] 2xl:w-[420px]"
    >
      {/* 1. Key Status Section */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-neutral-400">
              License Key
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="truncate text-sm font-bold tracking-tight text-white">
                {maskKey(keyCode)}
              </span>
              {keyCode && (
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="cursor-pointer text-neutral-500 transition hover:text-white"
                  title={showKey ? "ซ่อนคีย์" : "แสดงคีย์"}
                >
                  {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              )}
            </div>
            
          </div>

          {/* Right: Disconnect Action */}
          {(keyCode || isConnected) && (
            <button
              type="button"
              onClick={disconnectKey}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-sm border border-neutral-800 bg-neutral-900/60 px-2.5 py-1.5 text-xs font-medium text-neutral-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
              title="ออกจากระบบ / ตัดการเชื่อมต่อคีย์"
            >
              <Unplug size={13} />
              <span>ออกจากระบบ</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Quick Control Section */}
      <div className="p-4 sm:p-5">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-2 pb-3">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-white">
              ควบคุมบัญชีด่วน
            </h4>
            <span className="rounded-sm border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
              {runningCount}/{accounts.length}
            </span>
          </div>

          {accounts.length > 1 && (
            <button
              type="button"
              onClick={() =>
                isAnyRunning ? void stopAllAccounts() : void startAllAccounts()
              }
              className={`inline-flex cursor-pointer items-center gap-1 rounded-sm border px-2 py-1 text-[11px] font-medium transition ${
                isAnyRunning
                  ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  : "border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
              }`}
            >
              {isAnyRunning ? (
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
                className="flex items-center justify-between gap-2.5 rounded-sm border border-neutral-800/90 bg-neutral-900/40 p-2.5 transition hover:border-neutral-700"
              >
                {/* Left: Avatar + Name & Status */}
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900 text-neutral-400">
                    {acc.avatar ? (
                      <img
                        src={acc.avatar}
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
                    <p className="truncate text-xs font-semibold text-white">
                      {acc.name}
                    </p>
                    <p className="truncate text-[10px] text-neutral-400">
                      {acc.isRunning
                        ? acc.currentTask || "กำลังรันงาน..."
                        : "พร้อมทำงาน"}
                    </p>
                  </div>
                </div>

                {/* Right: Toggle Start/Stop Button */}
                <button
                  type="button"
                  onClick={() => void toggleAccountRunning(acc.id)}
                  className={`inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-sm px-2.5 py-1 text-[11px] font-medium transition ${
                    acc.isRunning
                      ? "border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      : "bg-blue-600 text-white hover:bg-blue-500"
                  }`}
                >
                  {acc.isRunning ? (
                    <>
                      <Square size={11} strokeWidth={1.8} />
                      <span>หยุด</span>
                    </>
                  ) : (
                    <>
                      <Play size={11} strokeWidth={1.8} />
                      <span>เริ่ม</span>
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
      <div className="p-4 sm:p-5">
        <h4 className="mb-3 text-xs font-semibold text-white">
          สถิติการทำงาน
        </h4>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-sm border border-neutral-800 bg-neutral-900/50"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {statItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-center rounded-sm border border-neutral-800/80 bg-neutral-900/40 p-2.5 transition hover:border-neutral-700"
              >
                <span className="text-[11px] font-medium text-neutral-400">
                  {item.label}
                </span>
                <span
                  className={`mt-0.5 truncate text-base font-bold tracking-tight sm:text-lg ${item.valueColor}`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </FadeIn>
  );
}
