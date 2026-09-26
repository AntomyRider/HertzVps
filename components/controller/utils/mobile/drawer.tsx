"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, KeyRound, LogOut, type LucideIcon } from "lucide-react";
import BackUI from "@/components/ui/back";
import { useControllerStore } from "@/store/controllerStore";

export interface ControllerMenuGroup {
  title: string;
  menus: {
    label: string;
    href: string;
    icon: LucideIcon;
  }[];
}

interface ControllerMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  menuGroups: ControllerMenuGroup[];
}

export const ControllerMobileDrawer = ({
  isOpen,
  onClose,
  menuGroups,
}: ControllerMobileDrawerProps) => {
  const pathname = usePathname();
  const { keyCode, isProgramOnline, disconnectKey } = useControllerStore();

  const maskKey = (code: string) => {
    if (!code) return "ยังไม่ได้ระบุคีย์";
    if (code.length <= 8) return code;
    return `${code.slice(0, 4)}••••••••${code.slice(-4)}`;
  };

  // Close on ESC
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

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-neutral-900 bg-neutral-950 px-4 py-5 text-white transition-transform animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <Link
            href="/controller"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <Image
              src="/hertz_logo.png"
              alt="Hertz"
              width={80}
              height={26}
              className="h-6 w-auto object-contain"
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดเมนู"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Menus */}
        <nav className="flex-1 space-y-6 overflow-y-auto py-5">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                {group.title}
              </p>

              <div className="flex flex-col gap-1">
                {group.menus.map((menu) => {
                  const Icon = menu.icon;
                  const isActive =
                    menu.href === "/controller"
                      ? pathname === "/controller"
                      : pathname === menu.href ||
                        pathname.startsWith(`${menu.href}/`);

                  return (
                    <Link
                      key={menu.href}
                      href={menu.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-medium transition ${
                        isActive
                          ? "bg-blue-500/10 text-blue-500"
                          : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.8} />
                      <span>{menu.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Key Card & BackUI Button */}
        <div className="space-y-3 border-t border-neutral-900 pt-3">
          {keyCode && (
            <div className="rounded-md border border-neutral-800/90 bg-neutral-900/40 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-blue-500/30 bg-blue-500/10 text-blue-400">
                    <KeyRound size={13} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-white">
                      {maskKey(keyCode)}
                    </p>
                    <p className="flex items-center gap-1 text-[10px] text-neutral-400">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isProgramOnline ? "bg-emerald-400" : "bg-neutral-500"
                        }`}
                      />
                      {isProgramOnline ? "ออนไลน์" : "ออฟไลน์"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    disconnectKey();
                    onClose();
                  }}
                  className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-neutral-800 text-neutral-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                  title="ออกจากระบบ / ตัดการเชื่อมต่อคีย์"
                >
                  <LogOut size={12} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          )}

          <div onClick={onClose}>
            <BackUI
              href="/"
              text="กลับสู่หน้าหลัก"
              className="w-full rounded-md px-3 py-2 text-xs font-medium hover:bg-neutral-900"
            />
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ControllerMobileDrawer;
