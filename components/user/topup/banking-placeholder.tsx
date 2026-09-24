"use client";

import { Landmark, Clock, ArrowRight } from "lucide-react";

interface BankingPlaceholderProps {
  onSwitchToTrueMoney: () => void;
}

const BankingPlaceholder = ({ onSwitchToTrueMoney }: BankingPlaceholderProps) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-neutral-800/80 bg-neutral-900/20 py-12 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-400">
        <Landmark size={28} />
      </div>

      <div className="mt-4 inline-flex items-center gap-1.5 rounded-sm border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
        <Clock size={12} />
        <span>กำลังพัฒนา (Coming Soon)</span>
      </div>

      <h3 className="mt-3 text-base font-semibold text-white">
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
        className="mt-6 flex items-center gap-2 rounded-sm border border-neutral-800 bg-neutral-900/80 px-4 py-2 text-xs font-medium text-white transition hover:border-blue-500/40 hover:bg-neutral-900 hover:text-blue-400 cursor-pointer"
      >
        <span>ไปที่เติมเงิน TrueMoney</span>
        <ArrowRight size={13} />
      </button>
    </div>
  );
};

export default BankingPlaceholder;
