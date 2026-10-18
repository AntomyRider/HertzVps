"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const HologramSpaceBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined") return;

    // 1. Accessibility: Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 2. Scene Setup with Deep Void Fog (#000000)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0024);

    // 3. Camera Setup
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 24, 90);
    camera.lookAt(0, 0, -180);

    // 4. Renderer with DPR Clamping (Zero thermal throttling / lag)
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    // 5. Procedural Circular Glow Texture for Hologram Particles (0 external requests)
    const createGlowTexture = (): THREE.Texture => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.25, "rgba(96, 165, 250, 0.85)"); // Electric blue glow
        gradient.addColorStop(0.65, "rgba(37, 99, 235, 0.2)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
      }
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    const particleTexture = createGlowTexture();

    // 6. Layer 1: Holographic Infinite Ground Grid
    // Using GridHelper with custom cell dimensions for smooth endless forward drift
    const gridSize = 1400;
    const gridDivisions = 70;
    const gridCellSize = gridSize / gridDivisions; // 20 units per cell

    const gridHelper = new THREE.GridHelper(
      gridSize,
      gridDivisions,
      0x3b82f6, // Center line: Electric Blue
      0x1e3a8a  // Grid lines: Deep Hologram Cyan/Blue
    );
    gridHelper.position.y = -36;

    // Apply custom opacity and depth handling to GridHelper materials
    const materials = Array.isArray(gridHelper.material)
      ? gridHelper.material
      : [gridHelper.material];
    materials.forEach((mat) => {
      mat.transparent = true;
      mat.opacity = 0.28;
      mat.depthWrite = false;
    });

    scene.add(gridHelper);

    // 7. Layer 2: Holographic Cyber Dust / Starfield
    const particleCount = 1400;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Subtle holographic color palette: whites, sky blues, and cyan tints
    const palette = [
      new THREE.Color(0xffffff), // Pure digital white
      new THREE.Color(0x93c5fd), // Soft sky blue
      new THREE.Color(0x60a5fa), // Electric blue
      new THREE.Color(0x38bdf8), // Cyan glow
    ];

    for (let i = 0; i < particleCount; i++) {
      // Coordinate distribution
      positions[i * 3] = (Math.random() - 0.5) * 800; // X: -400 to 400
      positions[i * 3 + 1] = Math.random() * 320 - 40; // Y: -40 to 280
      positions[i * 3 + 2] = Math.random() * 850 - 700; // Z: -700 to 150

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      size: 2.8,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 8. Layer 3: Subtle Holographic Horizon Light Beam
    const horizonGeo = new THREE.PlaneGeometry(1200, 3);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    });
    const horizon = new THREE.Mesh(horizonGeo, horizonMat);
    horizon.position.set(0, -35.5, -450);
    scene.add(horizon);

    // 9. Interactive Mouse Tracking with Smooth Damping (Parallax)
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 10. Responsive Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // 11. Tab Visibility Observer (0% CPU/GPU usage when tab is inactive)
    let animationFrameId: number;
    let isTabVisible = true;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isTabVisible = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        isTabVisible = true;
        animate();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 12. Main Animation Loop
    const forwardSpeed = prefersReducedMotion ? 0 : 0.45;
    const particleSpeed = prefersReducedMotion ? 0 : 0.28;

    const animate = () => {
      if (!isTabVisible) return;

      // 12a. Endless forward grid scrolling
      if (!prefersReducedMotion) {
        gridHelper.position.z += forwardSpeed;
        if (gridHelper.position.z >= gridCellSize) {
          gridHelper.position.z -= gridCellSize;
        }

        // 12b. Particle slow forward drift & wrap-around
        const posAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          posArray[i * 3 + 2] += particleSpeed;
          // Wrap particle back when it passes the camera
          if (posArray[i * 3 + 2] > 140) {
            posArray[i * 3 + 2] = -700;
          }
        }
        posAttr.needsUpdate = true;

        // Subtle cosmic rotation
        particles.rotation.y += 0.00015;
      }

      // 12c. Smooth Mouse Parallax Damping
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      camera.position.x = mouse.x * 14;
      camera.position.y = 24 - mouse.y * 7;
      camera.lookAt(mouse.x * 4, -mouse.y * 2, -180);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 13. Comprehensive Lifecycle Cleanup (Zero Memory Leaks)
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Three.js objects
      gridHelper.geometry.dispose();
      materials.forEach((m) => m.dispose());

      particleGeometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();

      horizonGeo.dispose();
      horizonMat.dispose();

      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black"
    >
      {/* Three.js 3D Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />

      {/* Subtle Radial Vignette: Keeps center UI and text sharp and readable */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.72)_88%,#000000_100%)]" />

      {/* Subtle Top & Bottom Gradient: Guarantees seamless blend with navbar and footer */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85" />
    </div>
  );
};

export default HologramSpaceBackground;
