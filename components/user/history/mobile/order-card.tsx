"use client";

import Image from "next/image";
import { Package, Eye } from "lucide-react";
import { UserOrderItem } from "@/store/orderStore";
import { isValidImageUrl } from "@/lib/utils";

interface UserOrderMobileCardProps {
  order: UserOrderItem;
  onViewDetail: (order: UserOrderItem) => void;
}

export const UserOrderMobileCard = ({
  order,
  onViewDetail,
}: UserOrderMobileCardProps) => {
  const formattedDate = new Date(order.createdAt).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-md border border-neutral-800/80 bg-neutral-900/40 p-3 sm:p-4 space-y-3 transition hover:border-neutral-700">
      {/* Top: Product image + Name & ID */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900">
            {isValidImageUrl(order.productImage) ? (
              <Image
                src={order.productImage!}
                alt={order.productName}
                fill
                className="object-cover"
                unoptimized={order.productImage!.startsWith("http")}
              />
            ) : (
              <Package size={20} className="text-neutral-500" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="truncate text-xs sm:text-sm font-semibold text-white">
              {order.productName}
            </h4>
            <p className="mt-0.5 truncate text-[10px] sm:text-[11px] text-neutral-400">
              #{order.id.slice(-8)} • {formattedDate}
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="text-right shrink-0">
          <span className="text-xs sm:text-sm font-bold text-emerald-400">
            ฿{order.price.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Bottom: Quantity badge + View Data Action Button */}
      <div className="flex items-center justify-between gap-2 border-t border-neutral-800/60 pt-2.5 sm:pt-3">
        <span className="inline-flex items-center rounded-sm border border-neutral-800 bg-neutral-950 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium text-neutral-300 shrink-0">
          จำนวน x{order.quantity || 1} ชิ้น
        </span>

        <button
          type="button"
          onClick={() => onViewDetail(order)}
          className="inline-flex items-center gap-1.5 rounded-sm border border-neutral-800 bg-neutral-900 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-neutral-200 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 cursor-pointer shrink-0"
        >
          <Eye size={12} />
          <span>ดูข้อมูลสินค้า</span>
        </button>
      </div>
    </div>
  );
};

export default UserOrderMobileCard;
