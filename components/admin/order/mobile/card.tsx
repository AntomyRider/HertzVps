"use client";

import Image from "next/image";
import { Eye, Package, User as UserIcon } from "lucide-react";
import { OrderItem } from "@/store/orderStore";
import { isValidImageUrl } from "@/lib/utils";

interface AdminOrderMobileCardProps {
  order: OrderItem;
  onView: (order: OrderItem) => void;
}

export const AdminOrderMobileCard = ({
  order,
  onView,
}: AdminOrderMobileCardProps) => {
  const formattedDate = new Date(order.createdAt).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-900/40 p-3.5 space-y-3 transition hover:border-neutral-700">
      {/* Top: Buyer & Product */}
      <div className="flex items-start justify-between gap-3">
        {/* Buyer info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-800 bg-neutral-900">
            {isValidImageUrl(order.userAvatar) ? (
              <Image
                src={order.userAvatar!}
                alt={order.userName}
                fill
                className="object-cover"
                unoptimized={order.userAvatar!.startsWith("http")}
              />
            ) : (
              <UserIcon size={15} className="text-neutral-500" />
            )}
          </div>

          <div className="min-w-0">
            <h4 className="truncate text-xs sm:text-sm font-semibold text-white">
              {order.userName}
            </h4>
            <p className="truncate text-[10px] text-neutral-500">
              ID: {order.userDiscordId}
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="text-right shrink-0">
          <span className="text-xs sm:text-sm font-bold text-white">
            ฿{Number(order.price).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Product item preview */}
      <div className="flex items-center gap-2.5 rounded-sm bg-neutral-950/60 p-2.5">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900">
          {isValidImageUrl(order.productImage) ? (
            <Image
              src={order.productImage!}
              alt={order.productName}
              fill
              className="object-cover"
              unoptimized={order.productImage!.startsWith("http")}
            />
          ) : (
            <Package size={14} className="text-neutral-600" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-neutral-200">
            {order.productName}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-neutral-500">
            <span>Order #{order.id.slice(-6)}</span>
            <span>•</span>
            <span>จำนวน {order.quantity || 1} ชิ้น</span>
          </div>
        </div>
      </div>

      {/* Bottom: Delivered Stock preview & Action */}
      <div className="flex items-center justify-between border-t border-neutral-900 pt-2.5">
        <button
          type="button"
          onClick={() => onView(order)}
          className="truncate max-w-[170px] sm:max-w-[220px] rounded-sm border border-neutral-800/80 bg-neutral-900/60 px-2 py-1 text-left text-[11px] text-blue-400 transition hover:border-blue-500/40"
          title="ดูรายละเอียดสต็อกฉบับเต็ม"
        >
          <span className="truncate block">{order.deliveredStock}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-500">{formattedDate}</span>
          <button
            type="button"
            onClick={() => onView(order)}
            className="flex h-7.5 w-7.5 items-center justify-center rounded-sm border border-neutral-800 text-neutral-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 cursor-pointer"
            title="ดูรายละเอียดคำสั่งซื้อ"
          >
            <Eye size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderMobileCard;
