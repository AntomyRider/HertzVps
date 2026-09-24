"use client";

import { useEffect } from "react";
import { useControlStore } from "@/store/controlStore";
import ControlKeyLogin from "../key-login";
import SidebarControl from "./sidebar";

interface ControlLayoutShellProps {
  children: React.ReactNode;
}

export const ControlLayoutShell = ({ children }: ControlLayoutShellProps) => {
  const {
    keyInfo,
    isAuthenticated,
    isInitializing,
    restoreSession,
    fetchRemoteState,
    applyRemoteSnapshot,
  } = useControlStore();

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (!isAuthenticated || !keyInfo?.code) return;

    void fetchRemoteState();

    // 1. Real-Time Server-Sent Events (SSE) Stream
    const sseUrl = `/api/v1/public/control/events?code=${encodeURIComponent(
      keyInfo.code
    )}&role=web`;
    const eventSource = new EventSource(sseUrl);

    const handleStateUpdated = (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        applyRemoteSnapshot(parsed);
      } catch {
        // Ignore parse error
      }
    };

    eventSource.addEventListener("STATE_UPDATED", handleStateUpdated);

    // 2. Fallback heartbeat poll every 4s
    const timer = setInterval(() => {
      void fetchRemoteState();
    }, 4000);

    return () => {
      eventSource.removeEventListener("STATE_UPDATED", handleStateUpdated);
      eventSource.close();
      clearInterval(timer);
    };
  }, [isAuthenticated, keyInfo?.code, fetchRemoteState, applyRemoteSnapshot]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <div className="h-72 w-full max-w-md animate-pulse rounded-md border border-neutral-800 bg-neutral-900/50" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <ControlKeyLogin />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SidebarControl />

      <main className="min-h-screen p-4 pt-18 text-white sm:p-6 lg:ml-64 lg:pt-6">
        {children}
      </main>
    </div>
  );
};

export default ControlLayoutShell;
