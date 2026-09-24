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

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [imageError, setImageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories for dropdown options if not loaded
  useEffect(() => {
    if (isOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [isOpen, categories.length, fetchCategories]);

  // Sync form values when editingProduct or dialog open state changes
  useEffect(() => {
    setImageError(false);
    if (editingProduct) {
      setName(editingProduct.name);
      setPrice(String(editingProduct.price));
      setCategoryId(editingProduct.categoryId);
      setImage(editingProduct.image || "");
      setDescription(editingProduct.description || "");
      setErrors({});
    } else if (isCreateOpen) {
      setName("");
      setPrice("");
      setCategoryId("");
      setImage("");
      setDescription("");
      setErrors({});
    }
  }, [editingProduct, isCreateOpen]);

  const handleClose = () => {
    if (isSubmitting) return;
    setIsCreateOpen(false);
    setEditingProduct(null);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: ProductFormErrors = {};
    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = "กรุณาระบุชื่อสินค้า";
    }

    if (!categoryId) {
      newErrors.categoryId = "กรุณาเลือกหมวดหมู่สินค้า";
    }

    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice < 0) {
      newErrors.price = "กรุณาระบุราคาที่ถูกต้อง (มากกว่าหรือเท่ากับ 0)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});
      const trimmedImage = image.trim() || null;
      const trimmedDesc = description.trim() || null;

      if (isEditing && editingProduct) {
        const res = await updateProduct(editingProduct.id, {
          name: trimmedName,
          price: numPrice,
          categoryId,
          image: trimmedImage,
          description: trimmedDesc,
        });

        if (!res.success) {
          setErrors({ name: res.error || "ไม่สามารถอัปเดตสินค้าได้" });
          return;
        }

        toast.success("บันทึกข้อมูลสำเร็จ", `อัปเดตข้อมูลสินค้า "${trimmedName}" เรียบร้อยแล้ว`);
      } else {
        const res = await createProduct({
          name: trimmedName,
          price: numPrice,
          categoryId,
          image: trimmedImage,
          description: trimmedDesc,
        });

        if (!res.success) {
          setErrors({ name: res.error || "ไม่สามารถสร้างสินค้าได้" });
          return;
        }

        toast.success("สร้างสินค้าสำเร็จ", `เพิ่มสินค้า "${trimmedName}" เรียบร้อยแล้ว`);
      }

      handleClose();
    } finally {
      setIsSubmitting(false);
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
                {isValidImageUrl(image) && !imageError ? (
                  <Image
                    src={image.trim()}
                    alt={name || "ตัวอย่างรูปภาพสินค้า"}
                    fill
                    className="object-cover"
                    unoptimized={image.trim().startsWith("http")}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <ImageIcon size={32} className="text-neutral-600 mb-1.5" />
                    <span className="text-[11px] text-neutral-500">
                      {image.trim() && imageError
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
                  value={image}
                  onChange={(e) => {
                    setImage(e.target.value);
                    if (imageError) setImageError(false);
                  }}
                  disabled={isSubmitting}
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
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }
                  }}
                  disabled={isSubmitting}
                  className={errors.name ? "border-red-500/50 focus:border-red-500" : ""}
                  autoFocus
                />
                {errors.name && (
                  <span className="mt-1.5 block text-xs text-red-400 font-medium">
                    {errors.name}
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
                    value={categoryId}
                    onChange={(val) => {
                      setCategoryId(val);
                      if (errors.categoryId) {
                        setErrors((prev) => ({ ...prev, categoryId: undefined }));
                      }
                    }}
                    placeholder="เลือกหมวดหมู่..."
                    disabled={isSubmitting || categories.length === 0}
                  />
                  {errors.categoryId && (
                    <span className="mt-1.5 block text-xs text-red-400 font-medium">
                      {errors.categoryId}
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
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (errors.price) {
                        setErrors((prev) => ({ ...prev, price: undefined }));
                      }
                    }}
                    disabled={isSubmitting}
                    className={errors.price ? "border-red-500/50 focus:border-red-500" : ""}
                  />
                  {errors.price && (
                    <span className="mt-1.5 block text-xs text-red-400 font-medium">
                      {errors.price}
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleClose}
              className="rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white disabled:opacity-50 cursor-pointer"
            >
              ยกเลิก
            </button>

            <ButtonUI
              type="submit"
              disabled={isSubmitting || !name.trim() || !categoryId}
              isLoading={isSubmitting}
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
