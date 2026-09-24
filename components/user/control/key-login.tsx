"use client";

import { useState } from "react";
import {
  KeyRound,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useControlStore } from "@/store/controlStore";
import ButtonUI from "@/components/ui/button";
import Input from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

export const ControlKeyLogin = () => {
  const { loginWithKey, isLoading, error, clearError } = useControlStore();
  const [inputCode, setInputCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await loginWithKey(inputCode);
    if (res.success) {
      toast.success("เข้าสู่ระบบสำเร็จ", "ตรวจสอบรหัสคีย์ถูกต้อง");
    } else if (res.error) {
      toast.error("ตรวจสอบคีย์ไม่ผ่าน", res.error);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center py-12">
      <div className="rounded-md border border-neutral-800 bg-neutral-950/90 p-6 sm:p-8 backdrop-blur-xs">
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <KeyRound size={22} strokeWidth={1.8} />
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-white">
            เข้าสู่ระบบควบคุมโปรแกรม
          </h1>
          <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
            กรอกรหัส License Key ของคุณเพื่อตรวจสอบสิทธิ์และเข้าใช้งานแผงควบคุม Hertz Manager
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="control-key-input"
              className="mb-1.5 block text-xs font-medium text-neutral-300"
            >
              รหัสคีย์ (License Key)
            </label>
            <Input
              id="control-key-input"
              type="text"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value);
                if (error) clearError();
              }}
              disabled={isLoading}
              placeholder="กรอกรหัสคีย์ เช่น HERTZ-XXXX-XXXX"
              autoComplete="off"
              leftIcon={<KeyRound size={16} />}
              className="py-2.5"
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-sm border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <ButtonUI
            type="submit"
            disabled={isLoading || !inputCode.trim()}
            isLoading={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
          >
            <span>ตรวจสอบและเข้าใช้งาน</span>
            <ArrowRight size={16} />
          </ButtonUI>
        </form>

        {/* Footer Security Hint */}
        <div className="mt-6 flex items-center justify-center gap-2 border-t border-neutral-900 pt-4 text-[11px] text-neutral-500">
          <ShieldCheck size={14} className="text-blue-400" />
          <span>ตรวจสอบสถานะคีย์กับฐานข้อมูล Hertz Manager โดยตรง</span>
        </div>
      </div>
    </div>
  );
};

export default ControlKeyLogin;
