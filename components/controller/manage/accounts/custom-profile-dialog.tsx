"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  User,
  Trash2,
  Loader2,
  Camera,
  Network,
  Globe,
  CheckCircle2,
  AlertCircle,
  Shield,
  Check,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import ButtonUI from "@/components/ui/button";
import Input from "@/components/ui/input";
import Toggle from "@/components/ui/toggle";
import { toast } from "@/components/ui/toast";
import {
  useControllerStore,
  type ControllerAccountItem,
} from "@/store/controllerStore";
import { isValidImageUrl } from "@/lib/utils";

export interface CustomProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  account: ControllerAccountItem | null;
}

type DialogTab = "profile" | "connection";

export default function CustomProfileDialog({
  isOpen,
  onClose,
  account,
}: CustomProfileDialogProps) {
  const { updateAccountProfile } = useControllerStore();

  const [activeTab, setActiveTab] = useState<DialogTab>("profile");
  const [name, setName] = useState("");
  const [proxy, setProxy] = useState("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestingProxy, setIsTestingProxy] = useState(false);
  const [proxyTestResult, setProxyTestResult] = useState<{
    success: boolean;
    message?: string;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && account) {
      setName(account.name || "");
      setProxy(account.proxy || "");
      setIsActive(account.isActive ?? true);
      setAvatarUrl(account.avatar || null);
      setActiveTab("profile");
      setIsSubmitting(false);
      setIsTestingProxy(false);
      setProxyTestResult(null);
      setErrorMessage(null);
    }
  }, [isOpen, account]);

  // จัดการ Drag & Drop ไฟล์รูปภาพ 1 รูป
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    setErrorMessage(null);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setErrorMessage("กรุณาเลือกไฟล์รูปภาพเท่านั้น (.jpg, .jpeg, .png, .webp)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setErrorMessage("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAvatarUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTestProxy = async () => {
    if (!proxy.trim()) {
      setProxyTestResult({
        success: false,
        message: "กรุณาระบุ Proxy ก่อนกดทดสอบ",
      });
      return;
    }

    setIsTestingProxy(true);
    setProxyTestResult(null);

    try {
      // ตรวจสอบรูปแบบ proxy เบื้องต้น (ip:port หรือ ip:port:user:pass)
      const parts = proxy.trim().split(":");
      if (parts.length < 2 || isNaN(Number(parts[1]))) {
        setProxyTestResult({
          success: false,
          message: "รูปแบบ Proxy ไม่ถูกต้อง (ควรเป็น ip:port หรือ ip:port:user:pass)",
        });
        toast.error("รูปแบบ Proxy ไม่ถูกต้อง");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 800));
      setProxyTestResult({
        success: true,
        message: `ตรวจสอบรูปแบบ Proxy ${parts[0]}:${parts[1]} ถูกต้อง`,
      });
      toast.success("ตรวจสอบรูปแบบ Proxy ถูกต้อง");
    } catch {
      setProxyTestResult({ success: false, message: "เกิดข้อผิดพลาดในการทดสอบ Proxy" });
    } finally {
      setIsTestingProxy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!account) return;

    if (!name.trim()) {
      setActiveTab("profile");
      setErrorMessage("กรุณาระบุชื่อโปรไฟล์");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateAccountProfile(account.id, {
        name: name.trim(),
        avatar: avatarUrl,
        proxy: proxy.trim() || null,
        isActive,
      });

      if (res?.success) {
        toast.success(res.message || "บันทึกโปรไฟล์สำเร็จ", "สำเร็จ");
        onClose();
      } else {
        setErrorMessage(res?.message || "ไม่สามารถบันทึกโปรไฟล์ได้");
        toast.error(res?.message || "ไม่สามารถบันทึกโปรไฟล์ได้", "ข้อผิดพลาด");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึก";
      setErrorMessage(msg);
      toast.error(msg, "ข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-white/[0.12] bg-neutral-950 p-6 text-white shadow-2xl shadow-[0_16px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)]">
        {/* Top highlight (3D specular line) */}
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/20" />

        {/* Radial soft glow */}
        <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-blue-500/[0.08] blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
              <User size={18} />
            </div>
            <div>
              <h3 className="text-base text-white tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)]">
                ตั้งค่าบัญชี
              </h3>
              <p className="text-xs text-neutral-400">
                ปรับแต่งชื่อ รูปโปรไฟล์ และการเชื่อมต่อ Proxy สำหรับ {account.name}
              </p>
            </div>
          </div>

          <ButtonUI
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting || isTestingProxy}
            className="h-8 w-8 rounded-lg p-0 text-neutral-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X size={18} />
          </ButtonUI>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-neutral-900/90 p-1 border border-white/[0.08] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
          <ButtonUI
            type="button"
            variant="ghost"
            onClick={() => setActiveTab("profile")}
            className={`
              flex items-center justify-center gap-2 rounded-lg py-2 text-xs transition-all
              ${
                activeTab === "profile"
                  ? "!bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
              }
            `}
          >
            <User size={14} />
            <span>ปรับแต่งผู้ใช้งาน</span>
          </ButtonUI>

          <ButtonUI
            type="button"
            variant="ghost"
            onClick={() => setActiveTab("connection")}
            className={`
              relative flex items-center justify-center gap-2 rounded-lg py-2 text-xs transition-all
              ${
                activeTab === "connection"
                  ? "!bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
              }
            `}
          >
            <Network size={14} />
            <span>ตั้งค่าการเชื่อมต่อ</span>
            {proxy.trim() && (
              <span
                title="ตั้งค่า Proxy แล้ว"
                className="h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20"
              />
            )}
          </ButtonUI>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* TAB 1: ปรับแต่งผู้ใช้งาน */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Aspect Square Avatar Preview */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase tracking-wider text-neutral-300">
                    รูปภาพโปรไฟล์
                  </label>
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`
                    relative aspect-square w-full overflow-hidden rounded-2xl border transition-all duration-200
                    ${
                      isDragOver
                        ? "border-blue-400 bg-blue-500/[0.08]"
                        : avatarUrl
                        ? "border-neutral-800 bg-neutral-950 shadow-[0_6px_16px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]"
                        : "border-dashed border-white/[0.12] bg-neutral-900/60 hover:border-white/25 hover:bg-neutral-900"
                    }
                  `}
                >
                  {avatarUrl ? (
                    <div className="relative group/avatar h-full w-full">
                      {isValidImageUrl(avatarUrl) ? (
                        <Image
                          src={avatarUrl}
                          alt="Avatar Preview"
                          fill
                          unoptimized={avatarUrl.startsWith("http") || avatarUrl.startsWith("data:")}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-neutral-400">
                          <User size={48} />
                        </div>
                      )}

                      <ButtonUI
                        type="button"
                        variant="ghost"
                        onClick={() => fileInputRef.current?.click()}
                        title="เปลี่ยนรูปภาพ"
                        className="
                          absolute inset-0 flex flex-col items-center justify-center gap-1
                          bg-black/60 opacity-0 group-hover/avatar:opacity-100
                          transition-opacity duration-150 backdrop-blur-xs text-xs text-white rounded-none
                        "
                      >
                        <Camera size={20} />
                        <span>เปลี่ยนรูป</span>
                      </ButtonUI>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center cursor-pointer select-none"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08] text-neutral-400">
                        <Upload size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-200">
                          คลิกเพื่ออัปโหลด
                        </p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          หรือลากไฟล์ภาพมาวางที่นี่
                        </p>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>

                {avatarUrl && (
                  <ButtonUI
                    type="button"
                    variant="ghost"
                    onClick={handleRemoveImage}
                    className="mt-2 flex items-center justify-center gap-1.5 px-2 py-1 text-[11px] text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={12} />
                    <span>ลบรูปภาพ</span>
                  </ButtonUI>
                )}
              </div>

              {/* Form inputs on right */}
              <div className="flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-neutral-300 mb-1.5 block">
                      ชื่อบัญชี (Display Name) <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ระบุชื่อเรียกบัญชี..."
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-neutral-300 mb-1.5 block">
                      Facebook ID
                    </label>
                    <Input
                      type="text"
                      value={account.fbId || account.id}
                      disabled
                      className="text-xs font-mono opacity-60"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                    <div>
                      <span className="text-xs text-neutral-200 block">
                        สถานะการทำงาน
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {isActive ? "เปิดใช้งานในระบบ" : "ปิดการใช้งานชั่วคราว"}
                      </span>
                    </div>
                    <Toggle
                      checked={isActive}
                      onCheckedChange={setIsActive}
                      size="sm"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-xs text-red-400">{errorMessage}</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ตั้งค่าการเชื่อมต่อ Proxy */}
          {activeTab === "connection" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-300 mb-1.5 flex items-center justify-between">
                  <span>พร็อกซี (Proxy Connection)</span>
                  <span className="text-[10px] text-neutral-500 font-normal">
                    (ไม่บังคับ)
                  </span>
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={proxy}
                    onChange={(e) => {
                      setProxy(e.target.value);
                      setProxyTestResult(null);
                    }}
                    placeholder="ip:port หรือ ip:port:user:pass"
                    className="flex-1 font-mono text-xs"
                  />
                  <ButtonUI
                    type="button"
                    variant="secondary"
                    onClick={handleTestProxy}
                    disabled={isTestingProxy || !proxy.trim()}
                    className="gap-1.5 shrink-0 px-3 py-1.5 text-xs"
                  >
                    {isTestingProxy ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Globe size={13} />
                    )}
                    <span>ทดสอบ</span>
                  </ButtonUI>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1.5">
                  รูปแบบที่รองรับ: <code className="text-neutral-400">127.0.0.1:8080</code> หรือ{" "}
                  <code className="text-neutral-400">127.0.0.1:8080:username:password</code>
                </p>
              </div>

              {proxyTestResult && (
                <div
                  className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${
                    proxyTestResult.success
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-red-500/30 bg-red-500/10 text-red-300"
                  }`}
                >
                  {proxyTestResult.success ? (
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  )}
                  <span>{proxyTestResult.message}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
            <ButtonUI
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-xs"
            >
              ยกเลิก
            </ButtonUI>

            <ButtonUI
              type="submit"
              disabled={isSubmitting}
              className="gap-1.5 px-3 py-1.5 text-xs !bg-blue-600 hover:!bg-blue-500 !border-blue-500 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <Check size={13} strokeWidth={2.5} />
                  <span>บันทึกการตั้งค่า</span>
                </>
              )}
            </ButtonUI>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
