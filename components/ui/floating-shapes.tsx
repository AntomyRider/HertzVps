"use client";

import { useEffect } from "react";

type ShapeType = "x" | "o" | "square";

interface ShapeConfig {
  id: number;
  type: ShapeType;
  left: number;    // % from left
  size: number;    // px
  duration: number; // s
  delay: number;   // s (negative = already mid-flight)
  opacity: number; // 0–1
  rotate: number;  // deg
}

const SHAPE_COUNT = 40;

/** Deterministic spread via double golden-ratio so positions don't clump */
function buildShapes(): ShapeConfig[] {
  const types: ShapeType[] = ["x", "o", "square"];
  return Array.from({ length: SHAPE_COUNT }, (_, i) => {
    const a = (i * 137.508 + 17) % 100;  // primary seed  0–100
    const b = (i * 97.314  + 53) % 100;  // secondary seed 0–100
    return {
      id: i,
      type: types[i % types.length],
      left: ((a * 9.71) % 96) + 2,             // 2–98 %
      size: 8 + ((a * 0.37 + b * 0.63) % 34),  // 8–42 px  ← wider range
      duration: 8 + ((b * 2.1 + a * 0.9) % 18), // 8–26 s
      delay: -((a * 1.9 + b * 0.3) % 24),       // 0 to -24 s stagger
      opacity: 0.05 + ((b * 0.009) % 0.14),      // 0.05–0.19
      rotate: (a * 3.6 + b * 0.4) % 360,
    };
  });
}

const shapes = buildShapes();

const ShapeSVG = ({
  type,
  size,
  opacity,
}: {
  type: ShapeType;
  size: number;
  opacity: number;
}) => {
  // Blend blue tint for larger shapes, neutral for smaller — keeps design palette
  const color = `rgba(148, 163, 184, ${opacity})`;

  if (type === "o") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      </svg>
    );
  }

  if (type === "x") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <line x1="4" y1="4" x2="20" y2="20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <line x1="20" y1="4" x2="4" y2="20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.8" />
    </svg>
  );
};

const FloatingShapes = () => {
  const styleId = "floating-shapes-keyframes";

  useEffect(() => {
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes float-up {
        0%   { transform: translateY(0)          rotate(var(--rot)); opacity: 0; }
        6%   { opacity: 1; }
        94%  { opacity: 1; }
        100% { transform: translateY(-105vh) rotate(calc(var(--rot) + 200deg)); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById(styleId)?.remove(); };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {shapes.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            bottom: 0,
            left: `${s.left}%`,
            ["--rot" as string]: `${s.rotate}deg`,
            animation: `float-up ${s.duration}s linear ${s.delay}s infinite`,
            willChange: "transform, opacity",
          }}
        >
          <ShapeSVG type={s.type} size={s.size} opacity={s.opacity} />
        </div>
      ))}
    </div>
  );
};

export default FloatingShapes;
