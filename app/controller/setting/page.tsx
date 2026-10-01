"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import DelayConfigSettingController from "@/components/controller/setting/delay";
import AdvanceConfigSettingController from "@/components/controller/setting/advance";
import { useControllerStore } from "@/store/controllerStore";

const ControllerSettingPage = () => {
  const { config } = useControllerStore();

  if (!config) {
    return (
      <FadeIn direction="up">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-8 text-center">
          <Settings2 className="mx-auto mb-3 text-neutral-600" size={28} />
          <p className="text-sm text-neutral-400">ยังไม่ได้รับค่าการตั้งค่าจากโปรแกรม</p>
          <p className="mt-1 text-xs text-neutral-600">
            เปิดโปรแกรม (Remote Sync ทำงานตลอด) แล้วค่าจะปรากฏที่นี่อัตโนมัติ
          </p>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
      <DelayConfigSettingController />
      <AdvanceConfigSettingController />
    </div>
  );
};

export default ControllerSettingPage;
