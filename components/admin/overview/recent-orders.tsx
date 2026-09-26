"use client";

import Link from "next/link";
import Image from "next/image";
import { useOverviewStore } from "@/store/overviewStore";
import { ShoppingBag, ChevronRight, User, Package } from "lucide-react";
import { isValidImageUrl } from "@/lib/utils";
import FadeIn from "@/components/ui/fade-in";

export default function RecentOrdersAdmin() {
  const { recentOrders, isLoading } = useOverviewStore();

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  return (
    <FadeIn direction="up" delay={150} className="h-full">
      <div className="flex h-full flex-col justify-between rounded-md border border-neutral-800 bg-neutral-950 p-5">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900/60 text-blue-400">
              <ShoppingBag size={20} strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">
                  คำสั่งซื้อล่าสุด
                </h3>
              </div>
              <p className="text-xs text-neutral-400">
                รายการสั่งซื้อสินค้าล่าสุดในระบบ
              </p>
            </div>
          </div>

          <Link
            href="/admin/order"
            className="flex items-center gap-1 rounded-sm border border-neutral-800 px-2.5 py-1.5 text-xs font-medium text-neutral-400 transition hover:border-neutral-700 hover:bg-neutral-900 hover:text-white"
          >
            <span>ดูทั้งหมด</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        {/* Content list */}
        <div className="mt-5 divide-y divide-neutral-900 overflow-hidden">
          {isLoading && recentOrders.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-neutral-900" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-24 animate-pulse rounded bg-neutral-900" />
                    <div className="h-3 w-16 animate-pulse rounded bg-neutral-900" />
                  </div>
                </div>
                <div className="space-y-1.5 text-right">
                  <div className="ml-auto h-3.5 w-16 animate-pulse rounded bg-neutral-900" />
                  <div className="ml-auto h-3 w-20 animate-pulse rounded bg-neutral-900" />
                </div>
              </div>
            ))
          ) : recentOrders.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingBag size={32} className="mx-auto text-neutral-600 opacity-60" />
              <p className="mt-2 text-sm text-neutral-400">ยังไม่มีคำสั่งซื้อในระบบ</p>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-2.5 transition hover:bg-neutral-900/30"
              >
                {/* Left: User & Product */}
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  {/* User Avatar */}
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-800 bg-neutral-900">
                    {isValidImageUrl(order.user.avatar) ? (
                      <Image
                        src={order.user.avatar!}
                        alt={order.user.name}
                        fill
                        className="object-cover"
                        unoptimized={order.user.avatar!.startsWith("http")}
                      />
                    ) : (
                      <User size={14} className="text-neutral-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="truncate text-xs font-medium text-white">
                        {order.user.name}
                      </span>
                      <span className="shrink-0 text-[11px] text-neutral-500">
                        ซื้อ
                      </span>
                      <span className="truncate text-xs font-semibold text-neutral-300">
                        {order.productName}
                      </span>
                    </div>

                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-neutral-500">
                      <span>จำนวน {order.quantity} ชิ้น</span>
                      <span>•</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Price */}
                <div className="shrink-0 text-right">
                  <span className="text-xs font-semibold text-white">
                    ฿{order.price.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-4 border-t border-neutral-900 pt-3 text-center">
        <Link
          href="/admin/order"
          className="text-xs text-neutral-500 transition hover:text-blue-400"
        >
          จัดการและดูรายละเอียดคำสั่งซื้อทั้งหมด →
        </Link>
      </div>
      </div>
    </FadeIn>
  );
}
