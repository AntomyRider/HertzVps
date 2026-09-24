import { create } from "zustand";
import axios from "axios";

export interface KeyItem {
  id: string;
  code: string;
  isActive: boolean;
  durationDays: number;
  hwid: string | null;
  activatedAt: string | null;
  hwidResetAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface KeyState {
  keys: KeyItem[];
  isLoading: boolean;
  search: string;
  durationFilter: string;

  // Selection state
  selectedKeyIds: string[];
  setSelectedKeyIds: (ids: string[]) => void;
  toggleSelectKey: (id: string) => void;
  selectAllKeys: (checked: boolean) => void;
  clearSelectedKeys: () => void;

  // Modal states
  isCreateOpen: boolean;
  deletingKey: KeyItem | null;
  isAddTimeAllOpen: boolean;
  addingTimeToKey: KeyItem | null;
  createdKeysList: string[] | null;

  // Setters
  setSearch: (search: string) => void;
  setDurationFilter: (duration: string) => void;
  setIsCreateOpen: (open: boolean) => void;
  setDeletingKey: (key: KeyItem | null) => void;
  setIsAddTimeAllOpen: (open: boolean) => void;
  setAddingTimeToKey: (key: KeyItem | null) => void;
  setCreatedKeysList: (list: string[] | null) => void;

  // Async actions
  fetchKeys: (searchQuery?: string, duration?: string) => Promise<void>;
  createKeys: (data: {
    count: number;
    durationDays?: number;
    targetProductId?: string;
    expiresAt?: string;
  }) => Promise<{
    success: boolean;
    keys?: KeyItem[];
    addedToProductName?: string | null;
    error?: string;
  }>;
  toggleKeyActive: (
    id: string,
    isActive: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  deleteKey: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteSelectedKeys: (
    ids: string[]
  ) => Promise<{ success: boolean; count?: number; error?: string }>;
  deleteAllKeys: () => Promise<{
    success: boolean;
    count?: number;
    error?: string;
  }>;
  resetHwidAdmin: (id: string) => Promise<{ success: boolean; error?: string }>;
  addTimeToKey: (
    id: string,
    days: number
  ) => Promise<{ success: boolean; error?: string }>;
  addTimeToAll: (
    days: number
  ) => Promise<{ success: boolean; count?: number; error?: string }>;
}

export const useKeyStore = create<KeyState>((set, get) => ({
  keys: [],
  isLoading: true,
  search: "",
  durationFilter: "all",

  selectedKeyIds: [],
  setSelectedKeyIds: (ids) => set({ selectedKeyIds: ids }),
  toggleSelectKey: (id) =>
    set((state) => ({
      selectedKeyIds: state.selectedKeyIds.includes(id)
        ? state.selectedKeyIds.filter((i) => i !== id)
        : [...state.selectedKeyIds, id],
    })),
  selectAllKeys: (checked) =>
    set((state) => ({
      selectedKeyIds: checked ? state.keys.map((k) => k.id) : [],
    })),
  clearSelectedKeys: () => set({ selectedKeyIds: [] }),

  isCreateOpen: false,
  deletingKey: null,
  isAddTimeAllOpen: false,
  addingTimeToKey: null,
  createdKeysList: null,

  setSearch: (search) => set({ search }),
  setDurationFilter: (durationFilter) => {
    set({ durationFilter });
    get().fetchKeys(get().search, durationFilter);
  },
  setIsCreateOpen: (isCreateOpen) => set({ isCreateOpen }),
  setDeletingKey: (deletingKey) => set({ deletingKey }),
  setIsAddTimeAllOpen: (isAddTimeAllOpen) => set({ isAddTimeAllOpen }),
  setAddingTimeToKey: (addingTimeToKey) => set({ addingTimeToKey }),
  setCreatedKeysList: (createdKeysList) => set({ createdKeysList }),

  fetchKeys: async (searchQuery, duration) => {
    const query = searchQuery !== undefined ? searchQuery : get().search;
    const dur = duration !== undefined ? duration : get().durationFilter;
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("search", query.trim());
      if (dur && dur !== "all") params.set("duration", dur);

      const qs = params.toString();
      const url = qs ? `/api/v1/private/keys?${qs}` : "/api/v1/private/keys";
      const res = await axios.get<{ keys: KeyItem[] }>(url);
      const newKeys = res.data.keys || [];
      const newKeyIds = new Set(newKeys.map((k) => k.id));
      set({
        keys: newKeys,
        isLoading: false,
        selectedKeyIds: get().selectedKeyIds.filter((id) => newKeyIds.has(id)),
      });
    } catch (error) {
      console.error("fetchKeys error:", error);
      set({ keys: [], isLoading: false });
    }
  },

  createKeys: async (data) => {
    try {
      const res = await axios.post<{
        success: boolean;
        keys: KeyItem[];
        addedToProductName?: string | null;
      }>("/api/v1/private/keys", data);
      await get().fetchKeys();
      set({
        isCreateOpen: false,
        createdKeysList: res.data.keys.map((k) => k.code),
      });
      return {
        success: true,
        keys: res.data.keys,
        addedToProductName: res.data.addedToProductName,
      };
    } catch (err: any) {
      const error = err.response?.data?.error || "ไม่สามารถสร้างคีย์ได้";
      return { success: false, error };
    }
  },

  toggleKeyActive: async (id, isActive) => {
    try {
      await axios.patch(`/api/v1/private/keys/${id}`, { isActive });
      set((state) => ({
        keys: state.keys.map((k) => (k.id === id ? { ...k, isActive } : k)),
      }));
      return { success: true };
    } catch (err: any) {
      const error =
        err.response?.data?.error || "ไม่สามารถเปลี่ยนสถานะคีย์ได้";
      return { success: false, error };
    }
  },

  deleteKey: async (id) => {
    try {
      await axios.delete(`/api/v1/private/keys/${id}`);
      await get().fetchKeys();
      set({
        deletingKey: null,
        selectedKeyIds: get().selectedKeyIds.filter((i) => i !== id),
      });
      return { success: true };
    } catch (err: any) {
      const error = err.response?.data?.error || "ไม่สามารถลบคีย์ได้";
      return { success: false, error };
    }
  },

  deleteSelectedKeys: async (ids: string[]) => {
    try {
      const res = await axios.delete<{
        success: boolean;
        message: string;
        count: number;
      }>("/api/v1/private/keys", { data: { ids } });
      await get().fetchKeys();
      set({ selectedKeyIds: [] });
      return { success: true, count: res.data.count };
    } catch (err: any) {
      const error =
        err.response?.data?.error || "ไม่สามารถลบคีย์ที่เลือกได้";
      return { success: false, error };
    }
  },

  deleteAllKeys: async () => {
    try {
      const res = await axios.delete<{
        success: boolean;
        message: string;
        count: number;
      }>("/api/v1/private/keys");
      await get().fetchKeys();
      set({ selectedKeyIds: [] });
      return { success: true, count: res.data.count };
    } catch (err: any) {
      const error =
        err.response?.data?.error || "ไม่สามารถลบคีย์ทั้งหมดได้";
      return { success: false, error };
    }
  },

  resetHwidAdmin: async (id) => {
    try {
      await axios.post(`/api/v1/private/keys/${id}/reset-hwid`);
      await get().fetchKeys();
      return { success: true };
    } catch (err: any) {
      const error = err.response?.data?.error || "ไม่สามารถรีเซ็ต HWID ได้";
      return { success: false, error };
    }
  },

  addTimeToKey: async (id, days) => {
    try {
      await axios.post("/api/v1/private/keys/add-time", { keyId: id, days });
      await get().fetchKeys();
      set({ addingTimeToKey: null });
      return { success: true };
    } catch (err: any) {
      const error = err.response?.data?.error || "ไม่สามารถเพิ่มเวลาได้";
      return { success: false, error };
    }
  },

  addTimeToAll: async (days) => {
    try {
      const res = await axios.post<{
        success: boolean;
        message: string;
        count: number;
      }>("/api/v1/private/keys/add-time", { days });
      await get().fetchKeys();
      set({ isAddTimeAllOpen: false });
      return { success: true, count: res.data.count };
    } catch (err: any) {
      const error =
        err.response?.data?.error || "ไม่สามารถเพิ่มเวลาให้ทุกคีย์ได้";
      return { success: false, error };
    }
  },
}));
