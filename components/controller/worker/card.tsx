"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Zap, Square, Loader2 } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import ButtonUI from "@/components/ui/button";
import Empty from "@/components/ui/empty";
import { isValidImageUrl } from "@/lib/utils";
import { useControllerStore } from "@/store/controllerStore";
import TaskWorkerController from "./task";
import StatsAccWorkerController from "./stats-acc";

export default function CardWorkerController() {
  const {
    accounts,
    accountSearch,
    isConnected,
    isProgramOnline,
    actionLoading,
    isAllActionLoading,
    startAccount,
    stopAccount,
    toggleAccountRunning,
    initRealtimeIfNeeded,
  } = useControllerStore();

  useEffect(() => {
    initRealtimeIfNeeded();
  }, [initRealtimeIfNeeded]);

  const filteredAccounts = accounts.filter((acc) => {
    const q = accountSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      acc.name.toLowerCase().includes(q) ||
      acc.fbId.toLowerCase().includes(q) ||
      acc.id.toLowerCase().includes(q)
    );
  });

  if (filteredAccounts.length === 0) {
    return (
      <Empty
        icon={User}
        title={
          !isConnected
            ? "ยังไม่ได้เชื่อมต่อคีย์ใช้งาน"
            : !isProgramOnline
              ? "รอตัวโปรแกรมเชื่อมต่อและส่งข้อมูลบัญชี"
              : "ไม่พบบัญชีในระบบ"
        }
        description={
          !isConnected
            ? "กรุณาเชื่อมต่อคีย์ที่หน้าภาพรวมก่อนเพื่อรับข้อมูลจากตัวโปรแกรม"
            : !isProgramOnline
              ? "เมื่อเปิดโปรแกรมและเชื่อมต่อคีย์ ข้อมูลบัญชีทั้งหมดจะแสดงขึ้นแบบเรียลไทม์"
              : "ลองค้นหาด้วยชื่อหรือรหัส ID อื่น"
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredAccounts.map((acc, index) => (
        <FadeIn key={acc.id} direction="up" delay={index * 60}>
          <div className="group relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-3.5 select-none transition-all duration-200 hover:border-neutral-700">
            {/* Top highlight specular edge */}
            <div className="pointer-events-none absolute inset-x-3 top-0 z-10 h-px bg-white/10" />

            {/* Ambient soft glow */}
            <div
              className={`pointer-events-none absolute -left-10 -top-10 h-24 w-24 rounded-full blur-2xl transition-all duration-300 ${
                acc.isRunning
                  ? "bg-blue-500/[0.12]"
                  : "bg-white/[0.02] group-hover:bg-white/[0.04]"
              }`}
            />

            {/* Account Profile + Start/Stop Button on the same row */}
            <div className="relative z-10 flex min-w-0 items-center justify-between gap-3 pl-1">
              {/* Avatar + Info */}
              <div className="flex min-w-0 items-center gap-3">
                <Link
                  href="/controller/manage"
                  title="คลิกเพื่อจัดการกลุ่มเป้าหมาย"
                  className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-neutral-950 transition-all ${
                    acc.isRunning
                      ? "border-blue-400/60 ring-2 ring-blue-500/25"
                      : "border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  {isValidImageUrl(acc.avatar) ? (
                    <Image
                      src={acc.avatar!}
                      alt={acc.name}
                      width={44}
                      height={44}
                      unoptimized={acc.avatar!.startsWith("http")}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-neutral-400" />
                  )}
                </Link>

                <div className="min-w-0">
                  <Link
                    href="/controller/manage"
                    title={`คลิกเพื่อจัดการกลุ่ม: ${acc.name}`}
                    className="block truncate text-sm font-medium tracking-tight text-white transition hover:text-blue-400"
                  >
                    {acc.name}
                  </Link>

                  <p className="mt-0.5 truncate font-mono text-xs text-neutral-400">
                    ID: {acc.fbId || acc.id}
                  </p>
                </div>
              </div>

              {/* Start / Stop Button using ButtonUI */}
              <div className="relative z-20 shrink-0">
                <ButtonUI
                  type="button"
                  disabled={actionLoading[acc.id] || isAllActionLoading}
                  onClick={() =>
                    acc.isRunning
                      ? void stopAccount(acc.id)
                      : void startAccount(acc.id)
                  }
                  title={
                    actionLoading[acc.id]
                      ? acc.isRunning
                        ? `กำลังสั่งหยุด ${acc.name}...`
                        : `กำลังสั่งเริ่ม ${acc.name}...`
                      : acc.isRunning
                      ? `หยุดการทำงานของ ${acc.name}`
                      : `เริ่มการทำงานของ ${acc.name}`
                  }
                  className={`cursor-pointer gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    acc.isRunning
                      ? "border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      : "bg-blue-600 text-white hover:bg-blue-500"
                  }`}
                >
                  {actionLoading[acc.id] ? (
                    <>
                      <Loader2 size={12} className="animate-spin shrink-0" />
                      <span>{acc.isRunning ? "กำลังหยุด..." : "กำลังเริ่ม..."}</span>
                    </>
                  ) : acc.isRunning ? (
                    <>
                      <Square size={12} className="fill-current" />
                      <span>หยุดทำงาน</span>
                    </>
                  ) : (
                    <>
                      <Zap size={13} />
                      <span>เริ่มทำงาน</span>
                    </>
                  )}
                </ButtonUI>
              </div>
            </div>

            {/* Current Task & Groups */}
            <div className="relative z-10 mt-3.5 border-t border-neutral-800/80 pt-3">
              <TaskWorkerController
                currentTask={acc.currentTask}
                groupName={acc.groupName}
                groupCurrent={acc.groupCurrent}
                groupTotal={acc.groupTotal}
                isRunning={acc.isRunning}
                taskTimer={acc.taskTimer}
              />
            </div>

            {/* Stats */}
            <div className="relative z-10 mt-3 border-t border-neutral-800/80 pt-3">
              <StatsAccWorkerController stats={acc.stats} />
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
