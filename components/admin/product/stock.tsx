"use client";

import { useEffect, useState } from "react";
import Dialog, {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Textarea from "@/components/ui/textarea";
import ButtonUI from "@/components/ui/button";
import { useProductStore } from "@/store/productStore";
import { toast } from "@/components/ui/toast";

export const StockProductDialog = () => {
  const {
    managingStockProduct,
    setManagingStockProduct,
    updateStock,
  } = useProductStore();

  const isOpen = !!managingStockProduct;

  const [stockText, setStockText] = useState("");
  const [stockError, setStockError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (managingStockProduct) {
      setStockText(managingStockProduct.stock || "");
      setStockError(null);
    } else {
      setStockText("");
      setStockError(null);
    }
  }, [managingStockProduct]);

  const handleClose = () => {
    if (isSubmitting) return;
    setManagingStockProduct(null);
    setStockError(null);
  };

  // 1 line = 1 stock item
  const validStockItems = stockText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const handleCleanEmptyLines = () => {
    setStockText(validStockItems.join("\n"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingStockProduct) return;

    try {
      setIsSubmitting(true);
      setStockError(null);

      // Save trimmed lines joined by newline
      const cleanedStock = validStockItems.join("\n");
      const res = await updateStock(managingStockProduct.id, cleanedStock);

      if (!res.success) {
        setStockError(res.error || "ไม่สามารถบันทึกสต็อกสินค้าได้");
        return;
      }

      toast.success("บันทึกสต็อกสำเร็จ", `อัปเดตสต็อกสินค้า ${validStockItems.length} ชิ้น เรียบร้อยแล้ว`);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent maxWidth="max-w-lg" onClose={handleClose}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              จัดการสต็อก: {managingStockProduct?.name}
            </DialogTitle>
            <DialogDescription>
              กรอกรายการสต็อกสินค้า 1 บรรทัดต่อ 1 ชิ้น (ระบบจะจ่ายสินค้าทีละบรรทัดเมื่อมีคำสั่งซื้อ)
            </DialogDescription>
          </DialogHeader>

          {/* Real-time Summary Badge & Tools */}
          <div className="flex items-center justify-between border-y border-neutral-800/80 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">จำนวนสต็อกที่พร้อมขาย:</span>
              <span className="rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-400">
                {validStockItems.length} ชิ้น
              </span>
            </div>

            {validStockItems.length > 0 && (
              <button
                type="button"
                onClick={handleCleanEmptyLines}
                className="text-[11px] text-neutral-400 underline transition hover:text-white cursor-pointer"
              >
                ลบบรรทัดว่าง
              </button>
            )}
          </div>

          {/* Textarea for Stock input */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-300">
              รายการสต็อกสินค้า
            </label>
            <Textarea
              rows={8}
              placeholder={`รหัสสินค้า / ข้อมูลไอดีบรรทัดละ 1 ชิ้น\nuser1:pass1\nuser2:pass2\nTOKEN-XYZ-12345`}
              value={stockText}
              onChange={(e) => {
                setStockText(e.target.value);
                if (stockError) setStockError(null);
              }}
              disabled={isSubmitting}
              className={`text-xs leading-relaxed ${stockError ? "border-red-500/50 focus:border-red-500" : ""}`}
            />
            {stockError && (
              <span className="mt-1.5 block text-xs text-red-400 font-medium">
                {stockError}
              </span>
            )}
            <span className="mt-1.5 block text-[11px] text-neutral-500">
              * ตัวอย่าง: สามารถใส่เป็น License Key, ลิงก์ดาวน์โหลด, หรือ User:Pass ได้
            </span>
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
              disabled={isSubmitting}
              isLoading={isSubmitting}
              className="rounded-sm bg-blue-600 px-5 py-2 text-xs font-medium text-white transition hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
            >
              บันทึกสต็อกสินค้า
            </ButtonUI>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockProductDialog;
