"use client";

import { useState } from "react";
import Image from "next/image";
import { User as UserIcon, Package, Copy, Check } from "lucide-react";
import Dialog, {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useOrderStore } from "@/store/orderStore";
import { isValidImageUrl } from "@/lib/utils";

export const DialogOrder = () => {
  const { viewingOrder, setViewingOrder } = useOrderStore();
  const [copied, setCopied] = useState(false);

  const isOpen = !!viewingOrder;

  const handleClose = () => {
    setViewingOrder(null);
    setCopied(false);
  };

  const handleCopyStock = () => {
    if (!viewingOrder?.deliveredStock) return;
    navigator.clipboard.writeText(viewingOrder.deliveredStock);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent maxWidth="max-w-lg" onClose={handleClose}>
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>รายละเอียดคำสั่งซื้อ</DialogTitle>
            <DialogDescription>
              รหัสคำสั่งซื้อ:{" "}
              <span className="font-medium text-neutral-300">
                {viewingOrder?.id}
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Buyer & Product Summary Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Buyer Card */}
            <div className="flex items-center gap-3 rounded-sm border border-neutral-800 bg-neutral-900/40 p-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-800 bg-neutral-900">
                {isValidImageUrl(viewingOrder?.userAvatar) ? (
                  <Image
                    src={viewingOrder!.userAvatar!}
                    alt={viewingOrder?.userName || "User"}
                    fill
                    className="object-cover"
                    unoptimized={viewingOrder!.userAvatar!.startsWith("http")}
                  />
                ) : (
                  <UserIcon size={16} className="text-neutral-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-neutral-500">
                  ผู้สั่งซื้อ
                </span>
                <span className="block truncate text-xs font-semibold text-white">
                  {viewingOrder?.userName}
                </span>
                <span className="block truncate text-[10px] text-neutral-500">
                  ID: {viewingOrder?.userDiscordId}
                </span>
              </div>
            </div>

            {/* Product Card */}
            <div className="flex items-center gap-3 rounded-sm border border-neutral-800 bg-neutral-900/40 p-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900">
                {isValidImageUrl(viewingOrder?.productImage) ? (
                  <Image
                    src={viewingOrder!.productImage!}
                    alt={viewingOrder?.productName || "Product"}
                    fill
                    className="object-cover"
                    unoptimized={viewingOrder!.productImage!.startsWith("http")}
                  />
                ) : (
                  <Package size={16} className="text-neutral-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-neutral-500">
                  สินค้าที่ซื้อ
                </span>
                <span className="block truncate text-xs font-semibold text-white">
                  {viewingOrder?.productName}
                </span>
                <span className="block text-xs font-semibold text-neutral-200">
                  ฿
                  {Number(viewingOrder?.price || 0).toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  <span className="text-[11px] font-normal text-neutral-400">
                    ({viewingOrder?.quantity || 1} ชิ้น)
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Delivered Stock Item */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-300">
                ข้อมูลสินค้าที่ส่งมอบ (Delivered Stock)
              </label>
              <button
                type="button"
                onClick={handleCopyStock}
                className="flex items-center gap-1 text-[11px] text-neutral-400 transition hover:text-white"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400">คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>คัดลอกข้อมูล</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-sm border border-neutral-800 bg-neutral-950 p-3 text-xs leading-relaxed text-blue-400 select-all whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
              {viewingOrder?.deliveredStock}
            </div>
          </div>

          {/* Order Metadata */}
          <div className="rounded-sm border border-neutral-800/80 bg-neutral-900/30 p-2.5 text-[11px] text-neutral-400 flex items-center justify-between">
            <span>วันที่ทำรายการ:</span>
            <span className="text-neutral-300">
              {viewingOrder &&
                new Date(viewingOrder.createdAt).toLocaleString("th-TH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
            </span>
          </div>

          {/* Footer */}
          <DialogFooter>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
            >
              ปิดหน้าต่าง
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogOrder;
