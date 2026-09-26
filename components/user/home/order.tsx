"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Package, Clock, X, ShoppingBag } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { isValidImageUrl } from "@/lib/utils";

interface PopupState {
  activeIndex: number;
  isVisible: boolean;
  isDismissed: boolean;
}

const formatTimeAgo = (isoDate: string): string => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSec < 60) return "เมื่อสักครู่";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} วันที่แล้ว`;

  return new Date(isoDate).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });
};

const ShowOrderHome = () => {
  const { recentOrders, fetchRecentOrders } = useOrderStore();

  const [popup, setPopup] = useState<PopupState>({
    activeIndex: 0,
    isVisible: true,
    isDismissed: false,
  });

  useEffect(() => {
    fetchRecentOrders();
  }, [fetchRecentOrders]);

  useEffect(() => {
    if (recentOrders.length <= 1 || popup.isDismissed) return;

    let fadeTimeoutId: ReturnType<typeof setTimeout>;

    const intervalId = setInterval(() => {
      setPopup((prev) => ({ ...prev, isVisible: false }));

      fadeTimeoutId = setTimeout(() => {
        setPopup((prev) => ({
          ...prev,
          activeIndex: (prev.activeIndex + 1) % recentOrders.length,
          isVisible: true,
        }));
      }, 480);
    }, 5200);

    return () => {
      clearInterval(intervalId);
      clearTimeout(fadeTimeoutId);
    };
  }, [recentOrders.length, popup.isDismissed]);

  if (recentOrders.length === 0 || popup.isDismissed) {
    return null;
  }

  const currentOrder =
    recentOrders[popup.activeIndex % recentOrders.length] || recentOrders[0];

  return (
    <div
      aria-live="polite"
      className={`fixed right-4 bottom-4 z-40 w-[calc(100vw-2rem)] max-w-[330px] transition-all duration-500 ease-out sm:right-6 sm:bottom-6 ${
        popup.isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <div className="relative overflow-hidden rounded-md border border-neutral-800 bg-neutral-950/95 p-3.5 backdrop-blur-xs transition hover:border-neutral-700">
        {/* Top 1px Laser Line Accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px] overflow-hidden bg-neutral-800/70"
        >
          <div className="h-full w-2/5 animate-[laser-run_3.4s_linear_infinite] bg-gradient-to-r from-transparent via-blue-500 to-blue-200" />
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => setPopup((prev) => ({ ...prev, isDismissed: true }))}
          aria-label="ปิดการแจ้งเตือนคำสั่งซื้อล่าสุด"
          className="absolute top-2.5 right-2.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm text-neutral-500 transition hover:bg-neutral-900 hover:text-white"
        >
          <X size={14} strokeWidth={1.8} />
        </button>

        <div className="flex items-center gap-3 pr-5">
          {/* 1. Product Image Thumbnail */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900">
            {isValidImageUrl(currentOrder.productImage) ? (
              <Image
                src={currentOrder.productImage!}
                alt={currentOrder.productName}
                fill
                className="object-cover"
                unoptimized={currentOrder.productImage!.startsWith("http")}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-blue-500">
                <Package size={20} strokeWidth={1.8} />
              </div>
            )}
          </div>

          {/* 2. Buyer Name, Product Name, Price, Quantity & Time Ago */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-sm border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
                <ShoppingBag size={10} strokeWidth={2} />
                <span>สั่งซื้อล่าสุด</span>
              </span>

              <span className="truncate text-xs font-semibold text-white">
                {currentOrder.buyerName}
              </span>
            </div>

            <p className="mt-1 truncate text-xs font-medium text-neutral-300">
              {currentOrder.productName}
              {currentOrder.quantity > 1 ? ` (x${currentOrder.quantity})` : ""}
            </p>

            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-blue-500">
                ฿
                {currentOrder.price.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                })}
              </span>

              <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                <Clock size={11} strokeWidth={1.8} />
                <span>{formatTimeAgo(currentOrder.createdAt)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowOrderHome;
