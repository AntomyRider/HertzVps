"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Image as ImageIcon,
  Trash2,
  FileText,
  MessageSquare,
  Link as LinkIcon,
  ChevronUp,
  SquareText,
  Smile,
} from "lucide-react";
import {
  useControlStore,
  type ControlReactionType,
  type ControlUploadImage,
} from "@/store/controlStore";

interface ControlGroupDialogProps {
  accountId: string;
}

const REACTIONS: {
  type: ControlReactionType;
  label: string;
  emoji: string;
  activeColor: string;
}[] = [
  {
    type: "LIKE",
    label: "ถูกใจ",
    emoji: "👍",
    activeColor: "border-blue-500/60 bg-blue-600/20 text-blue-400",
  },
  {
    type: "LOVE",
    label: "รักเลย",
    emoji: "❤️",
    activeColor: "border-red-500/60 bg-red-600/20 text-red-400",
  },
  {
    type: "CARE",
    label: "ห่วงใย",
    emoji: "🥰",
    activeColor: "border-blue-500/60 bg-blue-600/20 text-blue-400",
  },
  {
    type: "HAHA",
    label: "ฮ่าๆ",
    emoji: "😂",
    activeColor: "border-blue-500/60 bg-blue-600/20 text-blue-400",
  },
  {
    type: "WOW",
    label: "ว้าว",
    emoji: "😮",
    activeColor: "border-blue-500/60 bg-blue-600/20 text-blue-400",
  },
  {
    type: "SAD",
    label: "เศร้า",
    emoji: "😢",
    activeColor: "border-blue-500/60 bg-blue-600/20 text-blue-400",
  },
  {
    type: "ANGRY",
    label: "โกรธ",
    emoji: "😡",
    activeColor: "border-red-500/60 bg-red-600/20 text-red-400",
  },
];

function countContentSegments(text: string): number {
  if (!text || !text.includes("---")) return 1;
  return (
    text
      .split(/(?:^|\r?\n)\s*-{3,}\s*(?:\r?\n|$)/)
      .map((s) => s.trim())
      .filter(Boolean).length || 1
  );
}

async function compressImageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = String(reader.result || "");
      const img = new window.Image();
      img.onload = () => {
        try {
          const maxDim = 1280;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(resultStr);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
          const compressed = canvas.toDataURL(mime, 0.85);
          resolve(compressed);
        } catch {
          resolve(resultStr);
        }
      };
      img.onerror = () => resolve(resultStr);
      img.src = resultStr;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

const SettingSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative h-5 w-9 shrink-0 rounded-sm border transition ${
      checked
        ? "border-blue-500 bg-blue-600"
        : "border-neutral-700 bg-neutral-800"
    }`}
  >
    <span
      className={`block h-3.5 w-3.5 rounded-sm bg-white transition-transform ${
        checked ? "translate-x-4" : "translate-x-0.5"
      }`}
    />
  </button>
);

const cleanFileName = (raw: string) => {
  const parts = String(raw || "").split(/[\\/]/);
  return parts[parts.length - 1] || raw;
};

const ControlGroupDialog = ({ accountId }: ControlGroupDialogProps) => {
  const {
    groupsByAccount,
    isGroupDialogOpen,
    editingGroup,
    setIsGroupDialogOpen,
    setEditingGroup,
    createGroup,
    updateGroup,
    sendRemoteCommand,
  } = useControlStore();

  const liveGroup =
    (editingGroup &&
      (groupsByAccount[accountId] || []).find(
        (g) => g.id === editingGroup.id || g.name === editingGroup.name
      )) ||
    editingGroup;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [comments, setComments] = useState("");
  const [reaction, setReaction] = useState<ControlReactionType>("");
  const [linksText, setLinksText] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<ControlUploadImage[]>([]);
  const [randomContent, setRandomContent] = useState(false);
  const [randomImage, setRandomImage] = useState(false);
  const [randomReaction, setRandomReaction] = useState(false);

  const [activeTab, setActiveTab] = useState<"link" | "content" | "comments">(
    "link"
  );
  const [isReactionOpen, setIsReactionOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [errorName, setErrorName] = useState<string | null>(null);
  const [errorLink, setErrorLink] = useState<string | null>(null);
  const [errorContentOrImage, setErrorContentOrImage] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (editingGroup) {
      setName(editingGroup.name);
      setContent(editingGroup.content);
      setComments(editingGroup.comments);
      setReaction(editingGroup.reaction);
      setLinksText(editingGroup.links.join("\n"));
      setExistingImages((editingGroup.images || []).map(cleanFileName));
      setNewImages([]);
      setRandomContent(editingGroup.randomContent);
      setRandomImage(editingGroup.randomImage);
      setRandomReaction(editingGroup.randomReaction);
      setActiveTab(editingGroup.links.length > 0 ? "link" : "content");
      void sendRemoteCommand("SYNC_IMAGES", { accountId, userId: accountId });
    } else {
      setName("");
      setContent("");
      setComments("");
      setReaction("");
      setLinksText("");
      setExistingImages([]);
      setNewImages([]);
      setRandomContent(false);
      setRandomImage(false);
      setRandomReaction(false);
      setActiveTab("link");
    }
    setIsReactionOpen(false);
    setIsSettingsOpen(false);
    setErrorName(null);
    setErrorLink(null);
    setErrorContentOrImage(null);
  }, [editingGroup, isGroupDialogOpen]);

  if (!isGroupDialogOpen) return null;

  const isEdit = Boolean(editingGroup);
  const parsedLinks = linksText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const totalImagesCount = existingImages.length + newImages.length;
  const activeReactionObj = REACTIONS.find((r) => r.type === reaction);
  const hasAnyRandom = randomContent || randomImage || randomReaction;

  const handleClose = () => {
    setIsGroupDialogOpen(false);
    setEditingGroup(null);
  };

  const handleAddSegment = () => {
    const trimmed = content.trimEnd();
    const nextContent = trimmed ? `${trimmed}\n---\n` : "---\n";
    setContent(nextContent);
    setRandomContent(true);
    if (errorContentOrImage) setErrorContentOrImage(null);
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (errorContentOrImage) setErrorContentOrImage(null);

    const fileArray = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (fileArray.length === 0) return;

    const converted: ControlUploadImage[] = [];
    for (const file of fileArray) {
      try {
        const dataUrl = await compressImageFileToDataUrl(file);
        converted.push({
          name: file.name,
          data: dataUrl,
        });
      } catch {
        // Ignore single broken image
      }
    }

    if (converted.length > 0) {
      setNewImages((prev) => {
        const next = [...prev];
        for (const item of converted) {
          if (!next.some((n) => n.name === item.name)) {
            next.push(item);
          }
        }
        return next;
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveExistingImage = (fileName: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== fileName));
  };

  const handleRemoveNewImage = (fileName: string) => {
    setNewImages((prev) => prev.filter((img) => img.name !== fileName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorName(null);
    setErrorLink(null);
    setErrorContentOrImage(null);

    const trimmedName = name.trim();
    let hasErr = false;

    if (!trimmedName) {
      setErrorName("กรุณาระบุชื่อหมวดหมู่ของกลุ่ม");
      hasErr = true;
    }

    if (parsedLinks.length === 0) {
      setErrorLink("กรุณาระบุลิงก์กลุ่มหรือเลขกลุ่มอย่างน้อย 1 รายการ");
      setActiveTab("link");
      hasErr = true;
    }

    if (!content.trim() && totalImagesCount === 0) {
      setErrorContentOrImage(
        "กรุณาระบุข้อความเนื้อหาที่จะโพสต์ หรือเลือกรูปภาพอย่างน้อย 1 รูป"
      );
      if (parsedLinks.length > 0) {
        setActiveTab("content");
      }
      hasErr = true;
    }

    if (hasErr) return;

    if (editingGroup) {
      updateGroup(accountId, editingGroup.id, {
        name: trimmedName,
        content,
        comments,
        reaction,
        links: parsedLinks,
        existingImages,
        newImages,
        randomContent,
        randomImage,
        randomReaction,
      });
    } else {
      createGroup(accountId, {
        name: trimmedName,
        content,
        comments,
        reaction,
        links: parsedLinks,
        images: [],
        newImages,
        randomContent,
        randomImage,
        randomReaction,
        isActive: true,
      });
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Dialog Container (Responsive Mobile/Split-screen + Desktop 2-Column UX + rounded-md) */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col rounded-md border border-neutral-800 bg-neutral-950 transition-all md:h-[650px] md:max-h-[85vh]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-800 px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-white sm:text-lg">
              {isEdit
                ? `แก้ไขกลุ่ม: ${editingGroup?.name}`
                : "เพิ่มกลุ่มใหม่ (Add Group)"}
            </h2>
            <p className="mt-0.5 truncate text-xs text-neutral-400">
              {isEdit
                ? "แก้ไขเนื้อหาไฟล์ .txt, ลิงก์ และจัดการรูปภาพในกลุ่ม"
                : "สร้างโฟลเดอร์กลุ่มพร้อมไฟล์ content.txt, comments.txt, reaction.txt, link.txt และ image/"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-neutral-800 text-neutral-400 transition hover:border-neutral-700 hover:bg-neutral-900 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          {/* Scrollable Content Area on Mobile/Tablet, Fixed 2-Col on Desktop */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:min-h-0 md:overflow-hidden">
            <div className="grid grid-cols-1 gap-5 md:h-full md:min-h-0 md:grid-cols-2 md:gap-6">
              {/* ================= LEFT COLUMN: Name & Images ================= */}
              <div className="flex flex-col gap-4 md:min-h-0">
                {/* Input Name */}
                <div className="shrink-0">
                  <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                    ชื่อหมวดหมู่ของกลุ่ม*
                  </label>
                  <input
                    type="text"
                    placeholder="ระบุชื่อกลุ่ม เช่น เสื้อผ้าแฟชั่น, รถยนต์มือสอง"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorName) setErrorName(null);
                    }}
                    className={`w-full rounded-sm border ${
                      errorName
                        ? "border-red-500/60 focus:border-red-400"
                        : "border-neutral-800 focus:border-blue-500/50"
                    } bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition`}
                  />
                  {errorName && (
                    <p className="mt-1 text-xs text-red-400">{errorName}</p>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => void handleFilesSelected(e.target.files)}
                />

                {/* Form Image Card */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    void handleFilesSelected(e.dataTransfer.files);
                  }}
                  className={`flex min-h-[180px] flex-1 flex-col rounded-md border ${
                    errorContentOrImage && totalImagesCount === 0
                      ? "border-red-500/50 bg-red-950/10"
                      : "border-neutral-800 bg-neutral-900/40"
                  } p-4 transition-colors md:min-h-0`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <label className="text-sm font-medium text-neutral-200">
                        รูปภาพประจำกลุ่ม
                      </label>
                      {errorContentOrImage && totalImagesCount === 0 && (
                        <span className="block text-[11px] text-red-400">
                          *ต้องการรูปภาพหรือเนื้อหา
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                    >
                      <ImageIcon size={14} />
                      <span>เลือกรูปภาพ</span>
                    </button>
                  </div>

                  {/* Images Preview List */}
                  <div className="mt-3 flex min-h-0 flex-1 flex-col">
                    {totalImagesCount > 0 ? (
                      <div className="flex min-h-0 flex-1 flex-col space-y-2">
                        <div className="flex shrink-0 items-center justify-between text-xs text-neutral-400">
                          <span>ทั้งหมด {totalImagesCount} รูปภาพ</span>
                        </div>

                        <div className="grid max-h-[220px] min-h-0 flex-1 content-start grid-cols-1 gap-2 overflow-y-auto pr-0.5 sm:grid-cols-2 md:max-h-none">
                          {/* Existing Images */}
                          {existingImages.map((fileName) => {
                            const cleanName = cleanFileName(fileName);
                            const previewUrl =
                              liveGroup?.imagePreviews?.[fileName] ||
                              liveGroup?.imagePreviews?.[cleanName] ||
                              editingGroup?.imagePreviews?.[fileName] ||
                              editingGroup?.imagePreviews?.[cleanName];
                            return (
                              <div
                                key={`existing-${fileName}`}
                                className="group relative flex items-center justify-between gap-2.5 rounded-md border border-neutral-800 bg-neutral-950 p-2 text-xs transition hover:border-neutral-700"
                              >
                                <div className="flex min-w-0 items-center gap-2.5">
                                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900">
                                    {previewUrl ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={previewUrl}
                                        alt={cleanName}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <ImageIcon
                                        size={16}
                                        className="text-blue-400/70"
                                      />
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <span
                                      className="block truncate font-medium text-neutral-200"
                                      title={cleanName}
                                    >
                                      {cleanName}
                                    </span>
                                    <span className="mt-0.5 block text-[10px] text-neutral-500">
                                      รูปภาพในกลุ่ม
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveExistingImage(fileName)
                                  }
                                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-neutral-500 transition hover:bg-red-500/10 hover:text-red-400"
                                  title="ลบรูปภาพนี้"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            );
                          })}

                          {/* New Uploaded Images */}
                          {newImages.map((item) => (
                            <div
                              key={`new-${item.name}`}
                              className="group relative flex items-center justify-between gap-2.5 rounded-md border border-blue-500/30 bg-blue-500/5 p-2 text-xs transition hover:border-blue-500/50"
                            >
                              <div className="flex min-w-0 items-center gap-2.5">
                                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-blue-500/30 bg-neutral-900">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={item.data}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <span
                                    className="block truncate font-medium text-neutral-200"
                                    title={item.name}
                                  >
                                    {item.name}
                                  </span>
                                  <span className="mt-0.5 block truncate text-[10px] text-blue-400">
                                    อัปโหลดใหม่
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveNewImage(item.name)}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-neutral-500 transition hover:bg-red-500/10 hover:text-red-400"
                                title="ลบรูปภาพนี้"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex min-h-[120px] flex-1 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-neutral-800 px-3 py-5 text-center text-xs text-neutral-500 transition hover:border-neutral-700 hover:bg-neutral-950/40 md:min-h-0"
                      >
                        <ImageIcon
                          size={26}
                          className="mb-1.5 text-neutral-600"
                        />
                        <span>ยังไม่มีการเลือกรูปภาพ</span>
                        <span className="mt-0.5 text-[11px] text-neutral-600">
                          (คลิกเพื่อเลือกรูปภาพ หรือลากไฟล์มาวางที่นี่)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ================= RIGHT COLUMN: Tabs (Link / Content / Comments) ================= */}
              <div className="flex min-h-[260px] flex-1 flex-col md:min-h-0">
                <div className="flex min-h-0 flex-1 flex-col rounded-md border border-neutral-800 bg-neutral-900/30">
                  {/* Tab Selector Header */}
                  <div className="flex shrink-0 border-b border-neutral-800 bg-neutral-950/60 p-1">
                    {/* Links Tab */}
                    <button
                      type="button"
                      onClick={() => setActiveTab("link")}
                      className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-sm px-2 py-2 text-xs font-medium transition-all ${
                        activeTab === "link"
                          ? "bg-neutral-800 text-white"
                          : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                      }`}
                    >
                      <LinkIcon size={14} className="shrink-0" />
                      <span>ลิงก์*</span>
                      {parsedLinks.length > 0 ? (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-blue-400" />
                      ) : errorLink ? (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-red-400" />
                      ) : null}
                    </button>

                    {/* Content Tab */}
                    <button
                      type="button"
                      onClick={() => setActiveTab("content")}
                      className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-sm px-2 py-2 text-xs font-medium transition-all ${
                        activeTab === "content"
                          ? "bg-neutral-800 text-white"
                          : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                      }`}
                    >
                      <FileText size={14} className="shrink-0" />
                      <span>เนื้อหาโพสต์*</span>
                      {content.trim() ? (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-blue-400" />
                      ) : errorContentOrImage ? (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-red-400" />
                      ) : null}
                    </button>

                    {/* Comments Tab */}
                    <button
                      type="button"
                      onClick={() => setActiveTab("comments")}
                      className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-sm px-2 py-2 text-xs font-medium transition-all ${
                        activeTab === "comments"
                          ? "bg-neutral-800 text-white"
                          : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                      }`}
                    >
                      <MessageSquare size={14} className="shrink-0" />
                      <span>คอมเมนต์</span>
                      {comments.trim() && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-blue-400" />
                      )}
                    </button>
                  </div>

                  {/* Tab Content Area */}
                  <div className="flex min-h-0 flex-1 flex-col p-4">
                    {activeTab === "content" ? (
                      <div className="flex min-h-0 flex-1 flex-col">
                        <div className="mb-1.5 flex shrink-0 flex-wrap items-center justify-between gap-1 text-xs text-neutral-400">
                          <span>
                            ข้อความที่จะโพสต์ลงในกลุ่ม (ต้องมีเนื้อหา หรือรูปภาพ)
                          </span>
                          {content.includes("---") && (
                            <span className="text-[11px] text-blue-400">
                              ({countContentSegments(content)} ชุดข้อความสุ่ม)
                            </span>
                          )}
                        </div>

                        <textarea
                          placeholder="พิมพ์ข้อความสำหรับโพสต์ลงกลุ่ม... (ใช้ --- เพื่อคั่นสุ่มข้อความ หรือกดปุ่มด้านล่าง)"
                          value={content}
                          onChange={(e) => {
                            setContent(e.target.value);
                            if (errorContentOrImage)
                              setErrorContentOrImage(null);
                          }}
                          className={`min-h-[160px] w-full flex-1 resize-none overflow-y-auto rounded-sm border ${
                            errorContentOrImage
                              ? "border-red-500/60 focus:border-red-400"
                              : "border-neutral-800 focus:border-blue-500/50"
                          } bg-neutral-950 p-3 text-sm leading-normal text-white placeholder-neutral-500 outline-none transition-colors md:min-h-0`}
                        />

                        <button
                          type="button"
                          onClick={handleAddSegment}
                          className="mt-2.5 flex shrink-0 items-center justify-center gap-1.5 rounded-sm border border-dashed border-neutral-700/80 py-2 text-xs text-neutral-400 transition hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-400"
                        >
                          + เพิ่มชุดข้อความสุ่ม (---)
                        </button>

                        {errorContentOrImage && (
                          <p className="mt-1 shrink-0 text-xs text-red-400">
                            {errorContentOrImage}
                          </p>
                        )}
                      </div>
                    ) : activeTab === "comments" ? (
                      <div className="flex min-h-0 flex-1 flex-col">
                        <div className="mb-1.5 flex shrink-0 items-center justify-between gap-2 text-xs text-neutral-400">
                          <span>ข้อความคอมเมนต์ (จะใส่หรือไม่ใส่ก็ได้)</span>
                          <span className="shrink-0 text-[11px] text-neutral-500">
                            {comments.length} ตัวอักษร
                          </span>
                        </div>

                        <textarea
                          placeholder="พิมพ์ข้อความคอมเมนต์ เช่น สนใจทักแชท, สอบถามรายละเอียดได้..."
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          className="min-h-[160px] w-full flex-1 resize-none overflow-y-auto rounded-sm border border-neutral-800 bg-neutral-950 p-3 text-sm leading-normal text-white placeholder-neutral-500 outline-none transition-colors focus:border-blue-500/50 md:min-h-0"
                        />
                      </div>
                    ) : (
                      <div className="flex min-h-0 flex-1 flex-col">
                        <div className="mb-1.5 flex shrink-0 items-center justify-between gap-2 text-xs text-neutral-400">
                          <span>รายการลิงก์หรือเลขกลุ่มเป้าหมาย (1 บรรทัดต่อ 1 รายการ)*</span>
                          <span className="shrink-0 text-[11px] text-neutral-500">
                            ทั้งหมด {parsedLinks.length} รายการ
                          </span>
                        </div>

                        <textarea
                          placeholder={`https://www.facebook.com/groups/123456789\n987654321`}
                          value={linksText}
                          onChange={(e) => {
                            setLinksText(e.target.value);
                            if (errorLink) setErrorLink(null);
                          }}
                          className={`min-h-[160px] w-full flex-1 resize-none overflow-y-auto rounded-sm border ${
                            errorLink
                              ? "border-red-500/60 focus:border-red-400"
                              : "border-neutral-800 focus:border-blue-500/50"
                          } bg-neutral-950 p-3 text-sm leading-normal text-white placeholder-neutral-500 outline-none transition-colors md:min-h-0`}
                        />
                        {errorLink && (
                          <p className="mt-1 shrink-0 text-xs text-red-400">
                            {errorLink}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions with Reaction Dropup and Settings Dropup */}
          <div className="flex shrink-0 flex-col gap-3 border-t border-neutral-800 bg-neutral-950 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
            {/* Left: Reaction Dropup & Group Settings Dropup */}
            <div className="flex items-center gap-2">
              {/* 1. Reaction Dropup */}
              <div className="relative flex-1 sm:flex-initial">
                <button
                  type="button"
                  onClick={() => {
                    setIsReactionOpen((prev) => !prev);
                    if (isSettingsOpen) setIsSettingsOpen(false);
                  }}
                  className={`flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-sm border px-3 text-xs font-medium transition sm:w-auto ${
                    randomReaction
                      ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                      : activeReactionObj
                      ? activeReactionObj.activeColor
                      : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-white"
                  }`}
                >
                  {randomReaction ? (
                    <span>สุ่มรีแอคชัน</span>
                  ) : activeReactionObj ? (
                    <>
                      <span className="text-base leading-none">
                        {activeReactionObj.emoji}
                      </span>
                      <span>{activeReactionObj.label}</span>
                    </>
                  ) : (
                    <span>เลือกรีแอคชัน</span>
                  )}

                  <ChevronUp
                    size={14}
                    className={`ml-0.5 shrink-0 text-neutral-500 transition-transform ${
                      isReactionOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isReactionOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsReactionOpen(false)}
                    />
                    <div className="absolute bottom-full left-0 z-30 mb-2 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-1 rounded-md border border-neutral-800 bg-neutral-950 p-1.5 sm:flex-nowrap">
                      {REACTIONS.map((item) => {
                        const isSelected = reaction === item.type;
                        return (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => {
                              setReaction(isSelected ? "" : item.type);
                              setIsReactionOpen(false);
                            }}
                            title={item.label}
                            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-lg transition hover:bg-neutral-900 sm:h-10 sm:w-10 sm:text-xl ${
                              isSelected
                                ? "border border-blue-500/40 bg-blue-500/10"
                                : ""
                            }`}
                          >
                            <span className="leading-none">{item.emoji}</span>
                            {isSelected && (
                              <span className="absolute bottom-1 h-1 w-1 rounded-sm bg-blue-400" />
                            )}
                          </button>
                        );
                      })}

                      {reaction && (
                        <>
                          <div className="mx-1 h-6 w-px bg-neutral-800" />
                          <button
                            type="button"
                            onClick={() => {
                              setReaction("");
                              setIsReactionOpen(false);
                            }}
                            title="ล้างรีแอคชัน"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-neutral-500 transition hover:bg-red-500/10 hover:text-red-400 sm:h-10 sm:w-10"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* 2. Group Settings Dropup */}
              <div className="relative flex-1 sm:flex-initial">
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen((prev) => !prev);
                    if (isReactionOpen) setIsReactionOpen(false);
                  }}
                  className={`flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-sm border px-3 text-xs font-medium transition sm:w-auto ${
                    hasAnyRandom
                      ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                      : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-white"
                  }`}
                >
                  <span>ตั้งค่ากลุ่ม</span>
                  <ChevronUp
                    size={14}
                    className={`ml-0.5 shrink-0 text-neutral-500 transition-transform ${
                      isSettingsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isSettingsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsSettingsOpen(false)}
                    />
                    <div className="absolute bottom-full right-0 z-30 mb-2 w-72 max-w-[calc(100vw-2rem)] rounded-md border border-neutral-800 bg-neutral-950 p-4 sm:left-0 sm:right-auto">
                      <div className="flex flex-col gap-4">
                        {/* Toggle 1: Random Content */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900 text-neutral-300">
                              <SquareText size={16} />
                            </div>
                            <div className="flex min-w-0 flex-col gap-0.5">
                              <span className="text-xs font-medium text-neutral-200">
                                สุ่มเนื้อหา
                              </span>
                              <span className="text-[10px] leading-4 text-neutral-400">
                                สุ่มชุดข้อความในแต่ละโพสต์
                              </span>
                            </div>
                          </div>
                          <SettingSwitch
                            checked={randomContent}
                            onChange={setRandomContent}
                          />
                        </div>

                        {/* Toggle 2: Random Image */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900 text-neutral-300">
                              <ImageIcon size={16} />
                            </div>
                            <div className="flex min-w-0 flex-col gap-0.5">
                              <span className="text-xs font-medium text-neutral-200">
                                สุ่มรูปภาพ
                              </span>
                              <span className="text-[10px] leading-4 text-neutral-400">
                                สุ่มภาพจากทั้งหมด
                              </span>
                            </div>
                          </div>
                          <SettingSwitch
                            checked={randomImage}
                            onChange={setRandomImage}
                          />
                        </div>

                        {/* Toggle 3: Random Reaction */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-900 text-neutral-300">
                              <Smile size={16} />
                            </div>
                            <div className="flex min-w-0 flex-col gap-0.5">
                              <span className="text-xs font-medium text-neutral-200">
                                สุ่มรีแอคชัน
                              </span>
                              <span className="text-[10px] leading-4 text-neutral-400">
                                สุ่มความรู้สึกในแต่ละโพสต์
                              </span>
                            </div>
                          </div>
                          <SettingSwitch
                            checked={randomReaction}
                            onChange={setRandomReaction}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Cancel & Submit Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 whitespace-nowrap rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white sm:flex-initial"
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-sm bg-blue-600 px-5 py-2 text-xs font-medium text-white transition hover:bg-blue-500 sm:flex-initial"
              >
                {isEdit ? "บันทึกการแก้ไข" : "สร้างกลุ่ม"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ControlGroupDialog;
