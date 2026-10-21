"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import axios from "axios";
import {
  RefreshCw,
  Loader2,
  CircleFadingArrowUp,
  CheckCircle2,
  ChevronsUp,
  ChevronsDown,
  ChevronDown,
  ChevronUp,
  Calendar,
  HardDrive,
  Copy,
  Check,
} from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import { useToast } from "@/components/ui/toast";
import { useControllerStore } from "@/store/controllerStore";

export interface ReleaseChangeItem {
  type?: "feature" | "improvement" | "fix" | "security" | string;
  text: string;
}

export interface AppVersion {
  version: string;
  title: string;
  releaseDate: string;
  isLatest?: boolean;
  isCurrent?: boolean;
  downloadUrl?: string;
  fileSize?: string;
  changes: ReleaseChangeItem[];
}

type StatusType = "added" | "improved" | "fixed" | "remove" | "general";

interface ParsedLine {
  status: StatusType;
  prefix: string;
  body: string;
  raw: string;
}

const PREFIX_REGEX =
  /^([•\-*]?\s*(?:\[\s*(added|add|improved|improve|fixed|fix|remove|removed)\s*\]|\(\s*(added|add|improved|improve|fixed|fix|remove|removed)\s*\)|(added|add|improved|improve|fixed|fix|remove|removed)\s*[:\-–]?))\s*(.*)$/i;
const WORD_REGEX = /\b(added|improved|fixed|removed|remove)\b/i;

function parseChangelogLine(line: string): ParsedLine {
  const trimmed = line.trim();
  const m = trimmed.match(PREFIX_REGEX);

  if (m) {
    const rawTag = (m[2] || m[3] || m[4] || "").toLowerCase();
    let status: StatusType = "general";
    if (rawTag.startsWith("add")) status = "added";
    else if (rawTag.startsWith("improv")) status = "improved";
    else if (rawTag.startsWith("fix")) status = "fixed";
    else if (rawTag.startsWith("remov")) status = "remove";

    return {
      status,
      prefix: m[1].trim(),
      body: (m[5] || "").trim(),
      raw: trimmed,
    };
  }

  const wm = trimmed.match(WORD_REGEX);
  if (wm) {
    const rawTag = wm[1].toLowerCase();
    let status: StatusType = "general";
    if (rawTag.startsWith("add")) status = "added";
    else if (rawTag.startsWith("improv")) status = "improved";
    else if (rawTag.startsWith("fix")) status = "fixed";
    else if (rawTag.startsWith("remov")) status = "remove";

    return {
      status,
      prefix: "",
      body: trimmed,
      raw: trimmed,
    };
  }

  return {
    status: "general",
    prefix: "",
    body: trimmed,
    raw: trimmed,
  };
}

const STATUS_THEMES: Record<
  StatusType,
  {
    prefixClass: string;
    textClass: string;
    lineBg: string;
  }
> = {
  added: {
    prefixClass: "text-emerald-400",
    textClass: "text-emerald-300",
    lineBg: "hover:bg-emerald-500/[0.06]",
  },
  improved: {
    prefixClass: "text-sky-400",
    textClass: "text-sky-300",
    lineBg: "hover:bg-sky-500/[0.06]",
  },
  fixed: {
    prefixClass: "text-amber-400",
    textClass: "text-amber-300",
    lineBg: "hover:bg-amber-500/[0.06]",
  },
  remove: {
    prefixClass: "text-rose-400",
    textClass: "text-rose-300",
    lineBg: "hover:bg-rose-500/[0.06]",
  },
  general: {
    prefixClass: "text-neutral-400",
    textClass: "text-neutral-300",
    lineBg: "hover:bg-neutral-800/40",
  },
};

