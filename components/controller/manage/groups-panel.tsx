"use client";

import React, { useState, useMemo } from "react";
import {
  FolderKanban,
  Plus,
  Trash2,
  Wrench,
  ArrowLeft,
  Copy,
} from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import ButtonUI from "@/components/ui/button";
import SearchUI from "@/components/ui/search";
import Toggle from "@/components/ui/toggle";
import Empty from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import {
  useControllerStore,
  type ControllerAccountItem,
  type ControllerGroupItem,
} from "@/store/controllerStore";
import DialogGroupManageController from "./groups/dialog";
import ToolsDialog from "./groups/dialog-tools";
import CopyGroupDialog from "./groups/dialog-tools/copy-dialog";
import ScanJoinedDialog from "./groups/dialog-tools/scan-joined-dialog";
import PendingGroupsDialog from "./groups/dialog-tools/pending-groups";
import SearchJoinDialog from "./groups/dialog-tools/search-join-dialog";
import FanpageDialog from "./groups/dialog-tools/fanpage-dialog";

interface GroupsPanelProps {
  selectedAccount: ControllerAccountItem | null;
  onBack?: () => void;
  className?: string;
}

type GroupFilterStatus = "all" | "active" | "inactive";

export default function GroupsPanel({
  selectedAccount,
  onBack,
  className,
}: GroupsPanelProps) {
  const {
    groupsByAccount,
    groupSearch,
    setGroupSearch,
    openCreateGroupDialog,
    openEditGroupDialog,
    toggleGroupEnabled,
    deleteGroup,
    deleteAllGroups,
  } = useControllerStore();

  const [statusFilter, setStatusFilter] = useState<GroupFilterStatus>("all");
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isPendingOpen, setIsPendingOpen] = useState(false);
  const [isScanJoinedOpen, setIsScanJoinedOpen] = useState(false);
  const [isCopyOpen, setIsCopyOpen] = useState(false);
  const [isSearchJoinOpen, setIsSearchJoinOpen] = useState(false);
  const [isFanpageOpen, setIsFanpageOpen] = useState(false);
  const [copyTargetGroupName, setCopyTargetGroupName] = useState<string | undefined>(undefined);

  const handleSelectTool = (toolId: string) => {
    setIsToolsOpen(false);
    if (toolId === "batch-copy-groups") {
      setCopyTargetGroupName(undefined);
      setIsCopyOpen(true);
    } else if (toolId === "scan-joined-groups") {
      setIsScanJoinedOpen(true);
    } else if (toolId === "delete-pending-groups") {
      setIsPendingOpen(true);
    } else if (toolId === "search-join-groups") {
      setIsSearchJoinOpen(true);
    } else if (toolId === "import-fanpage") {
      setIsFanpageOpen(true);
    }
  };

  const handleBackToTools = () => {
    setIsPendingOpen(false);
    setIsScanJoinedOpen(false);
    setIsCopyOpen(false);
    setIsSearchJoinOpen(false);
    setIsFanpageOpen(false);
    setIsToolsOpen(true);
  };

  const accountId = selectedAccount?.id || "";
  const allGroups: ControllerGroupItem[] = useMemo(() => {
    return accountId ? groupsByAccount[accountId] || [] : [];
  }, [groupsByAccount, accountId]);

  // นับจำนวนกลุ่มตามสถานะ
  const counts = useMemo(() => {
    let active = 0;
    let inactive = 0;
    for (const g of allGroups) {
      if (g.enabled !== false) {
        active++;
      } else {
        inactive++;
      }
    }
    return {
      all: allGroups.length,
      active,
      inactive,
    };
  }, [allGroups]);

  // กรองกลุ่มตาม status filter และ search query
  const filteredGroups = useMemo(() => {
    return allGroups.filter((group) => {
      // 1. กรองสถานะ
      const isEnabled = group.enabled !== false;
      if (statusFilter === "active" && !isEnabled) return false;
      if (statusFilter === "inactive" && isEnabled) return false;

      // 2. กรองคำค้นหา
      const q = groupSearch.trim().toLowerCase();
      if (!q) return true;
      return group.name.toLowerCase().includes(q);
    });
  }, [allGroups, statusFilter, groupSearch]);

  if (!selectedAccount) {
    return (
      <div
        className={cn(
          "flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950 p-6",
          className
        )}
      >
        <Empty
          icon={FolderKanban}
          title="ยังไม่ได้เลือกบัญชี"
          description="กรุณาเลือกบัญชีผู้ใช้จากรายการทางด้านซ้ายเพื่อดูและจัดการกลุ่มเป้าหมาย"
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col min-h-0 h-full space-y-4", className)}>
      {/* Filter & Tools Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Mobile Back Button + Status Filter Buttons */}
        <div className="flex items-center gap-2">
          {onBack && (
            <ButtonUI
              type="button"
              onClick={onBack}
              title="กลับไปหน้ารายชื่อบัญชี"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 p-0 text-neutral-400 hover:border-neutral-700 hover:text-white md:hidden cursor-pointer"
            >
              <ArrowLeft size={16} />
            </ButtonUI>
          )}

          <div className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950 p-1">
            <ButtonUI
              type="button"
              variant="ghost"
              onClick={() => setStatusFilter("all")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors",
                statusFilter === "all"
                  ? "!bg-blue-600 text-white font-medium"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              <span>กลุ่มทั้งหมด</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px]",
                  statusFilter === "all"
                    ? "bg-blue-700 text-blue-100"
                    : "bg-neutral-800 text-neutral-400"
                )}
              >
                {counts.all}
              </span>
            </ButtonUI>

            <ButtonUI
              type="button"
              variant="ghost"
              onClick={() => setStatusFilter("active")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors",
                statusFilter === "active"
                  ? "!bg-emerald-600 text-white font-medium"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              <span>เปิดใช้งาน</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px]",
                  statusFilter === "active"
                    ? "bg-emerald-700 text-emerald-100"
                    : "bg-neutral-800 text-neutral-400"
                )}
              >
                {counts.active}
              </span>
            </ButtonUI>

            <ButtonUI
              type="button"
              variant="ghost"
              onClick={() => setStatusFilter("inactive")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors",
                statusFilter === "inactive"
                  ? "!bg-neutral-800 text-white font-medium"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              <span>ปิดใช้งาน</span>
              <span className="rounded-full bg-neutral-800 px-1.5 py-0.2 text-[10px] text-neutral-400">
                {counts.inactive}
              </span>
            </ButtonUI>
          </div>
        </div>

        {/* Right: Search & Action Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchUI
            value={groupSearch}
            onChange={(e) => setGroupSearch(e.target.value)}
            placeholder="ค้นหาชื่อกลุ่ม..."
            className="w-full sm:w-[220px]"
          />

          <div className="flex items-center gap-2">
            <ButtonUI
              type="button"
              variant="secondary"
              onClick={() => setIsToolsOpen(true)}
              className="flex flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 hover:border-neutral-700 hover:bg-neutral-850 hover:text-white transition-colors"
            >
              <Wrench size={13} />
              <span>เครื่องมือ</span>
            </ButtonUI>

            <ButtonUI
              type="button"
              onClick={openCreateGroupDialog}
              className="flex flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-xs rounded-lg transition-colors"
            >
              <Plus size={14} />
              <span>เพิ่มกลุ่มใหม่</span>
            </ButtonUI>

            <ButtonUI
              type="button"
              onClick={() => deleteAllGroups(accountId)}
              disabled={allGroups.length === 0}
              title="ลบกลุ่มทั้งหมดของบัญชีนี้"
              className="flex flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs rounded-lg disabled:opacity-40 transition-colors"
            >
              <Trash2 size={13} />
              <span>ลบทั้งหมด</span>
            </ButtonUI>
          </div>
        </div>
      </div>

      {/* Groups List Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {filteredGroups.length === 0 ? (
          <div className="flex h-56 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
            <Empty
              icon={FolderKanban}
              title="ไม่พบรายการกลุ่ม"
              description={
                groupSearch
                  ? `ไม่พบกลุ่มที่ตรงกับ "${groupSearch}"`
                  : allGroups.length === 0
                  ? "กดปุ่ม เพิ่มกลุ่มใหม่ ด้านบนเพื่อเริ่มกำหนดกลุ่มเป้าหมายสำหรับบัญชีนี้"
                  : "ไม่พบกลุ่มตามเงื่อนไขตัวกรองที่เลือก"
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {filteredGroups.map((group, index) => {
              const imageCount = Array.isArray(group.images)
                ? group.images.length
                : group.image
                ? 1
                : 0;
              const linkCount = group.links
                ? group.links
                    .split("\n")
                    .map((l) => l.trim())
                    .filter(Boolean).length
                : 0;
              const isEnabled = group.enabled ?? true;

              return (
                <FadeIn key={group.id} direction="up" delay={index * 40}>
                  <div className="flex flex-col justify-between space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3.5 transition hover:border-neutral-700">
                    {/* Header: Thumbnail + Name + Toggle */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {/* Square Thumbnail 1:1 */}
                        <div className="relative h-14 w-14 shrink-0 aspect-square overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
                          {group.image ? (
                            <img
                              src={group.image}
                              alt={group.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-500">
                              <FolderKanban size={20} strokeWidth={1.8} />
                            </div>
                          )}

                          {imageCount > 1 && (
                            <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.2 text-[9px] text-blue-400">
                              +{imageCount - 1}
                            </span>
                          )}
                        </div>

                        {/* Name & Details */}
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h4
                            className="truncate text-xs font-medium text-white"
                            title={group.name}
                          >
                            {group.name}
                          </h4>

                          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                            <span>{linkCount} ลิงก์</span>
                            <span>•</span>
                            <span>{imageCount} รูป</span>
                          </div>

                          <span
                            className={cn(
                              "inline-block text-[10px]",
                              isEnabled ? "text-emerald-400" : "text-neutral-500"
                            )}
                          >
                            {isEnabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                          </span>
                        </div>
                      </div>

                      {/* Enable / Disable Toggle */}
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

                    {/* Actions Bar */}
                    <div className="flex items-center gap-2 border-t border-neutral-900 pt-2.5">
                      <ButtonUI
                        type="button"
                        onClick={() => openEditGroupDialog(group)}
                        className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-300 hover:border-neutral-700 hover:bg-neutral-850 hover:text-white transition-colors"
                      >
                        <Wrench size={13} />
                        <span>แก้ไขข้อมูล</span>
                      </ButtonUI>

                      <ButtonUI
                        type="button"
                        onClick={() => {
                          setCopyTargetGroupName(group.name);
                          setIsCopyOpen(true);
                        }}
                        title="คัดลอกกลุ่มนี้"
                        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 p-0 transition-colors"
                      >
                        <Copy size={13} />
                      </ButtonUI>

                      <ButtonUI
                        type="button"
                        onClick={() => deleteGroup(accountId, group.id)}
                        title="ลบกลุ่ม"
                        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700 p-0 transition-colors"
                      >
                        <Trash2 size={13} />
                      </ButtonUI>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit / Create Group Dialog */}
      <DialogGroupManageController accountId={accountId} />

      {/* Master Tools Dialog */}
      <ToolsDialog
        isOpen={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
        accountId={accountId}
        onSelectTool={handleSelectTool}
      />

      {/* Copy Group Dialog */}
      <CopyGroupDialog
        isOpen={isCopyOpen}
        onClose={() => setIsCopyOpen(false)}
        onBack={handleBackToTools}
        currentAccountId={accountId}
        groupName={copyTargetGroupName}
      />

      {/* Scan Joined Groups Dialog */}
      <ScanJoinedDialog
        isOpen={isScanJoinedOpen}
        onClose={() => setIsScanJoinedOpen(false)}
        onBack={handleBackToTools}
        accountId={accountId}
      />

      {/* Delete Pending Groups Dialog */}
      <PendingGroupsDialog
        isOpen={isPendingOpen}
        onClose={() => setIsPendingOpen(false)}
        onBack={handleBackToTools}
        accountId={accountId}
      />

      {/* Search & Join Groups Dialog */}
      <SearchJoinDialog
        isOpen={isSearchJoinOpen}
        onClose={() => setIsSearchJoinOpen(false)}
        onBack={handleBackToTools}
        accountId={accountId}
      />

      {/* Fanpage Dialog */}
      <FanpageDialog
        isOpen={isFanpageOpen}
        onClose={() => setIsFanpageOpen(false)}
        onBack={handleBackToTools}
        accountId={accountId}
      />
    </div>
  );
}
