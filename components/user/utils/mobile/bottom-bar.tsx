"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Store, CreditCard, MonitorDown } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: typeof House;
}

const navItems: NavItem[] = [
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
    icon: CreditCard,
  },
  {
    label: "ดาวน์โหลด",
    href: "/download",
    icon: MonitorDown,
  },
];

const UserMobileBottomBar = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="เมนูนำทางบนมือถือ"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-900 bg-black/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div className="grid h-14 grid-cols-4 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-colors ${
                isActive
                  ? "text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <div
                className={`flex h-5 w-12 items-center justify-center rounded-full transition-colors ${
                  isActive ? "" : "bg-transparent"
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className="transition-transform"
                />
              </div>

              <span
                className={`text-2xs leading-tight transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-neutral-400"
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

export default UserMobileBottomBar;
