"use client";

import React, { useState, useEffect } from "react";

interface IuputMinMaxProps {
  min?: number;
  max?: number;
  unit?: string;
  onMinChange?: (value: number) => void;
  onMaxChange?: (value: number) => void;
}

const IuputMinMax = ({
  min,
  max,
  unit = "วินาที",
  onMinChange,
  onMaxChange,
}: IuputMinMaxProps) => {
  const [localMin, setLocalMin] = useState<string>(
    min !== undefined && min !== null ? String(min) : ""
  );
  const [localMax, setLocalMax] = useState<string>(
    max !== undefined && max !== null ? String(max) : ""
  );

  // ซิงค์ค่าเมื่อ props มีการเปลี่ยนแปลงจากภายนอก (เช่น กด Preset, Reset, หรือดึงข้อมูล)
  useEffect(() => {
    setLocalMin(min !== undefined && min !== null ? String(min) : "");
  }, [min]);

  useEffect(() => {
    setLocalMax(max !== undefined && max !== null ? String(max) : "");
  }, [max]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;

    // อนุญาตเฉพาะตัวเลขและจุดทศนิยม หรือค่าว่าง
    if (rawVal !== "" && !/^\d*\.?\d*$/.test(rawVal)) {
      return;
    }

    setLocalMin(rawVal);

    // หากลบจนว่าง หรือกำลังพิมพ์จุดทศนิยมค้างไว้ ให้คงค่าไว้พิมพ์ต่อได้สะดวก (ไม่บังคับเป็น 0 ทันที)
    if (rawVal.trim() === "" || rawVal.endsWith(".")) {
      return;
    }

    const num = parseFloat(rawVal);
    if (!isNaN(num) && num >= 0) {
      onMinChange?.(num);
    }
  };

  const handleMinBlur = () => {
    if (localMin.trim() === "" || isNaN(Number(localMin))) {
      // หากปล่อยว่างไว้แล้วเลิกโฟกัส ให้คืนค่าเดิมที่ถูกต้องล่าสุด
      setLocalMin(min !== undefined && min !== null ? String(min) : "0");
    } else {
      const num = Math.max(0, parseFloat(localMin));
      setLocalMin(String(num));
      if (num !== min) {
        onMinChange?.(num);
      }
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;

    if (rawVal !== "" && !/^\d*\.?\d*$/.test(rawVal)) {
      return;
    }

    setLocalMax(rawVal);

    if (rawVal.trim() === "" || rawVal.endsWith(".")) {
      return;
    }

    const num = parseFloat(rawVal);
    if (!isNaN(num) && num >= 0) {
      onMaxChange?.(num);
    }
  };

  const handleMaxBlur = () => {
    if (localMax.trim() === "" || isNaN(Number(localMax))) {
      setLocalMax(max !== undefined && max !== null ? String(max) : "0");
    } else {
      const num = Math.max(0, parseFloat(localMax));
      setLocalMax(String(num));
      if (num !== max) {
        onMaxChange?.(num);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-2 select-none">
      <div className="flex h-9 items-center rounded-xl border border-white/[0.1] bg-neutral-900/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.06)] transition-all focus-within:border-sky-500/60 focus-within:ring-1 focus-within:ring-sky-500/20">
        <span className="border-r border-white/[0.08] px-2.5 text-[10px] font-semibold text-neutral-400 tracking-tight">
          ต่ำสุด
        </span>

        <input
          type="text"
          inputMode="decimal"
          value={localMin}
          onChange={handleMinChange}
          onBlur={handleMinBlur}
          onKeyDown={handleKeyDown}
          className="h-full w-14 bg-transparent px-2 text-center text-sm font-semibold text-neutral-100 outline-none"
        />
      </div>

      <span className="text-xs font-bold text-neutral-600">-</span>

      <div className="flex h-9 items-center rounded-xl border border-white/[0.1] bg-neutral-900/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.06)] transition-all focus-within:border-sky-500/60 focus-within:ring-1 focus-within:ring-sky-500/20">
        <span className="border-r border-white/[0.08] px-2.5 text-[10px] font-semibold text-neutral-400 tracking-tight">
          สูงสุด
        </span>

        <input
          type="text"
          inputMode="decimal"
          value={localMax}
          onChange={handleMaxChange}
          onBlur={handleMaxBlur}
          onKeyDown={handleKeyDown}
          className="h-full w-14 bg-transparent px-2 text-center text-sm font-semibold text-neutral-100 outline-none"
        />
      </div>

      <span className="ml-1 text-xs font-medium text-neutral-400">
        {unit}
      </span>
    </div>
  );
};

export default IuputMinMax;