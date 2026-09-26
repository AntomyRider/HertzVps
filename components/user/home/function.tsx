"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Workflow,
  ShieldCheck,
  Bot,
  Settings2,
  Headset,
} from "lucide-react";
import FadeIn from "@/components/ui/fade-in";

const AUTO_SLIDE_INTERVAL = 5000;

const features = [
  {
    id: "analytics",
    step: "01",
    tag: "Real-time Analytics",
    icon: BarChart3,
    title: "วิเคราะห์ข้อมูล",
    description:
      "ติดตามข้อมูลและสถิติการทำงานแบบเรียลไทม์ เพื่อช่วยให้คุณเห็นภาพรวมและตัดสินใจได้อย่างแม่นยำยิ่งขึ้น",
  },
  {
    id: "workflow",
    step: "02",
    tag: "Structured Workflow",
    icon: Workflow,
    title: "ทำงานอย่างเป็นระบบ",
    description:
      "จัดการขั้นตอนการทำงานอย่างเป็นระบบ ลดความซับซ้อนในการตั้งค่าและควบคุมทุกบัญชีได้จากที่เดียว",
  },
  {
    id: "security",
    step: "03",
    tag: "Enterprise Security",
    icon: ShieldCheck,
    title: "ปลอดภัยสูงสุด",
    description:
      "ให้ความสำคัญกับความปลอดภัยของข้อมูลและบัญชีของคุณด้วยระบบป้องกันและแยกสภาพแวดล้อมการทำงาน",
  },
  {
    id: "automation",
    step: "04",
    tag: "24/7 Automation",
    icon: Bot,
    title: "ทำงานอัตโนมัติ",
    description:
      "ลดงานที่ต้องทำซ้ำด้วยระบบอัตโนมัติอัจฉริยะ ช่วยประหยัดเวลาและทำงานแทนคุณต่อเนื่องตลอด 24 ชั่วโมง",
  },
  {
    id: "management",
    step: "05",
    tag: "Easy Control",
    icon: Settings2,
    title: "จัดการได้ง่าย",
    description:
      "ตั้งค่าและควบคุมการทำงานได้ง่ายผ่านอินเทอร์เฟซที่ออกแบบมาให้เข้าใจง่าย พร้อมใช้งานได้ทันที",
  },
  {
    id: "support",
    step: "06",
    tag: "Dedicated Support",
    icon: Headset,
    title: "ซัพพอร์ตตลอดการใช้งาน",
    description:
      "พร้อมให้ความช่วยเหลือ แนะนำการตั้งค่า และดูแลการใช้งานตลอดระยะเวลาที่คุณใช้งานระบบของเรา",
  },
];

const FunctionHome = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [activeIndex, isPaused]);

  const prevIndex = (activeIndex - 1 + features.length) % features.length;
  const nextIndex = (activeIndex + 1) % features.length;

  return (
    <section
      className="w-full px-4 sm:px-6 py-12 sm:py-24"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 md:grid-cols-[1.25fr_1fr] md:gap-12">
        {/* Left on Desktop: 3 Vertical (Portrait) Cards Overlapping Relative Showcase */}
        <FadeIn
          direction="right"
          delay={120}
          duration={650}
          className="order-2 w-full md:order-1"
        >
          <div className="relative flex min-h-[350px] sm:min-h-[390px] w-full items-center justify-center">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isCenter = index === activeIndex;
              const isLeft = index === prevIndex;
              const isRight = index === nextIndex;

              let positionClass =
                "pointer-events-none left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 scale-75 opacity-0";

              if (isCenter) {
                positionClass =
                  "left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 scale-100  opacity-100";
              } else if (isLeft) {
                positionClass =
                  "left-0 sm:left-2 top-1/2 z-10 translate-x-0 -translate-y-1/2 scale-[0.84] cursor-pointer border-neutral-800 opacity-35 hover:border-blue-500/30 hover:opacity-70";
              } else if (isRight) {
                positionClass =
                  "left-full sm:left-[calc(100%-0.5rem)] top-1/2 z-10 -translate-x-full -translate-y-1/2 scale-[0.84] cursor-pointer border-neutral-800 opacity-35 hover:border-blue-500/30 hover:opacity-70";
              }

              return (
                <div
                  key={feature.id}
                  onClick={() => {
                    if (!isCenter) setActiveIndex(index);
                  }}
                  className={`absolute flex h-[330px] w-[230px] sm:h-[370px] sm:w-[265px] flex-col justify-between rounded-md border bg-neutral-950 p-6 transition-all duration-500 ease-out ${positionClass}`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
                        <Icon size={22} strokeWidth={1.8} />
                      </div>
                      <span className="rounded-sm border border-neutral-800 bg-neutral-900 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
                        {feature.step}
                      </span>
                    </div>

                    <h3 className="mt-6 text-lg font-bold tracking-tight text-white sm:text-xl">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                      {feature.description}
                    </p>
                  </div>

                  <div className="border-t border-neutral-900 pt-3.5">
                    <span className="text-xs text-neutral-500">
                      {feature.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </FadeIn>

        {/* Right on Desktop: Section Heading & Dynamic Active Feature Text */}
        <FadeIn
          direction="left"
          duration={650}
          className="order-1 md:order-2"
        >
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium text-blue-500 sm:text-sm">
              ทำไมต้องเรา?
            </span>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
              ออกแบบมาเพื่อให้
              <br />
              การทำงานง่ายขึ้น
            </h2>

            <div className="relative mt-5 grid w-full grid-cols-1 items-start border-l-2 border-blue-500/40 pl-4">
              {features.map((feature, index) => {
                const isActive = index === activeIndex;

                return (
                  <div
                    key={feature.id}
                    aria-hidden={!isActive}
                    className={`col-start-1 row-start-1 flex flex-col items-start transition-all duration-500 ease-out ${
                      isActive
                        ? "pointer-events-auto z-10 translate-y-0 opacity-100"
                        : "pointer-events-none z-0 -translate-y-3 select-none opacity-0"
                    }`}
                  >
                    <span
                      className={`text-xs font-medium text-blue-400 transition-all duration-500 ease-out ${
                        isActive
                          ? "translate-y-0 opacity-100"
                          : "translate-y-2 opacity-0"
                      }`}
                    >
                      {feature.step} — {feature.tag}
                    </span>

                    <h3
                      className={`mt-1.5 text-lg font-bold text-white transition-all duration-500 delay-75 ease-out sm:text-xl ${
                        isActive
                          ? "translate-y-0 opacity-100"
                          : "translate-y-3 opacity-0"
                      }`}
                    >
                      {feature.title}
                    </h3>

                    <p
                      className={`mt-2 max-w-md text-sm leading-relaxed text-neutral-400 transition-all duration-500 delay-150 ease-out sm:text-base ${
                        isActive
                          ? "translate-y-0 opacity-100"
                          : "translate-y-4 opacity-0"
                      }`}
                    >
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default FunctionHome;