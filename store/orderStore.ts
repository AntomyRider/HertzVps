import { create } from "zustand";
import axios from "axios";

export interface OrderItem {
  id: string;
  userId: string;
  userName: string;
  userDiscordId: string;
  userAvatar: string | null;
  productId: string | null;
  productName: string;
  productImage: string | null;
  price: number;
  quantity: number;
  deliveredStock: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserOrderItem {
  id: string;
  productName: string;
  productImage: string | null;
  price: number;
  quantity: number;
  deliveredStock: string;
  createdAt: string;
}

export interface RecentPublicOrderItem {
  id: string;
  buyerName: string;
  productName: string;
  productImage: string | null;
  price: number;
  quantity: number;
  createdAt: string;
}

interface OrderSummary {
  totalOrders: number;
  totalRevenue: number;
}

interface OrderState {
  // Admin side
  orders: OrderItem[];
  isLoading: boolean;
  search: string;
  summary: OrderSummary;
  viewingOrder: OrderItem | null;

  setSearch: (search: string) => void;
  setViewingOrder: (order: OrderItem | null) => void;
  fetchOrders: (searchQuery?: string) => Promise<void>;

  // User side
  userOrders: UserOrderItem[];
  isLoadingUserOrders: boolean;
  viewingUserOrder: UserOrderItem | null;
  setViewingUserOrder: (order: UserOrderItem | null) => void;
  fetchUserOrders: () => Promise<void>;

  // Public recent orders (Home live notification)
  recentOrders: RecentPublicOrderItem[];
  isLoadingRecentOrders: boolean;
  fetchRecentOrders: () => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  // Admin state
  orders: [],
  isLoading: true,
  search: "",
  summary: { totalOrders: 0, totalRevenue: 0 },
  viewingOrder: null,

  setSearch: (search) => set({ search }),
  setViewingOrder: (viewingOrder) => set({ viewingOrder }),

  fetchOrders: async (searchQuery) => {
    const query = searchQuery !== undefined ? searchQuery : get().search;
    set({ isLoading: true });

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append("search", query.trim());

      const url = `/api/v1/private/orders${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await axios.get<{
        orders: OrderItem[];
        summary: OrderSummary;
      }>(url);

      set({
        orders: response.data.orders || [],
        summary: response.data.summary || { totalOrders: 0, totalRevenue: 0 },
        isLoading: false,
      });
    } catch (error) {
      console.error("fetchOrders error:", error);
      set({ orders: [], isLoading: false });
    }
  },

  // User state
  userOrders: [],
  isLoadingUserOrders: false,
  viewingUserOrder: null,

  setViewingUserOrder: (order) => set({ viewingUserOrder: order }),

  fetchUserOrders: async () => {
    set({ isLoadingUserOrders: true });
    try {
      const response = await axios.get<{ orders: UserOrderItem[] }>(
        "/api/v1/user/orders"
      );
      set({
        userOrders: response.data.orders || [],
        isLoadingUserOrders: false,
      });
    } catch (error) {
      console.error("fetchUserOrders error:", error);
      set({ userOrders: [], isLoadingUserOrders: false });
    }
  },

  // Public recent orders (10 latest)
  recentOrders: [],
  isLoadingRecentOrders: false,

  fetchRecentOrders: async () => {
    set({ isLoadingRecentOrders: true });
    try {
      const response = await axios.get<{ orders: RecentPublicOrderItem[] }>(
        "/api/v1/public/orders/recent"
      );
      set({
        recentOrders: response.data.orders || [],
        isLoadingRecentOrders: false,
      });
    } catch (error) {
      console.error("fetchRecentOrders error:", error);
      set({ recentOrders: [], isLoadingRecentOrders: false });
    }
  },
}));
