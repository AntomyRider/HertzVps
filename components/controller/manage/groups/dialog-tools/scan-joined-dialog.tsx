"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Users,
  Search,
  Loader2,
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  FolderPlus,
  StopCircle,
  Globe,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import ButtonUI from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useControllerStore } from "@/store/controllerStore";

export interface JoinedGroupItem {
  id: string;
  name: string;
  url: string;
  avatar?: string;
  privacy?: string;
  members?: string;
}

export interface ScanJoinedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  accountId?: string;
}

/**
 * ฟังก์ชันคลีนข้อความและตัดวรรณยุกต์ภาษาไทยสำหรับการกรองด่วน
 */
function normalizeThai(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u0e47-\u0e4c]/g, "") // ตัดวรรณยุกต์ไทย
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, "") // ลบช่องว่างทั้งหมด — พิมพ์เว้นวรรคผิด/ซ้ำก็ยังค้นเจอ
    .toLowerCase();
}

export default function ScanJoinedDialog({
  isOpen,
  onClose,
  onBack,
  accountId,
}: ScanJoinedDialogProps) {
  const { openCreateGroupWithData, sendToolCommand } = useControllerStore();

  // States
  const [groups, setGroups] = useState<JoinedGroupItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copyFormat, setCopyFormat] = useState<"url" | "id">("url");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const lastToolEvent = useControllerStore((state) => state.lastToolEvent);

  // ดักรับผลลัพธ์ / ความคืบหน้าการสแกนกลุ่มแบบ Real-time จากตัวโปรแกรม
  useEffect(() => {
    if (!lastToolEvent || !isOpen) return;
    if (lastToolEvent.userId && accountId && String(lastToolEvent.userId) !== String(accountId)) return;
    if (lastToolEvent.tool !== "SCAN_JOINED_GROUPS") return;

    if (lastToolEvent.type === "status") {
      if (typeof lastToolEvent.message === "string") {
        setStatusText(lastToolEvent.message);
      }
    } else if (lastToolEvent.type === "completed") {
      setIsScanning(false);
      setStatusText(typeof lastToolEvent.message === "string" ? lastToolEvent.message : "สแกนกลุ่มเสร็จสิ้น");
      if (Array.isArray(lastToolEvent.groups)) {
        setGroups(lastToolEvent.groups as JoinedGroupItem[]);
        toast.success(`สแกนกลุ่มเสร็จสิ้น พบทั้งหมด ${lastToolEvent.groups.length} กลุ่ม`, "สำเร็จ");
      }
    } else if (lastToolEvent.type === "error" || lastToolEvent.type === "exit_error") {
      setIsScanning(false);
      setStatusText("");
      const errMsg =
        typeof lastToolEvent.message === "string"
          ? lastToolEvent.message
          : "เกิดข้อผิดพลาดในการสแกนกลุ่ม";
      toast.error(errMsg, "ข้อผิดพลาด");
    } else if (lastToolEvent.type === "aborted" || lastToolEvent.type === "exit_success") {
      setIsScanning(false);
    }
  }, [lastToolEvent, isOpen, accountId]);

  // เคลียร์ค่าทั้งหมดทุกครั้งเมื่อเปิดหรือปิด Dialog (ไม่เก็บ Cache ข้อมูลเดิม)
  useEffect(() => {
    if (isOpen) {
      setGroups([]);
      setSelectedIds(new Set());
      setSearchQuery("");
      setStatusText("");
      setIsScanning(false);
      setDropdownOpen(false);
      setCopied(false);
    }
  }, [isOpen]);

  // ฟังก์ชันปิดหน้าต่างและล้าง Cache/State ทั้งหมด
  const handleClose = () => {
    if (isScanning && accountId) {
      sendToolCommand("ABORT_SCAN_JOINED", accountId).catch(() => {});
    }
    setGroups([]);
    setSelectedIds(new Set());
    setSearchQuery("");
    setStatusText("");
    setIsScanning(false);
    setDropdownOpen(false);
    setCopied(false);
    onClose();
  };

  // กรองรายการกลุ่มตามคำค้นหาแบบ Real-time
  const filteredGroups = useMemo(() => {
    const query = normalizeThai(searchQuery);
    if (!query) return groups;

    return groups.filter((g) => {
      const cleanName = normalizeThai(g.name);
      const cleanId = (g.id || "").toLowerCase();
      const cleanUrl = (g.url || "").toLowerCase();
      return cleanName.includes(query) || cleanId.includes(query) || cleanUrl.includes(query);
    });
  }, [groups, searchQuery]);

  // เริ่มต้นการสแกนกลุ่ม
  const handleStartScan = async () => {
    if (!accountId) {
      toast.error("ไม่พบข้อมูลบัญชีผู้ใช้", "ข้อผิดพลาด");
      return;
    }

    setIsScanning(true);
    setStatusText("ส่งคำสั่งสแกนกลุ่มไปยังตัวโปรแกรมแล้ว...");
    setSelectedIds(new Set());

    try {
      const res = await sendToolCommand("SCAN_JOINED_GROUPS", accountId);
      if (res?.success) {
        toast.info("ตัวโปรแกรมได้รับคำสั่งสแกนกลุ่มแล้ว กำลังดำเนินการ...", "สแกนกลุ่ม");
      } else {
        setIsScanning(false);
        setStatusText("");
        toast.error(res?.message || "ไม่สามารถเริ่มการสแกนกลุ่มได้", "ข้อผิดพลาด");
      }
    } catch (err: unknown) {
      setIsScanning(false);
      setStatusText("");
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ";
      toast.error(msg, "ข้อผิดพลาด");
    }
  };

  // ยกเลิกการสแกน
  const handleAbortScan = async () => {
    if (!accountId) return;
    try {
      await sendToolCommand("ABORT_SCAN_JOINED", accountId);
      setIsScanning(false);
      setStatusText("");
      toast.info("ส่งคำสั่งยกเลิกการสแกนแล้ว", "ยกเลิก");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ไม่สามารถยกเลิกได้";
      toast.error(msg, "ข้อผิดพลาด");
    }
  };

  // เลือก / ยกเลิกเลือกทั้งหมด
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredGroups.length && filteredGroups.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredGroups.map((g) => g.id)));
    }
  };

  // Toggle เลือกรายกลุ่ม
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // คัดลอกรายการที่เลือก
  const handleCopySelected = () => {
    const targetGroups = groups.filter((g) => selectedIds.has(g.id));
    if (targetGroups.length === 0) {
      toast.warning("กรุณาเลือกกลุ่มที่ต้องการคัดลอกอย่างน้อย 1 กลุ่ม", "แจ้งเตือน");
      return;
    }

    const textToCopy = targetGroups
      .map((g) => (copyFormat === "id" ? g.id : g.url))
      .join("\n");

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success(
      copyFormat === "id"
        ? `คัดลอก ID ทั้งหมด ${targetGroups.length} กลุ่มเรียบร้อยแล้ว`
        : `คัดลอกลิงก์ URL ทั้งหมด ${targetGroups.length} กลุ่มเรียบร้อยแล้ว`,
      "คัดลอกสำเร็จ"
    );
    setTimeout(() => setCopied(false), 2000);
  };

  // ส่งออกลิงก์และชื่อกลุ่มที่เลือกเข้าสู่ Create Group Dialog
  const handleExportToCreateDialog = () => {
    const selectedGroups = groups.filter((g) => selectedIds.has(g.id));
    const selectedUrls = selectedGroups.map((g) => g.url);

    if (selectedUrls.length === 0) {
      toast.warning("กรุณาเลือกกลุ่มที่ต้องการนำเข้าอย่างน้อย 1 กลุ่ม", "แจ้งเตือน");
      return;
    }

    const defaultName =
      selectedGroups.length === 1
        ? selectedGroups[0].name
        : `${selectedGroups[0].name} (${selectedGroups.length} กลุ่ม)`;

    // ปิดหน้าต่าง ScanJoinedDialog
    handleClose();

    // เปิดหน้าต่างสร้างกลุ่มใหม่พร้อมส่งข้อมูลตั้งต้น (name, links) เข้าไป
    openCreateGroupWithData({
      name: defaultName,
      links: selectedUrls,
    });

    toast.success(
      `ส่งออก ${selectedUrls.length} ลิงก์ไปยังหน้าสร้างกลุ่มเรียบร้อยแล้ว`,
      "ส่งออกสำเร็จ"
    );
  };

  const isInitialEmpty = groups.length === 0 && !isScanning;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isScanning && handleClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`
          relative z-10 flex w-full max-w-3xl flex-col overflow-hidden
          rounded-2xl border border-white/[0.12]
          bg-neutral-950
          shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.12)]
          transition-all duration-300 ease-out
          ${
            isInitialEmpty
              ? "h-auto max-h-[82dvh]"
              : "h-[82dvh] sm:h-[650px] max-h-[720px]"
          }
        `}
      >
        {/* Specular highlight & Ambient glow */}
        <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white/20" />
        <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-cyan-500/10 blur-2xl" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 sm:px-6 sm:py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
              <Users className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base text-white tracking-tight truncate">
                  ค้นหากลุ่มที่เข้าร่วมแล้ว
                </h2>
                {groups.length > 0 && (
                  <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[10px] sm:text-[11px] text-cyan-300 font-mono shrink-0">
                    {groups.length} กลุ่ม
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] sm:text-xs text-neutral-400 line-clamp-1 sm:line-clamp-none">
                สแกนและดึงรายชื่อกลุ่ม Facebook ทั้งหมดที่บัญชีนี้เป็นสมาชิกอยู่
              </p>
            </div>
          </div>

          <ButtonUI
            type="button"
            variant="ghost"
            disabled={isScanning}
            onClick={handleClose}
            aria-label="Close dialog"
            className="h-8 w-8 !rounded-lg p-0 text-neutral-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 shrink-0"
          >
            <X className="h-5 w-5" />
          </ButtonUI>
        </div>

        {/* Content Body */}
        <div className="flex flex-col gap-3 p-4 sm:p-6 overflow-hidden flex-1 min-h-0">
          {/* Controls Bar: Unified Inline Search + Scan Action */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search Input Filter */}
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={groups.length === 0}
                placeholder={
                  groups.length === 0
                    ? "สแกนกลุ่มก่อนเพื่อค้นหา..."
                    : "ค้นหาชื่อกลุ่ม หรือ ID..."
                }
                className="
                  h-10 w-full bg-neutral-900 border border-white/10 hover:border-white/20
                  rounded-xl py-2 pl-9 pr-8 text-xs text-cyan-200 placeholder:text-neutral-500
                  outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all
                "
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Scan / Abort Action Button */}
            <ButtonUI
              type="button"
              onClick={isScanning ? handleAbortScan : handleStartScan}
              className={`
                h-10 shrink-0 gap-1.5 px-3.5 sm:px-4 text-xs font-medium cursor-pointer transition-all whitespace-nowrap !rounded-xl
                ${
                  isScanning
                    ? "!bg-red-500/10 hover:!bg-red-500/20 text-red-400 !border-red-500/30"
                    : "!bg-cyan-600 hover:!bg-cyan-500 !border-cyan-400/30 text-white "
                }
              `}
            >
              {isScanning ? (
                <>
                  <StopCircle className="h-3.5 w-3.5 animate-pulse" />
                  <span>หยุดสแกน</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{groups.length > 0 ? "สแกนใหม่" : "เริ่มสแกน"}</span>
                </>
              )}
            </ButtonUI>
          </div>

          {/* Scanned List / Scanning / Empty Display */}
          {isScanning ? (
            <div className="flex-1 min-h-[220px] flex flex-col justify-center items-center text-center p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] mb-3">
                <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
              </div>
              <h3 className="text-sm text-white">
                {statusText || "กำลังเชื่อมต่อระบบและสแกนหน้ากลุ่ม Facebook..."}
              </h3>
              <p className="mt-1 text-xs text-neutral-400 max-w-xs text-center leading-relaxed">
                ระบบกำลังเลื่อนหน้าจออัตโนมัติเบื้องหลัง คุณสามารถรอหรือกดปุ่มหยุดสแกนได้ตลอดเวลา
              </p>
            </div>
          ) : isInitialEmpty ? (
            <div className="flex flex-col items-center justify-center text-center py-6 sm:py-10 px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] mb-3">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-sm text-white">ยังไม่มีข้อมูลกลุ่มที่สแกน</h3>
              <p className="mt-1 text-xs text-neutral-400 max-w-xs text-center leading-relaxed">
                กดปุ่ม &quot;เริ่มสแกน&quot; เพื่อให้ตัวโปรแกรมเปิดเบราว์เซอร์และดึงรายชื่อกลุ่มที่คุณเข้าร่วมแล้วทั้งหมด
              </p>
              <ButtonUI
                type="button"
                onClick={handleStartScan}
                className="mt-4 gap-2 px-4 py-2 text-xs !rounded-xl !bg-cyan-600 hover:!bg-cyan-500 !border-cyan-400/30 text-white transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>เริ่มสแกนหากลุ่ม</span>
              </ButtonUI>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="flex-1 min-h-[200px] flex flex-col justify-center items-center text-center p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-400 mb-3">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-sm text-white">ไม่พบกลุ่มที่ตรงกับคำค้นหา</h3>
              <p className="mt-1 text-xs text-neutral-400 max-w-xs text-center leading-relaxed">
                ไม่พบชื่อกลุ่มที่มีคำว่า &quot;{searchQuery}&quot; ในรายการที่สแกนได้
              </p>
              <ButtonUI
                type="button"
                variant="secondary"
                onClick={() => setSearchQuery("")}
                className="mt-3 gap-1.5 px-3 py-1.5 text-xs cursor-pointer !rounded-xl !bg-white/5 hover:!bg-white/10 !border-white/10"
              >
                <X className="h-3.5 w-3.5" />
                <span>ล้างคำค้นหา</span>
              </ButtonUI>
            </div>
          ) : (
            <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-hidden">
              {/* Toolbar Bar: Select All, Counter, Copy Dropdown */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-neutral-900/60 border border-white/[0.08] rounded-xl px-3 py-2 text-xs shrink-0">
                {/* Select All */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={handleToggleSelectAll}
                    className={`
                      flex h-4 w-4 shrink-0 items-center justify-center rounded-md border
                      transition-all
                      ${
                        selectedIds.size === filteredGroups.length && filteredGroups.length > 0
                          ? "bg-cyan-500 border-cyan-400 text-neutral-950"
                          : "bg-neutral-900 border-white/20 hover:border-white/40"
                      }
                    `}
                  >
                    {selectedIds.size === filteredGroups.length && filteredGroups.length > 0 && (
                      <Check className="h-3 w-3 stroke-[3]" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-neutral-300">
                    เลือกทั้งหมด ({selectedIds.size}/{filteredGroups.length})
                  </span>
                </label>

                {/* Bulk Actions */}
                <div className="flex items-center gap-2">
                  {/* Format Selector Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-1.5 bg-neutral-950 border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-1 text-[11px] text-neutral-300 cursor-pointer transition-all"
                    >
                      <span>{copyFormat === "url" ? "ลิงก์ URL" : "Group ID"}</span>
                      <ChevronDown
                        className={`h-3 w-3 text-neutral-500 transition-transform ${
                          dropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {dropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setDropdownOpen(false)}
                        />
                        <div className="absolute right-0 mt-1 z-30 w-28 rounded-lg border border-white/10 bg-neutral-950 p-1 shadow-xl flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCopyFormat("url");
                              setDropdownOpen(false);
                            }}
                            className={`px-2.5 py-1.5 text-left text-[11px] rounded cursor-pointer ${
                              copyFormat === "url"
                                ? "bg-cyan-500/10 text-cyan-300"
                                : "text-neutral-400 hover:bg-white/5"
                            }`}
                          >
                            ลิงก์ URL
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCopyFormat("id");
                              setDropdownOpen(false);
                            }}
                            className={`px-2.5 py-1.5 text-left text-[11px] rounded cursor-pointer ${
                              copyFormat === "id"
                                ? "bg-cyan-500/10 text-cyan-300"
                                : "text-neutral-400 hover:bg-white/5"
                            }`}
                          >
                            Group ID
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopySelected}
                    disabled={selectedIds.size === 0}
                    className="
                      flex items-center gap-1.5 px-3 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10
                      text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 text-[11px] font-medium
                      transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer
                    "
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span>คัดลอก ({selectedIds.size})</span>
                  </button>
                </div>
              </div>

              {/* Group Cards List Container */}
              <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0 pr-0.5 sm:pr-1">
                {filteredGroups.map((g) => {
                  const isChecked = selectedIds.has(g.id);
                  return (
                    <div
                      key={g.id}
                      onClick={() => handleToggleSelect(g.id)}
                      className={`
                        group relative flex items-center justify-between gap-2.5 sm:gap-3 p-2.5 sm:p-3
                        rounded-xl border text-xs cursor-pointer select-none transition-all duration-150
                        ${
                          isChecked
                            ? "bg-cyan-500/[0.04] border-cyan-500/30 shadow-[inset_0_1px_0_rgba(6,182,212,0.15)]"
                            : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]"
                        }
                      `}
                    >
                      {/* Left: Checkbox & Avatar & Info */}
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        {/* Checkbox */}
                        <div
                          className={`
                            flex h-4 w-4 shrink-0 items-center justify-center rounded-md border
                            transition-all
                            ${
                              isChecked
                                ? "bg-cyan-500 border-cyan-400 text-neutral-950"
                                : "bg-neutral-900 border-white/20 group-hover:border-white/40"
                            }
                          `}
                        >
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>

                        {/* Avatar */}
                        <div className="relative shrink-0">
                          {g.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={g.avatar}
                              alt={g.name}
                              className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg object-cover border border-white/10"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-white/10 bg-neutral-900 text-xs text-neutral-400">
                              {g.name.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-neutral-200 group-hover:text-white transition-colors">
                              {g.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 text-[10px] text-neutral-400">
                            {g.privacy && (
                              <span className="flex items-center gap-1 shrink-0">
                                {g.privacy.includes("สาธารณะ") ||
                                g.privacy.toLowerCase().includes("public") ? (
                                  <Globe className="h-3 w-3 text-cyan-400" />
                                ) : (
                                  <Lock className="h-3 w-3 text-amber-400" />
                                )}
                                <span>{g.privacy}</span>
                              </span>
                            )}
                            {g.members && <span className="shrink-0">• {g.members}</span>}
                            <span className="font-mono text-neutral-500 truncate max-w-[120px]">
                              ID: {g.id}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div
                        className="shrink-0 flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={g.url}
                          target="_blank"
                          rel="noreferrer"
                          title="เปิดหน้ากลุ่มบนเบราว์เซอร์"
                          className="
                            p-1.5 rounded-lg border border-white/10 bg-neutral-900/80
                            text-neutral-400 hover:text-cyan-400 hover:border-cyan-500/30
                            transition-all cursor-pointer flex items-center justify-center
                          "
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-3 sm:px-6 sm:py-3.5 bg-neutral-900/40 shrink-0 gap-2">
          {onBack ? (
            <ButtonUI
              type="button"
              variant="secondary"
              onClick={onBack}
              disabled={isScanning}
              className="gap-1.5 px-3 py-2 text-xs text-neutral-300 hover:text-white shrink-0 !rounded-xl !bg-white/5 hover:!bg-white/10 !border-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>ย้อนกลับ</span>
            </ButtonUI>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 shrink-0">
            <ButtonUI
              type="button"
              variant="secondary"
              disabled={isScanning}
              onClick={handleClose}
              className="px-3.5 py-2 text-xs cursor-pointer whitespace-nowrap !rounded-xl !bg-white/5 hover:!bg-white/10 !border-white/10 text-neutral-300 hover:text-white"
            >
              ปิด
            </ButtonUI>

            <ButtonUI
              type="button"
              disabled={selectedIds.size === 0 || isScanning}
              onClick={handleExportToCreateDialog}
              className={`
                gap-1.5 sm:gap-2 px-3.5 py-2 text-xs cursor-pointer !rounded-xl whitespace-nowrap transition-all
                ${
                  selectedIds.size > 0
                    ? "!bg-cyan-600 hover:!bg-cyan-500 !border-cyan-400/30 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                    : "!bg-white/5 !border-white/10 text-neutral-500 cursor-not-allowed opacity-50"
                }
              `}
            >
              <FolderPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>สร้างกลุ่ม ({selectedIds.size})</span>
            </ButtonUI>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
