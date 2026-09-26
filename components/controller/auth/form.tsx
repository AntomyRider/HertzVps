"use client";

import React from "react";
import Link from "next/link";
import {
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import ButtonUI from "@/components/ui/button";
import { useControllerStore } from "@/store/controllerStore";

export default function ControllerAuthForm() {
  const {
    inputKey,
    showKey,
    isConnecting,
    connectError,
    setInputKey,
    setShowKey,
    connectWithKey,
  } = useControllerStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isConnecting) return;
    await connectWithKey();
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-black px-4 py-12">
      {/* Background Subtle Glow Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(59,130,246,0.08),transparent)]" />

      <FadeIn
        direction="up"
        delay={40}
        className="relative z-10 w-full max-w-md rounded-md border border-neutral-800 bg-neutral-950 p-6 sm:p-8"
      >
        {/* Header Section */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-400">
            <KeyRound size={24} strokeWidth={1.8} />
          </div>

          <h2 className="mt-4 text-xl font-bold tracking-tight text-white sm:text-2xl">
            เข้าสู่ระบบ Controller
          </h2>
          <p className="mt-1.5 text-xs text-neutral-400 sm:text-sm">
            กรุณากรอก License Key ของคุณเพื่อเข้าใช้งานระบบควบคุม
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">
              License Key
            </label>

            <div className="relative flex w-full items-center">
              <div className="pointer-events-none absolute left-3 flex items-center justify-center text-neutral-500">
                <ShieldCheck size={16} strokeWidth={1.8} />
              </div>

              <input
                type={showKey ? "text" : "password"}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="HERTZ-XXXX-XXXX-XXXX"
                disabled={isConnecting}
                autoFocus
                className="w-full rounded-sm border border-neutral-800 bg-neutral-900/60 py-2.5 pl-9 pr-10 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 cursor-pointer text-neutral-500 transition hover:text-neutral-300"
                title={showKey ? "ซ่อนคีย์" : "แสดงคีย์"}
                tabIndex={-1}
              >
                {showKey ? (
                  <EyeOff size={16} strokeWidth={1.8} />
                ) : (
                  <Eye size={16} strokeWidth={1.8} />
                )}
              </button>
            </div>
          </div>

          {/* Error Message Box */}
          {connectError && (
            <div className="flex items-start gap-2.5 rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 animate-in fade-in duration-150">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{connectError}</span>
            </div>
          )}

          {/* Submit Button */}
          <ButtonUI
            type="submit"
            disabled={isConnecting || !inputKey.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-blue-600 py-2.5 text-sm font-medium hover:bg-blue-500"
          >
            {isConnecting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>กำลังตรวจสอบสิทธิ์...</span>
              </>
            ) : (
              <>
                <span>เข้าสู่ระบบ Controller</span>
              </>
            )}
          </ButtonUI>
        </form>

        {/* Footer Navigation Links */}
        <div className="mt-6 flex flex-col gap-2.5 border-t border-neutral-900 pt-5 text-xs text-neutral-400">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-neutral-400 transition hover:text-white"
            >
              <ArrowLeft size={14} />
              <span>กลับสู่หน้าหลัก</span>
            </Link>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-blue-400 transition hover:text-blue-300"
            >
              <ShoppingBag size={14} />
              <span>สั่งซื้อ License Key</span>
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
