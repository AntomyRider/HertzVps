"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  User,
  Loader2,
  Archive,
  Download,
  Upload,
  Send,
  Share2,
  Flame,
} from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import { useToast } from "@/components/ui/toast";
import { useControllerStore } from "@/store/controllerStore";

export default function DataSettingController() {
  const toast = useToast();
  const {
    accounts,
    groupsByAccount,
    config,
    isLoading,
    resetAllStats,
    resetCategoryStats,
  } = useControllerStore();

  const [resettingState, setResettingState] = useState<{
    userId: string;
    category: "post" | "share" | "boost";
  } | null>(null);
  const [isResettingAll, setIsResettingAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // สำรองข้อมูล (Export Backup)
  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const backupPayload = {
        exportedAt: new Date().toISOString(),
        version: "hertz-remote-v1",
        counts: {
          accounts: accounts.length,
          groups: Object.values(groupsByAccount).reduce(
            (sum, list) => sum + list.length,
            0
          ),
        },
        data: {
          accounts,
          groupsByAccount,
          config,
        },
      };

      const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `hertz-backup-${dateStr}.hertzbackup`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(
        "ส่งออกไฟล์สำรองข้อมูลเรียบร้อยแล้ว",
        `สำรองข้อมูล ${accounts.length} บัญชีสำเร็จ`
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสำรองข้อมูล",
        "ข้อผิดพลาด"
      );
    } finally {
      setIsExporting(false);
    }
  };

  // กู้คืนข้อมูล (Restore Backup)
  const handleImportBackup = async () => {
    const confirmed = await toast.confirm({
      title: "ยืนยันการกู้คืนข้อมูล (Restore)",
      message:
        "การกู้คืนข้อมูลจะนำไฟล์สำรองมาตรวจสอบและปรับใช้กับระบบ คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?",
      confirmText: "เลือกไฟล์กู้คืน",
      cancelText: "ยกเลิก",
      type: "danger",
    });

    if (!confirmed) return;

    // Open file input
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".hertzbackup,.json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== "object") {
          throw new Error("โครงสร้างไฟล์สำรองไม่ถูกต้อง");
        }

        const counts = parsed.counts;
        const info = counts
          ? ` (${counts.accounts || 0} บัญชี, ${counts.groups || 0} กลุ่ม)`
          : "";

        toast.success(
          `อ่านไฟล์สำรองข้อมูลเรียบร้อยแล้ว${info}`,
          "กู้คืนข้อมูลสำเร็จ"
        );
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "ไม่สามารถอ่านไฟล์สำรองได้",
          "ข้อผิดพลาด"
        );
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  // จัดการรีเซ็ตเฉพาะหมวดหมู่ของบัญชีเดี่ยว
  const handleResetCategory = async (
    userId: string,
    name: string,
    category: "post" | "share" | "boost"
  ) => {
    const categoryInfo: Record<
      "post" | "share" | "boost",
      { title: string; desc: string }
    > = {
      post: {
        title: "รีเซ็ตโพสต์",
        desc: "ยอดโพสต์ทั้งหมด สำเร็จ ล้มเหลว และรออนุมัติของบัญชีนี้จะถูกรีเซ็ตเป็น 0",
      },
      share: {
        title: "รีเซ็ตแชร์โพสต์",
        desc: "ยอดแชร์โพสต์ทั้งหมด สำเร็จ ล้มเหลว และรออนุมัติของบัญชีนี้จะถูกรีเซ็ตเป็น 0",
      },
      boost: {
        title: "รีเซ็ตดันโพสต์",
        desc: "ยอดดันโพสต์ คอมเมนต์ และรีแอคชันทั้งหมดของบัญชีนี้จะถูกรีเซ็ตเป็น 0",
      },
    };

    const target = categoryInfo[category];

    const confirmed = await toast.confirm({
      title: `ยืนยัน${target.title}`,
      message: `คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตสถิติ "${target.title}" ของบัญชี "${name}"? ${target.desc}`,
      confirmText: target.title,
      cancelText: "ยกเลิก",
      type: "danger",
    });

    if (!confirmed) return;

    setResettingState({ userId, category });
    try {
      const ok = await resetCategoryStats(userId, category);
      if (ok) {
        toast.success(
          `รีเซ็ตสถิติ "${target.title}" ของบัญชี "${name}" เรียบร้อยแล้ว`,
          "สำเร็จ"
        );
      } else {
        toast.error(
          `ไม่สามารถรีเซ็ตสถิติ "${target.title}" ของบัญชี "${name}" ได้`,
          "ข้อผิดพลาด"
        );
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการรีเซ็ตสถิติ", "ข้อผิดพลาด");
    } finally {
      setResettingState(null);
    }
  };

  // จัดการรีเซ็ตสถิติทั้งหมดในระบบ
  const handleResetAll = async () => {
    const confirmed = await toast.confirm({
      title: "ยืนยันการล้างสถิติทั้งหมด",
      message:
        "คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตสถิติทั้งหมดของระบบ? ข้อมูลกราฟย้อนหลัง ยอดรวม และสถิติของทุกบัญชีจะถูกรีเซ็ตเป็น 0 ทั้งหมด และไม่สามารถกู้คืนได้",
      confirmText: "ล้างสถิติทั้งหมด",
      cancelText: "ยกเลิก",
      type: "danger",
    });

    if (!confirmed) return;

    setIsResettingAll(true);
    try {
      const ok = await resetAllStats();
      if (ok) {
        toast.success("รีเซ็ตสถิติทั้งหมดของระบบเรียบร้อยแล้ว", "สำเร็จ");
      } else {
        toast.error("ไม่สามารถรีเซ็ตสถิติทั้งหมดได้", "ข้อผิดพลาด");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการรีเซ็ตสถิติ", "ข้อผิดพลาด");
    } finally {
      setIsResettingAll(false);
    }
  };

  return (
    <FadeIn direction="up">
      <div
        className="
          group relative
          overflow-clip
          rounded-2xl
          bg-neutral-900
          border border-white/[0.12]
          p-5
          shadow-[0_6px_0_rgba(0,0,0,0.45),0_12px_24px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.12),inset_0_-1px_2px_rgba(0,0,0,0.5)]
          transition-all
          duration-200
          ease-out
        "
      >
        {/* Top highlight (3D specular edge) */}
        <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white/20 z-10" />

        {/* Ambient soft glow */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/[0.04] blur-2xl transition-all duration-300 group-hover:bg-white/[0.07]" />

        {/* Main Content */}
        <div className="relative z-10">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="min-w-0">
              <h3 className="text-base text-sky-400 tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)]">
                จัดการข้อมูลและสถิติระบบ
              </h3>
              <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
                สำรองและกู้คืนฐานข้อมูล หรือเลือกรีเซ็ตสถิติการทำงานของแต่ละบัญชี
              </p>
            </div>

            {/* Reset All Button */}
            <button
              type="button"
              onClick={handleResetAll}
              disabled={isResettingAll || isLoading}
              className="
                self-start sm:self-auto shrink-0 flex items-center gap-1.5
                rounded-xl border border-rose-500/35 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95
                text-rose-300 hover:text-white px-3.5 py-1.5 text-xs font-medium
                transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
              "
            >
              {isResettingAll ? (
                <Loader2 size={13} className="animate-spin text-rose-400 shrink-0" />
              ) : (
                <RotateCcw size={13} className="shrink-0" />
              )}
              <span>รีเซ็ตสถิติทั้งหมด</span>
            </button>
          </div>

          {/* 1. Backup & Restore Row (3D Neu-tactile card) */}
          <div className="mt-4">
            <div
              className="
                group/row relative
                overflow-hidden
                flex flex-col sm:flex-row sm:items-center justify-between gap-3.5
                rounded-xl
                border border-white/[0.08]
                bg-white/[0.02]
                hover:bg-white/[0.04]
                hover:border-white/[0.16]
                p-3.5
                shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
                transition-all
                duration-200
              "
            >
              {/* Micro specular highlight */}
              <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-white/10" />

              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                  <Archive size={18} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-100 tracking-tight">
                    สำรองและกู้คืนข้อมูล (.hertzbackup)
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400 leading-relaxed">
                    ส่งออกไฟล์สำรองครอบคลุมฐานข้อมูล บัญชี กลุ่ม ลิงก์ และรูปภาพ หรือนำไฟล์มากู้คืน
                  </p>
                </div>
              </div>

              <div className="self-end sm:self-auto shrink-0 flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleImportBackup}
                  disabled={isImporting || isExporting}
                  className="
                    flex h-9 items-center justify-center gap-1.5 px-3.5 rounded-xl
                    border border-white/[0.1] bg-white/[0.04] text-neutral-300
                    hover:bg-white/[0.08] hover:border-violet-500/40 hover:text-violet-300
                    active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                    shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
                    text-xs font-medium w-full sm:w-auto
                  "
                >
                  {isImporting ? (
                    <Loader2 size={13} className="animate-spin text-violet-400 shrink-0" />
                  ) : (
                    <Upload size={13} className="text-neutral-400 shrink-0" />
                  )}
                  <span>กู้คืนข้อมูล</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportBackup}
                  disabled={isExporting || isImporting}
                  className="
                    flex h-9 items-center justify-center gap-1.5 px-3.5 rounded-xl
                    border border-blue-500/40 bg-blue-600 text-white
                    hover:bg-blue-500 active:scale-95 transition-all cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed
                    shadow-[0_2px_4px_rgba(37,99,235,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]
                    text-xs font-medium w-full sm:w-auto
                  "
                >
                  {isExporting ? (
                    <Loader2 size={13} className="animate-spin text-white shrink-0" />
                  ) : (
                    <Download size={13} className="shrink-0" />
                  )}
                  <span>สำรองข้อมูล</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Subsection Divider & Header */}
          <div className="pt-4 mt-4 border-t border-white/[0.08]">
            <div className="pb-3">
              <h4 className="text-sm font-semibold text-neutral-200 tracking-tight">
                รีเซ็ตสถิติรายบัญชี
              </h4>
              <p className="mt-0.5 text-xs text-neutral-400 leading-relaxed">
                เลือกรีเซ็ตสถิติการทำงานเฉพาะหมวดหมู่ของแต่ละบัญชี (โพสต์ / แชร์โพสต์ / ดันโพสต์)
              </p>
            </div>

            {/* Content: Accounts List */}
            <div>
              {/* Loading State */}
              {isLoading && accounts.length === 0 && (
                <div className="flex h-36 w-full flex-col items-center justify-center gap-2 text-neutral-400">
                  <Loader2 className="h-5 w-5 animate-spin text-sky-400" />
                  <span className="text-xs">กำลังโหลดข้อมูลบัญชี...</span>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && accounts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-neutral-500 mb-3">
                    <User size={22} />
                  </div>
                  <p className="text-sm font-medium text-neutral-300">ยังไม่มีบัญชีในระบบ</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    เพิ่มบัญชี Facebook ในโปรแกรมเพื่อเริ่มต้นจัดการสถิติ
                  </p>
                </div>
              )}

              {/* Accounts List Items */}
              {accounts.length > 0 && (
                <div className="space-y-2.5">
                  {accounts.map((acc) => {
                    const avatarSrc = acc.avatar;
                    const isCurrentResetting = resettingState?.userId === acc.id;

                    return (
                      <div
                        key={acc.id}
                        className="
                          group/item relative
                          overflow-hidden
                          flex flex-col lg:flex-row lg:items-center justify-between gap-3.5
                          rounded-xl
                          border border-white/[0.08]
                          bg-white/[0.02]
                          hover:bg-white/[0.04]
                          hover:border-white/[0.16]
                          p-3.5
                          shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
                          transition-all
                          duration-200
                        "
                      >
                        {/* Micro specular highlight */}
                        <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-white/10" />

                        {/* Left: Account Profile Info */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.12] bg-neutral-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.4)]">
                            {avatarSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={avatarSrc}
                                alt={acc.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <User size={18} className="text-neutral-400" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="truncate text-sm font-semibold tracking-tight text-neutral-100">
                                {acc.name}
                              </h4>
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                  acc.isRunning
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-neutral-800 text-neutral-400 border-neutral-700"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    acc.isRunning ? "bg-emerald-400" : "bg-neutral-500"
                                  }`}
                                />
                                {acc.isRunning ? "กำลังทำงาน" : "พร้อมทำงาน"}
                              </span>
                            </div>
                            <p className="truncate text-[11px] text-neutral-400 font-mono mt-0.5">
                              ID: {acc.fbId || acc.id}
                            </p>
                          </div>
                        </div>

                        {/* Right: 3 Category Reset Action Buttons */}
                        <div className="self-end lg:self-auto shrink-0 flex flex-wrap items-center gap-2 w-full lg:w-auto">
                          {/* 1. รีเซ็ตโพสต์ */}
                          <button
                            type="button"
                            onClick={() => handleResetCategory(acc.id, acc.name, "post")}
                            disabled={isCurrentResetting || isResettingAll}
                            className="
                              flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                              border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/50
                              text-blue-300 hover:text-blue-200
                              active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                              shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
                              flex-1 sm:flex-initial
                            "
                          >
                            {isCurrentResetting && resettingState?.category === "post" ? (
                              <Loader2 size={13} className="animate-spin text-blue-400 shrink-0" />
                            ) : (
                              <Send size={13} className="text-blue-400 shrink-0" />
                            )}
                            <span>รีเซ็ตโพสต์</span>
                          </button>

                          {/* 2. รีเซ็ตแชร์โพสต์ */}
                          <button
                            type="button"
                            onClick={() => handleResetCategory(acc.id, acc.name, "share")}
                            disabled={isCurrentResetting || isResettingAll}
                            className="
                              flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                              border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/50
                              text-emerald-300 hover:text-emerald-200
                              active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                              shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
                              flex-1 sm:flex-initial
                            "
                          >
                            {isCurrentResetting && resettingState?.category === "share" ? (
                              <Loader2 size={13} className="animate-spin text-emerald-400 shrink-0" />
                            ) : (
                              <Share2 size={13} className="text-emerald-400 shrink-0" />
                            )}
                            <span>รีเซ็ตแชร์โพสต์</span>
                          </button>

                          {/* 3. รีเซ็ตดันโพสต์ */}
                          <button
                            type="button"
                            onClick={() => handleResetCategory(acc.id, acc.name, "boost")}
                            disabled={isCurrentResetting || isResettingAll}
                            className="
                              flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                              border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-500/50
                              text-amber-300 hover:text-amber-200
                              active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                              shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
                              flex-1 sm:flex-initial
                            "
                          >
                            {isCurrentResetting && resettingState?.category === "boost" ? (
                              <Loader2 size={13} className="animate-spin text-amber-400 shrink-0" />
                            ) : (
                              <Flame size={13} className="text-amber-400 shrink-0" />
                            )}
                            <span>รีเซ็ตดันโพสต์</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
