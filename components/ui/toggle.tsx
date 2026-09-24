import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  activeText?: string;
  inactiveText?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      checked = false,
      onCheckedChange,
      activeText = "เปิด",
      inactiveText = "ปิด",
      disabled = false,
      className,
      size = "sm",
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    const isSm = size === "sm";

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        ref={ref}
        onClick={handleClick}
        className={cn(
          "group relative inline-flex items-center rounded-full border transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] select-none cursor-pointer focus:outline-none",
          isSm ? "h-7 min-w-[88px]" : "h-8 min-w-[100px]",
          checked
            ? "border-[#249d3f]/90 bg-gradient-to-b from-[#28a745] via-[#30b94f] to-[#34c759] shadow-[inset_0_2px_4px_rgba(0,0,0,0.35),inset_0_1px_1.5px_rgba(0,0,0,0.25),0_1px_0_rgba(255,255,255,0.08)]"
            : "border-neutral-800/90 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-800/90 shadow-[inset_0_2px_5px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.06)] hover:border-neutral-700/80",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        {...props}
      >
        {/* 3D iOS Convex Sliding Thumb Knob */}
        <span
          className={cn(
            "pointer-events-none absolute top-0.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "bg-gradient-to-b from-white via-[#f8f8fa] to-[#dcdce2]",
            "shadow-[0_2px_5px_rgba(0,0,0,0.45),0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,1),inset_0_-1px_1px_rgba(0,0,0,0.12)]",
            isSm
              ? "h-5.5 w-5.5 group-active:w-6.5"
              : "h-6.5 w-6.5 group-active:w-7.5",
            checked
              ? isSm
                ? "left-[calc(100%-1.5rem)] group-active:left-[calc(100%-1.75rem)]"
                : "left-[calc(100%-1.75rem)] group-active:left-[calc(100%-2rem)]"
              : "left-0.5"
          )}
        >
          {/* Inner subtle 3D dome highlight */}
          <span className="absolute inset-[1.5px] rounded-full bg-gradient-to-b from-white/90 to-transparent" />
        </span>

        {/* Text inside track */}
        <span
          className={cn(
            "w-full text-[11px] leading-none transition-all duration-300 select-none",
            checked
              ? "text-left pl-2.5 pr-7 font-semibold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
              : "text-right pl-7 pr-2.5 font-medium text-neutral-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
          )}
        >
          {checked ? activeText : inactiveText}
        </span>
      </button>
    );
  }
);

Toggle.displayName = "Toggle";

export default Toggle;
