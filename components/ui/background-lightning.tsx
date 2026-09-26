"use client";

import React from "react";

export const BackgroundLightning: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black"
    >
      {/* Subtle animated grid pattern (no running electric lines) */}
      <div
        className="absolute inset-0 animate-[grid-move_4s_linear_infinite] bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"
      />

      {/* Soft radial vignette to keep foreground UI crisp */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.68)_100%)]" />

      {/* Subtle white diagonal gradient overlay from top-left to center/bottom-right */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_0%_0%,rgba(255,255,255,0.055)_0%,rgba(255,255,255,0.025)_35%,rgba(255,255,255,0.008)_60%,transparent_85%),linear-gradient(135deg,rgba(255,255,255,0.035)_0%,rgba(255,255,255,0.012)_30%,transparent_65%)]"
      />
    </div>
  );
};

export default BackgroundLightning;
