"use client";

import { Search, Trash2, Copy } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import Input from "@/components/ui/input";
import Dropdown from "@/components/ui/dropdown";
import ButtonUI from "@/components/ui/button";
import Toggle from "@/components/ui/toggle";
import { toast } from "@/components/ui/toast";
import { useControllerStore } from "@/store/controllerStore";

const DEFAULT_LOG_FILTER = {
  search: "",
  accountId: "",
  status: "ALL" as const,
  autoScroll: true,
};

export default function ToolsLoggerController() {
  const {
    logs = [],
    accounts = [],
    logFilter = DEFAULT_LOG_FILTER,
    updateLogFilter,
    clearLogs,
  } = useControllerStore();

  const accountOptions = [
    { value: "", label: "ทุกบัญชี" },
    ...accounts.map((acc) => ({
      value: acc.id,
      label: acc.name,
    })),
  ];

  const handleCopyLogs = () => {
    if (logs.length === 0) return;
    const text = logs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.status}] [${l.accountName}${
            l.groupName ? ` - ${l.groupName}` : ""
          }] ${l.message}`
      )
      .join("\n");
    navigator.clipboard.writeText(text);
    toast.success(
      "คัดลอกสำเร็จ",
      `คัดลอกรายการบันทึกทั้งหมด (${logs.length} รายการ) ลงคลิปบอร์ดแล้ว`
    );
  };

  return (
    <FadeIn
      direction="up"
      className="relative z-20 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <Input
            value={logFilter.search}
            onChange={(e) => updateLogFilter({ search: e.target.value })}
            placeholder="ค้นหาข้อความ ชื่อบัญชี หรือชื่อกลุ่ม..."
            className="pl-9"
          />
        </div>

        {/* Account Filter Dropdown */}
        <div className="w-full sm:w-52">
          <Dropdown
            options={accountOptions}
            value={logFilter.accountId}
            onChange={(accountId) => updateLogFilter({ accountId })}
            placeholder="เลือกบัญชี..."
          />
        </div>
      </div>

      {/* Right Actions: Auto-scroll Toggle, Copy, Clear */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:justify-end">
        <div className="flex items-center gap-2 rounded-sm border border-neutral-800 bg-neutral-900/50 px-3 py-1.5">
          <span className="text-xs font-medium text-neutral-300">
            เลื่อนอัตโนมัติ
          </span>
          <Toggle
            size="sm"
            checked={logFilter.autoScroll}
            onCheckedChange={(autoScroll) =>
              updateLogFilter({ autoScroll })
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <ButtonUI
            type="button"
            onClick={handleCopyLogs}
            disabled={logs.length === 0}
            className="flex cursor-pointer items-center gap-1.5 border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white disabled:opacity-50"
          >
            <Copy size={14} strokeWidth={1.8} />
            <span>คัดลอก</span>
          </ButtonUI>

          <ButtonUI
            type="button"
            onClick={clearLogs}
            disabled={logs.length === 0}
            className="flex cursor-pointer items-center gap-1.5 border border-red-500/40 bg-red-500/10 px-3.5 py-2 text-xs text-red-400 hover:bg-red-500/20 disabled:opacity-50"
          >
            <Trash2 size={14} strokeWidth={1.8} />
            <span>ล้างบันทึก</span>
          </ButtonUI>
        </div>
      </div>
    </FadeIn>
  );
}
