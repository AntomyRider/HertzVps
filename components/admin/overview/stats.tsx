"use client";

import { useEffect } from "react";
import { useOverviewStore } from "@/store/overviewStore";
import { Wallet, ShoppingBag, Package, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function StatsAdmin() {
  const { stats, isLoading, fetchDashboardData } = useOverviewStore();

  useEffect(() => {
    if (!stats) {
      fetchDashboardData();
    }
  }, [stats, fetchDashboardData]);

  if (isLoading && !stats) {
    return (
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-md border border-neutral-800 bg-neutral-900/50 p-3.5"
          />
        ))}
      </div>
    );
  }

  const revGrowth = stats?.revenueGrowth ?? 0;
  const ordGrowth = stats?.ordersGrowth ?? 0;
  const stockPct = stats?.stockAvailablePercent ?? 0;
  const usrGrowth = stats?.usersGrowth ?? 0;

  const statCards = [
    {
      title: "ยอดขายรวม",
      value: `฿ ${(stats?.totalRevenue || 0).toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      percent: revGrowth,
      percentText: `${revGrowth >= 0 ? "+" : ""}${revGrowth.toFixed(1)}%`,
      sublabel: "เฉลี่ยเทียบเดือนก่อน",
      icon: Wallet,
      iconColor: "text-emerald-500",
    },
    {
      title: "คำสั่งซื้อทั้งหมด",
      value: `${(stats?.totalOrders || 0).toLocaleString()} รายการ`,
      percent: ordGrowth,
      percentText: `${ordGrowth >= 0 ? "+" : ""}${ordGrowth.toFixed(1)}%`,
      sublabel: "เฉลี่ยเทียบเดือนก่อน",
      icon: ShoppingBag,
      iconColor: "text-blue-500",
    },
    {
      title: "สินค้าทั้งหมด",
      value: `${(stats?.totalStock || 0).toLocaleString()} ชิ้น`,
      percent: stockPct,
      percentText: `${stockPct.toFixed(1)}%`,
      sublabel: "เฉลี่ยสต็อกพร้อมส่ง",
      icon: Package,
      iconColor: "text-amber-500",
    },
    {
      title: "ผู้ใช้งานทั้งหมด",
      value: `${(stats?.totalUsers || 0).toLocaleString()} คน`,
      percent: usrGrowth,
      percentText: `${usrGrowth >= 0 ? "+" : ""}${usrGrowth.toFixed(1)}%`,
      sublabel: "เฉลี่ยสมาชิกใหม่",
      icon: Users,
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.percent > 0;
        const isNegative = card.percent < 0;

        return (
          <div
            key={card.title}
            className="group relative overflow-hidden rounded-md border border-neutral-800 bg-neutral-950 p-3.5 transition hover:border-neutral-700/80"
          >
            {/* Content Layer */}
            <div className="relative z-10">
              <span className="text-xs font-medium text-neutral-400">
                {card.title}
              </span>

              <div className="mt-2">
                <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {card.value}
                </h2>

                {/* Subtext: Average % & Comparison */}
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                  <span
                    className={`inline-flex items-center gap-0.5 font-semibold ${
                      isPositive
                        ? "text-emerald-400"
                        : isNegative
                        ? "text-red-400"
                        : "text-neutral-400"
                    }`}
                  >
                    {isPositive && <TrendingUp size={12} />}
                    {isNegative && <TrendingDown size={12} />}
                    {!isPositive && !isNegative && <Minus size={12} />}
                    <span>{card.percentText}</span>
                  </span>
                  <span className="truncate text-neutral-500">
                    {card.sublabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Background Icon at bottom right, bleeding over edge and partially clipped */}
            <div
              className={`pointer-events-none absolute -bottom-3.5 -right-3.5 opacity-15 transition-transform duration-300 ${card.iconColor}`}
            >
              <Icon size={100} strokeWidth={1.5} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
