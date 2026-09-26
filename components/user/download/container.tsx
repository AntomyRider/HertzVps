"use client";

import { useEffect } from "react";
import {
  Download,
  Calendar,
  Package,
  Tag,
  RefreshCw,
  FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ButtonUI from "@/components/ui/button";
import FadeIn from "@/components/ui/fade-in";
import { useDownloadStore, ReleaseAsset } from "@/store/downloadStore";

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes <= 0) return "ไม่ระบุขนาด";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
};

const formatThaiDate = (isoString: string) => {
  if (!isoString) return "-";
  try {
    return new Date(isoString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
};

const DownloadContainer = () => {
  const {
    releases,
    isLoading,
    error,
    selectedRelease,
    setSelectedRelease,
    fetchReleases,
  } = useDownloadStore();

  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl pb-12 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="w-full md:w-64 shrink-0 space-y-2 rounded-md bg-neutral-950 p-3">
            <div className="h-4 w-28 animate-pulse rounded-sm bg-neutral-900" />
            <div className="h-10 w-full animate-pulse rounded-sm bg-neutral-900" />
            <div className="h-10 w-full animate-pulse rounded-sm bg-neutral-900" />
          </div>

          <div className="flex-1 rounded-md bg-neutral-950 p-5 space-y-4">
            <div className="h-7 w-48 animate-pulse rounded-sm bg-neutral-900" />
            <div className="h-4 w-64 animate-pulse rounded-sm bg-neutral-900" />
            <div className="h-28 w-full animate-pulse rounded-sm bg-neutral-900" />
            <div className="h-10 w-40 animate-pulse rounded-sm bg-neutral-900" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <FadeIn direction="up" className="mx-auto w-full max-w-2xl pb-12">
        <div className="rounded-md bg-neutral-950 p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-neutral-900 text-neutral-400">
            <Package size={20} strokeWidth={1.8} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">{error}</p>
            <p className="text-xs text-neutral-400">
              กรุณาลองกดรีเฟรชข้อมูลใหม่อีกครั้ง
            </p>
          </div>
          <div className="flex items-center justify-center pt-2">
            <ButtonUI
              onClick={() => fetchReleases()}
              className="rounded-sm bg-blue-600 hover:bg-blue-500 gap-2 text-xs px-4 py-2"
            >
              <RefreshCw size={14} strokeWidth={1.8} />
              <span>ลองใหม่อีกครั้ง</span>
            </ButtonUI>
          </div>
        </div>
      </FadeIn>
    );
  }

  if (releases.length === 0) {
    return (
      <FadeIn direction="up" className="mx-auto w-full max-w-2xl pb-12">
        <div className="rounded-md bg-neutral-950 p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-neutral-900 text-neutral-500">
            <Package size={20} strokeWidth={1.8} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">
              ยังไม่มีรายการเวอร์ชันที่เปิดให้ดาวน์โหลด
            </p>
            <p className="text-xs text-neutral-500">
              เมื่อมีการอัปเดตไฟล์ติดตั้ง (.exe) ระบบจะแสดงรายการที่หน้านี้โดยอัตโนมัติ
            </p>
          </div>
        </div>
      </FadeIn>
    );
  }

  const activeRelease = selectedRelease || releases[0];
  const isLatest = activeRelease.id === releases[0]?.id;
  const primaryExeAsset = activeRelease.assets[0] || null;

  return (
    <div className="mx-auto w-full max-w-5xl pb-12 space-y-5">
      <div className="flex flex-col md:flex-row items-stretch md:items-start gap-4 md:gap-6">
        {/* Left Sidebar: Version Selector */}
        <FadeIn
          direction="right"
          duration={550}
          className="w-full md:w-64 shrink-0 rounded-md bg-neutral-950 p-2.5 space-y-2"
        >
          <div className="flex items-center justify-between px-2.5 py-1.5">
            <p className="text-xs font-semibold text-neutral-400">
              เวอร์ชันทั้งหมด ({releases.length})
            </p>
            <button
              type="button"
              onClick={() => fetchReleases()}
              title="รีเฟรชข้อมูล"
              className="flex h-7 w-7 items-center justify-center rounded-sm bg-neutral-900 text-neutral-400 transition hover:bg-blue-500/10 hover:text-blue-400 cursor-pointer"
            >
              <RefreshCw size={13} strokeWidth={1.8} />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            {releases.map((release, index) => {
              const isSelected = activeRelease.id === release.id;
              return (
                <button
                  key={release.id}
                  type="button"
                  onClick={() => setSelectedRelease(release)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-sm px-3 py-2.5 text-left text-xs font-medium transition cursor-pointer",
                    isSelected
                      ? "bg-blue-500/10 text-blue-500"
                      : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Tag size={14} strokeWidth={1.8} className="shrink-0" />
                    <span className="truncate font-semibold">
                      {release.tagName}
                    </span>
                  </div>

                  {index === 0 && (
                    <span className="inline-flex items-center rounded-sm bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 shrink-0">
                      ล่าสุด
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </FadeIn>

        {/* Right Content: Selected Release Details & Direct EXE Download */}
        <FadeIn
          direction="up"
          delay={80}
          duration={550}
          className="flex-1 rounded-md bg-neutral-950 p-4 sm:p-5 space-y-5"
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {activeRelease.name || activeRelease.tagName}
                </h2>
                {isLatest && (
                  <span className="inline-flex items-center rounded-sm bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-500">
                    เวอร์ชันล่าสุด
                  </span>
                )}
                {activeRelease.prerelease && (
                  <span className="inline-flex items-center rounded-sm bg-neutral-900 px-2.5 py-0.5 text-xs font-semibold text-neutral-400">
                    Pre-release
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                <span className="inline-flex items-center gap-1.5">
                  <Tag size={14} strokeWidth={1.8} className="text-neutral-500" />
                  <span>เวอร์ชัน: {activeRelease.tagName}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar
                    size={14}
                    strokeWidth={1.8}
                    className="text-neutral-500"
                  />
                  <span>
                    อัปเดตเมื่อ: {formatThaiDate(activeRelease.publishedAt)}
                  </span>
                </span>
              </div>
            </div>

            {primaryExeAsset ? (
              <a
                href={primaryExeAsset.downloadUrl}
                download={primaryExeAsset.name}
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-blue-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-blue-500 shrink-0"
              >
                <Download size={15} strokeWidth={1.8} />
                <span>ดาวน์โหลด (.exe)</span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-neutral-900 px-4 py-2.5 text-xs font-medium text-neutral-500 cursor-not-allowed shrink-0"
              >
                <Download size={15} strokeWidth={1.8} />
                <span>ยังไม่มีไฟล์ .exe</span>
              </button>
            )}
          </div>

          {/* Direct EXE Files Section */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-neutral-400">
              ไฟล์ติดตั้งโปรแกรม (.exe) ({activeRelease.assets.length})
            </p>

            {activeRelease.assets.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5">
                {activeRelease.assets.map((asset: ReleaseAsset, idx: number) => (
                  <FadeIn key={asset.id} direction="up" delay={idx * 60}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md bg-neutral-900/50 p-3.5 transition hover:bg-neutral-900">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-950 text-blue-400">
                          <FileDown size={18} strokeWidth={1.8} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {asset.name}
                          </p>
                          <p className="text-xs text-neutral-400">
                            ขนาดไฟล์: {formatFileSize(asset.size)} • ดาวน์โหลดแล้ว{" "}
                            {asset.downloadCount.toLocaleString("th-TH")} ครั้ง
                          </p>
                        </div>
                      </div>

                      <a
                        href={asset.downloadUrl}
                        download={asset.name}
                        className="inline-flex items-center justify-center gap-2 rounded-sm bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-500 shrink-0"
                      >
                        <Download size={14} strokeWidth={1.8} />
                        <span>ดาวน์โหลด .exe</span>
                      </a>
                    </div>
                  </FadeIn>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-md bg-neutral-900/50 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-950 text-neutral-500">
                  <Package size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    ยังไม่มีไฟล์ติดตั้ง (.exe) ในเวอร์ชัน {activeRelease.tagName}
                  </p>
                  <p className="text-xs text-neutral-400">
                    เมื่ออัปโหลดไฟล์ .exe ใน Release ของเวอร์ชันนี้ ปุ่มดาวน์โหลดจะเปิดใช้งานทันทีโดยอัตโนมัติ
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Release Notes / Description */}
          <FadeIn direction="up" delay={140} className="space-y-2">
            <p className="text-xs font-semibold text-neutral-400">
              รายละเอียดการอัปเดต (Release Notes)
            </p>
            <div className="rounded-md bg-neutral-900/50 p-4">
              {activeRelease.body ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">
                  {activeRelease.body}
                </p>
              ) : (
                <p className="text-xs text-neutral-500">
                  ไม่มีรายละเอียดเพิ่มเติมสำหรับเวอร์ชันนี้
                </p>
              )}
            </div>
          </FadeIn>
        </FadeIn>
      </div>
    </div>
  );
};

export default DownloadContainer;
