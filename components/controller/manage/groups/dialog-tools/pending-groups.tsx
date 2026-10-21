"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  ClockAlert,
  Trash2,
  Play,
  Check,
  Search,
  Loader2,
  Folder,
  Link as LinkIcon,
  StopCircle,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import ButtonUI from "@/components/ui/button";
import Input from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useControllerStore } from "@/store/controllerStore";

export interface PendingGroupsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  accountId?: string;
}

export default function PendingGroupsDialog({
  isOpen,
  onClose,
  onBack,
  accountId,
}: PendingGroupsDialogProps) {
  const { groupsByAccount, sendToolCommand } = useControllerStore();

  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  const lastToolEvent = useControllerStore((state) => state.lastToolEvent);

  useEffect(() => {
    if (!lastToolEvent || !isOpen) return;
    if (lastToolEvent.userId && accountId && String(lastToolEvent.userId) !== String(accountId)) return;
    if (lastToolEvent.tool !== "DELETE_PENDING_POSTS") return;

    if (lastToolEvent.type === "status" || lastToolEvent.type === "progress") {
      if (typeof lastToolEvent.message === "string") {
        setStatusText(lastToolEvent.message);
        setLogs((prev) => [...prev, lastToolEvent.message as string]);
      }
    } else if (lastToolEvent.type === "completed" || lastToolEvent.type === "exit_success") {
      setIsRunning(false);
      setStatusText("");
      const successMsg =
        typeof lastToolEvent.message === "string"
          ? lastToolEvent.message
          : "ตรวจสอบและลบโพสต์รออนุมัติเสร็จสิ้น";
      setLogs((prev) => [...prev, `[SUCCESS] ${successMsg}`]);
      toast.success(successMsg, "สำเร็จ");
    } else if (lastToolEvent.type === "error" || lastToolEvent.type === "exit_error") {
      setIsRunning(false);
      setStatusText("");
      const errMsg =
        typeof lastToolEvent.message === "string"
          ? lastToolEvent.message
          : "เกิดข้อผิดพลาดในการตรวจสอบ";
      setLogs((prev) => [...prev, `[ERROR] ${errMsg}`]);
      toast.error(errMsg, "ข้อผิดพลาด");
    }
  }, [lastToolEvent, isOpen, accountId]);

  const accountGroups = useMemo(() => {
    if (!accountId) return [];
    return groupsByAccount[accountId] || [];
  }, [groupsByAccount, accountId]);

  useEffect(() => {
    if (isOpen) {
      if (accountGroups.length > 0) {
        setSelectedGroupIds(new Set(accountGroups.map((g) => g.id)));
      } else {
        setSelectedGroupIds(new Set());
      }
      setSearchQuery("");
      setIsRunning(false);
      setStatusText("");
      setLogs([]);
    }
  }, [isOpen, accountGroups]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return accountGroups;
    const q = searchQuery.toLowerCase();
    return accountGroups.filter((g) => g.name.toLowerCase().includes(q));
  }, [accountGroups, searchQuery]);

  const handleToggleGroup = (id: string) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedGroupIds.size === filteredGroups.length) {
      setSelectedGroupIds(new Set());
    } else {
      setSelectedGroupIds(new Set(filteredGroups.map((g) => g.id)));
    }
  };

  const handleStartDeletePending = async () => {
    if (!accountId) {
      toast.error("ไม่พบบัญชีผู้ใช้", "ข้อผิดพลาด");
      return;
    }

    if (selectedGroupIds.size === 0) {
      toast.warning("กรุณาเลือกกลุ่มที่ต้องการตรวจสอบอย่างน้อย 1 กลุ่ม", "แจ้งเตือน");
      return;
    }

    setIsRunning(true);
    setStatusText("ส่งคำสั่งตรวจสอบและลบโพสต์รออนุมัติไปยังตัวโปรแกรม...");
    setLogs((prev) => [...prev, `[INIT] เริ่มต้นกระบวนการลบโพสต์รออนุมัติสำหรับ ${selectedGroupIds.size} กลุ่ม`]);

    try {
      const selectedGroups = accountGroups.filter((g) => selectedGroupIds.has(g.id));
      const res = await sendToolCommand("DELETE_PENDING_POSTS", accountId, {
        groupIds: Array.from(selectedGroupIds),
        groups: selectedGroups.map((g) => ({
          name: g.name,
          links: g.links ? g.links.split("\n").map((l) => l.trim()).filter(Boolean) : [],
        })),
      });

      if (res?.success) {
        toast.info("ตัวโปรแกรมกำลังเปิดเบราว์เซอร์เพื่อลบโพสต์รออนุมัติ...", "กำลังดำเนินการ");
      } else {
        setIsRunning(false);
        setStatusText("");
        toast.error(res?.message || "ไม่สามารถเริ่มกระบวนการได้", "ข้อผิดพลาด");
      }
    } catch (err: unknown) {
      setIsRunning(false);
      setStatusText("");
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ";
      toast.error(msg, "ข้อผิดพลาด");
    }
  };

  const handleAbort = async () => {
    if (!accountId) return;
    try {
      await sendToolCommand("ABORT_DELETE_PENDING", accountId);
      setIsRunning(false);
      setStatusText("");
      setLogs((prev) => [...prev, "[ABORT] สั่งยกเลิกการทำงาน"]);
      toast.info("ส่งคำสั่งยกเลิกแล้ว", "ยกเลิก");
    } catch {
      toast.error("ไม่สามารถยกเลิกได้", "ข้อผิดพลาด");
    }
  };

  const isInitialEmpty = accountGroups.length === 0 && !isRunning;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isRunning && onClose()}>
      <div
        className={`
          relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl
          border border-white/[0.12] bg-neutral-950
          shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.12)]
          transition-all duration-300 ease-out
          ${
            isInitialEmpty
              ? "h-auto max-h-[82dvh]"
              : "h-[82dvh] sm:h-[620px] max-h-[680px]"
          }
        `}
      >
        {/* Specular highlight & Amber glow */}
        <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white/20" />
        <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 sm:px-6 sm:py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
              <ClockAlert className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base text-white tracking-tight">
                  ลบกลุ่มที่ติดอนุมัติ
                </h2>
                {accountGroups.length > 0 && (
                  <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] sm:text-[11px] text-amber-300">
                    {accountGroups.length} กลุ่ม
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] sm:text-xs text-neutral-400 line-clamp-1 sm:line-clamp-none">
                ตรวจสอบและลบโพสต์ที่ยังค้างรอแอดมินกลุ่มอนุมัติเพื่อเคลียร์ประวัติโพสต์
              </p>
            </div>
          </div>

          <ButtonUI
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isRunning}
            className="h-8 w-8 !rounded-lg p-0 text-neutral-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </ButtonUI>
        </div>

        {/* Status banner */}
        {statusText && (
          <div className="mx-4 sm:mx-6 mt-3 flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-2 text-xs text-amber-300 shrink-0">
            <div className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              <span>{statusText}</span>
            </div>
            {isRunning && (
              <ButtonUI
                type="button"
                variant="ghost"
                onClick={handleAbort}
                className="px-2 py-0.5 text-[11px] text-red-400 hover:text-red-300"
              >
                หยุดงาน
              </ButtonUI>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 gap-3">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหากลุ่ม..."
                className="w-full pl-8 py-1.5 text-xs !rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
              <ButtonUI
                type="button"
                variant="ghost"
                onClick={handleToggleSelectAll}
                disabled={filteredGroups.length === 0}
                className="px-2 py-0.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                {selectedGroupIds.size === filteredGroups.length && filteredGroups.length > 0
                  ? "ยกเลิกเลือกทั้งหมด"
                  : "เลือกทั้งหมด"}
              </ButtonUI>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-400">
                เลือก <span className="text-amber-400">{selectedGroupIds.size}</span>/
                {filteredGroups.length}
              </span>
            </div>
          </div>

          {/* Groups list */}
          <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-white/[0.08] bg-white/[0.02] p-2 space-y-1.5">
            {filteredGroups.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center text-xs text-neutral-500">
                <Folder className="h-8 w-8 text-neutral-600 mb-2" />
                <span>{accountGroups.length === 0 ? "ไม่มีกลุ่มในบัญชีนี้" : "ไม่พบกลุ่มตามคำค้นหา"}</span>
              </div>
            ) : (
              filteredGroups.map((group) => {
                const isSelected = selectedGroupIds.has(group.id);
                const linkCount = group.links
                  ? group.links.split("\n").map((l) => l.trim()).filter(Boolean).length
                  : 0;

                return (
                  <div
                    key={group.id}
                    onClick={() => handleToggleGroup(group.id)}
                    className={`
                      flex items-center justify-between gap-3 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all
                      ${
                        isSelected
                          ? "border-amber-500/40 bg-amber-500/10 text-white"
                          : "border-white/[0.04] bg-white/[0.01] text-neutral-300 hover:border-white/10 hover:bg-white/[0.03]"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          isSelected
                            ? "bg-amber-500 border-amber-400 text-neutral-950"
                            : "border-white/20 bg-neutral-900"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>

                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Folder className="h-4 w-4 shrink-0 text-neutral-400" />
                        <span className="truncate text-white">{group.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-[10px] text-neutral-400">
                      <span className="rounded bg-white/[0.05] px-1.5 py-0.5 border border-white/10 flex items-center gap-1">
                        <LinkIcon className="h-2.5 w-2.5" /> {linkCount} ลิงก์
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-3 sm:px-6 sm:py-3.5 bg-neutral-900/40 shrink-0 gap-2">
          {onBack ? (
            <ButtonUI
              type="button"
              variant="secondary"
              onClick={onBack}
              disabled={isRunning}
              className="flex items-center gap-1.5 !rounded-xl px-3 py-2 text-xs text-neutral-300 hover:text-white transition-colors !bg-white/5 hover:!bg-white/10 !border-white/10 shrink-0"
            >
              <ArrowLeft size={13} />
              <span>ย้อนกลับ</span>
            </ButtonUI>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 shrink-0">
            <ButtonUI
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isRunning}
              className="px-3.5 py-2 text-xs cursor-pointer whitespace-nowrap !rounded-xl !bg-white/5 hover:!bg-white/10 !border-white/10 text-neutral-300 hover:text-white"
            >
              ปิด
            </ButtonUI>

            {isRunning ? (
              <ButtonUI
                type="button"
                variant="secondary"
                onClick={handleAbort}
                className="gap-1.5 px-3.5 py-2 text-xs font-medium cursor-pointer whitespace-nowrap !rounded-xl !bg-red-500/10 hover:!bg-red-500/20 text-red-400 !border-red-500/30"
              >
                <StopCircle size={14} />
                <span>หยุดการตรวจสอบ</span>
              </ButtonUI>
            ) : (
              <ButtonUI
                type="button"
                onClick={handleStartDeletePending}
                disabled={selectedGroupIds.size === 0}
                className={`
                  gap-1.5 px-3.5 py-2 text-xs cursor-pointer !rounded-xl whitespace-nowrap transition-all
                  ${
                    selectedGroupIds.size > 0
                      ? "!bg-amber-600 hover:!bg-amber-500 !border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                      : "!bg-white/5 !border-white/10 text-neutral-500 cursor-not-allowed opacity-50"
                  }
                `}
              >
                <Trash2 size={14} />
                <span>ลบโพสต์รออนุมัติ ({selectedGroupIds.size})</span>
              </ButtonUI>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
