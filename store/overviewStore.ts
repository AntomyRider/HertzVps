import { create } from "zustand";
import axios from "axios";

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalStock: number;
  totalUsers: number;
  revenueGrowth?: number;
  ordersGrowth?: number;
  stockAvailablePercent?: number;
  usersGrowth?: number;
}

export interface SalesChartPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface CategoryDistributionItem {
  id: string;
  name: string;
  revenue: number;
  soldCount: number;
  productCount: number;
}

export interface RecentOrderItem {
  id: string;
  productName: string;
  productImage: string | null;
  price: number;
  quantity: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
    discordId: string;
  };
}

export interface RecentTopupItem {
  id: string;
  amount: number;
  method: "TRUEMONEY" | "BANKING";
  status: "PENDING" | "SUCCESS" | "REJECTED";
  voucherCode: string | null;
  senderName: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
    discordId: string;
  };
}

interface OverviewState {
  stats: DashboardStats | null;
  salesChart: SalesChartPoint[];
  categoryDistribution: CategoryDistributionItem[];
  recentOrders: RecentOrderItem[];
  recentTopups: RecentTopupItem[];
  timeRange: "7d" | "30d" | "1y";
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  fetchDashboardData: (range?: "7d" | "30d" | "1y", silent?: boolean) => Promise<void>;
  setTimeRange: (range: "7d" | "30d" | "1y") => void;
}

export const useOverviewStore = create<OverviewState>((set, get) => ({
  stats: null,
  salesChart: [],
  categoryDistribution: [],
  recentOrders: [],
  recentTopups: [],
  timeRange: "7d",
  isLoading: true,
  isRefreshing: false,
  error: null,

  fetchDashboardData: async (range, silent = false) => {
    const selectedRange = range || get().timeRange;

    if (!silent && !get().stats) {
      set({ isLoading: true, error: null });
    } else {
      set({ isRefreshing: true, error: null });
    }

    try {
      const response = await axios.get<{
        stats: DashboardStats;
        salesChart: SalesChartPoint[];
        categoryDistribution: CategoryDistributionItem[];
        recentOrders: RecentOrderItem[];
        recentTopups: RecentTopupItem[];
        timeRange: "7d" | "30d" | "1y";
      }>(`/api/v1/private/overview?timeRange=${selectedRange}`);

      set({
        stats: response.data.stats,
        salesChart: response.data.salesChart || [],
        categoryDistribution: response.data.categoryDistribution || [],
        recentOrders: response.data.recentOrders || [],
        recentTopups: response.data.recentTopups || [],
        timeRange: response.data.timeRange || selectedRange,
        isLoading: false,
        isRefreshing: false,
        error: null,
      });
    } catch (err: any) {
      console.error("fetchOverviewData error:", err);
      set({
        isLoading: false,
        isRefreshing: false,
        error: err.response?.data?.error || "ไม่สามารถโหลดข้อมูลสถิติภาพรวมได้",
      });
    }
  },

  setTimeRange: (range: "7d" | "30d" | "1y") => {
    set({ timeRange: range });
    get().fetchDashboardData(range, true);
  },
}));
