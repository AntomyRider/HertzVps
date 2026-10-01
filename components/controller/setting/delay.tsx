"use client";

import { useEffect, useRef, useState } from "react";
import { Keyboard, Link2, RefreshCw, RotateCcw, Users } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import ButtonUI from "@/components/ui/button";
import IuputMinMax from "@/components/ui/input-min-max";
import { useToast } from "@/components/ui/toast";
import { useControllerStore } from "@/store/controllerStore";

interface RangeValue {
  min: number;
  max: number;
}

interface DelayDraft {
  delay: RangeValue;
  delayBetweenLinks: RangeValue;
  delayBetweenGroups: RangeValue;
  nextRoundDelay: RangeValue;
  typingDelay: RangeValue;
  textMode: string;
}

const DEFAULTS: DelayDraft = {
  delay: { min: 3, max: 10 },
  delayBetweenLinks: { min: 5, max: 15 },
  delayBetweenGroups: { min: 15, max: 50 },
  nextRoundDelay: { min: 10800, max: 21600 },
  typingDelay: { min: 20, max: 60 },
  textMode: "paste",
};

const asRange = (value: unknown, fallback: RangeValue): RangeValue => {
  if (
    value &&
    typeof value === "object" &&
    typeof (value as RangeValue).min === "number" &&
    typeof (value as RangeValue).max === "number"
  ) {
    return { min: (value as RangeValue).min, max: (value as RangeValue).max };
  }
  return fallback;
};

const fromConfig = (cfg: Record<string, unknown>): DelayDraft => ({
  delay: asRange(cfg.delay, DEFAULTS.delay),
  delayBetweenLinks: asRange(cfg.delayBetweenLinks, DEFAULTS.delayBetweenLinks),
  delayBetweenGroups: asRange(cfg.delayBetweenGroups, DEFAULTS.delayBetweenGroups),
  nextRoundDelay: asRange(cfg.nextRoundDelay, DEFAULTS.nextRoundDelay),
  typingDelay: asRange(cfg.typingDelay, DEFAULTS.typingDelay),
  textMode: cfg.textMode === "typing" ? "typing" : "paste",
});

const signatureOf = (d: DelayDraft) =>
  JSON.stringify([d.delay, d.delayBetweenLinks, d.delayBetweenGroups, d.nextRoundDelay, d.typingDelay, d.textMode]);

const isInvalid = (d: DelayDraft) =>
  d.delay.min > d.delay.max ||
  d.delayBetweenLinks.min > d.delayBetweenLinks.max ||
  d.delayBetweenGroups.min > d.delayBetweenGroups.max ||
  d.nextRoundDelay.min > d.nextRoundDelay.max ||
  d.typingDelay.min > d.typingDelay.max;

