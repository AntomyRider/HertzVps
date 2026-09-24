"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Wallet, User as UserIcon } from "lucide-react";
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Empty from "@/components/ui/empty";
import Pagination from "@/components/ui/pagination";
import { usePaymentStore } from "@/store/paymentStore";
import ToolsTopup from "./tools";
import AdminTopupMobileCard from "./mobile/card";
import { isValidImageUrl } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

const AdminPaymentsTable = () => {
  const {
    adminPayments,
    isLoadingAdminPayments,
    adminSearch,
    fetchAdminPayments,
  } = usePaymentStore();

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAdminPayments();
  }, [fetchAdminPayments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [adminSearch]);

  const totalPages = Math.max(
    1,
    Math.ceil(adminPayments.length / ITEMS_PER_PAGE)
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPayments = adminPayments.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full space-y-4">
      {/* Header Tools */}
      <ToolsTopup />

      {/* Mobile Card View (md:hidden) */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {isLoadingAdminPayments ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 w-full animate-pulse rounded-md border border-neutral-800 bg-neutral-900/50"
            />
          ))
        ) : adminPayments.length === 0 ? (
          <div className="rounded-md border border-neutral-800 bg-neutral-950 p-8">
            <Empty
              icon={Wallet}
              title="ไม่พบรายการชำระเงิน"
              description={
                adminSearch
                  ? "ไม่พบรายการที่ตรงกับคำค้นหา"
                  : "ยังไม่มีประวัติการเติมเงินในระบบ"
              }
            />
          </div>
        ) : (
          paginatedPayments.map((p) => (
            <AdminTopupMobileCard key={p.id} payment={p} />
          ))
        )}
      </div>

      {/* Desktop Payments Table (hidden on mobile, visible on md+) */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ผู้ใช้งาน</TableHead>
              <TableHead className="w-28 text-center">ช่องทาง</TableHead>
              <TableHead className="w-32 text-right">จำนวนเงิน</TableHead>
              <TableHead>รหัสซอง / รายละเอียด</TableHead>
              <TableHead className="w-36">วันที่ทำรายการ</TableHead>
              <TableHead className="w-24 text-center">สถานะ</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoadingAdminPayments ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-neutral-900" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-28 animate-pulse rounded bg-neutral-900" />
                        <div className="h-3 w-16 animate-pulse rounded bg-neutral-900" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="mx-auto h-5 w-16 animate-pulse rounded bg-neutral-900" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto h-4 w-16 animate-pulse rounded bg-neutral-900" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-36 animate-pulse rounded bg-neutral-900" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 animate-pulse rounded bg-neutral-900" />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="mx-auto h-5 w-14 animate-pulse rounded bg-neutral-900" />
                  </TableCell>
                </TableRow>
              ))
            ) : adminPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-8">
                  <Empty
                    icon={Wallet}
                    title="ไม่พบรายการชำระเงิน"
                    description={
                      adminSearch
                        ? "ไม่พบรายการที่ตรงกับคำค้นหา"
                        : "ยังไม่มีประวัติการเติมเงินในระบบ"
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedPayments.map((p) => (
                <TableRow key={p.id}>
                  {/* User Info */}
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      {isValidImageUrl(p.userAvatar) ? (
                        <Image
                          src={p.userAvatar!}
                          alt={p.userName || "User"}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover ring-1 ring-neutral-800"
                          unoptimized={p.userAvatar!.startsWith("http")}
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800">
                          <UserIcon size={14} />
                        </div>
                      )}
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-medium text-white text-xs sm:text-sm">
                          {p.userName}
                        </span>
                        <span className="truncate text-[11px] text-neutral-500">
                          {p.userDiscordId}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Method */}
                  <TableCell className="text-center">
                    <span className="inline-flex items-center rounded-sm border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-xs font-semibold text-orange-400">
                      TrueMoney
                    </span>
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="text-right">
                    <span className="text-xs font-semibold text-emerald-400">
                      +฿
                      {Number(p.amount).toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </TableCell>

                  {/* Voucher details / sender */}
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      {p.voucherCode && (
                        <span className="text-neutral-300 truncate max-w-[200px]">
                          รหัส: {p.voucherCode}
                        </span>
                      )}
                      <span className="text-[11px] text-neutral-500 truncate max-w-[200px]">
                        {p.senderName
                          ? `ผู้ส่ง: ${p.senderName}`
                          : p.note || "-"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-xs text-neutral-400">
                    {new Date(p.createdAt).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="text-center">
                    <span className="inline-flex items-center rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                      สำเร็จ
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination (10 items per page) */}
      {!isLoadingAdminPayments && adminPayments.length > 0 && (
        <Pagination
          currentPage={safePage}
          totalItems={adminPayments.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default AdminPaymentsTable;
