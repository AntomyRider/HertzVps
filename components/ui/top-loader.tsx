"use client";

import NextTopLoader from "nextjs-toploader";

interface TopLoaderProps {
  color?: string;
  initialPosition?: number;
  crawlSpeed?: number;
  height?: number;
  crawl?: boolean;
  showSpinner?: boolean;
  easing?: string;
  speed?: number;
  shadow?: string | false;
  zIndex?: number;
}

const TopLoader = ({
  color = "#3b82f6",
  initialPosition = 0.08,
  crawlSpeed = 200,
  height = 2.5,
  crawl = true,
  showSpinner = false,
  easing = "ease",
  speed = 200,
  shadow = "0 0 10px rgba(59, 130, 246, 0.5), 0 0 5px rgba(59, 130, 246, 0.5)",
  zIndex = 99999,
}: TopLoaderProps) => {
  return (
    <NextTopLoader
      color={color}
      initialPosition={initialPosition}
      crawlSpeed={crawlSpeed}
      height={height}
      crawl={crawl}
      showSpinner={showSpinner}
      easing={easing}
      speed={speed}
      shadow={shadow}
      zIndex={zIndex}
    />
  );
};

export default TopLoader;
