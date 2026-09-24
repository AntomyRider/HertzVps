"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import Input from "@/components/ui/input";
import ButtonUI from "@/components/ui/button";
import { usePaymentStore } from "@/store/paymentStore";
import { toast } from "@/components/ui/toast";

const PaymentSettingsForm = () => {
  const {
    paymentSetting,
    isLoadingSetting,
    fetchPaymentSetting,
    savePaymentSetting,
  } = usePaymentStore();

  const [phone, setPhone] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPaymentSetting();
  }, [fetchPaymentSetting]);

  useEffect(() => {
    if (paymentSetting) {
      setPhone(paymentSetting.truemoneyPhone || "");
      setEnabled(paymentSetting.truemoneyEnabled);
      setPhoneError(null);
    }
  }, [paymentSetting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (!cleanPhone) {
      setPhoneError("กรุณาระบุเบอร์โทรศัพท์ TrueMoney");
      return;
    }
    if (cleanPhone.length !== 10) {
      setPhoneError("เบอร์โทรศัพท์ TrueMoney ต้องเป็นตัวเลข 10 หลัก (เช่น 0812345678)");
      return;
    }

    try {
      setIsSaving(true);
      setPhoneError(null);
      const res = await savePaymentSetting({
        truemoneyPhone: cleanPhone,
        truemoneyEnabled: enabled,
      });

      if (!res.success) {
        setPhoneError(res.error || "ไม่สามารถบันทึกการตั้งค่าได้");
        return;
      }

      toast.success("บันทึกสำเร็จ", "บันทึกการตั้งค่าเบอร์โทรศัพท์ TrueMoney เรียบร้อยแล้ว");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingSetting && !paymentSetting) {
    return (
      <div className="space-y-4 py-8">
        <div className="h-6 w-48 animate-pulse rounded bg-neutral-900" />
        <div className="h-10 w-full animate-pulse rounded bg-neutral-900" />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h3 className="text-base font-semibold text-white">
          ตั้งค่าการรับเงิน TrueMoney
        </h3>
        <p className="mt-1 text-xs text-neutral-400">
          กำหนดเบอร์โทรศัพท์ TrueMoney สำหรับรับเงินจากซองของขวัญที่ลูกค้าส่งมาโดยอัตโนมัติ
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Enable / Disable Toggle */}
        <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/40 p-3.5">
          <div>
            <label className="text-xs font-semibold text-white">
              เปิดใช้งานการเติมเงิน TrueMoney
            </label>
            <p className="text-[11px] text-neutral-400">
              เมื่อเปิดใช้งาน ผู้ใช้จะสามารถวางลิงก์ซองของขวัญเพื่อเติมเงินได้
            </p>
          </div>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
          />
        </div>

        {/* TrueMoney Phone Number Input */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-300">
            เบอร์โทรศัพท์ TrueMoney ของร้านค้า (10 หลัก) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Input
              type="text"
              maxLength={10}
              placeholder="0812345678"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) setPhoneError(null);
              }}
              disabled={isSaving}
              className={`text-sm pl-9 ${phoneError ? "border-red-500/50 focus:border-red-500" : ""}`}
            />
            <Phone
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
          </div>
          {phoneError && (
            <span className="mt-1.5 block text-xs text-red-400 font-medium">
              {phoneError}
            </span>
          )}
          <span className="mt-1.5 block text-[11px] text-neutral-500">
            * ระบบจะทำการแลกเงินจากซองของขวัญที่ลูกค้าส่งมาเข้าสู่เบอร์นี้โดยอัตโนมัติ
          </span>
        </div>

        <div className="pt-2">
          <ButtonUI
            type="submit"
            disabled={isSaving}
            isLoading={isSaving}
            className="flex w-full sm:w-auto min-w-[140px] items-center justify-center rounded-sm bg-blue-600 px-5 py-2 text-xs font-medium text-white transition hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
          >
            บันทึกการตั้งค่า
          </ButtonUI>
        </div>
      </form>
    </div>
  );
};

export default PaymentSettingsForm;
