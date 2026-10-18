
import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  activeText?: string;
  inactiveText?: string;
  innerCircle?: boolean;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      checked = false,
      onCheckedChange,
      disabled = false,
      className,
      size = "sm",
      ...props
    },
    ref
  ) => {
    const isSm = size === "sm";

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          "relative inline-flex shrink-0 items-center rounded-full",
          "border border-transparent p-0.5",
          "transition-colors duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2",
          "focus-visible:ring-offset-neutral-950",
          isSm ? "h-5 w-9" : "h-6 w-11",
          checked
            ? "bg-emerald-500"
            : "bg-neutral-700 hover:bg-neutral-600",
          "disabled:cursor-not-allowed disabled:opacity-40",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block shrink-0 rounded-full bg-white",
            "shadow-sm transition-transform duration-200 ease-in-out",
            isSm ? "size-4" : "size-5",
            checked
              ? isSm
                ? "translate-x-4"
                : "translate-x-5"
              : "translate-x-0"
          )}
        />
      </button>
    );
  }
);

Toggle.displayName = "Toggle";

export default Toggle;
