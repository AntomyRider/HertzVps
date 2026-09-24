"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Pencil,
  Trash2,
  Image as ImageIcon,
  Loader,
  AlertCircle,
  Package,
} from "lucide-react";
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCategoryStore } from "@/store/categoryStore";
import Empty from "@/components/ui/empty";
import Pagination from "@/components/ui/pagination";
import ToolsCategory from "./tools";
import DialogCategory from "./dialog";
import AdminCategoryMobileCard from "./mobile/card";
import { toast } from "@/components/ui/toast";
import { isValidImageUrl } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export const TableCategory = () => {
  const {
    categories,
    isLoading,
    search,
    setEditingCategory,
    deletingCategory,
    setDeletingCategory,
    fetchCategories,
    deleteCategory,
  } = useCategoryStore();

  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(categories.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCategories = categories.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    try {
      setIsDeleting(true);
      const res = await deleteCategory(deletingCategory.id);
      if (!res.success) {
        toast.error("เกิดข้อผิดพลาด", res.error || "ไม่สามารถลบหมวดหมู่ได้");
      } else {
        toast.success("สำเร็จ", "ลบหมวดหมู่เรียบร้อยแล้ว");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header Actions */}
      <ToolsCategory />

      {/* Mobile Card View (md:hidden) */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 w-full animate-pulse rounded-md border border-neutral-800 bg-neutral-900/50"
            />
          ))
        ) : categories.length === 0 ? (
          <div className="rounded-md border border-neutral-800 bg-neutral-950 p-6">
            <Empty
              icon={Package}
              title="ยังไม่มีข้อมูลหมวดหมู่สินค้า"
              description={
                search
                  ? "ไม่พบหมวดหมู่ที่ตรงกับการค้นหา"
                  : "กดปุ่ม 'เพิ่มหมวดหมู่' เพื่อเริ่มต้นสร้างรายการใหม่"
              }
            />
          </div>
        ) : (
          paginatedCategories.map((cat) => (
            <AdminCategoryMobileCard
              key={cat.id}
              category={cat}
              onEdit={setEditingCategory}
              onDelete={setDeletingCategory}
            />
          ))
        )}
      </div>

      {/* Desktop Categories Table (hidden on mobile) */}
      <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">หมวดหมู่</TableHead>
            <TableHead className="w-36 text-center">จำนวนสินค้า</TableHead>
            <TableHead className="w-44">วันที่สร้าง</TableHead>
            <TableHead className="w-28 text-center">จัดการ</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            // Skeleton loading rows
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="text-center">
                  <div className="mx-auto h-11 w-16 animate-pulse rounded-lg bg-neutral-900" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-40 animate-pulse rounded bg-neutral-900" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="mx-auto h-4 w-16 animate-pulse rounded bg-neutral-900" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 animate-pulse rounded bg-neutral-900" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="mx-auto h-8 w-16 animate-pulse rounded bg-neutral-900" />
                </TableCell>
              </TableRow>
            ))
          ) : categories.length === 0 ? (
            // Empty state
            <TableRow>
              <TableCell colSpan={5} className="p-6">
                <Empty
                  icon={Package}
                  title="ยังไม่มีข้อมูลหมวดหมู่สินค้า"
                  description={
                    search
                      ? "ไม่พบหมวดหมู่ที่ตรงกับการค้นหา"
                      : "กดปุ่ม 'เพิ่มหมวดหมู่' เพื่อเริ่มต้นสร้างรายการใหม่"
                  }
                />
              </TableCell>
            </TableRow>
          ) : (
            // Category Rows
            paginatedCategories.map((cat) => (
              <TableRow key={cat.id}>
                {/* Image */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    {/* Image */}
                    <div className="relative aspect-[16/4] w-48 shrink-0 overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900">
                      {isValidImageUrl(cat.image) ? (
                        <Image
                          src={cat.image!}
                          alt={cat.name}
                          fill
                          className="object-cover"
                          unoptimized={cat.image!.startsWith("http")}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon size={18} className="text-neutral-600" />
                        </div>
                      )}
                    </div>

                    {/* Name + ID */}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {cat.name}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        ID: {cat.id}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Product Count */}
                <TableCell className="text-center">
                  <span className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
                    {cat.productCount} รายการ
                  </span>
                </TableCell>

                {/* Created Date */}
                <TableCell className="text-xs text-neutral-400">
                  {new Date(cat.createdAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(cat)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                      title="แก้ไข"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingCategory(cat)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                      title="ลบ"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>

      {/* Pagination (10 items per page) */}
      {!isLoading && categories.length > 0 && (
        <Pagination
          currentPage={safePage}
          totalItems={categories.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete Confirmation Modal using Reusable Dialog */}
      <Dialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <DialogContent
          maxWidth="max-w-sm"
          onClose={() => setDeletingCategory(null)}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-400">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                ยืนยันการลบหมวดหมู่
              </h3>
              <p className="mt-0.5 text-xs text-neutral-400">
                คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ &quot;
                {deletingCategory?.name}&quot;?
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeletingCategory(null)}
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
                "ลบหมวดหมู่"
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unified Create / Edit Category Dialog */}
      <DialogCategory />
    </div>
  );
};

export default TableCategory;
