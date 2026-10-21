"use client";

import Link from "next/link";
import { useControllerStore } from "@/store/controllerStore";

export const ControllerMobileHeader = () => {
  const { isProgramOnline, isConnected, isConnecting } = useControllerStore();

  const getStatusColor = () => {
    if (isConnecting) return "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]";
    if (isConnected && isProgramOnline) return "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]";
    return "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]";
  };

  const getStatusText = () => {
    if (isConnecting) return "กำลังเชื่อมต่อ";
    if (isConnected && isProgramOnline) return "เชื่อมต่อสำเร็จ";
    return "ไม่สามารถเชื่อมต่อได้";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-neutral-900 bg-neutral-950/90 px-4 backdrop-blur-xs lg:hidden">
      {/* Brand: HERTZ REMOTE with Passero One font matching hero */}
      <Link href="/controller" className="flex items-center gap-2">
        <span className="font-passero-one text-lg font-normal tracking-wider uppercase bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
          HERTZ REMOTE
        </span>
      </Link>

      {/* Connection Status Badge */}
      <div className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 px-2.5 py-1 text-xs">
        <span className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
        <span className="text-2xs font-medium text-neutral-300">
          {getStatusText()}
        </span>
      </div>
    </header>
  );
};

export default ControllerMobileHeader;
