import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", leftIcon, rightIcon, ...props }, ref) => {
    if (leftIcon || rightIcon) {
      return (
        <div className="relative flex w-full items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 flex items-center justify-center text-neutral-500">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              "w-full rounded-sm border border-neutral-800 bg-neutral-950 py-2 text-sm text-white placeholder:text-neutral-500 outline-none transition-colors focus:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon ? "pl-9" : "px-3.5",
              rightIcon ? "pr-9" : "px-3.5",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="pointer-events-none absolute right-3 flex items-center justify-center text-neutral-500">
              {rightIcon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full rounded-sm border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-sm text-white placeholder:text-neutral-500 outline-none transition-colors focus:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export default Input;
