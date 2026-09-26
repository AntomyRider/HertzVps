"use client";

import { useEffect } from "react";
import { Check, MoveRight } from "lucide-react";
import ButtonUI from "@/components/ui/button";
import FadeIn from "@/components/ui/fade-in";
import { usePlanStore, type PlanItem } from "@/store/planStore";

const PlanCard = ({ plan }: { plan: PlanItem }) => {
  const {
    name,
    duration,
    price,
    subtitle,
    badge,
    isHighlighted,
    features,
    href,
  } = plan;

  return (
    <div
      className={`relative flex h-full flex-col justify-between overflow-hidden rounded-md border bg-neutral-950 p-5 sm:p-6 transition ${
        isHighlighted
          ? "border-blue-500/50 hover:border-blue-500"
          : "border-neutral-800 hover:border-neutral-700"
      }`}
    >
      {/* Top Laser Accent on Highlighted Center Card (Premium 30 Days) */}
      {isHighlighted && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px] overflow-hidden bg-blue-500/30"
        >
          <div className="h-full w-1/2 animate-[laser-run_3.4s_linear_infinite] bg-gradient-to-r from-transparent via-blue-400 to-blue-100" />
        </div>
      )}

      <div>
        {/* 1. Top-Left Pack Header: Name, Duration Badge, and Subtitle */}
        <div className="flex flex-col items-start">
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                {name}
              </h3>
              <span className="inline-flex items-center rounded-sm border border-neutral-800 bg-neutral-900 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
                {duration}
              </span>
            </div>

            {badge && (
              <span className="inline-flex items-center rounded-sm bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-500">
                {badge}
              </span>
            )}
          </div>

          <p className="mt-2 text-xs leading-relaxed text-neutral-400 sm:text-sm">
            {subtitle}
          </p>
        </div>

        {/* 2. Price Section Below Pack Header */}
        <div className="mt-5 flex items-baseline gap-1.5 border-y border-neutral-900 py-4">
          <span className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            ฿{price.toLocaleString("th-TH")}
          </span>
          <span className="text-xs text-neutral-400 sm:text-sm">
            / {duration}
          </span>
        </div>

        {/* 3. Features List */}
        <div className="mt-5 space-y-3">
          <span className="block text-xs font-medium text-neutral-400">
            สิ่งที่ได้รับในแพ็กเกจ:
          </span>

          <ul className="space-y-2.5">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2.5 text-xs leading-relaxed text-neutral-300 sm:text-sm"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-blue-500/10 text-blue-500">
                  <Check size={12} strokeWidth={2.2} />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Redirect Buy Button */}
      <div className="mt-7 pt-2">
        <ButtonUI
          href={href}
          className={`flex w-full items-center justify-center gap-2 rounded-sm py-2.5 text-xs font-semibold transition sm:text-sm ${
            isHighlighted
              ? "bg-blue-600 text-white hover:bg-blue-500"
              : "border border-neutral-800 bg-neutral-900 text-white hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
          }`}
        >
          <span>เลือกแพ็กเกจ {name}</span>
          <MoveRight size={15} strokeWidth={1.8} />
        </ButtonUI>
      </div>
    </div>
  );
};

const PlanHome = () => {
  const { plans, fetchPlanRedirects } = usePlanStore();

  useEffect(() => {
    fetchPlanRedirects();
  }, [fetchPlanRedirects]);

  return (
    <section className="w-full px-4 py-12 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <FadeIn direction="up" className="text-center">
          <span className="text-xs font-medium text-blue-500 sm:text-sm">
            แพ็กเกจการใช้งาน
          </span>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            เลือกแพ็กเกจที่เหมาะกับงานของคุณ
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-400 sm:text-base">
            เริ่มต้นใช้งานระบบอัตโนมัติได้ทันทีตามระยะเวลาที่คุณต้องการ
            พร้อมฟังก์ชันครบครันในทุกแพ็กเกจ
          </p>
        </FadeIn>

        {/* 3 Plan Cards: Starter (1 วัน) | Premium (30 วัน) | Pro (7 วัน) */}
        <div className="mt-10 grid grid-cols-1 items-stretch gap-4 sm:mt-12 md:grid-cols-3 md:gap-5">
          {plans.map((plan, index) => (
            <FadeIn
              key={plan.id}
              direction="up"
              delay={index * 80}
              className="h-full"
            >
              <PlanCard plan={plan} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlanHome;
