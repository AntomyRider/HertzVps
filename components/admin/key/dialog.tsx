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

  // Create form state
  const [count, setCount] = useState("1");
  const [selectedPreset, setSelectedPreset] = useState<"1" | "7" | "30" | "custom">("30");
  const [customDays, setCustomDays] = useState("30");
  const [targetProductId, setTargetProductId] = useState("");
  const [addedToProductName, setAddedToProductName] = useState<string | null>(null);
  const [countError, setCountError] = useState<string | null>(null);
  const [customDaysError, setCustomDaysError] = useState<string | null>(null);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Fetch products when create dialog is opened
  useEffect(() => {
    if (isCreateOpen && products.length === 0) {
      fetchProducts();
    }
  }, [isCreateOpen, products.length, fetchProducts]);

  // Copy state for created keys
  const [copiedAll, setCopiedAll] = useState(false);

  // Add time form state
  const [addDaysInput, setAddDaysInput] = useState("30");
  const [addDaysError, setAddDaysError] = useState<string | null>(null);
  const [isSubmittingAddTime, setIsSubmittingAddTime] = useState(false);

  // 1. Create Dialog Handlers
  const handleCloseCreate = () => {
    if (isSubmittingCreate) return;
    setIsCreateOpen(false);
    setCount("1");
    setSelectedPreset("30");
    setCustomDays("30");
    setTargetProductId("");
    setCountError(null);
    setCustomDaysError(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    const countNum = parseInt(count, 10);
    if (isNaN(countNum) || countNum < 1 || countNum > 100) {
      setCountError("กรุณาระบุจำนวนคีย์ระหว่าง 1 ถึง 100");
      hasError = true;
    }

    let days: number;
    if (selectedPreset === "1") {
      days = 1;
    } else if (selectedPreset === "7") {
      days = 7;
    } else if (selectedPreset === "30") {
      days = 30;
    } else {
      const parsedDays = parseInt(customDays, 10);
      if (isNaN(parsedDays) || parsedDays <= 0) {
        setCustomDaysError("กรุณาระบุจำนวนวันให้ถูกต้อง (มากกว่า 0 วัน)");
        hasError = true;
      }
      days = parsedDays || 30;
    }

    if (hasError) return;

    try {
      setIsSubmittingCreate(true);
      setCountError(null);
      setCustomDaysError(null);

      const res = await createKeys({
        count: countNum,
        durationDays: days,
        targetProductId: targetProductId || undefined,
      });

      if (!res.success) {
        setCountError(res.error || "ไม่สามารถสร้างคีย์ได้");
        return;
      }

      toast.success("สร้างคีย์สำเร็จ", `สร้างคีย์ ${countNum} รายการเรียบร้อยแล้ว`);
      setAddedToProductName(res.addedToProductName || null);
      if (targetProductId) {
        fetchProducts(); // Refresh products so stock counts update
      }

      handleCloseCreate();
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // 2. Created Keys Modal Handlers
  const handleCopyAllCreated = () => {
    if (!createdKeysList || createdKeysList.length === 0) return;
    navigator.clipboard.writeText(createdKeysList.join("\n"));
    setCopiedAll(true);
    toast.success("คัดลอกสำเร็จ", "คัดลอกรหัสคีย์ทั้งหมดลงในคลิปบอร์ดแล้ว");
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // 3. Add Time Dialog Handlers
  const isAddTimeOpen = !!addingTimeToKey || isAddTimeAllOpen;

  const handleCloseAddTime = () => {
    if (isSubmittingAddTime) return;
    setAddingTimeToKey(null);
    setIsAddTimeAllOpen(false);
    setAddDaysInput("30");
    setAddDaysError(null);
  };

  const handleAddTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const daysNum = parseInt(addDaysInput, 10);
    if (isNaN(daysNum) || daysNum <= 0) {
      setAddDaysError("กรุณาระบุจำนวนวันที่ต้องการเพิ่ม (มากกว่า 0 วัน)");
      return;
    }

    try {
      setIsSubmittingAddTime(true);
      setAddDaysError(null);

      if (addingTimeToKey) {
        // Specific key
        const res = await addTimeToKey(addingTimeToKey.id, daysNum);
        if (!res.success) {
          setAddDaysError(res.error || "ไม่สามารถเพิ่มเวลาให้คีย์ได้");
          return;
        }
        toast.success("เพิ่มเวลาสำเร็จ", `เพิ่มเวลา ${daysNum} วัน ให้กับคีย์เรียบร้อยแล้ว`);
      } else if (isAddTimeAllOpen) {
        // All keys
        const res = await addTimeToAll(daysNum);
        if (!res.success) {
          setAddDaysError(res.error || "ไม่สามารถเพิ่มเวลาให้ทุกคีย์ได้");
          return;
        }
        toast.success("เพิ่มเวลาสำเร็จ", `เพิ่มเวลา ${daysNum} วัน ให้กับทุกคีย์ในระบบเรียบร้อยแล้ว`);
      }

      handleCloseAddTime();
    } finally {
      setIsSubmittingAddTime(false);
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
                  value={count}
                  onChange={(e) => {
                    setCount(e.target.value);
                    if (countError) setCountError(null);
                  }}
                  disabled={isSubmittingCreate}
                  className={countError ? "border-red-500/50 focus:border-red-500" : ""}
                  autoFocus
                />
                {countError && (
                  <span className="mt-1.5 block text-xs text-red-400 font-medium">
                    {countError}
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
                      disabled={isSubmittingCreate}
                      onClick={() => {
                        setSelectedPreset(preset.id);
                        if (customDaysError) setCustomDaysError(null);
                      }}
                      className={`rounded-sm border py-2 text-xs font-medium transition ${
                        selectedPreset === preset.id
                          ? "border-blue-500/50 bg-blue-500/10 text-blue-400 font-semibold"
                          : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-white"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {selectedPreset === "custom" && (
                  <div className="mt-2.5">
                    <Input
                      type="number"
                      min="1"
                      placeholder="ระบุจำนวนวัน เช่น 90, 365"
                      value={customDays}
                      onChange={(e) => {
                        setCustomDays(e.target.value);
                        if (customDaysError) setCustomDaysError(null);
                      }}
                      disabled={isSubmittingCreate}
                      className={customDaysError ? "border-red-500/50 focus:border-red-500" : ""}
                    />
                    {customDaysError && (
                      <span className="mt-1.5 block text-xs text-red-400 font-medium">
                        {customDaysError}
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
                  value={targetProductId}
                  onChange={(val) => setTargetProductId(val)}
                  placeholder="เลือกสินค้าที่ต้องการเติมคีย์เข้าสต็อก..."
                  disabled={isSubmittingCreate}
                />
                <span className="mt-1 block text-[11px] text-neutral-500">
                  หากเลือกสินค้า ระบบจะนำรหัสคีย์ที่สร้างทั้งหมดไปต่อท้ายในสต็อกให้อัตโนมัติ
                </span>
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                disabled={isSubmittingCreate}
                onClick={handleCloseCreate}
                className="rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white disabled:opacity-50 cursor-pointer"
              >
                ยกเลิก
              </button>

              <ButtonUI
                type="submit"
                disabled={isSubmittingCreate}
                isLoading={isSubmittingCreate}
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
                {addedToProductName && (
                  <span className="mt-1 block font-medium text-emerald-400">
                    และได้เติมเข้าสต็อกของสินค้า &quot;{addedToProductName}&quot; เรียบร้อยแล้ว
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
                  {copiedAll ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedAll ? "คัดลอกแล้ว" : "คัดลอกทั้งหมด"}</span>
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
                  value={addDaysInput}
                  onChange={(e) => {
                    setAddDaysInput(e.target.value);
                    if (addDaysError) setAddDaysError(null);
                  }}
                  disabled={isSubmittingAddTime}
                  className={addDaysError ? "border-red-500/50 focus:border-red-500" : ""}
                  autoFocus
                />
                {addDaysError && (
                  <span className="mt-1.5 block text-xs text-red-400 font-medium">
                    {addDaysError}
                  </span>
                )}
              </div>

              {/* Quick preset buttons */}
              <div className="flex items-center gap-1.5">
                {[7, 15, 30, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    disabled={isSubmittingAddTime}
                    onClick={() => {
                      setAddDaysInput(String(d));
                      if (addDaysError) setAddDaysError(null);
                    }}
                    className={`flex-1 rounded-sm border py-1 text-[11px] font-medium transition ${
                      addDaysInput === String(d)
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
                disabled={isSubmittingAddTime}
                onClick={handleCloseAddTime}
                className="rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white disabled:opacity-50 cursor-pointer"
              >
                ยกเลิก
              </button>

              <ButtonUI
                type="submit"
                disabled={isSubmittingAddTime || !addDaysInput}
                isLoading={isSubmittingAddTime}
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