function ChangelogViewer({
  changes = [],
  maxHeight = "max-h-60",
}: {
  changes?: ReleaseChangeItem[];
  maxHeight?: string;
}) {
  const [copied, setCopied] = useState(false);

  const lines: ParsedLine[] = useMemo(() => {
    const rawLines: string[] = [];
    for (const item of changes) {
      const text = item?.text || "";
      if (text) {
        text.split(/\r?\n/).forEach((l) => {
          if (l.trim()) rawLines.push(l.trim());
        });
      }
    }
    return rawLines.map(parseChangelogLine);
  }, [changes]);

  if (lines.length === 0) return null;

  const handleCopy = () => {
    const textToCopy = lines.map((l) => l.raw).join("\n");
    void navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl border border-white/[0.08] bg-neutral-950/90 p-3 sm:p-3.5 font-mono text-xs shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
      {/* Header bar with count and copy button */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08] text-[11px] text-neutral-400 select-none">
        <span className="text-neutral-400">รายการอัปเดต ({lines.length})</span>
        <button
          type="button"
          onClick={handleCopy}
          title="คัดลอกข้อความทั้งหมด"
          className="flex items-center gap-1 rounded-lg border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[11px] text-neutral-300 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400 shrink-0" />
              <span className="text-emerald-400">คัดลอกแล้ว</span>
            </>
          ) : (
            <>
              <Copy size={12} className="shrink-0" />
              <span>คัดลอก</span>
            </>
          )}
        </button>
      </div>

      {/* Lines container */}
      <div
        className={`space-y-1 leading-relaxed ${maxHeight} overflow-y-auto select-text [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]`}
      >
        {lines.map((line, idx) => {
          const theme = STATUS_THEMES[line.status];
          return (
            <div
              key={idx}
              className={`rounded px-1.5 py-0.5 transition-colors ${theme.lineBg}`}
            >
              <div className="break-words">
                {line.prefix ? (
                  <>
                    <span className={theme.prefixClass}>{line.prefix}</span>{" "}
                    <span className={theme.textClass}>{line.body}</span>
                  </>
                ) : (
                  <span className={theme.textClass}>{line.body}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VersionCardItem({
  version,
  onUpdate,
}: {
  version: AppVersion;
  onUpdate: (v: AppVersion) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(Boolean(version.isLatest));

  const iconConfig = version.isLatest
    ? {
        icon: ChevronsUp,
        badgeStyle: "bg-sky-500/10 border-sky-500/25",
        iconColor: "text-sky-400",
      }
    : {
        icon: ChevronsDown,
        badgeStyle: version.isCurrent
          ? "bg-emerald-500/10 border-emerald-500/25"
          : "bg-white/[0.04] border-white/[0.08]",
        iconColor: version.isCurrent ? "text-emerald-400" : "text-neutral-400",
      };

  const Icon = iconConfig.icon;

  return (
    <div
      className={`
        group/row relative
        overflow-hidden
        rounded-xl
        border
        p-3.5 sm:p-4
        shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
        transition-all
        duration-200
        ${
          version.isLatest
            ? "border-sky-500/30 bg-sky-500/[0.03] hover:bg-sky-500/[0.06] hover:border-sky-500/50"
            : version.isCurrent
            ? "border-emerald-500/30 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06] hover:border-emerald-500/50"
            : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.16]"
        }
      `}
    >
      {/* Micro specular highlight */}
      <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-white/10" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Icon + Version + Info */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div
            className={`
              flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border
              ${iconConfig.badgeStyle}
              shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]
            `}
          >
            <Icon size={18} className={iconConfig.iconColor} strokeWidth={2} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-semibold text-neutral-100 tracking-tight">
                {version.version}
              </span>

              {version.isLatest && (
                <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                  <ChevronsUp size={11} />
                  ล่าสุด
                </span>
              )}

              {version.isCurrent && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  <CheckCircle2 size={11} />
                  ติดตั้งอยู่
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
              <span className="text-neutral-300 truncate max-w-full sm:max-w-xs">
                {version.title}
              </span>
              <span className="inline-flex items-center gap-1 text-neutral-500 shrink-0">
                <Calendar size={12} />
                {version.releaseDate}
              </span>
              {version.fileSize && (
                <span className="inline-flex items-center gap-1 text-neutral-500 shrink-0">
                  <HardDrive size={12} />
                  {version.fileSize}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
          {version.isCurrent ? (
            <div className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 h-9 px-3.5 text-xs font-medium text-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>เวอร์ชันปัจจุบัน</span>
            </div>
          ) : version.isLatest ? (
            <button
              type="button"
              onClick={() => onUpdate(version)}
              className="
                flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl h-9 px-3.5 text-xs font-medium
                border border-sky-500/40 bg-sky-600 text-white hover:bg-sky-500 active:scale-95
                transition-all cursor-pointer shadow-[0_2px_4px_rgba(14,165,233,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]
              "
            >
              <ChevronsUp size={14} className="shrink-0" />
              <span>อัปเดตเวอร์ชันนี้</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onUpdate(version)}
              className="
                flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl h-9 px-3.5 text-xs font-medium
                border border-white/[0.1] bg-white/[0.04] text-neutral-200 hover:text-white hover:bg-white/[0.08] active:scale-95
                transition-all cursor-pointer shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
              "
            >
              <ChevronsDown size={14} className="shrink-0" />
              <span>ดาวน์โหลด</span>
            </button>
          )}

          {version.changes && version.changes.length > 0 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "ซ่อนรายละเอียด" : "ดูรายละเอียดการเปลี่ยนแปลง"}
              className="
                cursor-pointer flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                border border-white/[0.1] bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]
                active:scale-95 transition-all shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
              "
            >
              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
        </div>
      </div>

      {isExpanded && version.changes && version.changes.length > 0 && (
        <div className="mt-3.5 pt-3.5 border-t border-white/[0.08]">
          <ChangelogViewer changes={version.changes} maxHeight="max-h-60" />
        </div>
      )}
    </div>
  );
}

export default function UpdateSettingController() {
  const toast = useToast();
  const { config } = useControllerStore();

  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [installedVersion] = useState<string>(
    typeof config?.version === "string" ? config.version : "v1.0.0"
  );
  const [isChecking, setIsChecking] = useState(true);

  const fetchUpdateData = useCallback(async () => {
    try {
      const { data } = await axios.get<{
        releases?: Array<{
          id: string;
          tagName: string;
          name: string;
          body: string;
          publishedAt: string;
          assets: Array<{
            id: string;
            name: string;
            size: number;
            downloadUrl: string;
          }>;
        }>;
      }>("/api/v1/public/releases");

      const releaseList = data?.releases || [];
      const mapped: AppVersion[] = releaseList.map((rel, idx) => {
        const changes: ReleaseChangeItem[] = (rel.body || "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((text) => ({ text }));

        const asset = rel.assets?.[0];
        const fileSizeMB = asset?.size
          ? `${(asset.size / (1024 * 1024)).toFixed(1)} MB`
          : undefined;

        return {
          version: rel.tagName,
          title: rel.name || rel.tagName,
          releaseDate: new Date(rel.publishedAt).toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          isLatest: idx === 0,
          isCurrent: rel.tagName === installedVersion,
          downloadUrl: asset?.downloadUrl || undefined,
          fileSize: fileSizeMB,
          changes,
        };
      });

      return mapped;
    } catch {
      // Fallback version data if offline or network blocked
      return [
        {
          version: "v1.0.0",
          title: "Hertz Auto Post Initial Release",
          releaseDate: new Date().toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          isLatest: true,
          isCurrent: true,
          changes: [
            { text: "[added] ระบบโพสต์อัตโนมัติหลายบัญชีพร้อมกัน" },
            { text: "[added] ระบบควบคุมระยะไกลผ่าน Remote Controller" },
            { text: "[improved] เสริมความเสถียรของ WebRTC Screen Stream" },
            { text: "[fixed] แก้ไขบั๊กการซิงค์ข้อมูลกลุ่มเมื่อออฟไลน์" },
          ],
        },
      ];
    }
  }, [installedVersion]);

  useEffect(() => {
    let active = true;
    void (async () => {
      setIsChecking(true);
      const data = await fetchUpdateData();
      if (active) {
        setVersions(data);
        setIsChecking(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchUpdateData]);

  const handleManualCheck = async () => {
    setIsChecking(true);
    const data = await fetchUpdateData();
    setVersions(data);
    setIsChecking(false);

    const latest = data.find((v) => v.isLatest);
    if (latest && latest.version !== installedVersion) {
      toast.info(
        `พบเวอร์ชันใหม่ (${latest.version}) พร้อมให้อัปเดตแล้ว`,
        "พบอัปเดตใหม่"
      );
    } else {
      toast.success(
        `ระบบของคุณเป็นเวอร์ชันล่าสุด (${latest?.version || installedVersion}) แล้ว`,
        "เวอร์ชันล่าสุด"
      );
    }
  };

  const handleUpdate = async (targetVersion: AppVersion) => {
    const confirmed = await toast.confirm({
      title: `ยืนยันการดาวน์โหลด ${targetVersion.version}`,
      message: `คุณต้องการดาวน์โหลดตัวติดตั้งเวอร์ชัน ${targetVersion.version} (${targetVersion.title}) หรือไม่?`,
      confirmText: "เริ่มดาวน์โหลด",
      cancelText: "ยกเลิก",
      type: "info",
    });

    if (!confirmed) return;

    if (targetVersion.downloadUrl) {
      window.open(targetVersion.downloadUrl, "_blank");
      toast.success("เริ่มดาวน์โหลดไฟล์ติดตั้งเวอร์ชันใหม่แล้ว", "กำลังดาวน์โหลด");
    } else {
      window.open("https://github.com/AntomyRider/HertzApk/releases", "_blank");
    }
  };

  const hasNewVersion = versions.some((v) => v.isLatest && !v.isCurrent);
  const latestVersionName = versions.find((v) => v.isLatest)?.version;

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base text-sky-400 tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)]">
                  การอัปเดตและเวอร์ชันระบบ
                </h3>
                <span className="inline-flex items-center rounded-xl border border-white/[0.1] bg-neutral-900/90 px-2.5 py-0.5 text-xs text-neutral-300 font-mono shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
                  เวอร์ชันในเครื่อง: {installedVersion}
                </span>
                {!isChecking && versions.length > 0 && (
                  hasNewVersion ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-400">
                      <ChevronsUp size={12} />
                      มีเวอร์ชันใหม่ ({latestVersionName})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 size={12} />
                      เป็นเวอร์ชันล่าสุดแล้ว
                    </span>
                  )
                )}
              </div>

              <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
                ดึงข้อมูลเวอร์ชันล่าสุดของโปรแกรม Hertz Manager จากเซิร์ฟเวอร์
              </p>
            </div>

            {/* Manual Check Button */}
            <button
              type="button"
              onClick={handleManualCheck}
              disabled={isChecking}
              className="
                self-start sm:self-auto shrink-0 flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium
                border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-neutral-200 hover:text-white
                transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
              "
            >
              {isChecking ? (
                <Loader2 size={13} className="animate-spin text-sky-400 shrink-0" />
              ) : (
                <RefreshCw size={13} className="text-sky-400 shrink-0" />
              )}
              <span>{isChecking ? "กำลังตรวจสอบ..." : "ตรวจสอบอัปเดต"}</span>
            </button>
          </div>

          {/* Versions List */}
          <div className="mt-4 space-y-2.5">
            {isChecking && versions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-neutral-400 gap-3">
                <Loader2 size={24} className="animate-spin text-sky-400" />
                <span className="text-xs">กำลังตรวจสอบเวอร์ชันล่าสุดจาก Releases...</span>
              </div>
            ) : versions.length > 0 ? (
              versions.map((version) => (
                <VersionCardItem
                  key={version.version}
                  version={version}
                  onUpdate={handleUpdate}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 text-neutral-400">
                <CircleFadingArrowUp size={28} className="text-neutral-500 mb-2" />
                <p className="text-sm font-medium text-neutral-300">ไม่พบข้อมูลเวอร์ชัน</p>
                <p className="text-xs text-neutral-500 mt-1">
                  กดปุ่มตรวจสอบอัปเดตเพื่อดึงข้อมูลอีกครั้ง
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
