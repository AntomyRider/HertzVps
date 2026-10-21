"use client";

import { useEffect, useRef, useState } from "react";
import {
  ScreenShare,
  Monitor,
  CloudDownload,
  SkipForward,
  Hash,
  Users,
  Bell,
  Send,
  Plus,
  Minus,
} from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import Toggle from "@/components/ui/toggle";
import { useToast } from "@/components/ui/toast";
import { useControllerStore } from "@/store/controllerStore";

interface AdvanceDraft {
  screenShareEnabled: boolean;
  hideScreen: boolean;
  autoUpdate: boolean;
  skipPending: boolean;
  randomKeyword: boolean;
  autoStartAcc: {
    enabled: boolean;
    limit: number;
  };
  webhook: {
    enabled: boolean;
    url: string;
  };
}

const asBool = (value: unknown, fallback: boolean): boolean =>
  typeof value === "boolean" ? value : fallback;

const fromConfig = (cfg: Record<string, unknown>): AdvanceDraft => ({
  screenShareEnabled: asBool(cfg.screenShareEnabled, true),
  hideScreen: asBool(cfg.hideScreen, false),
  autoUpdate: asBool(cfg.autoUpdate, true),
  skipPending: asBool(cfg.skipPending, true),
  randomKeyword: asBool(cfg.randomKeyword, false),
  autoStartAcc: {
    enabled: asBool(
      (cfg.autoStartAcc as { enabled?: boolean } | undefined)?.enabled,
      false
    ),
    limit: Math.max(
      1,
      Math.min(
        100,
        Math.floor(
          Number((cfg.autoStartAcc as { limit?: number } | undefined)?.limit)
        ) || 1
      )
    ),
  },
  webhook: {
    enabled: asBool(
      (cfg.webhook as { enabled?: boolean } | undefined)?.enabled,
      false
    ),
    url:
      typeof (cfg.webhook as { url?: string } | undefined)?.url === "string"
        ? ((cfg.webhook as { url?: string }).url as string)
        : "",
  },
});

const signatureOf = (d: AdvanceDraft) =>
  JSON.stringify([
    d.screenShareEnabled,
    d.hideScreen,
    d.autoUpdate,
    d.skipPending,
    d.randomKeyword,
    d.autoStartAcc,
    d.webhook,
  ]);

