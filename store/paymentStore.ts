import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "./authStore";

export interface PaymentItem {
  id: string;
  userId?: string;
  userName?: string;
  userDiscordId?: string;
  userAvatar?: string | null;
  amount: number;
  method: "TRUEMONEY" | "BANKING";
  status: "PENDING" | "SUCCESS" | "REJECTED";
  voucherCode?: string | null;
  senderName?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface PaymentSettingItem {
  id: string;
  truemoneyPhone?: string | null;
  truemoneyEnabled: boolean;
  bankEnabled: boolean;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
}

interface AdminSummary {
  totalRevenue: number;
  totalSuccessCount: number;
}

interface PaymentState {
  // User side
  userPayments: PaymentItem[];
  isLoadingUserPayments: boolean;
  isSubmitting: boolean;
  fetchUserPayments: () => Promise<void>;
  redeemTrueMoney: (
    voucherUrl: string
  ) => Promise<{ success: boolean; amount?: number; message?: string; error?: string }>;

  // Admin side
  adminPayments: PaymentItem[];
  isLoadingAdminPayments: boolean;
  adminSummary: AdminSummary;
  adminSearch: string;
  setAdminSearch: (search: string) => void;
  fetchAdminPayments: (searchQuery?: string) => Promise<void>;

  // Settings
  paymentSetting: PaymentSettingItem | null;
  isLoadingSetting: boolean;
  fetchPaymentSetting: () => Promise<void>;
  savePaymentSetting: (
    data: Partial<PaymentSettingItem>
  ) => Promise<{ success: boolean; error?: string }>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  // User state
  userPayments: [],
  isLoadingUserPayments: false,
  isSubmitting: false,

  fetchUserPayments: async () => {
    set({ isLoadingUserPayments: true });
    try {
      const res = await axios.get<{ payments: PaymentItem[] }>(
        "/api/v1/user/payments"
      );
      set({ userPayments: res.data.payments, isLoadingUserPayments: false });
    } catch {
      set({ isLoadingUserPayments: false });
    }
  },

  redeemTrueMoney: async (voucherUrl: string) => {
    set({ isSubmitting: true });
    try {
      const res = await axios.post<{
        success: boolean;
        amount: number;
        senderName: string | null;
        newBalance: number;
        payment: PaymentItem;
        message: string;
      }>("/api/v1/user/payments/truemoney", { voucherUrl });

      // Update current user balance in authStore
      const authUser = useAuthStore.getState().user;
      if (authUser) {
        useAuthStore.getState().setUser({
          ...authUser,
          balance: res.data.newBalance,
        });
      }

      // Add to local user payments
      set((state) => ({
        userPayments: [res.data.payment, ...state.userPayments],
        isSubmitting: false,
      }));

      return {
        success: true,
        amount: res.data.amount,
        message: res.data.message,
      };
    } catch (err: unknown) {
      set({ isSubmitting: false });
      let errorMsg = "เกิดข้อผิดพลาดในการแลกรับซองของขวัญ";
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }
      return { success: false, error: errorMsg };
    }
  },

  // Admin state
  adminPayments: [],
  isLoadingAdminPayments: false,
  adminSummary: { totalRevenue: 0, totalSuccessCount: 0 },
  adminSearch: "",

  setAdminSearch: (adminSearch) => set({ adminSearch }),

  fetchAdminPayments: async (searchQuery) => {
    const query = searchQuery !== undefined ? searchQuery : get().adminSearch;
    set({ isLoadingAdminPayments: true });

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append("search", query.trim());

      const url = `/api/v1/private/payments${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const res = await axios.get<{
        payments: PaymentItem[];
        summary: AdminSummary;
      }>(url);

      set({
        adminPayments: res.data.payments,
        adminSummary: res.data.summary,
        isLoadingAdminPayments: false,
      });
    } catch {
      set({ isLoadingAdminPayments: false });
    }
  },

  // Payment Settings
  paymentSetting: null,
  isLoadingSetting: false,

  fetchPaymentSetting: async () => {
    set({ isLoadingSetting: true });
    try {
      const res = await axios.get<{ setting: PaymentSettingItem }>(
        "/api/v1/private/payment-settings"
      );
      set({ paymentSetting: res.data.setting, isLoadingSetting: false });
    } catch {
      set({ isLoadingSetting: false });
    }
  },

  savePaymentSetting: async (data) => {
    try {
      const res = await axios.put<{
        success: boolean;
        setting: PaymentSettingItem;
        message?: string;
      }>("/api/v1/private/payment-settings", data);

      set({ paymentSetting: res.data.setting });
      return { success: true };
    } catch (err: unknown) {
      let errorMsg = "ไม่สามารถบันทึกการตั้งค่าได้";
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }
      return { success: false, error: errorMsg };
    }
  },
}));
