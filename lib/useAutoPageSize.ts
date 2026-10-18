"use client";

import { useState, useEffect, type RefObject } from "react";

interface AutoPageSizeOptions {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  fallbackRowHeight?: number;
  bottomOffset?: number;
}

/**
 * Calculates the optimal itemsPerPage dynamically based on the available
 * viewport height and the real DOM rendered height of table rows.
 * This guarantees the table + header + integrated footer fits on screen without vertical scrollbars.
 */
export function useAutoPageSize(
  containerRef: RefObject<HTMLElement | null>,
  options: AutoPageSizeOptions = {}
) {
  const {
    defaultSize = 10,
    minSize = 5,
    maxSize = 25,
    fallbackRowHeight = 54,
    bottomOffset = 36,
  } = options;

  const [itemsPerPage, setItemsPerPage] = useState<number>(defaultSize);

  useEffect(() => {
    const calculate = () => {
      if (typeof window === "undefined") return;

      // Mobile screens (< 1024px) use standard natural card scrolling
      if (window.innerWidth < 1024) {
        setItemsPerPage(defaultSize);
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const tableTop = rect.top;
      const windowHeight = window.innerHeight;

      // Measure thead height from DOM
      const thead = container.querySelector("thead");
      const theadHeight = thead ? thead.getBoundingClientRect().height : 45;

      // Table footer height (integrated pagination bar)
      const footerHeight = 57;

      const availableHeight = windowHeight - tableTop - theadHeight - footerHeight - bottomOffset;

      if (availableHeight > 0) {
        // Measure real DOM row height from first table row if rendered
        const firstRow = container.querySelector("tbody tr");
        const realRowHeight =
          firstRow && firstRow.getBoundingClientRect().height > 20
            ? firstRow.getBoundingClientRect().height
            : fallbackRowHeight;

        const fitted = Math.floor(availableHeight / realRowHeight);
        const clamped = Math.max(minSize, Math.min(maxSize, fitted));
        setItemsPerPage(clamped);
      }
    };

    calculate();

    let rafId: number | null = null;
    const handleResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(calculate);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [containerRef, defaultSize, minSize, maxSize, fallbackRowHeight, bottomOffset]);

  return itemsPerPage;
}

export default useAutoPageSize;
