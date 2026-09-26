"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Phone,
  Landmark,
  CreditCard,
  User,
} from "lucide-react";
import Input from "@/components/ui/input";
import ButtonUI from "@/components/ui/button";
import Toggle from "@/components/ui/toggle";
import FadeIn from "@/components/ui/fade-in";
import { usePaymentStore } from "@/store/paymentStore";
import { toast } from "@/components/ui/toast";

const POPULAR_BANKS = [
  "ธนาคารกสิกรไทย (KBANK)",
  "ธนาคารไทยพาณิชย์ (SCB)",
  "ธนาคารกรุงไทย (KTB)",
  "ธนาคารกรุงเทพ (BBL)",
  "ธนาคารกรุงศรีอยุธยา (BAY)",
  "ธนาคารทหารไทยธนชาต (TTB)",
  "พร้อมเพย์ (PromptPay)",
];

interface TopupSettingFormState {
  tmPhone: string;
  tmEnabled: boolean;
  tmPhoneError: string | null;
  isTmSaving: boolean;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankEnabled: boolean;
  bankNameError: string | null;
  bankAccountNumberError: string | null;
  isBankSaving: boolean;
}

const INITIAL_TOPUP_SETTING_FORM: TopupSettingFormState = {
  tmPhone: "",
  tmEnabled: true,
  tmPhoneError: null,
  isTmSaving: false,
  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  bankEnabled: false,
  bankNameError: null,
  bankAccountNumberError: null,
  isBankSaving: false,
};

