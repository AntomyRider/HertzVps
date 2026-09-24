"use client";

import ButtonUI from "@/components/ui/button";
import { MoveRight, Headset } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

const HeroHome = () => {
  const { user } = useAuthStore();

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-6">
      {/* Subtle blue blurred glow */}
      {/* <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="h-72 w-80 rounded-full bg-blue-500/20 blur-[110px] sm:h-96 sm:w-[32rem] sm:blur-[140px] md:w-[42rem]" />
      </div> */}

      <div className="relative z-10 flex flex-col items-center text-center">
        <h1 className="bg-gradient-to-r from-blue-400 via-blue-600 to-zinc-700 bg-clip-text text-3xl sm:text-5xl font-bold tracking-tight text-transparent md:text-6xl lg:text-7xl">
          HERTZ MANAGER
        </h1>

        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-neutral-400 md:text-lg max-w-md sm:max-w-none">
          เปลี่ยนงานที่ต้องทำซ้ำ ให้กลายเป็นระบบอัตโนมัติ
        </p>

        <div className="mt-6 sm:mt-8 flex w-full sm:w-auto flex-col sm:flex-row items-center justify-center gap-3">
          <Link href={user ? "/shop" : "/api/v1/auth/discord"} className="w-full sm:w-auto">
            <ButtonUI className="flex w-full sm:w-auto items-center justify-center gap-2">
              <MoveRight size={16} />
              <span>{user ? "เลือกซื้อสินค้า" : "เริ่มต้นใช้งาน"}</span>
            </ButtonUI>
          </Link>

          <Link href="/contact" className="w-full sm:w-auto">
            <ButtonUI className="flex w-full sm:w-auto items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700">
              <Headset size={16} />
              <span>ติดต่อเรา</span>
            </ButtonUI>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroHome;
