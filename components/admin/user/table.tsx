"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Pencil,
  Trash2,
  User as UserIcon,
  Loader,
  AlertCircle,
  ShieldCheck,
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
import { useUserStore } from "@/store/userStore";
import ToolsUser from "./tools";
import DialogUser from "./dialog";
import AdminUserMobileCard from "./mobile/card";
import { toast } from "@/components/ui/toast";
import { isValidImageUrl } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export const TableUser = () => {
  const {
    users,
    isLoading,
    search,
    fetchUsers,
    setEditingUser,
    deletingUser,
    setDeletingUser,
    deleteUser,
  } = useUserStore();

  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(users.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedUsers = users.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      setIsDeleting(true);
      const res = await deleteUser(deletingUser.id);
      if (!res.success) {
        toast.error("เกิดข้อผิดพลาด", res.error || "ไม่สามารถลบผู้ใช้งานได้");
      } else {
        toast.success("สำเร็จ", "ลบผู้ใช้งานเรียบร้อยแล้ว");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header Tools */}
      <ToolsUser />

      {/* Mobile Card View (md:hidden) */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 w-full animate-pulse rounded-md border border-neutral-800 bg-neutral-900/50"
            />
          ))
        ) : users.length === 0 ? (
          <div className="rounded-md border border-neutral-800 bg-neutral-950 p-6">
            <Empty
              icon={UserIcon}
              title="ยังไม่มีข้อมูลผู้ใช้งาน"
              description={
                search
                  ? "ไม่พบผู้ใช้ที่ตรงกับการค้นหา"
                  : "ผู้ใช้งานจะปรากฏที่นี่เมื่อเข้าสู่ระบบด้วย Discord"
              }
            />
          </div>
        ) : (
          paginatedUsers.map((u) => (
            <AdminUserMobileCard
              key={u.id}
              user={u}
              onEdit={setEditingUser}
              onDelete={setDeletingUser}
            />
          ))
        )}
      </div>

      {/* Desktop Users Table (hidden on mobile) */}
      <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ข้อมูลผู้ใช้งาน</TableHead>
            <TableHead className="w-32">บทบาท</TableHead>
            <TableHead className="w-32 text-right">ยอดเงินคงเหลือ</TableHead>
            <TableHead className="w-40">วันที่สมัคร</TableHead>
            <TableHead className="w-24 text-center">จัดการ</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            // Skeleton Loading Rows
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-neutral-900" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-32 animate-pulse rounded bg-neutral-900" />
                      <div className="h-3 w-20 animate-pulse rounded bg-neutral-900" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-5 w-16 animate-pulse rounded bg-neutral-900" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="ml-auto h-4 w-20 animate-pulse rounded bg-neutral-900" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-28 animate-pulse rounded bg-neutral-900" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="mx-auto h-8 w-16 animate-pulse rounded bg-neutral-900" />
                </TableCell>
              </TableRow>
            ))
          ) : users.length === 0 ? (
            // Empty State
            <TableRow>
              <TableCell colSpan={5} className="p-6">
                <Empty
                  icon={UserIcon}
                  title="ยังไม่มีข้อมูลผู้ใช้งาน"
                  description={
                    search
                      ? "ไม่พบผู้ใช้ที่ตรงกับการค้นหา"
                      : "ผู้ใช้งานจะปรากฏที่นี่เมื่อเข้าสู่ระบบด้วย Discord"
                  }
                />
              </TableCell>
            </TableRow>
          ) : (
            // User Data Rows
            paginatedUsers.map((u) => (
              <TableRow key={u.id}>
                {/* Avatar on left, Name & Discord ID in flex-col */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-800 bg-neutral-900">
                      {isValidImageUrl(u.avatar) ? (
                        <Image
                          src={u.avatar!}
                          alt={u.name}
                          fill
                          className="object-cover"
                          unoptimized={u.avatar!.startsWith("http")}
                        />
                      ) : (
                        <UserIcon size={18} className="text-neutral-500" />
                      )}
                    </div>

                    {/* Name + Discord ID in flex-col */}
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium text-white">
                        {u.name}
                      </span>
                      <span className="truncate text-xs text-neutral-500">
                        ID: {u.discordId}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Role Badge */}
                <TableCell>
                  {u.role === "ADMIN" ? (
                    <span className="inline-flex items-center gap-1 rounded-sm border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400">
                      <ShieldCheck size={13} />
                      ADMIN
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-sm border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-xs font-medium text-neutral-400">
                      USER
                    </span>
                  )}
                </TableCell>

                {/* Balance */}
                <TableCell className="text-right">
                  <span className="text-sm font-semibold text-neutral-200">
                    ฿{Number(u.balance).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </span>
                </TableCell>

                {/* Created At */}
                <TableCell className="text-xs text-neutral-400">
                  {new Date(u.createdAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>

                {/* Action Buttons (Edit & Delete) */}
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => setEditingUser(u)}
                      className="flex h-8 w-8 items-center justify-center rounded-sm border border-neutral-800 text-neutral-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 cursor-pointer"
                      title="แก้ไขข้อมูลผู้ใช้"
                    >
                      <Pencil size={14} />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => setDeletingUser(u)}
                      className="flex h-8 w-8 items-center justify-center rounded-sm border border-neutral-800 text-neutral-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                      title="ลบผู้ใช้งาน"
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
      {!isLoading && users.length > 0 && (
        <Pagination
          currentPage={safePage}
          totalItems={users.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingUser}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeletingUser(null);
        }}
      >
        <DialogContent
          maxWidth="max-w-md"
          onClose={() => {
            if (!isDeleting) setDeletingUser(null);
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-red-500/20 bg-red-500/10 text-red-400">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                ยืนยันการลบผู้ใช้งาน
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน &quot;{deletingUser?.name}&quot;?
                (ID: {deletingUser?.discordId}) การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => {
                setDeletingUser(null);
              }}
              className="rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white cursor-pointer"
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
                "ลบผู้ใช้งาน"
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <DialogUser />
    </div>
  );
};

export default TableUser;
