"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Wallet,
  User as UserIcon,
  Copy,
  Check,
  Plus,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { UserSession } from "@/store/authStore";
import { isValidImageUrl } from "@/lib/utils";
import { DiscordIcon } from "@/components/user/utils/avatar";
import { toast } from "@/components/ui/toast";

interface UserProfileCardProps {
  user: UserSession;
  orderCount: number;
  paymentCount: number;
}

export const UserProfileCard = ({
  user,
  orderCount,
  paymentCount,
}: UserProfileCardProps) => {
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    if (!user.discordId) return;
    navigator.clipboard.writeText(user.discordId);
    setCopiedId(true);
    toast.success("คัดลอกแล้ว", "คัดลอก Discord ID ลงในคลิปบอร์ดแล้ว");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const balanceNumber = Number(user.balance || 0);

  return (
    <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 p-4 sm:p-5 md:p-6 transition">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left Side: Avatar & Identity Details */}
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          {/* Avatar with Ring */}
          <div className="relative shrink-0">
            {isValidImageUrl(user.avatar) ? (
              <Image
                src={user.avatar!}
                alt={user.name}
                width={56}
                height={56}
                className="h-13 w-13 sm:h-15 sm:w-15 rounded-full object-cover ring-2 ring-neutral-800"
                unoptimized={user.avatar!.startsWith("http")}
              />
            ) : (
              <div className="flex h-13 w-13 sm:h-15 sm:w-15 items-center justify-center rounded-full bg-blue-600 text-white ring-2 ring-neutral-800">
                <UserIcon size={26} />
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-[#5865F2]">
              <DiscordIcon className="h-3 w-3 fill-current" />
            </div>
          </div>

          {/* User Details */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="truncate text-base sm:text-lg font-bold text-white tracking-tight">
                {user.name}
              </h2>
            </div>

            {/* Discord ID with quick copy */}
            <div className="flex items-center gap-1.5 text-neutral-400">
              <span className="text-2xs text-neutral-500">Discord ID:</span>
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1 font-mono text-2xs text-neutral-300 hover:text-white transition cursor-pointer"
                title="คลิกเพื่อคัดลอก Discord ID"
              >
                <span>{user.discordId}</span>
                {copiedId ? (
                  <Check size={11} className="text-emerald-400" />
                ) : (
                  <Copy size={11} className="text-neutral-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Wallet Balance & Quick Summary Stats */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 border-t lg:border-t-0 border-neutral-900 pt-3 lg:pt-0">
          {/* Activity counters */}
          

          {/* Balance Box with Topup Action */}
          <div className="flex flex-1 sm:flex-initial items-center justify-between sm:justify-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <Wallet size={18} />
              </div>
              <div>
                <span className="block text-2xs font-medium text-neutral-400">
                  ยอดเงินคงเหลือ
                </span>
                <span className="text-sm sm:text-base font-bold text-emerald-400">
                  ฿{balanceNumber.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <Link
              href="/topup"
              className="inline-flex items-center gap-1 rounded-full bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-2xs font-semibold text-white transition cursor-pointer shrink-0"
            >
              <Plus size={12} />
              <span>เติมเงิน</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