export const TopupSettingContainer = () => {
  const {
    paymentSetting,
    isLoadingSetting,
    fetchPaymentSetting,
    savePaymentSetting,
  } = usePaymentStore();

  const [form, setForm] = useState<TopupSettingFormState>(
    INITIAL_TOPUP_SETTING_FORM
  );

  const updateForm = (patch: Partial<TopupSettingFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  useEffect(() => {
    fetchPaymentSetting();
  }, [fetchPaymentSetting]);

  useEffect(() => {
    if (paymentSetting) {
      updateForm({
        tmPhone: paymentSetting.truemoneyPhone || "",
        tmEnabled: paymentSetting.truemoneyEnabled ?? true,
        bankName: paymentSetting.bankName || "",
        bankAccountName: paymentSetting.bankAccountName || "",
        bankAccountNumber: paymentSetting.bankAccountNumber || "",
        bankEnabled: paymentSetting.bankEnabled ?? false,
        tmPhoneError: null,
        bankNameError: null,
        bankAccountNumberError: null,
      });
    }
  }, [paymentSetting]);

  // Handle Save TrueMoney
  const handleSaveTrueMoney = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = form.tmPhone.replace(/[^0-9]/g, "");
    if (!cleanPhone) {
      updateForm({ tmPhoneError: "กรุณาระบุเบอร์โทรศัพท์ TrueMoney" });
      return;
    }
    if (cleanPhone.length !== 10) {
      updateForm({
        tmPhoneError:
          "เบอร์โทรศัพท์ TrueMoney ต้องเป็นตัวเลข 10 หลัก (เช่น 0812345678)",
      });
      return;
    }

    try {
      updateForm({ isTmSaving: true, tmPhoneError: null });
      const res = await savePaymentSetting({
        truemoneyPhone: cleanPhone,
        truemoneyEnabled: form.tmEnabled,
      });

      if (!res.success) {
        updateForm({
          tmPhoneError: res.error || "ไม่สามารถบันทึกการตั้งค่า TrueMoney ได้",
        });
        return;
      }

      toast.success("บันทึกสำเร็จ", "บันทึกการตั้งค่า TrueMoney เรียบร้อยแล้ว");
    } finally {
      updateForm({ isTmSaving: false });
    }
  };

  // Handle Save Bank
  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();

    let bankNameError: string | null = null;
    let bankAccountNumberError: string | null = null;

    if (form.bankEnabled) {
      if (!form.bankName.trim()) {
        bankNameError = "กรุณาระบุชื่อธนาคาร";
      }
      if (!form.bankAccountNumber.trim()) {
        bankAccountNumberError = "กรุณาระบุเลขที่บัญชี";
      }
    }

    if (bankNameError || bankAccountNumberError) {
      updateForm({ bankNameError, bankAccountNumberError });
      return;
    }

    try {
      updateForm({
        isBankSaving: true,
        bankNameError: null,
        bankAccountNumberError: null,
      });

      const res = await savePaymentSetting({
        bankEnabled: form.bankEnabled,
        bankName: form.bankName.trim(),
        bankAccountName: form.bankAccountName.trim(),
        bankAccountNumber: form.bankAccountNumber.trim(),
      });

      if (!res.success) {
        updateForm({
          bankNameError: res.error || "ไม่สามารถบันทึกการตั้งค่าธนาคารได้",
        });
        return;
      }

      toast.success("บันทึกสำเร็จ", "บันทึกการตั้งค่าบัญชีธนาคารเรียบร้อยแล้ว");
    } finally {
      updateForm({ isBankSaving: false });
    }
  };

  if (isLoadingSetting && !paymentSetting) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 py-4">
        <div className="h-64 animate-pulse rounded-md border border-neutral-800 bg-neutral-900/50" />
        <div className="h-64 animate-pulse rounded-md border border-neutral-800 bg-neutral-900/50" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Column 1: TrueMoney Wallet */}
      <FadeIn
        direction="up"
        className="rounded-md border border-neutral-800 bg-neutral-950 p-5 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-800 bg-neutral-900">
              <Image
                src="/truemoney.png"
                alt="TrueMoney"
                width={26}
                height={26}
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                TrueMoney Wallet
              </h2>
              <p className="text-xs text-neutral-400">
                แลกเงินจากซองของขวัญอัตโนมัติ
              </p>
            </div>
          </div>

          <Toggle
            checked={form.tmEnabled}
            onCheckedChange={(tmEnabled) => updateForm({ tmEnabled })}
            activeText="เปิดใช้งาน"
            inactiveText="ปิดใช้งาน"
            aria-label="เปิด/ปิด การรับเงิน TrueMoney"
          />
        </div>

        <form onSubmit={handleSaveTrueMoney} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-300">
              เบอร์โทรศัพท์ TrueMoney (10 หลัก) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Input
                type="text"
                maxLength={10}
                placeholder="เช่น 0812345678"
                value={form.tmPhone}
                onChange={(e) =>
                  updateForm({
                    tmPhone: e.target.value,
                    tmPhoneError: null,
                  })
                }
                disabled={form.isTmSaving}
                className={`pl-9 ${form.tmPhoneError ? "border-red-500/50 focus:border-red-500" : ""}`}
              />
              <Phone
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />
            </div>
            {form.tmPhoneError && (
              <span className="mt-1.5 block text-xs text-red-400 font-medium">
                {form.tmPhoneError}
              </span>
            )}
            <span className="mt-1.5 block text-[11px] leading-relaxed text-neutral-500">
              * ระบบจะทำการแลกเงินจากซองของขวัญที่ลูกค้าส่งมาเข้าสู่เบอร์นี้โดยอัตโนมัติ
            </span>
          </div>

          <div className="pt-2">
            <ButtonUI
              type="submit"
              disabled={form.isTmSaving}
              isLoading={form.isTmSaving}
              className="flex w-full sm:w-auto min-w-[140px] items-center justify-center rounded-sm bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
            >
              บันทึก TrueMoney
            </ButtonUI>
          </div>
        </form>
      </FadeIn>

      {/* Column 2: Bank Transfer */}
      <FadeIn
        direction="up"
        delay={80}
        className="rounded-md border border-neutral-800 bg-neutral-950 p-5 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-blue-400">
              <Landmark size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                โอนผ่านธนาคาร (Bank)
              </h2>
              <p className="text-xs text-neutral-400">
                บัญชีธนาคารสำหรับรับโอนเงิน
              </p>
            </div>
          </div>

          <Toggle
            checked={form.bankEnabled}
            onCheckedChange={(bankEnabled) =>
              updateForm({
                bankEnabled,
                ...(bankEnabled
                  ? {}
                  : { bankNameError: null, bankAccountNumberError: null }),
              })
            }
            activeText="เปิดใช้งาน"
            inactiveText="ปิดใช้งาน"
            aria-label="เปิด/ปิด บัญชีธนาคาร"
          />
        </div>

        <form onSubmit={handleSaveBank} className="space-y-4">
          {/* Bank Selection */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-300">
              ชื่อธนาคาร / บริการ {form.bankEnabled && <span className="text-red-400">*</span>}
            </label>
            <div className="relative">
              <Input
                type="text"
                list="bank-presets"
                placeholder="เลือกหรือพิมพ์ชื่อธนาคาร..."
                value={form.bankName}
                onChange={(e) =>
                  updateForm({
                    bankName: e.target.value,
                    bankNameError: null,
                  })
                }
                disabled={form.isBankSaving}
                className={`pl-9 ${form.bankNameError ? "border-red-500/50 focus:border-red-500" : ""}`}
              />
              <Landmark
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />
              <datalist id="bank-presets">
                {POPULAR_BANKS.map((bank) => (
                  <option key={bank} value={bank} />
                ))}
              </datalist>
            </div>
            {form.bankNameError && (
              <span className="mt-1.5 block text-xs text-red-400 font-medium">
                {form.bankNameError}
              </span>
            )}
          </div>

          {/* Account Name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-300">
              ชื่อบัญชี
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="เช่น บจก. เฮิร์ทซ์ แมนเนเจอร์ หรือ นายสมชาย ใจดี"
                value={form.bankAccountName}
                onChange={(e) =>
                  updateForm({ bankAccountName: e.target.value })
                }
                disabled={form.isBankSaving}
                className="pl-9"
              />
              <User
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-300">
              เลขที่บัญชี {form.bankEnabled && <span className="text-red-400">*</span>}
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="เช่น 123-4-56789-0 หรือ เบอร์พร้อมเพย์"
                value={form.bankAccountNumber}
                onChange={(e) =>
                  updateForm({
                    bankAccountNumber: e.target.value,
                    bankAccountNumberError: null,
                  })
                }
                disabled={form.isBankSaving}
                className={`pl-9 ${form.bankAccountNumberError ? "border-red-500/50 focus:border-red-500" : ""}`}
              />
              <CreditCard
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />
            </div>
            {form.bankAccountNumberError && (
              <span className="mt-1.5 block text-xs text-red-400 font-medium">
                {form.bankAccountNumberError}
              </span>
            )}
            <span className="mt-1.5 block text-[11px] leading-relaxed text-neutral-500">
              * ข้อมูลบัญชีธนาคารนี้จะแสดงให้ลูกค้าเห็นในหน้าเติมเงินผ่านช่องทางโอนเงิน
            </span>
          </div>

          <div className="pt-2">
            <ButtonUI
              type="submit"
              disabled={form.isBankSaving}
              isLoading={form.isBankSaving}
              className="flex w-full sm:w-auto min-w-[150px] items-center justify-center rounded-sm bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
            >
              บันทึกข้อมูลธนาคาร
            </ButtonUI>
          </div>
        </form>
      </FadeIn>
    </div>
  );
};

export default TopupSettingContainer;
