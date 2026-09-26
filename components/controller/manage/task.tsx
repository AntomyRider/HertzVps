"use client";

import { Cpu, FolderKanban } from "lucide-react";

interface TaskManageControllerProps {
  currentTask: string;
  groupName: string;
  groupCurrent: number;
  groupTotal: number;
  isRunning: boolean;
}

export default function TaskManageController({
  currentTask,
  groupName,
  groupCurrent,
  groupTotal,
  isRunning,
}: TaskManageControllerProps) {
  return (
    <div className="space-y-2.5 rounded-sm border border-neutral-800/80 bg-neutral-900/40 p-3">
      {/* Task Row: Icon on Left, Heading & Text stacked next to Icon */}
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border ${
            isRunning
              ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
              : "border-neutral-800 bg-neutral-900 text-neutral-400"
          }`}
        >
          <Cpu size={16} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-neutral-500">Task</p>
          <p className="truncate text-xs font-semibold text-neutral-200">
            {currentTask}
          </p>
        </div>
      </div>

      {/* Groups Row: Icon on Left, Heading & Text stacked next to Icon */}
      <div className="flex items-center gap-3 border-t border-neutral-800/60 pt-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900 text-blue-400">
          <FolderKanban size={16} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-neutral-500">Groups</p>
          <p className="truncate text-xs font-semibold text-neutral-200">
            {groupName || "ยังไม่ได้เลือกกลุ่ม"}{" "}
            <span className="text-blue-400">
              ({groupCurrent}/{groupTotal})
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
