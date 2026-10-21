"use client";

import { Percent, TrendingDown, TrendingUp } from "lucide-react";

/**
 * AverageStats — pill เล็กมุมขวาบนของการ์ดสถิติ แสดง trend %/วัน
 */
export const AverageStats = ({ trend }: { trend: number | null }) => {
  if (trend === null) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
        <Percent size={11} strokeWidth={2.5} className="text-neutral-500" />
        <span className=" text-neutral-400">—</span>
      </span>
    );
  }

  const isUp = trend >= 0;
  const TrendIcon = isUp ? TrendingUp : TrendingDown;
  const signed = `${trend > 0 ? "+" : ""}${trend}`;

  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
      <TrendIcon
        size={11}
        strokeWidth={2.5}
        className={isUp ? "text-emerald-400" : "text-red-400"}
      />
      <span
        className={` ${isUp ? "text-emerald-400" : "text-red-400"}`}
      >
        {signed}%<span className="font-normal text-neutral-500">/วัน</span>
      </span>
    </span>
  );
};

const PROPORTION_TONE: Record<string, string> = {
  emerald: "text-emerald-400",
  red: "text-red-400",
  amber: "text-amber-400",
};

/**
 * ProportionStats — pill แสดงสัดส่วน % ของการ์ด
 */
export const ProportionStats = ({
  percent,
  tone = "emerald",
  title,
}: {
  percent: number | null;
  tone?: "emerald" | "red" | "amber";
  title?: string;
}) => {
  const color = PROPORTION_TONE[tone] ?? "text-neutral-400";
  const label = percent === null ? "—" : `${parseFloat(percent.toFixed(1))}%`;

  return (
    <span
      title={title}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-[10px] font-medium text-neutral-400"
    >
      <Percent size={11} strokeWidth={2.5} className={color} />
      <span className={` ${color}`}>{label}</span>
    </span>
  );
};

export default AverageStats;
