"use client";

import {
  Monitor,
  RefreshCw,
  CloudDownload,
  SkipForward,
} from "lucide-react";
import { useControlStore } from "@/store/controlStore";
import { toast } from "@/components/ui/toast";

export const ControlAdvanceSettings = () => {
  const { config, setToggleSetting } = useControlStore();

  const handleToggle = (
    key: "hideScreen" | "autoRetry" | "autoUpdate" | "skipPending",
    value: boolean
  ) => {
    setToggleSetting(key, value);
    toast.success("บันทึกการตั้งค่าเรียบร้อยแล้ว");
  };

  const items = [
    {
      key: "browser" as const,
      name: "เปิดการแสดงบราวเซอร์",
      desc: "แสดงหน้าต่าง Chromium บราวเซอร์ขณะระบบกำลังโพสต์ เพื่อให้มองเห็นขั้นตอนการทำงานสด",
      icon: Monitor,
      checked: !config.hideScreen,
      onChange: (checked: boolean) => handleToggle("hideScreen", !checked),
    },
    {
      key: "autoRetry" as const,
      name: "ลองใหม่อัตโนมัติ",
      desc: "ลองดำเนินการใหม่อัตโนมัติเมื่อเกิดข้อผิดพลาดจากการโหลดหรือเครือข่าย",
      icon: RefreshCw,
      checked: config.autoRetry,
      onChange: (checked: boolean) => handleToggle("autoRetry", checked),
    },
    {
      key: "autoUpdate" as const,
      name: "อัปเดตอัตโนมัติ",
      desc: "ตรวจสอบและอัปเดตระบบอัตโนมัติเมื่อมีเวอร์ชันใหม่ออกมา",
      icon: CloudDownload,
      checked: config.autoUpdate,
      onChange: (checked: boolean) => handleToggle("autoUpdate", checked),
    },
    {
      key: "skipPending" as const,
      name: "ข้ามกลุ่มที่ติดอนุมัติอัตโนมัติ",
      desc: "ข้ามกลุ่มปลายทางที่โพสต์ก่อนหน้านี้ยังค้างอยู่ในสถานะรอแอดมินอนุมัติ",
      icon: SkipForward,
      checked: config.skipPending,
      onChange: (checked: boolean) => handleToggle("skipPending", checked),
    },
  ];

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950 p-5">
      <div className="border-b border-neutral-900 pb-4">
        <h3 className="text-base font-bold tracking-tight text-white">
          ตั้งค่าการทำงานขั้นสูง
        </h3>
        <p className="mt-0.5 text-xs text-neutral-400">
          ตั้งค่าการทำงานอัตโนมัติ การแสดงผลบราวเซอร์ และตัวเลือกพิเศษของระบบ
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="flex items-center justify-between gap-4 rounded-sm border border-neutral-800 bg-neutral-900/30 p-3.5"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900 text-blue-400">
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">{item.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-400">{item.desc}</p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={item.checked}
                onClick={() => item.onChange(!item.checked)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-sm border transition ${
                  item.checked
                    ? "border-blue-500/40 bg-blue-600"
                    : "border-neutral-700 bg-neutral-900"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-sm bg-white transition-transform ${
                    item.checked ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ControlAdvanceSettings;
