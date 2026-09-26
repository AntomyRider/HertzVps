"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import Input from "@/components/ui/input";
import ButtonUI from "@/components/ui/button";
import { usePaymentStore } from "@/store/paymentStore";
import { toast } from "@/components/ui/toast";

interface PaymentSettingFormState {
  phone: string;
  enabled: boolean;
  phoneError: string | null;
  isSaving: boolean;
}

const INITIAL_PAYMENT_SETTING_FORM: PaymentSettingFormState = {
  phone: "",
  enabled: true,
  phoneError: null,
  isSaving: false,
};

const PaymentSettingsForm = () => {
  const {
    paymentSetting,
    isLoadingSetting,
    fetchPaymentSetting,
    savePaymentSetting,
  } = usePaymentStore();

  const [form, setForm] = useState<PaymentSettingFormState>(
    INITIAL_PAYMENT_SETTING_FORM
  );

  const updateForm = (patch: Partial<PaymentSettingFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  useEffect(() => {
    fetchPaymentSetting();
  }, [fetchPaymentSetting]);

  useEffect(() => {
    if (paymentSetting) {
      updateForm({
        phone: paymentSetting.truemoneyPhone || "",
        enabled: paymentSetting.truemoneyEnabled,
        phoneError: null,
      });
    }
  }, [paymentSetting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = form.phone.replace(/[^0-9]/g, "");
    if (!cleanPhone) {
      updateForm({ phoneError: "กรุณาระบุเบอร์โทรศัพท์ TrueMoney" });
      return;
    }
    if (cleanPhone.length !== 10) {
      updateForm({
        phoneError:
          "เบอร์โทรศัพท์ TrueMoney ต้องเป็นตัวเลข 10 หลัก (เช่น 0812345678)",
      });
      return;
    }

    try {
      updateForm({ isSaving: true, phoneError: null });
      const res = await savePaymentSetting({
        truemoneyPhone: cleanPhone,
        truemoneyEnabled: form.enabled,
      });

      if (!res.success) {
        updateForm({ phoneError: res.error || "ไม่สามารถบันทึกการตั้งค่าได้" });
        return;
      }

      toast.success(
        "บันทึกสำเร็จ",
        "บันทึกการตั้งค่าเบอร์โทรศัพท์ TrueMoney เรียบร้อยแล้ว"
      );
    } finally {
      updateForm({ isSaving: false });
    }
  };

  if (isLoadingSetting && !paymentSetting) {
    return (
      <div className="space-y-4 py-8">
        <div className="h-6 w-48 animate-pulse rounded-sm bg-neutral-900" />
        <div className="h-10 w-full animate-pulse rounded-sm bg-neutral-900" />
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
        <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900/40 p-3.5">
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
            checked={form.enabled}
            onChange={(e) => updateForm({ enabled: e.target.checked })}
            className="h-4 w-4 rounded-sm accent-blue-600 cursor-pointer"
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
              value={form.phone}
              onChange={(e) =>
                updateForm({
                  phone: e.target.value,
                  phoneError: null,
                })
              }
              disabled={form.isSaving}
              className={`text-sm pl-9 ${form.phoneError ? "border-red-500/50 focus:border-red-500" : ""}`}
            />
            <Phone
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
          </div>
          {form.phoneError && (
            <span className="mt-1.5 block text-xs text-red-400 font-medium">
              {form.phoneError}
            </span>
          )}
          <span className="mt-1.5 block text-[11px] text-neutral-500">
            * ระบบจะทำการแลกเงินจากซองของขวัญที่ลูกค้าส่งมาเข้าสู่เบอร์นี้โดยอัตโนมัติ
          </span>
        </div>

        <div className="pt-2">
          <ButtonUI
            type="submit"
            disabled={form.isSaving}
            isLoading={form.isSaving}
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
