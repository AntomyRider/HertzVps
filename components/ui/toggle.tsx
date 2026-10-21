"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: ((checked: boolean) => void) | React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
  activeText?: string;
  inactiveText?: string;
  innerCircle?: boolean;
  name?: string;
  id?: string;
  "aria-label"?: string;
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      checked = false,
      onCheckedChange,
      onChange,
      disabled = false,
      className,
      size = "md",
      activeText,
      inactiveText,
      innerCircle,
      ...props
    },
    ref
  ) => {
    const isSm = size === "sm";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextChecked = e.target.checked;
      onCheckedChange?.(nextChecked);
      if (typeof onChange === "function") {
        (onChange as (val: boolean) => void)(nextChecked);
      }
    };

    return (
      <label
        className={cn(
          "relative inline-flex shrink-0 select-none",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
          {...props}
        />

        {/* Track */}
        <div
          className={cn(
            "relative rounded-md border transition-all duration-200",
            isSm ? "h-5 w-10" : "h-6 w-13",
            checked
              ? "bg-blue-600 border-blue-400/40 shadow-[0_0_10px_rgba(37,99,235,0.3),inset_0_1px_2px_rgba(0,0,0,0.2)]"
              : "bg-neutral-900 border-white/[0.08] shadow-[inset_0_1px_3px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.05)]"
          )}
        >
          {/* Knob */}
          <div
            className={cn(
              "absolute left-0.5 top-1/2 -translate-y-1/2 rounded-md bg-gradient-to-b from-white to-neutral-200 shadow-[0_2px_4px_rgba(0,0,0,0.4),0_1px_1px_rgba(0,0,0,0.2)] transition-transform duration-200",
              isSm ? "h-4 w-4" : "h-5 w-5",
              checked
                ? isSm
                  ? "translate-x-5 -translate-y-1/2"
                  : "translate-x-7 -translate-y-1/2"
                : "translate-x-0 -translate-y-1/2"
            )}
          />
        </div>
      </label>
    );
  }
);

Toggle.displayName = "Toggle";

export default Toggle;
