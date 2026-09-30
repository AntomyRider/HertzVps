"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Save, Settings2, TriangleAlert, Webhook } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import ButtonUI from "@/components/ui/button";
import Toggle from "@/components/ui/toggle";
import IuputMinMax from "@/components/ui/input-min-max";
import { useControllerStore } from "@/store/controllerStore";

interface RangeValue {
  min: number;
  max: number;
}

interface AppConfigDraft {
  delay: RangeValue;
  delayBetweenLinks: RangeValue;
  delayBetweenGroups: RangeValue;
  nextRoundDelay: RangeValue;
  typingDelay: RangeValue;
  textMode: string;
  skipPending: boolean;
  hideScreen: boolean;
  autoUpdate: boolean;
  webhook: { enabled: boolean; url: string };
}

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

const asBool = (value: unknown, fallback: boolean): boolean =>
  typeof value === "boolean" ? value : fallback;

const normalizeConfig = (raw: Record<string, unknown>): AppConfigDraft => ({
  delay: asRange(raw.delay, { min: 3, max: 10 }),
  delayBetweenLinks: asRange(raw.delayBetweenLinks, { min: 5, max: 15 }),
  delayBetweenGroups: asRange(raw.delayBetweenGroups, { min: 15, max: 50 }),
  nextRoundDelay: asRange(raw.nextRoundDelay, { min: 10800, max: 21600 }),
  typingDelay: asRange(raw.typingDelay, { min: 20, max: 60 }),
  textMode: raw.textMode === "paste" ? "paste" : "typing",
  skipPending: asBool(raw.skipPending, false),
  hideScreen: asBool(raw.hideScreen, false),
  autoUpdate: asBool(raw.autoUpdate, true),
  webhook: {
    enabled: asBool((raw.webhook as { enabled?: boolean } | undefined)?.enabled, false),
    url:
      typeof (raw.webhook as { url?: string } | undefined)?.url === "string"
        ? ((raw.webhook as { url?: string }).url as string)
        : "",
  },
});

function ConfigCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-200">
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-neutral-400">{label}</span>
      <div className="sm:w-64">{children}</div>
    </div>
  );
}

