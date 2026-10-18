"use client";

import { MoveRight, Headset } from "lucide-react";
import ButtonUI from "@/components/ui/button";
import FadeIn from "@/components/ui/fade-in";
import BlurTextCycle from "@/components/ui/blur-text-cycle";
import { useAuthStore } from "@/store/authStore";

const HeroHome = () => {
  const { user } = useAuthStore();

  return (
    <section className="relative flex flex-1 min-h-[calc(100vh-8.5rem)] w-full flex-col items-center justify-center overflow-hidden py-12">
      <div className="relative flex w-full max-w-3xl flex-col items-center text-center">
        {/* Center Ambient Blur Light */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 -translate-y-1/2 -z-10 h-40 w-72 rounded-full bg-blue-600/25 blur-3xl sm:h-56 sm:w-[480px] sm:blur-[100px]"
        />

        {/* 1. Main Headline */}
        <FadeIn direction="up" delay={80} duration={550}>
          <h1 className="font-passero-one text-5xl font-normal tracking-wider uppercase sm:text-6xl md:text-8xl bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
            HERTZ MANAGER
          </h1>
        </FadeIn>

        <FadeIn direction="up" delay={220} duration={550} className="mt-2">
          <h2 className="text-lg text-neutral-300 sm:text-xl md:text-2xl">
            <BlurTextCycle
              texts={[
                "ยกระดับงานของคุณด้วยระบบอัตโนมัติ",
                "บริหารทุกบัญชีได้จากศูนย์กลาง",
                "ติดตามสถานะเรียลไทม์ทุกเครื่อง",
                "ควบคุมการทำงานได้อย่างแม่นยำ",
              ]}
              holdDuration={2200}
              letterDuration={420}
              stagger={22}
            />
          </h2>
        </FadeIn>

        {/* 3. Description */}
        <FadeIn
          direction="up"
          delay={360}
          duration={550}
          className="mt-4 flex justify-center"
        >
          <p className="max-w-xs text-sm leading-relaxed text-neutral-500 sm:max-w-xl sm:text-base">
            เปลี่ยนงานที่ต้องทำซ้ำ ให้กลายเป็นระบบอัตโนมัติ บริหารจัดการบัญชี
            ติดตามสถานะการทำงานแบบเรียลไทม์
            และควบคุมทุกเครื่องได้จากศูนย์กลางในที่เดียว
          </p>
        </FadeIn>

        {/* 4. Action Buttons */}
        <FadeIn direction="up" delay={500} duration={550} className="mt-8">
          <div className="flex items-center justify-center gap-3">
            <ButtonUI
              href={user ? "/shop" : "/api/v1/auth/discord"}
              variant="primary"
              rainbowBorder
              className="flex items-center gap-2 text-sm"
            >
              <MoveRight size={16} strokeWidth={1.8} />
              <span>{user ? "เลือกซื้อสินค้า" : "เริ่มต้นใช้งาน"}</span>
            </ButtonUI>

            <ButtonUI
              href="https://discord.gg/jnSMerfV4c"
              variant="outline"
              className="flex items-center gap-2 text-sm"
            >
              <Headset size={16} strokeWidth={1.8} />
              <span>ติดต่อเรา</span>
            </ButtonUI>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default HeroHome;
