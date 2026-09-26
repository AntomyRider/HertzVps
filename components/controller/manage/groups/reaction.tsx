"use client";

import { useEffect, useRef, useState } from "react";
import {
  Ban,
  ThumbsUp,
  Heart,
  Smile,
  Laugh,
  Sparkles,
  Frown,
  Angry,
  ChevronUp,
  Check,
  type LucideIcon,
} from "lucide-react";
import { type ControllerReactionType } from "@/store/controllerStore";

interface ReactionGroupManageControllerProps {
  value: ControllerReactionType;
  onChange: (value: ControllerReactionType) => void;
}

interface ReactionOption {
  value: ControllerReactionType;
  label: string;
  icon: LucideIcon;
  color: string;
}

const REACTION_OPTIONS: ReactionOption[] = [
  {
    value: "",
    label: "ไม่แสดงความรู้สึก",
    icon: Ban,
    color: "text-neutral-400",
  },
  {
    value: "LIKE",
    label: "ถูกใจ",
    icon: ThumbsUp,
    color: "text-blue-400",
  },
  {
    value: "LOVE",
    label: "รักเลย",
    icon: Heart,
    color: "text-red-400",
  },
  {
    value: "CARE",
    label: "ห่วงใย",
    icon: Smile,
    color: "text-amber-400",
  },
  {
    value: "HAHA",
    label: "ฮ่าๆ",
    icon: Laugh,
    color: "text-amber-400",
  },
  {
    value: "WOW",
    label: "ว้าว",
    icon: Sparkles,
    color: "text-amber-400",
  },
  {
    value: "SAD",
    label: "เศร้า",
    icon: Frown,
    color: "text-blue-400",
  },
  {
    value: "ANGRY",
    label: "โกรธ",
    icon: Angry,
    color: "text-red-500",
  },
];

export default function ReactionGroupManageController({
  value,
  onChange,
}: ReactionGroupManageControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption =
    REACTION_OPTIONS.find((item) => item.value === value) ||
    REACTION_OPTIONS[0];
  const SelectedIcon = selectedOption.icon;

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
    <div ref={containerRef} className="relative min-w-0 flex-1 sm:w-20">
      {/* Dropup Menu (opens upward above trigger) */}
      {isOpen && (
        <div className="absolute bottom-full left-0 z-50 mb-1.5 max-h-64 w-52 overflow-y-auto rounded-md border border-neutral-800 bg-neutral-950 p-1">
          {REACTION_OPTIONS.map((item) => {
            const Icon = item.icon;
            const isSelected = item.value === value;

            return (
              <button
                key={item.value || "NONE"}
                type="button"
                onClick={() => {
                  onChange(item.value);
                  setIsOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center justify-between rounded-sm px-2.5 py-2 text-left text-xs transition ${
                  isSelected
                    ? "bg-blue-500/10 font-semibold text-blue-400"
                    : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon size={14} strokeWidth={1.8} className={item.color} />
                  <span className="truncate">{item.label}</span>
                </div>

                {isSelected && (
                  <Check size={13} className="shrink-0 text-blue-400" />
                )}
              </button>
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
          <SelectedIcon
            size={15}
            strokeWidth={1.8}
            className={selectedOption.color}
          />
          <span className="truncate font-medium">{selectedOption.label}</span>
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
