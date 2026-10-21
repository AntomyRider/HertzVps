"use client";

import React, { useEffect, useState } from "react";
import { Link as LinkIcon, Share2, Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

export interface LinkPreviewData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  domain?: string;
  url?: string;
}

export function countCommentLines(text: string): number {
  if (!text) return 0;
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean).length;
}

/* ========================================================================= */
/* 1. GroupFormShare (Left Column for Share Mode)                           */
/* ========================================================================= */

interface GroupFormShareProps {
  shareUrl: string;
  onChangeShareUrl: (url: string) => void;
  errorShare: string | null;
  disabled?: boolean;
}

export function GroupFormShare({
  shareUrl,
  onChangeShareUrl,
  errorShare,
  disabled = false,
}: GroupFormShareProps) {
  const [preview, setPreview] = useState<{
    loading: boolean;
    data?: LinkPreviewData;
    error?: string;
  }>({ loading: false });

  useEffect(() => {
    const url = shareUrl.trim();
    if (!url) {
      setPreview({ loading: false });
      return;
    }
    if (!/^https?:\/\/\S+$/i.test(url)) {
      setPreview({
        loading: false,
        error: "รูปแบบลิงก์ยังไม่ถูกต้อง (ต้องขึ้นต้นด้วย http:// หรือ https://)",
      });
      return;
    }

    let cancelled = false;
    setPreview({ loading: true });

    const timer = setTimeout(async () => {
      try {
        const { data } = await axios.get<{
          success: boolean;
          data?: LinkPreviewData;
          message?: string;
          error?: string;
        }>(`/api/v1/public/controller/link-preview?url=${encodeURIComponent(url)}`);

        if (cancelled) return;

        if (data.success && data.data) {
          setPreview({ loading: false, data: data.data });
        } else {
          setPreview({
            loading: false,
            data: data.data,
            error: data.message || data.error || "โหลด preview ไม่สำเร็จ — ลิงก์ยังใช้งานได้ตามปกติ",
          });
        }
      } catch {
        if (!cancelled) {
          try {
            const domain = new URL(url).hostname.replace(/^www\./i, "");
            setPreview({
              loading: false,
              data: { title: domain, domain, url },
              error: "ไม่สามารถดึงภาพตัวอย่างได้ — ลิงก์ยังใช้ได้ตามปกติ",
            });
          } catch {
            setPreview({
              loading: false,
              error: "โหลด preview ไม่ได้ — ลิงก์ยังใช้งานได้ตามปกติ",
            });
          }
        }
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [shareUrl]);

  return (
    <div className="flex flex-1 min-h-[260px] md:min-h-0 flex-col space-y-3">
      {/* Input Share URL */}
      <div className="shrink-0 space-y-1">
        <label className="block text-xs font-medium text-neutral-200">
          ลิงก์ที่ต้องการแชร์<span className="text-red-400">*</span>
        </label>
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border bg-neutral-900/90 px-3 py-1 transition-colors",
            errorShare
              ? "border-red-500/60 focus-within:border-red-400"
              : "border-neutral-800 focus-within:border-violet-500"
          )}
        >
          <LinkIcon className="h-3.5 w-3.5 shrink-0 text-violet-400/80" />
          <input
            type="text"
            inputMode="url"
            placeholder="วางลิงก์ เช่น https://example.com/product"
            value={shareUrl}
            onChange={(e) => {
              const singleLine = e.target.value.replace(/\r?\n/g, "");
              onChangeShareUrl(singleLine);
            }}
            disabled={disabled}
            spellCheck={false}
            className="w-full bg-transparent py-1.5 text-xs text-white placeholder-neutral-500 outline-none"
          />
        </div>
        {errorShare && (
          <p className="text-[11px] text-red-400">{errorShare}</p>
        )}
      </div>

      {/* Preview Card Box */}
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col rounded-xl border p-3.5 transition-colors",
          errorShare
            ? "border-red-500/40 bg-red-950/10"
            : "border-neutral-800/80 bg-neutral-900/40"
        )}
      >
        <div className="flex items-center justify-between shrink-0">
          <label className="text-xs font-medium text-neutral-200">
            ตัวอย่างการ์ดแชร์
          </label>
        </div>

        <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto">
          {preview.loading ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-xs text-neutral-400">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-violet-400" />
              <span>กำลังโหลดตัวอย่างลิงก์...</span>
            </div>
          ) : preview.data?.title ? (
            <div className="flex gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
              {preview.data.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.data.image}
                  alt={preview.data.title || "Preview"}
                  className="h-16 w-16 shrink-0 rounded-md border border-neutral-800 bg-neutral-900 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-violet-400/80">
                  <Share2 className="h-6 w-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-neutral-100">
                  {preview.data.title || preview.data.domain}
                </p>
                {preview.data.description && (
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-neutral-400">
                    {preview.data.description}
                  </p>
                )}
                <p className="mt-1 truncate text-[10px] text-violet-300/80 font-mono">
                  {preview.data.siteName || preview.data.domain}
                </p>
              </div>
            </div>
          ) : preview.error ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="text-xs font-medium text-amber-300">
                โหลดตัวอย่างการ์ดไม่สำเร็จ
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-400">
                {preview.error}
              </p>
              {shareUrl.trim() && (
                <p className="mt-1.5 truncate text-[10px] text-neutral-500 font-mono">
                  {shareUrl.trim()}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-800 py-6 text-center text-xs text-neutral-500">
              <Share2 className="mb-1.5 h-6 w-6 text-neutral-600" />
              <span>วางลิงก์เพื่อดูตัวอย่างของการ์ด</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 2. GroupFormBoostLeft (Left Column for Boost Mode)                        */
/* ========================================================================= */

interface GroupFormBoostLeftProps {
  boostLinks: string;
  onChangeBoostLinks: (val: string) => void;
  errorBoostLinks: string | null;
  disabled?: boolean;
}

export function GroupFormBoostLeft({
  boostLinks,
  onChangeBoostLinks,
  errorBoostLinks,
  disabled = false,
}: GroupFormBoostLeftProps) {
  const lineCount = countCommentLines(boostLinks);

  return (
    <div className="flex flex-1 min-h-[260px] md:min-h-0 flex-col rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-950/60 px-3 py-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-white">
          <LinkIcon className="h-3.5 w-3.5 text-amber-400" />
          <span>ลิงก์โพสต์เป้าหมาย<span className="text-red-400">*</span></span>
        </div>
        <span className="text-[11px] font-mono text-neutral-500">
          ทั้งหมด {lineCount} ลิงก์
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-3">
        <div className="mb-1.5 flex shrink-0 items-center justify-between text-xs text-neutral-400">
          <span>รายการลิงก์โพสต์ที่ต้องการดัน (1 บรรทัดต่อ 1 ลิงก์)</span>
        </div>

        <textarea
          placeholder={"https://www.facebook.com/groups/123456789/posts/987654321\nhttps://www.facebook.com/share/p/xxxxxx"}
          value={boostLinks}
          onChange={(e) => onChangeBoostLinks(e.target.value)}
          disabled={disabled}
          className={cn(
            "min-h-0 w-full flex-1 resize-none rounded-lg border bg-neutral-900/90 p-3 text-xs leading-normal text-white placeholder-neutral-500 outline-none transition-colors overflow-y-auto",
            errorBoostLinks
              ? "border-red-500/60 focus:border-red-400"
              : "border-neutral-800 focus:border-amber-500"
          )}
        />
        {errorBoostLinks && (
          <p className="mt-1 shrink-0 text-xs text-red-400">{errorBoostLinks}</p>
        )}
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 3. GroupFormBoostRight (Right Column for Boost Mode)                      */
/* ========================================================================= */

interface GroupFormBoostRightProps {
  boostComments: string;
  onChangeBoostComments: (val: string) => void;
  errorBoostComments: string | null;
  disabled?: boolean;
}

export function GroupFormBoostRight({
  boostComments,
  onChangeBoostComments,
  errorBoostComments,
  disabled = false,
}: GroupFormBoostRightProps) {
  const lineCount = countCommentLines(boostComments);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-1.5 flex shrink-0 items-center justify-between text-xs text-neutral-400">
        <span>ข้อความคอมเมนต์ — บอทสุ่ม 1 บรรทัดต่อ 1 โพสต์เป้าหมาย<span className="text-red-400">*</span></span>
        <span className="text-[11px] font-mono text-neutral-500">
          {lineCount} คอมเมนต์
        </span>
      </div>

      <textarea
        placeholder={"พิมพ์ 1 บรรทัดต่อ 1 คอมเมนต์ เช่น\nสนใจครับ สอบถามรายละเอียด\nราคาเท่าไหร่ครับ\nสวยมากครับ"}
        value={boostComments}
        onChange={(e) => onChangeBoostComments(e.target.value)}
        disabled={disabled}
        className={cn(
          "min-h-0 w-full flex-1 resize-none rounded-lg border bg-neutral-900/90 p-3 text-xs leading-normal text-white placeholder-neutral-500 outline-none transition-colors overflow-y-auto",
          errorBoostComments
            ? "border-red-500/60 focus:border-red-400"
            : "border-neutral-800 focus:border-amber-500"
        )}
      />
      {errorBoostComments && (
        <p className="mt-1 shrink-0 text-xs text-red-400">{errorBoostComments}</p>
      )}
    </div>
  );
}
