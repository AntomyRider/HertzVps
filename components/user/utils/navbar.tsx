"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Store, CreditCard, MonitorDown } from "lucide-react";

import AvatarUser from "./avatar";
import UserMobileBottomBar from "./mobile/bottom-bar";

const NavbarUser = () => {
  const pathname = usePathname();

  const menus = [
    {
      label: "หน้าหลัก",
      href: "/",
      icon: House,
    },
    {
      label: "ร้านค้า",
      href: "/shop",
      icon: Store,
    },
    {
      label: "เติมเงิน",
      href: "/topup",
      icon: CreditCard ,
    },
    {
      label: "ดาวน์โหลด",
      href: "/download",
      icon: MonitorDown,
    },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 px-2 bg-black border-b border-neutral-900 sm:px-4">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-3 sm:h-14 sm:px-6">
          {/* Mobile Brand Logo */}
          <Link href="/" className="flex items-center gap-2 md:hidden">
            <span className="font-passero-one text-lg tracking-wider text-white">
              HERTZ
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-1 md:flex">
            {menus.map((menu) => {
              const Icon = menu.icon;
              const isActive = pathname === menu.href;

              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition ${
                    isActive
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={14} strokeWidth={1.8} />
                  <span>{menu.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action (User Avatar & Auth) */}
          <div className="flex items-center gap-2">
            <AvatarUser />
          </div>
        </div>
      </nav>

      {/* User Mobile Bottom Bar */}
      <UserMobileBottomBar />
    </>
  );
};

export default NavbarUser;
