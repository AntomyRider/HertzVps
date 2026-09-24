"use client";

import Image from "next/image";
import { Pencil, Trash2, ShieldCheck, User as UserIcon } from "lucide-react";
import { UserItem } from "@/store/userStore";
import { isValidImageUrl } from "@/lib/utils";

interface AdminUserMobileCardProps {
  user: UserItem;
  onEdit: (user: UserItem) => void;
  onDelete: (user: UserItem) => void;
}

export const AdminUserMobileCard = ({
  user,
  onEdit,
  onDelete,
}: AdminUserMobileCardProps) => {
  const formattedDate = new Date(user.createdAt).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-900/40 p-3.5 space-y-3 transition hover:border-neutral-700">
      {/* Top: Avatar, Name, Discord ID & Role */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-800 bg-neutral-900">
            {isValidImageUrl(user.avatar) ? (
              <Image
                src={user.avatar!}
                alt={user.name}
                fill
                className="object-cover"
                unoptimized={user.avatar!.startsWith("http")}
              />
            ) : (
              <UserIcon size={18} className="text-neutral-500" />
            )}
          </div>

          <div className="min-w-0">
            <h4 className="truncate text-xs sm:text-sm font-semibold text-white">
              {user.name}
            </h4>
            <p className="truncate text-[10px] text-neutral-500">
              ID: {user.discordId}
            </p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="shrink-0">
          {user.role === "ADMIN" ? (
            <span className="inline-flex items-center gap-1 rounded-sm border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
              <ShieldCheck size={12} />
              ADMIN
            </span>
          ) : (
            <span className="inline-flex items-center rounded-sm border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
              USER
            </span>
          )}
        </div>
      </div>

      {/* Middle: Balance & Date */}
      <div className="flex items-center justify-between rounded-sm bg-neutral-950/60 px-2.5 py-1.5 text-xs">
        <span className="text-[11px] text-neutral-400">ยอดเงินคงเหลือ:</span>
        <span className="font-semibold text-emerald-400 text-xs sm:text-sm">
          ฿{Number(user.balance).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Bottom: Date & Actions */}
      <div className="flex items-center justify-between border-t border-neutral-900 pt-2.5">
        <span className="text-[11px] text-neutral-500">สมัครเมื่อ {formattedDate}</span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(user)}
            className="flex h-7.5 w-7.5 items-center justify-center rounded-sm border border-neutral-800 text-neutral-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 cursor-pointer"
            title="แก้ไขผู้ใช้"
          >
            <Pencil size={13} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(user)}
            className="flex h-7.5 w-7.5 items-center justify-center rounded-sm border border-neutral-800 text-neutral-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
            title="ลบผู้ใช้"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserMobileCard;
