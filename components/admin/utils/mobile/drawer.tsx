"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  X,
  Store,
  type LucideIcon,
} from "lucide-react";

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
      <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-neutral-900 bg-neutral-950 px-4 py-5 text-white shadow-2xl transition-transform animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <Link
            href="/admin"
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
            className="flex h-8 w-8 items-center justify-center rounded-sm text-neutral-400 transition hover:bg-neutral-900 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Menus */}
        <nav className="flex-1 overflow-y-auto py-5 space-y-6">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
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
                      className={`flex items-center gap-3 rounded-md px-3 py-2.5 border text-xs font-medium transition ${
                        isActive
                          ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          : "text-neutral-400 hover:bg-neutral-900 hover:text-white border-transparent"
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

        {/* Bottom Utility Link: Back to Shop */}
        <div className="border-t border-neutral-900 pt-3">
          <Link
            href="/shop"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
          >
            <Store size={15} />
            <span>กลับสู่หน้าร้านค้า</span>
          </Link>
        </div>
      </aside>
    </div>
  );
};

export default AdminMobileDrawer;
