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
      <div className="flex flex-1 w-full items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl space-y-5 animate-pulse">
          {/* Section title skeleton */}
          <div className="h-4 w-36 rounded-sm bg-neutral-900" />

          {/* Method tabs container skeleton */}
          <div className="rounded-2xl sm:rounded-3xl border border-neutral-800 bg-neutral-950 p-1.5 sm:p-2">
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2">
              <div className="h-16 rounded-xl sm:rounded-2xl border border-neutral-800/60 bg-neutral-900/40" />
              <div className="h-16 rounded-xl sm:rounded-2xl border border-neutral-800/60 bg-neutral-900/40" />
            </div>
          </div>

          {/* Form container skeleton */}
          <div className="h-48 rounded-3xl border border-neutral-800 bg-neutral-900/40" />
        </div>
      </div>
    );
  }

  // Unauthenticated State: Prompt Discord Login
  if (!user) {
    return (
      <div className="flex flex-1 w-full items-center justify-center px-4 py-12 md:py-16">
        <FadeIn direction="up" className="w-full max-w-lg space-y-6">
          <div className="rounded-md border border-neutral-800 bg-neutral-950 p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-blue-500/10 text-blue-400">
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
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#5865F2] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#4752C4] cursor-pointer"
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

  // Authenticated State: Method Selection + Forms
  return (
    <div className="flex flex-1 w-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-5">
        {/* Method Choices / Options Header */}
        <FadeIn direction="up">
          <p className="text-xs font-semibold text-neutral-400">
            เลือกช่องทางการเติมเงิน
          </p>
        </FadeIn>

        {/* Method Choices Tabs in Single Container */}
        <FadeIn direction="up" delay={50}>
          <div className="rounded-2xl sm:rounded-3xl border border-neutral-800 bg-neutral-950 p-1.5 sm:p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
              {/* TrueMoney Tab */}
              <button
                type="button"
                onClick={() => setSelectedMethod("TRUEMONEY")}
                className={cn(
                  "flex w-full items-center gap-3.5 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 text-left transition cursor-pointer",
                  selectedMethod === "TRUEMONEY"
                    ? "border border-orange-500/30 bg-orange-500/10 text-white shadow-sm"
                    : "border border-transparent text-neutral-400 hover:bg-neutral-900/60 hover:text-white"
                )}
              >
                <div
                  className={cn(
                    "relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl p-1.5 transition",
                    selectedMethod === "TRUEMONEY"
                      ? "bg-neutral-900 border border-orange-500/20"
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
                    <span className="text-sm text-white tracking-tight">
                      TRUEMONEY
                    </span>
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 text-2xs font-semibold text-emerald-400">
                      ฟรีค่าธรรมเนียม
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
                  "flex w-full items-center gap-3.5 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 text-left transition cursor-pointer",
                  selectedMethod === "BANKING"
                    ? "border border-blue-500/30 bg-blue-500/10 text-white shadow-sm"
                    : "border border-transparent text-neutral-400 hover:bg-neutral-900/60 hover:text-white"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition",
                    selectedMethod === "BANKING"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-neutral-900 text-neutral-400 border border-neutral-800"
                  )}
                >
                  <Landmark size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white tracking-tight">
                      ธนาคาร &amp; พร้อมเพย์
                    </span>
                    <span className="rounded-full bg-blue-500/15 border border-blue-500/20 px-2 py-0.5 text-2xs font-semibold text-blue-400">
                      เร็วๆ นี้
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-400 leading-relaxed">
                    โอนเงินผ่านบัญชีหรือสแกน QR
                  </p>
                </div>
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Selected Method Form Container Below */}
        {selectedMethod && (
          <FadeIn
            direction="up"
            delay={140}
            className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6"
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
  );
};

export default TopupContainer;
