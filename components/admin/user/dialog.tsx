"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { User as UserIcon } from "lucide-react";
import Dialog, {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import Dropdown from "@/components/ui/dropdown";
import ButtonUI from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";
import { toast } from "@/components/ui/toast";
import { isValidImageUrl } from "@/lib/utils";

const roleDropdownOptions = [
  { value: "USER", label: "สมาชิกทั่วไป (USER)" },
  { value: "ADMIN", label: "ผู้ดูแลระบบ (ADMIN)" },
];

interface UserFormState {
  role: "USER" | "ADMIN";
  balance: string;
  balanceError: string | null;
  isSubmitting: boolean;
}

const INITIAL_USER_FORM: UserFormState = {
  role: "USER",
  balance: "",
  balanceError: null,
  isSubmitting: false,
};

export const DialogUser = () => {
  const { editingUser, setEditingUser, updateUser } = useUserStore();

  const isOpen = !!editingUser;

  const [form, setForm] = useState<UserFormState>(INITIAL_USER_FORM);

  const updateForm = (patch: Partial<UserFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  useEffect(() => {
    if (editingUser) {
      setForm({
        role: editingUser.role,
        balance: String(editingUser.balance),
        balanceError: null,
        isSubmitting: false,
      });
    } else {
      setForm(INITIAL_USER_FORM);
    }
  }, [editingUser]);

  const handleClose = () => {
    if (form.isSubmitting) return;
    setEditingUser(null);
    updateForm({ balanceError: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const numBalance = Number(form.balance);
    if (form.balance === "" || isNaN(numBalance) || numBalance < 0) {
      updateForm({
        balanceError: "กรุณาระบุยอดเงินที่ถูกต้อง (มากกว่าหรือเท่ากับ 0)",
      });
      return;
    }

    try {
      updateForm({ isSubmitting: true, balanceError: null });

      const res = await updateUser(editingUser.id, {
        role: form.role,
        balance: numBalance,
      });

      if (!res.success) {
        updateForm({
          balanceError: res.error || "ไม่สามารถอัปเดตข้อมูลผู้ใช้งานได้",
        });
        return;
      }

      toast.success(
        "บันทึกข้อมูลสำเร็จ",
        `อัปเดตข้อมูลผู้ใช้ "${editingUser.name}" เรียบร้อยแล้ว`
      );
      handleClose();
    } finally {
      updateForm({ isSubmitting: false });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent maxWidth="max-w-xl" onClose={handleClose}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลผู้ใช้งาน</DialogTitle>
            <DialogDescription>
              ปรับเปลี่ยนสิทธิ์บทบาทและจัดการยอดเงินคงเหลือของผู้ใช้งาน
            </DialogDescription>
          </DialogHeader>

          {/* Form Body: Left User Profile Preview + Right Form Fields */}
          <div className="grid grid-cols-1 gap-5 py-1 sm:grid-cols-[160px_1fr]">
            {/* Left Column: Avatar & Discord Info */}
            <div className="flex flex-col items-center justify-center space-y-2.5 rounded-sm border border-neutral-800 bg-neutral-900/40 p-4 text-center">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-800 bg-neutral-900">
                {isValidImageUrl(editingUser?.avatar) ? (
                  <Image
                    src={editingUser!.avatar!}
                    alt={editingUser?.name || "User"}
                    fill
                    className="object-cover"
                    unoptimized={editingUser!.avatar!.startsWith("http")}
                  />
                ) : (
                  <UserIcon size={32} className="text-neutral-500" />
                )}
              </div>

              <div className="min-w-0 max-w-full">
                <span className="block truncate text-sm font-semibold text-white">
                  {editingUser?.name}
                </span>
                <span className="block truncate text-[11px] text-neutral-500">
                  ID: {editingUser?.discordId}
                </span>
              </div>
            </div>

            {/* Right Column: Editable Fields */}
            <div className="space-y-3">
              {/* Role Selection */}
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-300">
                  บทบาท (Role) <span className="text-red-400">*</span>
                </label>
                <Dropdown
                  options={roleDropdownOptions}
                  value={form.role}
                  onChange={(val) =>
                    updateForm({ role: val as "USER" | "ADMIN" })
                  }
                  disabled={form.isSubmitting}
                />
              </div>

              {/* Balance Management */}
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-300">
                  ยอดเงินคงเหลือในกระเป๋า (บาท) <span className="text-red-400">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.balance}
                  onChange={(e) =>
                    updateForm({
                      balance: e.target.value,
                      balanceError: null,
                    })
                  }
                  disabled={form.isSubmitting}
                  className={form.balanceError ? "border-red-500/50 focus:border-red-500" : ""}
                />
                {form.balanceError && (
                  <span className="mt-1.5 block text-xs text-red-400 font-medium">
                    {form.balanceError}
                  </span>
                )}
                <span className="mt-1 block text-[11px] text-neutral-500">
                  * กำหนดยอดเงินคงเหลือใหม่ของผู้ใช้ได้โดยตรง
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              disabled={form.isSubmitting}
              onClick={handleClose}
              className="rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white disabled:opacity-50 cursor-pointer"
            >
              ยกเลิก
            </button>

            <ButtonUI
              type="submit"
              disabled={form.isSubmitting}
              isLoading={form.isSubmitting}
              className="rounded-sm bg-blue-600 px-5 py-2 text-xs font-medium text-white transition hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
            >
              บันทึกข้อมูล
            </ButtonUI>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogUser;
