"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShoppingBag,
  Wallet,
  ArrowLeft,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FadeIn from "@/components/ui/fade-in";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import { usePaymentStore } from "@/store/paymentStore";
import { DiscordIcon } from "@/components/user/utils/avatar";
import UserProfileCard from "./profile-card";
import OrderHistoryTable from "./order-table";
import PaymentHistoryTable from "./payment-table";
import BackUI from "@/components/ui/back";

type HistoryTab = "orders" | "payments";

const HistoryContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading: isAuthLoading, hasLoaded: isAuthLoaded } = useAuthStore();
  const { userOrders, fetchUserOrders } = useOrderStore();
  const { userPayments, fetchUserPayments } = usePaymentStore();

  const initialTab =
    searchParams.get("tab") === "payments" ? "payments" : "orders";
  const [activeTab, setActiveTab] = useState<HistoryTab>(initialTab);

  // Sync tab with URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "payments" || tabParam === "orders") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Load orders and payments when authenticated
  useEffect(() => {
    if (user) {
      fetchUserOrders();
      fetchUserPayments();
    }
  }, [user, fetchUserOrders, fetchUserPayments]);

  const handleTabChange = (tab: HistoryTab) => {
    setActiveTab(tab);
    router.replace(`/history?tab=${tab}`, { scroll: false });
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/shop");
    }
  };

  // Loading skeleton while checking user authentication
  if (isAuthLoading && !isAuthLoaded) {
    return (
      <div className="mx-auto w-full max-w-6xl py-5 sm:py-8 space-y-6">
        <div className="h-9 w-28 rounded-full bg-neutral-900 animate-pulse" />
        <div className="h-32 w-full rounded-2xl bg-neutral-900/60 animate-pulse" />
        <div className="h-12 w-72 rounded-full bg-neutral-900/60 animate-pulse" />
        <div className="h-80 w-full rounded-2xl bg-neutral-900/40 animate-pulse" />
      </div>
    );
  }

  // Unauthenticated State: Prompt Discord login with Back UI
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-4xl py-6 sm:py-10 space-y-6">
        {/* Back UI */}
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3.5 py-1.5 text-xs font-medium text-neutral-400 transition hover:border-neutral-700 hover:bg-neutral-900 hover:text-white cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>ย้อนกลับ</span>
          </button>
        </div>

        <FadeIn direction="up">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-8 sm:p-12 text-center space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
              <LogIn size={26} />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                เข้าสู่ระบบเพื่อดูประวัติการทำรายการ
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                กรุณาเข้าสู่ระบบด้วยบัญชี Discord ของคุณ เพื่อตรวจสอบประวัติการซื้อสินค้า ข้อมูลสต็อกที่ได้รับ และประวัติการเติมเงินทั้งหมด
              </p>
            </div>

            <div className="pt-2">
              <a
                href="/api/v1/auth/discord"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5865F2] hover:bg-[#4752C4] px-6 py-2.5 text-xs font-semibold text-white transition cursor-pointer"
              >
                <DiscordIcon className="h-4 w-4 fill-current" />
                <span>เข้าสู่ระบบด้วย Discord</span>
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl py-5 sm:py-8 space-y-6">
      {/* Top Bar: Back UI & Breadcrumb Navigation */}
      <FadeIn direction="up">
        <BackUI
          href="/"
          text="กลับหน้าแรก"
         />
      </FadeIn>

      {/* ส่วนที่ 1: โปรไฟล์ผู้ใช้ (User Profile Card) */}
      <FadeIn direction="up" delay={40}>
        <UserProfileCard
          user={user}
          orderCount={userOrders.length}
          paymentCount={userPayments.length}
        />
      </FadeIn>

      {/* ส่วนที่ 2: ประวัติรายการ (Tabs Selector + Data Table) */}
      <FadeIn direction="up" delay={80} className="space-y-4">
        {/* Selector Tabs: ประวัติการสั่งซื้อ / ประวัติการเติมเงิน */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Order History Tab */}
          <button
            type="button"
            onClick={() => handleTabChange("orders")}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition cursor-pointer",
              activeTab === "orders"
                ? "bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/25"
                : "border border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-white",
            )}
          >
            <ShoppingBag
              size={14}
              className={activeTab === "orders" ? "text-blue-400" : "text-neutral-500"}
            />
            <span>ประวัติการสั่งซื้อ</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.2 text-2xs font-bold",
                activeTab === "orders"
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-neutral-900 text-neutral-500",
              )}
            >
              {userOrders.length}
            </span>
          </button>

          {/* Payment History Tab */}
          <button
            type="button"
            onClick={() => handleTabChange("payments")}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition cursor-pointer",
              activeTab === "payments"
                ? "bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/25"
                : "border border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-white",
            )}
          >
            <Wallet
              size={14}
              className={activeTab === "payments" ? "text-blue-400" : "text-neutral-500"}
            />
            <span>ประวัติการเติมเงิน</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.2 text-2xs font-bold",
                activeTab === "payments"
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-neutral-900 text-neutral-500",
              )}
            >
              {userPayments.length}
            </span>
          </button>
        </div>

        {/* Table Panel Container */}
        <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 p-4 sm:p-5 md:p-6 space-y-4">
          {/* Table Header Description */}
          <div className="border-b border-neutral-900 pb-3.5">
            <h3 className="text-sm sm:text-base text-white">
              {activeTab === "orders"
                ? "รายการคำสั่งซื้อสินค้าทั้งหมด"
                : "รายการประวัติการเติมเงินเข้าสู่กระเป๋า"}
            </h3>
            <p className="mt-0.5 text-2xs sm:text-xs text-neutral-400">
              {activeTab === "orders"
                ? "ตรวจสอบรายการสั่งซื้อของคุณ พร้อมดูข้อมูลสินค้า รหัสสต็อก และวันที่ทำรายการ"
                : "ตรวจสอบรายการเติมเงินทั้งหมด ทั้งช่องทาง TrueMoney ซองของขวัญ และโอนเงิน"}
            </p>
          </div>

          {/* Active History Table with Fade-In Transition */}
          <div className="animate-overlay-fade-in">
            {activeTab === "orders" ? (
              <OrderHistoryTable />
            ) : (
              <PaymentHistoryTable />
            )}
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

export const HistoryContainer = () => {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl py-12 space-y-5 animate-pulse">
          <div className="h-8 w-28 rounded-full bg-neutral-900" />
          <div className="h-32 w-full rounded-2xl bg-neutral-900" />
          <div className="h-64 w-full rounded-2xl bg-neutral-900" />
        </div>
      }
    >
      <HistoryContent />
    </Suspense>
  );
};

export default HistoryContainer;
