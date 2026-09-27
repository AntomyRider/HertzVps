"use client";

import {
  Copy,
  Check,
  AlertCircle,
  Share2,
  MessageSquare,
  Heart,
  Users,
  Clock,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useProgramOverviewStore } from "@/store/programOverviewStore";

const ACTION_ICONS = {
  POST: Share2,
  COMMENT: MessageSquare,
  REACTION: Heart,
};

export default function ProgramDetailDialog() {
  const {
    selectedKeyHealth,
    setSelectedKeyHealth,
    isDetailOpen,
    setIsDetailOpen,
  } = useProgramOverviewStore();

  const [isCopied, setIsCopied] = useState(false);

  if (!selectedKeyHealth) return null;

  const k = selectedKeyHealth;

  const handleCopy = () => {
    navigator.clipboard.writeText(k.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClose = () => {
    setIsDetailOpen(false);
    setSelectedKeyHealth(null);
  };

  return (
    <Dialog open={isDetailOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent maxWidth="max-w-2xl" onClose={handleClose}>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-white">
                {k.code}
              </span>
              <button
                onClick={handleCopy}
                className="text-neutral-500 transition hover:text-white"
                title="คัดลอกรหัสคีย์"
              >
                {isCopied ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
            <p className="mt-1 font-mono text-xs text-neutral-500">
              {k.hwid ? `HWID: ${k.hwid}` : "ยังไม่ผูก Hardware ID"}
            </p>
          </div>

          <div>
            {k.isOnline ? (
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                กำลังออนไลน์
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-sm border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs font-medium text-neutral-400">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-600" />
                ออฟไลน์
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-5">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-sm border border-neutral-800 bg-neutral-900/40 p-3">
              <span className="text-[11px] text-neutral-400">Success Rate</span>
              <div
                className={`mt-1 text-lg font-bold ${
                  k.successRate >= 90
                    ? "text-emerald-400"
                    : k.successRate >= 70
                    ? "text-amber-400"
                    : "text-rose-400"
                }`}
              >
                {k.successRate}%
              </div>
            </div>

            <div className="rounded-sm border border-neutral-800 bg-neutral-900/40 p-3">
              <span className="text-[11px] text-neutral-400">งานสำเร็จ</span>
              <div className="mt-1 text-lg font-bold text-white">
                {k.stats.success.toLocaleString()}
              </div>
            </div>

            <div className="rounded-sm border border-neutral-800 bg-neutral-900/40 p-3">
              <span className="text-[11px] text-neutral-400">งานล้มเหลว</span>
              <div
                className={`mt-1 text-lg font-bold ${
                  k.stats.failed > 0 ? "text-rose-400" : "text-neutral-400"
                }`}
              >
                {k.stats.failed.toLocaleString()}
              </div>
            </div>

            <div className="rounded-sm border border-neutral-800 bg-neutral-900/40 p-3">
              <span className="text-[11px] text-neutral-400">บัญชีที่กำลังรัน</span>
              <div className="mt-1 text-lg font-bold text-white">
                {k.accountCount} บัญชี
              </div>
            </div>
          </div>

          {/* Breakdown Per Action */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-300">
              ประสิทธิภาพรายฟังก์ชัน
            </h4>
            <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {(["POST", "COMMENT", "REACTION"] as const).map((act) => {
                const item = k.actions[act];
                const Icon = ACTION_ICONS[act];
                return (
                  <div
                    key={act}
                    className="rounded-sm border border-neutral-800/80 bg-neutral-900/30 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icon size={14} className="text-neutral-400" />
                        <span className="text-xs font-medium text-white">
                          {item.label}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          item.successRate >= 90
                            ? "text-emerald-400"
                            : item.successRate >= 70
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {item.successRate}%
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
                      <span>ผ่าน: {item.success}</span>
                      <span
                        className={item.failed > 0 ? "text-rose-400 font-medium" : ""}
                      >
                        ตก: {item.failed}
                      </span>
                    </div>

                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-sm bg-neutral-900">
                      <div
                        className={`h-full rounded-sm ${
                          item.successRate >= 80 ? "bg-blue-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${item.successRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Error Logs */}
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-neutral-300">
                รายการข้อผิดพลาดล่าสุด (Error Logs)
              </h4>
              <span className="text-[11px] text-neutral-500">
                {k.recentErrors.length} รายการล่าสุด
              </span>
            </div>

            <div className="mt-2.5 overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900/30">
              {k.recentErrors.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  ไม่พบข้อผิดพลาดล่าสุดในเซสชันนี้
                </div>
              ) : (
                <div className="max-h-48 divide-y divide-neutral-800/60 overflow-y-auto">
                  {k.recentErrors.map((err) => (
                    <div
                      key={err.id}
                      className="flex flex-col gap-1 p-2.5 text-xs transition hover:bg-neutral-900/60"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded-sm border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400">
                            {err.action}
                          </span>
                          <span className="font-medium text-white">
                            {err.accountName || "System"}
                          </span>
                          {err.groupName && (
                            <span className="text-[11px] text-neutral-500">
                              (กลุ่ม: {err.groupName})
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-neutral-500">
                          {err.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-300/90 pl-1">
                        {err.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-neutral-800 pt-4">
          <button
            onClick={handleClose}
            className="rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
