"use client";

import { KeyRound, LogOut, CheckCircle2 } from "lucide-react";
import { useControlStore } from "@/store/controlStore";
import ButtonUI from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import ControlStats from "./stats";
import ControlChart from "./chart";
import ControlDonut from "./donut";

export const ControlDashboardShell = () => {
  const { keyInfo, isBotOnline, logoutKey } = useControlStore();

  if (!keyInfo) return null;

  const handleLogout = () => {
    logoutKey();
    toast.info("ออกจากระบบคีย์แล้ว", "คุณสามารถกรอกรหัสคีย์อื่นเพื่อเข้าใช้งานได้");
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Bar: Key Status & Logout */}
      <div className="flex flex-col justify-between gap-4 rounded-md border border-neutral-800 bg-neutral-950 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <KeyRound size={20} strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                {keyInfo.code}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 size={12} />
                ใช้งานได้
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-0.5 text-xs font-semibold ${
                  isBotOnline
                    ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                    : "border-neutral-800 bg-neutral-900 text-neutral-400"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-sm ${
                    isBotOnline ? "bg-blue-400" : "bg-neutral-500"
                  }`}
                />
                {isBotOnline ? "เชื่อมต่อโปรแกรมแล้ว (Online)" : "รอการเชื่อมต่อจากโปรแกรม"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-neutral-400">
              ยืนยันสิทธิ์ผ่านระบบ License Key เรียบร้อยแล้ว
            </p>
          </div>
        </div>

        <ButtonUI
          type="button"
          onClick={handleLogout}
          className="cursor-pointer gap-2 rounded-sm border border-neutral-800 bg-transparent px-4 py-2 text-xs font-medium text-neutral-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={14} />
          <span>เปลี่ยนคีย์ / ออกจากระบบ</span>
        </ButtonUI>
      </div>

      {/* Charts Row: Line Chart (2 cols) + Donut Chart (1 col) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ControlChart />
        </div>
        <ControlDonut />
      </div>

      {/* Stats Grid: ทั้งหมด / สำเร็จ / ผิดพลาด / ติดอนุมัติ */}
      <ControlStats />
    </div>
  );
};

export default ControlDashboardShell;
