"use client";

import { Layers, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useControlStore } from "@/store/controlStore";

export const ControlStats = () => {
  const { stats } = useControlStore();

  const items = [
    {
      key: "total",
      label: "ทั้งหมด",
      sublabel: "รายการโพสต์ทั้งหมด",
      value: stats.total,
      icon: Layers,
      iconClass: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    },
    {
      key: "success",
      label: "สำเร็จ",
      sublabel: "โพสต์สำเร็จเรียบร้อย",
      value: stats.success,
      icon: CheckCircle2,
      iconClass: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    },
    {
      key: "failed",
      label: "ผิดพลาด",
      sublabel: "โพสต์ไม่สำเร็จ / พบปัญหา",
      value: stats.failed,
      icon: XCircle,
      iconClass: "border-red-500/20 bg-red-500/10 text-red-400",
    },
    {
      key: "pending",
      label: "ติดอนุมัติ",
      sublabel: "รอแอดมินกลุ่มอนุมัติโพสต์",
      value: stats.pending,
      icon: Clock,
      iconClass: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      {items.map(({ key, label, sublabel, value, icon: Icon, iconClass }) => (
        <div
          key={key}
          className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950 p-4 transition hover:border-neutral-700"
        >
          <div>
            <p className="text-xs font-medium text-neutral-400">{label}</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-white">
              {value.toLocaleString("th-TH")}
            </p>
            <p className="mt-1 text-xs text-neutral-500">{sublabel}</p>
          </div>
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${iconClass}`}
          >
            <Icon size={18} strokeWidth={1.8} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ControlStats;
