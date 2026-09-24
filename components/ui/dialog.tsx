"use client";

import { useEffect, ReactNode, HTMLAttributes } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      {children}
    </div>
  );
};

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
  maxWidth?: string;
}

export const DialogContent = ({
  className = "",
  maxWidth = "max-w-md",
  children,
  onClose,
  ...props
}: DialogContentProps) => {
  return (
    <div
      className={cn(
        "relative w-full max-h-[90vh] overflow-y-auto rounded-md border border-neutral-800 bg-neutral-950 p-4 sm:p-6",
        maxWidth,
        className
      )}
      {...props}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm p-1.5 text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
          title="ปิด"
        >
          <X size={18} />
        </button>
      )}
      {children}
    </div>
  );
};

export const DialogHeader = ({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 border-b border-neutral-800/80 pb-4 text-left",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const DialogTitle = ({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      className={cn("text-base font-semibold text-white", className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const DialogDescription = ({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className={cn("text-xs text-neutral-400", className)}
      {...props}
    >
      {children}
    </p>
  );
};

export const DialogFooter = ({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-2.5 pt-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Dialog;
