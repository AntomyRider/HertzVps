"use client";

import { useState } from "react";
import Image from "next/image";
import { Gift } from "lucide-react";
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
      setVoucherError("รหัสซองอั่งเปาต้องมีความยาว 35 ตัวอักษร (กรุณาตรวจสอบลิงก์ซองของขวัญอีกครั้ง)");
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
        })} ถูกเพิ่มเข้ากระเป๋าของคุณเรียบร้อยแล้ว`
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
            ลิงก์ซองของขวัญ TrueMoney (Gift Voucher)
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
                className="flex w-full sm:w-auto min-w-[140px] items-center justify-center gap-2 rounded-sm bg-[#5865F2] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#4752C4] shadow-sm cursor-pointer"
              >
                <DiscordIcon />
                <span>เข้าสู่ระบบด้วย Discord</span>
              </a>
            ) : (
              <ButtonUI
                type="submit"
                disabled={isSubmitting || !voucherUrl.trim()}
                isLoading={isSubmitting}
                className="flex w-full sm:w-auto min-w-[130px] items-center justify-center gap-2 rounded-sm bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
              >
                <Gift size={15} />
                <span>แลกรับเงินทันที</span>
              </ButtonUI>
            )}
          </div>
          {voucherError && (
            <span className="mt-1.5 block text-xs text-red-400 font-medium">
              {voucherError}
            </span>
          )}
          <span className="mt-1.5 block text-[11px] text-neutral-500">
            * คัดลอกลิงก์ซองของขวัญจากแอป TrueMoney มาวางที่นี่ ระบบจะเติมเงินอัตโนมัติทันที
          </span>
        </div>
      </form>

      {/* Guide Steps */}
      <div className="rounded-md border border-neutral-800/80 bg-neutral-900/30 p-4">
        <h4 className="flex items-center gap-2 text-xs font-semibold text-white">
          <Image
            src="/truemoney.png"
            alt="TrueMoney"
            width={16}
            height={16}
            className="object-contain"
          />
          <span>วิธีสร้างซองของขวัญ TrueMoney เพื่อเติมเงิน</span>
        </h4>
        <ol className="mt-3 space-y-2 text-xs text-neutral-400">
          <li className="flex items-start gap-2">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-neutral-800 text-[10px] font-bold text-neutral-300">
              1
            </span>
            <span>
              เปิดแอป <strong className="text-white">TrueMoney</strong> ไปที่เมนู{" "}
              <strong className="text-white">&quot;โอนเงิน&quot;</strong> แล้วเลือก{" "}
              <strong className="text-white">&quot;ส่งซองของขวัญ&quot;</strong>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-neutral-800 text-[10px] font-bold text-neutral-300">
              2
            </span>
            <span>
              ใส่จำนวนเงินที่ต้องการเติม, เลือกประเภทการสุ่มเป็น{" "}
              <strong className="text-white">&quot;แบ่งจำนวนเงินเท่ากัน&quot;</strong>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-neutral-800 text-[10px] font-bold text-neutral-300">
              3
            </span>
            <span>
              กำหนดจำนวนคนที่รับซองเป็น{" "}
              <strong className="text-white">1 คน</strong> เท่านั้น
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-neutral-800 text-[10px] font-bold text-neutral-300">
              4
            </span>
            <span>
              กดยืนยันสร้างซอง แล้วกด{" "}
              <strong className="text-white">&quot;คัดลอกลิงก์&quot;</strong>{" "}
              นำมาวางในช่องด้านบนแล้วกดแลกรับเงิน
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default TrueMoneyForm;
