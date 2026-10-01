"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Monitor,
  SkipForward,
  SlidersHorizontal,
  CloudDownload,
  Webhook,
  Bell,
  Link2,
} from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import Toggle from "@/components/ui/toggle";
import { useToast } from "@/components/ui/toast";
import { useControllerStore } from "@/store/controllerStore";

interface AdvanceDraft {
  skipPending: boolean;
  hideScreen: boolean;
  autoUpdate: boolean;
  webhook: { enabled: boolean; url: string };
}

const asBool = (value: unknown, fallback: boolean): boolean =>
  typeof value === "boolean" ? value : fallback;

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-md border border-neutral-800 bg-neutral-950">
      <div className="flex items-center gap-3 border-b border-neutral-800 bg-neutral-900/40 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-400">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-neutral-100">{title}</p>
          <p className="text-xs text-neutral-500">{description}</p>
        </div>
      </div>
      <div className="divide-y divide-neutral-800/60">{children}</div>
    </section>
  );
}

function Row({
  label,
  hint,
  icon,
  stack = false,
  children,
}: {
  label: string;
  hint?: string;
  icon?: ReactNode;
  /** stack = บังคับ label เหนือ control ทุกขนาดจอ (ใช้กับ input กว้าง) */
  stack?: boolean;
  children: ReactNode;
}) {
  if (stack) {
    return (
      <div className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <div className="mt-0.5 hidden h-7 w-7 shrink-0 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-400 sm:flex">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm text-neutral-200">{label}</p>
            {hint && <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>}
          </div>
        </div>
        <div className="w-full max-w-xs sm:w-72">{children}</div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <div className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-400 sm:flex">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm text-neutral-200">{label}</p>
          {hint && <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

const fromConfig = (cfg: Record<string, unknown>): AdvanceDraft => ({
  skipPending: asBool(cfg.skipPending, false),
  hideScreen: asBool(cfg.hideScreen, false),
  autoUpdate: asBool(cfg.autoUpdate, true),
  webhook: {
    enabled: asBool((cfg.webhook as { enabled?: boolean } | undefined)?.enabled, false),
    url:
      typeof (cfg.webhook as { url?: string } | undefined)?.url === "string"
        ? ((cfg.webhook as { url?: string }).url as string)
        : "",
  },
});

const signatureOf = (d: AdvanceDraft) =>
  JSON.stringify([d.skipPending, d.hideScreen, d.autoUpdate, d.webhook]);

export default function AdvanceConfigSettingController() {
  const { config, updateAppConfig } = useControllerStore();
  const toast = useToast();

  const [draft, setDraft] = useState<AdvanceDraft | null>(null);

  const draftRef = useRef<AdvanceDraft | null>(null);
  draftRef.current = draft;
  const lastConfigRef = useRef("");
  const sentRef = useRef("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!config) return;
    const signature = JSON.stringify([
      config.skipPending,
      config.hideScreen,
      config.autoUpdate,
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

  if (!config || !draft) return null;

  return (
    <FadeIn direction="up">
      <Section
        icon={<SlidersHorizontal size={15} />}
        title="ตั้งค่าขั้นสูง"
        description="แก้แล้วบันทึกให้เอง"
      >
        <Row
          label="ซ่อนหน้าต่างเบราว์เซอร์"
          hint="ซ่อนหน้าต่าง Chromium ขณะระบบกำลังโพสต์ (ตรงกับหน้าตั้งค่าบนเว็บ)"
          icon={<Monitor size={13} />}
        >
          <div className="flex justify-end">
            <Toggle
              checked={draft.hideScreen}
              onCheckedChange={(v) => patchDraft({ hideScreen: v }, 0)}
            />
          </div>
        </Row>
        <Row
          label="อัปเดตอัตโนมัติ"
          hint="ตรวจสอบและอัปเดตระบบอัตโนมัติเมื่อมีเวอร์ชันใหม่ออกมา"
          icon={<CloudDownload size={13} />}
        >
          <div className="flex justify-end">
            <Toggle
              checked={draft.autoUpdate}
              onCheckedChange={(v) => patchDraft({ autoUpdate: v }, 0)}
            />
          </div>
        </Row>
        <Row
          label="ข้ามกลุ่มที่ติดอนุมัติอัตโนมัติ"
          hint="ข้ามกลุ่มปลายทางที่โพสต์ก่อนหน้านี้ยังค้างอยู่ในสถานะรอแอดมินอนุมัติ"
          icon={<SkipForward size={13} />}
        >
          <div className="flex justify-end">
            <Toggle
              checked={draft.skipPending}
              onCheckedChange={(v) => patchDraft({ skipPending: v }, 0)}
            />
          </div>
        </Row>
        <Row
          label="แจ้งเตือนผ่าน Webhook"
          hint="ส่งสรุปผลรอบโพสต์และเหตุขัดข้องไปยัง Discord Webhook (บันทึกอัตโนมัติ)"
          icon={<Bell size={13} />}
        >
          <div className="flex justify-end">
            <Toggle
              checked={draft.webhook.enabled}
              onCheckedChange={(v) =>
                patchDraft({ webhook: { ...draft.webhook, enabled: v } }, 0)
              }
            />
          </div>
        </Row>
        <Row
          stack
          label="URL ปลายทาง"
          hint="บันทึกเมื่อหยุดพิมพ์"
          icon={<Link2 size={13} />}
        >
          <input
            type="url"
            value={draft.webhook.url}
            onChange={(e) =>
              patchDraft({ webhook: { ...draft.webhook, url: e.target.value } }, 800)
            }
            placeholder="https://discord.com/api/webhooks/..."
            spellCheck={false}
            className={`w-full rounded-md border bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 outline-none transition ${
              draft.webhook.enabled
                ? "border-neutral-700 focus:border-blue-500/50"
                : "border-neutral-800/60 opacity-50"
            }`}
            tabIndex={draft.webhook.enabled ? 0 : -1}
          />
        </Row>
      </Section>
    </FadeIn>
  );
}
