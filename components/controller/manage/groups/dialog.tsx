"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Image as ImageIcon,
  X,
  Link as LinkIcon,
  FileText,
  MessageSquare,
  Trash2,
  Share2,
  Rocket,
  Loader2,
  Plus,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import ButtonUI from "@/components/ui/button";
import {
  useControllerStore,
  type ControllerReactionType,
} from "@/store/controllerStore";
import ReactionGroupManageController from "./reaction";
import SettingGroupManageController from "./setting";
import BoostSettingGroupManageController from "./boost-setting";
import {
  GroupFormShare,
  GroupFormBoostLeft,
  GroupFormBoostRight,
  countCommentLines,
} from "./modes";
import { cn } from "@/lib/utils";

interface DialogGroupManageControllerProps {
  accountId: string;
}

type RightTabType = "link" | "content" | "comments";
type GroupPostMode = "post" | "share" | "boost";
type MobileSection = "media" | "editor";

interface GroupFormState {
  name: string;
  images: string[];
  links: string;
  content: string;
  comment: string;
  reaction: ControllerReactionType;
  randomContent: boolean;
  randomImage: boolean;
  randomReaction: boolean;
  postMode: GroupPostMode;
  shareUrl: string;
  boostLinks: string;
  boostComments: string;
  boostRandomComment: boolean;
  boostCommentCount: number;
  activeTab: RightTabType;
}

const INITIAL_GROUP_FORM: GroupFormState = {
  name: "",
  images: [],
  links: "",
  content: "",
  comment: "",
  reaction: "",
  randomContent: false,
  randomImage: false,
  randomReaction: false,
  postMode: "post",
  shareUrl: "",
  boostLinks: "",
  boostComments: "",
  boostRandomComment: false,
  boostCommentCount: 1,
  activeTab: "link",
};

function countContentSegments(text: string): number {
  if (!text || !text.includes("---")) return text.trim() ? 1 : 0;
  return (
    text
      .split(/(?:^|\r?\n)\s*-{3,}\s*(?:\r?\n|$)/)
      .map((s) => s.trim())
      .filter(Boolean).length || 1
  );
}

function countLines(text: string): number {
  if (!text) return 0;
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean).length;
}

