"use client";

import { useEffect, useState } from "react";
import {
  RotateCcw,
  CalendarPlus,
  Trash2,
  Copy,
  Check,
  KeyRound,
  AlertCircle,
  Loader,
} from "lucide-react";
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Empty from "@/components/ui/empty";
import Pagination from "@/components/ui/pagination";
import Checkbox from "@/components/ui/checkbox";
import Toggle from "@/components/ui/toggle";
import { useKeyStore, KeyItem } from "@/store/keyStore";
import { toast } from "@/components/ui/toast";
import ToolsKey from "./tools";
import DialogKey from "./dialog";
import AdminKeyMobileCard from "./mobile/card";

const ITEMS_PER_PAGE = 10;

export const TableKey = () => {
  const {
    keys,
    isLoading,
    search,
    durationFilter,
    fetchKeys,
    toggleKeyActive,
    deleteKey,
    deletingKey,
    setDeletingKey,
    resetHwidAdmin,
    setAddingTimeToKey,
    selectedKeyIds,
    toggleSelectKey,
    selectAllKeys,
  } = useKeyStore();

  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingKeyId, setTogglingKeyId] = useState<string | null>(null);
  const [resettingKeyId, setResettingKeyId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, durationFilter]);

  const totalPages = Math.max(1, Math.ceil(keys.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedKeys = keys.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleToggleActive = async (key: KeyItem) => {
    try {
      setTogglingKeyId(key.id);
      const res = await toggleKeyActive(key.id, !key.isActive);
      if (!res.success) {
        toast.error("เกิดข้อผิดพลาด", res.error || "ไม่สามารถเปลี่ยนสถานะคีย์ได้");
      } else {
        toast.success(
          "เปลี่ยนสถานะสำเร็จ",
          !key.isActive ? "เปิดใช้งานคีย์เรียบร้อยแล้ว" : "ระงับการใช้งานคีย์เรียบร้อยแล้ว"
        );
      }
    } finally {
      setTogglingKeyId(null);
    }
  };

  const handleResetHwid = async (key: KeyItem) => {
    if (!key.hwid) return;
    try {
      setResettingKeyId(key.id);
      const res = await resetHwidAdmin(key.id);
      if (!res.success) {
        toast.error("เกิดข้อผิดพลาด", res.error || "ไม่สามารถรีเซ็ต HWID ได้");
      } else {
        toast.success("สำเร็จ", "รีเซ็ต HWID ของคีย์เรียบร้อยแล้ว");
      }
    } finally {
      setResettingKeyId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingKey) return;
    try {
      setIsDeleting(true);
      const res = await deleteKey(deletingKey.id);
      if (!res.success) {
        toast.error("เกิดข้อผิดพลาด", res.error || "ไม่สามารถลบคีย์ได้");
      } else {
        toast.success("สำเร็จ", "ลบคีย์เรียบร้อยแล้ว");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const isAllSelected =
    keys.length > 0 && selectedKeyIds.length === keys.length;

  return (
    <div className="w-full space-y-4">
      {/* Header Tools */}
      <ToolsKey />

      {/* Mobile Card View (md:hidden) */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-36 w-full animate-pulse rounded-md border border-neutral-800 bg-neutral-900/50"
            />
          ))
        ) : keys.length === 0 ? (
          <div className="rounded-md border border-neutral-800 bg-neutral-950 p-6">
            <Empty
              icon={KeyRound}
              title="ยังไม่มีข้อมูลคีย์ในระบบ"
              description={
                search
                  ? "ไม่พบคีย์ที่ตรงกับการค้นหา"
                  : "กดปุ่ม 'สร้างคีย์' เพื่อเริ่มต้นสร้างคีย์ใหม่สำหรับโปรแกรม Hertz Manager"
              }
            />
          </div>
        ) : (
          paginatedKeys.map((k) => (
            <AdminKeyMobileCard
              key={k.id}
              keyItem={k}
              isSelected={selectedKeyIds.includes(k.id)}
              onToggleSelect={toggleSelectKey}
              onCopy={handleCopyCode}
              isCopied={copiedKeyId === k.id}
              onToggleActive={handleToggleActive}
              isToggling={togglingKeyId === k.id}
              onResetHwid={handleResetHwid}
              isResetting={resettingKeyId === k.id}
              onAddTime={setAddingTimeToKey}
              onDelete={setDeletingKey}
            />
          ))
        )}
      </div>

      {/* Desktop Keys Table (hidden on mobile) */}
      <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            {/* Select All Checkbox */}
            <TableHead className="w-10 text-center">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={selectAllKeys}
                aria-label="เลือกทั้งหมด"
              />
            </TableHead>
            <TableHead>รหัสคีย์</TableHead>
            <TableHead className="">Hardware ID</TableHead>
            <TableHead className="w-36 text-center">สถานะ</TableHead>
            <TableHead className="w-28 text-center">จำนวนวัน</TableHead>
            <TableHead className="w-36">วันหมดอายุ</TableHead>
            <TableHead className="w-32">วันที่สร้าง</TableHead>
            <TableHead className="w-32 text-center">จัดการ</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            // Skeleton Loading Rows
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="text-center">
                  <div className="mx-auto h-4 w-4 animate-pulse rounded-sm bg-neutral-900" />
                </TableCell>
                <TableCell>
                  <div className="h-5 w-44 animate-pulse rounded bg-neutral-900" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-28 animate-pulse rounded bg-neutral-900" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="mx-auto h-5 w-24 animate-pulse rounded bg-neutral-900" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="mx-auto h-5 w-16 animate-pulse rounded bg-neutral-900" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 animate-pulse rounded bg-neutral-900" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 animate-pulse rounded bg-neutral-900" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="mx-auto h-8 w-24 animate-pulse rounded bg-neutral-900" />
                </TableCell>
              </TableRow>
            ))
          ) : keys.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="p-6">
                <Empty
                  icon={KeyRound}
                  title="ยังไม่มีข้อมูลคีย์ในระบบ"
                  description={
                    search
                      ? "ไม่พบคีย์ที่ตรงกับการค้นหา"
                      : "กดปุ่ม 'สร้างคีย์' เพื่อเริ่มต้นสร้างคีย์ใหม่สำหรับโปรแกรม Hertz Manager"
                  }
                />
              </TableCell>
            </TableRow>
          ) : (
            // Key Rows
            paginatedKeys.map((k) => {
              const isExpired =
                k.expiresAt && new Date(k.expiresAt).getTime() < Date.now();
              const isSelected = selectedKeyIds.includes(k.id);

              return (
                <TableRow
                  key={k.id}
                  className={isSelected ? "bg-neutral-900/30" : undefined}
                >
                  {/* Row Select Checkbox */}
                  <TableCell className="text-center">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelectKey(k.id)}
                      aria-label={`เลือกคีย์ ${k.code}`}
                    />
                  </TableCell>

                  {/* Key Code */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{k.code}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(k.code, k.id)}
                        className="flex h-6 w-6 items-center justify-center rounded border border-neutral-800 text-neutral-400 transition hover:border-neutral-700 hover:text-white cursor-pointer"
                        title="คัดลอกรหัสคีย์"
                      >
                        {copiedKeyId === k.id ? (
                          <Check size={12} className="text-emerald-400" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </TableCell>

                  <TableCell>
                    {k.hwid ? (
                      <div className="flex items-center gap-1.5">
                        <span
                          className="max-w-[150px] truncate text-xs text-neutral-300"
                          title={k.hwid}
                        >
                          {k.hwid}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center rounded-sm border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[11px] text-neutral-500">
                        ยังไม่ผูก HWID
                      </span>
                    )}
                  </TableCell>

                  {/* Status Toggle with inside text */}
                  <TableCell className="text-center">
                    <Toggle
                      checked={k.isActive}
                      disabled={togglingKeyId === k.id}
                      onCheckedChange={() => handleToggleActive(k)}
                      activeText="ใช้งานได้"
                      inactiveText="ปิดใช้งาน"
                      aria-label={`สลับสถานะคีย์ ${k.code}`}
                    />
                  </TableCell>

                  {/* Duration Days */}
                  <TableCell className="text-center">
                    <span className="inline-flex items-center rounded-sm border border-neutral-800 bg-neutral-900/60 px-2 py-0.5 text-xs font-medium text-neutral-300">
                      {k.durationDays || 30} วัน
                    </span>
                  </TableCell>

                  {/* Expiry Date */}
                  <TableCell>
                    {isExpired ? (
                      <span className="inline-flex items-center gap-1 rounded-sm border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                        หมดอายุแล้ว
                      </span>
                    ) : k.expiresAt ? (
                      <span className="text-xs text-neutral-300">
                        {new Date(k.expiresAt).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-500">-</span>
                    )}
                  </TableCell>

                  {/* Created At */}
                  <TableCell className="text-xs text-neutral-400">
                    {new Date(k.createdAt).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Reset HWID Button */}
                      <button
                        type="button"
                        disabled={!k.hwid || resettingKeyId === k.id}
                        onClick={() => handleResetHwid(k)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 transition hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                        title={
                          k.hwid
                            ? "รีเซ็ต HWID (ปลดล็อคเครื่อง)"
                            : "คีย์นี้ยังไม่ผูก HWID"
                        }
                      >
                        {resettingKeyId === k.id ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          <RotateCcw size={14} />
                        )}
                      </button>

                      {/* Add Time Button */}
                      <button
                        type="button"
                        onClick={() => setAddingTimeToKey(k)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 cursor-pointer"
                        title="เพิ่มเวลาใช้งาน (+วัน)"
                      >
                        <CalendarPlus size={14} />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDeletingKey(k)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                        title="ลบคีย์"
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
      {!isLoading && keys.length > 0 && (
        <Pagination
          currentPage={safePage}
          totalItems={keys.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete Single Key Confirmation Dialog */}
      <Dialog
        open={!!deletingKey}
        onOpenChange={(open) => !open && setDeletingKey(null)}
      >
        <DialogContent maxWidth="max-w-sm" onClose={() => setDeletingKey(null)}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-400">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                ยืนยันการลบคีย์
              </h3>
              <p className="mt-0.5 text-xs text-neutral-400">
                คุณแน่ใจหรือไม่ว่าต้องการลบคีย์ &quot;{deletingKey?.code}&quot;?
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeletingKey(null)}
              className="rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="flex min-w-[70px] items-center justify-center rounded-sm bg-red-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-500 disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? (
                <Loader size={14} className="animate-spin" />
              ) : (
                "ลบคีย์"
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create, Created Keys, and Add Time Dialogs */}
      <DialogKey />
    </div>
  );
};

export default TableKey;
