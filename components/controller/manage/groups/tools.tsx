"use client";

import { Plus, Trash2 } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import ButtonUI from "@/components/ui/button";
import SearchUI from "@/components/ui/search";
import { useControllerStore } from "@/store/controllerStore";

interface ToolsGroupManageControllerProps {
  accountId: string;
}

export default function ToolsGroupManageController({
  accountId,
}: ToolsGroupManageControllerProps) {
  const {
    groupSearch,
    setGroupSearch,
    openCreateGroupDialog,
    deleteAllGroups,
  } = useControllerStore();

  return (
    <FadeIn
      direction="up"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Search Input using SearchUI */}
      <SearchUI
        value={groupSearch}
        onChange={(e) => setGroupSearch(e.target.value)}
        placeholder="ค้นหาชื่อกลุ่ม..."
      />

      {/* Action Buttons: Add New Group & Delete All Groups */}
      <div className="flex items-center gap-2">
        <ButtonUI
          type="button"
          onClick={openCreateGroupDialog}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 px-4 py-2 text-xs sm:flex-initial"
        >
          <Plus size={15} strokeWidth={1.8} />
          <span>เพิ่มกลุ่มใหม่</span>
        </ButtonUI>

        <ButtonUI
          type="button"
          onClick={() => deleteAllGroups(accountId)}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs text-red-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 sm:flex-initial"
        >
          <Trash2 size={15} strokeWidth={1.8} />
          <span>ลบกลุ่มทั้งหมด</span>
        </ButtonUI>
      </div>
    </FadeIn>
  );
}
