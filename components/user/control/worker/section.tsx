"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Zap,
  Square,
  User,
  Play,
  FileText,
  MessageSquare,
  Heart,
  Clock,
  FolderOpen,
  Trash2,
  Users,
  Layers,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useControlStore, type ControlAccountItem } from "@/store/controlStore";
import ButtonUI from "@/components/ui/button";
import SearchUI from "@/components/ui/search";
import Empty from "@/components/ui/empty";
import { toast } from "@/components/ui/toast";

const WorkerAccountCard = ({ account }: { account: ControlAccountItem }) => {
  const { groupsByAccount, startUser, stopUser, deleteAccount } =
    useControlStore();

  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!account.isRunning || !account.taskTimer) return;
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [account.isRunning, account.taskTimer]);

  const remainingSec = useMemo(() => {
    if (!account.isRunning || !account.taskTimer) return null;
    if (typeof account.taskTimer.endTime === "number") {
      const diff = Math.ceil((account.taskTimer.endTime - nowMs) / 1000);
      return diff > 0 ? diff : null;
    }
    return account.taskTimer.remaining > 0 ? account.taskTimer.remaining : null;
  }, [account.isRunning, account.taskTimer, nowMs]);

  const groups = groupsByAccount[account.id] || [];
  const activeGroupsCount = groups.filter((g) => g.isActive).length;

  const timerProgressPct = useMemo(() => {
    if (
      remainingSec === null ||
      !account.taskTimer ||
      !account.taskTimer.duration ||
      account.taskTimer.duration <= 0
    ) {
      return null;
    }
    const pct = Math.min(
      100,
      Math.max(0, (remainingSec / account.taskTimer.duration) * 100)
    );
    return pct;
  }, [remainingSec, account.taskTimer]);

  const groupProgressPct = useMemo(() => {
    if (
      !account.groupInfo ||
      !account.groupInfo.groupTotal ||
      account.groupInfo.groupTotal <= 0
    ) {
      return null;
    }
    return Math.min(
      100,
      Math.max(
        0,
        (account.groupInfo.groupCurrent / account.groupInfo.groupTotal) * 100
      )
    );
  }, [account.groupInfo]);

  const statItems = [
    {
      key: "total",
      label: "ทั้งหมด",
      value: account.stats.total,
      icon: Layers,
      iconClass: "text-blue-500/20",
    },
    {
      key: "success",
      label: "สำเร็จ",
      value: account.stats.success,
      icon: CheckCircle2,
      iconClass: "text-blue-500/20",
    },
    {
      key: "failed",
      label: "ผิดพลาด",
      value: account.stats.failed,
      icon: XCircle,
      iconClass: "text-red-500/20",
    },
    {
      key: "post",
      label: "โพสต์",
      value: account.stats.post,
      icon: FileText,
      iconClass: "text-blue-500/20",
    },
    {
      key: "comment",
      label: "คอมเมนต์",
      value: account.stats.comment,
      icon: MessageSquare,
      iconClass: "text-blue-500/20",
    },
    {
      key: "reaction",
      label: "ความรู้สึก",
      value: account.stats.reaction,
      icon: Heart,
      iconClass: "text-blue-500/20",
    },
  ];

  const handleToggle = () => {
    if (account.isRunning) {
      stopUser(account.id);
      toast.info("หยุดการทำงานแล้ว", `หยุดบอทของบัญชี ${account.name}`);
    } else {
      startUser(account.id);
      toast.success("เริ่มทำงานแล้ว", `สั่งรันบอทของบัญชี ${account.name}`);
    }
  };

  const handleDelete = () => {
    deleteAccount(account.id);
    toast.info(
      "ลบบัญชีเรียบร้อยแล้ว",
      `นำบัญชี "${account.name}" ออกจากรายการแล้ว`
    );
  };

  return (
    <div
      className={`flex flex-col justify-between rounded-md border bg-neutral-950 p-4 transition ${
        account.isRunning
          ? "border-blue-500/40"
          : "border-neutral-800 hover:border-neutral-700"
      }`}
    >
      {/* Top: Profile & Delete Button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-sm border bg-neutral-900 ${
              account.isRunning
                ? "border-blue-500/40 text-blue-400"
                : "border-neutral-800 text-neutral-400"
            }`}
          >
            {account.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={account.avatar}
                alt={account.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={18} strokeWidth={1.8} />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h4 className="truncate text-sm font-bold tracking-tight text-white">
                {account.name}
              </h4>
              <span className="rounded-sm border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                {groups.length} หมวดหมู่
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-neutral-400">
              ID: {account.fbId || account.id}
            </p>
          </div>
        </div>

        <ButtonUI
          type="button"
          onClick={handleDelete}
          title="ลบบัญชี"
          className="h-8 w-8 shrink-0 cursor-pointer rounded-sm border border-neutral-800 bg-transparent p-0 text-neutral-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 size={14} />
        </ButtonUI>
      </div>

      {/* Middle: Current Task & Group Progress */}
      <div className="mt-4 space-y-2 border-t border-neutral-900 pt-3">
        {/* Box 1: Current Task */}
        <div className="relative overflow-hidden rounded-sm border border-neutral-800/80 bg-neutral-900/40 px-3 py-2">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border ${
                  account.isRunning
                    ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                    : "border-neutral-800 bg-neutral-900 text-neutral-500"
                }`}
              >
                <Clock size={14} strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-neutral-500">
                  สถานะการทำงาน
                </p>
                <p className="truncate text-xs font-semibold text-white">
                  {account.currentTask || "พร้อมทำงาน"}
                </p>
              </div>
            </div>

            {remainingSec !== null ? (
              <span className="shrink-0 rounded-sm border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-bold text-blue-400">
                {remainingSec}s
              </span>
            ) : (
              <span
                className={`shrink-0 rounded-sm border px-2 py-0.5 text-[10px] font-semibold ${
                  account.isRunning
                    ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                    : "border-neutral-800 bg-neutral-900 text-neutral-400"
                }`}
              >
                {account.isRunning ? "กำลังทำงาน" : "พร้อม"}
              </span>
            )}
          </div>

          {timerProgressPct !== null && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-800">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${timerProgressPct}%` }}
              />
            </div>
          )}
        </div>

        {/* Box 2: Current Group Progress */}
        <div className="relative overflow-hidden rounded-sm border border-neutral-800/80 bg-neutral-900/40 px-3 py-2">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border ${
                  account.groupInfo?.groupName
                    ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                    : "border-neutral-800 bg-neutral-900 text-neutral-500"
                }`}
              >
                <FolderOpen size={14} strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-neutral-500">
                  หมวดหมู่กลุ่มโพสต์
                </p>
                <p className="truncate text-xs font-semibold text-white">
                  {account.groupInfo?.groupName
                    ? account.groupInfo.groupName
                    : activeGroupsCount > 0
                    ? `เปิดใช้งาน ${activeGroupsCount} หมวดหมู่`
                    : "ยังไม่ได้เปิดใช้งานหมวดหมู่"}
                </p>
              </div>
            </div>

            {account.groupInfo && account.groupInfo.groupTotal > 0 ? (
              <span className="shrink-0 rounded-sm border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-bold text-blue-400">
                {account.groupInfo.groupCurrent}/{account.groupInfo.groupTotal}
              </span>
            ) : (
              <span className="shrink-0 rounded-sm border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold text-neutral-400">
                {activeGroupsCount}/{groups.length} กลุ่ม
              </span>
            )}
          </div>

          {groupProgressPct !== null && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-800">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${groupProgressPct}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Per-Account Stats (ทั้งหมด / สำเร็จ / ผิดพลาด / โพสต์ / คอมเมนต์ / ความรู้สึก) */}
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-neutral-900 pt-3">
        {statItems.map(({ key, label, value, icon: Icon, iconClass }) => (
          <div
            key={key}
            className="relative overflow-hidden rounded-sm border border-neutral-800/80 bg-neutral-900/40 px-3 py-2.5 transition hover:border-neutral-700"
          >
            <div className="relative z-10">
              <p className="text-[11px] font-medium text-neutral-400">
                {label}
              </p>
              <p className="mt-0.5 text-sm font-bold tracking-tight text-white">
                {value.toLocaleString("th-TH")}
              </p>
            </div>
            <Icon
              size={50}
              strokeWidth={1.6}
              className={`pointer-events-none absolute -bottom-2 -right-2 ${iconClass}`}
            />
          </div>
        ))}
      </div>

      {/* Bottom Actions: Edit Groups & Start/Stop Bot */}
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-neutral-900 pt-3">
        <ButtonUI
          href={`/control/worker/${account.id}`}
          className="justify-center gap-1.5 rounded-sm border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
        >
          <FolderOpen size={14} />
          <span>จัดการกลุ่ม ({groups.length})</span>
        </ButtonUI>

        <button
          type="button"
          onClick={handleToggle}
          className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-sm border px-3 py-2 text-xs font-semibold transition ${
            account.isRunning
              ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : "border-blue-500/30 bg-blue-600 text-white hover:bg-blue-500"
          }`}
        >
          {account.isRunning ? (
            <>
              <Square size={12} className="fill-current" />
              <span>หยุดทำงาน</span>
            </>
          ) : (
            <>
              <Play size={12} className="fill-current" />
              <span>เริ่มทำงาน</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const ControlWorkerSection = () => {
  const {
    accounts,
    accountSearch,
    workerFilter,
    isAllRunning,
    setAccountSearch,
    setWorkerFilter,
    startAll,
    stopAll,
  } = useControlStore();

  const filteredAccounts = useMemo(() => {
    const q = accountSearch.toLowerCase().trim();
    return accounts.filter((acc) => {
      if (workerFilter === "running" && !acc.isRunning) return false;
      if (workerFilter === "idle" && acc.isRunning) return false;
      if (!q) return true;
      return (
        acc.name.toLowerCase().includes(q) ||
        acc.id.toLowerCase().includes(q) ||
        acc.fbId.toLowerCase().includes(q)
      );
    });
  }, [accounts, accountSearch, workerFilter]);

  const runningCount = accounts.filter((a) => a.isRunning).length;

  const handleToggleAll = () => {
    if (isAllRunning) {
      stopAll();
      toast.info(
        "หยุดทำงานทั้งหมดแล้ว",
        "ส่งคำสั่งหยุดบอททุกบัญชีเรียบร้อยแล้ว"
      );
    } else {
      startAll();
      toast.success(
        "เริ่มทำงานทั้งหมดแล้ว",
        "ส่งคำสั่งเริ่มรันบอททุกบัญชีเรียบร้อยแล้ว"
      );
    }
  };

  const filters: Array<{ label: string; value: "all" | "running" | "idle" }> = [
    { label: `ทั้งหมด (${accounts.length})`, value: "all" },
    { label: `กำลังทำงาน (${runningCount})`, value: "running" },
    { label: `ว่าง (${accounts.length - runningCount})`, value: "idle" },
  ];

  return (
    <div className="space-y-6">
      {/* Control Bar: Search + Filter Tabs + Start/Stop All Button */}
      <div className="flex flex-col justify-between gap-3 rounded-md border border-neutral-800 bg-neutral-950 p-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <SearchUI
            value={accountSearch}
            onChange={(e) => setAccountSearch(e.target.value)}
            placeholder="ค้นหาชื่อบัญชี หรือ Facebook UID..."
            className="h-9 rounded-sm bg-neutral-950 sm:max-w-xs"
          />

          <div className="flex flex-wrap items-center gap-1 rounded-sm border border-neutral-800 bg-neutral-900/60 p-1">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setWorkerFilter(f.value)}
                className={`cursor-pointer rounded-sm px-3 py-1.5 text-xs font-medium transition ${
                  workerFilter === f.value
                    ? "bg-blue-600 text-white"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleAll}
          disabled={accounts.length === 0}
          className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-sm px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            isAllRunning
              ? "border border-red-500/30 bg-red-600 text-white hover:bg-red-500"
              : "bg-blue-600 text-white hover:bg-blue-500"
          }`}
        >
          {isAllRunning ? (
            <>
              <Square size={14} className="fill-current" />
              <span>หยุดทำงานทั้งหมด</span>
            </>
          ) : (
            <>
              <Zap size={14} />
              <span>เริ่มทำงานทั้งหมด</span>
            </>
          )}
        </button>
      </div>

      {/* Accounts Worker & Group Grid */}
      {accounts.length === 0 ? (
        <Empty
          icon={Users}
          title="ยังไม่มีบัญชีที่ซิงค์จากโปรแกรม"
          description="เมื่อเข้าสู่ระบบบัญชีในโปรแกรม Hertz Auto Post บนเครื่องคอมพิวเตอร์ รายชื่อบัญชีจะซิงค์มาแสดงที่นี่เพื่อแก้ไขกลุ่มและสั่งเริ่มงานได้ทันที"
          className="border-solid bg-neutral-950"
        />
      ) : filteredAccounts.length === 0 ? (
        <Empty
          icon={Users}
          title="ไม่พบบัญชีที่ตรงกับเงื่อนไข"
          description="ลองเปลี่ยนคำค้นหาหรือสลับตัวกรองสถานะด้านบนเพื่อดูบัญชีอื่น"
          className="border-solid bg-neutral-950"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredAccounts.map((acc) => (
            <WorkerAccountCard key={acc.id} account={acc} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ControlWorkerSection;
