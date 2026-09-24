"use client";

import {
  RotateCcw,
  CalendarPlus,
  Trash2,
  Copy,
  Check,
  Loader,
} from "lucide-react";
import Checkbox from "@/components/ui/checkbox";
import Toggle from "@/components/ui/toggle";
import { KeyItem } from "@/store/keyStore";
import { cn } from "@/lib/utils";

interface AdminKeyMobileCardProps {
  keyItem: KeyItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onCopy: (code: string, id: string) => void;
  isCopied: boolean;
  onToggleActive: (key: KeyItem) => void;
  isToggling: boolean;
  onResetHwid: (key: KeyItem) => void;
  isResetting: boolean;
  onAddTime: (key: KeyItem) => void;
  onDelete: (key: KeyItem) => void;
}

export const AdminKeyMobileCard = ({
  keyItem,
  isSelected,
  onToggleSelect,
  onCopy,
  isCopied,
  onToggleActive,
  isToggling,
  onResetHwid,
  isResetting,
  onAddTime,
  onDelete,
}: AdminKeyMobileCardProps) => {
  const isExpired =
    keyItem.expiresAt && new Date(keyItem.expiresAt).getTime() < Date.now();

  const formattedCreated = new Date(keyItem.createdAt).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={cn(
        "rounded-md border p-3.5 space-y-3 transition",
        isSelected
          ? "border-blue-500/40 bg-blue-500/5"
          : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
      )}
    >
      {/* Top: Select checkbox, Key code + copy, Toggle active */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(keyItem.id)}
            aria-label={`เลือกคีย์ ${keyItem.code}`}
          />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="truncate text-xs sm:text-sm font-semibold text-white">
              {keyItem.code}
            </span>
            <button
              type="button"
              onClick={() => onCopy(keyItem.code, keyItem.id)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-neutral-800 text-neutral-400 transition hover:border-neutral-700 hover:text-white cursor-pointer"
              title="คัดลอกรหัสคีย์"
            >
              {isCopied ? (
                <Check size={12} className="text-emerald-400" />
              ) : (
                <Copy size={12} />
              )}
            </button>
          </div>
        </div>

        {/* Toggle active switch */}
        <div className="shrink-0">
          <Toggle
            checked={keyItem.isActive}
            disabled={isToggling}
            onCheckedChange={() => onToggleActive(keyItem)}
            activeText="เปิด"
            inactiveText="ปิด"
            aria-label={`สลับสถานะคีย์ ${keyItem.code}`}
          />
        </div>
      </div>

      {/* Middle: HWID info */}
      <div className="flex items-center justify-between rounded-sm bg-neutral-950/60 px-2.5 py-1.5 text-[11px]">
        <span className="text-neutral-500">HWID:</span>
        {keyItem.hwid ? (
          <span
            className="truncate max-w-[200px] text-neutral-300"
            title={keyItem.hwid}
          >
            {keyItem.hwid}
          </span>
        ) : (
          <span className="text-neutral-500">ยังไม่ผูก HWID</span>
        )}
      </div>

      {/* Duration & Expiry */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-sm border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-neutral-300">
            {keyItem.durationDays || 30} วัน
          </span>
          <span className="text-[11px] text-neutral-500">{formattedCreated}</span>
        </div>

        {isExpired ? (
          <span className="inline-flex items-center rounded-sm border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
            หมดอายุแล้ว
          </span>
        ) : keyItem.expiresAt ? (
          <span className="text-[11px] text-neutral-400">
            หมดอายุ:{" "}
            {new Date(keyItem.expiresAt).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "short",
            })}
          </span>
        ) : (
          <span className="text-[11px] text-neutral-500">ไม่จำกัดวัน</span>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-end gap-1.5 border-t border-neutral-900 pt-2.5">
        {/* Reset HWID Button */}
        <button
          type="button"
          disabled={!keyItem.hwid || isResetting}
          onClick={() => onResetHwid(keyItem)}
          className="flex h-7.5 items-center gap-1.5 rounded-sm border border-neutral-800 px-2.5 text-xs text-neutral-300 transition hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-30 cursor-pointer"
          title="รีเซ็ต HWID"
        >
          {isResetting ? (
            <Loader size={12} className="animate-spin" />
          ) : (
            <RotateCcw size={12} />
          )}
          <span>รีเซ็ต HWID</span>
        </button>

        {/* Add Time Button */}
        <button
          type="button"
          onClick={() => onAddTime(keyItem)}
          className="flex h-7.5 items-center gap-1.5 rounded-sm border border-neutral-800 px-2.5 text-xs text-neutral-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 cursor-pointer"
          title="เพิ่มวัน"
        >
          <CalendarPlus size={12} />
          <span>+วัน</span>
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => onDelete(keyItem)}
          className="flex h-7.5 w-7.5 items-center justify-center rounded-sm border border-neutral-800 text-neutral-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
          title="ลบ"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

export default AdminKeyMobileCard;
