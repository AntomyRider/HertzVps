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

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form values when editingCategory or dialog open state changes
  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setImage(editingCategory.image || "");
      setNameError(null);
      setImageError(false);
    } else if (isCreateOpen) {
      setName("");
      setImage("");
      setNameError(null);
      setImageError(false);
    }
  }, [editingCategory, isCreateOpen]);

  const handleClose = () => {
    if (isSubmitting) return;
    setIsCreateOpen(false);
    setEditingCategory(null);
    setNameError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("กรุณาระบุชื่อหมวดหมู่");
      return;
    }

    try {
      setIsSubmitting(true);
      setNameError(null);
      const trimmedImage = image.trim() || null;

      if (isEditing && editingCategory) {
        const res = await updateCategory(editingCategory.id, {
          name: trimmedName,
          image: trimmedImage,
        });

        if (!res.success) {
          setNameError(res.error || "ไม่สามารถอัปเดตหมวดหมู่ได้");
          return;
        }

        toast.success("บันทึกข้อมูลสำเร็จ", `อัปเดตหมวดหมู่ "${trimmedName}" เรียบร้อยแล้ว`);
      } else {
        const res = await createCategory({
          name: trimmedName,
          image: trimmedImage,
        });

        if (!res.success) {
          setNameError(res.error || "ไม่สามารถสร้างหมวดหมู่ได้");
          return;
        }

        toast.success("สร้างหมวดหมู่สำเร็จ", `สร้างหมวดหมู่ "${trimmedName}" เรียบร้อยแล้ว`);
      }

      handleClose();
    } finally {
      setIsSubmitting(false);
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
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                disabled={isSubmitting}
                className={nameError ? "border-red-500/50 focus:border-red-500" : ""}
                autoFocus
              />
              {nameError && (
                <span className="mt-1.5 block text-xs text-red-400 font-medium">
                  {nameError}
                </span>
              )}
            </div>

            {/* Category Image URL */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                URL รูปภาพหมวดหมู่ (ไม่บังคับ)
              </label>
              <Input
                type="url"
                placeholder="https://example.com/image.png"
                value={image}
                onChange={(e) => {
                  setImage(e.target.value);
                  if (imageError) setImageError(false);
                }}
                disabled={isSubmitting}
              />
              <span className="mt-1 block text-[11px] text-neutral-500">
                แนะนำให้ใช้รูปภาพที่มีสัดส่วน 1:1 หรือแนวนอน
              </span>
            </div>

            {/* Image Preview Box */}
            {image.trim() && (
              <div className="rounded-sm border border-neutral-800 bg-neutral-900/40 p-3">
                <span className="mb-2 block text-xs font-medium text-neutral-400">
                  ตัวอย่างรูปภาพ
                </span>
                <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-neutral-800 bg-neutral-950 flex flex-col items-center justify-center">
                  {isValidImageUrl(image) && !imageError ? (
                    <Image
                      src={image.trim()}
                      alt="ตัวอย่างรูปหมวดหมู่"
                      fill
                      className="object-cover"
                      unoptimized={image.trim().startsWith("http")}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <ImageIcon size={32} className="text-neutral-600 mb-1.5" />
                      <span className="text-[11px] text-neutral-500">
                        {imageError
                          ? "ไม่สามารถโหลดรูปภาพได้"
                          : "URL รูปภาพไม่ถูกต้อง"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
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
              disabled={isSubmitting || !name.trim()}
              isLoading={isSubmitting}
              className="rounded-sm bg-blue-600 px-5 py-2 text-xs font-medium text-white transition hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
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
