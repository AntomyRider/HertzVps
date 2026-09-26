"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Store, Wallet, Menu, Download, Usb  } from "lucide-react";
import Image from "next/image";

import AvatarUser from "./avatar";
import UserMobileSidebar from "./mobile/sidebar";

const NavbarUser = () => {
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const menus = [
    {
      label: "หน้าแรก",
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
      icon: Wallet,
    },
    {
      label: "ดาวน์โหลด",
      href: "/download",
      icon: Download,
    },
    {
      label: "ควบคุมโปรแกรม",
      href: "/controller",
      icon: Usb ,
    },
  ];

  return (
    <>
      <nav
        className={`sticky top-0 z-40 px-2 transition-all duration-500 sm:px-4 ${
          isScrolled ? "pt-2" : ""
        }`}
      >
        <div
          className={`mx-auto flex h-14  items-center justify-between px-4 transition-all duration-500 sm:h-16 sm:px-6 ${
            isScrolled
              ? "max-w-6xl rounded-md border border-neutral-800/80 bg-neutral-950/90 shadow-lg shadow-black/20 backdrop-blur-xl"
              : "max-w-7xl border border-transparent bg-transparent"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/hertz_logo.png"
              alt="Hertz"
              width={95}
              height={30}
              className="h-7 w-auto object-contain sm:h-8"
              priority
            />
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
                  className={`flex items-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-500/10 text-blue-500"
                      : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{menu.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <AvatarUser />
            </div>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="เปิดเมนูนำทาง"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900/80 text-neutral-300 transition hover:border-neutral-700 hover:text-white md:hidden"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* User Mobile Sidebar */}
      <UserMobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
};

export default NavbarUser;
