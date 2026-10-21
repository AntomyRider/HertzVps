"use client";

import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  ClipboardPaste,
  ArrowLeftRight,
  TimerReset,
  Link as LinkIcon,
  UsersRound,
  RotateCcw,
  Undo2,
} from "lucide-react";
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
  JSON.stringify([
    d.delay,
    d.delayBetweenLinks,
    d.delayBetweenGroups,
    d.nextRoundDelay,
    d.typingDelay,
    d.textMode,
  ]);

const isInvalid = (d: DelayDraft) =>
  d.delay.min > d.delay.max ||
  d.delayBetweenLinks.min > d.delayBetweenLinks.max ||
  d.delayBetweenGroups.min > d.delayBetweenGroups.max ||
  d.nextRoundDelay.min > d.nextRoundDelay.max ||
  d.typingDelay.min > d.typingDelay.max;

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

  const delayItems = [
    {
      key: "delay" as const,
      name: "เวลาการรอขั้นตอนถัดไป",
      desc: "ระยะเวลารอก่อนดำเนินการขั้นตอนถัดไปในแต่ละหน้า",
      icon: TimerReset,
      badgeStyle: "bg-sky-500/10 border-sky-500/25",
      iconColor: "text-sky-400",
      currentRange: draft.delay,
      unit: "วินาที",
    },
    {
      key: "delayBetweenLinks" as const,
      name: "ระยะเวลาเปลี่ยนลิ้งก์",
      desc: "ระยะเวลาหน่วงก่อนสลับไปยังลิงก์ปลายทางถัดไป",
      icon: LinkIcon,
      badgeStyle: "bg-blue-500/10 border-blue-500/25",
      iconColor: "text-blue-400",
      currentRange: draft.delayBetweenLinks,
      unit: "วินาที",
    },
    {
      key: "delayBetweenGroups" as const,
      name: "ระยะเวลาเปลี่ยนกลุ่ม",
      desc: "ระยะเวลาหน่วงก่อนสลับไปยังกลุ่มถัดไป",
      icon: UsersRound,
      badgeStyle: "bg-indigo-500/10 border-indigo-500/25",
      iconColor: "text-indigo-400",
      currentRange: draft.delayBetweenGroups,
      unit: "วินาที",
    },
    {
      key: "nextRoundDelay" as const,
      name: "ระยะเวลาเริ่มต้นรอบใหม่",
      badge: "สุ่ม",
      desc: "ระยะเวลาหน่วงก่อนเริ่มกระบวนการทำงานรอบถัดไป",
      icon: RotateCcw,
      badgeStyle: "bg-emerald-500/10 border-emerald-500/25",
      iconColor: "text-emerald-400",
      currentRange: draft.nextRoundDelay,
      unit: "วินาที",
    },
  ];

  return (
    <FadeIn direction="up">
      <div
        className="
          group relative
          overflow-clip
          rounded-2xl
          bg-neutral-900
          border border-white/[0.12]
          p-5
          shadow-[0_6px_0_rgba(0,0,0,0.45),0_12px_24px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.12),inset_0_-1px_2px_rgba(0,0,0,0.5)]
          transition-all
          duration-200
          ease-out
        "
      >
        {/* Top highlight (3D specular edge) */}
        <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white/20 z-10" />

        {/* Ambient soft glow */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/[0.04] blur-2xl transition-all duration-300 group-hover:bg-white/[0.07]" />

        {/* Main Content */}
        <div className="relative z-10">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="min-w-0">
              <h3 className="text-base  text-sky-400 tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)]">
                การตั้งค่าพื้นฐานเกี่ยวกับการทำงาน
              </h3>
              <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
                ตั้งค่าระยะเวลาหน่วงในการทำงานของระบบ — แก้แล้วบันทึกให้อัตโนมัติ
              </p>
            </div>

            {/* Reset Button */}
            <ButtonUI
              type="button"
              variant="secondary"
              onClick={handleReset}
              className="self-start sm:self-auto shrink-0 gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 border border-white/[0.12] bg-neutral-900/80 px-3 py-1.5 rounded-lg transition-all"
            >
              <Undo2 size={13} />
              <span>รีเซ็ตค่าเริ่มต้น</span>
            </ButtonUI>
          </div>

          {/* Delay Items List (3D Neu-tactile cards) */}
          <div className="mt-4 space-y-2.5">
            {/* Text Input Mode Card */}
            <div
              className="
                group/row relative
                overflow-hidden
                flex flex-col sm:flex-row sm:items-center justify-between gap-3
                rounded-xl
                border border-white/[0.08]
                bg-white/[0.02]
                hover:bg-white/[0.04]
                hover:border-white/[0.16]
                p-3.5
                shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
                transition-all
                duration-200
              "
            >
              {/* Micro specular highlight */}
              <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-white/10" />

              {/* Left Info with Icon */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  <div
                    className={`
                      flex h-10 w-10 items-center justify-center rounded-xl border
                      ${isTyping ? "bg-amber-500/10 border-amber-500/25" : "bg-blue-500/10 border-blue-500/25"}
                      shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]
                      transition-all duration-200
                    `}
                  >
                    {isTyping ? (
                      <Keyboard size={18} className="text-amber-400" strokeWidth={2} />
                    ) : (
                      <ClipboardPaste size={18} className="text-blue-400" strokeWidth={2} />
                    )}
                  </div>

                  {/* Corner Switch Button */}
                  <button
                    type="button"
                    onClick={() => patchDraft({ textMode: isTyping ? "paste" : "typing" })}
                    title={
                      isTyping
                        ? "คลิกเพื่อสลับเป็นโหมดวางทันที (Paste)"
                        : "คลิกเพื่อสลับเป็นโหมดพิมพ์ข้อความ (Typing)"
                    }
                    className="
                      cursor-pointer
                      absolute -bottom-1 -right-1
                      flex h-5 w-5 items-center justify-center
                      rounded-full border border-white/20
                      bg-neutral-800 text-neutral-300
                      hover:bg-neutral-700 hover:text-white hover:border-white/40
                      hover:scale-110 active:scale-95 transition-all
                      shadow-[0_2px_4px_rgba(0,0,0,0.5)]
                    "
                  >
                    <ArrowLeftRight size={10} />
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm  text-neutral-100 tracking-tight">
                      รูปแบบการใส่ข้อความ
                    </p>
                    <span
                      className={`
                        rounded-md px-1.5 py-0.5 text-[10px]  uppercase tracking-wider border
                        ${
                          isTyping
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/25"
                        }
                      `}
                    >
                      {isTyping ? "เขียนข้อความ" : "วางข้อความ"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-400 leading-relaxed">
                    {isTyping
                      ? "พิมพ์ข้อความทีละตัวอักษรเลียนแบบมนุษย์"
                      : "วางข้อความลงในกล่องโพสต์และคอมเมนต์ทันทีโดยไม่หน่วงเวลา (ความเร็วสูง)"}
                  </p>
                </div>
              </div>

              {/* Right Controls */}
              <div className="self-end sm:self-auto shrink-0">
                {isTyping ? (
                  <IuputMinMax
                    min={draft.typingDelay.min}
                    max={draft.typingDelay.max}
                    unit="ms"
                    onMinChange={(val) =>
                      patchDraft({ typingDelay: { ...draft.typingDelay, min: val } })
                    }
                    onMaxChange={(val) =>
                      patchDraft({ typingDelay: { ...draft.typingDelay, max: val } })
                    }
                  />
                ) : (
                  <div className="flex h-9 items-center rounded-xl border border-white/[0.08] bg-neutral-900/60 px-3.5 text-xs font-medium text-neutral-400">
                    วางข้อความทันที
                  </div>
                )}
              </div>
            </div>

            {/* Other Delay Items */}
            {delayItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="
                    group/row relative
                    overflow-hidden
                    flex flex-col sm:flex-row sm:items-center justify-between gap-3
                    rounded-xl
                    border border-white/[0.08]
                    bg-white/[0.02]
                    hover:bg-white/[0.04]
                    hover:border-white/[0.16]
                    p-3.5
                    shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
                    transition-all
                    duration-200
                  "
                >
                  {/* Micro specular highlight */}
                  <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-white/10" />

                  {/* Left Info with Icon */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`
                        flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border
                        ${item.badgeStyle}
                        shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]
                      `}
                    >
                      <Icon size={18} className={item.iconColor} strokeWidth={2} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm  text-neutral-100 tracking-tight">
                          {item.name}
                        </p>
                        {item.badge && (
                          <span className="rounded-md px-1.5 py-0.5 text-[10px]  uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/25">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-neutral-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Right Controls */}
                  <div className="self-end sm:self-auto shrink-0">
                    <IuputMinMax
                      min={item.currentRange.min}
                      max={item.currentRange.max}
                      unit={item.unit}
                      onMinChange={(val) =>
                        patchDraft({ [item.key]: { ...item.currentRange, min: val } })
                      }
                      onMaxChange={(val) =>
                        patchDraft({ [item.key]: { ...item.currentRange, max: val } })
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom bevel (3D depth) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    </FadeIn>
  );
}
