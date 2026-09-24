import { create } from "zustand";
import axios from "axios";

export interface UserItem {
  id: string;
  discordId: string;
  name: string;
  avatar: string | null;
  role: "USER" | "ADMIN";
  balance: number;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  users: UserItem[];
  isLoading: boolean;
  search: string;
  selectedRole: string;

  // Modals state
  editingUser: UserItem | null;
  deletingUser: UserItem | null;

  // Actions
  setSearch: (search: string) => void;
  setSelectedRole: (role: string) => void;
  setEditingUser: (user: UserItem | null) => void;
  setDeletingUser: (user: UserItem | null) => void;

  fetchUsers: (searchQuery?: string, roleFilter?: string) => Promise<void>;
  updateUser: (
    id: string,
    data: { role?: "USER" | "ADMIN"; balance?: number }
  ) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: true,
  search: "",
  selectedRole: "ALL",

  editingUser: null,
  deletingUser: null,

  setSearch: (search) => set({ search }),
  setSelectedRole: (selectedRole) => set({ selectedRole }),
  setEditingUser: (editingUser) => set({ editingUser }),
  setDeletingUser: (deletingUser) => set({ deletingUser }),

  fetchUsers: async (searchQuery, roleFilter) => {
    const query = searchQuery !== undefined ? searchQuery : get().search;
    const role = roleFilter !== undefined ? roleFilter : get().selectedRole;
    set({ isLoading: true });

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append("search", query.trim());
      if (role && role !== "ALL") params.append("role", role);

      const url = `/api/v1/private/users${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await axios.get<{ users: UserItem[] }>(url);
      set({ users: response.data.users || [], isLoading: false });
    } catch (error) {
      console.error("fetchUsers error:", error);
      set({ users: [], isLoading: false });
    }
  },

  updateUser: async (id, data) => {
    try {
      await axios.patch(`/api/v1/private/users/${id}`, data);
      await get().fetchUsers();
      set({ editingUser: null });
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "ไม่สามารถอัปเดตข้อมูลผู้ใช้งานได้";
      return { success: false, error: errorMsg };
    }
  },

  deleteUser: async (id) => {
    try {
      await axios.delete(`/api/v1/private/users/${id}`);
      await get().fetchUsers();
      set({ deletingUser: null });
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "ไม่สามารถลบผู้ใช้งานได้";
      return { success: false, error: errorMsg };
    }
  },
}));
