"use client";

import { useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  X,
  Link2,
  Link,
  FileText,
  MessageSquare,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import ButtonUI from "@/components/ui/button";
import {
  useControllerStore,
  type ControllerReactionType,
} from "@/store/controllerStore";
import ReactionGroupManageController from "./reaction";
import SettingGroupManageController from "./setting";

interface DialogGroupManageControllerProps {
  accountId: string;
}

type RightTabType = "links" | "content" | "comment";

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
  activeTab: "links",
};

export default function DialogGroupManageController({
  accountId,
}: DialogGroupManageControllerProps) {
  const {
    isGroupDialogOpen,
    editingGroup,
    closeGroupDialog,
    saveGroup,
  } = useControllerStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<GroupFormState>(INITIAL_GROUP_FORM);

  const updateForm = (patch: Partial<GroupFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  // Sync form state when dialog opens or editingGroup changes
  useEffect(() => {
    if (!isGroupDialogOpen) return;

    if (editingGroup) {
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
        activeTab: "links",
      });
    } else {
      setForm(INITIAL_GROUP_FORM);
    }
  }, [isGroupDialogOpen, editingGroup]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { activeTab: _, ...payload } = form;
    saveGroup(accountId, payload);
  };

  const countNonEmptyLines = (val: string) =>
    val
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean).length;

  const tabs: {
    key: RightTabType;
    label: string;
    icon: typeof Link2;
    count: number;
  }[] = [
    {
      key: "links",
      label: "ลิ้งค์",
      icon: Link,
      count: countNonEmptyLines(form.links),
    },
    {
      key: "content",
      label: "คอนเทนต์",
      icon: FileText,
      count: countNonEmptyLines(form.content),
    },
    {
      key: "comment",
      label: "คอมเมนต์",
      icon: MessageSquare,
      count: countNonEmptyLines(form.comment),
    },
  ];

  return (
    <Dialog
      open={isGroupDialogOpen}
      onOpenChange={(open) => {
        if (!open) closeGroupDialog();
      }}
    >
      <DialogContent maxWidth="max-w-4xl" onClose={closeGroupDialog}>
        <DialogHeader>
          <DialogTitle>
            {editingGroup ? "จัดการข้อมูลกลุ่ม" : "เพิ่มกลุ่มใหม่"}
          </DialogTitle>
          <DialogDescription>
            {editingGroup
              ? "อัปเดตชื่อกลุ่ม รูปภาพ และกำหนดรายการลิ้งค์ คอนเทนต์ และคอมเมนต์"
              : "กำหนดชื่อกลุ่ม เลือกรูปภาพจากเครื่องได้หลายภาพ และตั้งค่าลิ้งค์ คอนเทนต์ คอมเมนต์"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
            {/* Left Column: Name & Full-Height Multi-Image Upload */}
            <div className="flex flex-col space-y-4 lg:col-span-5">
              {/* Group Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-400">
                  ชื่อกลุ่ม
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                  placeholder="ระบุชื่อหมวดหมู่กลุ่ม..."
                  required
                />
              </div>

              {/* Multi-Image Upload from Device (Full Remaining Height) */}
              <div className="flex flex-1 flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-neutral-400">
                    รูปภาพ ({form.images.length} ภาพ)
                  </label>

                  {form.images.length > 0 && (
                    <button
                      type="button"
                      onClick={() => updateForm({ images: [] })}
                      className="inline-flex cursor-pointer items-center gap-1 text-xs text-red-400 transition hover:text-red-300"
                    >
                      <Trash2 size={12} />
                      <span>ล้างทั้งหมด</span>
                    </button>
                  )}
                </div>

                {/* Hidden File Input (Multiple) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFilesSelected}
                  className="hidden"
                />

                {/* Full-Height Upload Box & Image Grid Container */}
                <div className="flex min-h-[220px] flex-1 flex-col rounded-md border border-dashed border-neutral-800 bg-neutral-900/40 p-3 transition hover:border-blue-500/40">
                  {form.images.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-full w-full flex-1 cursor-pointer flex-col items-center justify-center gap-2 text-center"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-800 bg-neutral-950 text-blue-400">
                        <ImagePlus size={20} strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">
                          คลิกเพื่อเลือกรูปภาพจากเครื่อง
                        </p>
                        <p className="mt-0.5 text-[11px] text-neutral-500">
                          สามารถเลือกพร้อมกันได้หลายภาพ (PNG, JPG, WEBP)
                        </p>
                      </div>
                    </button>
                  ) : (
                    <div className="flex flex-1 flex-col justify-between gap-3">
                      <div className="grid max-h-[185px] grid-cols-3 gap-2 overflow-y-auto pr-1">
                        {form.images.map((imgSrc, idx) => (
                          <div
                            key={`${idx}-${imgSrc.slice(0, 24)}`}
                            className="group relative aspect-square overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900"
                          >
                            <img
                              src={imgSrc}
                              alt={`รูปที่ ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />

                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 rounded-sm bg-black/80 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
                                ภาพหลัก
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              title="ลบรูปนี้"
                              className="absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm bg-black/80 text-neutral-300 transition hover:bg-red-600 hover:text-white"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-neutral-800 bg-neutral-950 py-2 text-xs font-medium text-blue-400 transition hover:border-blue-500/40 hover:bg-blue-500/10"
                      >
                        <ImagePlus size={14} strokeWidth={1.8} />
                        <span>เพิ่มรูปภาพจากเครื่อง</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Tabs (ลิ้งค์, คอนเทนต์, คอมเมนต์) */}
            <div className="flex flex-col space-y-3 lg:col-span-7">
              {/* Tab Bar */}
              <div className="flex items-center gap-1.5 rounded-sm border border-neutral-800 bg-neutral-900/60 p-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = form.activeTab === tab.key;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => updateForm({ activeTab: tab.key })}
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-sm px-3 py-2 text-xs font-medium transition ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                      }`}
                    >
                      <Icon size={14} strokeWidth={1.8} />
                      <span>{tab.label}</span>
                      <span
                        className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${
                          isActive
                            ? "bg-blue-700 text-white"
                            : "bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Area */}
              <div className="flex flex-1 flex-col">
                {form.activeTab === "links" && (
                  <div className="flex flex-1 flex-col space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-neutral-400">
                        รายการลิ้งค์กลุ่ม
                      </label>
                      <span className="text-[11px] text-neutral-500">
                        ทั้งหมด {countNonEmptyLines(form.links)} ลิ้งค์
                      </span>
                    </div>
                    <Textarea
                      value={form.links}
                      onChange={(e) => updateForm({ links: e.target.value })}
                      placeholder={
                        "https://facebook.com/groups/example1\nhttps://facebook.com/groups/example2"
                      }
                      className="min-h-[240px] flex-1 resize-none"
                    />
                  </div>
                )}

                {form.activeTab === "content" && (
                  <div className="flex flex-1 flex-col space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-neutral-400">
                        ข้อความคอนเทนต์สำหรับโพสต์
                      </label>
                      <span className="text-[11px] text-neutral-500">
                        {form.content.length} ตัวอักษร
                      </span>
                    </div>
                    <Textarea
                      value={form.content}
                      onChange={(e) => updateForm({ content: e.target.value })}
                      placeholder="พิมพ์ข้อความแคปชั่นหรือเนื้อหาที่ต้องการโพสต์..."
                      className="min-h-[240px] flex-1 resize-none"
                    />
                  </div>
                )}

                {form.activeTab === "comment" && (
                  <div className="flex flex-1 flex-col space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-neutral-400">
                        ข้อความคอมเมนต์ใต้โพสต์
                      </label>
                      <span className="text-[11px] text-neutral-500">
                        {form.comment.length} ตัวอักษร
                      </span>
                    </div>
                    <Textarea
                      value={form.comment}
                      onChange={(e) => updateForm({ comment: e.target.value })}
                      placeholder="พิมพ์ข้อความสำหรับคอมเมนต์ใต้โพสต์..."
                      className="min-h-[240px] flex-1 resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dialog Footer: Reaction Dropup + Setting Dropup on Left, Action Buttons on Right */}
          <div className="flex flex-col gap-3 border-t border-neutral-900 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:items-center">
              <ReactionGroupManageController
                value={form.reaction}
                onChange={(reaction) => updateForm({ reaction })}
              />

              <SettingGroupManageController
                values={{
                  randomContent: form.randomContent,
                  randomImage: form.randomImage,
                  randomReaction: form.randomReaction,
                }}
                onChange={(patch) => updateForm(patch)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
              <ButtonUI
                type="button"
                onClick={closeGroupDialog}
                className="cursor-pointer border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                ยกเลิก
              </ButtonUI>

              <ButtonUI
                type="submit"
                className="cursor-pointer bg-blue-600 px-5 py-2 text-xs hover:bg-blue-500"
              >
                {editingGroup ? "บันทึกการแก้ไข" : "สร้างกลุ่มใหม่"}
              </ButtonUI>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
