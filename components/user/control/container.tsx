"use client";

import { useEffect } from "react";
import { useControlStore } from "@/store/controlStore";
import ControlKeyLogin from "./key-login";
import ControlDashboardShell from "./dashboard-shell";

export const ControlContainer = () => {
  const { isAuthenticated, isInitializing, restoreSession } = useControlStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (isInitializing) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center py-12">
        <div className="h-72 w-full animate-pulse rounded-md border border-neutral-800 bg-neutral-900/50" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <ControlKeyLogin />;
  }

  return <ControlDashboardShell />;
};

export default ControlContainer;