export default function AppConfigSettingController() {
  const { config, isSavingConfig, isProgramOnline, updateAppConfig } =
    useControllerStore();

  const [draft, setDraft] = useState<AppConfigDraft | null>(null);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(
    null
  );
  const lastConfigRef = useRef("");

  // ซิงค์ draft จากค่าจริงในโปรแกรม — ถ้าผู้ใช้ยังไม่ได้แก้อะไร
  useEffect(() => {
    if (!config) return;
    const signature = JSON.stringify(config);
    if (signature === lastConfigRef.current) return;
    lastConfigRef.current = signature;
    if (!dirty) {
      setDraft(normalizeConfig(config));
    }
  }, [config, dirty]);

  const patchDraft = (patch: Partial<AppConfigDraft>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!draft) return;
    const ranges: Array<[string, RangeValue]> = [
      ["delay", draft.delay],
      ["delayBetweenLinks", draft.delayBetweenLinks],
      ["delayBetweenGroups", draft.delayBetweenGroups],
      ["nextRoundDelay", draft.nextRoundDelay],
      ["typingDelay", draft.typingDelay],
    ];
    const invalid = ranges.find(([, r]) => r.min > r.max);
    if (invalid) {
      setMessage({ type: "error", text: "ค่า min ต้องน้อยกว่าหรือเท่ากับ max ทุกช่วง" });
      return;
    }

    setMessage(null);
    const error = await updateAppConfig(draft as unknown as Record<string, unknown>);
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }
    setDirty(false);
    setMessage({
      type: "ok",
      text: isProgramOnline
        ? "ส่งคำสั่งแล้ว — โปรแกรมจะนำไปใช้และยืนยันค่ากลับมาในไม่กี่วินาที"
        : "ส่งคำสั่งแล้ว — โปรแกรมออฟไลน์อยู่ คำสั่งจะถูกส่งเมื่อกลับมาออนไลน์",
    });
  };

  const hasConfig = useMemo(() => Boolean(config), [config]);

  if (!hasConfig || !draft) {
    return (
      <FadeIn direction="up">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-8 text-center">
          <Settings2 className="mx-auto mb-3 text-neutral-600" size={28} />
          <p className="text-sm text-neutral-400">
            ยังไม่ได้รับค่าการตั้งค่าจากโปรแกรม
          </p>
          <p className="mt-1 text-xs text-neutral-600">
            เปิดโปรแกรม + เปิด Remote Sync ในแอป แล้วค่าจะปรากฏที่นี่อัตโนมัติ
          </p>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn direction="up" className="space-y-4">
      {/* สถานะการเชื่อมต่อโปรแกรม */}
      {!isProgramOnline && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          <TriangleAlert size={14} />
          <span>โปรแกรมออฟไลน์อยู่ — คำสั่งจะถูกส่งเมื่อกลับมาออนไลน์</span>
        </div>
      )}

      {/* Delay ระหว่างโพสต์ */}
      <ConfigCard title="ดีเลย์ระหว่างโพสต์ (วินาที)" icon={<Settings2 size={15} />}>
        <Row label="หน่วงหลังโพสต์แต่ละครั้ง">
          <IuputMinMax
            min={draft.delay.min}
            max={draft.delay.max}
            unit="วินาที"
            onMinChange={(v) => patchDraft({ delay: { ...draft.delay, min: v } })}
            onMaxChange={(v) => patchDraft({ delay: { ...draft.delay, max: v } })}
          />
        </Row>
        <Row label="หน่วงระหว่างลิงก์ในกลุ่มเดียวกัน">
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
        </Row>
        <Row label="หน่วงระหว่างย้ายกลุ่ม">
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
        </Row>
        <Row label="รอบถัดไป (เริ่มรอบใหม่หลังจบทุกกลุ่ม)">
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
        </Row>
      </ConfigCard>

      {/* พฤติกรรมการพิมพ์ */}
      <ConfigCard title="พฤติกรรมการพิมพ์ข้อความ">
        <Row label="โหมดพิมพ์ข้อความ (typing = พิมพ์ทีละตัว, paste = วางทันที)">
          <div className="flex gap-2">
            <ButtonUI
              type="button"
              onClick={() => patchDraft({ textMode: "typing" })}
              className={`cursor-pointer px-3 py-1.5 text-xs ${
                draft.textMode === "typing"
                  ? ""
                  : "border border-neutral-800 bg-neutral-900 text-neutral-400"
              }`}
            >
              พิมพ์ทีละตัว
            </ButtonUI>
            <ButtonUI
              type="button"
              onClick={() => patchDraft({ textMode: "paste" })}
              className={`cursor-pointer px-3 py-1.5 text-xs ${
                draft.textMode === "paste"
                  ? ""
                  : "border border-neutral-800 bg-neutral-900 text-neutral-400"
              }`}
            >
              วางทันที
            </ButtonUI>
          </div>
        </Row>
        <Row label="จังหวะพิมพ์ (มิลลิวินาที ต่อตัวอักษร)">
          <IuputMinMax
            min={draft.typingDelay.min}
            max={draft.typingDelay.max}
            unit="ms"
            onMinChange={(v) =>
              patchDraft({ typingDelay: { ...draft.typingDelay, min: v } })
            }
            onMaxChange={(v) =>
              patchDraft({ typingDelay: { ...draft.typingDelay, max: v } })
            }
          />
        </Row>
      </ConfigCard>

      {/* สวิตช์พฤติกรรมโปรแกรม */}
      <ConfigCard title="พฤติกรรมโปรแกรม">
        <Row label="ข้ามกลุ่มที่โพสต์ค้างรออนุมัติ (skipPending)">
          <Toggle
            checked={draft.skipPending}
            onCheckedChange={(v) => patchDraft({ skipPending: v })}
          />
        </Row>
        <Row label="ซ่อนหน้าต่างเบราว์เซอร์ขณะทำงาน (hideScreen)">
          <Toggle
            checked={draft.hideScreen}
            onCheckedChange={(v) => patchDraft({ hideScreen: v })}
          />
        </Row>
        <Row label="อัปเดตโปรแกรมอัตโนมัติ (autoUpdate)">
          <Toggle
            checked={draft.autoUpdate}
            onCheckedChange={(v) => patchDraft({ autoUpdate: v })}
          />
        </Row>
      </ConfigCard>

      {/* Webhook */}
      <ConfigCard title="Webhook แจ้งเตือน" icon={<Webhook size={15} />}>
        <Row label="เปิดใช้งาน webhook">
          <Toggle
            checked={draft.webhook.enabled}
            onCheckedChange={(v) =>
              patchDraft({ webhook: { ...draft.webhook, enabled: v } })
            }
          />
        </Row>
        <Row label="URL ปลายทาง (Discord เว็บฮุก)">
          <input
            type="url"
            value={draft.webhook.url}
            onChange={(e) =>
              patchDraft({ webhook: { ...draft.webhook, url: e.target.value } })
            }
            placeholder="https://discord.com/api/webhooks/..."
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-200 outline-none focus:border-neutral-600"
          />
        </Row>
      </ConfigCard>

      {/* ปุ่มบันทึก */}
      <div className="flex items-center justify-end gap-3">
        {message && (
          <span
            className={`text-xs ${
              message.type === "ok" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {message.text}
          </span>
        )}
        {dirty && (
          <ButtonUI
            type="button"
            onClick={() => {
              if (config) setDraft(normalizeConfig(config));
              setDirty(false);
              setMessage(null);
            }}
            className="cursor-pointer border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-400"
          >
            <RefreshCw size={13} className="mr-1 inline" />
            ยกเลิก
          </ButtonUI>
        )}
        <ButtonUI
          type="button"
          onClick={handleSave}
          disabled={isSavingConfig}
          className="cursor-pointer px-4 py-1.5 text-xs disabled:opacity-50"
        >
          <Save size={13} className="mr-1 inline" />
          {isSavingConfig ? "กำลังส่ง..." : "บันทึกและส่งคำสั่ง"}
        </ButtonUI>
      </div>
    </FadeIn>
  );
}
