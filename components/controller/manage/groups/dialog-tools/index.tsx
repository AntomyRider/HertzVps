"use client";

import React from "react";
import {
  Wrench,
  X,
  Users,
  ClockAlert,
  ChevronRight,
  Copy,
  UserPlus,
  Flag,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import ButtonUI from "@/components/ui/button";

export interface ToolItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  borderColor: string;
  hoverBorder: string;
}

export interface ToolsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  accountId?: string;
  onSelectTool?: (toolId: string) => void;
}

export const TOOLS: ToolItem[] = [
  {
    id: "search-join-groups",
    title: "เข้าร่วมกลุ่มอัตโนมัติ",
    description:
      "ค้นหากลุ่ม Facebook ตามคำค้นหา (Keyword) หรือ Search URL และสั่งเข้าร่วมกลุ่มพร้อมตอบคำถามอัตโนมัติ",
    icon: UserPlus,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    borderColor: "border-emerald-500/25",
    hoverBorder: "hover:border-emerald-500/40 hover:bg-emerald-500/[0.03]",
  },
  {
    id: "batch-copy-groups",
    title: "คัดลอกกลุ่ม",
    description:
      "คัดลอกกลุ่มโพสต์แบบเดี่ยวหรือเลือกหลายกลุ่มพร้อมกัน ไปยังบัญชีปัจจุบันหรือคัดลอกข้ามไปยังบัญชีอื่น",
    icon: Copy,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10",
    borderColor: "border-violet-500/25",
    hoverBorder: "hover:border-violet-500/40 hover:bg-violet-500/[0.03]",
  },
  {
    id: "scan-joined-groups",
    title: "ค้นหากลุ่มที่เข้าร่วมแล้ว",
    description:
      "สแกนและดึงรายชื่อกลุ่ม Facebook ทั้งหมดที่บัญชีนี้เป็นสมาชิกอยู่ เพื่อนำเข้าสู่ระบบอัตโนมัติ",
    icon: Users,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    borderColor: "border-cyan-500/25",
    hoverBorder: "hover:border-cyan-500/40 hover:bg-cyan-500/[0.03]",
  },
  {
    id: "delete-pending-groups",
    title: "ลบกลุ่มที่ติดอนุมัติ",
    description:
      "ตรวจสอบและลบลิงก์กลุ่มที่โพสต์แล้วขึ้นสถานะรออนุมัติ (Pending) หรือติดแอดมินออกจากระบบ",
    icon: ClockAlert,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    borderColor: "border-amber-500/25",
    hoverBorder: "hover:border-amber-500/40 hover:bg-amber-500/[0.03]",
  },
  {
    id: "import-fanpage",
    title: "ดึงบัญชีเพจ",
    description:
      "สแกนเพจ Facebook ทั้งหมดที่บัญชีนี้ดูแลอยู่ และนำเข้าเป็นบัญชีแยกเพื่อใช้โพสต์กลุ่มในนามเพจ",
    icon: Flag,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    borderColor: "border-blue-500/25",
    hoverBorder: "hover:border-blue-500/40 hover:bg-blue-500/[0.03]",
  },
];

export default function ToolsDialog({
  isOpen,
  onClose,
  accountId,
  onSelectTool,
}: ToolsDialogProps) {
  const handleToolClick = (tool: ToolItem) => {
    if (onSelectTool) {
      onSelectTool(tool.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tools-dialog-title"
        className="
          relative z-10 flex w-full max-w-2xl flex-col overflow-hidden
          rounded-2xl border border-white/[0.12]
          bg-neutral-950
          max-h-[85dvh]
          shadow-[0_16px_48px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.12),inset_0_-1px_2px_rgba(0,0,0,0.5)]
          transition-all duration-200 ease-out
        "
      >
        {/* Micro specular highlight at top */}
        <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white/20" />

        {/* Ambient soft glow */}
        <div className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 sm:px-6 sm:py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
              <Wrench className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="tools-dialog-title"
                  className="text-sm sm:text-base text-white tracking-tight"
                >
                  เครื่องมือช่วยเหลือ
                </h2>
              </div>
              <p className="mt-0.5 text-[11px] sm:text-xs text-neutral-400 line-clamp-1 sm:line-clamp-none">
                เลือกเครื่องมือจัดการกลุ่มและฟังก์ชันอัตโนมัติสำหรับบัญชีนี้
              </p>
            </div>
          </div>

          <ButtonUI
            type="button"
            variant="ghost"
            onClick={onClose}
            aria-label="Close dialog"
            className="h-8 w-8 !rounded-lg p-0 text-neutral-400 hover:bg-white/10 hover:text-white transition-all shrink-0"
          >
            <X className="h-5 w-5" />
          </ButtonUI>
        </div>

        {/* Body - Tool Items List in 2-Column Grid */}
        <div className="flex flex-col gap-3.5 p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
          <p className="text-xs text-neutral-400 select-none">
            ฟังก์ชันการทำงานที่พร้อมใช้งาน:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  className={`
                    group relative
                    flex flex-col justify-between gap-3
                    rounded-xl border border-white/[0.08]
                    bg-white/[0.02] p-4
                    shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
                    transition-all duration-200
                    cursor-pointer
                    hover:border-white/[0.2] hover:bg-white/[0.04]
                    active:scale-[0.99]
                    ${tool.hoverBorder}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`
                        flex h-10 w-10 shrink-0 items-center justify-center
                        rounded-xl border ${tool.borderColor} ${tool.iconBg}
                        shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]
                        transition-transform duration-200 group-hover:scale-105
                      `}
                    >
                      <Icon className={`h-5 w-5 ${tool.iconColor}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <h3 className="text-sm text-neutral-100 tracking-tight group-hover:text-white transition-colors">
                          {tool.title}
                        </h3>
                        <ChevronRight className="h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white" />
                      </div>
                      <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-white/[0.08] px-4 py-3 sm:px-6 sm:py-3.5 bg-neutral-900/40 shrink-0">
          <ButtonUI
            type="button"
            variant="secondary"
            onClick={onClose}
            className="px-3.5 py-2 text-xs !rounded-xl !bg-white/5 hover:!bg-white/10 !border-white/10 text-neutral-300 hover:text-white"
          >
            ปิดหน้าต่าง
          </ButtonUI>
        </div>
      </div>
    </Dialog>
  );
}
