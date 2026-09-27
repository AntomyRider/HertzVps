"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  Workflow,
  ShieldCheck,
  Bot,
  Settings2,
  Headset,
} from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import { FeaturePreview } from "./function-previews";

const AUTO_SLIDE_INTERVAL = 4500;

interface FeatureItem {
  id: string;
  step: string;
  tag: string;
  icon: typeof BarChart3;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
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

const getCardPositionClass = (diff: number) => {
  switch (diff) {
    case 0:
      return "z-30 scale-100 opacity-100 translate-x-[-50%] translate-y-[-50%] rotate-0 shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)]";
    case -1:
      return "z-20 scale-[0.84] sm:scale-[0.88] opacity-65 sm:opacity-75 translate-x-[calc(-50%-105px)] sm:translate-x-[calc(-50%-180px)] md:translate-x-[calc(-50%-235px)] lg:translate-x-[calc(-50%-270px)] translate-y-[calc(-50%+16px)] sm:translate-y-[calc(-50%+26px)] md:translate-y-[calc(-50%+34px)] -rotate-[6deg] sm:-rotate-[8deg] cursor-pointer";
    case 1:
      return "z-20 scale-[0.84] sm:scale-[0.88] opacity-65 sm:opacity-75 translate-x-[calc(-50%+105px)] sm:translate-x-[calc(-50%+180px)] md:translate-x-[calc(-50%+235px)] lg:translate-x-[calc(-50%+270px)] translate-y-[calc(-50%+16px)] sm:translate-y-[calc(-50%+26px)] md:translate-y-[calc(-50%+34px)] rotate-[6deg] sm:rotate-[8deg] cursor-pointer";
    case -2:
      return "z-10 scale-[0.70] sm:scale-[0.74] opacity-0 sm:opacity-35 pointer-events-none sm:pointer-events-auto translate-x-[calc(-50%-180px)] sm:translate-x-[calc(-50%-330px)] md:translate-x-[calc(-50%-430px)] lg:translate-x-[calc(-50%-490px)] translate-y-[calc(-50%+45px)] sm:translate-y-[calc(-50%+75px)] md:translate-y-[calc(-50%+95px)] -rotate-[12deg] sm:-rotate-[16deg] cursor-pointer";
    case 2:
      return "z-10 scale-[0.70] sm:scale-[0.74] opacity-0 sm:opacity-35 pointer-events-none sm:pointer-events-auto translate-x-[calc(-50%+180px)] sm:translate-x-[calc(-50%+330px)] md:translate-x-[calc(-50%+430px)] lg:translate-x-[calc(-50%+490px)] translate-y-[calc(-50%+45px)] sm:translate-y-[calc(-50%+75px)] md:translate-y-[calc(-50%+95px)] rotate-[12deg] sm:rotate-[16deg] cursor-pointer";
    default:
      return "z-0 scale-50 opacity-0 pointer-events-none translate-x-[-50%] translate-y-[calc(-50%+140px)]";
  }
};

const FunctionHome = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % features.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused, handleNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  const activeFeature = features[activeIndex];

  return (
    <section
      className="relative w-full overflow-hidden py-16 sm:py-24"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Section Heading */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <FadeIn direction="up" duration={650}>
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-medium text-blue-500 sm:text-sm">
              ฟังก์ชันการทำงาน
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
              ออกแบบมาเพื่อให้การทำงานง่ายขึ้น
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">
              ฟังก์ชันครบวงจรที่พร้อมสนับสนุนทุกกระบวนการทำงานของคุณอย่างเป็นระบบ
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Semi-Circle Arc Showcase Arena - Full-width relative container without px */}
      <FadeIn direction="up" delay={120} duration={650} className="w-full">
        <div className="relative mt-8 sm:mt-12 flex h-[340px] sm:h-[380px] md:h-[410px] w-full items-center justify-center">
          {/* Subtle Arc Guide Behind Cards */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[300px] select-none opacity-40 overflow-hidden"
          >
            <svg
              className="h-full w-full text-neutral-800"
              viewBox="0 0 1000 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 50 260 C 250 80, 750 80, 950 260"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="6 6"
              />
            </svg>
          </div>

          {/* Cards arranged in Semi-Circle Arc */}
          {features.map((feature, index) => {
            let diff =
              (index - activeIndex + features.length) % features.length;
            if (diff > features.length / 2) diff -= features.length;

            const isCenter = diff === 0;
            const positionClass = getCardPositionClass(diff);

            return (
              <div
                key={feature.id}
                onClick={() => {
                  if (!isCenter) setActiveIndex(index);
                }}
                className={`absolute left-1/2 top-1/2 flex h-[310px] w-[250px] sm:h-[340px] sm:w-[280px] md:h-[360px] md:w-[310px] flex-col justify-start rounded-md bg-neutral-950 p-4 sm:p-5 transition-all duration-500 ease-out ${positionClass}`}
              >
                {/* Top Header: Step Badge + Tag */}
                <div className="flex items-center justify-between">
                  <span className="rounded-sm border border-neutral-800 bg-neutral-900 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
                    {feature.step}
                  </span>
                  <span className="text-[11px] font-medium text-neutral-400 sm:text-xs">
                    {feature.tag}
                  </span>
                </div>

                {/* Custom Micro-Animation Preview Frame */}
                <div className="mt-3.5 h-[115px] sm:h-[130px] w-full">
                  <FeaturePreview id={feature.id} isActive={isCenter} />
                </div>

                {/* Title */}
                <h3 className="mt-3.5 text-base font-bold tracking-tight text-white sm:text-lg">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-400 sm:text-sm line-clamp-2 sm:line-clamp-3">
                  {feature.description}
                </p>
              </div>
            );
          })}

          {/* Bottom fade overlay spanning 100% full width with zero px padding constraints */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-36 w-full bg-gradient-to-t from-black via-black/85 to-transparent sm:h-44 md:h-52"
          />
        </div>
      </FadeIn>

      {/* Active Feature Spotlight */}
      <FadeIn direction="up" delay={180} duration={650} className="w-full">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mt-8 flex justify-center">
            <div className="max-w-md text-center">
              <span className="text-xs font-semibold text-blue-400">
                {activeFeature.step} — {activeFeature.tag}
              </span>
              <h4 className="mt-1 text-base font-bold text-white sm:text-lg">
                {activeFeature.title}
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-400 sm:text-sm">
                {activeFeature.description}
              </p>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
};

export default FunctionHome;