export default function AdvanceConfigSettingController() {
  const { config, updateAppConfig } = useControllerStore();
  const toast = useToast();

  const [draft, setDraft] = useState<AdvanceDraft | null>(null);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const draftRef = useRef<AdvanceDraft | null>(null);
  draftRef.current = draft;
  const lastConfigRef = useRef("");
  const sentRef = useRef("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!config) return;
    const signature = JSON.stringify([
      config.screenShareEnabled,
      config.hideScreen,
      config.autoUpdate,
      config.skipPending,
      config.randomKeyword,
      config.autoStartAcc,
      config.webhook,
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

  const scheduleSave = (next: AdvanceDraft, delayMs = 500) => {
    setDraft(next);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const target = draftRef.current;
      if (!target) return;
      const error = await updateAppConfig(target as unknown as Record<string, unknown>);
      if (error) {
        toast.error("ส่งคำสั่งไม่สำเร็จ", error);
        return;
      }
      sentRef.current = signatureOf(target);
      toast.success("บันทึกแล้ว", "โปรแกรมจะนำค่าไปใช้และยืนยันกลับมาอัตโนมัติ");
    }, delayMs);
  };

  const patchDraft = (patch: Partial<AdvanceDraft>, delayMs = 500) => {
    if (!draft) return;
    scheduleSave({ ...draft, ...patch }, delayMs);
  };

  const handleAutoStartAccLimitChange = (delta: number) => {
    if (!draft) return;
    const current = draft.autoStartAcc.limit;
    const nextLimit = Math.max(1, Math.min(100, current + delta));
    patchDraft({ autoStartAcc: { ...draft.autoStartAcc, limit: nextLimit } }, 300);
  };

  const handleTestWebhook = async () => {
    const url = draft?.webhook.url?.trim();
    if (!url) {
      toast.error("กรุณาระบุ URL", "โปรดกรอก Discord Webhook URL ก่อนทดสอบ");
      return;
    }
    setIsTestingWebhook(true);
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          content: "🔔 **Hertz Web Controller**\nทดสอบการเชื่อมต่อ Discord Webhook สำเร็จ!",
        }),
      });
      toast.success("ส่งข้อความทดสอบแล้ว", "กรุณาตรวจสอบในช่อง Discord ของคุณ");
    } catch {
      toast.error("ส่งไม่สำเร็จ", "ไม่สามารถส่งข้อความไปยัง Webhook URL นี้ได้");
    } finally {
      setIsTestingWebhook(false);
    }
  };

  if (!config || !draft) return null;

  const toggleItems = [
    {
      key: "screenShareEnabled" as const,
      name: "อนุญาตให้แชร์หน้าจอ",
      desc: "อนุญาตให้สตรีมหน้าจอเครื่องนี้ไปยังเซิร์ฟเวอร์เพื่อมอนิเตอร์ระยะไกล",
      icon: ScreenShare,
      badgeStyle: "bg-rose-500/10 border-rose-500/25",
      iconColor: "text-rose-400",
      checked: draft.screenShareEnabled,
    },
    {
      key: "hideScreen" as const,
      name: "ซ่อนหน้าต่างเบราว์เซอร์",
      desc: "ซ่อนหน้าต่างขณะระบบกำลังโพสต์",
      icon: Monitor,
      badgeStyle: "bg-cyan-500/10 border-cyan-500/25",
      iconColor: "text-cyan-400",
      checked: draft.hideScreen,
    },
    {
      key: "autoUpdate" as const,
      name: "อัปเดตอัตโนมัติ",
      desc: "ตรวจสอบและอัปเดตระบบอัตโนมัติเมื่อมีเวอร์ชันใหม่ออกมา",
      icon: CloudDownload,
      badgeStyle: "bg-purple-500/10 border-purple-500/25",
      iconColor: "text-purple-400",
      checked: draft.autoUpdate,
    },
    {
      key: "skipPending" as const,
      name: "ข้ามกลุ่มที่ติดอนุมัติอัตโนมัติ",
      desc: "ข้ามกลุ่มปลายทางที่โพสต์ก่อนหน้านี้ยังค้างอยู่ในสถานะรอแอดมินอนุมัติ",
      icon: SkipForward,
      badgeStyle: "bg-emerald-500/10 border-emerald-500/25",
      iconColor: "text-emerald-400",
      checked: draft.skipPending,
    },
    {
      key: "randomKeyword" as const,
      name: "สุ่มคีย์เวิร์ดต่อท้ายโพสต์",
      desc: "สุ่มข้อความภาษาอังกฤษช่วยแพทเทิร์นในการโพสต์ไม่เหมือนเดิม",
      icon: Hash,
      badgeStyle: "bg-amber-500/10 border-amber-500/25",
      iconColor: "text-amber-400",
      checked: draft.randomKeyword,
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

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="pb-4 border-b border-white/[0.08]">
            <h3 className="text-base  text-sky-400 tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)]">
              ตั้งค่าการทำงานขั้นสูง
            </h3>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              ตั้งค่าการทำงานอัตโนมัติ การแสดงผลบราวเซอร์ และตัวเลือกพิเศษของระบบ
            </p>
          </div>

          {/* Toggle List Items (3D Neu-tactile micro-cards) */}
          <div className="mt-4 space-y-2.5">
            {toggleItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="
                    group/item relative
                    overflow-hidden
                    flex items-center justify-between gap-3
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
                      <p className="text-sm  text-neutral-100 tracking-tight">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Right Toggle */}
                  <div className="shrink-0 ml-4">
                    <Toggle
                      checked={item.checked}
                      onCheckedChange={(checked) =>
                        patchDraft({ [item.key]: checked }, 0)
                      }
                    />
                  </div>
                </div>
              );
            })}

            {/* จำกัดบัญชีทำงานพร้อมกัน (Auto Start Account Queue) */}
            <div
              className="
                group/item relative
                overflow-hidden
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
              <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-white/10" />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="
                      flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border
                      bg-blue-500/10 border-blue-500/25
                      shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]
                    "
                  >
                    <Users size={18} className="text-blue-400" strokeWidth={2} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm  text-neutral-100 tracking-tight">
                        จำกัดบัญชีทำงานพร้อมกัน
                      </p>
                      {draft.autoStartAcc.enabled && (
                        <span className="rounded-md px-1.5 py-0.5 text-[10px]  tracking-wider border bg-blue-500/10 text-blue-400 border-blue-500/25">
                          สูงสุด {draft.autoStartAcc.limit} บัญชี
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-400 leading-relaxed">
                      จำกัดจำนวนบัญชีที่รันพร้อมกันเมื่อกดเริ่มทั้งหมด บัญชีที่เหลือจะเข้าคิวรอ และเริ่มทันทีเมื่อมีบัญชีทำเสร็จ
                    </p>
                  </div>
                </div>

                <div className="shrink-0 ml-4">
                  <Toggle
                    checked={draft.autoStartAcc.enabled}
                    onCheckedChange={(checked) =>
                      patchDraft(
                        {
                          autoStartAcc: {
                            ...draft.autoStartAcc,
                            enabled: checked,
                          },
                        },
                        0
                      )
                    }
                  />
                </div>
              </div>

              {/* Stepper ปรับจำนวนบัญชี — กางลงมาเมื่อเปิด toggle */}
              <div
                className={`
                  grid transition-all duration-300 ease-out
                  ${
                    draft.autoStartAcc.enabled
                      ? "grid-rows-[1fr] opacity-100 mt-3 pt-3 border-t border-white/[0.06]"
                      : "grid-rows-[0fr] opacity-0"
                  }
                `}
                aria-hidden={!draft.autoStartAcc.enabled}
              >
                <div className="overflow-hidden">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-neutral-300">
                      จำนวนบัญชีที่ให้ทำงานพร้อมกันต่อรอบ:
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAutoStartAccLimitChange(-1)}
                        disabled={draft.autoStartAcc.limit <= 1}
                        className="
                          flex h-7 w-7 items-center justify-center rounded-lg
                          border border-white/[0.12] bg-white/[0.04] text-neutral-300
                          hover:bg-white/[0.08] hover:text-white active:scale-95
                          disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer
                        "
                      >
                        <Minus size={13} strokeWidth={2.5} />
                      </button>

                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={draft.autoStartAcc.limit}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) {
                            patchDraft(
                              {
                                autoStartAcc: {
                                  ...draft.autoStartAcc,
                                  limit: Math.max(1, Math.min(100, val)),
                                },
                              },
                              300
                            );
                          }
                        }}
                        className="
                          h-7 w-12 text-center font-mono text-sm font-bold text-blue-400
                          rounded-lg border border-white/[0.12] bg-neutral-900/80
                          focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30
                          transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                        "
                      />

                      <button
                        type="button"
                        onClick={() => handleAutoStartAccLimitChange(1)}
                        disabled={draft.autoStartAcc.limit >= 100}
                        className="
                          flex h-7 w-7 items-center justify-center rounded-lg
                          border border-white/[0.12] bg-white/[0.04] text-neutral-300
                          hover:bg-white/[0.08] hover:text-white active:scale-95
                          disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer
                        "
                      >
                        <Plus size={13} strokeWidth={2.5} />
                      </button>
                      <span className="text-xs text-neutral-400 ml-1">บัญชี</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Webhook Notification */}
            <div
              className="
                group/item relative
                overflow-hidden
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
              <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-white/10" />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="
                      flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border
                      bg-emerald-500/10 border-emerald-500/25
                      shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]
                    "
                  >
                    <Bell size={18} className="text-emerald-400" strokeWidth={2} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm  text-neutral-100 tracking-tight">
                      แจ้งเตือนผ่าน Webhook
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-400 leading-relaxed">
                      ส่งสรุปผลรอบโพสต์และเหตุขัดข้องไปยัง Discord Webhook (บันทึกอัตโนมัติ)
                    </p>
                  </div>
                </div>

                <div className="shrink-0 ml-4">
                  <Toggle
                    checked={draft.webhook.enabled}
                    onCheckedChange={(checked) =>
                      patchDraft(
                        {
                          webhook: {
                            ...draft.webhook,
                            enabled: checked,
                          },
                        },
                        0
                      )
                    }
                  />
                </div>
              </div>

              {/* ช่องกรอก URL — กางลงมาเมื่อเปิด toggle */}
              <div
                className={`
                  grid transition-all duration-300 ease-out
                  ${
                    draft.webhook.enabled
                      ? "grid-rows-[1fr] opacity-100 mt-3"
                      : "grid-rows-[0fr] opacity-0"
                  }
                `}
                aria-hidden={!draft.webhook.enabled}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="url"
                      value={draft.webhook.url}
                      onChange={(e) =>
                        patchDraft(
                          {
                            webhook: {
                              ...draft.webhook,
                              url: e.target.value,
                            },
                          },
                          800
                        )
                      }
                      placeholder="https://discord.com/api/webhooks/..."
                      spellCheck={false}
                      tabIndex={draft.webhook.enabled ? 0 : -1}
                      className="
                        min-w-0 flex-1
                        rounded-lg border border-white/[0.12] bg-neutral-900
                        px-3 py-2 text-xs text-neutral-100
                        placeholder:text-neutral-500
                        focus:border-sky-500/50 focus:outline-none
                        transition-colors
                      "
                    />
                    <button
                      type="button"
                      onClick={() => void handleTestWebhook()}
                      disabled={isTestingWebhook || !draft.webhook.url.trim()}
                      tabIndex={draft.webhook.enabled ? 0 : -1}
                      className="
                        flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04]
                        px-3 py-2 text-xs font-medium text-neutral-200
                        hover:bg-white/[0.08] active:scale-95
                        disabled:opacity-40 disabled:cursor-not-allowed
                        transition-all cursor-pointer
                      "
                    >
                      <Send size={13} strokeWidth={2} />
                      {isTestingWebhook ? "กำลังส่ง..." : "ทดสอบ"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bevel (3D depth) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    </FadeIn>
  );
}
