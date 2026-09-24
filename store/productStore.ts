import { create } from "zustand";
import axios from "axios";

export interface ProductItem {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  price: number;
  stock: string;
  image: string | null;
  description: string | null;
  soldCount: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductState {
  products: ProductItem[];
  isLoading: boolean;
  search: string;
  selectedCategoryId: string;

  // Modals state
  isCreateOpen: boolean;
  editingProduct: ProductItem | null;
  deletingProduct: ProductItem | null;
  managingStockProduct: ProductItem | null;

  // Actions
  setSearch: (search: string) => void;
  setSelectedCategoryId: (categoryId: string) => void;
  setIsCreateOpen: (open: boolean) => void;
  setEditingProduct: (product: ProductItem | null) => void;
  setDeletingProduct: (product: ProductItem | null) => void;
  setManagingStockProduct: (product: ProductItem | null) => void;

  fetchProducts: (searchQuery?: string, categoryId?: string) => Promise<void>;
  createProduct: (data: {
    name: string;
    price: number;
    categoryId: string;
    image?: string | null;
    description?: string | null;
  }) => Promise<{ success: boolean; error?: string }>;
  updateProduct: (
    id: string,
    data: {
      name?: string;
      price?: number;
      categoryId?: string;
      image?: string | null;
      description?: string | null;
      stock?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  updateStock: (id: string, stock: string) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteAllProducts: () => Promise<{ success: boolean; error?: string; count?: number }>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: true,
  search: "",
  selectedCategoryId: "",

  isCreateOpen: false,
  editingProduct: null,
  deletingProduct: null,
  managingStockProduct: null,

  setSearch: (search) => set({ search }),
  setSelectedCategoryId: (selectedCategoryId) => set({ selectedCategoryId }),
  setIsCreateOpen: (isCreateOpen) => set({ isCreateOpen }),
  setEditingProduct: (editingProduct) => set({ editingProduct }),
  setDeletingProduct: (deletingProduct) => set({ deletingProduct }),
  setManagingStockProduct: (managingStockProduct) => set({ managingStockProduct }),

  fetchProducts: async (searchQuery, categoryId) => {
    const query = searchQuery !== undefined ? searchQuery : get().search;
    const catId = categoryId !== undefined ? categoryId : get().selectedCategoryId;
    set({ isLoading: true });

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append("search", query.trim());
      if (catId.trim()) params.append("categoryId", catId.trim());

      const url = `/api/v1/private/products${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await axios.get<{ products: ProductItem[] }>(url);
      set({ products: response.data.products || [], isLoading: false });
    } catch (error) {
      console.error("fetchProducts error:", error);
      set({ products: [], isLoading: false });
    }
  },

  createProduct: async (data) => {
    try {
      await axios.post("/api/v1/private/products", data);
      await get().fetchProducts();
      set({ isCreateOpen: false });
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "ไม่สามารถสร้างสินค้าได้";
      return { success: false, error: errorMsg };
    }
  },

  updateProduct: async (id, data) => {
    try {
      await axios.patch(`/api/v1/private/products/${id}`, data);
      await get().fetchProducts();
      set({ editingProduct: null });
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "ไม่สามารถอัปเดตสินค้าได้";
      return { success: false, error: errorMsg };
    }
  },

  updateStock: async (id, stock) => {
    try {
      await axios.patch(`/api/v1/private/products/${id}`, { stock });
      await get().fetchProducts();
      set({ managingStockProduct: null });
      return { success: true };
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error || "ไม่สามารถอัปเดตสต็อกสินค้าได้";
      return { success: false, error: errorMsg };
    }
  },

  deleteProduct: async (id) => {
    try {
      await axios.delete(`/api/v1/private/products/${id}`);
      await get().fetchProducts();
      set({ deletingProduct: null });
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "ไม่สามารถลบสินค้าได้";
      return { success: false, error: errorMsg };
    }
  },

  deleteAllProducts: async () => {
    try {
      const res = await axios.delete<{ success: boolean; message: string; count: number }>(
        "/api/v1/private/products"
      );
      await get().fetchProducts();
      return { success: true, count: res.data.count };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "ไม่สามารถลบสินค้าทั้งหมดได้";
      return { success: false, error: errorMsg };
    }
  },
}));
