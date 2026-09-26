"use client";

import { useEffect } from "react";
import { FolderKanban, Settings2, Trash2 } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import ButtonUI from "@/components/ui/button";
import Toggle from "@/components/ui/toggle";
import Empty from "@/components/ui/empty";
import { useControllerStore } from "@/store/controllerStore";

interface CardGroupManageControllerProps {
  accountId: string;
}

export default function CardGroupManageController({
  accountId,
}: CardGroupManageControllerProps) {
  const {
    groupsByAccount,
    groupSearch,
    openEditGroupDialog,
    toggleGroupEnabled,
    deleteGroup,
    initRealtimeIfNeeded,
  } = useControllerStore();

  useEffect(() => {
    initRealtimeIfNeeded();
  }, [initRealtimeIfNeeded]);

  const groups = groupsByAccount[accountId] || [];
  const filteredGroups = groups.filter((group) => {
    const q = groupSearch.trim().toLowerCase();
    if (!q) return true;
    return group.name.toLowerCase().includes(q);
  });

  if (filteredGroups.length === 0) {
    return (
      <Empty
        icon={FolderKanban}
        title="ไม่พบรายการกลุ่ม"
        description="คุณสามารถกดปุ่ม เพิ่มกลุ่มใหม่ เพื่อสร้างหมวดหมู่กลุ่มสำหรับบัญชีนี้"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredGroups.map((group, index) => {
        const imageCount = Array.isArray(group.images)
          ? group.images.length
          : group.image
            ? 1
            : 0;
        const linkCount = group.links
          ? group.links
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean).length
          : 0;
        const isEnabled = group.enabled ?? true;

        return (
          <FadeIn key={group.id} direction="up" delay={index * 60}>
            <div className="flex flex-col justify-between space-y-3.5 rounded-md border border-neutral-800 bg-neutral-950 p-4 transition hover:border-neutral-700">
              {/* Group 1:1 Fixed Square Image, Details & Toggle */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3.5">
                  <div className="relative h-20 w-20 shrink-0 aspect-square overflow-hidden rounded-md border border-neutral-800 bg-neutral-900">
                    {group.image ? (
                      <img
                        src={group.image}
                        alt={group.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-500">
                        <FolderKanban size={24} strokeWidth={1.8} />
                      </div>
                    )}

                    {imageCount > 1 && (
                      <span className="absolute bottom-1 right-1 rounded-sm border border-neutral-800 bg-black/80 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
                        +{imageCount - 1}
                      </span>
                    )}
                  </div>

                  {/* Group Name & Info */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="truncate text-sm font-bold text-white">
                      {group.name}
                    </h3>

                    <span
                      className={`inline-block text-[11px] font-medium ${
                        isEnabled ? "text-blue-400" : "text-neutral-500"
                      }`}
                    >
                      {isEnabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </span>
                  </div>
                </div>

                {/* Group Enable/Disable Toggle */}
                <div className="shrink-0 pt-0.5">
                  <Toggle
                    size="sm"
                    checked={isEnabled}
                    onCheckedChange={(checked) =>
                      toggleGroupEnabled(accountId, group.id, checked)
                    }
                    aria-label="เปิด/ปิด กลุ่ม"
                  />
                </div>
              </div>

              {/* Action Buttons: Manage & Delete */}
              <div className="flex items-center gap-2 border-t border-neutral-900 pt-3">
                <ButtonUI
                  type="button"
                  onClick={() => openEditGroupDialog(group)}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 px-3 py-2 text-xs"
                >
                  <Settings2 size={14} strokeWidth={1.8} />
                  <span>จัดการ</span>
                </ButtonUI>

                <ButtonUI
                  type="button"
                  onClick={() => deleteGroup(accountId, group.id)}
                  title="ลบกลุ่ม"
                  className="h-9 w-9 shrink-0 cursor-pointer border border-neutral-800 bg-transparent p-0 text-neutral-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={15} strokeWidth={1.8} />
                </ButtonUI>
              </div>
            </div>
          </FadeIn>
        );
      })}
    </div>
  );
}
