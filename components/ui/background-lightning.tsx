"use client";

import React, { useEffect, useRef } from "react";

interface GridPulse {
  isHorizontal: boolean;
  worldGridIndex: number; // Continuous world-space grid line index (never jumps on wrap)
  pos: number; // Position along the line axis
  speed: number; // Velocity in px per second
  length: number;
  alpha: number;
  maxLife: number; // In seconds
  life: number; // In seconds
}

export const BackgroundLightning: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const updateSize = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    const pulses: GridPulse[] = [];
    const GRID_SIZE = 40;
    const GRID_SPEED_PX_PER_SEC = GRID_SIZE / 3; // 40px per 3 seconds (13.333 px/s)

    const spawnPulse = (totalOffset: number, randomInitialLife = false) => {
      const isHorizontal = Math.random() > 0.5;
      const span = isHorizontal ? height : width;
      const axisSpan = isHorizontal ? width : height;

      // Pick a visible screen line index, then convert to continuous worldGridIndex
      // screenCoord = worldGridIndex * GRID_SIZE + totalOffset
      const currentGridIndexOffset = Math.floor(totalOffset / GRID_SIZE);
      const visibleCount = Math.ceil(span / GRID_SIZE) + 2;
      const screenIndex = Math.floor(Math.random() * visibleCount) - 1;
      const worldGridIndex = screenIndex - currentGridIndexOffset;

      const dir = Math.random() > 0.5 ? 1 : -1;
      const speed = (220 + Math.random() * 240) * dir; // Smooth px per second
      const maxLife = 1.8 + Math.random() * 1.4; // 1.8s - 3.2s

      pulses.push({
        isHorizontal,
        worldGridIndex,
        pos:
          dir > 0
            ? Math.random() * (axisSpan * 0.65)
            : axisSpan * 0.35 + Math.random() * (axisSpan * 0.65),
        speed,
        length: 95 + Math.random() * 110,
        alpha: 0.6 + Math.random() * 0.35,
        maxLife,
        life: randomInitialLife ? Math.random() * maxLife * 0.7 : 0,
      });
    };

    const startTime = performance.now();
    let lastTime = startTime;

    // Seed initial pulses smoothly
    for (let i = 0; i < 8; i++) {
      spawnPulse(0, true);
    }

    const render = (now: number) => {
      // Clamp dt to avoid jumps when switching browser tabs
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Monotonically increasing offset (never resets to 0, preventing any cut/jump)
      const elapsedSec = (now - startTime) / 1000;
      const totalOffset = elapsedSec * GRID_SPEED_PX_PER_SEC;
      const wrappedOffset =
        ((totalOffset % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw sub-pixel smooth moving 40x40px grid
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth = 1;

      for (let x = wrappedOffset - GRID_SIZE; x <= width + GRID_SIZE; x += GRID_SIZE) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }

      for (let y = wrappedOffset - GRID_SIZE; y <= height + GRID_SIZE; y += GRID_SIZE) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      ctx.restore();

      // 2. Maintain steady stream of electric grid pulses
      if (pulses.length < 12 && Math.random() < dt * 5.5) {
        spawnPulse(totalOffset, false);
      }

      // 3. Update and draw electric current beams locked to worldGridIndex
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.pos += (p.speed + GRID_SPEED_PX_PER_SEC) * dt;
        p.life += dt;

        if (p.life >= p.maxLife) {
          pulses.splice(i, 1);
          continue;
        }

        // Smooth fade-in and fade-out envelope (sinusoidal)
        const progress = p.life / p.maxLife;
        const fade = Math.sin(progress * Math.PI) * p.alpha;

        // Continuous screen coordinate of this exact grid line (never jumps!)
        const lineCoord = p.worldGridIndex * GRID_SIZE + totalOffset;

        // Skip drawing if the line has drifted completely off-screen
        if (p.isHorizontal && (lineCoord < -20 || lineCoord > height + 20)) {
          continue;
        }
        if (!p.isHorizontal && (lineCoord < -20 || lineCoord > width + 20)) {
          continue;
        }

        const dirSign = Math.sign(p.speed);
        const headX = p.isHorizontal ? p.pos : lineCoord;
        const headY = p.isHorizontal ? lineCoord : p.pos;
        const tailX = p.isHorizontal ? headX - dirSign * p.length : lineCoord;
        const tailY = p.isHorizontal ? lineCoord : headY - dirSign * p.length;

        const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
        grad.addColorStop(0, "rgba(59, 130, 246, 0)");
        grad.addColorStop(0.55, `rgba(59, 130, 246, ${(fade * 0.5).toFixed(3)})`);
        grad.addColorStop(0.9, `rgba(96, 165, 250, ${(fade * 0.9).toFixed(3)})`);
        grad.addColorStop(1, `rgba(224, 242, 254, ${fade.toFixed(3)})`);

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.shadowColor = "rgba(59, 130, 246, 0.85)";
        ctx.shadowBlur = 10;
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.stroke();

        // Glowing spark tip
        ctx.beginPath();
        ctx.fillStyle = `rgba(224, 242, 254, ${fade.toFixed(3)})`;
        ctx.shadowColor = "rgba(96, 165, 250, 1)";
        ctx.shadowBlur = 8;
        ctx.arc(headX, headY, 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", updateSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black"
    >
      {/* Subtle top ambient blue glow */}
      <div className="absolute -top-40 left-1/2 h-[420px] w-[860px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[130px]" />

      {/* Continuous Sub-pixel Moving Grid + Electric Current Beams */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
      />

      {/* Soft radial vignette to keep foreground UI crisp */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.68)_100%)]" />
    </div>
  );
};

export default BackgroundLightning;
