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

export const TopupSettingContainer = () => {
  const {
    paymentSetting,
    isLoadingSetting,
    fetchPaymentSetting,
    savePaymentSetting,
  } = usePaymentStore();

  // TrueMoney form state
  const [tmPhone, setTmPhone] = useState("");
  const [tmEnabled, setTmEnabled] = useState(true);
  const [tmPhoneError, setTmPhoneError] = useState<string | null>(null);
  const [isTmSaving, setIsTmSaving] = useState(false);

  // Bank form state
  const [bankName, setBankName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankEnabled, setBankEnabled] = useState(false);
  const [bankNameError, setBankNameError] = useState<string | null>(null);
  const [bankAccountNumberError, setBankAccountNumberError] = useState<string | null>(null);
  const [isBankSaving, setIsBankSaving] = useState(false);

  useEffect(() => {
    fetchPaymentSetting();
  }, [fetchPaymentSetting]);

  useEffect(() => {
    if (paymentSetting) {
      setTmPhone(paymentSetting.truemoneyPhone || "");
      setTmEnabled(paymentSetting.truemoneyEnabled ?? true);
      setBankName(paymentSetting.bankName || "");
      setBankAccountName(paymentSetting.bankAccountName || "");
      setBankAccountNumber(paymentSetting.bankAccountNumber || "");
      setBankEnabled(paymentSetting.bankEnabled ?? false);
      setTmPhoneError(null);
      setBankNameError(null);
      setBankAccountNumberError(null);
    }
  }, [paymentSetting]);

  // Handle Save TrueMoney
  const handleSaveTrueMoney = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = tmPhone.replace(/[^0-9]/g, "");
    if (!cleanPhone) {
      setTmPhoneError("กรุณาระบุเบอร์โทรศัพท์ TrueMoney");
      return;
    }
    if (cleanPhone.length !== 10) {
      setTmPhoneError("เบอร์โทรศัพท์ TrueMoney ต้องเป็นตัวเลข 10 หลัก (เช่น 0812345678)");
      return;
    }

    try {
      setIsTmSaving(true);
      setTmPhoneError(null);
      const res = await savePaymentSetting({
        truemoneyPhone: cleanPhone,
        truemoneyEnabled: tmEnabled,
      });

      if (!res.success) {
        setTmPhoneError(res.error || "ไม่สามารถบันทึกการตั้งค่า TrueMoney ได้");
        return;
      }

      toast.success("บันทึกสำเร็จ", "บันทึกการตั้งค่า TrueMoney เรียบร้อยแล้ว");
    } finally {
      setIsTmSaving(false);
    }
  };

  // Handle Save Bank
  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    if (bankEnabled) {
      if (!bankName.trim()) {
        setBankNameError("กรุณาระบุชื่อธนาคาร");
        hasError = true;
      }
      if (!bankAccountNumber.trim()) {
        setBankAccountNumberError("กรุณาระบุเลขที่บัญชี");
        hasError = true;
      }
    }

    if (hasError) return;

    try {
      setIsBankSaving(true);
      setBankNameError(null);
      setBankAccountNumberError(null);

      const res = await savePaymentSetting({
        bankEnabled,
        bankName: bankName.trim(),
        bankAccountName: bankAccountName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
      });

      if (!res.success) {
        setBankNameError(res.error || "ไม่สามารถบันทึกการตั้งค่าธนาคารได้");
        return;
      }

      toast.success("บันทึกสำเร็จ", "บันทึกการตั้งค่าบัญชีธนาคารเรียบร้อยแล้ว");
    } finally {
      setIsBankSaving(false);
    }
  };

  if (isLoadingSetting && !paymentSetting) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 py-4">
        <div className="h-64 animate-pulse rounded-xl border border-neutral-800 bg-neutral-900/50" />
        <div className="h-64 animate-pulse rounded-xl border border-neutral-800 bg-neutral-900/50" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Column 1: TrueMoney Wallet */}
      <div className="rounded-md border border-neutral-800 bg-neutral-950 p-5 space-y-5">
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
            checked={tmEnabled}
            onCheckedChange={setTmEnabled}
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
                value={tmPhone}
                onChange={(e) => {
                  setTmPhone(e.target.value);
                  if (tmPhoneError) setTmPhoneError(null);
                }}
                disabled={isTmSaving}
                className={`pl-9 ${tmPhoneError ? "border-red-500/50 focus:border-red-500" : ""}`}
              />
              <Phone
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />
            </div>
            {tmPhoneError && (
              <span className="mt-1.5 block text-xs text-red-400 font-medium">
                {tmPhoneError}
              </span>
            )}
            <span className="mt-1.5 block text-[11px] leading-relaxed text-neutral-500">
              * ระบบจะทำการแลกเงินจากซองของขวัญที่ลูกค้าส่งมาเข้าสู่เบอร์นี้โดยอัตโนมัติ
            </span>
          </div>

          <div className="pt-2">
            <ButtonUI
              type="submit"
              disabled={isTmSaving}
              isLoading={isTmSaving}
              className="flex w-full sm:w-auto min-w-[140px] items-center justify-center rounded-sm bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
            >
              บันทึก TrueMoney
            </ButtonUI>
          </div>
        </form>
      </div>

      {/* Column 2: Bank Transfer */}
      <div className="rounded-md border border-neutral-800 bg-neutral-950 p-5 space-y-5">
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
            checked={bankEnabled}
            onCheckedChange={(checked) => {
              setBankEnabled(checked);
              if (!checked) {
                setBankNameError(null);
                setBankAccountNumberError(null);
              }
            }}
            activeText="เปิดใช้งาน"
            inactiveText="ปิดใช้งาน"
            aria-label="เปิด/ปิด บัญชีธนาคาร"
          />
        </div>

        <form onSubmit={handleSaveBank} className="space-y-4">
          {/* Bank Selection */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-300">
              ชื่อธนาคาร / บริการ {bankEnabled && <span className="text-red-400">*</span>}
            </label>
            <div className="relative">
              <Input
                type="text"
                list="bank-presets"
                placeholder="เลือกหรือพิมพ์ชื่อธนาคาร..."
                value={bankName}
                onChange={(e) => {
                  setBankName(e.target.value);
                  if (bankNameError) setBankNameError(null);
                }}
                disabled={isBankSaving}
                className={`pl-9 ${bankNameError ? "border-red-500/50 focus:border-red-500" : ""}`}
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
            {bankNameError && (
              <span className="mt-1.5 block text-xs text-red-400 font-medium">
                {bankNameError}
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
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                disabled={isBankSaving}
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
              เลขที่บัญชี {bankEnabled && <span className="text-red-400">*</span>}
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="เช่น 123-4-56789-0 หรือ เบอร์พร้อมเพย์"
                value={bankAccountNumber}
                onChange={(e) => {
                  setBankAccountNumber(e.target.value);
                  if (bankAccountNumberError) setBankAccountNumberError(null);
                }}
                disabled={isBankSaving}
                className={`pl-9 ${bankAccountNumberError ? "border-red-500/50 focus:border-red-500" : ""}`}
              />
              <CreditCard
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />
            </div>
            {bankAccountNumberError && (
              <span className="mt-1.5 block text-xs text-red-400 font-medium">
                {bankAccountNumberError}
              </span>
            )}
            <span className="mt-1.5 block text-[11px] leading-relaxed text-neutral-500">
              * ข้อมูลบัญชีธนาคารนี้จะแสดงให้ลูกค้าเห็นในหน้าเติมเงินผ่านช่องทางโอนเงิน
            </span>
          </div>

          <div className="pt-2">
            <ButtonUI
              type="submit"
              disabled={isBankSaving}
              isLoading={isBankSaving}
              className="flex w-full sm:w-auto min-w-[150px] items-center justify-center rounded-sm bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
            >
              บันทึกข้อมูลธนาคาร
            </ButtonUI>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TopupSettingContainer;
