"use client";

import Image from "next/image";
import { Landmark } from "lucide-react";
import { PaymentItem } from "@/store/paymentStore";

interface UserPaymentMobileCardProps {
  payment: PaymentItem;
}

export const UserPaymentMobileCard = ({
  payment,
}: UserPaymentMobileCardProps) => {
  const formattedDate = new Date(payment.createdAt).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const renderStatusBadge = (status: PaymentItem["status"]) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center rounded-sm bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
            สำเร็จ
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center rounded-sm bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
            รอดำเนินการ
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center rounded-sm bg-red-500/20 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
            ไม่สำเร็จ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-sm bg-neutral-800 px-2.5 py-0.5 text-[10px] font-bold text-neutral-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="rounded-md border border-neutral-800/80 bg-neutral-900/40 p-3 sm:p-4 space-y-2.5 sm:space-y-3 transition hover:border-neutral-700">
      {/* Top: Channel & Amount */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-neutral-900 p-1.5 border border-neutral-800">
            {payment.method === "TRUEMONEY" ? (
              <Image
                src="/truemoney.png"
                alt="TrueMoney"
                width={20}
                height={20}
                className="h-full w-full object-contain"
              />
            ) : (
              <Landmark size={15} className="text-blue-400" />
            )}
          </div>
          <span className="truncate text-xs sm:text-sm font-semibold text-white">
            {payment.method === "TRUEMONEY" ? "TrueMoney Wallet" : "โอนผ่านธนาคาร"}
          </span>
        </div>

        <span className="text-xs sm:text-sm font-bold text-emerald-400 shrink-0">
          +฿{payment.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Details & Status */}
      <div className="flex items-center justify-between gap-2 border-t border-neutral-800/60 pt-2.5 sm:pt-3 text-xs">
        <div className="min-w-0 flex-1 pr-2">
          {payment.voucherCode ? (
            <p className="truncate text-[11px] text-neutral-300">
              ซอง: {payment.voucherCode}
            </p>
          ) : payment.senderName ? (
            <p className="truncate text-[11px] text-neutral-400">
              ผู้โอน: {payment.senderName}
            </p>
          ) : payment.note ? (
            <p className="truncate text-[11px] text-neutral-400">
              {payment.note}
            </p>
          ) : (
            <p className="text-[11px] text-neutral-500">-</p>
          )}
          <span className="text-[10px] text-neutral-500">{formattedDate}</span>
        </div>

        <div className="shrink-0">{renderStatusBadge(payment.status)}</div>
      </div>
    </div>
  );
};

export default UserPaymentMobileCard;
