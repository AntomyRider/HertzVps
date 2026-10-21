"use client";

import React from "react";
import { Play, Square, Loader2 } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import ButtonUI from "@/components/ui/button";
import SearchUI from "@/components/ui/search";
import { useControllerStore } from "@/store/controllerStore";
import { cn } from "@/lib/utils";

export default function ToolsWorkerController() {
  const {
    accounts = [],
    accountSearch,
    isAllActionLoading,
    setAccountSearch,
    startAllAccounts,
    stopAllAccounts,
  } = useControllerStore();

  const isAnyRunning = accounts.some((acc) => acc.isRunning);

  const handleToggleAll = () => {
    if (isAnyRunning) {
      void stopAllAccounts();
    } else {
      void startAllAccounts();
    }
  };

  return (
    <FadeIn
      direction="up"
      className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Search Input using SearchUI */}
      <SearchUI
        value={accountSearch}
        onChange={(e) => setAccountSearch(e.target.value)}
        placeholder="ค้นหาชื่อบัญชี หรือ ID..."
        className="w-full sm:w-[280px]"
      />

      {/* Unified Single Action Button with dynamic state toggle */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <ButtonUI
          type="button"
          onClick={handleToggleAll}
          disabled={accounts.length === 0 || isAllActionLoading}
          title={
            accounts.length === 0
              ? "ไม่มีบัญชีในระบบ"
              : isAllActionLoading
              ? isAnyRunning
                ? "กำลังสั่งหยุดทุกบัญชี..."
                : "กำลังสั่งเริ่มทุกบัญชี..."
              : isAnyRunning
              ? "สั่งหยุดการทำงานของทุกบัญชี"
              : "สั่งเริ่มการทำงานของทุกบัญชี"
          }
          className={cn(
            "flex flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs transition-colors",
            isAnyRunning
              ? "border border-red-500/40 bg-red-500/10 text-red-400 hover:border-red-500/60 hover:bg-red-500/20 hover:text-red-300"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          )}
        >
          {isAllActionLoading ? (
            <>
              <Loader2 size={13} className="animate-spin shrink-0" />
              <span>{isAnyRunning ? "กำลังหยุดทั้งหมด..." : "กำลังเริ่มทั้งหมด..."}</span>
            </>
          ) : isAnyRunning ? (
            <>
              <Square size={13} className="fill-current shrink-0" />
              <span>หยุดการทำงานทั้งหมด</span>
            </>
          ) : (
            <>
              <Play size={13} className="fill-current shrink-0" />
              <span>เริ่มทำงานทั้งหมด</span>
            </>
          )}
        </ButtonUI>
      </div>
    </FadeIn>
  );
}