export default function DialogGroupManageController({
  accountId,
}: DialogGroupManageControllerProps) {
  const {
    isGroupDialogOpen,
    editingGroup,
    createGroupInitialData,
    closeGroupDialog,
    saveGroup,
  } = useControllerStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<GroupFormState>(INITIAL_GROUP_FORM);
  const [mobileSection, setMobileSection] = useState<MobileSection>("media");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation errors
  const [errorName, setErrorName] = useState<string | null>(null);
  const [errorLink, setErrorLink] = useState<string | null>(null);
  const [errorContentOrImage, setErrorContentOrImage] = useState<string | null>(null);
  const [errorShare, setErrorShare] = useState<string | null>(null);
  const [errorBoostLinks, setErrorBoostLinks] = useState<string | null>(null);
  const [errorBoostComments, setErrorBoostComments] = useState<string | null>(null);

  // Sync form state when dialog opens or editingGroup changes
  useEffect(() => {
    if (!isGroupDialogOpen) return;

    if (editingGroup) {
      const mode: GroupPostMode = editingGroup.boostMode
        ? "boost"
        : editingGroup.shareMode
          ? "share"
          : "post";

      setForm({
        name: editingGroup.name || "",
        images:
          Array.isArray(editingGroup.images) && editingGroup.images.length > 0
            ? editingGroup.images
            : editingGroup.image
              ? [editingGroup.image]
              : [],
        links: editingGroup.links || "",
        content: editingGroup.content || "",
        comment: editingGroup.comment || "",
        reaction: editingGroup.reaction || "",
        randomContent: Boolean(editingGroup.randomContent),
        randomImage: Boolean(editingGroup.randomImage),
        randomReaction: Boolean(editingGroup.randomReaction),
        postMode: mode,
        shareUrl: editingGroup.share || "",
        boostLinks: editingGroup.boostLinks || "",
        boostComments: editingGroup.boostComments || "",
        boostRandomComment: Boolean(editingGroup.boostRandomComment),
        boostCommentCount: editingGroup.boostCommentCount || 1,
        activeTab: mode === "share" ? "link" : "link",
      });
    } else if (createGroupInitialData) {
      setForm({
        ...INITIAL_GROUP_FORM,
        name: createGroupInitialData.name || "",
        links: Array.isArray(createGroupInitialData.links)
          ? createGroupInitialData.links.join("\n")
          : "",
      });
    } else {
      setForm(INITIAL_GROUP_FORM);
    }

    setMobileSection("media");
    setErrorName(null);
    setErrorLink(null);
    setErrorContentOrImage(null);
    setErrorShare(null);
    setErrorBoostLinks(null);
    setErrorBoostComments(null);
    setIsSubmitting(false);
  }, [isGroupDialogOpen, editingGroup]);

  // Image compression utility
  const compressImageToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const rawDataUrl = typeof reader.result === "string" ? reader.result : "";
        if (!rawDataUrl) {
          resolve("");
          return;
        }

        const img = new window.Image();
        img.onload = () => {
          const maxDim = 1280;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = () => resolve(rawDataUrl);
        img.src = rawDataUrl;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);
    Promise.all(filesArray.map((file) => compressImageToDataUrl(file))).then(
      (results) => {
        const validDataUrls = results.filter(Boolean);
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, ...validDataUrls],
        }));
        if (errorContentOrImage) setErrorContentOrImage(null);
      }
    );

    e.target.value = "";
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleAddSegment = () => {
    setForm((prev) => ({
      ...prev,
      content: prev.content
        ? `${prev.content.trimEnd()}\n---\n`
        : "---\n",
      randomContent: true,
    }));
    if (errorContentOrImage) setErrorContentOrImage(null);
  };

  const handleModeChange = (mode: GroupPostMode) => {
    setForm((prev) => ({
      ...prev,
      postMode: mode,
      activeTab: mode === "share" ? "link" : prev.activeTab,
    }));
    setErrorShare(null);
    setErrorBoostLinks(null);
    setErrorBoostComments(null);
    setErrorContentOrImage(null);
    setErrorLink(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Group Name
    if (!form.name.trim()) {
      setErrorName("กรุณาระบุชื่อกลุ่ม");
      setMobileSection("media");
      return;
    }

    // 2. Validate Mode-specific fields
    if (form.postMode === "boost") {
      const boostLinksTrimmed = form.boostLinks.trim();
      if (!boostLinksTrimmed) {
        setErrorBoostLinks("กรุณาระบุลิงก์โพสต์เป้าหมายอย่างน้อย 1 ลิงก์");
        setMobileSection("media");
        return;
      }

      const boostCommentsTrimmed = form.boostComments.trim();
      if (!boostCommentsTrimmed) {
        setErrorBoostComments("กรุณาระบุข้อความคอมเมนต์อย่างน้อย 1 คอมเมนต์");
        setMobileSection("editor");
        return;
      }
    } else if (form.postMode === "share") {
      const shareUrlTrimmed = form.shareUrl.trim();
      if (!shareUrlTrimmed) {
        setErrorShare("กรุณาระบุลิงก์ที่ต้องการแชร์");
        setMobileSection("media");
        return;
      }
      if (!/^https?:\/\/\S+$/i.test(shareUrlTrimmed)) {
        setErrorShare("รูปแบบลิงก์ไม่ถูกต้อง ต้องขึ้นต้นด้วย http:// หรือ https://");
        setMobileSection("media");
        return;
      }
      if (!form.links.trim()) {
        setErrorLink("กรุณาระบุลิงก์กลุ่มปลายทางอย่างน้อย 1 ลิงก์");
        setForm((prev) => ({ ...prev, activeTab: "link" }));
        setMobileSection("editor");
        return;
      }
    } else {
      // Normal Post Mode
      if (!form.links.trim()) {
        setErrorLink("กรุณาระบุลิงก์กลุ่มอย่างน้อย 1 ลิงก์");
        setForm((prev) => ({ ...prev, activeTab: "link" }));
        setMobileSection("editor");
        return;
      }

      const hasContent = form.content.trim().length > 0;
      const hasImages = form.images.length > 0;
      if (!hasContent && !hasImages) {
        setErrorContentOrImage("ต้องระบุข้อความโพสต์ หรือรูปภาพอย่างน้อย 1 อย่าง");
        setForm((prev) => ({ ...prev, activeTab: "content" }));
        setMobileSection("editor");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await saveGroup(accountId, {
        name: form.name.trim(),
        images: form.postMode === "post" ? form.images : [],
        links: form.postMode !== "boost" ? form.links : "",
        content: form.postMode === "post" ? form.content : "",
        comment: form.postMode === "post" ? form.comment : "",
        reaction: form.postMode !== "boost" ? form.reaction : "",
        randomContent: form.postMode === "post" ? form.randomContent : false,
        randomImage: form.postMode === "post" ? form.randomImage : false,
        randomReaction: form.postMode !== "boost" ? form.randomReaction : false,
        shareMode: form.postMode === "share",
        share: form.postMode === "share" ? form.shareUrl.trim() : "",
        shareContent: "",
        boostMode: form.postMode === "boost",
        boostLinks: form.postMode === "boost" ? form.boostLinks.trim() : "",
        boostComments: form.postMode === "boost" ? form.boostComments.trim() : "",
        boostRandomComment: form.postMode === "boost" ? form.boostRandomComment : false,
        boostCommentCount: form.postMode === "boost" ? form.boostCommentCount : 1,
      });
      closeGroupDialog();
    } catch {
      // Error handled by store
    } finally {
      setIsSubmitting(false);
    }
  };

  const linksCount = countLines(form.links);
  const commentsCount = countLines(form.comment);
  const contentSegmentsCount = countContentSegments(form.content);
  const boostLinksCount = countCommentLines(form.boostLinks);
  const boostCommentsCount = countCommentLines(form.boostComments);

  return (
    <Dialog
      open={isGroupDialogOpen}
      onOpenChange={(open) => {
        if (!open) closeGroupDialog();
      }}
    >
      {/* Modal Container with comfortable margins and rounded-2xl corners on mobile */}
      <div className="relative z-10 flex h-[85dvh] max-h-[660px] w-full max-w-4xl flex-col rounded-2xl border border-white/10 bg-neutral-950 shadow-[0_24px_60px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden transition-all">
        {/* ================= 1. HEADER (Fixed Top) ================= */}
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-800/80 px-4 py-3 sm:px-6 sm:py-4 bg-neutral-950">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-medium text-white">
                {editingGroup ? `แก้ไขกลุ่ม: ${editingGroup.name}` : "เพิ่มกลุ่มใหม่"}
              </h2>
              {form.postMode === "share" && (
                <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-medium text-violet-300">
                  แชร์ลิงก์
                </span>
              )}
              {form.postMode === "boost" && (
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                  ดันโพสต์
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] sm:text-xs text-neutral-400">
              {form.postMode === "share"
                ? "แชร์ลิงก์เป็นการ์ด Preview ลงในกลุ่มเป้าหมาย"
                : form.postMode === "boost"
                  ? "ดันโพสต์เป้าหมายด้วยชุดข้อความคอมเมนต์แบบสุ่ม"
                  : editingGroup
                    ? "แก้ไขเนื้อหาไฟล์ .txt, ลิงก์ และจัดการรูปภาพในกลุ่ม"
                    : "สร้างโฟลเดอร์กลุ่มใหม่สำหรับใช้ในการทำงาน"}
            </p>
          </div>

          <ButtonUI
            type="button"
            variant="ghost"
            onClick={closeGroupDialog}
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center rounded-lg p-0 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
            title="ปิดหน้าต่าง"
          >
            <X size={18} />
          </ButtonUI>
        </div>

        {/* ================= MOBILE SWITCHER BAR (Visible on Mobile only) ================= */}
        <div className="flex shrink-0 border-b border-neutral-800 bg-neutral-900/60 p-1 md:hidden">
          <ButtonUI
            type="button"
            variant="ghost"
            onClick={() => setMobileSection("media")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs transition-colors",
              mobileSection === "media"
                ? "!bg-neutral-800 text-white font-medium"
                : "text-neutral-400 hover:text-white"
            )}
          >
            {form.postMode === "boost" ? (
              <>
                <LinkIcon size={14} className="text-amber-400" />
                <span>โพสต์เป้าหมาย</span>
                {boostLinksCount > 0 && (
                  <span className="rounded-full bg-amber-500/20 text-amber-300 px-1.5 py-0.2 text-[10px]">
                    {boostLinksCount}
                  </span>
                )}
              </>
            ) : form.postMode === "share" ? (
              <>
                <Share2 size={14} className="text-violet-400" />
                <span>ลิงก์ที่แชร์</span>
              </>
            ) : (
              <>
                <ImageIcon size={14} />
                <span>รูปภาพ</span>
                {form.images.length > 0 && (
                  <span className="rounded-full bg-blue-500/20 text-blue-400 px-1.5 py-0.2 text-[10px]">
                    {form.images.length}
                  </span>
                )}
              </>
            )}
          </ButtonUI>

          <ButtonUI
            type="button"
            variant="ghost"
            onClick={() => setMobileSection("editor")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs transition-colors",
              mobileSection === "editor"
                ? "!bg-neutral-800 text-white font-medium"
                : "text-neutral-400 hover:text-white"
            )}
          >
            {form.postMode === "boost" ? (
              <>
                <MessageSquare size={14} className="text-amber-400" />
                <span>คอมเมนต์</span>
                {boostCommentsCount > 0 && (
                  <span className="rounded-full bg-green-500/20 text-green-400 px-1.5 py-0.2 text-[10px]">
                    {boostCommentsCount}
                  </span>
                )}
              </>
            ) : form.postMode === "share" ? (
              <>
                <LinkIcon size={14} className="text-purple-400" />
                <span>กลุ่มเป้าหมาย</span>
                {linksCount > 0 && (
                  <span className="rounded-full bg-purple-500/20 text-purple-400 px-1.5 py-0.2 text-[10px]">
                    {linksCount}
                  </span>
                )}
              </>
            ) : (
              <>
                <FileText size={14} />
                <span>ข้อมูลโพสต์</span>
                {linksCount > 0 && (
                  <span className="rounded-full bg-purple-500/20 text-purple-400 px-1.5 py-0.2 text-[10px]">
                    {linksCount}
                  </span>
                )}
              </>
            )}
          </ButtonUI>
        </div>

        {/* ================= 2. BODY (Scrollable/Flex Form) ================= */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 min-h-0 flex-col overflow-hidden"
        >
          <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto md:overflow-hidden">
            <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              {/* ================= LEFT COLUMN: Name + Mode-Specific Left Input ================= */}
              <div
                className={cn(
                  "flex-col space-y-3 h-full min-h-0 md:col-span-5",
                  mobileSection === "media" ? "flex" : "hidden md:flex"
                )}
              >
                {/* Input Group Name */}
                <div className="shrink-0 space-y-1">
                  <label className="block text-xs font-medium text-neutral-200">
                    ชื่อหมวดหมู่ของกลุ่ม<span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, name: e.target.value }));
                      if (errorName) setErrorName(null);
                    }}
                    placeholder="ระบุชื่อกลุ่ม เช่น เสื้อผ้าแฟชั่น, รถยนต์มือสอง"
                    required
                    className="bg-neutral-900 border-neutral-800 text-xs py-2"
                  />
                  {errorName && (
                    <p className="text-[11px] text-red-400">{errorName}</p>
                  )}
                </div>

                {/* Left Area Content by Mode */}
                {form.postMode === "share" ? (
                  <GroupFormShare
                    shareUrl={form.shareUrl}
                    onChangeShareUrl={(url) => {
                      setForm((prev) => ({ ...prev, shareUrl: url }));
                      if (errorShare) setErrorShare(null);
                    }}
                    errorShare={errorShare}
                    disabled={isSubmitting}
                  />
                ) : form.postMode === "boost" ? (
                  <GroupFormBoostLeft
                    boostLinks={form.boostLinks}
                    onChangeBoostLinks={(val) => {
                      setForm((prev) => ({ ...prev, boostLinks: val }));
                      if (errorBoostLinks) setErrorBoostLinks(null);
                    }}
                    errorBoostLinks={errorBoostLinks}
                    disabled={isSubmitting}
                  />
                ) : (
                  /* Standard Post Mode: GroupFormMedia */
                  <div className="flex flex-1 min-h-[260px] md:min-h-0 flex-col rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-3.5 transition-colors">
                    <div className="flex items-center justify-between shrink-0">
                      <div>
                        <label className="text-xs font-medium text-neutral-200">
                          รูปภาพประจำกลุ่ม
                        </label>
                      </div>

                      <ButtonUI
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white transition-colors"
                      >
                        <ImageIcon className="h-3.5 w-3.5 text-blue-400" />
                        <span>เลือกรูปภาพ</span>
                      </ButtonUI>
                    </div>

                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFilesSelected}
                      className="hidden"
                    />

                    {/* Image List Preview */}
                    <div className="mt-3 flex min-h-0 flex-1 flex-col">
                      {form.images.length > 0 ? (
                        <div className="flex flex-1 min-h-0 flex-col space-y-2">
                          <div className="flex shrink-0 items-center justify-between text-xs text-neutral-400">
                            <span>ทั้งหมด {form.images.length} รูปภาพ</span>
                            <ButtonUI
                              type="button"
                              variant="ghost"
                              onClick={() =>
                                setForm((prev) => ({ ...prev, images: [] }))
                              }
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={11} />
                              <span>ล้างทั้งหมด</span>
                            </ButtonUI>
                          </div>

                          <div className="grid min-h-0 flex-1 content-start grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto pr-1">
                            {form.images.map((imgSrc, idx) => (
                              <div
                                key={idx}
                                className="group relative flex items-center justify-between gap-2.5 rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-xs transition hover:border-neutral-700"
                              >
                                <div className="flex min-w-0 items-center gap-2.5">
                                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 flex items-center justify-center">
                                    <img
                                      src={imgSrc}
                                      alt={`ภาพที่ ${idx + 1}`}
                                      className="h-full w-full object-cover"
                                    />
                                    {idx === 0 && (
                                      <span className="absolute bottom-0.5 left-0.5 rounded bg-black/80 px-1 py-0.2 text-[8px] text-blue-400 font-mono">
                                        หลัก
                                      </span>
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-medium text-neutral-200">
                                      รูปภาพที่ {idx + 1}
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-neutral-500">
                                      รูปภาพในกลุ่ม
                                    </p>
                                  </div>
                                </div>

                                <ButtonUI
                                  type="button"
                                  variant="ghost"
                                  onClick={() => handleRemoveImage(idx)}
                                  title="ลบรูปภาพนี้"
                                  className="h-7 w-7 rounded-lg p-0 text-neutral-500 transition hover:bg-red-500/10 hover:text-red-400"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </ButtonUI>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-800 py-6 text-center text-xs text-neutral-500 hover:border-neutral-700 hover:bg-neutral-900/30 cursor-pointer transition-colors"
                        >
                          <ImageIcon className="mb-1.5 h-7 w-7 text-neutral-600" />
                          <span>ยังไม่มีการเลือกรูปภาพ</span>
                          <span className="mt-0.5 text-[11px] text-neutral-600">
                            (สามารถเลือกรูปภาพในภายหลังได้)
                          </span>
                        </div>
                      )}
                    </div>

                    {errorContentOrImage && form.postMode === "post" && (
                      <p className="mt-2 text-xs text-red-400">
                        {errorContentOrImage}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ================= RIGHT COLUMN: Tabbed or Mode Editor ================= */}
              <div
                className={cn(
                  "flex-col h-full min-h-0 md:col-span-7",
                  mobileSection === "editor" ? "flex" : "hidden md:flex"
                )}
              >
                <div className="flex flex-1 min-h-0 flex-col rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden">
                  {/* Tab Selector Header */}
                  <div className="flex shrink-0 border-b border-neutral-800 bg-neutral-950/60 p-1">
                    {form.postMode === "boost" ? (
                      /* Boost Mode Single Header */
                      <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-neutral-800 py-2 text-xs font-medium text-white shadow-sm">
                        <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
                        <span>คอมเมนต์*</span>
                        {boostCommentsCount > 0 ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                        ) : errorBoostComments ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        ) : null}
                      </div>
                    ) : form.postMode === "share" ? (
                      /* Share Mode Single Tab (Only Target Groups) */
                      <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-neutral-800 py-2 text-xs font-medium text-white shadow-sm">
                        <LinkIcon className="h-3.5 w-3.5 text-purple-400" />
                        <span>ลิงก์กลุ่มปลายทาง*</span>
                        {linksCount > 0 ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                        ) : errorLink ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        ) : null}
                      </div>
                    ) : (
                      /* Standard Post Mode (3 Tabs) */
                      <>
                        {/* Links Tab */}
                        <ButtonUI
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, activeTab: "link" }))
                          }
                          className={cn(
                            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs transition-all",
                            form.activeTab === "link"
                              ? "!bg-neutral-800 text-white font-medium shadow-sm"
                              : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200  bg-transparent"
                          )}
                        >
                          <LinkIcon className="h-3.5 w-3.5" />
                          <span>ลิงก์*</span>
                          {linksCount > 0 ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                          ) : errorLink ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                          ) : null}
                        </ButtonUI>

                        {/* Content Tab */}
                        <ButtonUI
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, activeTab: "content" }))
                          }
                          className={cn(
                            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs transition-all",
                            form.activeTab === "content"
                              ? "!bg-neutral-800 text-white font-medium shadow-sm"
                              : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200  bg-transparent"
                          )}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>เนื้อหา*</span>
                          {form.content.trim() ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                          ) : errorContentOrImage ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                          ) : null}
                        </ButtonUI>

                        {/* Comments Tab */}
                        <ButtonUI
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, activeTab: "comments" }))
                          }
                          className={cn(
                            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs transition-all",
                            form.activeTab === "comments"
                              ? "!bg-neutral-800 text-white font-medium shadow-sm"
                              : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200  bg-transparent"
                          )}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>คอมเมนต์</span>
                          {commentsCount > 0 && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          )}
                        </ButtonUI>
                      </>
                    )}
                  </div>

                  {/* Tab Content Area */}
                  <div className="flex min-h-0 flex-1 flex-col p-3.5 sm:p-4">
                    {form.postMode === "boost" ? (
                      /* Boost Mode Right Column */
                      <GroupFormBoostRight
                        boostComments={form.boostComments}
                        onChangeBoostComments={(val) => {
                          setForm((prev) => ({ ...prev, boostComments: val }));
                          if (errorBoostComments) setErrorBoostComments(null);
                        }}
                        errorBoostComments={errorBoostComments}
                        disabled={isSubmitting}
                      />
                    ) : form.postMode === "share" || form.activeTab === "link" ? (
                      /* Target Groups Link Tab */
                      <div className="flex min-h-0 flex-1 flex-col">
                        <div className="mb-1.5 flex shrink-0 items-center justify-between text-xs text-neutral-400">
                          <span>รายการลิงก์เป้าหมาย (1 บรรทัดต่อ 1 ลิงก์)*</span>
                          <span className="text-[11px] text-neutral-500 font-mono">
                            ทั้งหมด {linksCount} ลิงก์
                          </span>
                        </div>

                        <textarea
                          placeholder={
                            "https://www.facebook.com/groups/123456789\nhttps://www.facebook.com/groups/987654321"
                          }
                          value={form.links}
                          onChange={(e) => {
                            setForm((prev) => ({ ...prev, links: e.target.value }));
                            if (errorLink) setErrorLink(null);
                          }}
                          disabled={isSubmitting}
                          className={cn(
                            "min-h-0 w-full flex-1 resize-none rounded-lg border bg-neutral-900/90 p-3 text-xs leading-normal text-white placeholder-neutral-500 outline-none transition-colors overflow-y-auto",
                            errorLink
                              ? "border-red-500/60 focus:border-red-400"
                              : "border-neutral-800 focus:border-blue-500"
                          )}
                        />
                        {errorLink && (
                          <p className="mt-1 shrink-0 text-xs text-red-400">
                            {errorLink}
                          </p>
                        )}
                      </div>
                    ) : form.activeTab === "content" ? (
                      /* Content Tab */
                      <div className="flex min-h-0 flex-1 flex-col">
                        <div className="mb-1.5 flex shrink-0 items-center justify-between text-xs text-neutral-400">
                          <span>ข้อความที่จะโพสต์ลงในกลุ่ม (ต้องมีเนื้อหา หรือรูปภาพ)</span>
                          {form.content.includes("---") && (
                            <span className="text-[11px] text-blue-400 font-mono">
                              ({contentSegmentsCount} ชุดข้อความสุ่ม)
                            </span>
                          )}
                        </div>

                        <textarea
                          placeholder="พิมพ์ข้อความสำหรับโพสต์ลงกลุ่ม... (ใช้ --- เพื่อคั่นสุ่มข้อความ หรือกดปุ่มด้านล่าง)"
                          value={form.content}
                          onChange={(e) => {
                            setForm((prev) => ({ ...prev, content: e.target.value }));
                            if (errorContentOrImage) setErrorContentOrImage(null);
                          }}
                          disabled={isSubmitting}
                          className={cn(
                            "min-h-0 w-full flex-1 resize-none rounded-lg border bg-neutral-900/90 p-3 text-xs leading-normal text-white placeholder-neutral-500 outline-none transition-colors overflow-y-auto",
                            errorContentOrImage
                              ? "border-red-500/60 focus:border-red-400"
                              : "border-neutral-800 focus:border-blue-500"
                          )}
                        />

                        <ButtonUI
                          type="button"
                          variant="ghost"
                          onClick={handleAddSegment}
                          disabled={isSubmitting}
                          className="mt-2.5 flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-dashed border-neutral-700/80 py-2 text-xs text-neutral-400 transition-all hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-300"
                        >
                          <Plus size={13} />
                          <span>+ เพิ่มชุดข้อความสุ่ม (---)</span>
                        </ButtonUI>
                        {errorContentOrImage && (
                          <p className="mt-1 shrink-0 text-xs text-red-400">
                            {errorContentOrImage}
                          </p>
                        )}
                      </div>
                    ) : (
                      /* Comments Tab */
                      <div className="flex min-h-0 flex-1 flex-col">
                        <div className="mb-1.5 flex shrink-0 items-center justify-between text-xs text-neutral-400">
                          <span>ข้อความคอมเมนต์ (1 บรรทัด = 1 คอมเมนต์ — จะใส่หรือไม่ใส่ก็ได้)</span>
                          <span className="text-[11px] text-neutral-500 font-mono">
                            {commentsCount} คอมเมนต์
                          </span>
                        </div>

                        <textarea
                          placeholder={"พิมพ์ 1 บรรทัดต่อ 1 คอมเมนต์ เช่น\nสนใจทักแชท\nสอบถามรายละเอียดได้เลย..."}
                          value={form.comment}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, comment: e.target.value }))
                          }
                          disabled={isSubmitting}
                          className="min-h-0 w-full flex-1 resize-none rounded-lg border border-neutral-800 bg-neutral-900/90 p-3 text-xs leading-normal text-white placeholder-neutral-500 outline-none transition-colors focus:border-blue-500 overflow-y-auto"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= 3. FOOTER (Fixed Bottom & Full Area on Mobile) ================= */}
          <div className="shrink-0 border-t border-neutral-800/80 bg-neutral-950 px-4 py-3 sm:px-6 sm:py-3.5">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              {/* Controls: Mode Capsule & Dropups (Full Width on Mobile) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                {/* Mode Selector Capsule */}
                <div className="flex w-full sm:w-auto items-center rounded-md border border-neutral-800 bg-neutral-900/90 p-0.5">
                  <ButtonUI
                    type="button"
                    variant="ghost"
                    onClick={() => handleModeChange("post")}
                    disabled={isSubmitting}
                    className={cn(
                      "flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 sm:py-1 text-xs transition-colors",
                      form.postMode === "post"
                        ? "!bg-neutral-800 text-white font-medium shadow-sm"
                        : "text-neutral-400 hover:text-neutral-200"
                    )}
                    title="โพสต์ข้อความ/รูปภาพปกติ"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span>โพสต์ปกติ</span>
                  </ButtonUI>

                  <ButtonUI
                    type="button"
                    variant="ghost"
                    onClick={() => handleModeChange("share")}
                    disabled={isSubmitting}
                    className={cn(
                      "flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 sm:py-1 text-xs transition-colors",
                      form.postMode === "share"
                        ? "!bg-violet-600/30 text-violet-300 font-medium shadow-sm"
                        : "text-neutral-400 hover:text-neutral-200"
                    )}
                    title="แชร์ลิงก์เป็นการ์ด preview"
                  >
                    <Share2 className="h-3.5 w-3.5 shrink-0" />
                    <span>แชร์ลิงก์</span>
                  </ButtonUI>

                  <ButtonUI
                    type="button"
                    variant="ghost"
                    onClick={() => handleModeChange("boost")}
                    disabled={isSubmitting}
                    className={cn(
                      "flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 sm:py-1 text-xs transition-colors",
                      form.postMode === "boost"
                        ? "!bg-amber-600/30 text-amber-300 font-medium shadow-sm"
                        : "text-neutral-400 hover:text-neutral-200"
                    )}
                    title="ดันโพสต์เป้าหมายด้วยคอมเมนต์"
                  >
                    <Rocket className="h-3.5 w-3.5 shrink-0" />
                    <span>ดันโพสต์</span>
                  </ButtonUI>
                </div>

                {/* Dropups depending on mode */}
                {form.postMode === "boost" ? (
                  /* Boost Mode: Boost Setting Dropup */
                  <div className="w-full sm:w-auto">
                    <BoostSettingGroupManageController
                      randomComment={form.boostRandomComment}
                      commentCount={form.boostCommentCount}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                      onChangeRandomComment={(val) =>
                        setForm((prev) => ({ ...prev, boostRandomComment: val }))
                      }
                      onChangeCommentCount={(val) =>
                        setForm((prev) => ({ ...prev, boostCommentCount: val }))
                      }
                    />
                  </div>
                ) : (
                  /* Post & Share Modes: Reaction & Setting Dropups */
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                    <ReactionGroupManageController
                      value={form.reaction}
                      randomReaction={form.randomReaction}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                      onChange={(reaction) =>
                        setForm((prev) => ({ ...prev, reaction }))
                      }
                    />

                    <SettingGroupManageController
                      values={{
                        randomContent: form.randomContent,
                        randomImage: form.randomImage,
                        randomReaction: form.randomReaction,
                      }}
                      shareMode={form.postMode === "share"}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                      onChange={(patch) =>
                        setForm((prev) => ({ ...prev, ...patch }))
                      }
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons — 2 Columns Full Width on Mobile */}
              <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 w-full sm:w-auto pt-1 sm:pt-0">
                <ButtonUI
                  type="button"
                  onClick={closeGroupDialog}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto cursor-pointer border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors"
                >
                  ปิดหน้าต่าง
                </ButtonUI>

                <ButtonUI
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex cursor-pointer items-center justify-center gap-2 bg-blue-600 px-5 py-2 text-xs text-white hover:bg-blue-500 rounded-lg transition-colors"
                >
                  {isSubmitting && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>
                    {editingGroup ? "บันทึกการแก้ไข" : "สร้างกลุ่ม"}
                  </span>
                </ButtonUI>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
