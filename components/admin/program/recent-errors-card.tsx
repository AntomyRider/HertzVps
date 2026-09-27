"use client";

import { AlertCircle, AlertTriangle, ShieldAlert } from "lucide-react";
import { useProgramOverviewStore } from "@/store/programOverviewStore";

export default function ProgramRecentErrorsCard() {
  const { recentFleetErrors } = useProgramOverviewStore();

  if (recentFleetErrors.length === 0) {
    return (
      <div className="rounded-md border border-neutral-800 bg-neutral-950 p-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-neutral-500" />
          <h3 className="text-sm font-semibold text-white">
            สตรีมข้อผิดพลาดล่าสุดของระบบ (Fleet Live Errors)
          </h3>
        </div>
        <p className="mt-4 text-center text-xs text-neutral-500 py-6">
          ไม่มีข้อผิดพลาดล่าสุดในระบบ ทุกเครื่องทำงานได้อย่างราบรื่น
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-400" />
          <h3 className="text-sm font-semibold text-white">
            สตรีมข้อผิดพลาดล่าสุดของระบบ (Fleet Live Errors)
          </h3>
        </div>
        <span className="rounded-sm border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-400">
          พบ {recentFleetErrors.length} รายการล่าสุด
        </span>
      </div>

      <div className="mt-3 max-h-64 divide-y divide-neutral-800/60 overflow-y-auto">
        {recentFleetErrors.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-1 py-2.5 px-2 text-xs transition hover:bg-neutral-900/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-semibold text-blue-400">
                  {item.keyCode}
                </span>
                <span className="rounded-sm border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400">
                  {item.action}
                </span>
                <span className="font-medium text-white">
                  {item.accountName || "System"}
                </span>
                {item.groupName && (
                  <span className="text-[11px] text-neutral-500">
                    &gt; {item.groupName}
                  </span>
                )}
              </div>
              <span className="font-mono text-[10px] text-neutral-500">
                {item.timestamp}
              </span>
            </div>
            <p className="text-[11px] text-rose-300/90 pl-1 font-mono">
              {item.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
