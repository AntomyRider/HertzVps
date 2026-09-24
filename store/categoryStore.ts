import { create } from "zustand";
import axios from "axios";

export interface CategoryItem {
  id: string;
  name: string;
  image: string | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryProduct {
  id: string;
  name: string;
  price: number;
  stock: string;
  image: string | null;
  description: string | null;
  soldCount: number;
  createdAt: string;
}

export interface CategoryDetail {
  id: string;
  name: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  products: CategoryProduct[];
}

interface CategoryState {
  categories: CategoryItem[];
  currentCategory: CategoryDetail | null;
  isLoading: boolean;
  search: string;

  // Modals state
  isCreateOpen: boolean;
  editingCategory: CategoryItem | null;
  deletingCategory: CategoryItem | null;

  // Actions
  setSearch: (search: string) => void;
  setIsCreateOpen: (open: boolean) => void;
  setEditingCategory: (cat: CategoryItem | null) => void;
  setDeletingCategory: (cat: CategoryItem | null) => void;
  setCurrentCategory: (cat: CategoryDetail | null) => void;

  fetchCategories: (searchQuery?: string) => Promise<void>;
  fetchPublicCategories: (searchQuery?: string) => Promise<void>;
  fetchCategoryDetail: (id: string) => Promise<void>;
  createCategory: (data: { name: string; image?: string | null }) => Promise<{ success: boolean; error?: string }>;
  updateCategory: (id: string, data: { name?: string; image?: string | null }) => Promise<{ success: boolean; error?: string }>;
  deleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteAllCategories: () => Promise<{ success: boolean; error?: string; count?: number }>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  currentCategory: null,
  isLoading: true,
  search: "",

  isCreateOpen: false,
  editingCategory: null,
  deletingCategory: null,

  setSearch: (search) => set({ search }),
  setIsCreateOpen: (isCreateOpen) => set({ isCreateOpen }),
  setEditingCategory: (editingCategory) => set({ editingCategory }),
  setDeletingCategory: (deletingCategory) => set({ deletingCategory }),
  setCurrentCategory: (currentCategory) => set({ currentCategory }),

  fetchCategories: async (searchQuery) => {
    const query = searchQuery !== undefined ? searchQuery : get().search;
    set({ isLoading: true });
    try {
      const url = query.trim()
        ? `/api/v1/private/categories?search=${encodeURIComponent(query.trim())}`
        : "/api/v1/private/categories";
      const response = await axios.get<{ categories: CategoryItem[] }>(url);
      set({ categories: response.data.categories || [], isLoading: false });
    } catch (error) {
      console.error("fetchCategories error:", error);
      set({ categories: [], isLoading: false });
    }
  },

  fetchPublicCategories: async (searchQuery) => {
    const query = searchQuery !== undefined ? searchQuery : get().search;
    set({ isLoading: true });
    try {
      const url = query.trim()
        ? `/api/v1/public/categories?search=${encodeURIComponent(query.trim())}`
        : "/api/v1/public/categories";
      const response = await axios.get<{ categories: CategoryItem[] }>(url);
      set({ categories: response.data.categories || [], isLoading: false });
    } catch (error) {
      console.error("fetchPublicCategories error:", error);
      set({ categories: [], isLoading: false });
    }
  },

  fetchCategoryDetail: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.get<{ category: CategoryDetail }>(
        `/api/v1/public/categories/${id}`
      );
      set({
        currentCategory: response.data.category || null,
        isLoading: false,
      });
    } catch (error) {
      console.error("fetchCategoryDetail error:", error);
      set({ currentCategory: null, isLoading: false });
    }
  },

  createCategory: async (data) => {
    try {
      await axios.post("/api/v1/private/categories", data);
      await get().fetchCategories();
      set({ isCreateOpen: false });
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "ไม่สามารถสร้างหมวดหมู่ได้";
      return { success: false, error: errorMsg };
    }
  },

  updateCategory: async (id, data) => {
    try {
      await axios.patch(`/api/v1/private/categories/${id}`, data);
      await get().fetchCategories();
      set({ editingCategory: null });
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "ไม่สามารถอัปเดตหมวดหมู่ได้";
      return { success: false, error: errorMsg };
    }
  },

  deleteCategory: async (id) => {
    try {
      await axios.delete(`/api/v1/private/categories/${id}`);
      await get().fetchCategories();
      set({ deletingCategory: null });
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "ไม่สามารถลบหมวดหมู่ได้";
      return { success: false, error: errorMsg };
    }
  },

  deleteAllCategories: async () => {
    try {
      const res = await axios.delete<{ success: boolean; message: string; count: number }>(
        "/api/v1/private/categories"
      );
      await get().fetchCategories();
      return { success: true, count: res.data.count };
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error || "ไม่สามารถลบหมวดหมู่ทั้งหมดได้";
      return { success: false, error: errorMsg };
    }
  },
}));
