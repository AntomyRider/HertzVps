"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  name?: string;
}

export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      options,
      value: controlledValue,
      defaultValue = "",
      onChange,
      placeholder = "เลือกรายการ...",
      disabled = false,
      className,
      triggerClassName,
      menuClassName,
      name,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    const isControlled = controlledValue !== undefined;
    const selectedValue = isControlled ? controlledValue : internalValue;

    const selectedOption = options.find((opt) => opt.value === selectedValue);

    // Close on click outside
    React.useEffect(() => {
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

    const handleSelect = (option: DropdownOption) => {
      if (option.disabled) return;
      if (!isControlled) {
        setInternalValue(option.value);
      }
      onChange?.(option.value);
      setIsOpen(false);
    };

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn("relative w-full", className)}
      >
        {name && (
          <input type="hidden" name={name} value={selectedValue || ""} />
        )}

        {/* Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-sm border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-sm transition-colors focus:border-blue-500/50 outline-none disabled:cursor-not-allowed disabled:opacity-50",
            selectedOption ? "text-white" : "text-neutral-500",
            isOpen && "border-blue-500/50",
            triggerClassName
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedOption?.icon && (
              <span className="shrink-0 text-neutral-400">
                {selectedOption.icon}
              </span>
            )}
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          <ChevronDown
            size={16}
            className={cn(
              "shrink-0 text-neutral-500 transition-transform duration-200",
              isOpen && "rotate-180 text-white"
            )}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className={cn(
              "absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-sm border border-neutral-800 bg-neutral-950 p-1",
              menuClassName
            )}
          >
            {options.length === 0 ? (
              <div className="px-3 py-2 text-center text-xs text-neutral-500">
                ไม่มีตัวเลือก
              </div>
            ) : (
              options.map((option) => {
                const isSelected = option.value === selectedValue;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-neutral-900 font-medium text-white"
                        : "text-neutral-300 hover:bg-neutral-900/70 hover:text-white",
                      option.disabled &&
                        "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-neutral-300"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {option.icon && (
                        <span className="shrink-0 text-neutral-400">
                          {option.icon}
                        </span>
                      )}
                      <span className="truncate">{option.label}</span>
                    </div>

                    {isSelected && (
                      <Check size={14} className="shrink-0 text-blue-400" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  }
);
Dropdown.displayName = "Dropdown";

export default Dropdown;
