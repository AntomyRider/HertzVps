"use client";

import { Play, Square } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import ButtonUI from "@/components/ui/button";
import SearchUI from "@/components/ui/search";
import { useControllerStore } from "@/store/controllerStore";

export default function ToolsManageController() {
  const {
    accountSearch,
    setAccountSearch,
    startAllAccounts,
    stopAllAccounts,
  } = useControllerStore();

  return (
    <FadeIn
      direction="up"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Search Input using SearchUI */}
      <SearchUI
        value={accountSearch}
        onChange={(e) => setAccountSearch(e.target.value)}
        placeholder="ค้นหาชื่อบัญชี หรือ ID..."
      />

      {/* Action Buttons using ButtonUI */}
      <div className="flex items-center gap-2">
        <ButtonUI
          type="button"
          onClick={startAllAccounts}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 px-4 py-2 text-xs sm:flex-initial"
        >
          <Play size={15} strokeWidth={1.8} />
          <span>เริ่มทำงานทั้งหมด</span>
        </ButtonUI>

        <ButtonUI
          type="button"
          onClick={stopAllAccounts}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs text-red-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 sm:flex-initial"
        >
          <Square size={15} strokeWidth={1.8} />
          <span>หยุดการทำงาน</span>
        </ButtonUI>
      </div>
    </FadeIn>
  );
}
