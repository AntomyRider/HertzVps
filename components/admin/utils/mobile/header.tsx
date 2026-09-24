"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

interface AdminMobileHeaderProps {
  onToggleDrawer: () => void;
}

export const AdminMobileHeader = ({ onToggleDrawer }: AdminMobileHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-neutral-900 bg-neutral-950/90 px-4 backdrop-blur-md lg:hidden">
      {/* Brand / Logo */}
      <Link href="/admin" className="flex items-center gap-2.5">
        <Image
          src="/hertz_logo.png"
          alt="Hertz Admin"
          width={75}
          height={24}
          className="h-6 w-auto object-contain"
          priority
        />
      </Link>

      {/* Hamburger Toggle */}
      <button
        type="button"
        onClick={onToggleDrawer}
        aria-label="เปิดเมนูแอดมิน"
        className="flex h-9 w-9 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900 text-neutral-300 transition hover:border-neutral-700 hover:text-white cursor-pointer"
      >
        <Menu size={18} />
      </button>
    </header>
  );
};

export default AdminMobileHeader;
