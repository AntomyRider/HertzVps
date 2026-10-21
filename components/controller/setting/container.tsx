"use client";

import { useState } from "react";
import {
  Settings2,
  SlidersHorizontal,
  Database,
  CircleFadingArrowUp,
  CircleHelp,
} from "lucide-react";
import DelayConfigSettingController from "./delay";
import AdvanceConfigSettingController from "./advance";
import DataSettingController from "./data";
import UpdateSettingController from "./update";
import HelpSettingController from "./help";
import FadeIn from "@/components/ui/fade-in";
import { useControllerStore } from "@/store/controllerStore";
import { cn } from "@/lib/utils";

export type SettingTab = "delay" | "advance" | "data" | "update" | "help";

interface TabItem {
  id: SettingTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

const TABS: TabItem[] = [
  { id: "delay", label: "ตั้งค่าพื้นฐาน", icon: Settings2 },
  { id: "advance", label: "ตั้งค่าขั้นสูง", icon: SlidersHorizontal },
  { id: "data", label: "ข้อมูล", icon: Database },
  { id: "update", label: "อัปเดต", icon: CircleFadingArrowUp },
  { id: "help", label: "ช่วยเหลือ", icon: CircleHelp },
];

export default function SettingControllerContainer() {
  const [activeTab, setActiveTab] = useState<SettingTab>("delay");
  const { config } = useControllerStore();

  return (
    <div className="space-y-4">
      {/* Top Simple Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900 p-1.5 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs transition-colors cursor-pointer select-none shrink-0",
                isActive
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
              )}
            >
              <Icon size={15} className={isActive ? "text-white" : "text-neutral-400"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "delay" && (
          config ? (
            <DelayConfigSettingController />
          ) : (
            <FadeIn direction="up">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center">
                <Settings2 className="mx-auto mb-3 text-neutral-600" size={28} />
                <p className="text-sm text-neutral-400">ยังไม่ได้รับค่าการตั้งค่าจากโปรแกรม</p>
                <p className="mt-1 text-xs text-neutral-600">
                  เปิดโปรแกรม (Remote Sync ทำงานตลอด) แล้วค่าจะปรากฏที่นี่อัตโนมัติ
                </p>
              </div>
            </FadeIn>
          )
        )}

        {activeTab === "advance" && (
          config ? (
            <AdvanceConfigSettingController />
          ) : (
            <FadeIn direction="up">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center">
                <SlidersHorizontal className="mx-auto mb-3 text-neutral-600" size={28} />
                <p className="text-sm text-neutral-400">ยังไม่ได้รับค่าการตั้งค่าจากโปรแกรม</p>
                <p className="mt-1 text-xs text-neutral-600">
                  เปิดโปรแกรม (Remote Sync ทำงานตลอด) แล้วค่าจะปรากฏที่นี่อัตโนมัติ
                </p>
              </div>
            </FadeIn>
          )
        )}

        {activeTab === "data" && <DataSettingController />}

        {activeTab === "update" && <UpdateSettingController />}

        {activeTab === "help" && <HelpSettingController />}
      </div>
    </div>
  );
}
