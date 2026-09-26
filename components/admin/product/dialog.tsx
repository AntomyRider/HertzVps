"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import Dialog, {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Dropdown from "@/components/ui/dropdown";
import ButtonUI from "@/components/ui/button";
import { useProductStore } from "@/store/productStore";
import { useCategoryStore } from "@/store/categoryStore";
import { toast } from "@/components/ui/toast";
import { isValidImageUrl } from "@/lib/utils";

interface ProductFormErrors {
  name?: string;
  categoryId?: string;
  price?: string;
}

interface ProductFormState {
  name: string;
  price: string;
  categoryId: string;
  image: string;
  description: string;
  errors: ProductFormErrors;
  imageError: boolean;
  isSubmitting: boolean;
}

const INITIAL_PRODUCT_FORM: ProductFormState = {
  name: "",
  price: "",
  categoryId: "",
  image: "",
  description: "",
  errors: {},
  imageError: false,
  isSubmitting: false,
};

export const DialogProduct = () => {
  const {
    isCreateOpen,
    setIsCreateOpen,
    editingProduct,
    setEditingProduct,
    createProduct,
    updateProduct,
  } = useProductStore();

  const { categories, fetchCategories } = useCategoryStore();

  const isEditing = !!editingProduct;
  const isOpen = isCreateOpen || isEditing;

  const [form, setForm] = useState<ProductFormState>(INITIAL_PRODUCT_FORM);

  const updateForm = (patch: Partial<ProductFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  // Fetch categories for dropdown options if not loaded
  useEffect(() => {
    if (isOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [isOpen, categories.length, fetchCategories]);

  // Sync form values when editingProduct or dialog open state changes
  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        price: String(editingProduct.price),
        categoryId: editingProduct.categoryId,
        image: editingProduct.image || "",
        description: editingProduct.description || "",
        errors: {},
        imageError: false,
        isSubmitting: false,
      });
    } else if (isCreateOpen) {
      setForm(INITIAL_PRODUCT_FORM);
    }
  }, [editingProduct, isCreateOpen]);

  const handleClose = () => {
    if (form.isSubmitting) return;
    setIsCreateOpen(false);
    setEditingProduct(null);
    updateForm({ errors: {} });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: ProductFormErrors = {};
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      newErrors.name = "กรุณาระบุชื่อสินค้า";
    }

    if (!form.categoryId) {
      newErrors.categoryId = "กรุณาเลือกหมวดหมู่สินค้า";
    }

    const numPrice = Number(form.price);
    if (!form.price || isNaN(numPrice) || numPrice < 0) {
      newErrors.price = "กรุณาระบุราคาที่ถูกต้อง (มากกว่าหรือเท่ากับ 0)";
    }

    if (Object.keys(newErrors).length > 0) {
      updateForm({ errors: newErrors });
      return;
    }

    try {
      updateForm({ isSubmitting: true, errors: {} });
      const payload = {
        name: trimmedName,
        price: numPrice,
        categoryId: form.categoryId,
        image: form.image.trim() || null,
        description: form.description.trim() || null,
      };

      if (isEditing && editingProduct) {
        const res = await updateProduct(editingProduct.id, payload);

        if (!res.success) {
          updateForm({
            errors: { name: res.error || "ไม่สามารถอัปเดตสินค้าได้" },
          });
          return;
        }

        toast.success(
          "บันทึกข้อมูลสำเร็จ",
          `อัปเดตข้อมูลสินค้า "${trimmedName}" เรียบร้อยแล้ว`
        );
      } else {
        const res = await createProduct(payload);

        if (!res.success) {
          updateForm({
            errors: { name: res.error || "ไม่สามารถสร้างสินค้าได้" },
          });
          return;
        }

        toast.success(
          "สร้างสินค้าสำเร็จ",
          `เพิ่มสินค้า "${trimmedName}" เรียบร้อยแล้ว`
        );
      }

      handleClose();
    } finally {
      updateForm({ isSubmitting: false });
    }
  };

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent maxWidth="max-w-2xl" onClose={handleClose}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "แก้ไขข้อมูลรายละเอียดของสินค้าในระบบ"
                : "กรอกข้อมูลเพื่อสร้างรายการสินค้าใหม่"}
            </DialogDescription>
          </DialogHeader>

          {/* Form Body: Left 1:1 Image Preview + Right Fields */}
          <div className="grid grid-cols-1 gap-5 py-1 sm:grid-cols-[190px_1fr]">
            {/* Left Column: 1:1 Image Preview + Image Input below */}
            <div className="flex flex-col space-y-2">
              <span className="block text-xs font-medium text-neutral-400">
                รูปภาพตัวอย่าง (1:1)
              </span>
              <div className="relative aspect-square w-full overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900 flex flex-col items-center justify-center">
                {isValidImageUrl(form.image) && !form.imageError ? (
                  <Image
                    src={form.image.trim()}
                    alt={form.name || "ตัวอย่างรูปภาพสินค้า"}
                    fill
                    className="object-cover"
                    unoptimized={form.image.trim().startsWith("http")}
                    onError={() => updateForm({ imageError: true })}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <ImageIcon size={32} className="text-neutral-600 mb-1.5" />
                    <span className="text-[11px] text-neutral-500">
                      {form.image.trim() && form.imageError
                        ? "ไม่สามารถโหลดรูปภาพได้"
                        : "ยังไม่มีรูปภาพสินค้า"}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-400">
                  URL รูปภาพ
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/item.png"
                  value={form.image}
                  onChange={(e) =>
                    updateForm({
                      image: e.target.value,
                      imageError: false,
                    })
                  }
                  disabled={form.isSubmitting}
                />
                <span className="mt-1 block text-[10px] text-neutral-500">
                  แนะนำสัดส่วน 1:1 หรือแนวนอน
                </span>
              </div>
            </div>

            {/* Right Column: Other Inputs */}
            <div className="space-y-3">
              {/* Product Name */}
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-300">
                  ชื่อสินค้า <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="เช่น บัตรเติมเกม, ไอดีเริ่มต้น..."
                  value={form.name}
                  onChange={(e) =>
                    updateForm({
                      name: e.target.value,
                      errors: { ...form.errors, name: undefined },
                    })
                  }
                  disabled={form.isSubmitting}
                  className={form.errors.name ? "border-red-500/50 focus:border-red-500" : ""}
                  autoFocus
                />
                {form.errors.name && (
                  <span className="mt-1.5 block text-xs text-red-400 font-medium">
                    {form.errors.name}
                  </span>
                )}
              </div>

              {/* Category Dropdown & Price Row */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-300">
                    หมวดหมู่สินค้า <span className="text-red-400">*</span>
                  </label>
                  <Dropdown
                    options={categoryOptions}
                    value={form.categoryId}
                    onChange={(val) =>
                      updateForm({
                        categoryId: val,
                        errors: { ...form.errors, categoryId: undefined },
                      })
                    }
                    placeholder="เลือกหมวดหมู่..."
                    disabled={form.isSubmitting || categories.length === 0}
                  />
                  {form.errors.categoryId && (
                    <span className="mt-1.5 block text-xs text-red-400 font-medium">
                      {form.errors.categoryId}
                    </span>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-300">
                    ราคาขาย (บาท) <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) =>
                      updateForm({
                        price: e.target.value,
                        errors: { ...form.errors, price: undefined },
                      })
                    }
                    disabled={form.isSubmitting}
                    className={form.errors.price ? "border-red-500/50 focus:border-red-500" : ""}
                  />
                  {form.errors.price && (
                    <span className="mt-1.5 block text-xs text-red-400 font-medium">
                      {form.errors.price}
                    </span>
                  )}
                </div>
              </div>

              {/* Description Textarea */}
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-300">
                  รายละเอียด / คำอธิบายสินค้า
                </label>
                <Textarea
                  rows={4}
                  placeholder="รายละเอียดสินค้า เงื่อนไขการรับประกัน หรือคำแนะนำในการใช้งาน..."
                  value={form.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  disabled={form.isSubmitting}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              disabled={form.isSubmitting}
              onClick={handleClose}
              className="rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white disabled:opacity-50 cursor-pointer"
            >
              ยกเลิก
            </button>

            <ButtonUI
              type="submit"
              disabled={form.isSubmitting || !form.name.trim() || !form.categoryId}
              isLoading={form.isSubmitting}
              className="rounded-sm bg-blue-600 px-5 py-2 text-xs font-medium text-white transition hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
            >
              {isEditing ? "บันทึกข้อมูล" : "สร้างสินค้า"}
            </ButtonUI>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogProduct;
