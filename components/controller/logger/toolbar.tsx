"use client";

import React, { useState, useMemo } from "react";
import {
  Copy,
  Check,
  Trash2,
  ArrowDownToLine,
} from "lucide-react";
import { useControllerStore } from "@/store/controllerStore";
import { toast } from "@/components/ui/toast";
import ButtonUI from "@/components/ui/button";
import Dropdown, { type DropdownOption } from "@/components/ui/dropdown";
import SearchUI from "@/components/ui/search";
import { cn } from "@/lib/utils";
import type { LogLevelFilter, LogLevel } from "./types";

const Toolbar = () => {
  const {
    logs = [],
    logFilter,
    toggleLogAutoScroll,
    setLogLevelFilter,
    setLogSearchQuery,
    copyLogs,
    clearLogs,
  } = useControllerStore();

  const [copied, setCopied] = useState(false);
  const autoScroll = logFilter?.autoScroll ?? true;
  const levelFilter = logFilter?.level ?? "all";
  const searchQuery = logFilter?.search ?? "";

  // คำนวณ Level ของแต่ละ Log
  const getNormalizedLevel = (l: {
    level?: string;
    status?: string;
    message?: string;
  }): LogLevel => {
    if (l.level) {
      const lv = l.level.toLowerCase();
      if (["info", "success", "warn", "error", "debug"].includes(lv)) {
        return lv as LogLevel;
      }
    }
    if (l.status === "SUCCESS") return "success";
    if (l.status === "FAILED") return "error";
    const msg = (l.message || "").toLowerCase();
    if (msg.includes("เตือน") || msg.includes("warn")) return "warn";
    if (msg.includes("ล้มเหลว") || msg.includes("error")) return "error";
    if (msg.includes("สำเร็จ") || msg.includes("success")) return "success";
    return "info";
  };

  // คำนวณจำนวน Log ของแต่ละ Level สำหรับแสดงตัวเลขใน Dropdown
  const counts = useMemo(() => {
    let info = 0;
    let success = 0;
    let warn = 0;
    let error = 0;
    for (const l of logs) {
      const lv = getNormalizedLevel(l);
      if (lv === "info") info++;
      else if (lv === "success") success++;
      else if (lv === "warn") warn++;
      else if (lv === "error") error++;
    }
    return {
      all: logs.length,
      info,
      success,
      warn,
      error,
    };
  }, [logs]);

  const filterOptions: DropdownOption[] = useMemo(
    () => [
      {
        value: "all",
        label: `ทั้งหมด (${counts.all})`,
        icon: (
          <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0" />
        ),
      },
      {
        value: "info",
        label: `Info (${counts.info})`,
        icon: (
          <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0" />
        ),
      },
      {
        value: "success",
        label: `Success (${counts.success})`,
        icon: (
          <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
        ),
      },
      {
        value: "warn",
        label: `Warn (${counts.warn})`,
        icon: (
          <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
        ),
      },
      {
        value: "error",
        label: `Error (${counts.error})`,
        icon: (
          <span className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
        ),
      },
    ],
    [counts]
  );

  const handleCopy = async () => {
    if (logs.length === 0) {
      toast.info("ไม่มีรายการ Log ให้คัดลอก");
      return;
    }

    const ok = await copyLogs();
    if (ok) {
      setCopied(true);
      toast.success("คัดลอกสำเร็จ", "คัดลอก Log ลง Clipboard เรียบร้อยแล้ว");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("ไม่สามารถคัดลอก Log ได้");
    }
  };

  const handleClear = async () => {
    if (logs.length === 0) {
      toast.info("รายการ Log ว่างเปล่าอยู่แล้ว");
      return;
    }
    const confirmed = await toast.confirm({
      title: "ล้างประวัติ Log ทั้งหมด?",
      message: "ต้องการล้างรายการข้อความ Log ทั้งหมดบนเซิร์ฟเวอร์และตัวโปรแกรมใช่หรือไม่?",
      confirmText: "ล้างประวัติ",
      cancelText: "ยกเลิก",
      type: "danger",
    });
    if (confirmed) {
      await clearLogs();
      toast.success("สำเร็จ", "ล้างประวัติ Log ทั้งหมดเรียบร้อยแล้ว");
    }
  };

  return (
    <div className="flex flex-col gap-2.5 sm:gap-3 border-b border-white/[0.08] pb-3 sm:pb-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Left Group: Search & Filter Components */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1 max-w-full lg:max-w-xl">
        {/* ช่อง Search จาก components/ui/search */}
        <div className="flex-1 min-w-0">
          <SearchUI
            value={searchQuery}
            onChange={(e) => setLogSearchQuery(e.target.value)}
            placeholder="ค้นหาข้อความ Log..."
            className="w-full"
          />
        </div>

        {/* ตัวกรอง Filter โดยใช้ Dropdown จาก components/ui/dropdown ของเว็บไซต์ */}
        <div className="w-full sm:w-[180px] shrink-0">
          <Dropdown
            options={filterOptions}
            value={levelFilter}
            onChange={(val) => setLogLevelFilter(val as LogLevelFilter)}
            placeholder="เลือกระดับ Log..."
            triggerClassName="h-10 text-xs rounded-full bg-neutral-900 border-neutral-800 hover:border-neutral-700 px-3.5"
          />
        </div>
      </div>

      {/* Right Group: Action Controls using ButtonUI from components/ui/button */}
      <div className="flex items-center gap-2 w-full lg:w-auto">
        {/* Auto Scroll Toggle Button */}
        <ButtonUI
          type="button"
          variant={autoScroll ? "primary" : "secondary"}
          onClick={toggleLogAutoScroll}
          title={autoScroll ? "ปิด Auto Scroll" : "เปิด Auto Scroll"}
          className={cn(
            "flex-1 lg:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 text-xs h-10 px-3 sm:px-4 transition cursor-pointer",
            autoScroll
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "border border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white"
          )}
        >
          <ArrowDownToLine
            size={14}
            className={cn(
              "shrink-0",
              autoScroll ? "text-white animate-pulse" : "text-neutral-400"
            )}
          />
          <span className="truncate">
            <span className="inline sm:hidden">เลื่อนล่าง</span>
            <span className="hidden sm:inline">เลื่อนลงล่างสุด</span>
          </span>
          <span
            className={cn(
              "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full shrink-0",
              autoScroll ? "bg-white shadow-[0_0_6px_#ffffff]" : "bg-neutral-500"
            )}
          />
        </ButtonUI>

        {/* Copy Log Button */}
        <ButtonUI
          type="button"
          variant="secondary"
          onClick={handleCopy}
          disabled={logs.length === 0}
          title="คัดลอกข้อความ Log ทั้งหมด"
          className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 text-xs h-10 px-3 sm:px-4 border border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400 shrink-0" />
              <span className="text-emerald-400 truncate">คัดลอกแล้ว</span>
            </>
          ) : (
            <>
              <Copy size={14} className="text-neutral-400 shrink-0" />
              <span className="truncate">คัดลอก</span>
            </>
          )}
        </ButtonUI>

        {/* Clear Log Button */}
        <ButtonUI
          type="button"
          variant="secondary"
          onClick={handleClear}
          disabled={logs.length === 0}
          title="ล้างข้อความ Log ทั้งหมด"
          className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 text-xs h-10 px-3 sm:px-4 border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 size={14} className="shrink-0" />
          <span className="truncate">ลบทั้งหมด</span>
        </ButtonUI>
      </div>
    </div>
  );
};

export default Toolbar;
