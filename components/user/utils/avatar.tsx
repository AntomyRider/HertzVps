"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Wallet,
  LogOut,
  ScanFace,
  ChevronDown,
  ShoppingBag,
  User as UserIcon,
  type LucideIcon,
  KeySquare,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { isValidImageUrl } from "@/lib/utils";

interface DropdownMenuItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  iconColor?: string;
  roles?: ("USER" | "ADMIN")[];
  isDanger?: boolean;
  hasDivider?: boolean;
  onClick?: () => void;
}

export const DiscordIcon = ({ className = "h-4 w-4 fill-current" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 127.14 96.36">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
  </svg>
);

const AvatarUser = () => {
  const { user, isLoading, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="h-9 w-28 animate-pulse rounded-full bg-neutral-900" />
    );
  }

  if (!user) {
    return (
      <a
        href="/api/v1/auth/discord"
        className="flex items-center gap-2 rounded-full bg-[#5865F2] px-3.5 sm:px-4 py-2 text-xs font-medium text-white transition hover:bg-[#4752C4] shadow-sm"
      >
        <DiscordIcon />
        <span className="hidden sm:inline">เข้าสู่ระบบด้วย Discord</span>
        <span className="sm:hidden">เข้าสู่ระบบ</span>
      </a>
    );
  }

  const menuItems: DropdownMenuItem[] = [
    {
      label: "ประวัติของคุณ",
      href: "/history?tab=orders",
      icon: ShoppingBag,
      iconColor: "text-white-500",
    },
    {
      label: "จัดการระบบ",
      href: "/admin",
      icon: KeySquare,
      iconColor: "text-yellow-500",
      roles: ["ADMIN"],
    },
    {
      label: "ออกจากระบบ",
      icon: LogOut,
      isDanger: true,
      hasDivider: true,
      onClick: logout,
    },
  ];

  const visibleMenuItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user.role),
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Unified User & Balance Trigger Button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2.5 rounded-sm px-4 border border-neutral-800 bg-neutral-900/70 py-1 pr-3.5 transition hover:border-neutral-700 hover:bg-neutral-900 cursor-pointer"
      >
        {isValidImageUrl(user.avatar) ? (
          <Image
            src={user.avatar!}
            alt={user.name}
            width={34}
            height={34}
            className="h-8.5 w-8.5 rounded-full object-cover ring-1 ring-neutral-800"
            unoptimized={user.avatar!.startsWith("http")}
          />
        ) : (
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-blue-600 text-white">
            <UserIcon size={16} />
          </div>
        )}

        <div className="flex flex-col items-start text-left leading-tight">
          <span className="max-w-[120px] truncate text-xs font-semibold text-white">
            {user.name}
          </span>
          <span className="text-[11px] font-medium text-emerald-400">
            ฿
            {Number(user.balance).toLocaleString("th-TH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <ChevronDown
          size={14}
          className={`text-neutral-400 transition-transform duration-200 ml-0.5 ${
            dropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-sm border border-neutral-800 bg-neutral-950 p-2 shadow-2xl backdrop-blur-xl z-50">
          {/* User info header */}
          <div className="border-b border-neutral-900 px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-white">
              {user.name}
            </p>
            <div className="mt-1 flex items-center justify-between text-xs"></div>
            <div className="mt-2 flex items-center justify-between rounded-sm bg-neutral-900/60 px-2 py-2 text-xs">
              <span className="text-neutral-400">คงเหลือ:</span>
              <span className="font-semibold text-emerald-400">
                ฿
                {Number(user.balance).toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Menu items */}
          <div className="mt-1 space-y-1">
            {visibleMenuItems.map((item, index) => {
              const Icon = item.icon;
              const content = (
                <>
                  <Icon
                    size={16}
                    className={
                      item.iconColor ||
                      (item.isDanger ? "text-red-400" : "text-neutral-400")
                    }
                  />
                  <span>{item.label}</span>
                </>
              );

              const itemClass = item.isDanger
                ? "flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                : "flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-xs text-neutral-300 transition hover:bg-neutral-900 hover:text-white cursor-pointer";

              return (
                <div key={item.href || item.label || index}>
                  {item.hasDivider && (
                    <div className="my-1 border-t border-neutral-900" />
                  )}
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setDropdownOpen(false)}
                      className={itemClass}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        item.onClick?.();
                      }}
                      className={itemClass}
                    >
                      {content}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarUser;
