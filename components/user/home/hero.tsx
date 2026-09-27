"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MoveRight, Headset } from "lucide-react";
import ButtonUI from "@/components/ui/button";
import FadeIn from "@/components/ui/fade-in";
import HeroPizzaBox from "@/components/user/home/hero-box";
import { useAuthStore } from "@/store/authStore";

const SUBTITLE_TEXT = "Made By NUTX";

const HeroHome = () => {
  const { user } = useAuthStore();
  const [typedText, setTypedText] = useState("");
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let index = 0;
    let isDeleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (!isDeleting) {
        index += 1;
        setTypedText(SUBTITLE_TEXT.slice(0, index));
        if (index === SUBTITLE_TEXT.length) {
          isDeleting = true;
          timeoutId = setTimeout(tick, 2000);
          return;
        }
        timeoutId = setTimeout(tick, 110);
      } else {
        index -= 1;
        setTypedText(SUBTITLE_TEXT.slice(0, index));
        if (index === 0) {
          isDeleting = false;
          timeoutId = setTimeout(tick, 500);
          return;
        }
        timeoutId = setTimeout(tick, 60);
      }
    };

    timeoutId = setTimeout(tick, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const updateScrollTilt = () => {
      const card = cardRef.current;
      if (!card) return;

      const maxScroll = Math.max(280, Math.min(480, window.innerHeight * 0.48));
      const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));

      const rotateX = 24 * (1 - progress);
      const scale = 0.94 + 0.06 * progress;

      card.style.transform = `perspective(1400px) rotateX(${rotateX.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    };

    updateScrollTilt();
    window.addEventListener("scroll", updateScrollTilt, { passive: true });
    window.addEventListener("resize", updateScrollTilt);

    return () => {
      window.removeEventListener("scroll", updateScrollTilt);
      window.removeEventListener("resize", updateScrollTilt);
    };
  }, []);

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-start px-4 pt-[16vh] pb-12 sm:px-6 sm:pt-[20vh] sm:pb-20 lg:pt-[22vh]">
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-12 sm:gap-16">
        {/* Top: Content & CTAs */}
        <FadeIn
          direction="up"
          duration={650}
          className="relative z-10 flex flex-col items-center text-center"
        >
          {/* Blue ambient blur at bottom-left of text */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-8 -left-8 -z-10 h-44 w-56 rounded-md bg-blue-600/25 blur-3xl sm:h-56 sm:w-72"
          />

          <h3 className="inline-flex min-h-[1.5em] items-center uppercase text-blue-500">
            <span>{typedText}</span>
            <span
              aria-hidden="true"
              className="ml-0.5 inline-block h-[1.1em] w-[2px] animate-[cursor-blink_0.8s_step-end_infinite] bg-blue-400"
            />
          </h3>

          <h1 className="animate-[gradient-diagonal-lr_4s_linear_infinite] bg-[linear-gradient(115deg,#1d4ed8_0%,#3b82f6_25%,#dbeafe_50%,#3b82f6_75%,#1d4ed8_100%)] bg-[length:200%_auto] bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl">
            HERTZ MANAGER
          </h1>

          <h2 className="mt-1 sm:text-sm lg:text-xl">
            ยกระดับงานของคุณด้วยระบบอัตรโนมัติ
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-300 sm:text-base md:text-md lg:text-neutral-400">
            เปลี่ยนงานที่ต้องทำซ้ำ ให้กลายเป็นระบบอัตโนมัติ
            บริหารจัดการบัญชี ติดตามสถานะการทำงานแบบเรียลไทม์
            และควบคุมทุกเครื่องได้จากศูนย์กลางในที่เดียว
          </p>

          <div className="mt-7 flex w-full flex-row items-center justify-center gap-3 sm:w-auto">
            <Link
              href={user ? "/shop" : "/api/v1/auth/discord"}
              className="flex-1 sm:flex-initial"
            >
              <ButtonUI className="flex w-full items-center justify-center gap-2 sm:w-auto">
                <MoveRight size={16} />
                <span>{user ? "เลือกซื้อสินค้า" : "เริ่มต้นใช้งาน"}</span>
              </ButtonUI>
            </Link>

            <Link href="/contact" className="flex-1 sm:flex-initial">
              <ButtonUI className="flex w-full items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 sm:w-auto">
                <Headset size={16} />
                <span>ติดต่อเรา</span>
              </ButtonUI>
            </Link>
          </div>
        </FadeIn>

        {/* Bottom: Extra Large Image Preview (/hertz.png) */}
        <FadeIn
          direction="up"
          delay={150}
          duration={650}
          className="relative z-10 flex w-full items-center justify-center"
        >
          <div className="relative flex w-full max-w-7xl items-center justify-center">
            <div
              ref={cardRef}
              style={{
                transform: "perspective(1400px) rotateX(24deg) scale(0.94)",
              }}
              className="relative z-10 w-full origin-top overflow-hidden rounded-md transition-transform duration-150 ease-out will-change-transform"
            >
              {/* 1px laser running ONLY along the top border of the box */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[1px] overflow-hidden bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent"
              >
                <div className="h-full w-2/5 animate-[laser-run_3.2s_linear_infinite] bg-gradient-to-r from-transparent via-blue-500 to-blue-100" />
              </div>

              <div
                style={{
                  maskImage:
                    "linear-gradient(to bottom, black 0%, black 72%, rgba(0, 0, 0, 0.6) 88%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, black 72%, rgba(0, 0, 0, 0.6) 88%, transparent 100%)",
                }}
                className="relative z-10 overflow-hidden rounded-md"
              >
                <HeroPizzaBox />
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default HeroHome;
