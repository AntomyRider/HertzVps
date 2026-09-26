"use client";

import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import Dialog, {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import ButtonUI from "@/components/ui/button";
import Dropdown, { DropdownOption } from "@/components/ui/dropdown";
import { useKeyStore } from "@/store/keyStore";
import { useProductStore } from "@/store/productStore";
import { toast } from "@/components/ui/toast";

interface KeyDialogFormState {
  count: string;
  selectedPreset: "1" | "7" | "30" | "custom";
  customDays: string;
  targetProductId: string;
  addedToProductName: string | null;
  countError: string | null;
  customDaysError: string | null;
  isSubmittingCreate: boolean;
  copiedAll: boolean;
  addDaysInput: string;
  addDaysError: string | null;
  isSubmittingAddTime: boolean;
}

const INITIAL_KEY_DIALOG_FORM: KeyDialogFormState = {
  count: "1",
  selectedPreset: "30",
  customDays: "30",
  targetProductId: "",
  addedToProductName: null,
  countError: null,
  customDaysError: null,
  isSubmittingCreate: false,
  copiedAll: false,
  addDaysInput: "30",
  addDaysError: null,
  isSubmittingAddTime: false,
};

export const DialogKey = () => {
  const {
    isCreateOpen,
    setIsCreateOpen,
    createKeys,
    createdKeysList,
    setCreatedKeysList,
    addingTimeToKey,
    setAddingTimeToKey,
    isAddTimeAllOpen,
    setIsAddTimeAllOpen,
    addTimeToKey,
    addTimeToAll,
  } = useKeyStore();

  const { products, fetchProducts } = useProductStore();

  const [form, setForm] = useState<KeyDialogFormState>(
    INITIAL_KEY_DIALOG_FORM
  );

  const updateForm = (patch: Partial<KeyDialogFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  // Fetch products when create dialog is opened
  useEffect(() => {
    if (isCreateOpen && products.length === 0) {
      fetchProducts();
    }
  }, [isCreateOpen, products.length, fetchProducts]);

  // 1. Create Dialog Handlers
  const handleCloseCreate = () => {
    if (form.isSubmittingCreate) return;
    setIsCreateOpen(false);
    updateForm({
      count: "1",
      selectedPreset: "30",
      customDays: "30",
      targetProductId: "",
      countError: null,
      customDaysError: null,
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let countError: string | null = null;
    let customDaysError: string | null = null;

    const countNum = parseInt(form.count, 10);
    if (isNaN(countNum) || countNum < 1 || countNum > 100) {
      countError = "กรุณาระบุจำนวนคีย์ระหว่าง 1 ถึง 100";
    }

    let days: number;
    if (form.selectedPreset === "1") {
      days = 1;
    } else if (form.selectedPreset === "7") {
      days = 7;
    } else if (form.selectedPreset === "30") {
      days = 30;
    } else {
      const parsedDays = parseInt(form.customDays, 10);
      if (isNaN(parsedDays) || parsedDays <= 0) {
        customDaysError = "กรุณาระบุจำนวนวันให้ถูกต้อง (มากกว่า 0 วัน)";
      }
      days = parsedDays || 30;
    }

    if (countError || customDaysError) {
      updateForm({ countError, customDaysError });
      return;
    }

    try {
      updateForm({
        isSubmittingCreate: true,
        countError: null,
        customDaysError: null,
      });

      const res = await createKeys({
        count: countNum,
        durationDays: days,
        targetProductId: form.targetProductId || undefined,
      });

      if (!res.success) {
        updateForm({ countError: res.error || "ไม่สามารถสร้างคีย์ได้" });
        return;
      }

      toast.success(
        "สร้างคีย์สำเร็จ",
        `สร้างคีย์ ${countNum} รายการเรียบร้อยแล้ว`
      );
      updateForm({ addedToProductName: res.addedToProductName || null });
      if (form.targetProductId) {
        fetchProducts(); // Refresh products so stock counts update
      }

      handleCloseCreate();
    } finally {
      updateForm({ isSubmittingCreate: false });
    }
  };

  // 2. Created Keys Modal Handlers
  const handleCopyAllCreated = () => {
    if (!createdKeysList || createdKeysList.length === 0) return;
    navigator.clipboard.writeText(createdKeysList.join("\n"));
    updateForm({ copiedAll: true });
    toast.success("คัดลอกสำเร็จ", "คัดลอกรหัสคีย์ทั้งหมดลงในคลิปบอร์ดแล้ว");
    setTimeout(() => updateForm({ copiedAll: false }), 2000);
  };

  // 3. Add Time Dialog Handlers
  const isAddTimeOpen = !!addingTimeToKey || isAddTimeAllOpen;

  const handleCloseAddTime = () => {
    if (form.isSubmittingAddTime) return;
    setAddingTimeToKey(null);
    setIsAddTimeAllOpen(false);
    updateForm({
      addDaysInput: "30",
      addDaysError: null,
    });
  };

  const handleAddTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const daysNum = parseInt(form.addDaysInput, 10);
    if (isNaN(daysNum) || daysNum <= 0) {
      updateForm({
        addDaysError: "กรุณาระบุจำนวนวันที่ต้องการเพิ่ม (มากกว่า 0 วัน)",
      });
      return;
    }

    try {
      updateForm({ isSubmittingAddTime: true, addDaysError: null });

      if (addingTimeToKey) {
        // Specific key
        const res = await addTimeToKey(addingTimeToKey.id, daysNum);
        if (!res.success) {
          updateForm({
            addDaysError: res.error || "ไม่สามารถเพิ่มเวลาให้คีย์ได้",
          });
          return;
        }
        toast.success(
          "เพิ่มเวลาสำเร็จ",
          `เพิ่มเวลา ${daysNum} วัน ให้กับคีย์เรียบร้อยแล้ว`
        );
      } else if (isAddTimeAllOpen) {
        // All keys
        const res = await addTimeToAll(daysNum);
        if (!res.success) {
          updateForm({
            addDaysError: res.error || "ไม่สามารถเพิ่มเวลาให้ทุกคีย์ได้",
          });
          return;
        }
        toast.success(
          "เพิ่มเวลาสำเร็จ",
          `เพิ่มเวลา ${daysNum} วัน ให้กับทุกคีย์ในระบบเรียบร้อยแล้ว`
        );
      }

      handleCloseAddTime();
    } finally {
      updateForm({ isSubmittingAddTime: false });
    }
  };

  const productOptions: DropdownOption[] = [
    { value: "", label: "ไม่เติมเข้าสต็อก (สร้างคีย์เปล่า)" },
    ...products.map((p) => {
      const stockCount = p.stock
        ? p.stock.split("\n").filter((l) => l.trim().length > 0).length
        : 0;
      return {
        value: p.id,
        label: `${p.name} (สต็อกเดิม: ${stockCount} ชิ้น)`,
      };
    }),
  ];

  return (
    <>
      {/* 1. Create Key Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={handleCloseCreate}>
        <DialogContent maxWidth="max-w-md" onClose={handleCloseCreate}>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>สร้างคีย์โปรแกรมใหม่</DialogTitle>
              <DialogDescription>
                สร้างรหัสคีย์สำหรับเปิดใช้งานโปรแกรม Hertz Manager
              </DialogDescription>
            </DialogHeader>

            {/* Form Fields */}
            <div className="space-y-3.5 py-1">
              {/* Number of Keys */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                  จำนวนคีย์ที่ต้องการสร้าง (1 - 100) <span className="text-red-400">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={form.count}
                  onChange={(e) =>
                    updateForm({
                      count: e.target.value,
                      countError: null,
                    })
                  }
                  disabled={form.isSubmittingCreate}
                  className={form.countError ? "border-red-500/50 focus:border-red-500" : ""}
                  autoFocus
                />
                {form.countError && (
                  <span className="mt-1.5 block text-xs text-red-400 font-medium">
                    {form.countError}
                  </span>
                )}
              </div>

              {/* Duration Presets */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                  ระยะเวลาใช้งาน <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(
                    [
                      { id: "1", label: "1 วัน" },
                      { id: "7", label: "7 วัน" },
                      { id: "30", label: "30 วัน" },
                      { id: "custom", label: "กำหนดเอง" },
                    ] as const
                  ).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={form.isSubmittingCreate}
                      onClick={() =>
                        updateForm({
                          selectedPreset: preset.id,
                          customDaysError: null,
                        })
                      }
                      className={`rounded-sm border py-2 text-xs font-medium transition ${
                        form.selectedPreset === preset.id
                          ? "border-blue-500/50 bg-blue-500/10 text-blue-400 font-semibold"
                          : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-white"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {form.selectedPreset === "custom" && (
                  <div className="mt-2.5">
                    <Input
                      type="number"
                      min="1"
                      placeholder="ระบุจำนวนวัน เช่น 90, 365"
                      value={form.customDays}
                      onChange={(e) =>
                        updateForm({
                          customDays: e.target.value,
                          customDaysError: null,
                        })
                      }
                      disabled={form.isSubmittingCreate}
                      className={form.customDaysError ? "border-red-500/50 focus:border-red-500" : ""}
                    />
                    {form.customDaysError && (
                      <span className="mt-1.5 block text-xs text-red-400 font-medium">
                        {form.customDaysError}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Target Product (Optional auto-stock inject) */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                  เติมเข้าสต็อกสินค้าทันที (ไม่บังคับ)
                </label>
                <Dropdown
                  options={productOptions}
                  value={form.targetProductId}
                  onChange={(val) => updateForm({ targetProductId: val })}
                  placeholder="เลือกสินค้าที่ต้องการเติมคีย์เข้าสต็อก..."
                  disabled={form.isSubmittingCreate}
                />
                <span className="mt-1 block text-[11px] text-neutral-500">
                  หากเลือกสินค้า ระบบจะนำรหัสคีย์ที่สร้างทั้งหมดไปต่อท้ายในสต็อกให้อัตโนมัติ
                </span>
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                disabled={form.isSubmittingCreate}
                onClick={handleCloseCreate}
                className="rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white disabled:opacity-50 cursor-pointer"
              >
                ยกเลิก
              </button>

              <ButtonUI
                type="submit"
                disabled={form.isSubmittingCreate}
                isLoading={form.isSubmittingCreate}
                className="rounded-sm bg-blue-600 px-5 py-2 text-xs font-medium text-white transition hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
              >
                สร้างรหัสคีย์
              </ButtonUI>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Created Keys Success Preview Modal */}
      <Dialog
        open={!!createdKeysList && createdKeysList.length > 0}
        onOpenChange={() => setCreatedKeysList(null)}
      >
        <DialogContent maxWidth="max-w-lg" onClose={() => setCreatedKeysList(null)}>
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>สร้างคีย์สำเร็จ!</DialogTitle>
              <DialogDescription>
                ระบบได้สร้างรหัสคีย์เรียบร้อยแล้ว {createdKeysList?.length} รายการ
                {form.addedToProductName && (
                  <span className="mt-1 block font-medium text-emerald-400">
                    และได้เติมเข้าสต็อกของสินค้า &quot;{form.addedToProductName}&quot; เรียบร้อยแล้ว
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {/* Keys Textarea Display */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-300">
                  รายการรหัสคีย์ทั้งหมด:
                </span>
                <button
                  type="button"
                  onClick={handleCopyAllCreated}
                  className="flex items-center gap-1 text-[11px] text-blue-400 transition hover:text-blue-300 cursor-pointer"
                >
                  {form.copiedAll ? <Check size={12} /> : <Copy size={12} />}
                  <span>{form.copiedAll ? "คัดลอกแล้ว" : "คัดลอกทั้งหมด"}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={Math.min(10, Math.max(4, createdKeysList?.length || 4))}
                value={createdKeysList?.join("\n") || ""}
                className="w-full resize-none rounded-sm border border-neutral-800 bg-neutral-900/60 p-2.5 text-xs text-neutral-200 outline-none leading-relaxed select-all"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <span className="mt-1 block text-[11px] text-neutral-500">
                * กรุณาคัดลอกรหัสคีย์เก็บไว้ หรือส่งมอบให้ลูกค้าตามต้องการ
              </span>
            </div>

            <DialogFooter>
              <ButtonUI
                onClick={() => setCreatedKeysList(null)}
                className="rounded-sm bg-neutral-800 px-5 py-2 text-xs font-medium text-white transition hover:bg-neutral-700 cursor-pointer"
              >
                ปิดหน้าต่าง
              </ButtonUI>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* 3. Add Time Dialog (Specific or All) */}
      <Dialog open={isAddTimeOpen} onOpenChange={handleCloseAddTime}>
        <DialogContent maxWidth="max-w-sm" onClose={handleCloseAddTime}>
          <form onSubmit={handleAddTimeSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {addingTimeToKey
                  ? "เพิ่มเวลาให้กับคีย์"
                  : "เพิ่มเวลาให้กับทุกคีย์"}
              </DialogTitle>
              <DialogDescription>
                {addingTimeToKey ? (
                  <>
                    เพิ่มวันใช้งานให้กับคีย์{" "}
                    <span className="font-semibold text-white">
                      {addingTimeToKey.code}
                    </span>
                  </>
                ) : (
                  "เพิ่มจำนวนวันใช้งานให้กับทุกคีย์ในระบบพร้อมกัน"
                )}
              </DialogDescription>
            </DialogHeader>

            {/* Add Time Input */}
            <div className="space-y-3 py-1">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                  จำนวนวันที่ต้องการเพิ่ม (วัน) <span className="text-red-400">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="เช่น 7, 30, 90"
                  value={form.addDaysInput}
                  onChange={(e) =>
                    updateForm({
                      addDaysInput: e.target.value,
                      addDaysError: null,
                    })
                  }
                  disabled={form.isSubmittingAddTime}
                  className={form.addDaysError ? "border-red-500/50 focus:border-red-500" : ""}
                  autoFocus
                />
                {form.addDaysError && (
                  <span className="mt-1.5 block text-xs text-red-400 font-medium">
                    {form.addDaysError}
                  </span>
                )}
              </div>

              {/* Quick preset buttons */}
              <div className="flex items-center gap-1.5">
                {[7, 15, 30, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    disabled={form.isSubmittingAddTime}
                    onClick={() =>
                      updateForm({
                        addDaysInput: String(d),
                        addDaysError: null,
                      })
                    }
                    className={`flex-1 rounded-sm border py-1 text-[11px] font-medium transition ${
                      form.addDaysInput === String(d)
                        ? "border-blue-500/50 bg-blue-500/10 text-blue-400 font-semibold"
                        : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    +{d}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                disabled={form.isSubmittingAddTime}
                onClick={handleCloseAddTime}
                className="rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white disabled:opacity-50 cursor-pointer"
              >
                ยกเลิก
              </button>

              <ButtonUI
                type="submit"
                disabled={form.isSubmittingAddTime || !form.addDaysInput}
                isLoading={form.isSubmittingAddTime}
                className="rounded-sm bg-blue-600 px-5 py-2 text-xs font-medium text-white transition hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
              >
                ยืนยันการเพิ่มเวลา
              </ButtonUI>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DialogKey;
