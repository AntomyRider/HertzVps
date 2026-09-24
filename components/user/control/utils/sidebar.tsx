"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquareChartGantt,
  Zap,
  Terminal,
  Settings,
  KeyRound,
  LogOut,
  Store,
} from "lucide-react";
import { useControlStore } from "@/store/controlStore";
import ControlMobileHeader from "./mobile/header";
import ControlMobileDrawer, { ControlMenuGroup } from "./mobile/drawer";

const maskKey = (raw: string) => {
  if (raw.length <= 8) return raw;
  return `${raw.slice(0, 6)}••••${raw.slice(-4)}`;
};

export const SidebarControl = () => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { keyInfo, logoutKey } = useControlStore();

  const menuGroups: ControlMenuGroup[] = [
    {
      title: "ควบคุมการทำงาน",
      menus: [
        {
          label: "ภาพรวมระบบ",
          href: "/control",
          icon: SquareChartGantt,
        },
        {
          label: "จัดการการทำงาน",
          href: "/control/worker",
          icon: Zap,
        },
        {
          label: "บันทึกการทำงาน (Log)",
          href: "/control/logger",
          icon: Terminal,
        },
      ],
    },
    {
      title: "การตั้งค่าระบบ",
      menus: [
        {
          label: "ตั้งค่าระบบและบอท",
          href: "/control/settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Top Header (lg:hidden) */}
      <ControlMobileHeader onToggleDrawer={() => setIsDrawerOpen(true)} />

      {/* Mobile Slide Drawer (lg:hidden) */}
      <ControlMobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        menuGroups={menuGroups}
      />

      {/* Desktop Persistent Sidebar (hidden on mobile, visible on lg+) */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-neutral-900 bg-neutral-950 px-4 py-6 text-white lg:flex">
        <div className="mb-8 px-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white">
              Hertz Control
            </h1>
            <span className="rounded-sm border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
              REMOTE
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Web Remote Control Panel
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-neutral-600">
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
                      className={`flex items-center gap-3 rounded-sm border px-3 py-2.5 text-sm transition ${
                        isActive
                          ? "border-blue-500/20 bg-blue-500/10 text-blue-500"
                          : "border-transparent text-neutral-400 hover:bg-blue-500/10 hover:text-white"
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

        {/* Bottom Key Status & Actions */}
        <div className="space-y-2 border-t border-neutral-900 pt-4">
          {keyInfo && (
            <div className="flex items-center justify-between rounded-sm border border-neutral-800 bg-neutral-900/50 px-3 py-2">
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
            onClick={logoutKey}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-medium text-neutral-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={15} strokeWidth={1.8} />
            <span>สลับคีย์ / ออกจากระบบ</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
          >
            <Store size={15} strokeWidth={1.8} />
            <span>กลับสู่หน้าหลัก</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default SidebarControl;
