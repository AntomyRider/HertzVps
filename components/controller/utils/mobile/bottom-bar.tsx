"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartPie ,
  HardDrive ,
  Gamepad2 ,
  Settings,
  CodeXml 
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: typeof ChartPie ;
}

const navItems: NavItem[] = [
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
    label: "ผลการทำงาน",
    href: "/controller/logger",
    icon: CodeXml  ,
  },
  {
    label: "การตั้งค่า",
    href: "/controller/setting",
    icon: Settings,
  },
];

export const ControllerMobileBottomBar = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="เมนูควบคุมบนมือถือ"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-900 bg-neutral-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <div className="grid h-16 grid-cols-5 items-center px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/controller"
              ? pathname === "/controller"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 py-1 transition-all ${
                isActive
                  ? "text-blue-400"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >

              <div
                className={`flex items-center justify-center transition ${
                  isActive ? "bg-blue-500/10" : ""
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              </div>

              <span
                className={`text-2xs leading-none ${
                  isActive ? " text-blue-400" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default ControllerMobileBottomBar;
