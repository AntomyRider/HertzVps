"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

interface ControlMobileHeaderProps {
  onToggleDrawer: () => void;
}

export const ControlMobileHeader = ({
  onToggleDrawer,
}: ControlMobileHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-neutral-900 bg-neutral-950/90 px-4 backdrop-blur-xs lg:hidden">
      <Link href="/control" className="flex items-center gap-2.5">
        <Image
          src="/hertz_logo.png"
          alt="Hertz Control"
          width={75}
          height={24}
          className="h-6 w-auto object-contain"
          priority
        />
        <span className="rounded-sm border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
          CONTROL
        </span>
      </Link>

      <button
        type="button"
        onClick={onToggleDrawer}
        aria-label="เปิดเมนูควบคุม"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900 text-neutral-300 transition hover:border-neutral-700 hover:text-white"
      >
        <Menu size={18} />
      </button>
    </header>
  );
};

export default ControlMobileHeader;
