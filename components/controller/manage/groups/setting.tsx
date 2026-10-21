"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FileText,
  Images,
  Smile,
  SlidersHorizontal,
  ChevronUp,
} from "lucide-react";
import Toggle from "@/components/ui/toggle";
import ButtonUI from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GroupRandomSettingValues {
  randomContent: boolean;
  randomImage: boolean;
  randomReaction: boolean;
}

interface SettingGroupManageControllerProps {
  values: GroupRandomSettingValues;
  onChange: (patch: Partial<GroupRandomSettingValues>) => void;
  disabled?: boolean;
  className?: string;
  shareMode?: boolean;
}

export default function SettingGroupManageController({
  values,
  onChange,
  disabled = false,
  className,
  shareMode = false,
}: SettingGroupManageControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const hasAnyRandom = shareMode
    ? values.randomReaction
    : values.randomContent || values.randomImage || values.randomReaction;

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

  const allItems = [
    {
      key: "randomContent" as const,
      label: "สุ่มข้อความโพสต์",
      desc: "สุ่มจากชุดข้อความที่คั่นด้วย ---",
      icon: FileText,
      checked: values.randomContent,
      hideInShare: true,
    },
    {
      key: "randomImage" as const,
      label: "สุ่มรูปภาพ",
      desc: "สุ่มเลือกรูปภาพเมื่อโพสต์",
      icon: Images,
      checked: values.randomImage,
      hideInShare: true,
    },
    {
      key: "randomReaction" as const,
      label: "สุ่มรีแอคชัน",
      desc: "สุ่มกดความรู้สึกแต่ละกลุ่ม",
      icon: Smile,
      checked: values.randomReaction,
      hideInShare: false,
    },
  ];

  const items = shareMode ? allItems.filter((i) => !i.hideInShare) : allItems;

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      {/* Dropup Panel (opens upward) */}
      {isOpen && (
        <div className="absolute bottom-full right-0 sm:left-0 sm:right-auto z-50 mb-2 w-72 rounded-xl border border-neutral-800 bg-neutral-950 p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-xs font-medium text-neutral-300">
              การสุ่มทำงาน
            </span>
          </div>

          <div className="space-y-2.5">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800/80 bg-neutral-900/60 p-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-800 text-neutral-300">
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-neutral-200">
                        {item.label}
                      </p>
                      <p className="truncate text-[10px] text-neutral-500">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <Toggle
                    size="sm"
                    checked={item.checked}
                    onCheckedChange={(checked) =>
                      onChange({ [item.key]: checked })
                    }
                  />
                </div>
              );
            })}
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
          hasAnyRandom
            ? "border-blue-500/50 !bg-blue-500/10 text-blue-300"
            : "border-neutral-800 !bg-neutral-900/90 text-neutral-300 hover:border-neutral-700 hover:text-white"
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <span className="truncate">ตั้งค่ากลุ่ม</span>
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
