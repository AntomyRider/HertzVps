"use client";

import React from "react";
import {
  ListChecks,
  CheckCircle2,
  XCircle,
  Send,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import type { ControllerAccountStats } from "@/store/controllerStore";

interface StatsAccWorkerControllerProps {
  stats: ControllerAccountStats;
  className?: string;
}

/**
 * แถบความสำเร็จ (Progress Bar) สไตล์โปรแกรม Hertz Auto Post
 */
const SuccessBar = ({ percent }: { percent: number }) => {
  const width = Math.max(0, Math.min(100, percent));

  return (
    <div className="mt-2 select-none">
      <div className="relative h-3.5 overflow-hidden rounded-full border border-neutral-800 bg-neutral-950">
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out"
          style={{ width: `${width}%` }}
        >
          {/* Specular line */}
          <div className="absolute inset-x-1 top-0.5 h-px rounded-full bg-white/40" />
        </div>

        {/* % Centered */}
        <span className="absolute inset-0 z-10 flex items-center justify-center font-mono text-[9px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {width.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

export default function StatsAccWorkerController({
  stats,
  className = "",
}: StatsAccWorkerControllerProps) {
  const total = stats.total || 0;
  const success = stats.success || 0;
  const successPercent = total > 0 ? (success / total) * 100 : 0;

  const boxes = [
    {
      label: "ทั้งหมด",
      value: (stats.total || 0).toLocaleString("th-TH"),
      icon: ListChecks,
      valueColor: "text-blue-400",
      iconColor: "text-blue-400/15",
    },
    {
      label: "สำเร็จ",
      value: (stats.success || 0).toLocaleString("th-TH"),
      icon: CheckCircle2,
      valueColor: "text-emerald-400",
      iconColor: "text-emerald-400/15",
    },
    {
      label: "ผิดพลาด",
      value: (stats.failed || 0).toLocaleString("th-TH"),
      icon: XCircle,
      valueColor: "text-rose-400",
      iconColor: "text-rose-400/15",
    },
    {
      label: "โพสต์",
      value: (stats.post || 0).toLocaleString("th-TH"),
      icon: Send,
      valueColor: "text-sky-400",
      iconColor: "text-sky-400/15",
    },
    {
      label: "ความรู้สึก",
      value: (stats.reaction || 0).toLocaleString("th-TH"),
      icon: ThumbsUp,
      valueColor: "text-pink-400",
      iconColor: "text-pink-400/15",
    },
    {
      label: "คอมเมนต์",
      value: (stats.comment || 0).toLocaleString("th-TH"),
      icon: MessageSquare,
      valueColor: "text-amber-400",
      iconColor: "text-amber-400/15",
    },
  ];

  return (
    <div className={className}>
      <div className="grid grid-cols-3 gap-1.5">
        {boxes.map((box) => {
          const Icon = box.icon;

          return (
            <div
              key={box.label}
              className="group relative overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 select-none transition-all duration-200 hover:border-neutral-700"
            >
              {/* Content Layer */}
              <div className="relative z-10">
                <span className="block truncate text-[10px] leading-tight text-neutral-400">
                  {box.label}
                </span>

                <h4
                  className={`mt-0.5 text-xs tracking-tight sm:text-sm ${box.valueColor}`}
                >
                  {box.value}
                </h4>
              </div>

              {/* Watermark Icon at bottom right */}
              <div
                className={`pointer-events-none absolute -bottom-1 -right-1 transition-transform duration-300 group-hover:scale-105 ${box.iconColor}`}
              >
                <Icon size={34} strokeWidth={1.5} />
              </div>
            </div>
          );
        })}
      </div>

      {/* แถบ % ความสำเร็จ (Progress bar) */}
      <SuccessBar percent={successPercent} />
    </div>
  );
}
