"use client";

import React from "react";

interface TaskCharacterProps {
  isRunning?: boolean;
  className?: string;
  size?: number;
}

/**
 * คอมโพเนนต์ตัวละคร 2D สไตล์ Flat Vector:
 * - เมื่อไม่ได้รัน (!isRunning): โทนสี Neutral ยืนนิ่งพร้อมอนิเมชั่นหายใจเบาๆ
 * - เมื่อกำลังรัน (isRunning): โทนสี Emerald / เขียวสดใส พร้อมอนิเมชั่นก้าวเดิน (Walking 2D) อย่างเป็นธรรมชาติ
 */
export const TaskCharacter = ({
  isRunning = false,
  className = "",
  size = 20,
}: TaskCharacterProps) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none m-0 p-0 leading-none ${className}`}
      style={{ width: size, height: size }}
      title={isRunning ? "กำลังทำงาน (เดิน)" : "สแตนด์บาย (ยืนนิ่ง)"}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className="block overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* แสงเรืองรองสีเขียวมรกตสำหรับ Visor ตอนเดิน */}
          <filter
            id="green-visor-glow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <style>{`
            /* ========== 1. ท่ายืนนิ่ง โทน NEUTRAL ========== */
            .char-idle-breath {
              animation: idle-breathe 2.4s ease-in-out infinite;
              transform-origin: 12px 21px;
            }
            @keyframes idle-breathe {
              0%, 100% {
                transform: translateY(0px) scale(1);
              }
              50% {
                transform: translateY(-0.5px) scaleY(1.02);
              }
            }

            /* ========== 2. ท่าเดิน 2D (WALKING) โทน เขียว ========== */
            /* ลำตัวโยกขึ้นลงตามจังหวะก้าวเดิน (Bobbing) */
            .char-walk-body {
              animation: walk-bob 0.38s ease-in-out infinite alternate;
              transform-origin: 12px 21px;
            }
            @keyframes walk-bob {
              0% { transform: translateY(0.4px); }
              100% { transform: translateY(-0.7px); }
            }

            /* ขาซ้ายก้าวเดิน */
            .char-walk-leg-l {
              animation: walk-leg-cycle-l 0.76s ease-in-out infinite;
              transform-origin: 10px 16px;
            }
            @keyframes walk-leg-cycle-l {
              0% { transform: rotate(-24deg); }
              50% { transform: rotate(24deg); }
              100% { transform: rotate(-24deg); }
            }

            /* ขาขวาก้าวเดิน (สลับจังหวะ) */
            .char-walk-leg-r {
              animation: walk-leg-cycle-r 0.76s ease-in-out infinite;
              transform-origin: 14px 16px;
            }
            @keyframes walk-leg-cycle-r {
              0% { transform: rotate(24deg); }
              50% { transform: rotate(-24deg); }
              100% { transform: rotate(24deg); }
            }

            /* แขนซ้ายแกว่งตามจังหวะเดิน */
            .char-walk-arm-l {
              animation: walk-arm-cycle-l 0.76s ease-in-out infinite;
              transform-origin: 7.5px 12px;
            }
            @keyframes walk-arm-cycle-l {
              0% { transform: rotate(20deg); }
              50% { transform: rotate(-20deg); }
              100% { transform: rotate(20deg); }
            }

            /* แขนขวาแกว่งตามจังหวะเดิน (สลับด้าน) */
            .char-walk-arm-r {
              animation: walk-arm-cycle-r 0.76s ease-in-out infinite;
              transform-origin: 16.5px 12px;
            }
            @keyframes walk-arm-cycle-r {
              0% { transform: rotate(-20deg); }
              50% { transform: rotate(20deg); }
              100% { transform: rotate(-20deg); }
            }
          `}</style>
        </defs>

        {isRunning ? (
          /* ==================== สถานะกำลังรัน: สีเขียว (EMERALD / GREEN) & ท่าเดิน 2D ==================== */
          <g className="char-walk-body">
            {/* แขนซ้าย (หลัง) */}
            <path
              d="M7.5 12 L5.5 15.8"
              stroke="#059669"
              strokeWidth="2.3"
              strokeLinecap="round"
              className="char-walk-arm-l"
            />

            {/* ขาซ้าย (หลัง) */}
            <path
              d="M10 16.5 L10 21 L8.5 21.6"
              stroke="#047857"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="char-walk-leg-l"
            />

            {/* ลำตัว (ชุดสีเขียวมรกต 2D) */}
            <rect
              x="7.5"
              y="11"
              width="9"
              height="6.2"
              rx="2.2"
              fill="#059669"
              stroke="#10b981"
              strokeWidth="1"
            />
            {/* Core ไฟกลางอกสีเขียวอ่อน */}
            <circle cx="12" cy="14" r="1.1" fill="#34d399" />

            {/* ขาขวา (หน้า) */}
            <path
              d="M14 16.5 L14 21 L15.5 21.6"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="char-walk-leg-r"
            />

            {/* หูฟังด้านข้าง */}
            <rect
              x="5.8"
              y="5.2"
              width="1.6"
              height="3.2"
              rx="0.8"
              fill="#10b981"
            />
            <rect
              x="16.6"
              y="5.2"
              width="1.6"
              height="3.2"
              rx="0.8"
              fill="#10b981"
            />

            {/* ศีรษะ (Head / หมวก 2D) */}
            <rect
              x="7"
              y="2.5"
              width="10"
              height="8.8"
              rx="4.4"
              fill="#064e3b"
              stroke="#10b981"
              strokeWidth="1.1"
            />

            {/* Visor เรืองแสงสีเขียวนีออน (Emerald Glow) */}
            <rect
              x="8.5"
              y="4.8"
              width="7"
              height="3.6"
              rx="1.8"
              fill="#34d399"
              filter="url(#green-visor-glow)"
            />

            {/* แขนขวา (หน้า) */}
            <path
              d="M16.5 12 L18.5 15.8"
              stroke="#34d399"
              strokeWidth="2.3"
              strokeLinecap="round"
              className="char-walk-arm-r"
            />
          </g>
        ) : (
          /* ==================== สถานะไม่รัน: สี NEUTRAL (GRAY MONOCHROME) & ยืนนิ่ง ==================== */
          <g className="char-idle-breath">
            {/* แขนซ้าย */}
            <path
              d="M7.5 12 L5.8 16"
              stroke="#525252"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* ขาซ้าย */}
            <path
              d="M9.5 16.5 L9.5 21.2 L8 21.8"
              stroke="#525252"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* ขาขวา */}
            <path
              d="M14.5 16.5 L14.5 21.2 L16 21.8"
              stroke="#525252"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* ลำตัว (โทน Neutral 2D) */}
            <rect
              x="7.5"
              y="11"
              width="9"
              height="6.2"
              rx="2.2"
              fill="#262626"
              stroke="#404040"
              strokeWidth="1"
            />
            {/* Core ไฟกลางอก Neutral */}
            <circle cx="12" cy="14" r="1.1" fill="#525252" />

            {/* หูฟังซ้าย/ขวา */}
            <rect
              x="5.8"
              y="5.2"
              width="1.6"
              height="3.2"
              rx="0.8"
              fill="#525252"
            />
            <rect
              x="16.6"
              y="5.2"
              width="1.6"
              height="3.2"
              rx="0.8"
              fill="#525252"
            />

            {/* ศีรษะ (Head / หมวก Neutral) */}
            <rect
              x="7"
              y="2.5"
              width="10"
              height="8.8"
              rx="4.4"
              fill="#171717"
              stroke="#404040"
              strokeWidth="1.1"
            />

            {/* Visor ท่ายืนพัก สีเทา Neutral */}
            <rect
              x="8.5"
              y="4.8"
              width="7"
              height="3.6"
              rx="1.8"
              fill="#737373"
              opacity="0.85"
            />

            {/* แขนขวา */}
            <path
              d="M16.5 12 L18.2 16"
              stroke="#525252"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

export default TaskCharacter;
