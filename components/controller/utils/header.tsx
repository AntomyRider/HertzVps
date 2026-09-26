"use client";

import { usePathname } from "next/navigation";
import BackUI from "@/components/ui/back";

interface PageHeaderMeta {
  title: string;
  description: string;
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
      description: "เพิ่ม แก้ไข และจัดการหมวดหมู่กลุ่มสำหรับโพสต์",
      backHref: "/controller/manage",
      backText: "กลับหน้าจัดการบัญชี",
    };
  }

  if (pathname === "/controller/manage") {
    return {
      title: "จัดการบัญชีและการทำงาน",
      description:
        "ควบคุมการทำงานของแต่ละบัญชี ติดตามสถานะงาน และดูสถิติรายบัญชี",
    };
  }

  if (pathname.startsWith("/controller/logger")) {
    return {
      title: "แสดงผลการทำงาน",
      description:
        "ตรวจสอบบันทึกการทำงานของทุกบัญชีและสถานะคำสั่งแบบเรียลไทม์",
    };
  }

  if (pathname.startsWith("/controller/setting")) {
    return {
      title: "ตั้งค่า",
      description: "กำหนดค่าความหน่วงและพฤติกรรมการทำงานของระบบ",
    };
  }

  return {
    title: "ภาพรวมการทำงาน",
    description:
      "สรุปข้อมูลสถิติการทำงานของระบบ ทั้งหมด สำเร็จ ผิดพลาด และติดอนุมัติ",
  };
};

export default function HeaderController() {
  const pathname = usePathname();
  const { title, description, backHref, backText } =
    getControllerHeaderMeta(pathname);

  return (
    <div className="space-y-2">
      {backHref && <BackUI href={backHref} text={backText || "ย้อนกลับ"} />}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {title}
        </h1>
        <p className="mt-1 text-sm text-neutral-400">{description}</p>
      </div>
    </div>
  );
}
