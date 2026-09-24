"use client";

import { Sliders, ShieldCheck, Database } from "lucide-react";
import { useControlStore } from "@/store/controlStore";
import ControlDelaySettings from "./delay";
import ControlAdvanceSettings from "./advance";
import ControlDataSettings from "./data";

export const ControlSettingsSection = () => {
  const { settingsTab, setSettingsTab } = useControlStore();

  const tabs = [
    {
      id: "delay" as const,
      label: "ตั้งค่าหน่วงเวลาและข้อความ",
      icon: Sliders,
    },
    {
      id: "advance" as const,
      label: "ตั้งค่าการทำงานขั้นสูง",
      icon: ShieldCheck,
    },
    {
      id: "data" as const,
      label: "ข้อมูลและรีเซ็ตสถิติ",
      icon: Database,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-sm border border-neutral-800 bg-neutral-950 p-1.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = settingsTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSettingsTab(t.id)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-sm px-3.5 py-2 text-xs font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <Icon size={14} strokeWidth={1.8} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Settings Section */}
      {settingsTab === "delay" && <ControlDelaySettings />}
      {settingsTab === "advance" && <ControlAdvanceSettings />}
      {settingsTab === "data" && <ControlDataSettings />}
    </div>
  );
};

export default ControlSettingsSection;
