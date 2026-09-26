"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  House,
  Store,
  Wallet,
  Download,
  Usb,
  X,
  ScanFace,
  ShoppingBag,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { DiscordIcon } from "@/components/user/utils/avatar";
import { isValidImageUrl } from "@/lib/utils";

interface UserMobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserMobileSidebar = ({
  isOpen,
  onClose,
}: UserMobileSidebarProps) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menus = [
    { label: "หน้าแรก", href: "/", icon: House },
    { label: "ร้านค้า", href: "/shop", icon: Store },
    { label: "เติมเงิน", href: "/topup", icon: Wallet },
    { label: "ดาวน์โหลด", href: "/download", icon: Download },
    { label: "ควบคุมโปรแกรม", href: "/controller", icon: Usb },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Sidebar Panel (from Left) */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-neutral-900 bg-neutral-950 px-4 py-5 text-white shadow-2xl transition-transform animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <Link href="/" onClick={onClose} className="flex items-center">
            <Image
              src="/hertz_logo.png"
              alt="Hertz"
              width={88}
              height={28}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดเมนู"
            className="flex h-8 w-8 items-center justify-center rounded-sm text-neutral-400 transition hover:bg-neutral-900 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Menus */}
        <nav className="flex-1 overflow-y-auto py-5">
          <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            เมนูหลัก
          </p>

          <div className="flex flex-col gap-1">
            {menus.map((menu) => {
              const Icon = menu.icon;
              const isActive = pathname === menu.href;

              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-500/10 text-blue-500 font-semibold "
                      : "text-neutral-300 hover:bg-neutral-900 hover:text-white "
                  }`}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{menu.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Account / Navigation Shortcuts if logged in */}
          {user && (
            <div className="mt-6 border-t border-neutral-900 pt-5">
              <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                บัญชีและการใช้งาน
              </p>

              <div className="flex flex-col gap-1">
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium text-yellow-500 transition hover:bg-blue-500/10"
                  >
                    <ScanFace size={18} strokeWidth={1.8} />
                    <span>จัดการระบบ</span>
                  </Link>
                )}

                <Link
                  href="/history?tab=orders"
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-900 hover:text-white"
                >
                  <ShoppingBag size={18} strokeWidth={1.8} />
                  <span>ประวัติของคุณ</span>
                </Link>

              </div>
            </div>
          )}
        </nav>

        {/* Footer / User Profile & Auth */}
        <div className="border-t border-neutral-900 pt-4">
          {user ? (
            <div className="space-y-3">
              {/* User info row */}
              <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900/60 p-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  {isValidImageUrl(user.avatar) ? (
                    <Image
                      src={user.avatar!}
                      alt={user.name}
                      width={34}
                      height={34}
                      className="h-8.5 w-8.5 rounded-full object-cover ring-1 ring-neutral-800 shrink-0"
                      unoptimized={user.avatar!.startsWith("http")}
                    />
                  ) : (
                    <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <UserIcon size={16} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white">
                      {user.name}
                    </p>
                    <p className="text-[11px] font-semibold text-emerald-400">
                      ฿
                      {Number(user.balance).toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                <Link
                  href="/topup"
                  onClick={onClose}
                  className="shrink-0 rounded-sm bg-blue-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-blue-500"
                >
                  เติมเงิน
                </Link>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-sm border border-neutral-800 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
              >
                <LogOut size={14} />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            <a
              href="/api/v1/auth/discord"
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#5865F2] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#4752C4] shadow-sm cursor-pointer"
            >
              <DiscordIcon />
              <span>เข้าสู่ระบบด้วย Discord</span>
            </a>
          )}
        </div>
      </aside>
    </div>
  );
};

export default UserMobileSidebar;
