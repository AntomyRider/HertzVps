"use client";

import { useState } from "react";
import ButtonUI from "@/components/ui/button";
import { Plus, Trash, AlertTriangle, Loader2 } from "lucide-react";
import SearchUI from "@/components/ui/search";
import Dialog, { DialogContent } from "@/components/ui/dialog";
import FadeIn from "@/components/ui/fade-in";
import { useCategoryStore } from "@/store/categoryStore";
import { toast } from "@/components/ui/toast";

const ToolsCategory = () => {
  const {
    search,
    setSearch,
    fetchCategories,
    setIsCreateOpen,
    deleteAllCategories,
    categories,
  } = useCategoryStore();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    fetchCategories(val);
  };

  const handleDeleteAllConfirm = async () => {
    try {
      setIsDeleting(true);
      const res = await deleteAllCategories();
      if (!res.success) {
        toast.error("เกิดข้อผิดพลาด", res.error || "ไม่สามารถลบหมวดหมู่ทั้งหมดได้");
      } else {
        toast.success("สำเร็จ", "ลบหมวดหมู่ทั้งหมดเรียบร้อยแล้ว");
        setIsConfirmOpen(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <FadeIn
        direction="up"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        {/* Search Input */}
        <SearchUI
          value={search}
          onChange={handleSearchChange}
          placeholder="ค้นหาหมวดหมู่..."
          className="rounded-sm"
        />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          {/* Delete All Button */}
          <ButtonUI
            type="button"
            disabled={categories.length === 0 || isDeleting}
            onClick={() => setIsConfirmOpen(true)}
            className="flex items-center justify-center gap-2 rounded-sm bg-red-600/90 text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash size={16} />
            <span>ลบทั้งหมด</span>
          </ButtonUI>

          {/* Add Category Button */}
          <ButtonUI
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 rounded-sm bg-blue-600 text-white hover:bg-blue-500"
          >
            <Plus size={16} />
            <span>เพิ่มหมวดหมู่</span>
          </ButtonUI>
        </div>
      </FadeIn>

      {/* Delete All Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent maxWidth="max-w-sm" onClose={() => setIsConfirmOpen(false)}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-red-500/20 bg-red-500/10 text-red-400">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                ยืนยันการลบหมวดหมู่ทั้งหมด
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ทั้งหมด ({categories.length} รายการ)?
                การดำเนินการนี้ไม่สามารถย้อนกลับได้ และสินค้าที่ผูกไว้จะถูกลบไปด้วย
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setIsConfirmOpen(false)}
              className="rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteAllConfirm}
              className="flex items-center gap-1.5 rounded-sm bg-red-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
            >
              {isDeleting && <Loader2 size={13} className="animate-spin" />}
              <span>ยืนยันลบทั้งหมด</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ToolsCategory;
