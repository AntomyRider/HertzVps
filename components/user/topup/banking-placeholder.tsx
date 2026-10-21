"use client";

import { Landmark, Clock, ArrowRight } from "lucide-react";

interface BankingPlaceholderProps {
  onSwitchToTrueMoney: () => void;
}

const BankingPlaceholder = ({ onSwitchToTrueMoney }: BankingPlaceholderProps) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-neutral-800 bg-neutral-950/60 py-10 px-5 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400">
        <Landmark size={24} />
      </div>

      <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-0.5 text-xs font-medium text-blue-400">
        <Clock size={12} />
        <span>กำลังพัฒนา (Coming Soon)</span>
      </div>

      <h3 className="mt-3 text-sm sm:text-base font-semibold text-white">
        ระบบโอนเงินผ่านธนาคาร &amp; พร้อมเพย์
      </h3>

      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-neutral-400">
        ช่องทางการชำระเงินผ่านบัญชีธนาคารและสแกน QR Code พร้อมเพย์ กำลังอยู่ระหว่างการเชื่อมต่อระบบ
        ในระหว่างนี้คุณสามารถเติมเงินได้อย่างรวดเร็วผ่าน{" "}
        <strong className="text-white">TrueMoney (ซองของขวัญ)</strong> ได้ทันที
      </p>

      <button
        type="button"
        onClick={onSwitchToTrueMoney}
        className="mt-5 flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition hover:border-neutral-700 hover:bg-neutral-800 cursor-pointer"
      >
        <span>ไปที่เติมเงิน TrueMoney</span>
        <ArrowRight size={13} />
      </button>
    </div>
  );
};

export default BankingPlaceholder;
