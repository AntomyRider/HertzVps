"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import FadeIn from "@/components/ui/fade-in";

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  wrapperClassName?: string;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, wrapperClassName, ...props }, ref) => (
    <FadeIn direction="up" duration={500}>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-md border border-neutral-800 bg-neutral-950",
          wrapperClassName
        )}
      >
        <div className="w-full overflow-x-auto">
          <table
            ref={ref}
            className={cn(
              "w-full caption-bottom text-sm text-left border-collapse",
              className
            )}
            {...props}
          />
        </div>
      </div>
    </FadeIn>
  )
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("bg-neutral-900 border-b border-neutral-800", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-neutral-800/60 bg-neutral-950", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-neutral-800 bg-neutral-900 font-medium text-white",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-neutral-800/60 transition-colors hover:bg-neutral-900/50 data-[state=selected]:bg-neutral-900",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-11 px-4 text-left align-middle text-xs font-semibold tracking-wider text-neutral-400 [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-3 align-middle text-neutral-300 [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-xs text-neutral-500", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export default Table;
