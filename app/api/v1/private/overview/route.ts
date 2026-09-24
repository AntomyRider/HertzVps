import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

export async function GET(req: NextRequest) {
  const { authorized, error, status } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "7d"; // "7d" | "30d" | "1y"

    // 1. Fetch aggregate metrics & related overview datasets in parallel
    const [
      {
        _sum: { price: totalOrderPriceSum },
      },
      totalOrdersCount,
      products,
      totalUsersCount,
      categories,
      recentOrdersRaw,
      recentTopupsRaw,
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: { price: true },
      }),
      prisma.order.count(),
      prisma.product.findMany({
        select: {
          stock: true,
        },
      }),
      prisma.user.count(),
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          products: {
            select: {
              totalRevenue: true,
              soldCount: true,
            },
          },
        },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              discordId: true,
            },
          },
        },
      }),
      prisma.payment.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              discordId: true,
            },
          },
        },
      }),
    ]);

    const totalRevenue = Number(totalOrderPriceSum || 0);
    const totalProductsCount = products.length;
    let totalStockCount = 0;
    let inStockProductsCount = 0;
    for (const { stock } of products) {
      if (stock) {
        const count = stock.split("\n").map((l) => l.trim()).filter(Boolean).length;
        totalStockCount += count;
        if (count > 0) inStockProductsCount += 1;
      }
    }

    // 2. Growth / Average percentages
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      {
        _sum: { price: recentPriceSum },
        _count: { id: recentOrderCount },
      },
      {
        _sum: { price: prevPriceSum },
        _count: { id: prevOrderCount },
      },
      recentUsersCount,
      prevUsersCount,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { createdAt: { gte: thirtyDaysAgo } },
        _sum: { price: true },
        _count: { id: true },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        _sum: { price: true },
        _count: { id: true },
      }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    ]);

    const recentRev = Number(recentPriceSum || 0);
    const prevRev = Number(prevPriceSum || 0);
    const revenueGrowth = prevRev > 0
      ? Math.round(((recentRev - prevRev) / prevRev) * 1000) / 10
      : (recentRev > 0 ? 100 : 0);

    const recentOrders = recentOrderCount || 0;
    const prevOrders = prevOrderCount || 0;
    const ordersGrowth = prevOrders > 0
      ? Math.round(((recentOrders - prevOrders) / prevOrders) * 1000) / 10
      : (recentOrders > 0 ? 100 : 0);

    const stockAvailablePercent = totalProductsCount > 0
      ? Math.round((inStockProductsCount / totalProductsCount) * 1000) / 10
      : 0;

    const usersGrowth = prevUsersCount > 0
      ? Math.round(((recentUsersCount - prevUsersCount) / prevUsersCount) * 1000) / 10
      : (recentUsersCount > 0 ? 100 : 0);

    // 3. Category Distribution for Donut Chart
    const categoryDistribution = categories.map(({ id, name, products: catProducts }) => {
      let revenue = 0;
      let soldCount = 0;
      for (const { totalRevenue: prodRevenue, soldCount: prodSoldCount } of catProducts) {
        revenue += Number(prodRevenue || 0);
        soldCount += prodSoldCount || 0;
      }
      return {
        id,
        name,
        revenue: Math.round(revenue * 100) / 100,
        soldCount,
        productCount: catProducts.length,
      };
    });

    // 4. Map recent orders & recent topups
    const formattedRecentOrders = recentOrdersRaw.map(
      ({
        id,
        productName,
        productImage,
        price,
        quantity,
        createdAt,
        user: { id: userId, name: userName, avatar: userAvatar, discordId: userDiscordId },
      }) => ({
        id,
        productName,
        productImage,
        price: Number(price || 0),
        quantity: quantity || 1,
        createdAt: createdAt.toISOString(),
        user: {
          id: userId,
          name: userName,
          avatar: userAvatar,
          discordId: userDiscordId,
        },
      })
    );

    const formattedRecentTopups = recentTopupsRaw.map(
      ({
        id,
        amount,
        method,
        status: topupStatus,
        voucherCode,
        senderName,
        createdAt,
        user: { id: userId, name: userName, avatar: userAvatar, discordId: userDiscordId },
      }) => ({
        id,
        amount: Number(amount || 0),
        method,
        status: topupStatus,
        voucherCode,
        senderName,
        createdAt: createdAt.toISOString(),
        user: {
          id: userId,
          name: userName,
          avatar: userAvatar,
          discordId: userDiscordId,
        },
      })
    );

    // 5. Determine time range boundaries for Sales Chart
    let startDate: Date;
    let slots: Array<{
      key: string;
      label: string;
      revenue: number;
      orders: number;
    }> = [];

    if (timeRange === "30d") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0);
      for (let i = 0; i < 30; i++) {
        const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const key = `${yyyy}-${mm}-${dd}`;
        const label = `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}`;
        slots.push({ key, label, revenue: 0, orders: 0 });
      }
    } else if (timeRange === "1y") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1, 0, 0, 0);
      for (let i = 0; i < 12; i++) {
        const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const key = `${yyyy}-${mm}`;
        const label = `${THAI_MONTHS_SHORT[d.getMonth()]} ${(d.getFullYear() + 543).toString().slice(2)}`;
        slots.push({ key, label, revenue: 0, orders: 0 });
      }
    } else {
      // 7 days default
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0);
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const key = `${yyyy}-${mm}-${dd}`;
        const label = `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}`;
        slots.push({ key, label, revenue: 0, orders: 0 });
      }
    }

    // 6. Fetch orders within the date window
    const ordersInWindow = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        price: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const slotMap = new Map<string, { revenue: number; orders: number }>();
    for (const { key } of slots) {
      slotMap.set(key, { revenue: 0, orders: 0 });
    }

    for (const { price, createdAt } of ordersInWindow) {
      const yyyy = createdAt.getFullYear();
      const mm = String(createdAt.getMonth() + 1).padStart(2, "0");
      const dd = String(createdAt.getDate()).padStart(2, "0");
      const key = timeRange === "1y" ? `${yyyy}-${mm}` : `${yyyy}-${mm}-${dd}`;

      const target = slotMap.get(key);
      if (target) {
        target.revenue += Number(price || 0);
        target.orders += 1;
      }
    }

    const salesChart = slots.map(({ key, label }) => {
      const { revenue, orders } = slotMap.get(key) || { revenue: 0, orders: 0 };
      return {
        date: key,
        label,
        revenue: Math.round(revenue * 100) / 100,
        orders,
      };
    });

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders: totalOrdersCount,
        totalProducts: totalProductsCount,
        totalStock: totalStockCount,
        totalUsers: totalUsersCount,
        revenueGrowth,
        ordersGrowth,
        stockAvailablePercent,
        usersGrowth,
      },
      salesChart,
      categoryDistribution,
      recentOrders: formattedRecentOrders,
      recentTopups: formattedRecentTopups,
      timeRange,
    });
  } catch (error: any) {
    console.error("Overview GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch overview data" },
      { status: 500 }
    );
  }
}
