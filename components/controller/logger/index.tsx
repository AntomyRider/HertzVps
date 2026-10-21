"use client";

import React, { useEffect } from "react";
import Toolbar from "./toolbar";
import Console from "./console";
import { useControllerStore } from "@/store/controllerStore";

const LoggerControllerView = () => {
  const initRealtimeIfNeeded = useControllerStore(
    (state) => state.initRealtimeIfNeeded
  );

  useEffect(() => {
    initRealtimeIfNeeded();
  }, [initRealtimeIfNeeded]);

  return (
    <div className="flex h-full min-h-[460px] sm:min-h-[540px] flex-1 flex-col gap-3 sm:gap-4">
      {/* ส่วนควบคุม Toolbar (Auto Scroll, Clear, Copy, Search, Filter) */}
      <Toolbar />

      {/* ส่วนของ Console Log Viewer */}
      <Console />
    </div>
  );
};

export default LoggerControllerView;
