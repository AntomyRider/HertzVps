"use client";

import { useState } from "react";
import Image from "next/image";
import { BadgeDollarSign } from "lucide-react";
import Input from "@/components/ui/input";
import ButtonUI from "@/components/ui/button";
import { usePaymentStore } from "@/store/paymentStore";
import { useAuthStore } from "@/store/authStore";
import { DiscordIcon } from "@/components/user/utils/avatar";
import { toast } from "@/components/ui/toast";

const TrueMoneyForm = () => {
  const { redeemTrueMoney, isSubmitting } = usePaymentStore();
  const { user } = useAuthStore();
  const [voucherUrl, setVoucherUrl] = useState("");
  const [voucherError, setVoucherError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setVoucherError("กรุณาเข้าสู่ระบบด้วย Discord ก่อนทำรายการเติมเงิน");
      return;
    }

    const trimmed = voucherUrl.trim();
    if (!trimmed) {
      setVoucherError("กรุณากรอกหรือวางลิงก์ซองของขวัญ TrueMoney");
      return;
    }

    const urlMatch = trimmed.match(/[?&]v=([a-zA-Z0-9]+)/);
    const code = urlMatch ? urlMatch[1] : trimmed;
    if (code.length !== 35 || !/^[a-zA-Z0-9]+$/.test(code)) {
      setVoucherError(
        "รหัสซองอั่งเปาต้องมีความยาว 35 ตัวอักษร (กรุณาตรวจสอบลิงก์ซองของขวัญอีกครั้ง)",
      );
      return;
    }

    setVoucherError(null);
    const res = await redeemTrueMoney(trimmed);
    if (!res.success) {
      setVoucherError(res.error || "ไม่สามารถแลกรับซองของขวัญได้");
    } else {
      toast.success(
        "เติมเงินสำเร็จ!",
        `ยอดเงิน +฿${(res.amount || 0).toLocaleString("th-TH", {
          minimumFractionDigits: 2,
        })} ถูกเพิ่มเข้ากระเป๋าของคุณเรียบร้อยแล้ว`,
      );
      setVoucherUrl("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form Box */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-medium text-neutral-300">
            ลิงก์ซองของขวัญ TrueMoney
          </label>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="https://gift.truemoney.com/campaign/?v=..."
                value={voucherUrl}
                onChange={(e) => {
                  setVoucherUrl(e.target.value);
                  if (voucherError) setVoucherError(null);
                }}
                disabled={isSubmitting}
                className={`text-xs sm:text-sm ${voucherError ? "border-red-500/50 focus:border-red-500" : ""}`}
                autoFocus
              />
            </div>
            {!user ? (
              <a
                href="/api/v1/auth/discord"
                className="flex w-full sm:w-auto  items-center justify-center gap-2 rounded-sm bg-[#5865F2] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#4752C4] shadow-sm cursor-pointer"
              >
                <DiscordIcon />
                <span>เข้าสู่ระบบ</span>
              </a>
            ) : (
              <ButtonUI
                type="submit"
                disabled={isSubmitting || !voucherUrl.trim()}
                isLoading={isSubmitting}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white transition cursor-pointer"
              >
                <BadgeDollarSign className="size-4" />
                <span>เติมเงิน</span>
              </ButtonUI>
            )}
          </div>
          {voucherError && (
            <span className="mt-1.5 block text-xs text-red-400 font-medium">
              {voucherError}
            </span>
          )}
          <span className="mt-1.5 block text-2xs text-neutral-500">
            * คัดลอกลิงก์ซองของขวัญจากแอป TrueMoney มาวางที่นี่
            ระบบจะเติมเงินอัตโนมัติทันที
          </span>
        </div>
      </form>

      {/* Guide Steps */}

      <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-4">
        <h4 className="flex items-center gap-2 text-xs text-white">
          <span>วิธีสร้างซองของขวัญเพื่อเติมเงิน</span>
        </h4>

        <ol className="mt-4 space-y-3 text-xs leading-relaxed text-neutral-400">
          <li className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-neutral-800 text-xs text-neutral-300">
              1
            </span>
            <span>
              เปิดแอป "TrueMoney" ไปที่เมนู "โอนเงิน" แล้วเลือก "ส่งซองของขวัญ"
            </span>
          </li>

          <li className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-neutral-800 text-xs text-neutral-300">
              2
            </span>
            <span>
              ใส่จำนวนเงินที่ต้องการเติม แล้วเลือกประเภทการแบ่งเงินเป็น
              "แบ่งจำนวนเงินเท่ากัน"
            </span>
          </li>

          <li className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-neutral-800 text-xs text-neutral-300">
              3
            </span>
            <span>กำหนดจำนวนผู้รับซองเป็น "1 คน"</span>
          </li>

          <li className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-neutral-800 text-xs text-neutral-300">
              4
            </span>
            <span>
              ยืนยันการสร้างซอง จากนั้นกด "คัดลอกลิงก์"
              แล้วนำลิงก์มาวางในช่องด้านบนเพื่อแลกรับเงิน
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default TrueMoneyForm;
