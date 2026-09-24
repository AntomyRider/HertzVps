"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShoppingBag, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/store/orderStore";
import { usePaymentStore } from "@/store/paymentStore";
import OrderHistoryTable from "./order-table";
import PaymentHistoryTable from "./payment-table";

type HistoryTab = "orders" | "payments";

const HistoryContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab =
    searchParams.get("tab") === "payments" ? "payments" : "orders";

  const [activeTab, setActiveTab] = useState<HistoryTab>(initialTab);
  const { userOrders } = useOrderStore();
  const { userPayments } = usePaymentStore();

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "payments" || tabParam === "orders") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: HistoryTab) => {
    setActiveTab(tab);
    router.replace(`/history?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="mx-auto w-full py-5 sm:py-8 md:py-10 space-y-4 sm:space-y-6">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
          ประวัติการทำรายการ
        </h1>
        <p className="mt-1 text-xs md:text-sm text-neutral-400">
          ตรวจสอบประวัติการซื้อสินค้าและประวัติการเติมเงินเข้ากระเป๋าของคุณ
        </p>
      </div>

      {/* 2-Columns Layout: Left Sidebar + Right Table Container */}
      <div className="flex flex-col md:flex-row items-stretch md:items-start gap-3.5 sm:gap-5 md:gap-6">
        {/* Left Side: Navigation Menu */}
        <div className="w-full md:w-64 shrink-0 rounded-md border border-neutral-800 bg-neutral-950 p-1.5 sm:p-2.5">
          <p className="hidden md:block px-3 py-2 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            หมวดหมู่ประวัติ
          </p>

          <div className="grid grid-cols-2 gap-1.5 md:flex md:flex-col md:gap-1.5">
            {/* Orders Tab Button */}
            <button
              type="button"
              onClick={() => handleTabChange("orders")}
              className={cn(
                "flex w-full items-center justify-between gap-1.5 rounded-sm px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-xs font-medium transition cursor-pointer text-left min-w-0",
                activeTab === "orders"
                  ? "bg-blue-600/15 text-white font-semibold border border-blue-500/30"
                  : "border border-transparent text-neutral-400 hover:bg-neutral-900/70 hover:text-white",
              )}
            >
              <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                <ShoppingBag
                  size={15}
                  className={cn(
                    "shrink-0",
                    activeTab === "orders"
                      ? "text-blue-400"
                      : "text-neutral-500",
                  )}
                />
                <span className="truncate">ซื้อสินค้า</span>
              </div>
              {userOrders.length > 0 && (
                <span
                  className={cn(
                    "rounded-sm px-1.5 sm:px-2 py-0.5 text-[10px] font-bold shrink-0",
                    activeTab === "orders"
                      ? "bg-blue-500/25 text-blue-400"
                      : "bg-neutral-900 text-neutral-400 border border-neutral-800",
                  )}
                >
                  {userOrders.length}
                </span>
              )}
            </button>

            {/* Payments Tab Button */}
            <button
              type="button"
              onClick={() => handleTabChange("payments")}
              className={cn(
                "flex w-full items-center justify-between gap-1.5 rounded-sm px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-xs font-medium transition cursor-pointer text-left min-w-0",
                activeTab === "payments"
                  ? "bg-blue-600/15 text-white font-semibold border border-blue-500/30"
                  : "border border-transparent text-neutral-400 hover:bg-neutral-900/70 hover:text-white",
              )}
            >
              <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                <Wallet
                  size={15}
                  className={cn(
                    "shrink-0",
                    activeTab === "payments"
                      ? "text-blue-400"
                      : "text-neutral-500",
                  )}
                />
                <span className="truncate">เติมเงิน</span>
              </div>
              {userPayments.length > 0 && (
                <span
                  className={cn(
                    "rounded-sm px-1.5 sm:px-2 py-0.5 text-[10px] font-bold shrink-0",
                    activeTab === "payments"
                      ? "bg-blue-500/25 text-blue-400"
                      : "bg-neutral-900 text-neutral-400 border border-neutral-800",
                  )}
                >
                  {userPayments.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Data Table Panel */}
        <div className="flex-1 min-w-0 w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 sm:p-5 md:p-6 space-y-3.5 sm:space-y-5">
          <div className="border-b border-neutral-900 pb-3 sm:pb-4">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-white">
              {activeTab === "orders"
                ? "ประวัติการซื้อสินค้าทั้งหมด"
                : "ประวัติการเติมเงินเข้ากระเป๋า"}
            </h2>
            <p className="mt-0.5 text-[11px] sm:text-xs text-neutral-400">
              {activeTab === "orders"
                ? "รายการคำสั่งซื้อที่คุณได้ทำรายการสำเร็จ พร้อมข้อมูลสินค้าและรหัสสต็อกที่ได้รับ"
                : "รายการเติมเงินทั้งหมด ทั้งผ่าน TrueMoney ซองของขวัญ และช่องทางอื่นๆ"}
            </p>
          </div>

          {activeTab === "orders" ? (
            <OrderHistoryTable />
          ) : (
            <PaymentHistoryTable />
          )}
        </div>
      </div>
    </div>
  );
};

export const HistoryContainer = () => {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full py-12">
          <div className="h-6 w-48 animate-pulse rounded-sm bg-neutral-900 mb-2" />
          <div className="h-4 w-72 animate-pulse rounded-sm bg-neutral-900 mb-8" />
          <div className="flex flex-col md:flex-row gap-5">
            <div className="h-32 w-full md:w-64 animate-pulse rounded-md bg-neutral-900" />
            <div className="h-96 flex-1 animate-pulse rounded-md bg-neutral-900" />
          </div>
        </div>
      }
    >
      <HistoryContent />
    </Suspense>
  );
};

export default HistoryContainer;
