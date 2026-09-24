"use client";

import { useOrderStore } from "@/store/orderStore";
import SearchUI from "@/components/ui/search";
import { ShoppingBag, TrendingUp } from "lucide-react";

export const ToolsOrder = () => {
  const { search, setSearch, fetchOrders, summary } = useOrderStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    fetchOrders(val);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <SearchUI
        value={search}
        onChange={handleSearchChange}
        placeholder="ค้นหาชื่อผู้ซื้อ, Discord ID หรือชื่อสินค้า..."
        className="w-full sm:max-w-md rounded-sm"
      />

      {/* Summary Badges */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
        {/* Total Orders Badge */}
        <div className="flex items-center gap-1.5 rounded-sm border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-xs text-neutral-400">
          <ShoppingBag size={14} className="text-neutral-500 shrink-0" />
          <span className="truncate">คำสั่งซื้อ:</span>
          <span className="font-semibold text-white shrink-0">
            {summary.totalOrders} รายการ
          </span>
        </div>

        {/* Total Revenue Badge */}
        <div className="flex items-center gap-1.5 rounded-sm border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-xs text-neutral-400">
          <TrendingUp size={14} className="text-emerald-400 shrink-0" />
          <span className="truncate">ยอดขายรวม:</span>
          <span className="font-semibold text-emerald-400 shrink-0">
            ฿{summary.totalRevenue.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ToolsOrder;
