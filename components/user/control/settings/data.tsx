"use client";

import {
  RotateCcw,
  User,
  ListChecks,
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react";
import { useControlStore } from "@/store/controlStore";
import { toast } from "@/components/ui/toast";

export const ControlDataSettings = () => {
  const { stats, accounts, resetAllStats, resetUserStats } = useControlStore();

  const handleResetAll = () => {
    resetAllStats();
    toast.info("ล้างสถิติทั้งหมดเรียบร้อยแล้ว", "สถิติภาพรวมและรายบัญชีถูกรีเซ็ตเป็น 0");
  };

  const handleResetUser = (accountId: string, name: string) => {
    resetUserStats(accountId);
    toast.info("รีเซ็ตสถิติรายบัญชีแล้ว", `ล้างสถิติของบัญชี "${name}" เป็น 0`);
  };

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950 p-5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-900 pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-bold tracking-tight text-white">
            ข้อมูลและสถิติการทำงาน
          </h3>
          <p className="mt-0.5 text-xs text-neutral-400">
            จัดการและรีเซ็ตประวัติสถิติการโพสต์ของแต่ละบัญชี หรือล้างสถิติภาพรวมทั้งหมดในระบบ
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetAll}
          className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-sm border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 sm:self-auto"
        >
          <RotateCcw size={14} />
          <span>รีเซ็ตสถิติทั้งหมด</span>
        </button>
      </div>

      {/* Summary Strip */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-2.5 rounded-sm border border-neutral-800 bg-neutral-900/40 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <ListChecks size={16} />
          </div>
          <div>
            <p className="text-[11px] text-neutral-400">ยอดโพสต์รวม</p>
            <p className="text-sm font-bold text-white">
              {stats.total.toLocaleString("th-TH")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-sm border border-neutral-800 bg-neutral-900/40 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <p className="text-[11px] text-neutral-400">สำเร็จ</p>
            <p className="text-sm font-bold text-emerald-400">
              {stats.success.toLocaleString("th-TH")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-sm border border-neutral-800 bg-neutral-900/40 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-red-500/20 bg-red-500/10 text-red-400">
            <XCircle size={16} />
          </div>
          <div>
            <p className="text-[11px] text-neutral-400">ผิดพลาด</p>
            <p className="text-sm font-bold text-red-400">
              {stats.failed.toLocaleString("th-TH")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-sm border border-neutral-800 bg-neutral-900/40 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-amber-500/20 bg-amber-500/10 text-amber-400">
            <Clock3 size={16} />
          </div>
          <div>
            <p className="text-[11px] text-neutral-400">ติดอนุมัติ</p>
            <p className="text-sm font-bold text-amber-400">
              {stats.pending.toLocaleString("th-TH")}
            </p>
          </div>
        </div>
      </div>

      {/* Per-Account Stats List */}
      <div className="mt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          สถิติรายบัญชี ({accounts.length})
        </p>

        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900/20 p-8 text-center">
            <User size={20} className="text-neutral-500" />
            <p className="mt-2 text-xs text-neutral-400">
              ยังไม่มีบัญชีในระบบสำหรับการจัดการสถิติรายบัญชี
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="flex flex-col justify-between gap-3 rounded-sm border border-neutral-800 bg-neutral-900/30 p-3.5 md:flex-row md:items-center"
              >
                <div className="flex items-center gap-3 min-w-0 md:w-56">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900 text-neutral-400">
                    <User size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">
                      {acc.name}
                    </p>
                    <p className="truncate text-[11px] text-neutral-400">
                      ID: {acc.fbId || acc.id}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-sm border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs text-blue-400">
                    ทั้งหมด: {acc.stats.total.toLocaleString("th-TH")}
                  </span>
                  <span className="rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
                    สำเร็จ: {acc.stats.success.toLocaleString("th-TH")}
                  </span>
                  <span className="rounded-sm border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs text-red-400">
                    ผิดพลาด: {acc.stats.failed.toLocaleString("th-TH")}
                  </span>
                  <span className="rounded-sm border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400">
                    ติดอนุมัติ: {acc.stats.pending.toLocaleString("th-TH")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleResetUser(acc.id, acc.name)}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                >
                  <RotateCcw size={13} />
                  <span>รีเซ็ตสถิติ</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlDataSettings;
