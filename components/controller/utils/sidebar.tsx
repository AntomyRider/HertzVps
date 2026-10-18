"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquareChartGantt,
  SlidersHorizontal,
  ScrollText,
  Settings,
} from "lucide-react";
import ControllerMobileHeader from "./mobile/header";
import ControllerMobileDrawer, {
  ControllerMenuGroup,
} from "./mobile/drawer";
import ControllerMobileBottomBar from "./mobile/bottom-bar";
import BackUI from "@/components/ui/back";
import { useControllerStore } from "@/store/controllerStore";
import { KeyRound, LogOut } from "lucide-react";

const SidebarController = () => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { keyCode, isProgramOnline, disconnectKey } = useControllerStore();

  const maskKey = (code: string) => {
    if (!code) return "ยังไม่ได้ระบุคีย์";
    if (code.length <= 8) return code;
    return `${code.slice(0, 4)}••••••••${code.slice(-4)}`;
  };

  const menuGroups: ControllerMenuGroup[] = [
    {
      title: "ควบคุมโปรแกรม",
      menus: [
        {
          label: "ภาพรวม",
          href: "/controller",
          icon: SquareChartGantt,
        },
        {
          label: "จัดการข้อมูล",
          href: "/controller/manage",
          icon: SlidersHorizontal,
        },
        {
          label: "แสดงผลการทำงาน",
          href: "/controller/logger",
          icon: ScrollText,
        },
        {
          label: "ตั้งค่า",
          href: "/controller/setting",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Top Header (lg:hidden) */}
      <ControllerMobileHeader onToggleDrawer={() => setIsDrawerOpen(true)} />

      {/* Mobile Slide Drawer (lg:hidden) */}
      <ControllerMobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        menuGroups={menuGroups}
      />

      {/* Mobile Bottom Navigation Bar (lg:hidden) */}
      <ControllerMobileBottomBar />

      {/* Desktop Persistent Sidebar (hidden on mobile, visible on lg+) */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col bg-neutral-900 px-4 py-6 text-white lg:flex">
        <div className="mb-6 px-3">
          <h1 className="text-lg font-bold">HERTZ REMOTE</h1>
        </div>

        

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
                    menu.href === "/controller"
                      ? pathname === "/controller"
                      : pathname === menu.href ||
                        pathname.startsWith(`${menu.href}/`);

                  return (
                    <Link
                      key={menu.href}
                      href={menu.href}
                      className={`flex items-center gap-3 rounded-full px-5 py-2 text-sm transition ${
                        isActive
                          ? "bg-neutral-950 text-white"
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
        <div className="border-t border-neutral-900 pt-4">
          <BackUI
            href="/"
            text="กลับสู่หน้าหลัก"
            className="w-full rounded-sm px-3 py-2.5 text-sm hover:bg-blue-500/10"
          />
        </div>
      </aside>
    </>
  );
};

export default SidebarController;
