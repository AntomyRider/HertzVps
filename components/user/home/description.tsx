"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import FadeIn from "@/components/ui/fade-in";

const AUTO_SLIDE_INTERVAL = 5000;

const slides = [
  {
    id: "manage-accounts",
    badge: "ทำไมต้องโปรแกรมของเรา?",
    title: "จัดการงานของคุณ\nได้ง่ายขึ้นในที่เดียว!",
    description:
      "Hertz Manager ช่วยให้การทำงานของคุณเป็นเรื่องง่าย ด้วยระบบจัดการบัญชี การโพสต์ และการทำงานอัตโนมัติ ที่ออกแบบมาให้ใช้งานได้สะดวกและรวดเร็ว",
    image: "/acc.png",
    alt: "Hertz Manager Account Management",
  },
  {
    id: "realtime-monitor",
    badge: "ควบคุมแบบเรียลไทม์",
    title: "ติดตามสถานะการทำงาน\nครบทุกเครื่องพร้อมกัน",
    description:
      "ตรวจสอบสถานะการเชื่อมต่อ งานที่กำลังรัน และผลลัพธ์การทำงานของแต่ละบัญชีได้แบบเรียลไทม์ พร้อมสั่งการจากศูนย์กลางได้ทันที",
    image: "/hertz.png",
    alt: "Hertz Manager Realtime Dashboard",
  },
  {
    id: "auto-workflow",
    badge: "ระบบอัตโนมัติเต็มรูปแบบ",
    title: "ลดงานที่ต้องทำซ้ำ\nเพิ่มประสิทธิภาพสูงสุด",
    description:
      "ตั้งค่าลำดับการทำงานอัตโนมัติเพียงครั้งเดียวให้ระบบจัดการแทนคุณตลอด 24 ชั่วโมง ช่วยประหยัดเวลาและลดข้อผิดพลาดในการทำงาน",
    image: "/config.png",
    alt: "Hertz Manager Automation Workflow",
  },
];

const DescriptionHome = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [activeIndex, isPaused]);

  const activeSlide = slides[activeIndex];
  const prevIndex = (activeIndex - 1 + slides.length) % slides.length;
  const nextIndex = (activeIndex + 1) % slides.length;

  return (
    <section
      className="w-full px-4 sm:px-6 py-12 sm:py-24"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 md:grid-cols-[1fr_1.35fr] md:gap-10 lg:grid-cols-[1fr_1.45fr] lg:gap-12">
        {/* Left: Dynamic Heading & Description with Smooth Staggered Transition */}
        <FadeIn direction="right" duration={650}>
          <div className="relative grid grid-cols-1 items-center">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;

              return (
                <div
                  key={slide.id}
                  aria-hidden={!isActive}
                  className={`col-start-1 row-start-1 flex flex-col items-start transition-all duration-500 ease-out ${
                    isActive
                      ? "pointer-events-auto z-10 translate-y-0 opacity-100"
                      : "pointer-events-none z-0 -translate-y-3 select-none opacity-0"
                  }`}
                >
                  <span
                    className={`text-xs font-medium text-blue-500 transition-all duration-500 ease-out sm:text-sm ${
                      isActive
                        ? "translate-y-0 opacity-100"
                        : "translate-y-2 opacity-0"
                    }`}
                  >
                    {slide.badge}
                  </span>

                  <h2
                    className={`mt-3 whitespace-pre-line text-2xl font-bold tracking-tight text-white transition-all duration-500 delay-75 ease-out sm:text-3xl md:text-4xl ${
                      isActive
                        ? "translate-y-0 opacity-100"
                        : "translate-y-3 opacity-0"
                    }`}
                  >
                    {slide.title}
                  </h2>

                  <p
                    className={`mt-4 max-w-xl text-sm leading-relaxed text-neutral-400 transition-all duration-500 delay-150 ease-out sm:mt-5 sm:text-base md:text-lg ${
                      isActive
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                  >
                    {slide.description}
                  </p>
                </div>
              );
            })}
          </div>
        </FadeIn>

        {/* Right: 3-Image Overlapping Relative Showcase (All normal proportions, Left & Right smaller behind Center) */}
        <FadeIn
          direction="left"
          delay={120}
          duration={650}
          className="w-full"
        >
          <div className="relative flex w-full items-center justify-center">
            {/* Relative sizing spacer so container height matches the center image's natural 640x360 aspect ratio */}
            <div
              aria-hidden="true"
              className="pointer-events-none invisible relative w-[74%] sm:w-[76%]"
            >
              <Image
                src={activeSlide.image}
                alt=""
                width={640}
                height={360}
                className="h-auto w-full"
              />
            </div>

            {slides.map((slide, index) => {
              const isCenter = index === activeIndex;
              const isLeft = index === prevIndex;
              const isRight = index === nextIndex;

              let positionClass =
                "pointer-events-none left-1/2 top-1/2 z-0 w-[50%] -translate-x-1/2 -translate-y-1/2 opacity-0";

              if (isCenter) {
                positionClass =
                  "left-1/2 top-1/2 z-20 w-[74%] sm:w-[76%] -translate-x-1/2 -translate-y-1/2 bopacity-100";
              } else if (isLeft) {
                positionClass =
                  "left-0 top-1/2 z-10 w-[56%] sm:w-[58%] translate-x-0 -translate-y-1/2 cursor-pointer border-neutral-800 opacity-35 hover:border-blue-500/30 hover:opacity-70";
              } else if (isRight) {
                positionClass =
                  "left-full top-1/2 z-10 w-[56%] sm:w-[58%] -translate-x-full -translate-y-1/2 cursor-pointer border-neutral-800 opacity-35 hover:border-blue-500/30 hover:opacity-70";
              }

              return (
                <div
                  key={slide.id}
                  onClick={() => {
                    if (!isCenter) setActiveIndex(index);
                  }}
                  className={`absolute overflow-hidden rounded-md border bg-neutral-950 transition-all duration-500 ease-out ${positionClass}`}
                >
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    width={640}
                    height={360}
                    className="h-auto w-full object-cover"
                    priority={isCenter}
                  />
                </div>
              );
            })}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default DescriptionHome;