/** การ์ดแถวเดียว: icon chip สี + title + desc (+ badge สลับโหมดได้) + control ขวา */
function RowCard({
  icon,
  iconClass,
  title,
  description,
  badge,
  children,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  description: string;
  badge?: { text: string; onClick: () => void };
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-neutral-800 bg-neutral-950 px-4 py-3.5">
      <div className="flex min-w-0 items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconClass}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-neutral-100">{title}</p>
            {badge && (
              <button
                type="button"
                onClick={badge.onClick}
                title="คลิกเพื่อสลับโหมด"
                className="cursor-pointer rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 transition hover:bg-amber-500/20"
              >
                {badge.text}
              </button>
            )}
          </div>
          <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function DelayConfigSettingController() {
  const { config, updateAppConfig } = useControllerStore();
  const toast = useToast();

  const [draft, setDraft] = useState<DelayDraft | null>(null);

  const draftRef = useRef<DelayDraft | null>(null);
  draftRef.current = draft;
  const lastConfigRef = useRef("");
  const sentRef = useRef("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ซิงค์ค่าจากโปรแกรม — ข้ามถ้าค่าที่มาใหม่คือสิ่งที่เราเพิ่งส่ง หรือกำลังพิมพ์ค้างไว้
  useEffect(() => {
    if (!config) return;
    const signature = JSON.stringify([
      config.delay,
      config.delayBetweenLinks,
      config.delayBetweenGroups,
      config.nextRoundDelay,
      config.typingDelay,
      config.textMode,
    ]);
    if (signature === lastConfigRef.current || signature === sentRef.current) return;
    lastConfigRef.current = signature;
    if (!saveTimerRef.current) setDraft(fromConfig(config));
  }, [config]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const scheduleSave = (next: DelayDraft) => {
    setDraft(next);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const target = draftRef.current;
      if (!target) return;
      if (isInvalid(target)) {
        toast.error("บันทึกไม่ได้", "ค่า min ต้องน้อยกว่าหรือเท่ากับ max ทุกช่วง");
        return;
      }
      const error = await updateAppConfig(target as unknown as Record<string, unknown>);
      if (error) {
        toast.error("ส่งคำสั่งไม่สำเร็จ", error);
        return;
      }
      sentRef.current = signatureOf(target);
      toast.success("บันทึกแล้ว", "โปรแกรมจะนำค่าไปใช้และยืนยันกลับมาอัตโนมัติ");
    }, 800);
  };

  const patchDraft = (patch: Partial<DelayDraft>) => {
    if (!draft) return;
    scheduleSave({ ...draft, ...patch });
  };

  const handleReset = () => {
    scheduleSave({ ...DEFAULTS });
    toast.success("รีเซ็ตค่าเริ่มต้น", "ส่งค่าเริ่มต้นให้โปรแกรมแล้ว");
  };

  if (!config || !draft) return null;

  const isTyping = draft.textMode === "typing";

  return (
    <FadeIn direction="up" className="space-y-3">
      {/* หัวเรื่อง + รีเซ็ต */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-sky-400">การตั้งค่าพื้นฐานสำหรับการทำงาน</p>
          <p className="text-xs text-neutral-500">ตั้งค่าระยะเวลาหน่วงในการทำงานของระบบ — แก้แล้วบันทึกให้เอง</p>
        </div>
        <ButtonUI
          type="button"
          onClick={handleReset}
          className="shrink-0 cursor-pointer border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-300 hover:text-neutral-100"
        >
          <RefreshCw size={13} className="mr-1 inline" />
          รีเซ็ตค่าเริ่มต้น
        </ButtonUI>
      </div>

      <RowCard
        icon={<Keyboard size={18} />}
        iconClass="border-amber-500/20 bg-amber-500/10 text-amber-400"
        title="รูปแบบการใส่ข้อความ"
        description="พิมพ์ข้อความทีละตัวอักษรเลียนแบบมนุษย์ (Typing Delay)"
        badge={{ text: isTyping ? "เขียนข้อความ" : "วางข้อความ", onClick: () => patchDraft({ textMode: isTyping ? "paste" : "typing" }) }}
      >
        <IuputMinMax
          min={draft.typingDelay.min}
          max={draft.typingDelay.max}
          unit="ms"
          onMinChange={(v) => patchDraft({ typingDelay: { ...draft.typingDelay, min: v } })}
          onMaxChange={(v) => patchDraft({ typingDelay: { ...draft.typingDelay, max: v } })}
        />
      </RowCard>

      <RowCard
        icon={<RefreshCw size={18} />}
        iconClass="border-sky-500/20 bg-sky-500/10 text-sky-400"
        title="เวลาการรอขั้นตอนถัดไป"
        description="ระยะเวลารอก่อนดำเนินการขั้นตอนถัดไปในแต่ละหน้า (Step Delay)"
      >
        <IuputMinMax
          min={draft.delay.min}
          max={draft.delay.max}
          unit="วินาที"
          onMinChange={(v) => patchDraft({ delay: { ...draft.delay, min: v } })}
          onMaxChange={(v) => patchDraft({ delay: { ...draft.delay, max: v } })}
        />
      </RowCard>

      <RowCard
        icon={<Link2 size={18} />}
        iconClass="border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
        title="ระยะเวลาเปลี่ยนลิ้งก์"
        description="ระยะเวลาหน่วงก่อนสลับไปยังลิงก์ปลายทางถัดไป (Link Delay)"
      >
        <IuputMinMax
          min={draft.delayBetweenLinks.min}
          max={draft.delayBetweenLinks.max}
          unit="วินาที"
          onMinChange={(v) =>
            patchDraft({ delayBetweenLinks: { ...draft.delayBetweenLinks, min: v } })
          }
          onMaxChange={(v) =>
            patchDraft({ delayBetweenLinks: { ...draft.delayBetweenLinks, max: v } })
          }
        />
      </RowCard>

      <RowCard
        icon={<Users size={18} />}
        iconClass="border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
        title="ระยะเวลาเปลี่ยนกลุ่ม"
        description="ระยะเวลาหน่วงก่อนสลับไปยังกลุ่มถัดไป (Group Delay)"
      >
        <IuputMinMax
          min={draft.delayBetweenGroups.min}
          max={draft.delayBetweenGroups.max}
          unit="วินาที"
          onMinChange={(v) =>
            patchDraft({ delayBetweenGroups: { ...draft.delayBetweenGroups, min: v } })
          }
          onMaxChange={(v) =>
            patchDraft({ delayBetweenGroups: { ...draft.delayBetweenGroups, max: v } })
          }
        />
      </RowCard>

      <RowCard
        icon={<RotateCcw size={18} />}
        iconClass="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
        title="ระยะเวลาเริ่มต้นรอบใหม่"
        description="ระยะเวลาหน่วงก่อนเริ่มกระบวนการทำงานรอบถัดไป (Round Delay)"
      >
        <IuputMinMax
          min={draft.nextRoundDelay.min}
          max={draft.nextRoundDelay.max}
          unit="วินาที"
          onMinChange={(v) =>
            patchDraft({ nextRoundDelay: { ...draft.nextRoundDelay, min: v } })
          }
          onMaxChange={(v) =>
            patchDraft({ nextRoundDelay: { ...draft.nextRoundDelay, max: v } })
          }
        />
      </RowCard>
    </FadeIn>
  );
}
