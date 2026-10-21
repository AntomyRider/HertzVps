"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Copy,
  X,
  User,
  Check,
  CheckSquare,
  Square,
  Loader2,
  Folder,
  Search,
  Link as LinkIcon,
  ArrowLeft,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import ButtonUI from "@/components/ui/button";
import Input from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useControllerStore } from "@/store/controllerStore";
import { isValidImageUrl } from "@/lib/utils";

export interface CopyGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  groupName?: string;
  currentAccountId?: string;
  onSuccess?: () => void;
}

export default function CopyGroupDialog({
  isOpen,
  onClose,
  onBack,
  groupName,
  currentAccountId,
  onSuccess,
}: CopyGroupDialogProps) {
  const { accounts, groupsByAccount, batchCopyGroups } = useControllerStore();

  const [selectedGroupNames, setSelectedGroupNames] = useState<string[]>([]);
  const [selectedTargetAccountId, setSelectedTargetAccountId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ดึงรายการกลุ่มของบัญชีปัจจุบัน
  const sourceGroups = useMemo(() => {
    if (!currentAccountId) return [];
    return groupsByAccount[currentAccountId] || [];
  }, [groupsByAccount, currentAccountId]);

  // เรียงบัญชีตัวเองขึ้นบนสุดเสมอ
  const sortedAccounts = useMemo(() => {
    if (!accounts || accounts.length === 0) return [];
    const currentIdStr = String(currentAccountId || "");
    const self = accounts.find((acc) => String(acc.id) === currentIdStr);
    const others = accounts.filter((acc) => String(acc.id) !== currentIdStr);
    return self ? [self, ...others] : accounts;
  }, [accounts, currentAccountId]);

  // เคลียร์และเซ็ตค่าเริ่มต้นเมื่อเปิด Dialog
  useEffect(() => {
    if (isOpen) {
      if (currentAccountId) {
        setSelectedTargetAccountId(String(currentAccountId));
      } else if (sortedAccounts.length > 0) {
        setSelectedTargetAccountId(String(sortedAccounts[0].id));
      }

      if (groupName) {
        setSelectedGroupNames([groupName]);
      } else if (sourceGroups.length > 0) {
        setSelectedGroupNames(sourceGroups.map((g) => g.name));
      } else {
        setSelectedGroupNames([]);
      }
      setSearchQuery("");
      setIsSubmitting(false);
    }
  }, [isOpen, groupName, currentAccountId, sourceGroups, sortedAccounts]);

  // กรองรายการกลุ่มตามคำค้นหา
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return sourceGroups;
    const q = searchQuery.toLowerCase();
    return sourceGroups.filter((g) => g.name.toLowerCase().includes(q));
  }, [sourceGroups, searchQuery]);

  const handleToggleGroup = (name: string) => {
    setSelectedGroupNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleSelectAll = () => {
    setSelectedGroupNames(sourceGroups.map((g) => g.name));
  };

  const handleDeselectAll = () => {
    setSelectedGroupNames([]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!currentAccountId) {
      toast.error("ไม่พบบัญชีต้นทาง", "ข้อผิดพลาด");
      return;
    }

    if (selectedGroupNames.length === 0) {
      toast.error("กรุณาเลือกกลุ่มที่ต้องการคัดลอกอย่างน้อย 1 กลุ่ม", "ข้อผิดพลาด");
      return;
    }

    if (!selectedTargetAccountId) {
      toast.error("กรุณาเลือกบัญชีปลายทาง", "ข้อผิดพลาด");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await batchCopyGroups(
        currentAccountId,
        selectedTargetAccountId,
        selectedGroupNames
      );

      if (res?.success) {
        toast.success(
          res.message || `คัดลอกสำเร็จ ${res.count || selectedGroupNames.length} กลุ่ม`,
          "สำเร็จ"
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(res?.message || "คัดลอกกลุ่มไม่สำเร็จ", "ข้อผิดพลาด");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการคัดลอก";
      toast.error(msg, "ข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <div className="relative w-full max-w-xl max-h-[85dvh] overflow-y-auto rounded-2xl border border-white/[0.12] bg-neutral-950 p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.12)]">
        {/* Top specular highlight edge & Ambient glow */}
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/20" />
        <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-violet-500/10 blur-2xl" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
              <Copy className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                คัดลอกกลุ่ม
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                เลือกกลุ่มที่ต้องการและระบุปลายทาง (ตัวเอง หรือบัญชีอื่น)
              </p>
            </div>
          </div>

          <ButtonUI
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center !rounded-lg p-0 text-neutral-400 hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-4 w-4" />
          </ButtonUI>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* ส่วนเลือกกลุ่มที่ต้องการคัดลอก */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-neutral-300">
                เลือกกลุ่มที่ต้องการคัดลอก{" "}
                <span className="text-violet-400">
                  ({selectedGroupNames.length}/{sourceGroups.length})
                </span>
              </label>

              <div className="flex items-center gap-2">
                <ButtonUI
                  type="button"
                  variant="ghost"
                  onClick={handleSelectAll}
                  disabled={isSubmitting || sourceGroups.length === 0}
                  className="px-2 py-0.5 text-[11px] text-violet-400 hover:text-violet-300"
                >
                  เลือกทั้งหมด
                </ButtonUI>
                <span className="text-neutral-600 text-xs">|</span>
                <ButtonUI
                  type="button"
                  variant="ghost"
                  onClick={handleDeselectAll}
                  disabled={isSubmitting || selectedGroupNames.length === 0}
                  className="px-2 py-0.5 text-[11px] text-neutral-400 hover:text-neutral-300"
                >
                  ล้างการเลือก
                </ButtonUI>
              </div>
            </div>

            {/* ช่องค้นหากลุ่ม (ถ้ามีมากกว่า 4 กลุ่ม) */}
            {sourceGroups.length > 4 && (
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อกลุ่ม..."
                  className="w-full pl-8 py-1 text-xs"
                />
              </div>
            )}

            {/* รายการกลุ่ม */}
            <div className="max-h-48 overflow-y-auto rounded-xl border border-white/[0.08] bg-white/[0.02] p-2 pr-1.5">
              {sourceGroups.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-500">
                  ไม่มีกลุ่มโพสต์ในบัญชีนี้
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-500">
                  ไม่พบกลุ่มที่ตรงกับคำค้นหา
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredGroups.map((g) => {
                    const isChecked = selectedGroupNames.includes(g.name);
                    const linkCount = g.links
                      ? g.links.split("\n").map((l) => l.trim()).filter(Boolean).length
                      : 0;
                    const imageCount = Array.isArray(g.images)
                      ? g.images.length
                      : g.image
                      ? 1
                      : 0;

                    return (
                      <div
                        key={g.id || g.name}
                        onClick={() => handleToggleGroup(g.name)}
                        className={`
                          flex items-center justify-between gap-2 rounded-lg border p-2 transition-all cursor-pointer select-none
                          ${
                            isChecked
                              ? "border-violet-500/40 bg-violet-500/10 text-white shadow-sm"
                              : "border-white/[0.04] bg-white/[0.01] text-neutral-300 hover:border-white/10 hover:bg-white/[0.03]"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="shrink-0 text-violet-400">
                            {isChecked ? (
                              <CheckSquare className="h-4 w-4 stroke-[2.5]" />
                            ) : (
                              <Square className="h-4 w-4 text-neutral-500" />
                            )}
                          </div>
                          <Folder className="h-4 w-4 shrink-0 text-neutral-400" />
                          <span className="truncate text-xs" title={g.name}>
                            {g.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 text-[10px] text-neutral-400">
                          {linkCount > 0 && (
                            <span className="rounded-md items-center flex gap-1 bg-white/[0.05] px-1.5 py-0.5 border border-white/10 text-[10px]">
                              <LinkIcon className="h-2.5 w-2.5" /> {linkCount}
                            </span>
                          )}
                          {imageCount > 0 && (
                            <span className="rounded-full bg-white/[0.05] px-1.5 py-0.5 border border-white/10 text-[9px]">
                              {imageCount} รูป
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* เลือกปลายทางสำหรับกลุ่มที่เลือก (แสดงโปรไฟล์ทั้งหมด เรียงตัวเองอยู่บนสุดเสมอ) */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs text-neutral-300">
                เลือกปลายทางสำหรับกลุ่มที่เลือก
              </label>
              <span className="text-[11px] text-neutral-500">
                {sortedAccounts.length} บัญชีในระบบ
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto rounded-xl border border-white/[0.08] bg-white/[0.02] p-2 pr-1.5">
              {sortedAccounts.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-500">
                  ไม่พบข้อมูลบัญชีในระบบ
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sortedAccounts.map((account) => {
                    const isSelf = String(account.id) === String(currentAccountId || "");
                    const isSelected = String(account.id) === String(selectedTargetAccountId);

                    return (
                      <div
                        key={account.id}
                        onClick={() => setSelectedTargetAccountId(String(account.id))}
                        className={`
                          flex items-center justify-between gap-2 rounded-lg border p-2 transition-all cursor-pointer select-none
                          ${
                            isSelected
                              ? "border-violet-500/50 bg-violet-500/10 text-white shadow-sm"
                              : "border-white/[0.04] bg-white/[0.01] text-neutral-300 hover:border-white/10 hover:bg-white/[0.03]"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {isValidImageUrl(account.avatar) ? (
                            <div className="relative h-7 w-7 rounded-full overflow-hidden shrink-0 border border-white/10">
                              <Image
                                src={account.avatar!}
                                alt={account.name}
                                width={28}
                                height={28}
                                unoptimized={account.avatar!.startsWith("http")}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs text-neutral-300 border border-white/10">
                              {account.name?.charAt(0) || <User className="h-3.5 w-3.5 text-neutral-400" />}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-xs">{account.name}</span>
                              {isSelf && (
                                <span className="shrink-0 rounded-full border border-violet-500/30 bg-violet-500/15 px-1.5 py-0.2 text-[9px] text-violet-300">
                                  ตัวเอง
                                </span>
                              )}
                            </div>
                            <div className="truncate text-[10px] text-neutral-500 font-mono">
                              ID: {account.fbId || account.id}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-violet-400">
                          {isSelected ? (
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-neutral-950">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-white/20 bg-white/[0.02]" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-5 flex items-center justify-between gap-2 pt-3 border-t border-white/[0.08]">
            {onBack ? (
              <ButtonUI
                type="button"
                variant="secondary"
                onClick={onBack}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
                className="cursor-pointer px-3.5 py-2 text-xs whitespace-nowrap !rounded-xl !bg-white/5 hover:!bg-white/10 !border-white/10 text-neutral-300 hover:text-white"
              >
                ปิดหน้าต่าง
              </ButtonUI>

              <ButtonUI
                type="submit"
                disabled={isSubmitting || selectedGroupNames.length === 0}
                className={`
                  cursor-pointer gap-1.5 px-3.5 py-2 text-xs !rounded-xl whitespace-nowrap transition-all
                  ${
                    selectedGroupNames.length > 0
                      ? "!bg-violet-600 hover:!bg-violet-500 !border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]"
                      : "!bg-white/5 !border-white/10 text-neutral-500 cursor-not-allowed opacity-50"
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>กำลังคัดลอก...</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>
                      คัดลอก {selectedGroupNames.length > 0 ? `(${selectedGroupNames.length})` : ""}
                    </span>
                  </>
                )}
              </ButtonUI>
            </div>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
