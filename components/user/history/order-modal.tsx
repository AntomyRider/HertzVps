"use client";

import { useState } from "react";
import Image from "next/image";
import { Package, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ButtonUI from "@/components/ui/button";
import { useOrderStore } from "@/store/orderStore";
import { isValidImageUrl } from "@/lib/utils";

export const OrderModal = () => {
  const { viewingUserOrder, setViewingUserOrder } = useOrderStore();
  const [copied, setCopied] = useState(false);

  const isOpen = !!viewingUserOrder;

  const handleClose = () => {
    setViewingUserOrder(null);
    setCopied(false);
  };

  const handleCopyStock = () => {
    if (!viewingUserOrder?.deliveredStock) return;
    navigator.clipboard.writeText(viewingUserOrder.deliveredStock);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!viewingUserOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent maxWidth="max-w-lg" onClose={handleClose}>
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>ข้อมูลสินค้าที่ได้รับ</DialogTitle>
            <DialogDescription>
              รหัสคำสั่งซื้อ:{" "}
              <span className="text-neutral-300">
                {viewingUserOrder.id}
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Product Summary */}
          <div className="flex items-center gap-3 rounded-md border border-neutral-800/80 bg-neutral-900/40 p-3.5">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900">
              {isValidImageUrl(viewingUserOrder.productImage) ? (
                <Image
                  src={viewingUserOrder.productImage!}
                  alt={viewingUserOrder.productName}
                  fill
                  className="object-cover"
                  unoptimized={viewingUserOrder.productImage!.startsWith("http")}
                />
              ) : (
                <Package size={20} className="text-neutral-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-semibold text-white">
                {viewingUserOrder.productName}
              </h4>
              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-neutral-400">
                <span>
                  จำนวน:{" "}
                  <span className="font-semibold text-white">
                    {viewingUserOrder.quantity || 1} ชิ้น
                  </span>
                </span>
                <span>•</span>
                <span>
                  ราคาชำระ:{" "}
                  <span className="font-semibold text-emerald-400">
                    ฿{viewingUserOrder.price.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Delivered Stock Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-300">
                ข้อมูลรหัส / บัญชีสินค้า:
              </label>
              <button
                type="button"
                onClick={handleCopyStock}
                className="flex items-center gap-1.5 rounded-sm border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300 transition hover:border-neutral-700 hover:text-white cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400">คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>คัดลอกทั้งหมด</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative max-h-56 overflow-y-auto rounded-md border border-neutral-800 bg-neutral-950 p-3.5 text-xs text-neutral-200">
              <pre className="whitespace-pre-wrap break-all leading-relaxed select-all">
                {viewingUserOrder.deliveredStock || "ไม่มีข้อมูลสต็อก"}
              </pre>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <ButtonUI
              onClick={handleClose}
              className="w-full rounded-sm bg-neutral-800 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white"
            >
              ปิดหน้าต่าง
            </ButtonUI>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;
