"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartPie ,
  HardDrive ,
  Gamepad2 ,
  Settings,
  CodeXml,
  type LucideIcon,
} from "lucide-react";
import ControllerMobileHeader from "./mobile/header";
import ControllerMobileBottomBar from "./mobile/bottom-bar";
import BackUI from "@/components/ui/back";

export interface ControllerMenuGroup {
  title: string;
  menus: {
    label: string;
    href: string;
    icon: LucideIcon;
  }[];
}

const SidebarController = () => {
  const pathname = usePathname();

  const menuGroups: ControllerMenuGroup[] = [
    {
      title: "ควบคุมโปรแกรม",
      menus: [
        {
          label: "ภาพรวม",
          href: "/controller",
          icon: ChartPie ,
        },
        {
          label: "เริ่มการทำงาน",
          href: "/controller/worker",
          icon: Gamepad2 ,
        },
        {
          label: "จัดการข้อมูล",
          href: "/controller/manage",
          icon: HardDrive ,
        },
        {
          label: "แสดงผลการทำงาน",
          href: "/controller/logger",
          icon: CodeXml  ,
        },
        {
          label: "การตั้งค่า",
          href: "/controller/setting",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Top Header (lg:hidden) */}
      <ControllerMobileHeader />

      {/* Mobile Bottom Navigation Bar (lg:hidden) */}
      <ControllerMobileBottomBar />

      {/* Desktop Persistent Sidebar (hidden on mobile, visible on lg+) */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col bg-neutral-900 px-4 py-6 text-white lg:flex">
        <div className="mb-6 px-3">
          <h1 className="font-passero-one text-xl tracking-wider uppercase bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
            HERTZ REMOTE
          </h1>
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
        <div className="border-t border-neutral-900 pt-4">
          <BackUI
            href="/"
            text="กลับสู่หน้าหลัก"
            className="w-full rounded-full px-5 py-2 text-sm hover:bg-neutral-800"
          />
        </div>
      </aside>
    </>
  );
};

export default SidebarController;
