"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  type LucideIcon,
} from "lucide-react";
import BackUI from "@/components/ui/back";

export interface AdminMenuGroup {
  title: string;
  menus: {
    label: string;
    href: string;
    icon: LucideIcon;
  }[];
}

interface AdminMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  menuGroups: AdminMenuGroup[];
}

export const AdminMobileDrawer = ({
  isOpen,
  onClose,
  menuGroups,
}: AdminMobileDrawerProps) => {
  const pathname = usePathname();

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
      <aside className="fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col border-r border-neutral-800 bg-neutral-950 px-4 py-6 text-white shadow-2xl transition-transform animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="mb-6 flex items-center justify-between px-3">
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <h1 className="text-lg font-bold">HERTZ PANEL</h1>
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
        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-2xs font-medium uppercase tracking-wider text-neutral-600">
                {group.title}
              </p>

              <div className="flex flex-col gap-1">
                {group.menus.map((menu) => {
                  const Icon = menu.icon;
                  const isActive =
                    menu.href === "/admin"
                      ? pathname === "/admin"
                      : menu.href === "/admin/topup"
                        ? pathname === "/admin/topup"
                        : pathname === menu.href ||
                          pathname.startsWith(`${menu.href}/`);

                  return (
                    <Link
                      key={menu.href}
                      href={menu.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-full px-4 py-2 text-sm transition ${
                        isActive
                          ? "bg-neutral-800 text-white"
                          : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                      }`}
                    >
                      <Icon size={18} strokeWidth={1.8} />
                      <span>{menu.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom BackUI Button */}
        <div className="border-t border-neutral-900 pt-4" onClick={onClose}>
          <BackUI
            href="/"
            text="กลับสู่หน้าหลัก"
            className="w-full rounded-sm px-3 py-2.5 text-sm hover:bg-blue-500/10"
          />
        </div>
      </aside>
    </div>
  );
};

export default AdminMobileDrawer;
