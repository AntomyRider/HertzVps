"use client";

import { useState } from "react";
import ButtonUI from "@/components/ui/button";
import { Plus, Trash, AlertTriangle, Loader2, Clock } from "lucide-react";
import SearchUI from "@/components/ui/search";
import Dropdown, { DropdownOption } from "@/components/ui/dropdown";
import Dialog, { DialogContent } from "@/components/ui/dialog";
import { useKeyStore } from "@/store/keyStore";
import { toast } from "@/components/ui/toast";

const ToolsKey = () => {
  const {
    search,
    setSearch,
    durationFilter,
    setDurationFilter,
    fetchKeys,
    setIsCreateOpen,
    setIsAddTimeAllOpen,
    deleteAllKeys,
    deleteSelectedKeys,
    selectedKeyIds,
    clearSelectedKeys,
    keys,
  } = useKeyStore();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const hasSelection = selectedKeyIds.length > 0;

  // Collect any other unique durations from keys list
  const baseValues = new Set(["all", "1", "7", "30"]);
  const customDurations = Array.from(
    new Set(
      keys
        .map((k) => k.durationDays)
        .filter((d) => d && !baseValues.has(String(d)))
    )
  ).sort((a, b) => a - b);

  const durationOptions: DropdownOption[] = [
    { value: "all", label: "ทุกจำนวนวัน" },
    { value: "1", label: "1 วัน" },
    { value: "7", label: "7 วัน" },
    { value: "30", label: "30 วัน" },
    ...customDurations.map((d) => ({
      value: String(d),
      label: `${d} วัน`,
    })),
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    fetchKeys(val, durationFilter);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      if (hasSelection) {
        const res = await deleteSelectedKeys(selectedKeyIds);
        if (!res.success) {
          toast.error("เกิดข้อผิดพลาด", res.error || "ไม่สามารถลบคีย์ที่เลือกได้");
        } else {
          toast.success("สำเร็จ", "ลบคีย์ที่เลือกเรียบร้อยแล้ว");
          setIsConfirmOpen(false);
        }
      } else {
        const res = await deleteAllKeys();
        if (!res.success) {
          toast.error("เกิดข้อผิดพลาด", res.error || "ไม่สามารถลบคีย์ทั้งหมดได้");
        } else {
          toast.success("สำเร็จ", "ลบคีย์ทั้งหมดเรียบร้อยแล้ว");
          setIsConfirmOpen(false);
        }
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <SearchUI
            value={search}
            onChange={handleSearchChange}
            placeholder="ค้นหารหัสคีย์..."
            className="rounded-sm flex-1"
          />

          <div className="w-full sm:w-36">
            <Dropdown
              options={durationOptions}
              value={durationFilter}
              onChange={(val) => setDurationFilter(val)}
              placeholder="จำนวนวัน..."
              triggerClassName="h-10 text-xs bg-neutral-900 border-neutral-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          {/* Cancel Selection Button */}
          {hasSelection && (
            <button
              type="button"
              onClick={clearSelectedKeys}
              className="rounded-sm border border-neutral-800 px-3 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white cursor-pointer col-span-2 sm:col-span-1"
            >
              ยกเลิก ({selectedKeyIds.length})
            </button>
          )}

          {/* Add Time to All Keys Button */}
          <ButtonUI
            type="button"
            disabled={keys.length === 0}
            onClick={() => setIsAddTimeAllOpen(true)}
            className="flex items-center justify-center gap-2 rounded-sm border border-neutral-800 bg-neutral-900 text-xs font-medium text-neutral-300 transition hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Clock size={15} />
            <span>เพิ่มวันทั้งหมด</span>
          </ButtonUI>

          {/* Dynamic Delete Button */}
          <ButtonUI
            type="button"
            disabled={(!hasSelection && keys.length === 0) || isDeleting}
            onClick={() => setIsConfirmOpen(true)}
            className="flex items-center justify-center gap-2 rounded-sm bg-red-600/90 text-xs font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash size={15} />
            <span className="truncate">
              {hasSelection
                ? `ลบที่เลือก (${selectedKeyIds.length})`
                : "ลบทั้งหมด"}
            </span>
          </ButtonUI>

          {/* Create Key Button */}
          <ButtonUI
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 rounded-sm bg-blue-600 text-xs font-medium text-white transition hover:bg-blue-500 col-span-2 sm:col-span-1"
          >
            <Plus size={15} />
            <span>สร้างคีย์</span>
          </ButtonUI>
        </div>
      </div>

      {/* Dynamic Delete Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent
          maxWidth="max-w-sm"
          onClose={() => setIsConfirmOpen(false)}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-red-500/20 bg-red-500/10 text-red-400">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {hasSelection
                  ? "ยืนยันการลบคีย์ที่เลือก"
                  : "ยืนยันการลบคีย์ทั้งหมด"}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                {hasSelection
                  ? `คุณแน่ใจหรือไม่ว่าต้องการลบคีย์ที่เลือกไว้ (${selectedKeyIds.length} รายการ)? การดำเนินการนี้ไม่สามารถย้อนกลับได้`
                  : `คุณแน่ใจหรือไม่ว่าต้องการลบคีย์ทั้งหมดในระบบ (${keys.length} รายการ)? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setIsConfirmOpen(false)}
              className="rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="flex items-center gap-1.5 rounded-sm bg-red-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-500 disabled:opacity-50 cursor-pointer"
            >
              {isDeleting && <Loader2 size={13} className="animate-spin" />}
              <span>
                {hasSelection ? "ยืนยันลบที่เลือก" : "ยืนยันลบทั้งหมด"}
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ToolsKey;
