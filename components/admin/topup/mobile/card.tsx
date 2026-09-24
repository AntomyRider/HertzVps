"use client";

import Image from "next/image";
import { User as UserIcon } from "lucide-react";
import { PaymentItem } from "@/store/paymentStore";
import { isValidImageUrl } from "@/lib/utils";

interface AdminTopupMobileCardProps {
  payment: PaymentItem;
}

export const AdminTopupMobileCard = ({ payment }: AdminTopupMobileCardProps) => {
  const formattedDate = new Date(payment.createdAt).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-900/40 p-3.5 space-y-3 transition hover:border-neutral-700">
      {/* Top: User info & Amount */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {isValidImageUrl(payment.userAvatar) ? (
            <Image
              src={payment.userAvatar!}
              alt={payment.userName || "User"}
              width={34}
              height={34}
              className="h-8.5 w-8.5 rounded-full object-cover ring-1 ring-neutral-800 shrink-0"
              unoptimized={payment.userAvatar!.startsWith("http")}
            />
          ) : (
            <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800">
              <UserIcon size={16} />
            </div>
          )}

          <div className="min-w-0">
            <h4 className="truncate text-xs sm:text-sm font-semibold text-white">
              {payment.userName}
            </h4>
            <p className="truncate text-[10px] text-neutral-500">
              ID: {payment.userDiscordId}
            </p>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right shrink-0">
          <span className="text-xs sm:text-sm font-bold text-emerald-400">
            +฿{Number(payment.amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Middle: Details & Channel */}
      <div className="flex items-center justify-between rounded-sm bg-neutral-950/60 px-2.5 py-1.5 text-xs">
        <div className="min-w-0 flex-1 pr-2">
          {payment.voucherCode && (
            <p className="truncate text-[11px] text-neutral-300">
              รหัส: {payment.voucherCode}
            </p>
          )}
          <p className="truncate text-[10px] text-neutral-500">
            {payment.senderName ? `ผู้ส่ง: ${payment.senderName}` : payment.note || "-"}
          </p>
        </div>

        <span className="inline-flex items-center rounded-sm border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-400 shrink-0">
          TrueMoney
        </span>
      </div>

      {/* Bottom: Date & Status */}
      <div className="flex items-center justify-between border-t border-neutral-900 pt-2.5 text-xs">
        <span className="text-[10px] text-neutral-500">{formattedDate}</span>

        <span className="inline-flex items-center rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
          สำเร็จ
        </span>
      </div>
    </div>
  );
};

export default AdminTopupMobileCard;
