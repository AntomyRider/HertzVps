"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  X,
  Store,
  LogOut,
  KeyRound,
  type LucideIcon,
} from "lucide-react";
import { useControlStore } from "@/store/controlStore";

export interface ControlMenuGroup {
  title: string;
  menus: {
    label: string;
    href: string;
    icon: LucideIcon;
  }[];
}

interface ControlMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  menuGroups: ControlMenuGroup[];
}

const maskKey = (raw: string) => {
  if (raw.length <= 8) return raw;
  return `${raw.slice(0, 6)}••••${raw.slice(-4)}`;
};

export const ControlMobileDrawer = ({
  isOpen,
  onClose,
  menuGroups,
}: ControlMobileDrawerProps) => {
  const pathname = usePathname();
  const { keyInfo, logoutKey } = useControlStore();

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
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-neutral-900 bg-neutral-950 px-4 py-5 text-white transition-transform">
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <Link
            href="/control"
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
            <span className="rounded-sm border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
              CONTROL
            </span>
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
                    menu.href === "/control"
                      ? pathname === "/control"
                      : pathname === menu.href ||
                        pathname.startsWith(`${menu.href}/`);

                  return (
                    <Link
                      key={menu.href}
                      href={menu.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-md border px-3 py-2.5 text-xs font-medium transition ${
                        isActive
                          ? "border-blue-500/20 bg-blue-500/10 text-blue-500"
                          : "border-transparent text-neutral-400 hover:bg-neutral-900 hover:text-white"
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

        <div className="space-y-2 border-t border-neutral-900 pt-3">
          {keyInfo && (
            <div className="flex items-center justify-between rounded-sm border border-neutral-900 bg-neutral-900/40 px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <KeyRound size={14} className="shrink-0 text-blue-400" />
                <span className="truncate text-xs font-medium text-neutral-300">
                  {maskKey(keyInfo.code)}
                </span>
              </div>
              <span className="rounded-sm border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
                {keyInfo.isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              onClose();
              logoutKey();
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-neutral-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={15} />
            <span>สลับคีย์ / ออกจากระบบ</span>
          </button>

          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
          >
            <Store size={15} />
            <span>กลับสู่หน้าหลัก</span>
          </Link>
        </div>
      </aside>
    </div>
  );
};

export default ControlMobileDrawer;
