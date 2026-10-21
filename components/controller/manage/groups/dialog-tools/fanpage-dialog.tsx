"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Flag,
  X,
  Loader2,
  ExternalLink,
  Check,
  RefreshCw,
  Search,
  ArrowLeft,
  User,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import ButtonUI from "@/components/ui/button";
import Input from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useControllerStore } from "@/store/controllerStore";
import { isValidImageUrl } from "@/lib/utils";

export interface FanpageItem {
  id: string;
  name: string;
  avatar?: string;
  link?: string;
  category?: string;
  followers?: string;
}

export interface FanpageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  accountId?: string;
}

export default function FanpageDialog({
  isOpen,
  onClose,
  onBack,
  accountId,
}: FanpageDialogProps) {
  const { sendToolCommand } = useControllerStore();

  const [fanpages, setFanpages] = useState<FanpageItem[]>([]);
  const [selectedPage, setSelectedPage] = useState<FanpageItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [statusText, setStatusText] = useState("");

  const lastToolEvent = useControllerStore((state) => state.lastToolEvent);

  useEffect(() => {
    if (!lastToolEvent || !isOpen) return;
    if (lastToolEvent.userId && accountId && String(lastToolEvent.userId) !== String(accountId)) return;

    if (lastToolEvent.tool === "GET_FANPAGES") {
      if (lastToolEvent.type === "completed" && Array.isArray(lastToolEvent.data)) {
        setIsScanning(false);
        setStatusText("");
        setFanpages(lastToolEvent.data as FanpageItem[]);
        toast.success(`พบแฟนเพจทั้งหมด ${lastToolEvent.data.length} เพจ`, "สำเร็จ");
      } else if (lastToolEvent.type === "error") {
        setIsScanning(false);
        setStatusText("");
        toast.error(
          typeof lastToolEvent.message === "string"
            ? lastToolEvent.message
            : "เกิดข้อผิดพลาดในการดึงแฟนเพจ",
          "ข้อผิดพลาด"
        );
      }
    } else if (lastToolEvent.tool === "IMPORT_FANPAGE") {
      setIsImporting(false);
      if (lastToolEvent.type === "completed") {
        toast.success(
          typeof lastToolEvent.message === "string"
            ? lastToolEvent.message
            : "นำเข้าแฟนเพจสำเร็จ",
          "สำเร็จ"
        );
        onClose();
      } else if (lastToolEvent.type === "error") {
        toast.error(
          typeof lastToolEvent.message === "string"
            ? lastToolEvent.message
            : "ไม่สามารถนำเข้าเพจนี้ได้",
          "ข้อผิดพลาด"
        );
      }
    }
  }, [lastToolEvent, isOpen, accountId, onClose]);

  const handleScanFanpages = async () => {
    if (!accountId) {
      toast.error("ไม่พบบัญชีผู้ใช้เป้าหมาย");
      return;
    }

    setIsScanning(true);
    setStatusText("ส่งคำสั่งสแกนเพจไปยังตัวโปรแกรม...");
    setSelectedPage(null);

    try {
      const res = await sendToolCommand("GET_FANPAGES", accountId);
      if (res?.success) {
        toast.info("ตัวโปรแกรมกำลังดึงรายชื่อแฟนเพจ...", "สแกนเพจ");
      } else {
        setIsScanning(false);
        setStatusText("");
        toast.error(res?.message || "ไม่สามารถสแกนเพจได้", "ข้อผิดพลาด");
      }
    } catch (err: unknown) {
      setIsScanning(false);
      setStatusText("");
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      toast.error(msg, "ข้อผิดพลาด");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFanpages([]);
      setSelectedPage(null);
      setSearchQuery("");
      setStatusText("");
      setIsImporting(false);
      void handleScanFanpages();
    }
  }, [isOpen, accountId]);

  const filteredPages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return fanpages;
    return fanpages.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.link && p.link.toLowerCase().includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q))
    );
  }, [fanpages, searchQuery]);

  const handleImport = async () => {
    if (!accountId || !selectedPage) {
      toast.error("กรุณาเลือกเพจที่ต้องการนำเข้า");
      return;
    }

    setIsImporting(true);
    try {
      const res = await sendToolCommand("IMPORT_FANPAGE", accountId, {
        fanpage: selectedPage,
      });

      if (res?.success) {
        toast.success(`นำเข้าเพจ "${selectedPage.name}" สำเร็จเรียบร้อยแล้ว`, "สำเร็จ");
        onClose();
      } else {
        toast.error(res?.message || "ไม่สามารถนำเข้าเพจนี้ได้", "ข้อผิดพลาด");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการนำเข้า";
      toast.error(msg, "ข้อผิดพลาด");
    } finally {
      setIsImporting(false);
    }
  };

  const isInitialEmpty = fanpages.length === 0 && !isScanning;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isScanning && !isImporting && onClose()}>
      <div
        className={`
          relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl
          border border-white/[0.12] bg-neutral-950
          shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.12)]
          transition-all duration-300 ease-out
          ${
            isInitialEmpty
              ? "h-auto max-h-[82dvh]"
              : "h-[82dvh] sm:h-[620px] max-h-[680px]"
          }
        `}
      >
        {/* Specular highlight & Blue glow */}
        <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white/20" />
        <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 sm:px-6 sm:py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
              <Flag className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base text-white tracking-tight">
                  ดึงบัญชีเพจ
                </h2>
                {fanpages.length > 0 && (
                  <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] sm:text-[11px] text-blue-300">
                    {fanpages.length} เพจ
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] sm:text-xs text-neutral-400 line-clamp-1 sm:line-clamp-none">
                สแกนแฟนเพจ Facebook ที่บัญชีนี้ดูแลอยู่ เพื่อนำเข้าเป็นบัญชีโพสต์กลุ่ม
              </p>
            </div>
          </div>

          <ButtonUI
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isScanning || isImporting}
            className="h-8 w-8 !rounded-lg p-0 text-neutral-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </ButtonUI>
        </div>

        {/* Status banner */}
        {statusText && (
          <div className="mx-4 sm:mx-6 mt-3 flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3.5 py-2 text-xs text-blue-300 shrink-0">
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            <span>{statusText}</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 gap-3">
          <div className="flex items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อเพจหรือ ID..."
                className="w-full pl-8 py-1.5 text-xs !rounded-xl"
              />
            </div>

            <ButtonUI
              type="button"
              variant="secondary"
              onClick={handleScanFanpages}
              disabled={isScanning}
              className="gap-1.5 shrink-0 px-3 py-1.5 text-xs !rounded-xl !bg-white/5 hover:!bg-white/10 !border-white/10 text-neutral-300"
            >
              <RefreshCw size={13} className={isScanning ? "animate-spin" : ""} />
              <span>สแกนใหม่</span>
            </ButtonUI>
          </div>

          {/* List */}
          <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-white/[0.08] bg-white/[0.02] p-2 space-y-1.5">
            {isScanning ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center text-xs text-neutral-500">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                <span>กำลังสแกนหาแฟนเพจจาก Facebook...</span>
              </div>
            ) : filteredPages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center text-xs text-neutral-500">
                <Flag className="h-8 w-8 text-neutral-600 mb-2" />
                <span>{fanpages.length === 0 ? "ไม่พบแฟนเพจที่บัญชีนี้ถือสิทธิ์ดูแลอยู่" : "ไม่พบเพจที่ตรงกับคำค้นหา"}</span>
              </div>
            ) : (
              filteredPages.map((page) => {
                const isSelected = selectedPage?.id === page.id;
                return (
                  <div
                    key={page.id}
                    onClick={() => setSelectedPage(page)}
                    className={`
                      flex items-center justify-between gap-3 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all
                      ${
                        isSelected
                          ? "border-blue-500/50 bg-blue-500/10 text-white"
                          : "border-white/[0.04] bg-white/[0.01] text-neutral-300 hover:border-white/10 hover:bg-white/[0.03]"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {isValidImageUrl(page.avatar) ? (
                        <div className="relative h-9 w-9 rounded-full overflow-hidden shrink-0 border border-white/10">
                          <Image
                            src={page.avatar!}
                            alt={page.name}
                            width={36}
                            height={36}
                            unoptimized={page.avatar!.startsWith("http")}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          <Flag size={16} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <span className="truncate text-white block">{page.name}</span>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5 font-mono">
                          <span>ID: {page.id}</span>
                          {page.category && <span>• {page.category}</span>}
                          {page.followers && <span>• {page.followers} ผู้ติดตาม</span>}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-blue-400">
                      {isSelected ? (
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-neutral-950">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-white/20 bg-white/[0.02]" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-3 sm:px-6 sm:py-3.5 bg-neutral-900/40 shrink-0 gap-2">
          {onBack ? (
            <ButtonUI
              type="button"
              variant="secondary"
              onClick={onBack}
              disabled={isScanning || isImporting}
              className="flex items-center gap-1.5 !rounded-xl px-3 py-2 text-xs text-neutral-300 hover:text-white transition-colors !bg-white/5 hover:!bg-white/10 !border-white/10 shrink-0"
            >
              <ArrowLeft size={13} />
              <span>ย้อนกลับ</span>
            </ButtonUI>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 shrink-0">
            <ButtonUI
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isScanning || isImporting}
              className="px-3.5 py-2 text-xs cursor-pointer whitespace-nowrap !rounded-xl !bg-white/5 hover:!bg-white/10 !border-white/10 text-neutral-300 hover:text-white"
            >
              ปิด
            </ButtonUI>

            <ButtonUI
              type="button"
              onClick={handleImport}
              disabled={isScanning || isImporting || !selectedPage}
              className={`
                gap-1.5 px-3.5 py-2 text-xs cursor-pointer !rounded-xl whitespace-nowrap transition-all
                ${
                  selectedPage
                    ? "!bg-blue-600 hover:!bg-blue-500 !border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.25)]"
                    : "!bg-white/5 !border-white/10 text-neutral-500 cursor-not-allowed opacity-50"
                }
              `}
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>กำลังนำเข้า...</span>
                </>
              ) : (
                <>
                  <Flag size={14} />
                  <span>นำเข้าเป็นบัญชี</span>
                </>
              )}
            </ButtonUI>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
