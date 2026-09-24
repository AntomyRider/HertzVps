"use client";

import Image from "next/image";
import { Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { CategoryItem } from "@/store/categoryStore";
import { isValidImageUrl } from "@/lib/utils";

interface AdminCategoryMobileCardProps {
  category: CategoryItem;
  onEdit: (category: CategoryItem) => void;
  onDelete: (category: CategoryItem) => void;
}

export const AdminCategoryMobileCard = ({
  category,
  onEdit,
  onDelete,
}: AdminCategoryMobileCardProps) => {
  const formattedDate = new Date(category.createdAt).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-900/40 p-3.5 space-y-3 transition hover:border-neutral-700">
      {/* Top: Banner + Name */}
      <div className="flex items-center gap-3">
        <div className="relative aspect-[16/5] w-28 shrink-0 overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900">
          {isValidImageUrl(category.image) ? (
            <Image
              src={category.image!}
              alt={category.name}
              fill
              className="object-cover"
              unoptimized={category.image!.startsWith("http")}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon size={16} className="text-neutral-600" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-xs sm:text-sm font-semibold text-white">
            {category.name}
          </h4>
          <p className="text-[10px] text-neutral-500">ID: {category.id.slice(-6)}</p>
        </div>
      </div>

      {/* Bottom: Product count, Date & Actions */}
      <div className="flex items-center justify-between border-t border-neutral-900 pt-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-sm border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
            {category.productCount || 0} รายการ
          </span>
          <span className="text-[10px] text-neutral-500">{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="flex h-7.5 w-7.5 items-center justify-center rounded-sm border border-neutral-800 text-neutral-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
            title="แก้ไข"
          >
            <Pencil size={13} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(category)}
            className="flex h-7.5 w-7.5 items-center justify-center rounded-sm border border-neutral-800 text-neutral-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
            title="ลบ"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoryMobileCard;
