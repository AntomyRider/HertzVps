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
import ButtonUI from "@/components/ui/button";
import { useCategoryStore } from "@/store/categoryStore";
import { toast } from "@/components/ui/toast";
import { isValidImageUrl } from "@/lib/utils";

interface CategoryFormState {
  name: string;
  image: string;
  nameError: string | null;
  imageError: boolean;
  isSubmitting: boolean;
}

const INITIAL_CATEGORY_FORM: CategoryFormState = {
  name: "",
  image: "",
  nameError: null,
  imageError: false,
  isSubmitting: false,
};

export const DialogCategory = () => {
  const {
    isCreateOpen,
    setIsCreateOpen,
    editingCategory,
    setEditingCategory,
    createCategory,
    updateCategory,
  } = useCategoryStore();

  const isEditing = !!editingCategory;
  const isOpen = isCreateOpen || isEditing;

  const [form, setForm] = useState<CategoryFormState>(INITIAL_CATEGORY_FORM);

  const updateForm = (patch: Partial<CategoryFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  // Sync form values when editingCategory or dialog open state changes
  useEffect(() => {
    if (editingCategory) {
      setForm({
        name: editingCategory.name,
        image: editingCategory.image || "",
        nameError: null,
        imageError: false,
        isSubmitting: false,
      });
    } else if (isCreateOpen) {
      setForm(INITIAL_CATEGORY_FORM);
    }
  }, [editingCategory, isCreateOpen]);

  const handleClose = () => {
    if (form.isSubmitting) return;
    setIsCreateOpen(false);
    setEditingCategory(null);
    updateForm({ nameError: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = form.name.trim();
    if (!trimmedName) {
      updateForm({ nameError: "กรุณาระบุชื่อหมวดหมู่" });
      return;
    }

    try {
      updateForm({ isSubmitting: true, nameError: null });
      const payload = {
        name: trimmedName,
        image: form.image.trim() || null,
      };

      if (isEditing && editingCategory) {
        const res = await updateCategory(editingCategory.id, payload);

        if (!res.success) {
          updateForm({
            nameError: res.error || "ไม่สามารถอัปเดตหมวดหมู่ได้",
          });
          return;
        }

        toast.success(
          "บันทึกข้อมูลสำเร็จ",
          `อัปเดตหมวดหมู่ "${trimmedName}" เรียบร้อยแล้ว`,
        );
      } else {
        const res = await createCategory(payload);

        if (!res.success) {
          updateForm({
            nameError: res.error || "ไม่สามารถสร้างหมวดหมู่ได้",
          });
          return;
        }

        toast.success(
          "สร้างหมวดหมู่สำเร็จ",
          `สร้างหมวดหมู่ "${trimmedName}" เรียบร้อยแล้ว`,
        );
      }

      handleClose();
    } finally {
      updateForm({ isSubmitting: false });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent maxWidth="max-w-md" onClose={handleClose}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "แก้ไขหมวดหมู่สินค้า" : "เพิ่มหมวดหมู่สินค้าใหม่"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "แก้ไขข้อมูลรายละเอียดของหมวดหมู่นี้ในระบบ"
                : "กรอกข้อมูลเพื่อสร้างหมวดหมู่สินค้าใหม่"}
            </DialogDescription>
          </DialogHeader>

          {/* Form Fields */}
          <div className="space-y-3.5 py-1">
            {/* Category Name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                ชื่อหมวดหมู่ <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                placeholder="เช่น Roblox, Steam, สินค้าทั่วไป..."
                value={form.name}
                onChange={(e) =>
                  updateForm({
                    name: e.target.value,
                    nameError: null,
                  })
                }
                disabled={form.isSubmitting}
                className={
                  form.nameError ? "border-red-500/50 focus:border-red-500" : ""
                }
                autoFocus
              />
              {form.nameError && (
                <span className="mt-1.5 block text-xs text-red-400 font-medium">
                  {form.nameError}
                </span>
              )}
            </div>

            {/* Category Image URL */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                รูปภาพหมวดหมู่
              </label>
              <Input
                type="url"
                placeholder="https://example.com/image.png"
                value={form.image}
                onChange={(e) =>
                  updateForm({
                    image: e.target.value,
                    imageError: false,
                  })
                }
                disabled={form.isSubmitting}
              />
            </div>

            {/* Image Preview Box */}
            {form.image.trim() && (
                <div className="relative aspect-[16/4] w-full overflow-hidden rounded-sm border border-neutral-800 bg-neutral-950 flex flex-col items-center justify-center">
                  {" "}
                  {isValidImageUrl(form.image) && !form.imageError ? (
                    <Image
                      src={form.image.trim()}
                      alt="ตัวอย่างรูปหมวดหมู่"
                      fill
                      className="object-cover"
                      unoptimized={form.image.trim().startsWith("http")}
                      onError={() => updateForm({ imageError: true })}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <ImageIcon
                        size={32}
                        className="text-neutral-600 mb-1.5"
                      />
                      <span className="text-2xs text-neutral-500">
                        {form.imageError
                          ? "ไม่สามารถโหลดรูปภาพได้"
                          : "URL รูปภาพไม่ถูกต้อง"}
                      </span>
                    </div>
                  )}
                </div>
            )}
          </div>

          <DialogFooter>
            <button
              type="button"
              disabled={form.isSubmitting}
              onClick={handleClose}
              className="rounded-full border border-neutral-800 px-4 py-2 text-xs  text-neutral-400 transition hover:bg-neutral-900 hover:text-white disabled:opacity-50 cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>

            <ButtonUI
              type="submit"
              disabled={form.isSubmitting || !form.name.trim()}
              isLoading={form.isSubmitting}
              className=" px-5 py-2 text-xs text-white transition  disabled:opacity-50 cursor-pointer"
            >
              {isEditing ? "บันทึกการแก้ไข" : "สร้างหมวดหมู่"}
            </ButtonUI>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCategory;
