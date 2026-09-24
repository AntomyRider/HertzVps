"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Pencil,
  Trash2,
  Image as ImageIcon,
  ImageOff,
  Loader,
  AlertCircle,
  Package,
  Boxes,
} from "lucide-react";
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Dialog, { DialogContent } from "@/components/ui/dialog";
import Empty from "@/components/ui/empty";
import Pagination from "@/components/ui/pagination";
import { cn, isValidImageUrl } from "@/lib/utils";
import { useProductStore } from "@/store/productStore";
import ToolsProduct from "./tools";
import DialogProduct from "./dialog";
import StockProductDialog from "./stock";
import AdminProductMobileCard from "./mobile/card";
import { toast } from "@/components/ui/toast";

const ITEMS_PER_PAGE = 10;

export const TableProduct = () => {
  const {
    products,
    isLoading,
    search,
    selectedCategoryId,
    fetchProducts,
    setEditingProduct,
    deletingProduct,
    setDeletingProduct,
    setManagingStockProduct,
    deleteProduct,
  } = useProductStore();

  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategoryId]);

  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = products.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    try {
      setIsDeleting(true);
      const res = await deleteProduct(deletingProduct.id);
      if (!res.success) {
        toast.error("เกิดข้อผิดพลาด", res.error || "ไม่สามารถลบสินค้าได้");
      } else {
        toast.success("สำเร็จ", "ลบสินค้าเรียบร้อยแล้ว");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header Actions */}
      <ToolsProduct />

      {/* Mobile Card View (md:hidden) */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-36 w-full animate-pulse rounded-md border border-neutral-800 bg-neutral-900/50"
            />
          ))
        ) : products.length === 0 ? (
          <div className="rounded-md border border-neutral-800 bg-neutral-950 p-6">
            <Empty
              icon={Package}
              title="ยังไม่มีข้อมูลสินค้า"
              description={
                search
                  ? "ไม่พบสินค้าที่ตรงกับการค้นหา"
                  : "กดปุ่ม 'เพิ่มสินค้า' เพื่อเริ่มต้นสร้างรายการใหม่"
              }
            />
          </div>
        ) : (
          paginatedProducts.map((prod) => (
            <AdminProductMobileCard
              key={prod.id}
              product={prod}
              onEdit={setEditingProduct}
              onDelete={setDeletingProduct}
              onManageStock={setManagingStockProduct}
            />
          ))
        )}
      </div>

      {/* Desktop Products Table (hidden on mobile) */}
      <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>สินค้า</TableHead>
            <TableHead className="w-50">หมวดหมู่</TableHead>
            <TableHead className="w-24 text-center">สต็อก</TableHead>
            <TableHead className="w-32 text-center">ยอดขาย</TableHead>
            <TableHead className="w-28 text-right">ราคา</TableHead>
            <TableHead className="w-32">วันที่สร้าง</TableHead>
            <TableHead className="w-28 text-center">จัดการ</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            // Skeleton loading rows
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 animate-pulse rounded-sm bg-neutral-900" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-36 animate-pulse rounded bg-neutral-900" />
                      <div className="h-3 w-20 animate-pulse rounded bg-neutral-900" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 animate-pulse rounded bg-neutral-900" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="mx-auto h-4 w-12 animate-pulse rounded bg-neutral-900" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="mx-auto h-4 w-16 animate-pulse rounded bg-neutral-900" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="ml-auto h-4 w-16 animate-pulse rounded bg-neutral-900" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 animate-pulse rounded bg-neutral-900" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="mx-auto h-8 w-16 animate-pulse rounded bg-neutral-900" />
                </TableCell>
              </TableRow>
            ))
          ) : products.length === 0 ? (
            // Empty state
            <TableRow>
              <TableCell colSpan={7} className="p-6">
                <Empty
                  icon={Package}
                  title="ยังไม่มีข้อมูลสินค้า"
                  description={
                    search
                      ? "ไม่พบสินค้าที่ตรงกับการค้นหา"
                      : "กดปุ่ม 'เพิ่มสินค้า' เพื่อเริ่มต้นสร้างรายการใหม่"
                  }
                />
              </TableCell>
            </TableRow>
          ) : (
            // Product Rows
            paginatedProducts.map((prod) => {
              const stockCount = prod.stock
                ? prod.stock.split("\n").map((l) => l.trim()).filter(Boolean).length
                : 0;

              return (
                <TableRow key={prod.id}>
                  {/* Image on left, Name & ID flex-col */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* 1:1 Image Thumbnail */}
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900">
                        {isValidImageUrl(prod.image) ? (
                          <Image
                            src={prod.image!}
                            alt={prod.name}
                            fill
                            className="object-cover"
                            unoptimized={prod.image!.startsWith("http")}
                          />
                        ) : (
                          <ImageOff  size={16} className="text-neutral-600" />
                        )}
                      </div>

                      {/* Name + ID in flex-col */}
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-medium text-white">
                          {prod.name}
                        </span>
                        <span className="truncate  text-xs text-neutral-500">
                          ID: {prod.id}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <span className="inline-flex items-center rounded-sm border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-xs font-medium text-blue-400">
                      {prod.categoryName || "ทั่วไป"}
                    </span>
                  </TableCell>

                  {/* Stock Count */}
                  <TableCell className="text-center">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-sm border px-2 py-0.5  text-xs font-medium",
                        stockCount > 0
                          ? "border-neutral-800 bg-neutral-900 text-neutral-300"
                          : "border-red-500/20 bg-red-500/10 text-red-400"
                      )}
                    >
                      {stockCount} ชิ้น
                    </span>
                  </TableCell>

                  {/* Sales (Sold Count & Total Revenue) */}
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className=" text-xs font-semibold text-emerald-400">
                        {prod.soldCount || 0} ชิ้น
                      </span>
                      <span className=" text-[11px] text-neutral-500">
                        ฿{Number(prod.totalRevenue || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-right">
                    <span className=" text-sm font-semibold text-neutral-200">
                      ฿{Number(prod.price).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>

                  {/* Created Date */}
                  <TableCell className="text-xs text-neutral-400">
                    {new Date(prod.createdAt).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Stock Button */}
                      <button
                        type="button"
                        onClick={() => setManagingStockProduct(prod)}
                        className="flex h-8 w-8 items-center justify-center rounded-sm border border-neutral-800 text-neutral-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                        title="จัดการสต็อกสินค้า"
                      >
                        <Boxes size={14} />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => setEditingProduct(prod)}
                        className="flex h-8 w-8 items-center justify-center rounded-sm border border-neutral-800 text-neutral-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                        title="แก้ไข"
                      >
                        <Pencil size={14} />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDeletingProduct(prod)}
                        className="flex h-8 w-8 items-center justify-center rounded-sm border border-neutral-800 text-neutral-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                        title="ลบ"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      </div>

      {/* Pagination (10 items per page) */}
      {!isLoading && products.length > 0 && (
        <Pagination
          currentPage={safePage}
          totalItems={products.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
      >
        <DialogContent maxWidth="max-w-sm" onClose={() => setDeletingProduct(null)}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-red-500/20 bg-red-500/10 text-red-400">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                ยืนยันการลบสินค้า
              </h3>
              <p className="mt-0.5 text-xs text-neutral-400">
                คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า &quot;{deletingProduct?.name}&quot;?
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeletingProduct(null)}
              className="rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="flex min-w-[84px] items-center justify-center rounded-sm bg-red-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-500 disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? (
                <Loader size={14} className="animate-spin" />
              ) : (
                "ลบสินค้า"
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unified Create / Edit Product Dialog */}
      <DialogProduct />

      {/* Stock Management Dialog */}
      <StockProductDialog />
    </div>
  );
};

export default TableProduct;
