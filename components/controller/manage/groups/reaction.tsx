"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronUp, Smile, X } from "lucide-react";
import { type ControllerReactionType } from "@/store/controllerStore";
import ButtonUI from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ReactionOption {
  type: ControllerReactionType;
  label: string;
  emoji: string;
  activeColor: string;
}

export const REACTIONS: ReactionOption[] = [
  {
    type: "LIKE",
    label: "ถูกใจ",
    emoji: "👍",
    activeColor: "border-blue-500 bg-blue-600/20 text-blue-400",
  },
  {
    type: "LOVE",
    label: "รักเลย",
    emoji: "❤️",
    activeColor: "border-red-500 bg-red-600/20 text-red-400",
  },
  {
    type: "CARE",
    label: "ห่วงใย",
    emoji: "🥰",
    activeColor: "border-amber-500 bg-amber-600/20 text-amber-400",
  },
  {
    type: "HAHA",
    label: "ฮ่าๆ",
    emoji: "😂",
    activeColor: "border-yellow-500 bg-yellow-600/20 text-yellow-400",
  },
  {
    type: "WOW",
    label: "ว้าว",
    emoji: "😮",
    activeColor: "border-yellow-500 bg-yellow-600/20 text-yellow-400",
  },
  {
    type: "SAD",
    label: "เศร้า",
    emoji: "😢",
    activeColor: "border-sky-500 bg-sky-600/20 text-sky-400",
  },
  {
    type: "ANGRY",
    label: "โกรธ",
    emoji: "😡",
    activeColor: "border-orange-500 bg-orange-600/20 text-orange-400",
  },
];

interface ReactionGroupManageControllerProps {
  value: ControllerReactionType;
  randomReaction?: boolean;
  onChange: (value: ControllerReactionType) => void;
  disabled?: boolean;
  className?: string;
}

export default function ReactionGroupManageController({
  value,
  randomReaction = false,
  onChange,
  disabled = false,
  className,
}: ReactionGroupManageControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeReaction = REACTIONS.find((r) => r.type === value);

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

  const handleSelectReaction = (type: ControllerReactionType) => {
    onChange(value === type ? "" : type);
    setIsOpen(false);
  };

  const handleClearReaction = () => {
    onChange("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      {/* Dropup Panel (opens upward) */}
      {isOpen && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-xl border border-neutral-800 bg-neutral-950 p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-xs font-medium text-neutral-300">
              ความรู้สึกโพสต์
            </span>
            {value && (
              <ButtonUI
                type="button"
                variant="ghost"
                onClick={handleClearReaction}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] text-neutral-400 hover:text-red-400"
              >
                <X size={12} />
                <span>ยกเลิก</span>
              </ButtonUI>
            )}
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {REACTIONS.map((item) => {
              const isSelected = item.type === value;
              return (
                <ButtonUI
                  key={item.type}
                  type="button"
                  variant="ghost"
                  onClick={() => handleSelectReaction(item.type)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-all",
                    isSelected
                      ? item.activeColor
                      : "border-neutral-800/80 !bg-neutral-900/60 hover:border-neutral-700 hover:!bg-neutral-850"
                  )}
                >
                  <span className="text-xl leading-none">{item.emoji}</span>
                  <span className="text-[10px] text-neutral-300">
                    {item.label}
                  </span>
                </ButtonUI>
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
          randomReaction
            ? "border-amber-500/40 !bg-amber-500/10 text-amber-300"
            : activeReaction
            ? activeReaction.activeColor
            : "border-neutral-800 !bg-neutral-900/90 text-neutral-300 hover:border-neutral-700 hover:text-white"
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          {randomReaction ? (
            <>
              <Smile className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="truncate">สุ่มความรู้สึก</span>
            </>
          ) : activeReaction ? (
            <>
              <span className="text-sm leading-none shrink-0">{activeReaction.emoji}</span>
              <span className="truncate">{activeReaction.label}</span>
            </>
          ) : (
            <>
              <Smile className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">เลือกรีแอคชัน</span>
            </>
          )}
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
