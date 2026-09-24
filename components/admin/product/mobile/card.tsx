"use client";

import Image from "next/image";
import {
  Pencil,
  Trash2,
  Boxes,
  ImageOff,
} from "lucide-react";
import { ProductItem } from "@/store/productStore";
import { cn, isValidImageUrl } from "@/lib/utils";

interface AdminProductMobileCardProps {
  product: ProductItem;
  onEdit: (product: ProductItem) => void;
  onDelete: (product: ProductItem) => void;
  onManageStock: (product: ProductItem) => void;
}

export const AdminProductMobileCard = ({
  product,
  onEdit,
  onDelete,
  onManageStock,
}: AdminProductMobileCardProps) => {
  const stockCount = product.stock
    ? product.stock.split("\n").map((l) => l.trim()).filter(Boolean).length
    : 0;

  const formattedDate = new Date(product.createdAt).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-900/40 p-3.5 space-y-3 transition hover:border-neutral-700">
      {/* Top: Image, Name, Category & Price */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900">
            {isValidImageUrl(product.image) ? (
              <Image
                src={product.image!}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized={product.image!.startsWith("http")}
              />
            ) : (
              <ImageOff size={16} className="text-neutral-600" />
            )}
          </div>

          <div className="min-w-0">
            <h4 className="truncate text-xs sm:text-sm font-semibold text-white">
              {product.name}
            </h4>
            <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center rounded-sm border border-neutral-800 bg-neutral-900 px-1.5 py-0.2 text-[10px] font-medium text-blue-400">
                {product.categoryName || "ทั่วไป"}
              </span>
              <span className="text-[10px] text-neutral-500">ID: {product.id.slice(-6)}</span>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="text-right shrink-0">
          <span className="text-xs sm:text-sm font-bold text-white">
            ฿{Number(product.price).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Middle: Stock status & Sales metrics */}
      <div className="flex items-center justify-between rounded-sm bg-neutral-950/60 px-2.5 py-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-400">สต็อก:</span>
          <span
            className={cn(
              "inline-flex items-center rounded-sm px-1.5 py-0.2 text-[10px] font-semibold",
              stockCount > 0
                ? "bg-neutral-800 text-neutral-200"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            )}
          >
            {stockCount} ชิ้น
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-neutral-500">ขายแล้ว {product.soldCount || 0} ชิ้น</span>
          <span className="text-neutral-600">•</span>
          <span className="text-emerald-400 font-medium">
            ฿{Number(product.totalRevenue || 0).toLocaleString("th-TH", { minimumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Bottom: Date & Actions */}
      <div className="flex items-center justify-between border-t border-neutral-900 pt-2.5">
        <span className="text-[11px] text-neutral-500">{formattedDate}</span>

        <div className="flex items-center gap-1.5">
          {/* Stock Button */}
          <button
            type="button"
            onClick={() => onManageStock(product)}
            className="flex h-7.5 w-7.5 items-center justify-center rounded-sm border border-neutral-800 text-neutral-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
            title="จัดการสต็อก"
          >
            <Boxes size={13} />
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="flex h-7.5 w-7.5 items-center justify-center rounded-sm border border-neutral-800 text-neutral-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
            title="แก้ไข"
          >
            <Pencil size={13} />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(product)}
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

export default AdminProductMobileCard;
