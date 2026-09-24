"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  className,
}) => {
  if (totalItems <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = (safePage - 1) * itemsPerPage + 1;
  const endItem = Math.min(safePage * itemsPerPage, totalItems);

  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (safePage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis", totalPages];
    }

    if (safePage >= totalPages - 3) {
      return [
        1,
        "ellipsis",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis",
      safePage - 1,
      safePage,
      safePage + 1,
      "ellipsis",
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3",
        className
      )}
    >
      {/* Left: Summary text */}
      <p className="text-xs text-neutral-400">
        แสดง{" "}
        <span className="font-semibold text-white">
          {startItem.toLocaleString("th-TH")} - {endItem.toLocaleString("th-TH")}
        </span>{" "}
        จากทั้งหมด{" "}
        <span className="font-semibold text-white">
          {totalItems.toLocaleString("th-TH")}
        </span>{" "}
        รายการ
      </p>

      {/* Right: Page navigation buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          aria-label="หน้าก่อนหน้า"
          className="flex h-8 w-8 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900/50 text-neutral-400 transition hover:border-neutral-700 hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft size={15} strokeWidth={1.8} />
        </button>

        {pages.map((page, idx) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-8 w-8 items-center justify-center text-xs text-neutral-500 select-none"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={page === safePage ? "page" : undefined}
              className={cn(
                "flex h-8 min-w-[32px] items-center justify-center rounded-sm border px-2 text-xs transition cursor-pointer",
                page === safePage
                  ? "border-blue-500/40 bg-blue-500/10 font-semibold text-blue-400"
                  : "border-neutral-800 bg-neutral-900/50 font-medium text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900 hover:text-white"
              )}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          aria-label="หน้าถัดไป"
          className="flex h-8 w-8 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900/50 text-neutral-400 transition hover:border-neutral-700 hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <ChevronRight size={15} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
