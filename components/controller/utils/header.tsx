"use client";

import { usePathname } from "next/navigation";
import BackUI from "@/components/ui/back";

interface PageHeaderMeta {
  title: string;
  backHref?: string;
  backText?: string;
}

const getControllerHeaderMeta = (pathname: string): PageHeaderMeta => {
  if (
    pathname === "/controller/manage/groups" ||
    pathname.startsWith("/controller/manage/")
  ) {
    return {
      title: "จัดการกลุ่มเป้าหมาย",
      backHref: "/controller/manage",
      backText: "กลับหน้าจัดการบัญชี",
    };
  }

  if (pathname === "/controller/manage") {
    return {
      title: "จัดการบัญชีและการทำงาน",
    };
  }

  if (pathname.startsWith("/controller/logger")) {
    return {
      title: "แสดงผลการทำงาน",
    };
  }

  if (pathname.startsWith("/controller/setting")) {
    return {
      title: "ตั้งค่า",
    };
  }

  return {
    title: "ภาพรวมการทำงาน",
  };
};

export default function HeaderController() {
  const pathname = usePathname();
  const { title, backHref, backText } = getControllerHeaderMeta(pathname);

  return (
    <div className="space-y-2 border-b border-neutral-800 pb-2 mb-5">
      {backHref && <BackUI href={backHref} text={backText || "ย้อนกลับ"} />}
      <div>
        <h1 className="text-lg tracking-tight text-white">{title}</h1>
      </div>
    </div>
  );
}
