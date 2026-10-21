"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ScrollText,
  Settings,
} from "lucide-react";
import BackUI from "@/components/ui/back";

interface PageHeaderMeta {
  title: string;
  icon: React.ElementType;
  backHref?: string;
  backText?: string;
}

const getControllerHeaderMeta = (pathname: string): PageHeaderMeta => {
  if (pathname.startsWith("/controller/worker")) {
    return {
      title: "เริ่มการทำงาน",
      icon: Users,
    };
  }

  if (pathname.startsWith("/controller/manage")) {
    return {
      title: "จัดการข้อมูล",
      icon: Users,
    };
  }

  if (pathname.startsWith("/controller/logger")) {
    return {
      title: "แสดงผลการทำงาน",
      icon: ScrollText,
    };
  }

  if (pathname.startsWith("/controller/setting")) {
    return {
      title: "การตั้งค่า",
      icon: Settings,
    };
  }

  return {
    title: "ภาพรวมการทำงาน",
    icon: LayoutDashboard,
  };
};

export default function HeaderController() {
  const pathname = usePathname();
  const { title, icon: Icon, backHref, backText } =
    getControllerHeaderMeta(pathname);

  return (
    <div className="mb-5 shrink-0 space-y-2 border-b border-neutral-800 pb-2">
      {backHref && (
        <BackUI href={backHref} text={backText || "ย้อนกลับ"} />
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center border-r border-neutral-800 pr-3">
          <Icon size={20} className="text-neutral-400" />
        </div>

        <h1 className="text-sm tracking-tight text-white">{title}</h1>
      </div>
    </div>
  );
}