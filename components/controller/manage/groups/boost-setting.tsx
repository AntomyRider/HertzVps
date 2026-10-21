"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronUp, ListOrdered, Settings2, Shuffle } from "lucide-react";
import Toggle from "@/components/ui/toggle";
import ButtonUI from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BoostSettingGroupManageControllerProps {
  randomComment: boolean;
  commentCount: number;
  onChangeRandomComment: (val: boolean) => void;
  onChangeCommentCount: (val: number) => void;
  disabled?: boolean;
  className?: string;
}

export default function BoostSettingGroupManageController({
  randomComment,
  commentCount,
  onChangeRandomComment,
  onChangeCommentCount,
  disabled = false,
  className,
}: BoostSettingGroupManageControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Buffer input value for typing
  const [countText, setCountText] = useState(String(commentCount || 1));

  useEffect(() => {
    setCountText(String(commentCount || 1));
  }, [commentCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      {/* Dropup Panel */}
      {isOpen && (
        <div className="absolute bottom-full right-0 sm:left-0 sm:right-auto z-50 mb-2 w-72 rounded-xl border border-neutral-800 bg-neutral-950 p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-xs font-medium text-neutral-300">
              ตั้งค่าการดันโพสต์
            </span>
          </div>

          <div className="space-y-2.5">
            {/* 1. สุ่มคอมเมนต์ */}
            <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800/80 bg-neutral-900/60 p-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-800 text-amber-300">
                  <Shuffle size={14} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-neutral-200">
                    สุ่มคอมเมนต์
                  </p>
                  <p className="truncate text-[10px] text-neutral-500">
                    {randomComment ? "สุ่มจาก pool ทั้งหมด" : "ใช้ข้อความบนสุดตามลำดับ"}
                  </p>
                </div>
              </div>

              <Toggle
                size="sm"
                checked={randomComment}
                onCheckedChange={onChangeRandomComment}
              />
            </div>

            {/* 2. จำนวนคอมเมนต์ต่อ 1 โพสต์ */}
            <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800/80 bg-neutral-900/60 p-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-800 text-amber-300">
                  <ListOrdered size={14} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-neutral-200">
                    จำนวนคอมเมนต์
                  </p>
                  <p className="truncate text-[10px] text-neutral-500">
                    ต่อ 1 โพสต์เป้าหมาย (1-50)
                  </p>
                </div>
              </div>

              <input
                type="number"
                min={1}
                max={50}
                value={countText}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw.trim() === "") {
                    setCountText("");
                    return;
                  }
                  const parsed = parseInt(raw, 10);
                  if (Number.isNaN(parsed)) return;
                  const next = Math.max(1, Math.min(50, parsed));
                  setCountText(String(next));
                  onChangeCommentCount(next);
                }}
                onBlur={() => {
                  const parsed = parseInt(countText, 10);
                  const next =
                    Number.isNaN(parsed) || parsed < 1 ? 1 : Math.min(50, parsed);
                  setCountText(String(next));
                  onChangeCommentCount(next);
                }}
                disabled={disabled}
                className="w-14 rounded-md border border-neutral-800 bg-neutral-950 py-1 text-center text-xs font-medium text-white outline-none transition focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <ButtonUI
        type="button"
        variant="ghost"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled}
        className={cn(
          "relative flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all select-none sm:w-auto",
          randomComment || commentCount > 1
            ? "border-amber-500/50 !bg-amber-500/10 text-amber-300"
            : "border-neutral-800 !bg-neutral-900/90 text-neutral-300 hover:border-neutral-700 hover:text-white"
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          <Settings2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="truncate">ตั้งค่าดัน</span>
        </div>

        <ChevronUp
          className={cn(
            "ml-0.5 h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 shrink-0",
            isOpen ? "rotate-180" : ""
          )}
        />
      </ButtonUI>
    </div>
  );
}
