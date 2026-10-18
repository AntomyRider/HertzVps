"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface BlurTextCycleProps {
  texts: string[];
  /** ms ที่ข้อความแสดงอยู่แบบนิ่งๆ ก่อนเริ่มยกตัวอักษรออก */
  holdDuration?: number;
  /** ms ของ animation แต่ละตัวอักษร */
  letterDuration?: number;
  /** ms delay ระหว่างตัวอักษรแต่ละตัว (stagger) */
  stagger?: number;
  /** ระยะทางยกตัวอักษรขึ้นในแนวตั้ง (px) */
  liftDistance?: number;
  className?: string;
}

type Phase = "in" | "hold" | "out";

/**
 * แยกตัวอักษรภาษาไทยอย่างถูกต้อง (ไม่ทำให้สระลอยหรือวรรณยุกต์แยกตัว)
 * รองรับ Intl.Segmenter ใน browser สมัยใหม่ พร้อม fallback regex
 */
function splitThaiGraphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("th", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  const matches = text.match(/[\s\S][\u0E30-\u0E3A\u0E47-\u0E4E]*/g);
  return matches || text.split("");
}

const STYLE_ID = "blur-text-cycle-stagger-keyframes";

const BlurTextCycle = ({
  texts,
  holdDuration = 2200,
  letterDuration = 420,
  stagger = 22,
  liftDistance = 16,
  className,
}: BlurTextCycleProps) => {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("in");

  // ฉีด Keyframes เข้า head ครั้งเดียวเพื่อ performance ที่ดีที่สุด
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @keyframes letter-drop-in {
        0% {
          transform: translateY(-${liftDistance}px);
          opacity: 0;
          filter: blur(10px);
        }
        100% {
          transform: translateY(0);
          opacity: 1;
          filter: blur(0);
        }
      }

      @keyframes letter-lift-out {
        0% {
          transform: translateY(0);
          opacity: 1;
          filter: blur(0);
        }
        100% {
          transform: translateY(-${liftDistance}px);
          opacity: 0;
          filter: blur(10px);
        }
      }
    `;
    document.head.appendChild(style);
  }, [liftDistance]);

  const currentText = texts[index] || "";
  const letters = useMemo(() => splitThaiGraphemes(currentText), [currentText]);

  // คำนวณเวลารวมตั้งแต่ตัวแรกจนตัวสุดท้ายเล่นเสร็จ
  const totalAnimTime = useMemo(() => {
    if (letters.length === 0) return letterDuration;
    return (letters.length - 1) * stagger + letterDuration;
  }, [letters.length, stagger, letterDuration]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "in") {
      // รอจนตัวอักษรตัวสุดท้ายยกลงมาเข้าที่ครบสมบูรณ์ → เข้าสู่ hold
      timer = setTimeout(() => {
        setPhase("hold");
      }, totalAnimTime);
    } else if (phase === "hold") {
      // รอจนครบเวลาอ่าน → เริ่มยกตัวอักษรขึ้นพร้อมเบลอไล่ไปเรื่อยๆ
      timer = setTimeout(() => {
        setPhase("out");
      }, holdDuration);
    } else {
      // หลังตัวสุดท้ายยกขึ้นและเบลอหายไปครบ → สลับข้อความถัดไปแล้วเริ่มยกลงมาใหม่
      timer = setTimeout(() => {
        setIndex((prev) => (prev + 1) % texts.length);
        setPhase("in");
      }, totalAnimTime);
    }

    return () => clearTimeout(timer);
  }, [phase, totalAnimTime, holdDuration, texts.length]);

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center justify-center text-center",
        className
      )}
    >
      {letters.map((char, i) => {
        const isSpace = char === " ";
        const delay = i * stagger;

        let animationStyle: React.CSSProperties = {};

        if (phase === "in") {
          animationStyle = {
            animation: `letter-drop-in ${letterDuration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms both`,
          };
        } else if (phase === "out") {
          animationStyle = {
            animation: `letter-lift-out ${letterDuration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms both`,
          };
        } else {
          // phase === "hold"
          animationStyle = {
            transform: "translateY(0)",
            opacity: 1,
            filter: "blur(0)",
          };
        }

        return (
          <span
            key={`${index}-${i}`}
            style={animationStyle}
            className={cn(
              "inline-block will-change-[transform,opacity,filter]",
              isSpace ? "w-[0.25em]" : ""
            )}
          >
            {isSpace ? "\u00A0" : char}
          </span>
        );
      })}
    </span>
  );
};

export default BlurTextCycle;
