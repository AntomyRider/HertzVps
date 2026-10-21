"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User, Trash2, UserCog } from "lucide-react";
import SearchUI from "@/components/ui/search";
import ButtonUI from "@/components/ui/button";
import Empty from "@/components/ui/empty";
import { isValidImageUrl, cn } from "@/lib/utils";
import {
  useControllerStore,
  type ControllerAccountItem,
} from "@/store/controllerStore";
import CustomProfileDialog from "./accounts/custom-profile-dialog";

interface AccountsPanelProps {
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string) => void;
  className?: string;
}

export default function AccountsPanel({
  selectedAccountId,
  onSelectAccount,
  className,
}: AccountsPanelProps) {
  const {
    accounts,
    accountSearch,
    setAccountSearch,
    deleteAccount,
  } = useControllerStore();

  const [customProfileAccount, setCustomProfileAccount] =
    useState<ControllerAccountItem | null>(null);

  const filteredAccounts = accounts.filter((acc) => {
    const q = accountSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      acc.name.toLowerCase().includes(q) ||
      acc.fbId.toLowerCase().includes(q) ||
      acc.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className={cn("flex flex-col min-h-0 h-full", className)}>
      {/* Header: Title + Count Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-white">บัญชีผู้ใช้</h2>
          <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">
            {accounts.length}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-3">
        <SearchUI
          value={accountSearch}
          onChange={(e) => setAccountSearch(e.target.value)}
          placeholder="ค้นหาชื่อ หรือ ID..."
          className="w-full"
        />
      </div>

      {/* Accounts List */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
        {accounts.length === 0 ? (
          <Empty
            icon={User}
            title="ยังไม่มีบัญชีในระบบ"
            description="รอตัวโปรแกรมเชื่อมต่อและส่งข้อมูลบัญชี Facebook"
          />
        ) : filteredAccounts.length === 0 ? (
          <Empty
            icon={User}
            title="ไม่พบบัญชีที่ค้นหา"
            description={`ไม่พบรายการที่ตรงกับ "${accountSearch}"`}
          />
        ) : (
          filteredAccounts.map((acc) => {
            const isSelected = selectedAccountId === acc.id;

            return (
              <div
                key={acc.id}
                onClick={() => onSelectAccount(acc.id)}
                className={cn(
                  "group relative flex items-center justify-between rounded-xl border p-3 select-none cursor-pointer transition-all duration-150",
                  isSelected
                    ? "border-blue-500/60 bg-neutral-900 shadow-sm"
                    : "border-neutral-800/80 bg-neutral-950 hover:border-neutral-700 hover:bg-neutral-900/60"
                )}
              >
                {/* Left Active/Selected Indicator bar */}
                {isSelected && (
                  <div className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-blue-500" />
                )}

                {/* Left: Avatar + Account Info */}
                <div className="flex min-w-0 flex-1 items-center gap-3 pl-1">
                  {/* Avatar */}
                  <div
                    className={cn(
                      "relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-neutral-900 transition",
                      acc.isRunning
                        ? "border-blue-500/50 ring-1 ring-blue-500/30"
                        : "border-neutral-800"
                    )}
                  >
                    {isValidImageUrl(acc.avatar) ? (
                      <Image
                        src={acc.avatar!}
                        alt={acc.name}
                        width={40}
                        height={40}
                        unoptimized={acc.avatar!.startsWith("http")}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={18} className="text-neutral-400" />
                    )}
                  </div>

                  {/* Name & ID */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4
                        className={cn(
                          "truncate text-xs font-medium transition-colors",
                          isSelected
                            ? "text-white"
                            : "text-neutral-300 group-hover:text-blue-400"
                        )}
                        title={acc.name}
                      >
                        {acc.name}
                      </h4>
                      {acc.isRunning && (
                        <span className="shrink-0 rounded bg-blue-500/15 border border-blue-500/30 px-1.5 py-0.2 text-[10px] text-blue-400">
                          ทำงานอยู่
                        </span>
                      )}
                    </div>

                    <p
                      className="mt-0.5 truncate font-mono text-[11px] text-neutral-400"
                      title={`ID: ${acc.fbId || acc.id}`}
                    >
                      ID: {acc.fbId || acc.id}
                    </p>
                  </div>
                </div>

                {/* Right: Settings & Delete Account Button */}
                <div
                  className="relative z-10 ml-2 flex shrink-0 items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ButtonUI
                    type="button"
                    onClick={() => setCustomProfileAccount(acc)}
                    title={`ตั้งค่าบัญชี ${acc.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 cursor-pointer transition-colors p-0"
                  >
                    <UserCog size={13} />
                  </ButtonUI>

                  <ButtonUI
                    type="button"
                    onClick={() => deleteAccount(acc.id)}
                    title={`ลบบัญชี ${acc.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer transition-colors p-0"
                  >
                    <Trash2 size={13} />
                  </ButtonUI>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Custom Profile & Proxy Dialog */}
      <CustomProfileDialog
        isOpen={Boolean(customProfileAccount)}
        onClose={() => setCustomProfileAccount(null)}
        account={customProfileAccount}
      />
    </div>
  );
}
