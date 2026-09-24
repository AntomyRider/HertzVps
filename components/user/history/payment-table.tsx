"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Landmark, Wallet, ExternalLink } from "lucide-react";
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Empty from "@/components/ui/empty";
import ButtonUI from "@/components/ui/button";
import { usePaymentStore, PaymentItem } from "@/store/paymentStore";
import UserPaymentMobileCard from "./mobile/payment-card";

export const PaymentHistoryTable = () => {
  const { userPayments, isLoadingUserPayments, fetchUserPayments } =
    usePaymentStore();

  useEffect(() => {
    fetchUserPayments();
  }, [fetchUserPayments]);

  const renderStatusBadge = (status: PaymentItem["status"]) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center rounded-sm bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
            สำเร็จ
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center rounded-sm bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
            รอดำเนินการ
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center rounded-sm bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
            ไม่สำเร็จ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-sm bg-neutral-800 px-2 py-0.5 text-[10px] font-bold text-neutral-400">
            {status}
          </span>
        );
    }
  };

  if (!isLoadingUserPayments && userPayments.length === 0) {
    return (
      <div className="py-12">
        <Empty
          icon={Wallet}
          title="ยังไม่มีประวัติการเติมเงิน"
          description="คุณยังไม่เคยทำรายการเติมเงินเข้าสู่ระบบ สามารถเติมเงินผ่าน TrueMoney ได้ทันที"
          action={
            <ButtonUI
              href="/topup"
              className="inline-flex items-center gap-2 rounded-sm bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
            >
              <span>เติมเงินตอนนี้</span>
              <ExternalLink size={13} />
            </ButtonUI>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Mobile Card View (md:hidden) */}
      <div className="flex flex-col gap-3 sm:gap-3.5 md:hidden">
        {isLoadingUserPayments ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 w-full animate-pulse rounded-md border border-neutral-800 bg-neutral-900/50"
            />
          ))
        ) : (
          userPayments.map((payment) => (
            <UserPaymentMobileCard key={payment.id} payment={payment} />
          ))
        )}
      </div>

      {/* Desktop Table View (hidden on mobile, visible on md+) */}
      <div className="hidden md:block">
        <Table wrapperClassName="rounded-md border border-neutral-800">
          <TableHeader>
            <TableRow>
              <TableHead>ช่องทาง</TableHead>
              <TableHead className="w-36">วันที่ทำรายการ</TableHead>
              <TableHead className="w-28 text-right">จำนวนเงิน</TableHead>
              <TableHead className="w-24 text-center">สถานะ</TableHead>
              <TableHead className="w-44">หมายเหตุ / รหัสอ้างอิง</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoadingUserPayments ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 shrink-0 animate-pulse rounded-sm bg-neutral-900" />
                      <div className="h-4 w-24 animate-pulse rounded-sm bg-neutral-900" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-3.5 w-24 animate-pulse rounded-sm bg-neutral-900" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto h-3.5 w-16 animate-pulse rounded-sm bg-neutral-900" />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="mx-auto h-5 w-14 animate-pulse rounded-sm bg-neutral-900" />
                  </TableCell>
                  <TableCell>
                    <div className="h-3.5 w-32 animate-pulse rounded-sm bg-neutral-900" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              userPayments.map((payment) => {
                const formattedDate = new Date(
                  payment.createdAt
                ).toLocaleDateString("th-TH", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <TableRow
                    key={payment.id}
                    className="transition hover:bg-neutral-900/40"
                  >
                    {/* Channel / Method */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-neutral-900 p-1">
                          {payment.method === "TRUEMONEY" ? (
                            <Image
                              src="/truemoney.png"
                              alt="TrueMoney"
                              width={22}
                              height={22}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <Landmark size={15} className="text-blue-400" />
                          )}
                        </div>
                        <span className="text-xs font-semibold text-white">
                          {payment.method === "TRUEMONEY"
                            ? "TrueMoney"
                            : "ธนาคาร / QR"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-neutral-400 whitespace-nowrap">
                      {formattedDate}
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="text-right">
                      <span className="text-xs font-semibold text-emerald-400">
                        +฿
                        {payment.amount.toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      {renderStatusBadge(payment.status)}
                    </TableCell>

                    {/* Note / Ref */}
                    <TableCell className="text-xs text-neutral-400">
                      <div className="max-w-[200px] truncate">
                        {payment.voucherCode ? (
                          <span className="text-[11px] text-neutral-300">
                            ซอง: {payment.voucherCode}
                          </span>
                        ) : payment.senderName ? (
                          <span>ผู้โอน: {payment.senderName}</span>
                        ) : payment.note ? (
                          <span>{payment.note}</span>
                        ) : (
                          <span className="text-neutral-600">-</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PaymentHistoryTable;
