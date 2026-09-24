"use client";

import {
  TimerReset,
  Link as LinkIcon,
  UsersRound,
  RotateCcw,
  Undo2,
  Keyboard,
  ClipboardPaste,
  ArrowLeftRight,
} from "lucide-react";
import {
  useControlStore,
  type ControlDelayRangeKey,
} from "@/store/controlStore";
import { toast } from "@/components/ui/toast";

const MinMaxInput = ({
  min,
  max,
  unit,
  onMinChange,
  onMaxChange,
}: {
  min: number;
  max: number;
  unit: string;
  onMinChange: (val: number) => void;
  onMaxChange: (val: number) => void;
}) => {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center rounded-sm border border-neutral-800 bg-neutral-950 px-2 py-1">
        <span className="mr-1.5 text-[10px] text-neutral-500">ต่ำสุด</span>
        <input
          type="number"
          min={0}
          value={min}
          onChange={(e) => onMinChange(Number(e.target.value) || 0)}
          className="w-14 bg-transparent text-right text-xs font-semibold text-white outline-none"
        />
      </div>

      <span className="text-xs text-neutral-500">-</span>

      <div className="flex items-center rounded-sm border border-neutral-800 bg-neutral-950 px-2 py-1">
        <span className="mr-1.5 text-[10px] text-neutral-500">สูงสุด</span>
        <input
          type="number"
          min={0}
          value={max}
          onChange={(e) => onMaxChange(Number(e.target.value) || 0)}
          className="w-14 bg-transparent text-right text-xs font-semibold text-white outline-none"
        />
      </div>

      <span className="ml-1 text-xs text-neutral-400">{unit}</span>
    </div>
  );
};

export const ControlDelaySettings = () => {
  const { config, setDelayRange, setTextMode, resetConfig } = useControlStore();

  const isTyping = config.textMode === "typing";

  const handleReset = () => {
    resetConfig();
    toast.info("คืนค่าเริ่มต้นเรียบร้อยแล้ว", "รีเซ็ตระยะเวลาหน่วงทั้งหมดกลับเป็นค่ามาตรฐาน");
  };

  const delayItems: Array<{
    key: ControlDelayRangeKey;
    name: string;
    desc: string;
    icon: typeof TimerReset;
  }> = [
    {
      key: "delay",
      name: "เวลาการรอขั้นตอนถัดไป",
      desc: "ระยะเวลารอก่อนดำเนินการขั้นตอนถัดไปในแต่ละหน้า (Step Delay)",
      icon: TimerReset,
    },
    {
      key: "delayBetweenLinks",
      name: "ระยะเวลาเปลี่ยนลิงก์",
      desc: "ระยะเวลาหน่วงก่อนสลับไปยังลิงก์ปลายทางถัดไป (Link Delay)",
      icon: LinkIcon,
    },
    {
      key: "delayBetweenGroups",
      name: "ระยะเวลาเปลี่ยนกลุ่ม",
      desc: "ระยะเวลาหน่วงก่อนสลับไปยังหมวดหมู่กลุ่มถัดไป (Group Delay)",
      icon: UsersRound,
    },
    {
      key: "nextRoundDelay",
      name: "ระยะเวลาเริ่มต้นรอบใหม่",
      desc: "ระยะเวลาหน่วงก่อนเริ่มกระบวนการทำงานรอบถัดไป (Round Delay)",
      icon: RotateCcw,
    },
  ];

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950 p-5">
      {/* Header (Without Presets as requested) */}
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-900 pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-bold tracking-tight text-white">
            การตั้งค่าพื้นฐานเกี่ยวกับการทำงาน
          </h3>
          <p className="mt-0.5 text-xs text-neutral-400">
            ตั้งค่ารูปแบบการพิมพ์ข้อความและระยะเวลาหน่วงในการทำงานของระบบ
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-sm border border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white sm:self-auto"
        >
          <Undo2 size={13} />
          <span>คืนค่าเริ่มต้น</span>
        </button>
      </div>

      {/* Items List */}
      <div className="mt-4 space-y-3">
        {/* Text Input Mode Row */}
        <div className="flex flex-col justify-between gap-3 rounded-sm border border-neutral-800 bg-neutral-900/30 p-3.5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900 text-blue-400">
                {isTyping ? (
                  <Keyboard size={18} strokeWidth={1.8} />
                ) : (
                  <ClipboardPaste size={18} strokeWidth={1.8} />
                )}
              </div>

              <button
                type="button"
                onClick={() => setTextMode(isTyping ? "paste" : "typing")}
                title="สลับโหมดเขียนข้อความ / วางข้อความ"
                className="absolute -bottom-1 -right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm border border-neutral-700 bg-neutral-800 text-neutral-200 transition hover:bg-blue-600 hover:text-white"
              >
                <ArrowLeftRight size={10} />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">
                  รูปแบบการใส่ข้อความ
                </p>
                <span className="rounded-sm border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                  {isTyping ? "เขียนข้อความ" : "วางข้อความ"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-neutral-400">
                {isTyping
                  ? "พิมพ์ข้อความทีละตัวอักษรเลียนแบบมนุษย์ (Typing Delay)"
                  : "วางข้อความลงในกล่องโพสต์และคอมเมนต์ทันทีโดยไม่หน่วงเวลา"}
              </p>
            </div>
          </div>

          <div className="self-end lg:self-auto">
            {isTyping ? (
              <MinMaxInput
                min={config.typingDelay.min}
                max={config.typingDelay.max}
                unit="มิลลิวินาที"
                onMinChange={(val) => setDelayRange("typingDelay", "min", val)}
                onMaxChange={(val) => setDelayRange("typingDelay", "max", val)}
              />
            ) : (
              <div className="rounded-sm border border-neutral-800 bg-neutral-950 px-3.5 py-1.5 text-xs font-medium text-neutral-400">
                วางข้อความทันที
              </div>
            )}
          </div>
        </div>

        {/* 4 Delay Ranges */}
        {delayItems.map((item) => {
          const Icon = item.icon;
          const range = config[item.key];
          return (
            <div
              key={item.key}
              className="flex flex-col justify-between gap-3 rounded-sm border border-neutral-800 bg-neutral-900/30 p-3.5 lg:flex-row lg:items-center"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900 text-blue-400">
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-400">{item.desc}</p>
                </div>
              </div>

              <div className="self-end lg:self-auto">
                <MinMaxInput
                  min={range.min}
                  max={range.max}
                  unit="วินาที"
                  onMinChange={(val) => setDelayRange(item.key, "min", val)}
                  onMaxChange={(val) => setDelayRange(item.key, "max", val)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ControlDelaySettings;
