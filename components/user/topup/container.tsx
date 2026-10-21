"use client";

import { useState } from "react";
import Image from "next/image";
import { Landmark, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { DiscordIcon } from "@/components/user/utils/avatar";
import FadeIn from "@/components/ui/fade-in";
import TrueMoneyForm from "./truemoney-form";
import BankingPlaceholder from "./banking-placeholder";

type MethodTab = "TRUEMONEY" | "BANKING";

const TopupContainer = () => {
  const { user, isLoading, hasLoaded } = useAuthStore();
  const [selectedMethod, setSelectedMethod] = useState<MethodTab | null>("TRUEMONEY");

  // Loading Skeleton State
  if (isLoading && !hasLoaded) {
    return (
      <div className="flex flex-1 w-full items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-4xl lg:max-w-5xl space-y-4">
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start animate-pulse">
            {/* Left selector skeleton */}
            <div className="w-full lg:w-80 shrink-0 space-y-2">
              <div className="h-4 w-32 rounded-sm bg-neutral-900" />
              <div className="rounded-2xl sm:rounded-3xl border border-neutral-800 bg-neutral-950 p-2 sm:p-2.5 space-y-2">
                <div className="h-16 rounded-xl sm:rounded-2xl border border-neutral-800/60 bg-neutral-900/40" />
                <div className="h-16 rounded-xl sm:rounded-2xl border border-neutral-800/60 bg-neutral-900/40" />
              </div>
            </div>

            {/* Right form container skeleton */}
            <div className="flex-1 w-full space-y-2">
              <div className="h-4 w-28 rounded-sm bg-neutral-900" />
              <div className="h-64 rounded-2xl sm:rounded-3xl border border-neutral-800 bg-neutral-900/40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated State: Prompt Discord Login
  if (!user) {
    return (
      <div className="flex flex-1 w-full items-center justify-center px-4 py-12 md:py-16">
        <FadeIn direction="up" className="w-full max-w-lg space-y-6">
          <div className="rounded-2xl sm:rounded-3xl border border-neutral-800 bg-neutral-950 p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
              <Wallet size={26} />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-bold tracking-tight text-white">
                เข้าสู่ระบบก่อนทำรายการเติมเงิน
              </h2>
              <p className="mx-auto max-w-sm text-xs leading-relaxed text-neutral-400">
                คุณจำเป็นต้องเข้าสู่ระบบบัญชี Discord ของคุณ เพื่อให้ระบบสามารถบันทึกประวัติและเพิ่มยอดเงินเข้าสู่กระเป๋าของคุณได้อย่างถูกต้อง
              </p>
            </div>

            <div className="pt-2">
              <a
                href="/api/v1/auth/discord"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-6 py-2.5 text-xs  text-white transition hover:bg-[#4752C4] cursor-pointer"
              >
                <DiscordIcon />
                <span>เข้าสู่ระบบด้วย Discord</span>
              </a>
            </div>

            <p className="pt-2 text-2xs text-neutral-500">
              * ยอดเงินที่เติมจะถูกปรับปรุงเข้าสู่กระเป๋าบัญชีของคุณโดยอัตโนมัติทันที
            </p>
          </div>
        </FadeIn>
      </div>
    );
  }

  // Authenticated State: Method Selection (Left) + Forms (Right)
  return (
    <div className="flex flex-1 w-full items-center justify-center px-4">
      <div className="w-full max-w-4xl lg:max-w-5xl">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">
          {/* Left Column: กล่องสำหรับเลือกช่องทางการเติมเงิน (Select Method Box) */}
          <div className="w-full lg:w-80 shrink-0 space-y-2.5">
            <FadeIn direction="up">
              <p className="text-xs  text-neutral-400">
                เลือกช่องทางการเติมเงิน
              </p>
            </FadeIn>

            <FadeIn direction="up" delay={50}>
              <div className="rounded-2xl sm:rounded-3xl border border-neutral-800 bg-neutral-950 p-2 sm:p-2.5 space-y-2">
                {/* TrueMoney Tab */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod("TRUEMONEY")}
                  className={cn(
                    "flex w-full items-center gap-3.5 rounded-xl sm:rounded-2xl p-3 sm:py-1.5 sm:px-4 text-left transition cursor-pointer select-none",
                    selectedMethod === "TRUEMONEY"
                      ? " bg-neutral-800 text-white shadow-sm"
                      : " text-neutral-400 hover:bg-neutral-900/60 hover:text-white"
                  )}
                >
                  <div
                    className={cn(
                      "relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl p-2 transition",
                      selectedMethod === "TRUEMONEY"
                        ? "bg-neutral-900 border border-neutral-700"
                        : "bg-neutral-900 border border-neutral-800"
                    )}
                  >
                    <Image
                      src="/truemoney.png"
                      alt="TrueMoney"
                      width={28}
                      height={28}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm  tracking-tight text-white">
                        TRUEMONEY
                      </span>

                    </div>
                    <p className="mt-0.5 text-xs text-neutral-400 leading-relaxed">
                      เติมเงินทันทีด้วยซองของขวัญ
                    </p>
                  </div>
                </button>

                {/* Banking Tab */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod("BANKING")}
                  className={cn(
                    "flex w-full items-center gap-3.5 rounded-xl sm:rounded-2xl p-3 sm:py-1.5 sm:px-4 text-left transition cursor-pointer select-none",
                    selectedMethod === "BANKING"
                      ? " bg-neutral-800 text-white shadow-sm"
                      : " text-neutral-400 hover:bg-neutral-900/60 hover:text-white"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition",
                      selectedMethod === "BANKING"
                        ? "bg-neutral-900 text-blue-400 border border-neutral-700"
                        : "bg-neutral-900 text-neutral-400 border border-neutral-800"
                    )}
                  >
                    <Landmark size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm  tracking-tight text-white">
                        ธนาคาร &amp; พร้อมเพย์
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-400 leading-relaxed">
                      โอนเงินผ่านบัญชีหรือสแกน QR
                    </p>
                  </div>
                </button>
              </div>
            </FadeIn>
          </div>

          {/* Right Column: กล่องสำหรับ input / ทำรายการ (Input Form Box) */}
          <div className="flex-1 min-w-0 w-full space-y-2.5">
            <FadeIn direction="up">
              <p className="text-xs  text-neutral-400">
                ทำรายการเติมเงิน
              </p>
            </FadeIn>

            {selectedMethod && (
              <FadeIn
                direction="up"
                delay={100}
                className="rounded-2xl sm:rounded-3xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6"
              >
                {selectedMethod === "TRUEMONEY" ? (
                  <TrueMoneyForm />
                ) : (
                  <BankingPlaceholder
                    onSwitchToTrueMoney={() => setSelectedMethod("TRUEMONEY")}
                  />
                )}
              </FadeIn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopupContainer;
