"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquareChartGantt,
  Package,
  ShoppingBag,
  Users,
  Wallet,
  BookMinus,
  KeySquare,
  Settings,
  Database,
} from "lucide-react";
import AdminMobileHeader from "./mobile/header";
import AdminMobileDrawer, { AdminMenuGroup } from "./mobile/drawer";
import BackUI from "@/components/ui/back";

const SidebarAdmin = () => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const menuGroups: AdminMenuGroup[] = [
    {
      title: "จัดการระบบ",
      menus: [
        {
          label: "ภาพรวมระบบ",
          href: "/admin",
          icon: SquareChartGantt,
        },
        {
          label: "หมวดหมู่",
          href: "/admin/category",
          icon: BookMinus,
        },
        {
          label: "สินค้า",
          href: "/admin/product",
          icon: Package,
        },
        {
          label: "คำสั่งซื้อ",
          href: "/admin/order",
          icon: ShoppingBag,
        },
      ],
    },
    {
      title: "ผู้ใช้งาน",
      menus: [
        {
          label: "ผู้ใช้งาน",
          href: "/admin/user",
          icon: Users,
        },
        {
          label: "การเงิน",
          href: "/admin/topup",
          icon: Wallet,
        },
        {
          label: "ตั้งค่าการเงิน",
          href: "/admin/topup/setting",
          icon: Settings,
        },
      ],
    },
    {
      title: "ระบบโปรแกรม",
      menus: [
        {
          label: "จัดการคีย์",
          href: "/admin/key",
          icon: KeySquare,
        },
      ],
    },
    {
      title: "ระบบเซิฟเวอร์",
      menus: [
        {
          label: "สถานะของเซิฟเวอร์",
          href: "/admin/server",
          icon: Database,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Top Header (lg:hidden) */}
      <AdminMobileHeader onToggleDrawer={() => setIsDrawerOpen(true)} />

      {/* Mobile Slide Drawer (lg:hidden) */}
      <AdminMobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        menuGroups={menuGroups}
      />

      {/* Desktop Persistent Sidebar (hidden on mobile, visible on lg+) */}
      <aside className="fixed left-0 top-0 hidden lg:flex h-screen w-64 flex-col border-r border-neutral-900 bg-neutral-950 px-4 py-6 text-white">
        <div className="mb-8 px-3">
          <h1 className="text-lg font-bold">Hertz Admin</h1>
          <p className="mt-1 text-xs text-neutral-500">Management Panel</p>
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
                      className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition ${
                        isActive
                          ? "bg-blue-500/10 text-blue-500"
                          : "text-neutral-400 hover:bg-blue-500/10 hover:text-white"
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

export default SidebarAdmin;