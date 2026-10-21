"use client";

import React, { useState, useEffect } from "react";
import {
  KeyRound,
  Cpu,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Loader2,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import FadeIn from "@/components/ui/fade-in";
import { useToast } from "@/components/ui/toast";
import { useControllerStore } from "@/store/controllerStore";

export default function HelpSettingController() {
  const toast = useToast();
  const {
    keyCode,
    isConnected,
    isProgramOnline,
    keyDetails,
    fetchKeyDetails,
    resetHwid,
    disconnectKey,
  } = useControllerStore();

  const [copiedHwid, setCopiedHwid] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isResettingHwid, setIsResettingHwid] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (keyCode && !keyDetails) {
      void fetchKeyDetails();
    }
  }, [keyCode, keyDetails, fetchKeyDetails]);

  const hwid = keyDetails?.hwid || "ยังไม่พบข้อมูล HWID";

  const handleCopyHwid = () => {
    if (!keyDetails?.hwid) return;
    void navigator.clipboard.writeText(keyDetails.hwid);
    setCopiedHwid(true);
    toast.success("คัดลอกรหัส HWID ประจำเครื่องลงในคลิปบอร์ดเรียบร้อยแล้ว");
    setTimeout(() => setCopiedHwid(false), 2000);
  };

  const handleCopyKey = () => {
    if (!keyCode) return;
    void navigator.clipboard.writeText(keyCode);
    setCopiedKey(true);
    toast.success("คัดลอกรหัส License Key ลงในคลิปบอร์ดเรียบร้อยแล้ว");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleResetHwid = async () => {
    if (!keyCode) {
      toast.error("ไม่พบรหัส License Key สำหรับการรีเซ็ต HWID");
      return;
    }

    const confirmed = await toast.confirm({
      title: "ยืนยันการรีเซ็ต HWID",
      message: `คุณต้องการรีเซ็ตการผูก Hardware ID สำหรับคีย์ "${keyCode}" หรือไม่? หลังจากรีเซ็ต ระบบจะปลดการผูกเครื่องเพื่อให้คุณนำคีย์ไปเปิดใช้งานบนเครื่องใหม่ได้ทันที (สามารถทำได้วันละ 1 ครั้ง)`,
      confirmText: "ยืนยันรีเซ็ต HWID",
      cancelText: "ยกเลิก",
      type: "warning",
    });

    if (!confirmed) return;

    setIsResettingHwid(true);
    try {
      const res = await resetHwid();
      if (res.success) {
        toast.success(
          res.message || "รีเซ็ต HWID สำเร็จ สามารถนำคีย์ไปเปิดใช้งานบนเครื่องใหม่ได้ทันที",
          "รีเซ็ต HWID สำเร็จ"
        );
        await fetchKeyDetails();
      } else {
        toast.error(res.error || "ไม่สามารถรีเซ็ต HWID ได้", "รีเซ็ต HWID ล้มเหลว");
      }
    } finally {
      setIsResettingHwid(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await toast.confirm({
      title: "ยืนยันการออกจากระบบ",
      message:
        "คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ? ข้อมูล License Key จะถูกตัดการเชื่อมต่อ และต้องกรอกใหม่อีกครั้งเพื่อเข้าถึงระบบ",
      confirmText: "ออกจากระบบ",
      cancelText: "ยกเลิก",
      type: "danger",
    });

    if (!confirmed) return;

    setIsLoggingOut(true);
    try {
      disconnectKey();
      toast.info("ตัดการเชื่อมต่อ License Key เรียบร้อยแล้ว", "ออกจากระบบสำเร็จ");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getExpirationText = () => {
    if (!isConnected || !keyCode) return "ยังไม่ได้เชื่อมต่อ License Key";
    if (keyDetails?.remainingDays !== undefined) {
      if (keyDetails.remainingDays < 0) return "คีย์หมดอายุการใช้งานแล้ว";
      if (keyDetails.remainingDays === 0) return "จะหมดอายุภายในวันนี้";
      const expDate = keyDetails.expiresAt
        ? new Date(keyDetails.expiresAt).toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : null;
      return `คงเหลือ ${keyDetails.remainingDays} วัน ${expDate ? `(หมดอายุ ${expDate})` : ""}`;
    }
    return "สิทธิ์การใช้งานตลอดชีพ (Lifetime) หรือไม่มีกำหนด";
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

        {/* Content */}
        <div className="relative z-10">
          {/* Header Section */}
          <div className="pb-4 border-b border-white/[0.08]">
            <h3 className="text-base text-sky-400 tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)]">
              ช่วยเหลือและสิทธิ์การใช้งาน
            </h3>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              จัดการสิทธิ์การใช้งาน License Key และ Hardware ID (HWID) ของเครื่องนี้
            </p>
          </div>

          {/* Rows List (3D Neu-tactile cards) */}
          <div className="mt-4 space-y-2.5">
            {/* 1. HWID Row */}
            <div
              className="
                group/row relative
                overflow-hidden
                flex flex-col sm:flex-row sm:items-center justify-between gap-3
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                  <Cpu size={18} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-neutral-100 tracking-tight">
                    Hardware ID
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400 leading-relaxed">
                    รหัสประจำเครื่องคอมพิวเตอร์ สำหรับลงทะเบียนและผูกสิทธิ์ใช้งาน
                  </p>
                </div>
              </div>

              {/* Display & Copy */}
              <div className="self-end sm:self-auto shrink-0 flex items-center gap-2 w-full sm:w-auto">
                <div className="flex h-9 items-center rounded-xl border border-white/[0.1] bg-neutral-900/90 px-3 font-mono text-xs text-neutral-300 select-all max-w-[220px] truncate shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
                  {hwid}
                </div>
                {keyDetails?.hwid && (
                  <button
                    type="button"
                    onClick={handleCopyHwid}
                    title="คัดลอกรหัส HWID"
                    className="
                      flex h-9 items-center gap-1.5 px-3.5 rounded-xl
                      border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] active:scale-95
                      text-neutral-200 hover:text-white text-xs font-medium transition-all
                      cursor-pointer shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
                    "
                  >
                    {copiedHwid ? (
                      <>
                        <Check size={13} className="text-emerald-400 shrink-0" />
                        <span className="text-emerald-400">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} className="text-neutral-400 shrink-0" />
                        <span>คัดลอก</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* 2. License Key Row */}
            <div
              className="
                group/row relative
                overflow-hidden
                flex flex-col sm:flex-row sm:items-center justify-between gap-3
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                  <KeyRound size={18} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <p className="text-sm text-neutral-100 tracking-tight">
                      License Key
                    </p>
                    {isConnected && keyCode ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
                        <ShieldCheck size={11} />
                        <span>{isProgramOnline ? "ACTIVE" : "STANDBY"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-rose-500/15 border border-rose-500/30 text-rose-300 shrink-0">
                        <ShieldAlert size={11} />
                        <span>INACTIVE</span>
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-400 leading-relaxed">
                    {getExpirationText()}
                  </p>
                </div>
              </div>

              {/* Display & Copy / Connect */}
              <div className="self-end sm:self-auto shrink-0 flex items-center gap-2 w-full sm:w-auto">
                {isConnected && keyCode ? (
                  <>
                    <div className="flex h-9 items-center rounded-xl border border-white/[0.1] bg-neutral-900/90 px-3 font-mono text-xs text-amber-200 tracking-wider select-all max-w-[220px] truncate shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
                      {keyCode}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      title="คัดลอกรหัส License Key"
                      className="
                        flex h-9 items-center gap-1.5 px-3.5 rounded-xl
                        border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] active:scale-95
                        text-neutral-200 hover:text-white text-xs font-medium transition-all
                        cursor-pointer shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
                      "
                    >
                      {copiedKey ? (
                        <>
                          <Check size={13} className="text-emerald-400 shrink-0" />
                          <span className="text-emerald-400">คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} className="text-neutral-400 shrink-0" />
                          <span>คัดลอก</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/controller"
                    className="
                      flex h-9 items-center gap-1.5 px-3.5 rounded-xl
                      border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 active:scale-95
                      text-sky-300 hover:text-sky-200 text-xs font-medium transition-all
                      cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.2)]
                    "
                  >
                    <span>เชื่อมต่อคีย์</span>
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            </div>

            {/* 3. Actions Row (Reset HWID & Logout) */}
            {isConnected && keyCode && (
              <div
                className="
                  group/row relative
                  overflow-hidden
                  flex flex-col sm:flex-row sm:items-center justify-between gap-3
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/25 bg-sky-500/10 text-sky-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                    <RefreshCw size={18} strokeWidth={2} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm text-neutral-100 tracking-tight">
                      การจัดการสิทธิ์
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-400 leading-relaxed">
                      รีเซ็ตการผูกสิทธิ์สำหรับย้ายเครื่อง หรือออกจากระบบเพื่อเปลี่ยนคีย์
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="self-end sm:self-auto shrink-0 flex items-center gap-2.5 w-full sm:w-auto">
                  {/* ปุ่ม Reset HWID */}
                  <button
                    type="button"
                    onClick={handleResetHwid}
                    disabled={isResettingHwid}
                    title="รีเซ็ตการผูกสิทธิ์ Hardware ID เพื่อย้ายไปใช้งานบนเครื่องใหม่"
                    className="
                      flex h-9 items-center justify-center gap-1.5 px-3.5 rounded-xl
                      border border-amber-500/35 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95
                      text-amber-300 hover:text-amber-200 text-xs font-medium transition-all
                      cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                      shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
                    "
                  >
                    {isResettingHwid ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-amber-400 shrink-0" />
                        <span className="truncate">กำลังรีเซ็ต...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={13} className="shrink-0" />
                        <span className="truncate">รีเซ็ต HWID</span>
                      </>
                    )}
                  </button>

                  {/* ปุ่ม Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    title="ออกจากระบบ และตัดการเชื่อมต่อ License Key"
                    className="
                      flex h-9 items-center justify-center gap-1.5 px-3.5 rounded-xl
                      border border-rose-500/35 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95
                      text-rose-300 hover:text-rose-200 text-xs font-medium transition-all
                      cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                      shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
                    "
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-rose-400 shrink-0" />
                        <span className="truncate">กำลังออกจากระบบ...</span>
                      </>
                    ) : (
                      <>
                        <LogOut size={13} className="shrink-0" />
                        <span className="truncate">ออกจากระบบ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
