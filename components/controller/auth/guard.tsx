"use client";

import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useControllerStore } from "@/store/controllerStore";
import ControllerAuthForm from "@/components/controller/auth/form";
import HologramSpaceBackground from "@/components/ui/hologram-space-background";

interface ControllerAuthGuardProps {
  children: React.ReactNode;
}

export default function ControllerAuthGuard({
  children,
}: ControllerAuthGuardProps) {
  const { isAuthChecking, isConnected, keyCode, initRealtimeIfNeeded } =
    useControllerStore();

  useEffect(() => {
    void initRealtimeIfNeeded();
  }, [initRealtimeIfNeeded]);

  if (isAuthChecking) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
        <HologramSpaceBackground />
        <div className="flex flex-col items-center gap-3 rounded-md border border-neutral-800/80 bg-neutral-950 p-6 text-neutral-400">
          <Loader2 size={24} className="animate-spin text-blue-500" />
          <p className="text-xs text-neutral-400">กำลังตรวจสอบ License Key...</p>
        </div>
      </div>
    );
  }

  if (!isConnected || !keyCode) {
    return <ControllerAuthForm />;
  }

  return <>{children}</>;
}
