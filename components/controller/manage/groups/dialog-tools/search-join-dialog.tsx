"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Search,
  Loader2,
  ExternalLink,
  UserPlus,
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  StopCircle,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import ButtonUI from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Dropdown, { DropdownOption } from "@/components/ui/dropdown";
import { Empty } from "@/components/ui/empty";
import { toast } from "@/components/ui/toast";
import { useControllerStore } from "@/store/controllerStore";

export interface SearchGroupItem {
  id: string;
  name: string;
  url: string;
  avatar?: string;
  meta?: string;
  status?: "not_joined" | "joined" | "requested";
}

export interface SearchJoinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  accountId?: string;
}

const scrollOptions: DropdownOption[] = [
  { value: "6", label: "6 รอบ (~30 กลุ่ม)" },
  { value: "12", label: "12 รอบ (~60 กลุ่ม)" },
  { value: "20", label: "20 รอบ (~100 กลุ่ม)" },
  { value: "30", label: "30 รอบ (~150 กลุ่ม)" },
];

export default function SearchJoinDialog({
  isOpen,
  onClose,
  onBack,
  accountId,
}: SearchJoinDialogProps) {
  const { sendToolCommand } = useControllerStore();

  // Search & Results States
  const [query, setQuery] = useState("");
  const [maxScrolls, setMaxScrolls] = useState<number>(12);
  const [groups, setGroups] = useState<SearchGroupItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [statusText, setStatusText] = useState("");

  const lastToolEvent = useControllerStore((state) => state.lastToolEvent);

  // ดักรับผลลัพธ์ / ความคืบหน้าการค้นหาและเข้าร่วมกลุ่มแบบ Real-time จากตัวโปรแกรม
  useEffect(() => {
    if (!lastToolEvent || !isOpen) return;
    if (lastToolEvent.userId && accountId && String(lastToolEvent.userId) !== String(accountId)) return;

    if (lastToolEvent.tool === "SEARCH_GROUPS") {
      if (lastToolEvent.type === "status") {
        if (typeof lastToolEvent.message === "string") {
          setStatusText(lastToolEvent.message);
        }
      } else if (lastToolEvent.type === "search-result") {
        setIsSearching(false);
        setStatusText(
          typeof lastToolEvent.message === "string"
            ? lastToolEvent.message
            : "ค้นหากลุ่มเสร็จสิ้น"
        );
        if (Array.isArray(lastToolEvent.groups)) {
          setGroups(lastToolEvent.groups as SearchGroupItem[]);
          toast.success(
            `ค้นหากลุ่มเสร็จสิ้น พบทั้งหมด ${lastToolEvent.groups.length} กลุ่ม`,
            "สำเร็จ"
          );
        }
      } else if (lastToolEvent.type === "error" || lastToolEvent.type === "exit_error") {
        setIsSearching(false);
        setStatusText("");
        const errMsg =
          typeof lastToolEvent.message === "string"
            ? lastToolEvent.message
            : "เกิดข้อผิดพลาดในการค้นหากลุ่ม";
        toast.error(errMsg, "ข้อผิดพลาด");
      }
    } else if (lastToolEvent.tool === "JOIN_GROUPS") {
      if (lastToolEvent.type === "status" || lastToolEvent.type === "join-progress") {
        if (typeof lastToolEvent.message === "string") {
          setStatusText(lastToolEvent.message);
        }
      } else if (lastToolEvent.type === "join-complete" || lastToolEvent.type === "exit_success") {
        setIsJoining(false);
        setStatusText(
          typeof lastToolEvent.message === "string"
            ? lastToolEvent.message
            : "เข้าร่วมกลุ่มเสร็จสิ้น"
        );
        toast.success(
          typeof lastToolEvent.message === "string"
            ? lastToolEvent.message
            : "ดำเนินการเสร็จสิ้น",
          "สำเร็จ"
        );
      } else if (lastToolEvent.type === "error" || lastToolEvent.type === "exit_error") {
        setIsJoining(false);
        setStatusText("");
        toast.error(
          typeof lastToolEvent.message === "string"
            ? lastToolEvent.message
            : "เกิดข้อผิดพลาดในการเข้าร่วมกลุ่ม",
          "ข้อผิดพลาด"
        );
      }
    }
  }, [lastToolEvent, isOpen, accountId]);

  // Reset when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setMaxScrolls(12);
      setGroups([]);
      setSelectedIds(new Set());
      setIsSearching(false);
      setIsJoining(false);
      setStatusText("");
    }
  }, [isOpen]);

  // Handle Close & Abort
  const handleClose = () => {
    if (isSearching && accountId) {
      sendToolCommand("ABORT_SEARCH_JOIN", accountId).catch(() => {});
    }
    setIsSearching(false);
    setIsJoining(false);
    onClose();
  };

  // Start Searching
  const handleStartSearch = async () => {
    if (!accountId) {
      toast.warning("ไม่พบข้อมูลบัญชีผู้ใช้", "แจ้งเตือน");
      return;
    }
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      toast.warning("กรุณากรอกคำค้นหาหรือวาง Search URL ของ Facebook", "แจ้งเตือน");
      return;
    }

    setIsSearching(true);
    setStatusText("ส่งคำสั่งค้นหากลุ่มไปยังตัวโปรแกรม...");
    setGroups([]);
    setSelectedIds(new Set());

    try {
      const res = await sendToolCommand("SEARCH_GROUPS", accountId, {
        query: cleanQuery,
        maxScrolls,
      });

      if (res?.success) {
        toast.info("ตัวโปรแกรมกำลังเปิดเบราว์เซอร์เพื่อค้นหากลุ่ม...", "กำลังค้นหา");
      } else {
        setIsSearching(false);
        setStatusText("");
        toast.error(res?.message || "ไม่สามารถเริ่มการค้นหาได้", "ข้อผิดพลาด");
      }
    } catch (err: unknown) {
      setIsSearching(false);
      setStatusText("");
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ";
      toast.error(msg, "ข้อผิดพลาด");
    }
  };

  // Abort running search
  const handleAbort = async () => {
    if (!accountId) return;
    try {
      await sendToolCommand("ABORT_SEARCH_JOIN", accountId);
      setIsSearching(false);
      setIsJoining(false);
      setStatusText("");
      toast.info("ส่งคำสั่งยกเลิกการทำงานแล้ว กำลังหยุด...", "ยกเลิก");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ไม่สามารถยกเลิกได้";
      toast.error(msg, "ข้อผิดพลาด");
    }
  };

  // Start Joining Selected Groups
  const handleStartJoin = async () => {
    if (!accountId) return;
    const targetGroups = groups.filter((g) => selectedIds.has(g.id));
    if (targetGroups.length === 0) {
      toast.warning("กรุณาเลือกกลุ่มที่ต้องการเข้าร่วมอย่างน้อย 1 กลุ่ม", "แจ้งเตือน");
      return;
    }

    setIsJoining(true);
    setStatusText(`ส่งคำสั่งเข้าร่วม ${targetGroups.length} กลุ่มไปยังตัวโปรแกรม...`);

    try {
      const res = await sendToolCommand("JOIN_GROUPS", accountId, {
        groups: targetGroups,
      });

      if (res?.success) {
        toast.success(`ส่งคำสั่งเข้าร่วม ${targetGroups.length} กลุ่มเรียบร้อยแล้ว`, "เริ่มทำงาน");
      } else {
        setIsJoining(false);
        toast.error(res?.message || "ไม่สามารถส่งคำสั่งเข้าร่วมกลุ่มได้", "ข้อผิดพลาด");
      }
    } catch (err: unknown) {
      setIsJoining(false);
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ";
      toast.error(msg, "ข้อผิดพลาด");
    }
  };

  // Filter not joined groups
  const notJoinedGroups = useMemo(
    () => groups.filter((g) => g.status === "not_joined"),
    [groups]
  );

  const isAllSelected =
    notJoinedGroups.length > 0 &&
    notJoinedGroups.every((g) => selectedIds.has(g.id));

  const handleSelectAll = () => {
    setSelectedIds(new Set(notJoinedGroups.map((g) => g.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isInitialEmpty = groups.length === 0 && !isSearching;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isSearching && !isJoining && handleClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`
          relative z-10 flex w-full max-w-4xl flex-col overflow-hidden
          rounded-2xl border border-white/[0.12]
          bg-neutral-950
          shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.12)]
          transition-all duration-300 ease-out
          ${
            isInitialEmpty
              ? "h-auto max-h-[82dvh]"
              : "h-[82dvh] sm:h-[680px] max-h-[760px]"
          }
        `}
      >
        {/* Top highlight bar */}
        <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white/20" />
        <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 sm:px-6 sm:py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
              <UserPlus className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm sm:text-base text-white tracking-tight flex items-center gap-2 truncate">
                เข้าร่วมกลุ่มอัตโนมัติ
              </h2>
              <p className="mt-0.5 text-[11px] sm:text-xs text-neutral-400 line-clamp-1 sm:line-clamp-none">
                ค้นหากลุ่ม Facebook ตาม Keyword หรือ Search URL แล้วสั่งเข้าร่วมพร้อมตอบคำถามอัตโนมัติ
              </p>
            </div>
          </div>

          <ButtonUI
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSearching || isJoining}
            aria-label="Close dialog"
            className="h-8 w-8 !rounded-lg p-0 text-neutral-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-40 shrink-0"
          >
            <X className="h-5 w-5" />
          </ButtonUI>
        </div>

        {/* Search Controls Bar: Responsive layout for mobile & desktop */}
        <div className="border-b border-white/[0.08] bg-neutral-900/40 px-4 py-3 sm:px-6 sm:py-3.5 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSearching) {
                    handleStartSearch();
                  }
                }}
                disabled={isSearching}
                placeholder="พิมพ์คำค้นหา เช่น อนิเมะ, หางาน หรือวาง Facebook Search URL..."
                className="
                  h-10 w-full rounded-xl border border-white/[0.12]
                  bg-neutral-950/80 pl-10 pr-9
                  text-xs sm:text-sm text-neutral-100 placeholder-neutral-500
                  outline-none transition-all
                  focus:border-emerald-500/60 focus:bg-neutral-950 focus:ring-1 focus:ring-emerald-500/40
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              />
              {query && !isSearching && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 cursor-pointer p-0.5"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Scroll Selector + Button Group */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Scroll Depth Selector */}
              <Dropdown
                options={scrollOptions}
                value={String(maxScrolls)}
                onChange={(val) => setMaxScrolls(Number(val) || 12)}
                disabled={isSearching}
                placeholder="รอบเลื่อน..."
                className="flex-1 sm:w-44 shrink-0"
              />

              {/* Search or Abort Button */}
              {isSearching ? (
                <ButtonUI
                  type="button"
                  variant="secondary"
                  onClick={handleAbort}
                  className="shrink-0 gap-1.5 px-3 py-2 text-xs font-medium cursor-pointer whitespace-nowrap !rounded-xl !bg-red-500/10 hover:!bg-red-500/20 text-red-400 !border-red-500/30"
                >
                  <StopCircle className="h-4 w-4 animate-pulse" />
                  <span>ยกเลิก</span>
                </ButtonUI>
              ) : (
                <ButtonUI
                  type="button"
                  onClick={handleStartSearch}
                  disabled={!query.trim()}
                  className="shrink-0 gap-1.5 px-3.5 py-2 text-xs font-medium cursor-pointer whitespace-nowrap !rounded-xl !bg-emerald-600 hover:!bg-emerald-500 !border-emerald-500 text-white disabled:opacity-50"
                >
                  <Search className="h-4 w-4" />
                  <span>ค้นหากลุ่ม</span>
                </ButtonUI>
              )}
            </div>
          </div>
        </div>

        {/* Groups List Table */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
          {isSearching ? (
            <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 text-neutral-400 p-4">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <p className="text-sm font-medium text-center">กำลังค้นหากลุ่ม Facebook ตาม Keyword...</p>
              <p className="text-xs text-neutral-500 max-w-sm text-center">
                ระบบกำลังเปิดเบราว์เซอร์และเลื่อนหน้าค้นหาเพื่อรวบรวมรายชื่อกลุ่มและสถานะการเข้าร่วม
              </p>
            </div>
          ) : isInitialEmpty ? (
            <div className="flex flex-col items-center justify-center text-center py-6 sm:py-10 px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] mb-3">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-sm text-white">ยังไม่มีผลการค้นหา</h3>
              <p className="mt-1 text-xs text-neutral-400 max-w-sm text-center leading-relaxed">
                พิมพ์คำค้นหา หรือวาง Search URL ด้านบน แล้วกดปุ่ม &quot;ค้นหากลุ่ม&quot; เพื่อเริ่มต้นค้นหากลุ่ม Facebook
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Select All Checkbox Row */}
              <div className="flex items-center justify-between px-2 sm:px-3 py-1.5 text-xs text-neutral-400 select-none">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={() => {
                      if (isAllSelected) handleDeselectAll();
                      else handleSelectAll();
                    }}
                    disabled={isSearching || notJoinedGroups.length === 0}
                  />
                  <span className="text-[11px] sm:text-xs">
                    เลือกเฉพาะกลุ่มที่ยังไม่เข้าร่วม ({notJoinedGroups.length} กลุ่ม)
                  </span>
                </label>
                <span className="text-[11px] sm:text-xs">สถานะการเข้าร่วม</span>
              </div>

              {/* Group Rows */}
              {groups.map((grp) => {
                const isSelected = selectedIds.has(grp.id);
                const currentStatus = grp.status;

                return (
                  <div
                    key={grp.id}
                    onClick={() => handleToggleSelect(grp.id)}
                    className={`
                      group flex items-center justify-between gap-3 sm:gap-4 rounded-xl border p-2.5 sm:p-3
                      transition-all duration-150 cursor-pointer select-none
                      ${
                        isSelected
                          ? "border-emerald-500/40 bg-emerald-500/[0.04]"
                          : "border-white/[0.06] bg-white/[0.01] hover:border-white/[0.15] hover:bg-white/[0.03]"
                      }
                    `}
                  >
                    {/* Left: Checkbox & Info */}
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSelect(grp.id)}
                          disabled={isSearching}
                        />
                      </div>

                      {/* Avatar */}
                      <div className="relative h-10 w-10 sm:h-11 sm:w-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 flex items-center justify-center text-neutral-400">
                        {grp.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={grp.avatar}
                            alt={grp.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <Users className="h-5 w-5 text-neutral-500" />
                        )}
                      </div>

                      {/* Title & Meta */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <h3 className="text-xs sm:text-sm font-medium text-white truncate max-w-[200px] sm:max-w-md group-hover:text-emerald-300 transition-colors">
                            {grp.name}
                          </h3>
                          <a
                            href={grp.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="เปิดดูใน Facebook"
                            className="text-neutral-500 hover:text-emerald-400 transition-colors shrink-0"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>

                        <div className="mt-0.5 flex items-center gap-2 text-[10px] sm:text-xs text-neutral-400">
                          {grp.meta ? (
                            <span className="truncate">{grp.meta}</span>
                          ) : (
                            <span className="text-neutral-500 truncate">ID: {grp.id}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Badge */}
                    <div className="shrink-0">
                      {currentStatus === "joined" ? (
                        <span className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-emerald-300">
                          <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span>เป็นสมาชิกแล้ว</span>
                        </span>
                      ) : currentStatus === "requested" ? (
                        <span className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-blue-300">
                          <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span>ส่งคำขอแล้ว</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-neutral-300">
                          <span>ยังไม่เข้าร่วม</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status text banner if any */}
        {statusText && (
          <div className="mx-4 sm:mx-6 mb-2 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-xs text-emerald-300 shrink-0">
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            <span className="truncate">{statusText}</span>
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-3 sm:px-6 sm:py-3.5 bg-neutral-900/40 shrink-0 gap-2">
          {/* Left: Back Button */}
          {onBack ? (
            <ButtonUI
              type="button"
              variant="secondary"
              onClick={onBack}
              disabled={isSearching || isJoining}
              className="gap-1.5 px-3 py-2 text-xs text-neutral-300 hover:text-white shrink-0 !rounded-xl !bg-white/5 hover:!bg-white/10 !border-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">ย้อนกลับ</span>
            </ButtonUI>
          ) : (
            <div />
          )}

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <ButtonUI
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSearching}
              className="px-3.5 py-2 text-xs cursor-pointer whitespace-nowrap !rounded-xl !bg-white/5 hover:!bg-white/10 !border-white/10 text-neutral-300 hover:text-white"
            >
              ปิด
            </ButtonUI>

            <ButtonUI
              type="button"
              disabled={selectedIds.size === 0 || isSearching || isJoining}
              onClick={handleStartJoin}
              className={`
                gap-1.5 sm:gap-2 px-3.5 py-2 text-xs cursor-pointer !rounded-xl whitespace-nowrap transition-all
                ${
                  selectedIds.size > 0
                    ? "!bg-emerald-600 hover:!bg-emerald-500 !border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                    : "!bg-white/5 !border-white/10 text-neutral-500 cursor-not-allowed opacity-50"
                }
              `}
            >
              {isJoining ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>กำลังส่ง...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span>เข้าร่วมกลุ่ม</span>
                  <span className="hidden sm:inline">ที่เลือก</span>
                  <span>({selectedIds.size})</span>
                </>
              )}
            </ButtonUI>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
