"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

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

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  openUp: boolean;
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
    const [position, setPosition] = React.useState<DropdownPosition>({
      top: 0,
      left: 0,
      width: 0,
      openUp: false,
    });

    const mounted = React.useSyncExternalStore(
      emptySubscribe,
      () => true,
      () => false
    );

    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const buttonRef = React.useRef<HTMLButtonElement | null>(null);
    const menuRef = React.useRef<HTMLDivElement | null>(null);

    const isControlled = controlledValue !== undefined;
    const selectedValue = isControlled ? controlledValue : internalValue;
    const selectedOption = options.find((opt) => opt.value === selectedValue);

    // คำนวณพิกัดให้ Portal ลอยตรงกับปุ่ม trigger ใน viewport
    const updatePosition = React.useCallback(() => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const estimatedHeight = 240;

      const openUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

      setPosition({
        top: openUp ? rect.top - 6 : rect.bottom + 6,
        left: Math.max(8, rect.left),
        width: rect.width,
        openUp,
      });
    }, []);

    // Close on click outside, Escape, and update on scroll/resize
    React.useEffect(() => {
      if (!isOpen) return;

      updatePosition();

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        const inTrigger = containerRef.current?.contains(target);
        const inMenu = menuRef.current?.contains(target);

        if (!inTrigger && !inMenu) {
          setIsOpen(false);
        }
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsOpen(false);
        }
      };

      const handleScrollOrResize = () => {
        updatePosition();
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      window.addEventListener("resize", handleScrollOrResize);
      window.addEventListener("scroll", handleScrollOrResize, true);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("resize", handleScrollOrResize);
        window.removeEventListener("scroll", handleScrollOrResize, true);
      };
    }, [isOpen, updatePosition]);

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
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-sm transition-colors focus:border-neutral-700 outline-none disabled:cursor-not-allowed disabled:opacity-50",
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

        {/* Dropdown Menu via Portal */}
        {isOpen &&
          mounted &&
          createPortal(
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                top: position.top,
                left: position.left,
                width: position.width,
                transform: position.openUp ? "translateY(-100%)" : undefined,
                maxWidth: "calc(100vw - 16px)",
              }}
              className={cn(
                "z-[9999] max-h-60 overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-md p-1 shadow-2xl shadow-black/80 animate-in fade-in-0 zoom-in-95 duration-100",
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
                        "flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm transition-colors cursor-pointer",
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
            </div>,
            document.body
          )}
      </div>
    );
  }
);
Dropdown.displayName = "Dropdown";

export default Dropdown;
