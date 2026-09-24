"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import {
  Package,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import Dialog, {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ButtonUI from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/components/ui/toast";
import { isValidImageUrl } from "@/lib/utils";

export interface ShopProductItem {
  id: string;
  name: string;
  price: number;
  stock: string;
  image: string | null;
  description?: string | null;
  soldCount?: number;
}

interface BuyDialogProps {
  product: ShopProductItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BuyDialog = ({ product, onClose, onSuccess }: BuyDialogProps) => {
  const { user, fetchUser } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchasedStock, setPurchasedStock] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isOpen = !!product;

  // Calculate available stock count
  const availableStock = product?.stock
    ? product.stock
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean).length
    : 0;

  // Reset quantity when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setPurchasedStock(null);
      setCopied(false);
    }
  }, [product]);

  const handleClose = () => {
    if (isSubmitting) return;
    setPurchasedStock(null);
    setCopied(false);
    onClose();
  };

  const handleCopy = () => {
    if (!purchasedStock) return;
    navigator.clipboard.writeText(purchasedStock);
    setCopied(true);
    toast.success("คัดลอกสำเร็จ", "คัดลอกข้อมูลสินค้าลงในคลิปบอร์ดแล้ว");
    setTimeout(() => setCopied(false), 2000);
  };

  const userBalance = Number(user?.balance || 0);
  const productPrice = Number(product?.price || 0);
  const totalPrice = productPrice * quantity;
  const isBalanceEnough = userBalance >= totalPrice;

  const handleConfirmBuy = async () => {
    if (!product || !user) return;

    if (!isBalanceEnough) {
      toast.warning(
        "ยอดเงินคงเหลือไม่เพียงพอ",
        `คุณมียอดเงิน ฿${userBalance.toFixed(2)} แต่ราคารวมคือ ฿${totalPrice.toFixed(2)} กรุณาเติมเงินก่อนทำรายการ`
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await axios.post<{
        success: boolean;
        order: { deliveredStock: string; newBalance: number };
      }>("/api/v1/user/buy", {
        productId: product.id,
        quantity,
      });

      if (res.data.success) {
        setPurchasedStock(res.data.order.deliveredStock);
        await fetchUser();
        toast.success("สั่งซื้อสินค้าสำเร็จ!", `คุณได้สั่งซื้อ ${product.name} จำนวน ${quantity} ชิ้นเรียบร้อยแล้ว`);
        onSuccess?.();
      }
    } catch (err: any) {
      toast.error(
        "สั่งซื้อสินค้าไม่สำเร็จ",
        err.response?.data?.error || "เกิดข้อผิดพลาดในการทำรายการสั่งซื้อ"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent maxWidth="max-w-2xl" onClose={handleClose}>
        <div className="space-y-4">
          {/* Header */}
          <DialogHeader>
            <DialogTitle>
              {purchasedStock ? "สั่งซื้อสำเร็จ!" : "สั่งซื้อสินค้า"}
            </DialogTitle>
            <DialogDescription>
              {purchasedStock
                ? `คุณได้รับสินค้าจำนวน ${quantity} ชิ้นเรียบร้อยแล้ว สามารถคัดลอกข้อมูลด้านล่างไปใช้งานได้ทันที`
                : "ตรวจสอบรายละเอียดและระบุจำนวนสินค้าที่ต้องการสั่งซื้อ"}
            </DialogDescription>
          </DialogHeader>

          {/* Success State */}
          {purchasedStock ? (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2 rounded-sm border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>
                  สั่งซื้อสำเร็จ! ยอดเงินคงเหลือของคุณได้รับการปรับปรุงแล้ว
                </span>
              </div>

              {/* Delivered Stock Display Box */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    ข้อมูลสินค้าที่คุณได้รับ:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-blue-400 transition hover:text-blue-300 cursor-pointer"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copied ? "คัดลอกแล้ว" : "คัดลอกข้อมูล"}</span>
                  </button>
                </div>

                <textarea
                  readOnly
                  rows={Math.min(8, Math.max(3, purchasedStock.split("\n").length))}
                  value={purchasedStock}
                  className="w-full resize-none rounded-sm border border-neutral-800 bg-neutral-900/60 p-3 text-xs text-neutral-200 outline-none leading-relaxed select-all"
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
              </div>

              {/* Navigation Actions */}
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                <Link
                  href="/history?tab=orders"
                  className="flex items-center justify-center rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-300 transition hover:bg-neutral-900 hover:text-white"
                >
                  ดูประวัติการสั่งซื้อทั้งหมด
                </Link>
                <ButtonUI
                  onClick={handleClose}
                  className="rounded-sm bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
                >
                  เสร็จสิ้น
                </ButtonUI>
              </div>
            </div>
          ) : (
            /* Purchase Flow Form */
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
                {/* Left Column: Product Thumbnail Preview */}
                <div className="flex flex-col items-center sm:items-stretch space-y-2.5">
                  <div className="relative aspect-square w-32 sm:w-full overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900">
                    {isValidImageUrl(product?.image) ? (
                      <Image
                        src={product!.image!}
                        alt={product?.name || "สินค้า"}
                        fill
                        className="object-cover"
                        unoptimized={product!.image!.startsWith("http")}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-600">
                        <Package size={36} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Name, Price, Description, Quantity & Balance */}
                <div className="flex flex-col justify-between space-y-3">
                  <div>
                    {/* Product Name */}
                    <h3 className="text-base font-bold text-white sm:text-lg tracking-tight">
                      {product?.name}
                    </h3>

                    {/* Price per unit */}
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xs text-neutral-400">ราคาต่อชิ้น:</span>
                      <span className="text-base font-bold text-white">
                        ฿
                        {productPrice.toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="mt-2 w-full rounded-sm border border-neutral-800/80 bg-neutral-900/40 p-2.5 text-xs text-neutral-300 leading-relaxed min-h-[50px] max-h-52 overflow-y-auto whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere]">
                      {product?.description || "ไม่มีคำอธิบายเพิ่มเติมสำหรับสินค้านี้"}
                    </div>
                  </div>

                  {/* Quantity Selector: แบบกรอก และปุ่ม + - */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-medium text-neutral-300">
                        จำนวนที่ต้องการซื้อ:
                      </label>
                      <span className="text-[11px] text-neutral-500">
                        (สูงสุด {availableStock} ชิ้น)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Decrement Button */}
                      <button
                        type="button"
                        disabled={quantity <= 1 || isSubmitting || availableStock <= 0}
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900 text-neutral-300 transition hover:border-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Minus size={14} />
                      </button>

                      {/* Manual Input */}
                      <input
                        type="number"
                        min="1"
                        max={availableStock > 0 ? availableStock : 1}
                        value={quantity}
                        disabled={isSubmitting || availableStock <= 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (isNaN(val) || val < 1) {
                            setQuantity(1);
                          } else if (val > availableStock) {
                            setQuantity(availableStock);
                          } else {
                            setQuantity(val);
                          }
                        }}
                        className="h-9 w-20 rounded-sm border border-neutral-800 bg-neutral-950 px-2 text-center text-sm font-semibold text-white outline-none focus:border-blue-500/60"
                      />

                      {/* Increment Button */}
                      <button
                        type="button"
                        disabled={
                          quantity >= availableStock ||
                          isSubmitting ||
                          availableStock <= 0
                        }
                        onClick={() =>
                          setQuantity((prev) => Math.min(availableStock, prev + 1))
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900 text-neutral-300 transition hover:border-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>

                      {/* Max button shortcut */}
                      {availableStock > 1 && (
                        <button
                          type="button"
                          disabled={isSubmitting || quantity === availableStock}
                          onClick={() => setQuantity(availableStock)}
                          className="rounded-sm border border-neutral-800 bg-neutral-900/60 px-2.5 py-2 text-[11px] font-medium text-neutral-400 transition hover:border-neutral-700 hover:text-white disabled:opacity-40"
                        >
                          สูงสุด
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary: Total & Balance verification */}
                  <div className="rounded-sm border border-neutral-800/80 bg-neutral-900/30 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">
                        ราคารวม ( {quantity} ชิ้น )
                      </span>
                      <span className="text-base font-bold text-white">
                        ฿
                        {totalPrice.toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    {user && (
                      <div className="border-t border-neutral-900 pt-2 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-neutral-400">
                          ยอดเงินในกระเป๋าของคุณ:
                        </span>
                        <span className="font-semibold text-emerald-400">
                          ฿
                          {userBalance.toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}

                    {user && !isBalanceEnough && (
                      <div className="flex items-start gap-1.5 rounded-sm border border-red-500/20 bg-red-500/10 p-2 text-[11px] text-red-400">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <div>
                          <span>
                            ยอดเงินไม่เพียงพอ (ขาด ฿
                            {(totalPrice - userBalance).toFixed(2)})
                          </span>
                          <div className="mt-0.5">
                            <Link
                              href="/topup"
                              className="font-medium text-blue-400 underline hover:text-blue-300"
                            >
                              กดที่นี่เพื่อเติมเงินเข้ากระเป๋า
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <DialogFooter>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleClose}
                  className="rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white disabled:opacity-50 cursor-pointer"
                >
                  ยกเลิก
                </button>

                {!user ? (
                  <a
                    href="/api/v1/auth/discord"
                    className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#5865F2] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#4752C4]"
                  >
                    เข้าสู่ระบบด้วย Discord เพื่อสั่งซื้อ
                  </a>
                ) : (
                  <ButtonUI
                    type="button"
                    disabled={
                      !isBalanceEnough ||
                      isSubmitting ||
                      availableStock <= 0 ||
                      quantity <= 0 ||
                      quantity > availableStock
                    }
                    isLoading={isSubmitting}
                    onClick={handleConfirmBuy}
                    className="flex min-w-[96px] items-center justify-center rounded-sm bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    ซื้อสินค้า
                  </ButtonUI>
                )}
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyDialog;
