"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FadeDirection = "up" | "down" | "left" | "right" | "none";

export interface FadeInProps {
  children: ReactNode;
  className?: string;
  direction?: FadeDirection;
  delay?: number;
  duration?: number;
  threshold?: number;
  /**
   * If false (default), element will both Fade In when entering viewport
   * and Fade Out when leaving viewport.
   * Set to true to only animate once on initial reveal.
   */
  once?: boolean;
}

const directionClasses: Record<
  FadeDirection,
  { hidden: string; visible: string }
> = {
  up: {
    hidden: "opacity-0 translate-y-5",
    visible: "opacity-100 translate-y-0",
  },
  down: {
    hidden: "opacity-0 -translate-y-5",
    visible: "opacity-100 translate-y-0",
  },
  left: {
    hidden: "opacity-0 translate-x-5",
    visible: "opacity-100 translate-x-0",
  },
  right: {
    hidden: "opacity-0 -translate-x-5",
    visible: "opacity-100 translate-x-0",
  },
  none: {
    hidden: "opacity-0",
    visible: "opacity-100",
  },
};

const FadeIn = ({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 550,
  threshold = 0.05,
  once = false,
}: FadeInProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(node);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once]);

  const { hidden, visible } = directionClasses[direction];

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: isVisible ? `${delay}ms` : "0ms",
      }}
      className={cn(
        "transition-all ease-out will-change-[opacity,transform]",
        isVisible ? visible : hidden,
        className
      )}
    >
      {children}
    </div>
  );
};

export default FadeIn;
