import { create } from "zustand";
import axios from "axios";

export interface UserSession {
  id: string;
  discordId: string;
  name: string;
  avatar: string | null;
  role: "USER" | "ADMIN";
  balance: number;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: UserSession | null;
  isLoading: boolean;
  hasLoaded: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserSession | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  hasLoaded: false,
  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get<{ user: UserSession }>("/api/v1/auth/me");
      set({ user: response.data.user, isLoading: false, hasLoaded: true });
    } catch {
      set({ user: null, isLoading: false, hasLoaded: true });
    }
  },
  logout: async () => {
    try {
      await axios.post("/api/v1/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      set({ user: null });
      window.location.href = "/";
    }
  },
  setUser: (user) => set({ user }),
}));
