"use client";

import {
  Layers,
  CheckCircle2,
  XCircle,
  Send,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import { type ControllerAccountStats } from "@/store/controllerStore";

interface StatsAccManageControllerProps {
  stats: ControllerAccountStats;
}

export default function StatsAccManageController({
  stats,
}: StatsAccManageControllerProps) {
  const boxes = [
    {
      label: "ทั้งหมด",
      value: (stats.total || 0).toLocaleString("th-TH"),
      icon: Layers,
      iconColor: "text-blue-500",
    },
    {
      label: "สำเร็จ",
      value: (stats.success || 0).toLocaleString("th-TH"),
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
    },
    {
      label: "ผิดพลาด",
      value: (stats.failed || 0).toLocaleString("th-TH"),
      icon: XCircle,
      iconColor: "text-red-500",
    },
    {
      label: "โพสต์",
      value: (stats.post || 0).toLocaleString("th-TH"),
      icon: Send,
      iconColor: "text-blue-400",
    },
    {
      label: "คอมเมนต์",
      value: (stats.comment || 0).toLocaleString("th-TH"),
      icon: MessageSquare,
      iconColor: "text-cyan-500",
    },
    {
      label: "แสดงความรู้สึก",
      value: (stats.reaction || 0).toLocaleString("th-TH"),
      icon: ThumbsUp,
      iconColor: "text-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {boxes.map((box) => {
        const Icon = box.icon;

        return (
          <div
            key={box.label}
            className="group relative overflow-hidden rounded-sm border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 transition hover:border-neutral-700/80"
          >
            {/* Content Layer */}
            <div className="relative z-10">
              <span className="block truncate text-[10px] font-medium leading-tight text-neutral-400">
                {box.label}
              </span>

              <h4 className="mt-0.5 text-xs font-bold tracking-tight text-white sm:text-sm">
                {box.value}
              </h4>
            </div>

            {/* Background Icon at bottom right */}
            <div
              className={`pointer-events-none absolute -bottom-1.5 -right-1.5 opacity-15 transition-transform duration-300 ${box.iconColor}`}
            >
              <Icon size={34} strokeWidth={1.5} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
