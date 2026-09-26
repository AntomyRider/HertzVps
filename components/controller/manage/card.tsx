"use client";

import { useEffect } from "react";
import Image from "next/image";
import {
  User,
  Play,
  Square,
  RotateCcw,
  Trash2,
  FolderCog,
} from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import ButtonUI from "@/components/ui/button";
import Empty from "@/components/ui/empty";
import { useControllerStore } from "@/store/controllerStore";
import TaskManageController from "./task";
import StatsAccManageController from "./stats-acc";

export default function CardManageController() {
  const {
    accounts,
    accountSearch,
    isConnected,
    isProgramOnline,
    toggleAccountRunning,
    resetAccountStats,
    deleteAccount,
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredAccounts.map((acc, index) => (
        <FadeIn key={acc.id} direction="up" delay={index * 60}>
          <div className="flex flex-col justify-between space-y-4 rounded-md border border-neutral-800 bg-neutral-950 p-4 transition hover:border-neutral-700">
            {/* Top: Avatar, Name, ID & Status Badge */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {acc.avatar ? (
                  <Image
                    src={acc.avatar}
                    alt={acc.name}
                    width={42}
                    height={42}
                    className="h-10.5 w-10.5 shrink-0 rounded-md border border-neutral-800 object-cover"
                  />
                ) : (
                  <div className="flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-md border border-neutral-800 bg-blue-500/10 text-blue-400">
                    <User size={20} strokeWidth={1.8} />
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-white">
                    {acc.name}
                  </h3>
                  <p className="truncate text-xs text-neutral-500">
                    ID: {acc.fbId}
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-2.5 py-0.5 text-xs font-semibold ${
                  acc.isRunning
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-neutral-800 bg-neutral-900 text-neutral-400"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-sm ${
                    acc.isRunning ? "bg-emerald-400" : "bg-neutral-500"
                  }`}
                />
                {acc.isRunning ? "กำลังทำงาน" : "พร้อมทำงาน"}
              </span>
            </div>

            {/* Middle 1: Task & Groups */}
            <TaskManageController
              currentTask={acc.currentTask}
              groupName={acc.groupName}
              groupCurrent={acc.groupCurrent}
              groupTotal={acc.groupTotal}
              isRunning={acc.isRunning}
            />

            {/* Middle 2: 6 Account Stats Boxes (3 per row) */}
            <StatsAccManageController stats={acc.stats} />

            {/* Bottom: Account Controls using ButtonUI */}
            <div className="flex items-center justify-between gap-2 border-t border-neutral-900 pt-3">
              <ButtonUI
                type="button"
                onClick={() => toggleAccountRunning(acc.id)}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 px-3 py-2 text-xs ${
                  acc.isRunning
                    ? "border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    : "bg-blue-600 text-white hover:bg-blue-500"
                }`}
              >
                {acc.isRunning ? (
                  <>
                    <Square size={14} strokeWidth={1.8} />
                    <span>หยุดทำงาน</span>
                  </>
                ) : (
                  <>
                    <Play size={14} strokeWidth={1.8} />
                    <span>เริ่มทำงาน</span>
                  </>
                )}
              </ButtonUI>

              <div className="flex items-center gap-1.5">
                <ButtonUI
                  href={`/controller/manage/${acc.id}`}
                  type="button"
                  title="ตั้งค่ากลุ่ม"
                  className="h-8 w-8 cursor-pointer border border-neutral-800 bg-transparent p-0 text-neutral-400 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                >
                  <FolderCog size={15} strokeWidth={1.8} />
                </ButtonUI>

                <ButtonUI
                  type="button"
                  onClick={() => resetAccountStats(acc.id)}
                  title="รีเซ็ตสถิติ"
                  className="h-8 w-8 cursor-pointer border border-neutral-800 bg-transparent p-0 text-neutral-400 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                >
                  <RotateCcw size={15} strokeWidth={1.8} />
                </ButtonUI>

                <ButtonUI
                  type="button"
                  onClick={() => deleteAccount(acc.id)}
                  title="ลบบัญชี"
                  className="h-8 w-8 cursor-pointer border border-neutral-800 bg-transparent p-0 text-neutral-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={15} strokeWidth={1.8} />
                </ButtonUI>
              </div>
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
