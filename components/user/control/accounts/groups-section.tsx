"use client";

import { useEffect } from "react";
import {
  Plus,
  FolderOpen,
  Link as LinkIcon,
  MessageSquare,
  Heart,
  Pencil,
  Trash2,
  Shuffle,
} from "lucide-react";
import {
  useControlStore,
  type ControlGroupItem,
} from "@/store/controlStore";
import BackUI from "@/components/ui/back";
import ButtonUI from "@/components/ui/button";
import SearchUI from "@/components/ui/search";
import Empty from "@/components/ui/empty";
import Toggle from "@/components/ui/toggle";
import { toast } from "@/components/ui/toast";
import ControlGroupDialog from "./group-dialog";

interface ControlAccountGroupsSectionProps {
  accountId: string;
}

const cleanImgName = (raw: string) => {
  const parts = String(raw || "").split(/[\\/]/);
  return parts[parts.length - 1] || raw;
};

export const ControlAccountGroupsSection = ({
  accountId,
}: ControlAccountGroupsSectionProps) => {
  const {
    accounts,
    groupsByAccount,
    groupSearch,
    setGroupSearch,
    setEditingGroup,
    setIsGroupDialogOpen,
    deleteGroup,
    toggleGroupActive,
    sendRemoteCommand,
  } = useControlStore();

  const account = accounts.find((a) => a.id === accountId);
  const groups = groupsByAccount[accountId] || [];

  useEffect(() => {
    void sendRemoteCommand("SYNC_IMAGES", { accountId, userId: accountId });
  }, [accountId, sendRemoteCommand]);

  const filteredGroups = groups.filter((g) => {
    const q = groupSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      g.name.toLowerCase().includes(q) ||
      g.content.toLowerCase().includes(q)
    );
  });

  const handleOpenCreate = () => {
    setEditingGroup(null);
    setIsGroupDialogOpen(true);
  };

  const handleOpenEdit = (group: ControlGroupItem) => {
    setEditingGroup(group);
    setIsGroupDialogOpen(true);
  };

  const handleDeleteGroup = (group: ControlGroupItem) => {
    deleteGroup(accountId, group.id);
    toast.info("ลบหมวดหมู่กลุ่มแล้ว", `ลบหมวดหมู่ "${group.name}" เรียบร้อยแล้ว`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-md border border-neutral-800 bg-neutral-950 p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <BackUI
            href="/control/worker"
            text=""
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-white"
          />
          <div>
            <h2 className="text-base font-bold tracking-tight text-white">
              {account ? account.name : `บัญชี ID: ${accountId}`}
            </h2>
            <p className="mt-0.5 text-xs text-neutral-400">
              หมวดหมู่กลุ่มโพสต์ทั้งหมด {groups.length} หมวดหมู่
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SearchUI
            value={groupSearch}
            onChange={(e) => setGroupSearch(e.target.value)}
            placeholder="ค้นหาชื่อหมวดหมู่กลุ่ม..."
            className="h-9 rounded-sm bg-neutral-950"
          />

          <ButtonUI
            type="button"
            onClick={handleOpenCreate}
            className="cursor-pointer gap-1.5 rounded-sm bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500"
          >
            <Plus size={14} />
            <span>สร้างหมวดหมู่กลุ่ม</span>
          </ButtonUI>
        </div>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <Empty
          icon={FolderOpen}
          title="ยังไม่มีหมวดหมู่กลุ่มโพสต์ในบัญชีนี้"
          description="กดปุ่มสร้างหมวดหมู่กลุ่มเพื่อเพิ่มข้อความโพสต์ คอมเมนต์ และลิงก์กลุ่มเป้าหมาย"
          className="border-solid bg-neutral-950"
          action={
            <ButtonUI
              type="button"
              onClick={handleOpenCreate}
              className="cursor-pointer gap-1.5 rounded-sm bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
            >
              <Plus size={14} />
              <span>สร้างหมวดหมู่กลุ่มแรก</span>
            </ButtonUI>
          }
        />
      ) : filteredGroups.length === 0 ? (
        <Empty
          icon={FolderOpen}
          title={`ไม่พบหมวดหมู่กลุ่มที่ตรงกับคำค้นหา "${groupSearch}"`}
          description="ลองค้นหาด้วยชื่อหมวดหมู่หรือข้อความโพสต์อื่น"
          className="border-solid bg-neutral-950"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredGroups.map((group) => {
            const firstImageName =
              group.images && group.images.length > 0
                ? group.images[0]
                : undefined;
            const cleanFirst = firstImageName
              ? cleanImgName(firstImageName)
              : undefined;
            const firstPreview = firstImageName
              ? group.imagePreviews?.[firstImageName] ||
                (cleanFirst ? group.imagePreviews?.[cleanFirst] : undefined)
              : undefined;
            const totalImages = group.images?.length || 0;

            return (
              <div
                key={group.id}
                className={`flex flex-col justify-between rounded-md border bg-neutral-950 p-4 transition ${
                  group.isActive
                    ? "border-neutral-800 hover:border-neutral-700"
                    : "border-neutral-900 opacity-60"
                }`}
              >
                <div>
                  {/* Card Top: Left Thumbnail + Right Title & Badges */}
                  <div className="flex items-start gap-3.5">
                    {/* Left Thumbnail */}
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-800 bg-neutral-900">
                      {firstPreview ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={firstPreview}
                            alt={group.name}
                            className="h-full w-full object-cover"
                          />
                          {totalImages > 1 && (
                            <div className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded-sm bg-black/80 px-1 py-0.5 text-[9px] font-semibold text-white">
                              <span>+{totalImages}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 p-1 text-center text-neutral-500">
                          <FolderOpen size={16} className="text-neutral-600" />
                          <span className="text-[9px] font-medium text-neutral-500">
                            {totalImages > 0 ? `${totalImages} รูป` : "ไม่มีรูป"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right Info */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-bold tracking-tight text-white">
                            {group.name}
                          </h4>
                          <p className="mt-1 line-clamp-2 text-xs text-neutral-400">
                            {group.content || "ไม่มีข้อความโพสต์"}
                          </p>
                        </div>

                        <Toggle
                          size="sm"
                          checked={group.isActive}
                          onCheckedChange={() =>
                            toggleGroupActive(accountId, group.id)
                          }
                          activeText="เปิด"
                          inactiveText="ปิด"
                          className="shrink-0"
                        />
                      </div>

                      {/* Metadata Badges */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-sm border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[11px] text-blue-400">
                          <LinkIcon size={11} />
                          <span>{group.links.length} ลิงก์</span>
                        </span>

                        {totalImages > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-sm border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[11px] text-neutral-300">
                            <span>{totalImages} รูปภาพ</span>
                          </span>
                        )}

                        {group.comments && (
                          <span className="inline-flex items-center gap-1 rounded-sm border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[11px] text-neutral-300">
                            <MessageSquare size={11} />
                            <span>มีคอมเมนต์</span>
                          </span>
                        )}

                        {group.reaction && (
                          <span className="inline-flex items-center gap-1 rounded-sm border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[11px] text-blue-400">
                            <Heart size={11} />
                            <span>{group.reaction}</span>
                          </span>
                        )}

                        {(group.randomContent ||
                          group.randomImage ||
                          group.randomReaction) && (
                          <span className="inline-flex items-center gap-1 rounded-sm border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] text-blue-400">
                            <Shuffle size={11} />
                            <span>เปิดโหมดสุ่ม</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-neutral-900 pt-3">
                  <ButtonUI
                    type="button"
                    onClick={() => handleOpenEdit(group)}
                    className="cursor-pointer gap-1.5 rounded-sm border border-neutral-800 bg-transparent px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                  >
                    <Pencil size={12} />
                    <span>แก้ไข</span>
                  </ButtonUI>

                  <ButtonUI
                    type="button"
                    onClick={() => handleDeleteGroup(group)}
                    className="cursor-pointer gap-1.5 rounded-sm border border-neutral-800 bg-transparent px-3 py-1.5 text-xs font-medium text-neutral-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                    <span>ลบ</span>
                  </ButtonUI>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Group Dialog */}
      <ControlGroupDialog accountId={accountId} />
    </div>
  );
};

export default ControlAccountGroupsSection;
