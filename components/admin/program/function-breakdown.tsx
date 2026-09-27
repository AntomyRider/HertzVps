"use client";

import { Share2, MessageSquare, Heart } from "lucide-react";
import { useProgramOverviewStore } from "@/store/programOverviewStore";

const ACTION_CONFIG = {
  POST: {
    label: "โพสต์กลุ่ม (POST)",
    desc: "การนำโพสต์หรือแชร์ลิงก์/รูปภาพลงในกลุ่มเป้าหมาย",
    icon: Share2,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    barColor: "bg-blue-500",
  },
  COMMENT: {
    label: "คอมเมนต์ (COMMENT)",
    desc: "การดันโพสต์หรือคอมเมนต์รูปภาพ/ข้อความลงใต้โพสต์",
    icon: MessageSquare,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    barColor: "bg-emerald-500",
  },
  REACTION: {
    label: "กดความรู้สึก (REACTION)",
    desc: "การส่ง Reaction (Like, Love, Wow...) ให้กับโพสต์",
    icon: Heart,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20",
    barColor: "bg-rose-500",
  },
};

export default function ProgramFunctionBreakdown() {
  const { summary } = useProgramOverviewStore();

  if (!summary) return null;

  const { fleetActions } = summary;

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">
          ประสิทธิภาพแยกตามฟังก์ชัน (Function-Level Performance)
        </h3>
        <p className="mt-0.5 text-xs text-neutral-400">
          วิเคราะห์อัตราความสำเร็จ (Success Rate) และข้อผิดพลาดสะสมของแต่ละระบบงาน
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(["POST", "COMMENT", "REACTION"] as const).map((key) => {
          const config = ACTION_CONFIG[key];
          const stat = fleetActions[key];
          const Icon = config.icon;

          const isCritical = stat.failed > 0 && stat.successRate < 70;

          return (
            <div
              key={key}
              className={`flex flex-col justify-between rounded-sm border p-3.5 transition ${
                isCritical
                  ? "border-rose-500/30 bg-rose-500/5"
                  : "border-neutral-800/80 bg-neutral-900/30 hover:border-neutral-700"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-sm border ${config.borderColor} ${config.bgColor} ${config.color}`}
                    >
                      <Icon size={14} strokeWidth={1.8} />
                    </div>
                    <span className="text-xs font-semibold text-white">
                      {config.label}
                    </span>
                  </div>

                  <span
                    className={`rounded-sm px-2 py-0.5 text-xs font-bold ${
                      stat.successRate >= 90
                        ? "bg-emerald-500/10 text-emerald-400"
                        : stat.successRate >= 70
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {stat.successRate}%
                  </span>
                </div>

                <p className="mt-2 line-clamp-1 text-[11px] text-neutral-400">
                  {config.desc}
                </p>

                {/* Mini Progress Bar */}
                <div className="mt-3.5">
                  <div className="flex justify-between text-[11px] text-neutral-400">
                    <span>ความสำเร็จ</span>
                    <span className="text-white font-medium">
                      {stat.success.toLocaleString()} / {stat.total.toLocaleString()} ครั้ง
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-sm bg-neutral-900">
                    <div
                      className={`h-full rounded-sm transition-all duration-500 ${
                        stat.successRate >= 80 ? config.barColor : "bg-rose-500"
                      }`}
                      style={{
                        width: `${stat.total === 0 ? 0 : Math.min(100, Math.max(0, stat.successRate))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer / Failure Counter */}
              <div className="mt-3.5 flex items-center justify-between border-t border-neutral-800/60 pt-2.5 text-[11px]">
                <span className="text-neutral-500">ข้อผิดพลาดที่พบ</span>
                <span
                  className={`font-semibold ${
                    stat.failed > 0 ? "text-rose-400" : "text-neutral-500"
                  }`}
                >
                  {stat.failed > 0
                    ? `${stat.failed.toLocaleString()} ครั้ง`
                    : "0 ครั้ง (ปกติ)"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
