import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?:
    | LucideIcon
    | React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>
    | React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  ({ className, icon: Icon, title, description, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center rounded-md border border-dashed border-neutral-800 bg-neutral-950/40 p-8 text-center sm:p-12",
          className
        )}
        {...props}
      >
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900/60 text-neutral-400">
            {React.isValidElement(Icon) ? (
              Icon
            ) : typeof Icon === "function" || typeof Icon === "object" ? (
              (() => {
                const IconComp = Icon as React.ComponentType<{
                  size?: number;
                  strokeWidth?: number;
                  className?: string;
                }>;
                return <IconComp size={24} strokeWidth={1.8} />;
              })()
            ) : null}
          </div>
        )}

        {title && (
          <h3 className="mt-3 text-sm font-medium text-white">
            {title}
          </h3>
        )}

        {description && (
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-neutral-500">
            {description}
          </p>
        )}

        {(action || children) && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {action}
            {children}
          </div>
        )}
      </div>
    );
  }
);
Empty.displayName = "Empty";

export default Empty;
