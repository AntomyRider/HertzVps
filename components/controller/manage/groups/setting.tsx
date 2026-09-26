"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Images,
  Sparkles,
  SlidersHorizontal,
  ChevronUp,
} from "lucide-react";
import Toggle from "@/components/ui/toggle";

export interface GroupRandomSettingValues {
  randomContent: boolean;
  randomImage: boolean;
  randomReaction: boolean;
}

interface SettingGroupManageControllerProps {
  values: GroupRandomSettingValues;
  onChange: (patch: Partial<GroupRandomSettingValues>) => void;
}

export default function SettingGroupManageController({
  values,
  onChange,
}: SettingGroupManageControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeCount = [
    values.randomContent,
    values.randomImage,
    values.randomReaction,
  ].filter(Boolean).length;

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

  const items: {
    key: keyof GroupRandomSettingValues;
    label: string;
    icon: typeof FileText;
    checked: boolean;
  }[] = [
    {
      key: "randomContent",
      label: "สุ่มคอนเทนต์",
      icon: FileText,
      checked: values.randomContent,
    },
    {
      key: "randomImage",
      label: "สุ่มรูปภาพ",
      icon: Images,
      checked: values.randomImage,
    },
    {
      key: "randomReaction",
      label: "สุ่มความรู้สึก",
      icon: Sparkles,
      checked: values.randomReaction,
    },
  ];

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1 sm:w-48">
      {/* Dropup Panel (opens upward above button) */}
      {isOpen && (
        <div className="absolute bottom-full right-0 z-50 mb-1.5 w-64 space-y-1.5 rounded-md border border-neutral-800 bg-neutral-950 p-2 sm:left-0 sm:right-auto">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 rounded-sm border border-neutral-800/80 bg-neutral-900/50 px-2.5 py-2"
              >
                {/* Left: Icon on Left, Text right next to Icon */}
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-950 text-blue-400">
                    <Icon size={14} strokeWidth={1.8} />
                  </div>
                  <span className="truncate text-xs font-medium text-neutral-300">
                    {item.label}
                  </span>
                </div>

                {/* Right: Toggle Button */}
                <Toggle
                  size="sm"
                  checked={item.checked}
                  onCheckedChange={(checked) => onChange({ [item.key]: checked })}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Dropup Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-sm border bg-neutral-950 px-3 text-xs transition ${
          isOpen
            ? "border-blue-500/50 text-white"
            : "border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <SlidersHorizontal
            size={15}
            strokeWidth={1.8}
            className="shrink-0 text-blue-400"
          />
          <span className="truncate font-medium">ตั้งค่าการสุ่ม</span>
          {activeCount > 0 && (
            <span className="rounded-sm bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
              {activeCount}
            </span>
          )}
        </div>

        <ChevronUp
          size={15}
          className={`shrink-0 text-neutral-500 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-white" : ""
          }`}
        />
      </button>
    </div>
  );
}
