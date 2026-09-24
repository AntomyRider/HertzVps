import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      checked = false,
      onCheckedChange,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
      onChange?.(e);
    };

    return (
      <label
        className={cn(
          "relative inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors cursor-pointer select-none",
          checked
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-neutral-700 bg-neutral-900 hover:border-neutral-600",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        {checked && <Check size={11} strokeWidth={3} className="text-white" />}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
